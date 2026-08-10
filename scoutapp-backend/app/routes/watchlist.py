from datetime import datetime
from flask import Blueprint, request, jsonify
from app.extensions import mongo
from app.models.watchlist import serialize_watchlist_entry, parse_object_id, ALLOWED_STATUSES
from app.models.player import serialize_player
from app.utils.auth import token_required

watchlist_bp = Blueprint("watchlist", __name__, url_prefix="/api/watchlist")


@watchlist_bp.route("", methods=["GET"])
@token_required
def get_watchlist():
    """Vraca watchlist ulogovanog skauta, sa pridruzenim podacima o igracu."""
    entries = list(
        mongo.db.watchlist.find({"scoutId": request.user_id}).sort("addedAt", -1)
    )

    result = []
    for entry in entries:
        player = mongo.db.players.find_one({"_id": entry["playerId"]})
        serialized = serialize_watchlist_entry(entry)
        serialized["player"] = serialize_player(player) if player else None
        result.append(serialized)

    return jsonify(result), 200


@watchlist_bp.route("", methods=["POST"])
@token_required
def add_to_watchlist():
    data = request.get_json(silent=True) or {}
    player_id = data.get("playerId")

    obj_id = parse_object_id(player_id)
    if obj_id is None:
        return jsonify({"error": "Neispravan ID igraca."}), 400

    player = mongo.db.players.find_one({"_id": obj_id})
    if not player:
        return jsonify({"error": "Igrac nije pronadjen."}), 404

    # sprecavamo duplikate - isti scout ne moze dva puta dodati istog igraca
    existing = mongo.db.watchlist.find_one({
        "scoutId": request.user_id, "playerId": obj_id
    })
    if existing:
        return jsonify({"error": "Igrac je vec na tvom watchlist-u."}), 409

    status = data.get("status", "monitoring")
    if status not in ALLOWED_STATUSES:
        return jsonify({"error": f"Status mora biti jedan od: {', '.join(ALLOWED_STATUSES)}."}), 400

    new_entry = {
        "scoutId": request.user_id,
        "playerId": obj_id,
        "status": status,
        "addedAt": datetime.utcnow(),
    }

    result = mongo.db.watchlist.insert_one(new_entry)
    new_entry["_id"] = result.inserted_id

    serialized = serialize_watchlist_entry(new_entry)
    serialized["player"] = serialize_player(player)

    return jsonify(serialized), 201


@watchlist_bp.route("/<entry_id>", methods=["PUT"])
@token_required
def update_watchlist_entry(entry_id):
    obj_id = parse_object_id(entry_id)
    if obj_id is None:
        return jsonify({"error": "Neispravan ID unosa."}), 400

    data = request.get_json(silent=True) or {}
    status = data.get("status")

    if status not in ALLOWED_STATUSES:
        return jsonify({"error": f"Status mora biti jedan od: {', '.join(ALLOWED_STATUSES)}."}), 400

    # scout moze da menja samo SVOJE unose
    result = mongo.db.watchlist.update_one(
        {"_id": obj_id, "scoutId": request.user_id},
        {"$set": {"status": status}},
    )

    if result.matched_count == 0:
        return jsonify({"error": "Unos nije pronadjen."}), 404

    updated = mongo.db.watchlist.find_one({"_id": obj_id})
    return jsonify(serialize_watchlist_entry(updated)), 200


@watchlist_bp.route("/<entry_id>", methods=["DELETE"])
@token_required
def remove_from_watchlist(entry_id):
    obj_id = parse_object_id(entry_id)
    if obj_id is None:
        return jsonify({"error": "Neispravan ID unosa."}), 400

    # scout moze da brise samo SVOJE unose
    result = mongo.db.watchlist.delete_one(
        {"_id": obj_id, "scoutId": request.user_id}
    )

    if result.deleted_count == 0:
        return jsonify({"error": "Unos nije pronadjen."}), 404

    return jsonify({"message": "Uklonjeno sa watchlist-a."}), 200

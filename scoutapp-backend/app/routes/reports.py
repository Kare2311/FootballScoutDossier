from datetime import datetime
from flask import Blueprint, request, jsonify
from app.extensions import mongo
from app.models.scouting_report import (
    serialize_report,
    validate_report_payload,
    parse_object_id,
)
from app.models.player import serialize_player
from app.utils.auth import token_required

reports_bp = Blueprint("reports", __name__, url_prefix="/api")


@reports_bp.route("/reports/mine", methods=["GET"])
@token_required
def get_my_reports():
    """Vraca sve izvestaje koje je napisao TRENUTNO ulogovani scout, sa podacima o igracu."""
    reports = list(
        mongo.db.scoutingReports.find({"scoutId": request.user_id}).sort("date", -1)
    )

    result = []
    for r in reports:
        player = mongo.db.players.find_one({"_id": r["playerId"]})
        serialized = serialize_report(r)
        serialized["player"] = serialize_player(player) if player else None
        result.append(serialized)

    return jsonify(result), 200


@reports_bp.route("/players/<player_id>/reports", methods=["GET"])
def get_reports_for_player(player_id):
    """Vraca sve scouting izvestaje za odredjenog igraca, sortirane hronoloski (najstariji prvi) - to je 'timeline' praceenja."""
    obj_id = parse_object_id(player_id)
    if obj_id is None:
        return jsonify({"error": "Neispravan ID igraca."}), 400

    # proveravamo da igrac postoji
    player = mongo.db.players.find_one({"_id": obj_id})
    if not player:
        return jsonify({"error": "Igrac nije pronadjen."}), 404

    reports = list(
        mongo.db.scoutingReports.find({"playerId": obj_id}).sort("date", 1)
    )
    reports = [serialize_report(r) for r in reports]

    return jsonify(reports), 200


@reports_bp.route("/players/<player_id>/reports", methods=["POST"])
@token_required
def create_report(player_id):
    """Kreira novi scouting izvestaj za igraca."""
    obj_id = parse_object_id(player_id)
    if obj_id is None:
        return jsonify({"error": "Neispravan ID igraca."}), 400

    player = mongo.db.players.find_one({"_id": obj_id})
    if not player:
        return jsonify({"error": "Igrac nije pronadjen."}), 404

    data = request.get_json(silent=True) or {}

    is_valid, error_msg = validate_report_payload(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    new_report = {
        "playerId": obj_id,
        "scoutId": request.user_id,
        "date": datetime.utcnow(),
        "overallRating": data["overallRating"],
        "pros": data.get("pros", []),
        "cons": data.get("cons", []),
        "notes": data.get("notes", ""),
        "context": data.get("context", ""),
        "positionsPlayed": data.get("positionsPlayed", []),
    }

    result = mongo.db.scoutingReports.insert_one(new_report)
    new_report["_id"] = result.inserted_id

    return jsonify(serialize_report(new_report)), 201


@reports_bp.route("/reports/<report_id>", methods=["PUT"])
@token_required
def update_report(report_id):
    obj_id = parse_object_id(report_id)
    if obj_id is None:
        return jsonify({"error": "Neispravan ID izvestaja."}), 400

    data = request.get_json(silent=True) or {}

    is_valid, error_msg = validate_report_payload(data, partial=True)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    update_fields = {k: v for k, v in data.items() if k in [
        "overallRating", "pros", "cons", "notes", "context", "positionsPlayed"
    ]}

    if not update_fields:
        return jsonify({"error": "Nema polja za azuriranje."}), 400

    result = mongo.db.scoutingReports.update_one(
        {"_id": obj_id}, {"$set": update_fields}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Izvestaj nije pronadjen."}), 404

    updated_report = mongo.db.scoutingReports.find_one({"_id": obj_id})
    return jsonify(serialize_report(updated_report)), 200


@reports_bp.route("/reports/<report_id>", methods=["DELETE"])
@token_required
def delete_report(report_id):
    obj_id = parse_object_id(report_id)
    if obj_id is None:
        return jsonify({"error": "Neispravan ID izvestaja."}), 400

    result = mongo.db.scoutingReports.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        return jsonify({"error": "Izvestaj nije pronadjen."}), 404

    return jsonify({"message": "Izvestaj je obrisan."}), 200

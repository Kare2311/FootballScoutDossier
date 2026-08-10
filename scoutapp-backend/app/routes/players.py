from datetime import datetime
from flask import Blueprint, request, jsonify
from app.extensions import mongo
from app.models.player import (
    serialize_player,
    validate_player_payload,
    parse_object_id,
)
from app.services.football_api import search_players
from app.utils.auth import token_required

players_bp = Blueprint("players", __name__, url_prefix="/api/players")


@players_bp.route("/search-external", methods=["GET"])
def search_external_players():
    """
    Pretraga svetske baze igraca (TheSportsDB) po imenu.
    Vraca listu kandidata koje korisnik moze da uveze u lokalnu bazu.
    """
    query = request.args.get("q", "").strip()

    if len(query) < 2:
        return jsonify({"error": "Unesi bar 2 karaktera za pretragu."}), 400

    results = search_players(query)
    return jsonify(results), 200


@players_bp.route("", methods=["GET"])
def get_players():
    """
    Vraca listu igraca, sa opcionim filterima:
    /api/players?search=messi&position=FWD&nationality=Argentina
    """
    query = {}

    search = request.args.get("search")
    if search:
        # case-insensitive pretraga po imenu
        query["fullName"] = {"$regex": search, "$options": "i"}

    position = request.args.get("position")
    if position:
        query["position"] = position

    nationality = request.args.get("nationality")
    if nationality:
        query["nationality"] = nationality

    players = list(mongo.db.players.find(query))
    players = [serialize_player(p) for p in players]

    return jsonify(players), 200


@players_bp.route("/<player_id>", methods=["GET"])
def get_player(player_id):
    obj_id = parse_object_id(player_id)
    if obj_id is None:
        return jsonify({"error": "Neispravan ID igraca."}), 400

    player = mongo.db.players.find_one({"_id": obj_id})
    if not player:
        return jsonify({"error": "Igrac nije pronadjen."}), 404

    return jsonify(serialize_player(player)), 200


@players_bp.route("", methods=["POST"])
@token_required
def create_player():
    data = request.get_json(silent=True) or {}

    is_valid, error_msg = validate_player_payload(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    # ako je igrac uvezen iz eksterne baze i vec postoji, ne pravimo duplikat
    external_id = data.get("externalApiId")
    if external_id:
        existing = mongo.db.players.find_one({"externalApiId": external_id})
        if existing:
            return jsonify(serialize_player(existing)), 200

    new_player = {
        "fullName": data["fullName"],
        "position": data["position"],
        "dateOfBirth": data.get("dateOfBirth"),
        "nationality": data.get("nationality"),
        "currentClub": data.get("currentClub"),
        "photoUrl": data.get("photoUrl"),
        "externalApiId": data.get("externalApiId"),
        "addedBy": request.user_id,
        "createdAt": datetime.utcnow(),
    }

    result = mongo.db.players.insert_one(new_player)
    new_player["_id"] = result.inserted_id

    return jsonify(serialize_player(new_player)), 201


@players_bp.route("/<player_id>", methods=["PUT"])
@token_required
def update_player(player_id):
    obj_id = parse_object_id(player_id)
    if obj_id is None:
        return jsonify({"error": "Neispravan ID igraca."}), 400

    data = request.get_json(silent=True) or {}

    is_valid, error_msg = validate_player_payload(data, partial=True)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    # samo polja koja su zaista poslata se azuriraju
    update_fields = {k: v for k, v in data.items() if k in [
        "fullName", "position", "dateOfBirth", "nationality",
        "currentClub", "photoUrl", "externalApiId"
    ]}

    if not update_fields:
        return jsonify({"error": "Nema polja za azuriranje."}), 400

    result = mongo.db.players.update_one(
        {"_id": obj_id}, {"$set": update_fields}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Igrac nije pronadjen."}), 404

    updated_player = mongo.db.players.find_one({"_id": obj_id})
    return jsonify(serialize_player(updated_player)), 200


@players_bp.route("/<player_id>", methods=["DELETE"])
@token_required
def delete_player(player_id):
    obj_id = parse_object_id(player_id)
    if obj_id is None:
        return jsonify({"error": "Neispravan ID igraca."}), 400

    result = mongo.db.players.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        return jsonify({"error": "Igrac nije pronadjen."}), 404

    return jsonify({"message": "Igrac je obrisan."}), 200

from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import mongo
from app.models.user import serialize_user, validate_register_payload
from app.utils.auth import generate_token, token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    is_valid, error_msg = validate_register_payload(data)
    if not is_valid:
        return jsonify({"error": error_msg}), 400

    # provera da email/username vec ne postoje
    existing = mongo.db.users.find_one({
        "$or": [{"email": data["email"]}, {"username": data["username"]}]
    })
    if existing:
        return jsonify({"error": "Korisnik sa tim emailom ili korisnickim imenom vec postoji."}), 409

    new_user = {
        "username": data["username"],
        "email": data["email"],
        # pbkdf2:sha256 je podrazumevana metoda werkzeug-a - jak i standardan izbor
        "passwordHash": generate_password_hash(data["password"]),
        "role": "scout",  # svi novi korisnici pocinju kao scout; admin se dodeljuje rucno
        "createdAt": datetime.now(timezone.utc),
    }

    result = mongo.db.users.insert_one(new_user)
    new_user["_id"] = result.inserted_id

    token = generate_token(new_user["_id"], new_user["role"])

    return jsonify({
        "user": serialize_user(new_user),
        "token": token,
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email i lozinka su obavezni."}), 400

    user = mongo.db.users.find_one({"email": email})

    if not user or not check_password_hash(user["passwordHash"], password):
        return jsonify({"error": "Pogresan email ili lozinka."}), 401

    token = generate_token(user["_id"], user["role"])

    return jsonify({
        "user": serialize_user(user),
        "token": token,
    }), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user():
    from bson import ObjectId

    user = mongo.db.users.find_one({"_id": ObjectId(request.user_id)})
    if not user:
        return jsonify({"error": "Korisnik nije pronadjen."}), 404

    return jsonify(serialize_user(user)), 200

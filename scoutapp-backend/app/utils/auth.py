from functools import wraps
from datetime import datetime, timedelta, timezone

import jwt
from flask import request, jsonify, current_app


def generate_token(user_id, role):
    """Generise JWT token koji vazi 7 dana."""
    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")


def decode_token(token):
    """Vraca payload ako je token validan, ili baca jwt.PyJWTError."""
    return jwt.decode(
        token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"]
    )


def token_required(f):
    """
    Decorator koji zahteva validan Bearer token u Authorization headeru.
    Popunjava request.user_id i request.user_role ako je token validan.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Nedostaje autorizacioni token."}), 401

        token = auth_header.split(" ", 1)[1]

        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token je istekao, uloguj se ponovo."}), 401
        except jwt.PyJWTError:
            return jsonify({"error": "Neispravan token."}), 401

        request.user_id = payload["sub"]
        request.user_role = payload["role"]

        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    """Decorator koji zahteva da ulogovani korisnik ima role='admin'. Koristiti NAKON @token_required."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if getattr(request, "user_role", None) != "admin":
            return jsonify({"error": "Potrebne su admin ovlascenja."}), 403
        return f(*args, **kwargs)

    return decorated

from flask import Blueprint, jsonify
from app.extensions import mongo

health_bp = Blueprint("health", __name__)


@health_bp.route("/api/health", methods=["GET"])
def health_check():
    try:
        # ping bazu da proverimo konekciju
        mongo.db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return jsonify({
        "status": "ok",
        "database": db_status
    })

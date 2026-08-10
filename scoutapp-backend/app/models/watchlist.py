from bson import ObjectId
from bson.errors import InvalidId

ALLOWED_STATUSES = ["monitoring", "recommended", "rejected"]


def serialize_watchlist_entry(doc):
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    doc["playerId"] = str(doc["playerId"])
    return doc


def parse_object_id(id_str):
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        return None

from bson import ObjectId
from bson.errors import InvalidId


ALLOWED_PITCH_POSITIONS = [
    "GK",
    "LB", "CBL", "CBR", "RB",
    "LWB", "RWB",
    "LDM", "RDM",
    "LM", "CML", "CMR", "RM",
    "LAM", "RAM",
    "LW", "RW",
    "STL", "STR",
]


def serialize_report(doc):
    """Pretvara MongoDB dokument u JSON-friendly dict."""
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    doc["playerId"] = str(doc["playerId"])
    return doc


def validate_report_payload(data, partial=False):
    """
    Proverava payload za scouting report.
    partial=True se koristi kod PUT-a (izmena), gde ne moraju sva polja biti prisutna.
    """
    required_fields = ["overallRating"]

    if not partial:
        for field in required_fields:
            if field not in data:
                return False, f"Polje '{field}' je obavezno."

    if "overallRating" in data:
        rating = data["overallRating"]
        if not isinstance(rating, (int, float)) or not (1 <= rating <= 10):
            return False, "overallRating mora biti broj izmedju 1 i 10."

    if "pros" in data and not isinstance(data["pros"], list):
        return False, "pros mora biti lista stringova."

    if "cons" in data and not isinstance(data["cons"], list):
        return False, "cons mora biti lista stringova."

    if "positionsPlayed" in data:
        positions = data["positionsPlayed"]
        if not isinstance(positions, list):
            return False, "positionsPlayed mora biti lista."
        invalid = [p for p in positions if p not in ALLOWED_PITCH_POSITIONS]
        if invalid:
            return False, f"Nepoznate pozicije: {', '.join(invalid)}."

    return True, None


def parse_object_id(id_str):
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        return None

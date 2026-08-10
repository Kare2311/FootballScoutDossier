from bson import ObjectId
from bson.errors import InvalidId


ALLOWED_POSITIONS = ["GK", "DEF", "MID", "FWD"]


def serialize_player(doc):
    """Pretvara MongoDB dokument u JSON-friendly dict (ObjectId -> string)."""
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


def validate_player_payload(data, partial=False):
    """
    Proverava da li payload za kreiranje/izmenu igrača ima ispravna polja.
    Vraća (True, None) ako je OK, ili (False, "poruka greske") ako nije.

    partial=True znaci da ne moraju sva polja biti prisutna (koristi se kod PUT-a).
    """
    required_fields = ["fullName", "position"]

    if not partial:
        for field in required_fields:
            if field not in data or not data[field]:
                return False, f"Polje '{field}' je obavezno."

    if "position" in data and data["position"] not in ALLOWED_POSITIONS:
        return False, f"Pozicija mora biti jedna od: {', '.join(ALLOWED_POSITIONS)}."

    return True, None


def parse_object_id(id_str):
    """Pokusava da konvertuje string u ObjectId, vraca None ako nije validan."""
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        return None

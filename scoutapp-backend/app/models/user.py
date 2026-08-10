import re

ALLOWED_ROLES = ["scout", "admin"]
EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def serialize_user(doc):
    """Pretvara MongoDB dokument u JSON-friendly dict, BEZ passwordHash-a."""
    if not doc:
        return None
    return {
        "_id": str(doc["_id"]),
        "username": doc["username"],
        "email": doc["email"],
        "role": doc["role"],
        "createdAt": doc.get("createdAt"),
    }


def validate_register_payload(data):
    required_fields = ["username", "email", "password"]
    for field in required_fields:
        if not data.get(field):
            return False, f"Polje '{field}' je obavezno."

    if not EMAIL_REGEX.match(data["email"]):
        return False, "Email adresa nije validna."

    if len(data["password"]) < 6:
        return False, "Lozinka mora imati bar 6 karaktera."

    if len(data["username"]) < 3:
        return False, "Korisnicko ime mora imati bar 3 karaktera."

    return True, None

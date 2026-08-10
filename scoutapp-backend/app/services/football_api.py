import requests
from flask import current_app

BASE_URL = "https://www.thesportsdb.com/api/v1/json"


def _map_position(raw_position):
    """Mapira slobodan tekst pozicije (npr. 'Attacking Midfielder') na nase kodove GK/DEF/MID/FWD."""
    if not raw_position:
        return "MID"

    text = raw_position.lower()

    if "keeper" in text:
        return "GK"
    if "back" in text or "defender" in text or "centre-back" in text:
        return "DEF"
    if "forward" in text or "striker" in text or "winger" in text:
        return "FWD"
    if "midfield" in text:
        return "MID"

    return "MID"


def search_players(query):
    """
    Trazi igrace po imenu u TheSportsDB bazi.
    Vraca listu dict-ova spremnih da se direktno posalju kao payload za POST /players.
    """
    api_key = current_app.config["FOOTBALL_API_KEY"]
    url = f"{BASE_URL}/{api_key}/searchplayers.php"

    try:
        response = requests.get(url, params={"p": query}, timeout=8)
        response.raise_for_status()
        data = response.json()
    except (requests.RequestException, ValueError):
        return []

    raw_players = data.get("player") or []

    # ogranicavamo na fudbalere (API vraca i druge sportove ako ime nije precizno)
    football_players = [
        p for p in raw_players if (p.get("strSport") or "").lower() == "soccer"
    ]

    results = []
    for p in football_players[:20]:  # ogranicimo broj rezultata radi preglednosti
        results.append({
            "externalApiId": p.get("idPlayer"),
            "fullName": p.get("strPlayer"),
            "position": _map_position(p.get("strPosition")),
            "currentClub": p.get("strTeam"),
            "nationality": p.get("strNationality"),
            "dateOfBirth": p.get("dateBorn"),
            "photoUrl": p.get("strThumb") or p.get("strCutout"),
        })

    return results

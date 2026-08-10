import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/scoutapp")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
    # "3" je javni testni kljuc od TheSportsDB, radi odmah bez registracije.
    # Za pouzdaniji/brzi rad, besplatan licni kljuc se dobija na patreon.com/thesportsdb
    FOOTBALL_API_KEY = os.getenv("FOOTBALL_API_KEY", "3")
    # URL frontenda (npr. https://scoutapp.vercel.app) - koristi se za CORS.
    # Ako nije podesen, dozvoljavamo sve origin-e (OK za lokalni razvoj, ne za produkciju).
    FRONTEND_URL = os.getenv("FRONTEND_URL", "*")

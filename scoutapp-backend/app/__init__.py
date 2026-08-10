from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import mongo


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # CORS - dozvoljava React frontendu (na Vercelu ili localhostu) da zove ovaj API
    frontend_url = app.config["FRONTEND_URL"]
    if frontend_url == "*":
        CORS(app)
    else:
        # podrzava vise domena odvojenih zarezom (npr. produkcija + preview deploy-evi)
        origins = [o.strip() for o in frontend_url.split(",")]
        CORS(app, origins=origins, supports_credentials=True)

    # Inicijalizacija MongoDB konekcije
    mongo.init_app(app)

    # Registrovanje blueprint-ova (ruta)
    from app.routes.health import health_bp
    from app.routes.players import players_bp
    from app.routes.reports import reports_bp
    from app.routes.auth import auth_bp
    from app.routes.watchlist import watchlist_bp
    app.register_blueprint(health_bp)
    app.register_blueprint(players_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(watchlist_bp)

    return app

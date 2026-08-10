import { Link } from "react-router-dom";

const POSITION_LABELS = {
  GK: "Golman",
  DEF: "Odbrana",
  MID: "Vezni red",
  FWD: "Napad",
};

export default function PlayerCard({ player, reportCount = 0, latestRating = null }) {
  return (
    <Link to={`/players/${player._id}`} className="player-card">
      <div className="player-card__badge">{player.position}</div>

      <div className="player-card__body">
        <h3 className="player-card__name">{player.fullName}</h3>
        <p className="player-card__meta">
          {POSITION_LABELS[player.position] || player.position}
          {player.currentClub ? ` · ${player.currentClub}` : ""}
          {player.nationality ? ` · ${player.nationality}` : ""}
        </p>
      </div>

      <div className="player-card__stat">
        <span className="player-card__stat-value">
          {latestRating != null ? latestRating.toFixed(1) : "—"}
        </span>
        <span className="player-card__stat-label">
          {reportCount} {reportCount === 1 ? "izveštaj" : "izveštaja"}
        </span>
      </div>
    </Link>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const STATUS_LABELS = {
  monitoring: "Pratim",
  recommended: "Preporučujem",
  rejected: "Odbačen",
};

export default function Watchlist() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function loadWatchlist() {
    setLoading(true);
    api
      .getWatchlist()
      .then(setEntries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadWatchlist();
  }, []);

  async function handleStatusChange(entryId, status) {
    try {
      await api.updateWatchlistStatus(entryId, status);
      setEntries((prev) =>
        prev.map((e) => (e._id === entryId ? { ...e, status } : e))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(entryId) {
    try {
      await api.removeFromWatchlist(entryId);
      setEntries((prev) => prev.filter((e) => e._id !== entryId));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Praćeni igrači</p>
          <h1 className="page__title">Watchlist</h1>
        </div>
      </header>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Učitavanje...</p>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <p>Watchlist je prazan. Otvori profil igrača i dodaj ga na praćenje.</p>
        </div>
      ) : (
        <div className="player-grid">
          {entries.map((entry) => (
            <div key={entry._id} className="watchlist-row">
              <Link to={`/players/${entry.playerId}`} className="player-card watchlist-row__card">
                <div className="player-card__badge">{entry.player?.position}</div>
                <div className="player-card__body">
                  <h3 className="player-card__name">{entry.player?.fullName}</h3>
                  <p className="player-card__meta">{entry.player?.currentClub}</p>
                </div>
              </Link>

              <select
                className="watchlist-row__status"
                value={entry.status}
                onChange={(e) => handleStatusChange(entry._id, e.target.value)}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <button
                className="btn btn--outline btn--sm"
                onClick={() => handleRemove(entry._id)}
              >
                Ukloni
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";
import ReportCard from "../components/ReportCard";
import PitchSelector from "../components/PitchSelector";
import { useAuth } from "../context/AuthContext";

const EMPTY_REPORT = {
  overallRating: 6,
  pros: "",
  cons: "",
  notes: "",
  context: "",
  positionsPlayed: [],
};

const POSITION_LABELS = {
  GK: "Golman",
  DEF: "Odbrana",
  MID: "Vezni red",
  FWD: "Napad",
};

export default function PlayerDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [player, setPlayer] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_REPORT);
  const [saving, setSaving] = useState(false);
  const [watchlistEntry, setWatchlistEntry] = useState(null);
  const [watchlistBusy, setWatchlistBusy] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [playerData, reportsData] = await Promise.all([
        api.getPlayer(id),
        api.getReports(id),
      ]);
      setPlayer(playerData);
      // najnoviji izveštaj prvi u timeline prikazu
      setReports([...reportsData].reverse());

      if (user) {
        const watchlist = await api.getWatchlist();
        const entry = watchlist.find((w) => w.playerId === id);
        setWatchlistEntry(entry || null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAddReport(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createReport(id, {
        overallRating: Number(form.overallRating),
        pros: form.pros.split(",").map((s) => s.trim()).filter(Boolean),
        cons: form.cons.split(",").map((s) => s.trim()).filter(Boolean),
        notes: form.notes,
        context: form.context,
        positionsPlayed: form.positionsPlayed,
      });
      setForm(EMPTY_REPORT);
      setShowForm(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleWatchlist() {
    setWatchlistBusy(true);
    try {
      if (watchlistEntry) {
        await api.removeFromWatchlist(watchlistEntry._id);
        setWatchlistEntry(null);
      } else {
        const entry = await api.addToWatchlist(id);
        setWatchlistEntry(entry);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setWatchlistBusy(false);
    }
  }

  function togglePosition(code) {
    setForm((prev) => {
      const has = prev.positionsPlayed.includes(code);
      return {
        ...prev,
        positionsPlayed: has
          ? prev.positionsPlayed.filter((c) => c !== code)
          : [...prev.positionsPlayed, code],
      };
    });
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Učitavanje...</p>
      </div>
    );
  }

  if (error && !player) {
    return (
      <div className="page">
        <Link to="/" className="back-link">← Nazad na listu</Link>
        <p className="error-text">{error}</p>
      </div>
    );
  }

  const latestRating = reports.length > 0 ? reports[0].overallRating : null;

  return (
    <div className="page">
      <Link to="/" className="back-link">← Nazad na listu</Link>

      <header className="detail-header">
        <div className="detail-header__badge">{player.position}</div>
        <div className="detail-header__body">
          <h1 className="detail-header__name">{player.fullName}</h1>
          <p className="detail-header__meta">
            {POSITION_LABELS[player.position] || player.position}
            {player.currentClub ? ` · ${player.currentClub}` : ""}
            {player.nationality ? ` · ${player.nationality}` : ""}
          </p>
        </div>
        <div className="detail-header__rating">
          <span className="player-card__stat-value">
            {latestRating != null ? latestRating.toFixed(1) : "—"}
          </span>
          <span className="player-card__stat-label">poslednja ocena</span>
        </div>
      </header>

      {user && (
        <button
          className={`btn ${watchlistEntry ? "btn--outline" : "btn--gold"} watchlist-btn`}
          onClick={handleToggleWatchlist}
          disabled={watchlistBusy}
        >
          {watchlistEntry ? "★ Na watchlist-u — ukloni" : "☆ Dodaj na watchlist"}
        </button>
      )}

      <div className="detail-toolbar">
        <h2 className="section-title">Timeline praćenja</h2>
        {user && (
          <button className="btn btn--gold" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Zatvori" : "+ Novi izveštaj"}
          </button>
        )}
      </div>

      {showForm && (
        <form className="add-form" onSubmit={handleAddReport}>
          <div className="add-form__row">
            <label>
              Ocena (1-10)
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                required
                value={form.overallRating}
                onChange={(e) => setForm({ ...form, overallRating: e.target.value })}
              />
            </label>
            <label>
              Kontekst
              <input
                placeholder="npr. Liga, kolo 12"
                value={form.context}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
              />
            </label>
          </div>
          <div className="add-form__row">
            <label>
              Pros (odvoji zarezom)
              <input
                placeholder="tehnika, vizija igre"
                value={form.pros}
                onChange={(e) => setForm({ ...form, pros: e.target.value })}
              />
            </label>
            <label>
              Cons (odvoji zarezom)
              <input
                placeholder="fizička snaga"
                value={form.cons}
                onChange={(e) => setForm({ ...form, cons: e.target.value })}
              />
            </label>
          </div>
          <div>
            <p className="add-form__label-standalone">Pozicija/e na kojoj je igrao</p>
            <div className="pitch-field-wrap">
              <PitchSelector selected={form.positionsPlayed} onToggle={togglePosition} />
              <p className="pitch-field-wrap__hint">
                Klikni jednu ili više pozicija na kojima si ga posmatrao
              </p>
            </div>
          </div>
          <label>
            Beleške
            <textarea
              rows="3"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
          <button type="submit" className="btn btn--gold" disabled={saving}>
            {saving ? "Čuvanje..." : "Sačuvaj izveštaj"}
          </button>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}

      {reports.length === 0 ? (
        <div className="empty-state">
          <p>Još nema izveštaja. Dodaj prvi da bi počeo praćenje ovog igrača.</p>
        </div>
      ) : (
        <div className="report-timeline">
          {reports.map((report) => (
            <ReportCard key={report._id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { api } from "../api";
import PlayerCard from "../components/PlayerCard";
import ExternalPlayerSearch from "../components/ExternalPlayerSearch";
import { useAuth } from "../context/AuthContext";

const EMPTY_FORM = {
  fullName: "",
  position: "MID",
  nationality: "",
  currentClub: "",
};

export default function PlayersList() {
  const { user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [addMode, setAddMode] = useState("search"); // "search" | "manual"
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function loadPlayers(searchTerm = "") {
    setLoading(true);
    setError(null);
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const data = await api.getPlayers(params);
      setPlayers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlayers();
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadPlayers(search);
  }

  async function handleCreatePlayer(e) {
    e.preventDefault();
    if (!form.fullName.trim()) return;

    setSaving(true);
    try {
      await api.createPlayer(form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      loadPlayers(search);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleImported() {
    setShowForm(false);
    loadPlayers(search);
  }

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Baza igrača</p>
          <h1 className="page__title">Scout Dossier</h1>
        </div>
        {user && (
          <button className="btn btn--gold" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Zatvori" : "+ Dodaj igrača"}
          </button>
        )}
      </header>

      <form className="search-bar" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Pretraži po imenu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn--outline">
          Pretraži
        </button>
      </form>

      {showForm && (
        <div className="add-form-wrap">
          <div className="auth-toggle">
            <button
              type="button"
              className={`auth-toggle__btn ${addMode === "search" ? "auth-toggle__btn--active" : ""}`}
              onClick={() => setAddMode("search")}
            >
              Pretraga baze
            </button>
            <button
              type="button"
              className={`auth-toggle__btn ${addMode === "manual" ? "auth-toggle__btn--active" : ""}`}
              onClick={() => setAddMode("manual")}
            >
              Ručni unos
            </button>
          </div>

          {addMode === "search" ? (
            <ExternalPlayerSearch onImported={handleImported} />
          ) : (
            <form className="add-form" onSubmit={handleCreatePlayer}>
              <div className="add-form__row">
                <label>
                  Ime i prezime
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </label>
                <label>
                  Pozicija
                  <select
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                  >
                    <option value="GK">Golman</option>
                    <option value="DEF">Odbrana</option>
                    <option value="MID">Vezni red</option>
                    <option value="FWD">Napad</option>
                  </select>
                </label>
              </div>
              <div className="add-form__row">
                <label>
                  Klub
                  <input
                    value={form.currentClub}
                    onChange={(e) => setForm({ ...form, currentClub: e.target.value })}
                  />
                </label>
                <label>
                  Nacionalnost
                  <input
                    value={form.nationality}
                    onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                  />
                </label>
              </div>
              <button type="submit" className="btn btn--gold" disabled={saving}>
                {saving ? "Čuvanje..." : "Sačuvaj igrača"}
              </button>
            </form>
          )}
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Učitavanje...</p>
      ) : players.length === 0 ? (
        <div className="empty-state">
          <p>Nema igrača u bazi. Dodaj prvog da bi počeo praćenje.</p>
        </div>
      ) : (
        <div className="player-grid">
          {players.map((player) => (
            <PlayerCard key={player._id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}

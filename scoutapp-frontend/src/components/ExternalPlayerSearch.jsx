import { useState } from "react";
import { api } from "../api";

const POSITION_LABELS = {
  GK: "Golman",
  DEF: "Odbrana",
  MID: "Vezni red",
  FWD: "Napad",
};

export default function ExternalPlayerSearch({ onImported }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (query.trim().length < 2) return;

    setSearching(true);
    setError(null);
    try {
      const data = await api.searchExternalPlayers(query);
      setResults(data);
      setSearched(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleImport(candidate) {
    setImportingId(candidate.externalApiId);
    setError(null);
    try {
      const created = await api.createPlayer(candidate);
      onImported(created);
      setResults((prev) => prev.filter((r) => r.externalApiId !== candidate.externalApiId));
    } catch (err) {
      setError(err.message);
    } finally {
      setImportingId(null);
    }
  }

  return (
    <div className="external-search">
      <form className="external-search__bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Pretraži svetsku bazu igrača (npr. Messi, Vlahović...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn--outline" disabled={searching}>
          {searching ? "Tražim..." : "Pretraži"}
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      {searched && !searching && results.length === 0 && !error && (
        <p className="muted external-search__empty">
          Nema rezultata. Igrača možeš uneti ručno ispod.
        </p>
      )}

      {results.length > 0 && (
        <div className="external-search__results">
          {results.map((candidate) => (
            <div key={candidate.externalApiId} className="external-result">
              {candidate.photoUrl && (
                <img
                  src={candidate.photoUrl}
                  alt=""
                  className="external-result__photo"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <div className="external-result__body">
                <p className="external-result__name">{candidate.fullName}</p>
                <p className="external-result__meta">
                  {POSITION_LABELS[candidate.position] || candidate.position}
                  {candidate.currentClub ? ` · ${candidate.currentClub}` : ""}
                  {candidate.nationality ? ` · ${candidate.nationality}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="btn btn--gold btn--sm"
                onClick={() => handleImport(candidate)}
                disabled={importingId === candidate.externalApiId}
              >
                {importingId === candidate.externalApiId ? "..." : "Uvezi"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

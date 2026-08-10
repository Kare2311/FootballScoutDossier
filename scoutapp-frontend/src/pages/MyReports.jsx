import { useEffect, useState } from "react";
import { api } from "../api";
import ReportCard from "../components/ReportCard";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getMyReports()
      .then(setReports)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <p className="page__eyebrow">Tvoj rad</p>
          <h1 className="page__title">Moji izveštaji</h1>
        </div>
      </header>

      {error && <p className="error-text">{error}</p>}

      {loading ? (
        <p className="muted">Učitavanje...</p>
      ) : reports.length === 0 ? (
        <div className="empty-state">
          <p>Još nisi napisao nijedan izveštaj. Pronađi igrača i dodaj prvi.</p>
        </div>
      ) : (
        <div className="report-timeline">
          {reports.map((report) => (
            <ReportCard key={report._id} report={report} player={report.player} />
          ))}
        </div>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";
import PitchSelector from "./PitchSelector";
import { PITCH_POSITIONS } from "../pitchPositions";

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("sr-RS", { day: "2-digit", month: "short", year: "numeric" });
}

function positionLabel(code) {
  return PITCH_POSITIONS.find((p) => p.code === code)?.label || code;
}

export default function ReportCard({ report, player = null }) {
  const positions = report.positionsPlayed || [];

  return (
    <article className="report-card">
      {player && (
        <Link to={`/players/${player._id}`} className="report-card__player-link">
          {player.fullName}
        </Link>
      )}

      <div className="report-card__header">
        <span className="report-card__date">{formatDate(report.date)}</span>
        <span className="report-card__rating">{report.overallRating.toFixed(1)}</span>
      </div>

      {report.context && <p className="report-card__context">{report.context}</p>}

      {positions.length > 0 && (
        <div className="report-card__positions">
          <PitchSelector selected={positions} readOnly compact />
          <div className="report-card__position-tags">
            {positions.map((code) => (
              <span key={code} className="position-tag">
                {positionLabel(code)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="report-card__cols">
        {report.pros?.length > 0 && (
          <div>
            <p className="report-card__col-label report-card__col-label--pro">Pros</p>
            <ul className="report-card__list">
              {report.pros.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {report.cons?.length > 0 && (
          <div>
            <p className="report-card__col-label report-card__col-label--con">Cons</p>
            <ul className="report-card__list">
              {report.cons.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {report.notes && <p className="report-card__notes">{report.notes}</p>}
    </article>
  );
}

import { PITCH_POSITIONS } from "../pitchPositions";

export default function PitchSelector({ selected = [], onToggle, readOnly = false, compact = false }) {
  function handleClick(code) {
    if (readOnly || !onToggle) return;
    onToggle(code);
  }

  return (
    <svg
      viewBox="0 0 300 460"
      className={`pitch ${compact ? "pitch--compact" : ""}`}
      role="img"
      aria-label="Pozicije na terenu"
    >
      {/* teren */}
      <rect x="10" y="10" width="280" height="440" className="pitch__field" />

      {/* sredina terena */}
      <line x1="10" y1="230" x2="290" y2="230" className="pitch__line" />
      <circle cx="150" cy="230" r="40" className="pitch__line" fill="none" />
      <circle cx="150" cy="230" r="2" className="pitch__spot" />

      {/* gornji (napadački) kazneni prostor */}
      <rect x="70" y="10" width="160" height="90" className="pitch__line" fill="none" />
      <rect x="115" y="10" width="70" height="35" className="pitch__line" fill="none" />
      <circle cx="150" cy="70" r="2" className="pitch__spot" />

      {/* donji (odbrambeni) kazneni prostor */}
      <rect x="70" y="360" width="160" height="90" className="pitch__line" fill="none" />
      <rect x="115" y="415" width="70" height="35" className="pitch__line" fill="none" />
      <circle cx="150" cy="390" r="2" className="pitch__spot" />

      {/* pozicije */}
      {PITCH_POSITIONS.map((pos) => {
        const isSelected = selected.includes(pos.code);
        return (
          <g
            key={pos.code}
            onClick={() => handleClick(pos.code)}
            className={`pitch__marker ${isSelected ? "pitch__marker--active" : ""} ${
              readOnly ? "pitch__marker--readonly" : ""
            }`}
          >
            <title>{pos.label}</title>
            <circle cx={pos.x} cy={pos.y} r={compact ? 12 : 16} />
            {!compact && (
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" className="pitch__marker-label">
                {pos.code}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

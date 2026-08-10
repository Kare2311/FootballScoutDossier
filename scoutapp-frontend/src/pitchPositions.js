// Koordinate pozicija na terenu, viewBox 0 0 300 460 (napad je gore, odbrana dole)
export const PITCH_POSITIONS = [
  { code: "GK", label: "Golman", x: 150, y: 430 },

  { code: "LB", label: "Levi bek", x: 55, y: 360 },
  { code: "CBL", label: "Štoper (levi)", x: 110, y: 378 },
  { code: "CBR", label: "Štoper (desni)", x: 190, y: 378 },
  { code: "RB", label: "Desni bek", x: 245, y: 360 },

  { code: "LWB", label: "Levi bek-krilo", x: 40, y: 300 },
  { code: "RWB", label: "Desni bek-krilo", x: 260, y: 300 },

  { code: "LDM", label: "Levi defanzivni vezni", x: 110, y: 322 },
  { code: "RDM", label: "Desni defanzivni vezni", x: 190, y: 322 },

  { code: "LM", label: "Levi vezni", x: 48, y: 250 },
  { code: "CML", label: "Vezni (levi)", x: 115, y: 258 },
  { code: "CMR", label: "Vezni (desni)", x: 185, y: 258 },
  { code: "RM", label: "Desni vezni", x: 252, y: 250 },

  { code: "LAM", label: "Levi ofanzivni vezni", x: 100, y: 175 },
  { code: "RAM", label: "Desni ofanzivni vezni", x: 200, y: 175 },

  { code: "LW", label: "Levo krilo", x: 50, y: 140 },
  { code: "RW", label: "Desno krilo", x: 250, y: 140 },

  { code: "STL", label: "Napadač (levi)", x: 115, y: 68 },
  { code: "STR", label: "Napadač (desni)", x: 185, y: 68 },
];

export const PITCH_POSITION_CODES = PITCH_POSITIONS.map((p) => p.code);

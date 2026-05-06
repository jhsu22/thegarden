// Coffee bed — circle indicators, hexagonal flavor wheel, detail component

const COFFEE_ATTRS = [
  { key: 'complexity', label: 'Complexity' },
  { key: 'body',       label: 'Body' },
  { key: 'roastLevel', label: 'Roast Level' },
  { key: 'acidity',    label: 'Acidity' },
];

const COFFEE_FLAVORS = [
  { key: 'sweet',  label: 'Sweet' },
  { key: 'bitter', label: 'Bitter' },
  { key: 'earthy', label: 'Earthy' },
  { key: 'spicy',  label: 'Spicy' },
  { key: 'nutty',  label: 'Nutty' },
  { key: 'floral', label: 'Floral' },
];

// ─── CircleRating ─────────────────────────────────────────────────────────────
// Renders up to `max` circles — filled, half-filled, or empty — for a 0–5 value.
const CircleRating = ({ value, max = 5, color = 'var(--accent-strong)', size = 13 }) => {
  const r = size / 2 - 1.2;
  const vb = size / 2;
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => {
        const filled = value >= i + 1;
        const half   = !filled && value >= i + 0.5;
        return (
          <svg key={i} width={size} height={size}
            viewBox={`${-vb} ${-vb} ${size} ${size}`}
            style={{ overflow: 'visible', flexShrink: 0 }}
          >
            <circle cx={0} cy={0} r={r}
              fill={filled ? color : 'transparent'}
              stroke={filled || half ? color : 'var(--rule)'}
              strokeWidth="1.5"
            />
            {half && (
              <path
                d={`M 0 ${-r} A ${r} ${r} 0 0 0 0 ${r} Z`}
                fill={color}
              />
            )}
          </svg>
        );
      })}
    </div>
  );
};

// ─── HexRadar ─────────────────────────────────────────────────────────────────
// Hexagonal radar / spider chart for the 6 flavor dimensions.
const HexRadar = ({ flavors }) => {
  const cx = 150, cy = 125, R = 68, LR = 90;
  const N = 6, MAX = 5;

  const ang  = (i) => (Math.PI * 2 * i) / N - Math.PI / 2;
  const pt   = (i, val) => [cx + (val / MAX) * R * Math.cos(ang(i)), cy + (val / MAX) * R * Math.sin(ang(i))];
  const poly = (pts) => pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`).join(' ') + ' Z';

  const gridLines = [1, 2, 3, 4, 5].map((v) =>
    poly(Array.from({ length: N }, (_, i) => pt(i, v)))
  );
  const dataShape = poly(COFFEE_FLAVORS.map(({ key }, i) => pt(i, flavors[key] || 0)));

  return (
    <svg viewBox="0 0 300 250" width="100%" style={{ display: 'block', maxWidth: 300 }}>
      {/* Grid rings */}
      {gridLines.map((d, i) => (
        <path key={i} d={d} fill="none"
          stroke="var(--rule)" strokeWidth={i === 4 ? 1.2 : 0.7}
        />
      ))}
      {/* Axis spokes */}
      {Array.from({ length: N }, (_, i) => {
        const [x2, y2] = pt(i, MAX);
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="var(--rule)" strokeWidth={0.7} />;
      })}
      {/* Data fill */}
      <path d={dataShape}
        fill="var(--butter)" fillOpacity={0.4}
        stroke="var(--accent-strong)" strokeWidth={1.8} strokeLinejoin="round"
      />
      {/* Data dots */}
      {COFFEE_FLAVORS.map(({ key }, i) => {
        const [x, y] = pt(i, flavors[key] || 0);
        return (
          <circle key={key} cx={x} cy={y} r={3.5}
            fill="var(--accent-strong)" stroke="var(--paper)" strokeWidth={1.4}
          />
        );
      })}
      {/* Labels */}
      {COFFEE_FLAVORS.map(({ label }, i) => {
        const a = ang(i);
        const [lx, ly] = [cx + LR * Math.cos(a), cy + LR * Math.sin(a)];
        const anchor = Math.abs(Math.cos(a)) < 0.15 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
        const dy = Math.sin(a) < -0.5 ? -4 : Math.sin(a) > 0.5 ? 11 : 4;
        return (
          <text key={label} x={lx} y={ly + dy} textAnchor={anchor}
            fontFamily="var(--font-mono)" fontSize={9.5} fill="var(--ink-soft)"
            letterSpacing={0.8}
          >{label.toUpperCase()}</text>
        );
      })}
    </svg>
  );
};

// ─── CoffeeDetails ────────────────────────────────────────────────────────────
// Shown in the detail modal below the score, for coffee entries only.
const CoffeeDetails = ({ item }) => {
  const hasAttrs   = item.attributes && Object.values(item.attributes).some(Boolean);
  const hasFlavors = item.flavors    && Object.values(item.flavors).some(Boolean);
  if (!hasAttrs && !hasFlavors) return null;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Circle indicators */}
      {hasAttrs && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
            textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 14,
          }}>Profile</div>
          <div style={{
            borderRadius: 12, border: '1px solid var(--rule)', overflow: 'hidden',
          }}>
            {COFFEE_ATTRS.map(({ key, label }, i) => (
              <div key={key} style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 18px',
                borderBottom: i < COFFEE_ATTRS.length - 1 ? '1px solid var(--rule)' : 'none',
                background: i % 2 === 0 ? 'var(--paper)' : 'var(--paper-warm)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--ink)',
                  minWidth: 110,
                }}>{label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CircleRating value={item.attributes[key] || 0} />
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--ink-soft)', minWidth: 24, textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{item.attributes[key] || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hexagonal flavor wheel */}
      {hasFlavors && (
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
            textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 14,
          }}>Flavor Profile</div>
          <div style={{
            borderRadius: 14, border: '1px solid var(--rule)',
            background: 'var(--paper-warm)',
            padding: '18px 12px', display: 'flex', justifyContent: 'center',
          }}>
            <HexRadar flavors={item.flavors} />
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { COFFEE_ATTRS, COFFEE_FLAVORS, CircleRating, HexRadar, CoffeeDetails });

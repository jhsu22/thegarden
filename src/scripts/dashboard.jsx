// Dashboard — one large constellation graphic.
// Every entry is plotted as a dot: x = date, y = score, color = category.
// Hover/tap reveals details. Includes light annotations.

const { useMemo: useMemoD, useState: useStateD } = React;

const ACCENT_COLORS = {
  rose: '#d97a87', butter: '#cc9a55', clay: '#b87155',
  plum: '#a37592', sage: '#6f8758', sky: '#5b87a8',
};
const colorFor = (catId) => {
  const c = CATEGORIES.find((x) => x.id === catId);
  return (c && ACCENT_COLORS[c.accent]) || '#8a7079';
};

const DashboardView = ({ weights, onOpen }) => {
  const feed = useMemoD(() => flatFeed(weights), [weights]);
  const [hover, setHover] = useStateD(null);
  const [filterCat, setFilterCat] = useStateD(null);

  // Bounds
  const dates = feed.map(r => +new Date(r.date + 'T12:00:00'));
  const minD = Math.min(...dates);
  const maxD = Math.max(...dates);
  const span = Math.max(maxD - minD, 1);

  // Layout (viewBox)
  const W = 1000, H = 460;
  const PAD = { l: 56, r: 24, t: 28, b: 56 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  const xFor = (iso) => PAD.l + ((+new Date(iso + 'T12:00:00') - minD) / span) * innerW;
  const yFor = (s) => PAD.t + (1 - (s - 5) / 5) * innerH;  // y range 5–10

  // Stats
  const total = feed.length;
  const avg = +(feed.reduce((s, r) => s + r._score, 0) / total).toFixed(1);
  const top = [...feed].sort((a, b) => b._score - a._score)[0];

  // Average per category for the legend
  const byCat = CATEGORIES.map((c) => {
    const items = ALL_DATA[c.id];
    const scores = items.map((i) => itemScore(c.id, i, weights));
    const a = scores.length ? +(scores.reduce((x, y) => x + y, 0) / scores.length).toFixed(1) : 0;
    return { cat: c, count: items.length, avg: a };
  });

  // Month tick labels — pick months that fall in range
  const monthTicks = [];
  const start = new Date(minD); start.setDate(1);
  const end = new Date(maxD);
  const cur = new Date(start);
  while (cur <= end) {
    monthTicks.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }

  const visible = filterCat ? feed.filter(r => r._cat === filterCat) : feed;
  const visibleAvg = visible.length
    ? +(visible.reduce((s, r) => s + r._score, 0) / visible.length).toFixed(1)
    : 0;

  return (
    <div>
      <header style={{ marginBottom: 28 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.6,
          textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 10,
        }}>Patterns · the long view</div>
        <h1 className="dash-h1" style={{
          fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 500,
          color: 'var(--ink)', margin: 0, letterSpacing: -1.2, lineHeight: 1.05,
        }}>the constellation.</h1>
        <div style={{ marginTop: 8 }}><Squiggle width={80} color="var(--accent-strong)" strokeWidth={2} /></div>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 16, fontStyle: 'italic',
          color: 'var(--ink-soft)', marginTop: 14, maxWidth: 560,
        }}>
          every entry plotted by date and score — your year, scattered.
          {filterCat && <span> · showing {CATEGORIES.find(c => c.id === filterCat)?.label.toLowerCase()} only.</span>}
        </p>
      </header>

      {/* Filter chips */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18,
      }}>
        <FilterChip
          active={filterCat === null}
          onClick={() => setFilterCat(null)}
          color="var(--ink)"
          label="All"
          count={total}
        />
        {byCat.map((b) => (
          <FilterChip
            key={b.cat.id}
            active={filterCat === b.cat.id}
            onClick={() => setFilterCat(filterCat === b.cat.id ? null : b.cat.id)}
            color={colorFor(b.cat.id)}
            label={b.cat.label.split(' ')[0]}
            count={b.count}
          />
        ))}
      </div>

      {/* The big graphic */}
      <Card style={{ padding: 16, position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          {/* Y gridlines + score labels (5..10) */}
          {[5, 6, 7, 8, 9, 10].map((s) => {
            const y = yFor(s);
            const isMain = s === 7 || s === 9;
            return (
              <g key={s}>
                <line
                  x1={PAD.l} x2={W - PAD.r} y1={y} y2={y}
                  stroke="var(--rule)" strokeWidth="1"
                  strokeDasharray={isMain ? '0' : '3 4'}
                  opacity={isMain ? 0.7 : 0.4}
                />
                <text
                  x={PAD.l - 12} y={y + 4} textAnchor="end"
                  fontFamily="var(--font-mono)" fontSize="10"
                  letterSpacing="1" fill="var(--ink-soft)"
                >{s}.0</text>
              </g>
            );
          })}

          {/* Dashed line at average */}
          <line
            x1={PAD.l} x2={W - PAD.r} y1={yFor(visibleAvg)} y2={yFor(visibleAvg)}
            stroke="var(--accent-strong)" strokeWidth="1.4" strokeDasharray="2 5"
            opacity="0.7"
          />
          <text
            x={W - PAD.r} y={yFor(visibleAvg) - 6} textAnchor="end"
            fontFamily="var(--font-mono)" fontSize="10" letterSpacing="1"
            fill="var(--accent-strong)" fontWeight="500"
          >avg {fmtScore(visibleAvg)}</text>

          {/* X month ticks */}
          {monthTicks.map((d, i) => {
            const iso = d.toISOString().slice(0, 10);
            const x = xFor(iso);
            return (
              <g key={i}>
                <line x1={x} x2={x} y1={H - PAD.b} y2={H - PAD.b + 5}
                  stroke="var(--ink-soft)" strokeWidth="1" opacity="0.4" />
                <text
                  x={x} y={H - PAD.b + 22} textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="10"
                  letterSpacing="1.2" fill="var(--ink-soft)"
                  textTransform="uppercase"
                >{d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</text>
              </g>
            );
          })}

          {/* Hand-drawn axis arrow on Y */}
          <g opacity="0.5">
            <path
              d={`M ${PAD.l - 28} ${PAD.t + 6} Q ${PAD.l - 30} ${(PAD.t + H - PAD.b) / 2} ${PAD.l - 28} ${H - PAD.b - 6}`}
              stroke="var(--ink-soft)" strokeWidth="1.2" fill="none" strokeLinecap="round"
            />
            <text x={PAD.l - 36} y={PAD.t + 14} textAnchor="end"
              fontFamily="var(--font-mono)" fontSize="9" letterSpacing="1.4"
              fill="var(--ink-soft)" textTransform="uppercase"
              transform={`rotate(-90, ${PAD.l - 36}, ${(PAD.t + H - PAD.b) / 2})`}
            >SCORE →</text>
          </g>

          {/* Dots */}
          {feed.map((r) => {
            const visible = !filterCat || r._cat === filterCat;
            const cx = xFor(r.date);
            const cy = yFor(r._score);
            const isHover = hover && hover.id === r.id && hover._cat === r._cat;
            const radius = isHover ? 10 : 7;
            return (
              <g key={r._cat + r.id}>
                <circle
                  cx={cx} cy={cy} r={radius + 4}
                  fill={colorFor(r._cat)}
                  opacity={visible ? (isHover ? 0.25 : 0.15) : 0.04}
                />
                <circle
                  cx={cx} cy={cy} r={radius}
                  fill={colorFor(r._cat)}
                  stroke="var(--paper)" strokeWidth="1.6"
                  opacity={visible ? 1 : 0.18}
                  style={{ cursor: 'pointer', transition: 'r 160ms ease' }}
                  onMouseEnter={() => setHover(r)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => onOpen(r._cat, r.id)}
                />
              </g>
            );
          })}

          {/* Hover label */}
          {hover && (() => {
            const cx = xFor(hover.date);
            const cy = yFor(hover._score);
            const labelW = 220;
            const onLeft = cx > W - PAD.r - labelW - 20;
            const lx = onLeft ? cx - labelW - 14 : cx + 14;
            const ly = Math.max(PAD.t + 4, Math.min(H - PAD.b - 70, cy - 30));
            return (
              <g style={{ pointerEvents: 'none' }}>
                <rect
                  x={lx} y={ly} width={labelW} height={64} rx={10}
                  fill="var(--paper)" stroke={colorFor(hover._cat)} strokeWidth="1.4"
                />
                <text x={lx + 14} y={ly + 20}
                  fontFamily="var(--font-mono)" fontSize="9.5" letterSpacing="1.4"
                  fill="var(--ink-soft)" textTransform="uppercase"
                >{CATEGORIES.find(c => c.id === hover._cat)?.label.toUpperCase()} · {fmtDate(hover.date).toUpperCase()}</text>
                <text x={lx + 14} y={ly + 40}
                  fontFamily="var(--font-display)" fontSize="15.5" fontWeight="500"
                  fill="var(--ink)"
                >{hover.name.length > 24 ? hover.name.slice(0, 22) + '…' : hover.name}</text>
                <text x={lx + labelW - 14} y={ly + 52} textAnchor="end"
                  fontFamily="var(--font-display)" fontSize="22" fontWeight="600"
                  fill={colorFor(hover._cat)} fontVariantNumeric="tabular-nums"
                >{fmtScore(hover._score)}</text>
              </g>
            );
          })()}
        </svg>

        {/* Footer stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 14, padding: '14px 18px 6px', marginTop: 8,
          borderTop: '1px solid var(--rule)',
        }}>
          <FootStat label="Logged" value={visible.length} sub={filterCat ? CATEGORIES.find(c => c.id === filterCat)?.label.toLowerCase() : 'this year'} />
          <FootStat label="Average" value={fmtScore(visibleAvg)} sub="weighted" />
          <FootStat label="Highest" value={fmtScore(top._score)} sub={top.name} />
          <FootStat
            label="Beds active" value={byCat.filter(b => b.count > 0).length}
            sub={`of ${byCat.length}`}
          />
        </div>
      </Card>
    </div>
  );
};

const FilterChip = ({ active, onClick, color, label, count }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
      background: active ? color : 'var(--paper)',
      border: '1px solid', borderColor: active ? color : 'var(--rule)',
      color: active ? 'var(--paper)' : 'var(--ink)',
      fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: active ? 500 : 400,
    }}
  >
    <span style={{
      width: 8, height: 8, borderRadius: 999,
      background: active ? 'var(--paper)' : color,
    }} />
    {label}
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: 10.5,
      color: active ? 'var(--paper)' : 'var(--ink-soft)',
      opacity: 0.85,
    }}>{count}</span>
  </button>
);

const FootStat = ({ label, value, sub }) => (
  <div>
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1.6,
      textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 4,
    }}>{label}</div>
    <div style={{
      fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600,
      color: 'var(--ink)', lineHeight: 1, letterSpacing: -0.5,
      fontVariantNumeric: 'tabular-nums',
    }}>{value}</div>
    {sub && (
      <div style={{
        fontFamily: 'var(--font-display)', fontStyle: 'italic',
        fontSize: 12, color: 'var(--ink-soft)', marginTop: 4,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{sub}</div>
    )}
  </div>
);

window.DashboardView = DashboardView;

// Main app — sidebar nav, dashboard, browse, add-entry, detail
const { useState, useEffect, useMemo, useRef } = React;

// Renders a category glyph by string id, including the special "leaf" + "sparkle" glyphs
// that live outside the Glyph SVG library.
const CatGlyph = ({ kind, size = 18, color = 'var(--ink-soft)' }) => {
  if (kind === 'leaf')    return <LeafMark size={size} color={color} />;
  if (kind === 'sparkle') return <Sparkle  size={size * 0.78} color={color} />;
  return <Glyph kind={kind} size={size} color={color} />;
};

// ───────────────────────────────────────────────────────────────
// Sidebar
// ───────────────────────────────────────────────────────────────
const getSeason = (month) => {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

const Sidebar = ({ view, setView, counts, navOpen, onNewBed }) => {
  const now = new Date();
  const season = getSeason(now.getMonth());
  const thisMonthEntries = Object.values(ALL_DATA).flat().filter((i) => {
    const d = new Date(i.date + 'T12:00:00');
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const NavItem = ({ id, label, icon, count, active, onClick }) => (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', borderRadius: 12,
        background: active ? 'var(--accent-soft)' : 'transparent',
        border: '1px solid', borderColor: active ? 'var(--accent-strong)' : 'transparent',
        color: 'var(--ink)', cursor: 'pointer',
        fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: active ? 500 : 400,
        textAlign: 'left', width: '100%',
      }}
    >
      <span style={{ display: 'inline-flex', width: 22, justifyContent: 'center' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {count != null && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--ink-soft)', fontVariantNumeric: 'tabular-nums',
        }}>{count}</span>
      )}
    </button>
  );

  return (
    <aside className={`sidebar ${navOpen ? 'open' : ''}`} style={{
      width: 248, padding: '28px 18px',
      borderRight: '1px solid var(--rule)',
      background: 'var(--paper-warm)',
      display: 'flex', flexDirection: 'column', gap: 24,
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo / wordmark */}
      <div style={{ padding: '0 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PetalMark size={26} color="var(--accent-strong)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 500,
              color: 'var(--ink)', letterSpacing: -0.4, lineHeight: 1,
            }}>the garden</span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1.6,
              textTransform: 'uppercase', color: 'var(--ink-soft)', marginTop: 4,
            }}>est. 2026 · v0.4</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <NavItem
          id="home" label="Overview"
          icon={<LeafMark size={16} color="var(--accent-strong)" />}
          active={view.name === 'home'}
          onClick={() => setView({ name: 'home' })}
        />
        <NavItem
          id="dashboard" label="Dashboard"
          icon={<Sparkle size={14} color="var(--accent-strong)" />}
          active={view.name === 'dashboard'}
          onClick={() => setView({ name: 'dashboard' })}
        />
      </div>

      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.6,
          textTransform: 'uppercase', color: 'var(--ink-soft)',
          padding: '6px 14px 8px',
        }}>Beds</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {CATEGORIES.map((c) => (
            <NavItem
              key={c.id} id={c.id} label={c.label}
              icon={
<CatGlyph kind={c.glyph} size={18} />
              }
              count={counts[c.id]}
              active={view.name === 'browse' && view.cat === c.id}
              onClick={() => setView({ name: 'browse', cat: c.id })}
            />
          ))}
          <button onClick={onNewBed} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 12, marginTop: 4,
            background: 'transparent', border: '1px dashed var(--rule)',
            color: 'var(--ink-soft)', cursor: 'pointer',
            fontFamily: 'var(--font-ui)', fontSize: 13,
            textAlign: 'left', width: '100%',
          }}>
            <span style={{ display: 'inline-flex', width: 22, justifyContent: 'center', fontSize: 16, color: 'var(--accent-strong)' }}>+</span>
            <span>new bed</span>
          </button>
        </div>
      </div>

      <div style={{ marginTop: 'auto', padding: '0 6px' }}>
        <div style={{
          padding: 14, borderRadius: 14,
          background: 'var(--accent-soft)',
          border: '1px dashed var(--accent-strong)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
          }}>
            <Sparkle size={11} color="var(--accent-strong)" />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.4,
              textTransform: 'uppercase', color: 'var(--ink)',
            }}>Now growing</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 14.5,
            color: 'var(--ink)', lineHeight: 1.35,
          }}>
            {season} season · {thisMonthEntries} entries this month
          </div>
        </div>
      </div>
    </aside>
  );
};

// ───────────────────────────────────────────────────────────────
// Dashboard / Overview — recent activity feed grouped by month
// ───────────────────────────────────────────────────────────────
const StatTile = ({ value, label, sub, big }) => (
  <Card style={{ padding: '20px 22px' }}>
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
      textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 6,
    }}>{label}</div>
    <div style={{
      fontFamily: 'var(--font-display)', fontSize: big ? 44 : 32, fontWeight: 500,
      color: 'var(--ink)', lineHeight: 1, letterSpacing: -1,
      fontVariantNumeric: 'tabular-nums',
    }}>{value}</div>
    {sub && (
      <div style={{
        fontFamily: 'var(--font-ui)', fontSize: 12.5,
        color: 'var(--ink-soft)', marginTop: 8,
      }}>{sub}</div>
    )}
  </Card>
);

const FeedRow = ({ row, onOpen, weights }) => {
  const cat = CATEGORIES.find((c) => c.id === row._cat);
  return (
    <div
      onClick={() => onOpen(row._cat, row.id)}
      className="feed-row"
      style={{
        display: 'grid', gridTemplateColumns: '64px 1fr auto',
        gap: 18, alignItems: 'center', padding: '14px 0',
        borderBottom: '1px solid var(--rule)', cursor: 'pointer',
      }}
    >
      <PhotoDisplay entryId={row.id} tone={row.photo.tone} shape={row.photo.shape} size="sm" />
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <CatGlyph kind={cat.glyph} size={13} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.4,
            textTransform: 'uppercase', color: 'var(--ink-soft)',
          }}>{cat.label}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-soft)',
          }}>· {fmtDate(row.date)}</span>
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 17.5, color: 'var(--ink)',
          fontWeight: 500, marginBottom: 3,
          textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
        }}>{row.name}</div>
        <div style={{
          fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--ink-soft)',
          textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
        }}>
          {row.location || row.author || row.artist || row.kind || ''}
        </div>
      </div>
      <ScoreBadge score={row._score} size="sm" />
    </div>
  );
};

const HomeView = ({ weights, onOpen, onAdd }) => {
  const today = new Date();
  const todayLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const feed = useMemo(() => flatFeed(weights), [weights]);
  const byMonth = useMemo(() => {
    const groups = {};
    for (const r of feed) {
      const k = fmtMonthYear(r.date);
      (groups[k] = groups[k] || []).push(r);
    }
    return groups;
  }, [feed]);

  // Stats
  const total = feed.length;
  const thisMonthKey = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const thisMonth = feed.filter((r) => {
    const d = new Date(r.date + 'T12:00:00');
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;
  const avg = +(feed.reduce((s, r) => s + r._score, 0) / feed.length).toFixed(1);
  const top = [...feed].sort((a, b) => b._score - a._score)[0];

  return (
    <div>
      {/* Greeting */}
      <header style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.6,
          textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 10,
        }}>{todayLabel}</div>
        <h1 className="greeting-h1" style={{
          fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 500,
          color: 'var(--ink)', margin: 0, letterSpacing: -1.4, lineHeight: 1.1,
          textWrap: 'balance', maxWidth: '20ch',
        }}>
          welcome back to <span style={{ position: 'relative', whiteSpace: 'nowrap', display: 'inline-block' }}>
            the garden
            <span style={{ position: 'absolute', left: 0, right: 0, bottom: -6, lineHeight: 0 }}>
              <Squiggle width="100%" color="var(--accent-strong)" strokeWidth={2} />
            </span>
          </span><span style={{ color: 'var(--accent-strong)' }}>.</span>
        </h1>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 18,
          color: 'var(--ink-soft)', marginTop: 16, fontStyle: 'italic',
        }}>
          a quiet record of small things — eaten, watched, read, made.
        </p>
      </header>

      {/* Stat row */}
      <div className="grid-stat" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 36 }}>
        <StatTile value={total} label="Entries logged" sub="across six beds" />
        <StatTile value={thisMonth} label="This month" sub={thisMonthKey.toLowerCase()} />
        <StatTile value={fmtScore(avg)} label="Average score" sub="all categories" />
        <StatTile value={fmtScore(top._score)} label="Top of garden" sub={top.name} />
      </div>

      {/* Categories peek */}
      <SectionTitle
        eyebrow="The beds"
        title="What's growing"
        action={<Button variant="ghost" onClick={() => onAdd()}>＋ new entry</Button>}
      />
      <div className="grid-cats" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 44,
      }}>
        {CATEGORIES.map((c) => {
          const items = ALL_DATA[c.id];
          const top = items.length
            ? [...items].map((i) => ({ ...i, _s: itemScore(c.id, i, weights) }))
                .sort((a, b) => (b._s || 0) - (a._s || 0))[0]
            : null;
          return (
            <Card key={c.id} onClick={() => onOpen(c.id)} style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--accent-soft)',
                  display: 'grid', placeItems: 'center',
                }}>
                  <CatGlyph kind={c.glyph} size={18} color="var(--accent-strong)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 15.5, fontWeight: 500,
                    color: 'var(--ink)',
                  }}>{c.label}</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.2,
                    textTransform: 'uppercase', color: 'var(--ink-soft)', marginTop: 2,
                  }}>{items.length} {items.length === 1 ? 'entry' : 'entries'}</div>
                </div>
              </div>
              <DottedDivider color="var(--ink-soft)" />
              {top ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                  <PhotoDisplay entryId={top.id} tone={top.photo.tone} shape={top.photo.shape} size="sm" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1,
                      textTransform: 'uppercase', color: 'var(--ink-soft)',
                    }}>top pick</div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 14.5,
                      color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{top.name}</div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-strong)',
                      fontVariantNumeric: 'tabular-nums', fontWeight: 500,
                    }}>{fmtScore(top._s)}</div>
                  </div>
                </div>
              ) : (
                <div style={{
                  marginTop: 12, padding: '14px 0', textAlign: 'center',
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 13, color: 'var(--ink-soft)',
                }}>nothing planted yet</div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Recent feed */}
      <SectionTitle eyebrow="Recently" title="The feed" />
      <div>
        {Object.entries(byMonth).map(([month, rows]) => (
          <div key={month} style={{ marginBottom: 28 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6,
              padding: '6px 0',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 13, fontStyle: 'italic',
                color: 'var(--ink-soft)',
              }}>{month.toLowerCase()}</span>
              <div style={{ flex: 1 }}><Squiggle width="100%" color="var(--rule)" strokeWidth={1.2} /></div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-soft)',
                letterSpacing: 1.2,
              }}>{rows.length} entries</span>
            </div>
            {rows.map((r) => (
              <FeedRow key={r._cat + r.id} row={r} onOpen={onOpen} weights={weights} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// Browse — filter / grid for one category
// ───────────────────────────────────────────────────────────────
const BrowseView = ({ catId, weights, onOpen, onAdd }) => {
  const cat = CATEGORIES.find((c) => c.id === catId);
  const items = ALL_DATA[catId];
  const [sort, setSort] = useState('recent');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    let r = items.map((i) => ({ ...i, _score: itemScore(catId, i, weights) }));
    if (query) {
      const q = query.toLowerCase();
      r = r.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        (i.notes || '').toLowerCase().includes(q) ||
        (i.tags || []).some((t) => t.includes(q))
      );
    }
    r.sort((a, b) => {
      if (sort === 'score') return b._score - a._score;
      return a.date < b.date ? 1 : -1;
    });
    return r;
  }, [items, sort, query, weights, catId]);

  return (
    <div>
      <header style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <CatGlyph kind={cat.glyph} size={20} color="var(--accent-strong)" />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.6,
            textTransform: 'uppercase', color: 'var(--ink-soft)',
          }}>The {cat.label.toLowerCase()} bed</span>
        </div>
        <h1 className="browse-h1" style={{
          fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 500,
          color: 'var(--ink)', margin: 0, letterSpacing: -1, lineHeight: 1.05,
        }}>{cat.label.toLowerCase()}</h1>
        <div style={{ marginTop: 8 }}>
          <Squiggle width={80} color="var(--accent-strong)" strokeWidth={2} />
        </div>
      </header>

      {/* Toolbar */}
      <div className="toolbar-row" style={{
        display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24,
        padding: '10px 14px', background: 'var(--paper-warm)',
        borderRadius: 12, border: '1px solid var(--rule)',
      }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search this bed…"
          style={{
            flex: 1, border: 'none', background: 'transparent', outline: 'none',
            fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--ink)',
          }}
        />
        <div style={{
          display: 'flex', gap: 4, padding: 3,
          background: 'var(--paper)', borderRadius: 999, border: '1px solid var(--rule)',
        }}>
          {['recent', 'score'].map((s) => (
            <button
              key={s} onClick={() => setSort(s)}
              style={{
                padding: '5px 12px', borderRadius: 999, border: 'none',
                background: sort === s ? 'var(--ink)' : 'transparent',
                color: sort === s ? 'var(--paper)' : 'var(--ink-soft)',
                cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10.5,
                letterSpacing: 1.2, textTransform: 'uppercase',
              }}
            >{s}</button>
          ))}
        </div>
        <Button onClick={() => onAdd(catId)}>＋ add</Button>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 18,
      }}>
        {rows.map((item) => (
          <ItemCard key={item.id} item={item} catId={catId} onOpen={onOpen} />
        ))}
      </div>

      {rows.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '48px 0',
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          color: 'var(--ink-soft)',
        }}>
          nothing here yet — try a different word.
        </div>
      )}
    </div>
  );
};

const ItemCard = ({ item, catId, onOpen }) => {
  const isCafe = catId === 'cafes';
  return (
    <Card onClick={() => onOpen(catId, item.id)} style={{
      padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      <div style={{
        padding: 18, paddingBottom: 14,
        background: 'var(--paper-warm)',
        borderBottom: '1px solid var(--rule)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <PhotoDisplay entryId={item.id} tone={item.photo.tone} shape={item.photo.shape} size="md" />
          <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.2,
              textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 4,
            }}>{fmtDate(item.date)}{item.kind ? ` · ${item.kind}` : ''}</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 500,
              color: 'var(--ink)', lineHeight: 1.2, letterSpacing: -0.3,
              marginBottom: 4,
            }}>{item.name}</div>
            <div style={{
              fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--ink-soft)',
            }}>{item.location || item.author || item.artist || ''}</div>
            {catId === 'cooking' && (item.difficulty || item.time) && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {item.difficulty && DIFF_STYLE[item.difficulty] && (
                  <span style={{
                    display: 'inline-flex', padding: '2px 8px', borderRadius: 999,
                    background: DIFF_STYLE[item.difficulty].bg, color: DIFF_STYLE[item.difficulty].ink,
                    fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1,
                    textTransform: 'uppercase', border: '1px solid currentColor',
                  }}>{item.difficulty}</span>
                )}
                {item.time && (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--ink-soft)',
                    letterSpacing: 0.8,
                  }}>⏱ {item.time}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{
        padding: '14px 18px 18px', flex: 1,
        display: 'flex', flexDirection: 'column',
      }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 13.5, color: 'var(--ink)', margin: 0, lineHeight: 1.45,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minHeight: '2.9em',
        }}>"{item.notes}"</p>

        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: 10, marginTop: 'auto', paddingTop: 14, minHeight: 56,
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, flex: 1 }}>
            {(item.tags || []).slice(0, 3).map((t) => (
              <Chip key={t} tone="rose">#{t}</Chip>
            ))}
          </div>
          {isCafe ? (
            <ScoreBadge score={item._score} label="together" size="md" />
          ) : (
            <ScoreBadge score={item._score} label="score" size="md" />
          )}
        </div>
      </div>
    </Card>
  );
};

// ───────────────────────────────────────────────────────────────
// Cooking-specific detail — ingredients with scaling, instructions
// ───────────────────────────────────────────────────────────────
const DIFF_STYLE = {
  easy:   { bg: '#edf2e7', ink: '#4a6635' },
  medium: { bg: '#f5ecd4', ink: '#8a6020' },
  hard:   { bg: '#fae6e9', ink: '#9a3545' },
};

const fmtQty = (qty, scale) => {
  if (qty == null || qty === '') return '';
  const val = parseFloat(qty) * scale;
  if (isNaN(val)) return String(qty);
  const FRACS = [[0.125,'⅛'],[0.25,'¼'],[0.333,'⅓'],[0.5,'½'],[0.667,'⅔'],[0.75,'¾']];
  const whole = Math.floor(val);
  const frac = val - whole;
  const f = FRACS.find(([n]) => Math.abs(frac - n) < 0.04);
  if (f && whole === 0) return f[1];
  if (f) return `${whole}${f[1]}`;
  if (Math.abs(val - Math.round(val)) < 0.05) return String(Math.round(val));
  return parseFloat(val.toFixed(1)).toString();
};

const CookingDetails = ({ item }) => {
  const [target, setTarget] = useState(item.portions || 1);
  const scale = (item.portions && item.portions > 0) ? target / item.portions : 1;
  const diff = item.difficulty ? DIFF_STYLE[item.difficulty] : null;
  const ClockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="7" cy="7" r="6"/><path d="M7 4v3.5l2 1.5"/>
    </svg>
  );

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Difficulty + time badges */}
      {(diff || item.time) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {diff && (
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '5px 13px', borderRadius: 999,
              background: diff.bg, color: diff.ink,
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.2,
              textTransform: 'uppercase', border: '1px solid currentColor',
            }}>{item.difficulty}</span>
          )}
          {item.time && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 13px', borderRadius: 999,
              background: 'var(--paper-warm)', color: 'var(--ink)',
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.2,
              border: '1px solid var(--rule)',
            }}>
              <ClockIcon />{item.time}
            </span>
          )}
        </div>
      )}

      {/* Portions + scaling */}
      {item.portions != null && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
            textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 10,
          }}>Portions</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--ink)' }}>serves</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => setTarget(Math.max(1, target - 1))} style={{
                width: 28, height: 28, borderRadius: 999, border: '1px solid var(--rule)',
                background: 'var(--paper)', cursor: 'pointer', fontSize: 18, lineHeight: 1,
                color: 'var(--ink-soft)', display: 'grid', placeItems: 'center',
              }}>−</button>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500,
                color: 'var(--ink)', minWidth: 28, textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
              }}>{target}</span>
              <button onClick={() => setTarget(target + 1)} style={{
                width: 28, height: 28, borderRadius: 999, border: '1px solid var(--rule)',
                background: 'var(--paper)', cursor: 'pointer', fontSize: 18, lineHeight: 1,
                color: 'var(--ink-soft)', display: 'grid', placeItems: 'center',
              }}>+</button>
            </div>
            {target !== item.portions && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent-strong)',
                letterSpacing: 1, textTransform: 'uppercase',
              }}>scaled from {item.portions}</span>
            )}
          </div>
        </div>
      )}

      {/* Ingredients */}
      {item.ingredients?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
            textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 10,
          }}>Ingredients</div>
          <div style={{ borderRadius: 12, border: '1px solid var(--rule)', overflow: 'hidden' }}>
            {item.ingredients.map((ing, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '64px 68px 1fr',
                gap: 8, padding: '10px 16px', alignItems: 'baseline',
                borderBottom: i < item.ingredients.length - 1 ? '1px solid var(--rule)' : 'none',
                background: i % 2 === 0 ? 'var(--paper)' : 'var(--paper-warm)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500,
                  color: scale !== 1 ? 'var(--accent-strong)' : 'var(--ink)',
                  fontVariantNumeric: 'tabular-nums',
                }}>{fmtQty(ing.qty, scale)}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--ink-soft)', letterSpacing: 0.4,
                }}>{ing.unit}</span>
                <span style={{
                  fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--ink)',
                }}>{ing.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {item.instructions && (
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
            textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 10,
          }}>Instructions</div>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 15.5, color: 'var(--ink)',
            margin: 0, lineHeight: 1.75, whiteSpace: 'pre-line',
          }}>{item.instructions}</p>
        </div>
      )}
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// Detail view (modal)
// ───────────────────────────────────────────────────────────────
const DetailView = ({ catId, itemId, weights, onClose, onEdit, onDelete }) => {
  const item = ALL_DATA[catId].find((i) => i.id === itemId);
  if (!item) return null;
  const cat = CATEGORIES.find((c) => c.id === catId);
  const isCafe = catId === 'cafes';
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(60, 40, 50, 0.36)',
        backdropFilter: 'blur(6px)',
        display: 'grid', placeItems: 'center', padding: 32,
        animation: 'fadeIn 200ms ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="detail-modal"
        style={{
          background: 'var(--paper)', borderRadius: 22,
          maxWidth: 760, width: '100%', maxHeight: '88vh', overflow: 'auto',
          boxShadow: '0 24px 60px -20px rgba(60, 40, 50, 0.4)',
          border: '1px solid var(--rule)',
          animation: 'slideUp 280ms cubic-bezier(0.2, 0.9, 0.3, 1)',
        }}
      >
        {/* Header with photo */}
        <div className="pad-detail" style={{
          padding: 32, paddingBottom: 24,
          background: 'var(--paper-warm)',
          borderBottom: '1px solid var(--rule)',
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 18, right: 18,
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--paper)', border: '1px solid var(--rule)',
              cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 16,
              color: 'var(--ink-soft)',
            }}
          >×</button>

          <div className="detail-header-row" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <PhotoDisplay entryId={item.id} tone={item.photo.tone} shape={item.photo.shape} size="lg" label="photo" />
            <div style={{ flex: 1, paddingTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <CatGlyph kind={cat.glyph} size={14} color="var(--accent-strong)" />
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
                  textTransform: 'uppercase', color: 'var(--ink-soft)',
                }}>{cat.label}{item.kind ? ` · ${item.kind}` : ''}</span>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500,
                color: 'var(--ink)', margin: 0, letterSpacing: -0.8, lineHeight: 1.1,
              }}>{item.name}</h2>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 15, fontStyle: 'italic',
                color: 'var(--ink-soft)', marginTop: 6,
              }}>
                {item.author || item.artist || item.location || ''}
                {item.location && ' · '}{fmtDate(item.date)}
                {item.price ? ` · $${item.price}` : ''}
              </div>
            </div>
          </div>
        </div>

        <div className="pad-detail" style={{ padding: 32 }}>
          {/* Notes */}
          {item.notes && (
            <div style={{ marginBottom: 28 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
                textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 8,
              }}>Notes</div>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 17, fontStyle: 'italic',
                color: 'var(--ink)', margin: 0, lineHeight: 1.55,
                paddingLeft: 14, borderLeft: '2px solid var(--accent-strong)',
              }}>{item.notes}</p>
            </div>
          )}

          {/* Cooking details — ingredients, scaling, instructions */}
          {catId === 'cooking' && <CookingDetails item={item} />}

          {/* Scores */}
          {isCafe ? (
            <div style={{ marginBottom: 28 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
                textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 14,
              }}>Ratings · {item.kind} weights ({item.sammy ? 'josie · sammy · together' : 'josie only'})</div>
              <CafeScoreTable item={item} weights={weights} />
            </div>
          ) : (
            <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
              <ScoreBadge score={item.score} label="score" size="xl" color="var(--ink)" />
            </div>
          )}

          {/* Tags */}
          {item.tags && (
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
                textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 8,
              }}>Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {item.tags.map((t) => <Chip key={t} tone="rose">#{t}</Chip>)}
              </div>
            </div>
          )}
        </div>

        {/* Footer — edit / delete */}
        <div style={{
          padding: '16px 32px',
          borderTop: '1px solid var(--rule)',
          background: 'var(--paper-warm)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          {confirmDelete ? (
            <>
              <span style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 14.5, color: 'var(--ink)',
              }}>delete this entry?</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>cancel</Button>
                <button
                  onClick={() => onDelete(catId, item.id)}
                  style={{
                    padding: '10px 16px', borderRadius: 999, cursor: 'pointer',
                    fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 500,
                    background: '#c0392b', color: '#fff', border: 'none',
                  }}
                >yes, delete</button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.2,
                  textTransform: 'uppercase', color: 'var(--ink-soft)',
                  padding: '6px 2px',
                }}
              >delete entry</button>
              <Button variant="accent" onClick={() => onEdit(catId, item.id)}
                icon={<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2.5l2 2L4 12H2v-2L9.5 2.5z"/></svg>}
              >edit entry</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CafeScoreTable = ({ item, weights }) => {
  const cats = [
    { k: 'ambiance', label: 'Ambiance' },
    { k: 'taste', label: 'Taste' },
    { k: 'originality', label: 'Originality' },
  ];
  const wJ = personWeights(weights, 'josie', item.kind);
  const wS = personWeights(weights, 'sammy', item.kind);
  const meTotal  = item.me    ? weighted(item.me, wJ)    : null;
  const samTotal = item.sammy ? weighted(item.sammy, wS) : null;
  const both = (meTotal != null && samTotal != null)
    ? +((meTotal + samTotal) / 2).toFixed(1)
    : (meTotal != null ? meTotal : samTotal);

  return (
    <div style={{
      borderRadius: 14, border: '1px solid var(--rule)', overflow: 'hidden',
    }}>
      <div className="score-table-row" style={{
        display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
        background: 'var(--paper-warm)', borderBottom: '1px solid var(--rule)',
        padding: '10px 18px', alignItems: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1.4,
          textTransform: 'uppercase', color: 'var(--ink-soft)',
        }}>Category</div>
        {['Josie', 'Sammy', 'Avg'].map((h) => (
          <div key={h} style={{
            fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1.4,
            textTransform: 'uppercase', color: 'var(--ink-soft)', textAlign: 'center',
          }}>{h}</div>
        ))}
      </div>
      {cats.map(({ k, label }) => {
        const me  = item.me    ? item.me[k]    : null;
        const sam = item.sammy ? item.sammy[k] : null;
        const avg = (me != null && sam != null)
          ? +((me + sam) / 2).toFixed(1)
          : (me != null ? me : sam);
        return (
          <div key={k} className="score-table-row" style={{
            display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            padding: '12px 18px', alignItems: 'center',
            borderBottom: '1px solid var(--rule)',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--ink)' }}>{label}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1, color: 'var(--ink-soft)',
              }}>J {Math.round(wJ[k] * 100)}% · S {Math.round(wS[k] * 100)}%</div>
            </div>
            <ScoreCell value={me} />
            <ScoreCell value={sam} />
            <ScoreCell value={avg} strong />
          </div>
        );
      })}
      <div className="score-table-row" style={{
        display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
        padding: '14px 18px', alignItems: 'center',
        background: 'var(--accent-soft)',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, color: 'var(--ink)',
        }}>Weighted total</div>
        <ScoreCell value={meTotal} strong />
        <ScoreCell value={samTotal} strong />
        <ScoreCell value={both} strong big />
      </div>
    </div>
  );
};

const ScoreCell = ({ value, strong, big }) => (
  <div style={{
    fontFamily: 'var(--font-display)',
    fontSize: big ? 22 : (strong ? 17 : 15),
    fontWeight: strong ? 500 : 400,
    color: big ? 'var(--accent-strong)' : 'var(--ink)',
    fontVariantNumeric: 'tabular-nums', textAlign: 'center',
  }}>{fmtScore(value)}</div>
);

// ───────────────────────────────────────────────────────────────
// Add-entry sheet
// ───────────────────────────────────────────────────────────────
const AddSheet = ({ initialCat, editCatId, editItem, weights, onClose, onSaved }) => {
  const isEdit = !!editItem;
  const [cat, setCat] = useState(editCatId || initialCat || 'cafes');
  const catCfg = CATEGORIES.find((c) => c.id === cat) || CATEGORIES[0];
  const ratingMode = catCfg.rating || 'simple';
  const kindOpts = catCfg.kindSwitch || null;
  const [kind, setKind] = useState(editItem?.kind || (kindOpts ? kindOpts[0] : ''));
  // Reset kind when cat changes (only in add mode)
  useEffect(() => { if (!isEdit) setKind(catCfg.kindSwitch ? catCfg.kindSwitch[0] : ''); }, [cat]);

  const todayIso = new Date().toISOString().slice(0, 10);
  const [name, setName] = useState(editItem?.name || '');
  const [date, setDate] = useState(editItem?.date || todayIso);
  const [notes, setNotes] = useState(editItem?.notes || '');
  const [extra, setExtra] = useState(
    editItem ? (catCfg.extraField ? editItem[catCfg.extraField] || '' : '') : ''
  );
  const [price, setPrice] = useState(editItem?.price != null ? String(editItem.price) : '');
  const [score, setScore] = useState(editItem?.score ?? 8.0);
  const [tags, setTags] = useState((editItem?.tags || []).join(', '));
  const [withSammy, setWithSammy] = useState(isEdit ? editItem.sammy !== null : ratingMode === 'cafe');
  const [me, setMe] = useState(editItem?.me || { ambiance: 8, taste: 8, originality: 8 });
  const [sammy, setSammy] = useState(editItem?.sammy || { ambiance: 8, taste: 8, originality: 8 });
  const [photoData, setPhotoData] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (editItem) loadPhoto(editItem.id).then((url) => { if (url) setPhotoPreview(url); });
  }, [editItem?.id]);

  // Cooking-specific fields (always defined to satisfy hooks rules)
  const isCooking = cat === 'cooking';
  const [difficulty, setDifficulty] = useState(editItem?.difficulty || '');
  const [cookTime, setCookTime] = useState(editItem?.time || '');
  const [portions, setPortions] = useState(editItem?.portions != null ? String(editItem.portions) : '');
  const [ingredients, setIngredients] = useState(
    editItem?.ingredients?.length > 0
      ? editItem.ingredients.map((ing) => ({ qty: ing.qty != null ? String(ing.qty) : '', unit: ing.unit || '', name: ing.name || '' }))
      : [{ qty: '', unit: '', name: '' }]
  );
  const [cookInstructions, setCookInstructions] = useState(editItem?.instructions || '');

  const updateIngredient = (idx, key, val) =>
    setIngredients(ingredients.map((ing, i) => i === idx ? { ...ing, [key]: val } : ing));
  const removeIngredient = (idx) =>
    setIngredients(ingredients.filter((_, i) => i !== idx));

  const isCafe = ratingMode === 'cafe';
  const wJ = personWeights(weights, 'josie', kind);
  const wS = personWeights(weights, 'sammy', kind);
  const meTotal = weighted(me, wJ);
  const samTotal = weighted(sammy, wS);
  const both = withSammy ? +((meTotal + samTotal) / 2).toFixed(1) : meTotal;

  const TONES = ['rose', 'sage', 'butter', 'plum', 'sky', 'clay'];
  const SHAPES = ['rounded', 'circle', 'arch'];
  const submit = () => {
    const fields = {
      name: name || 'Untitled', date,
      notes: notes || '', tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      price: price ? +price : undefined,
    };
    if (catCfg.extraField) fields[catCfg.extraField] = extra;
    if (kindOpts) fields.kind = kind;
    if (isCafe) {
      fields.me = { ...me };
      fields.sammy = withSammy ? { ...sammy } : null;
    } else {
      fields.score = +score.toFixed(1);
    }
    if (isCooking) {
      const filteredIngredients = ingredients
        .filter((ing) => ing.name.trim())
        .map((ing) => ({ qty: ing.qty !== '' ? parseFloat(ing.qty) : undefined, unit: ing.unit.trim(), name: ing.name.trim() }));
      if (filteredIngredients.length > 0) fields.ingredients = filteredIngredients;
      if (portions !== '') fields.portions = parseInt(portions, 10);
      if (cookInstructions.trim()) fields.instructions = cookInstructions.trim();
      if (difficulty) fields.difficulty = difficulty;
      if (cookTime.trim()) fields.time = cookTime.trim();
    }
    if (isEdit) {
      updateEntry(editCatId, editItem.id, fields);
      if (photoData) savePhoto(editItem.id, photoData);
      if (onSaved) onSaved(editCatId);
    } else {
      const id = `u${Date.now().toString(36)}`;
      const tone = TONES[Math.floor(Math.random() * TONES.length)];
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      addEntry(cat, { ...fields, id, photo: { tone, shape } });
      if (photoData) savePhoto(id, photoData);
      if (onSaved) onSaved(cat);
    }
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 110,
        background: 'rgba(60, 40, 50, 0.4)', backdropFilter: 'blur(6px)',
        display: 'grid', placeItems: 'center', padding: 32,
        animation: 'fadeIn 200ms ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="add-sheet"
        style={{
          background: 'var(--paper)', borderRadius: 22, width: '100%',
          maxWidth: 640, maxHeight: '88vh', overflow: 'auto',
          border: '1px solid var(--rule)',
          boxShadow: '0 24px 60px -20px rgba(60, 40, 50, 0.4)',
          animation: 'slideUp 280ms cubic-bezier(0.2, 0.9, 0.3, 1)',
        }}
      >
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid var(--rule)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--paper-warm)',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
              textTransform: 'uppercase', color: 'var(--ink-soft)',
            }}>{isEdit ? 'Edit entry' : 'Plant a new entry'}</div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500,
              color: 'var(--ink)', margin: '4px 0 0', letterSpacing: -0.4,
            }}>{isEdit ? editItem.name : 'what did you grow?'}</h3>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--paper)', border: '1px solid var(--rule)',
            cursor: 'pointer', fontSize: 16, color: 'var(--ink-soft)',
          }}>×</button>
        </div>

        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Category — hidden in edit mode since you can't move entries between beds */}
          {!isEdit && (
            <Field label="Bed">
              <div className="cat-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {CATEGORIES.map((c) => (
                  <button key={c.id} onClick={() => setCat(c.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 12px', borderRadius: 12,
                      border: '1px solid', borderColor: cat === c.id ? 'var(--accent-strong)' : 'var(--rule)',
                      background: cat === c.id ? 'var(--accent-soft)' : 'var(--paper)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--ink)',
                    }}>
                    <CatGlyph kind={c.glyph} size={14} color={cat === c.id ? 'var(--accent-strong)' : 'var(--ink-soft)'} />
                    {c.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* Photo */}
          <div>
            <FieldLabel>Photo (optional)</FieldLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <PhotoUpload
                preview={photoPreview}
                onChange={(dataUrl) => { setPhotoData(dataUrl); setPhotoPreview(dataUrl); }}
              />
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                click to upload a photo<br />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 0.8, opacity: 0.7 }}>
                  images are resized and saved locally
                </span>
              </div>
            </div>
          </div>

          <Field label="Name">
            <Input value={name} onChange={setName} placeholder="What was it called?" />
          </Field>

          <div className="add-sheet-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Date">
              <Input value={date} onChange={setDate} type="date" />
            </Field>
            <Field label="Price ($)">
              <Input value={price} onChange={setPrice} placeholder="optional" />
            </Field>
          </div>

          {kindOpts && (
            <Field label="Type">
              <div style={{ display: 'flex', gap: 8 }}>
                {kindOpts.map((k) => (
                  <button key={k} onClick={() => setKind(k)} style={{
                    flex: 1, padding: '10px 14px', borderRadius: 10,
                    border: '1px solid', borderColor: kind === k ? 'var(--accent-strong)' : 'var(--rule)',
                    background: kind === k ? 'var(--accent-soft)' : 'var(--paper)',
                    cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13,
                    color: 'var(--ink)', textTransform: 'capitalize',
                  }}>{k}</button>
                ))}
              </div>
            </Field>
          )}

          {catCfg.extraField && (
            <Field label={catCfg.extraField}>
              <Input value={extra} onChange={setExtra} placeholder={
                catCfg.extraField === 'location' ? 'Neighborhood, city' :
                catCfg.extraField === 'author' ? 'Who wrote it?' :
                catCfg.extraField === 'artist' ? 'Who made it?' :
                'optional'
              } />
            </Field>
          )}

          {/* Cooking-specific fields */}
          {isCooking && (<>
            <Field label="Difficulty">
              <div style={{ display: 'flex', gap: 8 }}>
                {['easy', 'medium', 'hard'].map((d) => {
                  const ds = DIFF_STYLE[d];
                  const active = difficulty === d;
                  return (
                    <button key={d} onClick={() => setDifficulty(active ? '' : d)} style={{
                      flex: 1, padding: '9px 0', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${active ? ds.ink : 'var(--rule)'}`,
                      background: active ? ds.bg : 'var(--paper)',
                      color: active ? ds.ink : 'var(--ink-soft)',
                      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1,
                      textTransform: 'uppercase',
                    }}>{d}</button>
                  );
                })}
              </div>
            </Field>

            <div className="add-sheet-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Total time">
                <Input value={cookTime} onChange={setCookTime} placeholder="e.g. 45 min, 1h 30m" />
              </Field>
              <Field label="Serves">
                <Input value={portions} onChange={setPortions} placeholder="e.g. 4" type="number" />
              </Field>
            </div>

            <div>
              <FieldLabel>Ingredients</FieldLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                {ingredients.map((ing, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '68px 78px 1fr auto', gap: 6, alignItems: 'center' }}>
                    <input
                      value={ing.qty} onChange={(e) => updateIngredient(i, 'qty', e.target.value)}
                      placeholder="qty" type="number" step="any" min="0"
                      style={{
                        padding: '8px 10px', borderRadius: 10, border: '1px solid var(--rule)',
                        background: 'var(--paper)', fontFamily: 'var(--font-ui)', fontSize: 13.5,
                        color: 'var(--ink)', outline: 'none', width: '100%',
                      }}
                    />
                    <input
                      value={ing.unit} onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                      placeholder="unit"
                      style={{
                        padding: '8px 10px', borderRadius: 10, border: '1px solid var(--rule)',
                        background: 'var(--paper)', fontFamily: 'var(--font-ui)', fontSize: 13.5,
                        color: 'var(--ink)', outline: 'none', width: '100%',
                      }}
                    />
                    <input
                      value={ing.name} onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                      placeholder="ingredient"
                      style={{
                        padding: '8px 10px', borderRadius: 10, border: '1px solid var(--rule)',
                        background: 'var(--paper)', fontFamily: 'var(--font-ui)', fontSize: 13.5,
                        color: 'var(--ink)', outline: 'none', width: '100%',
                      }}
                    />
                    {ingredients.length > 1 ? (
                      <button onClick={() => removeIngredient(i)} style={{
                        width: 28, height: 28, borderRadius: 999, border: '1px solid var(--rule)',
                        background: 'var(--paper)', cursor: 'pointer', fontSize: 16,
                        color: 'var(--ink-soft)', display: 'grid', placeItems: 'center', flexShrink: 0,
                      }}>×</button>
                    ) : <div style={{ width: 28 }} />}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setIngredients([...ingredients, { qty: '', unit: '', name: '' }])}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'none', border: '1px dashed var(--rule)', borderRadius: 10,
                  padding: '8px 14px', cursor: 'pointer', width: '100%', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1,
                  textTransform: 'uppercase', color: 'var(--ink-soft)',
                }}
              >+ add ingredient</button>
            </div>

            <Field label="Instructions">
              <textarea
                value={cookInstructions} onChange={(e) => setCookInstructions(e.target.value)}
                placeholder="Step by step — one paragraph per step works well…"
                rows={6}
                style={{
                  width: '100%', padding: 12, borderRadius: 10,
                  border: '1px solid var(--rule)', background: 'var(--paper)',
                  fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink)',
                  resize: 'vertical', outline: 'none',
                }}
              />
            </Field>
          </>)}

          {/* Score area */}
          {isCafe ? (
            <div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8,
              }}>
                <FieldLabel>Ratings</FieldLabel>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.2,
                  textTransform: 'uppercase', color: 'var(--ink-soft)',
                }}>
                  <input
                    type="checkbox" checked={withSammy}
                    onChange={(e) => setWithSammy(e.target.checked)}
                    style={{ accentColor: 'var(--accent-strong)' }}
                  />
                  with sammy
                </label>
              </div>
              <div className="rater-grid" style={{
                display: 'grid',
                gridTemplateColumns: withSammy ? 'repeat(2, 1fr)' : '1fr',
                gap: 18, padding: 16, borderRadius: 14,
                border: '1px solid var(--rule)', background: 'var(--paper-warm)',
              }}>
                <RaterBlock label="Josie" rates={me} setRates={setMe} weights={wJ} />
                {withSammy && <RaterBlock label="Sammy" rates={sammy} setRates={setSammy} weights={wS} />}
              </div>
              <div style={{
                marginTop: 12, display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '10px 14px',
                borderRadius: 10, background: 'var(--accent-soft)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--ink)',
                }}>Weighted total · {withSammy ? 'together' : 'josie'}</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500,
                  color: 'var(--accent-strong)', fontVariantNumeric: 'tabular-nums',
                }}>{fmtScore(both)}</span>
              </div>
            </div>
          ) : (
            <Field label={`Score · ${fmtScore(score)}`}>
              <input
                type="range" min="1" max="10" step="0.1" value={score}
                onChange={(e) => setScore(+e.target.value)}
                style={{ width: '100%', accentColor: 'var(--accent-strong)' }}
              />
            </Field>
          )}

          <Field label="Notes">
            <textarea
              value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="A few honest sentences for future-you…"
              rows={4}
              style={{
                width: '100%', padding: 12, borderRadius: 10,
                border: '1px solid var(--rule)', background: 'var(--paper)',
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 14, color: 'var(--ink)', resize: 'vertical', outline: 'none',
              }}
            />
          </Field>

          <Field label="Tags (comma separated)">
            <Input value={tags} onChange={setTags} placeholder="weeknight, pasta, classic" />
          </Field>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="ghost" onClick={onClose}>cancel</Button>
            <Button variant="accent" onClick={submit} icon={<Sparkle size={11} color="var(--ink)" />}>
              {isEdit ? 'save changes' : 'plant entry'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    {children}
  </div>
);

const FieldLabel = ({ children }) => (
  <div style={{
    fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
    textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 8,
  }}>{children}</div>
);

const Input = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    value={value} type={type}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: '100%', padding: '10px 14px', borderRadius: 10,
      border: '1px solid var(--rule)', background: 'var(--paper)',
      fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--ink)',
      outline: 'none', boxSizing: 'border-box',
    }}
  />
);

const RaterBlock = ({ label, rates, setRates, weights }) => {
  const total = weighted(rates, weights);
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8,
      }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 15, color: 'var(--ink)', fontWeight: 500,
        }}>{label}</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500,
          color: 'var(--accent-strong)', fontVariantNumeric: 'tabular-nums',
        }}>{fmtScore(total)}</span>
      </div>
      {['ambiance', 'taste', 'originality'].map((k) => (
        <div key={k} style={{ marginBottom: 8 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginBottom: 3,
            fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1,
            textTransform: 'uppercase', color: 'var(--ink-soft)',
          }}>
            <span>{k}</span>
            <span style={{ color: 'var(--ink)' }}>{fmtScore(rates[k])}</span>
          </div>
          <input
            type="range" min="1" max="10" step="0.1" value={rates[k]}
            onChange={(e) => setRates({ ...rates, [k]: +e.target.value })}
            style={{ width: '100%', accentColor: 'var(--accent-strong)' }}
          />
        </div>
      ))}
    </div>
  );
};


Object.assign(window, { Sidebar, HomeView, BrowseView, DetailView, AddSheet });

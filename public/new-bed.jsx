// New Bed creation modal — lets the user define a custom category
const NewBedModal = ({ onClose, onCreated }) => {
  const [label, setLabel] = React.useState('');
  const [glyph, setGlyph] = React.useState('cup');
  const [accent, setAccent] = React.useState('rose');
  const [rating, setRating] = React.useState('simple');
  const [extraField, setExtraField] = React.useState('');
  const [hasKinds, setHasKinds] = React.useState(false);
  const [kindA, setKindA] = React.useState('');
  const [kindB, setKindB] = React.useState('');

  const GLYPHS = ['cup', 'whisk', 'book', 'reel', 'screen', 'disc', 'leaf', 'sparkle'];
  const ACCENTS = ['rose', 'sage', 'butter', 'plum', 'sky', 'clay'];
  const RATING_MODES = [
    { id: 'simple',    title: 'Single score',  hint: 'one slider, 1.0 – 10.0' },
    { id: 'cafe',      title: '3-axis + companion', hint: 'ambiance · taste · originality, with Sammy' },
  ];

  const idFromLabel = (s) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || `bed-${Date.now().toString(36)}`;

  const create = () => {
    if (!label.trim()) return;
    let id = idFromLabel(label);
    let n = 2;
    while (CATEGORIES.find((c) => c.id === id)) id = `${idFromLabel(label)}-${n++}`;
    const bed = {
      id, label: label.trim(), glyph, accent, rating,
      extraField: extraField.trim() || null,
    };
    if (hasKinds && kindA.trim() && kindB.trim()) {
      bed.kindSwitch = [kindA.trim(), kindB.trim()];
    }
    addBed(bed);
    onCreated && onCreated(id);
    onClose();
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(60, 40, 50, 0.4)', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', padding: 32,
      animation: 'fadeIn 200ms ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} className="add-sheet" style={{
        background: 'var(--paper)', borderRadius: 22, width: '100%',
        maxWidth: 580, maxHeight: '88vh', overflow: 'auto',
        border: '1px solid var(--rule)',
        boxShadow: '0 24px 60px -20px rgba(60, 40, 50, 0.4)',
        animation: 'slideUp 280ms cubic-bezier(0.2, 0.9, 0.3, 1)',
      }}>
        <div style={{
          padding: '24px 28px', borderBottom: '1px solid var(--rule)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--paper-warm)',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.6,
              textTransform: 'uppercase', color: 'var(--ink-soft)',
            }}>plant a new bed</div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500,
              color: 'var(--ink)', margin: '4px 0 0', letterSpacing: -0.4,
            }}>what will grow here?</h3>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--paper)', border: '1px solid var(--rule)',
            cursor: 'pointer', fontSize: 16, color: 'var(--ink-soft)',
          }}>×</button>
        </div>

        <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Field label="Name">
            <Input value={label} onChange={setLabel} placeholder="e.g. Concerts, Hikes, Wines…" />
          </Field>

          <Field label="Icon">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {GLYPHS.map((g) => (
                <button key={g} onClick={() => setGlyph(g)} style={{
                  width: 44, height: 44, borderRadius: 12,
                  border: '1px solid', borderColor: glyph === g ? 'var(--accent-strong)' : 'var(--rule)',
                  background: glyph === g ? 'var(--accent-soft)' : 'var(--paper)',
                  cursor: 'pointer', display: 'grid', placeItems: 'center',
                }}>
                  {g === 'leaf'    ? <LeafMark size={18} color="var(--ink)" /> :
                   g === 'sparkle' ? <Sparkle  size={14} color="var(--ink)" /> :
                                     <Glyph kind={g} size={20} color="var(--ink)" />}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Accent">
            <div style={{ display: 'flex', gap: 10 }}>
              {ACCENTS.map((a) => {
                const tone = ({
                  rose: '#f0a4ad', sage: '#a8b894', butter: '#e6c47a',
                  plum: '#a37592', sky: '#9bb6c9', clay: '#c89a82',
                })[a];
                return (
                  <button key={a} onClick={() => setAccent(a)} aria-label={a} style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: tone, cursor: 'pointer',
                    border: '2px solid', borderColor: accent === a ? 'var(--ink)' : 'transparent',
                    boxShadow: '0 2px 6px -2px rgba(60,40,50,0.3)',
                  }} />
                );
              })}
            </div>
          </Field>

          <Field label="How do you rate it?">
            <div style={{ display: 'grid', gap: 10 }}>
              {RATING_MODES.map((m) => (
                <button key={m.id} onClick={() => setRating(m.id)} style={{
                  textAlign: 'left', padding: '12px 16px', borderRadius: 12,
                  border: '1px solid', borderColor: rating === m.id ? 'var(--accent-strong)' : 'var(--rule)',
                  background: rating === m.id ? 'var(--accent-soft)' : 'var(--paper)',
                  cursor: 'pointer',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500,
                    color: 'var(--ink)', marginBottom: 2,
                  }}>{m.title}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--ink-soft)' }}>{m.hint}</div>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Extra info field (optional)">
            <Input value={extraField} onChange={setExtraField} placeholder="e.g. author, artist, location, director" />
          </Field>

          <div>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: 1.4,
              textTransform: 'uppercase', color: 'var(--ink-soft)',
            }}>
              <input type="checkbox" checked={hasKinds}
                onChange={(e) => setHasKinds(e.target.checked)}
                style={{ accentColor: 'var(--accent-strong)' }} />
              two sub-types?
            </label>
            {hasKinds && (
              <div className="add-sheet-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
                <Input value={kindA} onChange={setKindA} placeholder="e.g. café" />
                <Input value={kindB} onChange={setKindB} placeholder="e.g. restaurant" />
              </div>
            )}
          </div>

          <div style={{
            padding: '14px 16px', borderRadius: 12,
            background: 'var(--paper-warm)', border: '1px dashed var(--rule)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--paper)', border: '1px solid var(--rule)',
              display: 'grid', placeItems: 'center',
            }}>
              {glyph === 'leaf'    ? <LeafMark size={20} color="var(--accent-strong)" /> :
               glyph === 'sparkle' ? <Sparkle  size={16} color="var(--accent-strong)" /> :
                                     <Glyph kind={glyph} size={22} color="var(--accent-strong)" />}
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1.4,
                textTransform: 'uppercase', color: 'var(--ink-soft)',
              }}>preview</div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500,
                color: 'var(--ink)',
              }}>{label || 'a new bed'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="ghost" onClick={onClose}>cancel</Button>
            <Button variant="accent" onClick={create} icon={<Sparkle size={11} color="var(--ink)" />}>
              create bed
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { NewBedModal });

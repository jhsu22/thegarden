// Shared UI components for the digital garden
// Hand-drawn ornaments + placeholder imagery + score badges

const { useState, useEffect, useRef, useMemo } = React;

// ───────────────────────────────────────────────────────────────
// Hand-drawn SVG ornaments (small, deliberate)
// ───────────────────────────────────────────────────────────────

const Squiggle = ({ width = 80, color = 'currentColor', strokeWidth = 1.6 }) => (
  <svg width={width} height="8" viewBox="0 0 80 8" fill="none" aria-hidden="true">
    <path
      d="M1 4 Q 8 0 15 4 T 29 4 T 43 4 T 57 4 T 71 4 T 79 4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const Sparkle = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M7 1 C 7.4 4.5 9.5 6.6 13 7 C 9.5 7.4 7.4 9.5 7 13 C 6.6 9.5 4.5 7.4 1 7 C 4.5 6.6 6.6 4.5 7 1 Z"
      fill={color}
    />
  </svg>
);

const DottedDivider = ({ width = '100%', color = 'currentColor' }) => (
  <div
    style={{
      width, height: 2,
      backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1.2px)`,
      backgroundSize: '8px 2px',
      backgroundRepeat: 'repeat-x',
      opacity: 0.5,
    }}
  />
);

const WavyUnderline = ({ children, color = 'var(--accent)' }) => (
  <span style={{ position: 'relative', display: 'inline-block' }}>
    {children}
    <span style={{
      position: 'absolute', left: 0, right: 0, bottom: -8, display: 'block', lineHeight: 0,
    }}>
      <Squiggle width="100%" color={color} strokeWidth={2} />
    </span>
  </span>
);

const LeafMark = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 14 C 2 6 8 2 14 2 C 14 8 10 14 2 14 Z" fill={color} opacity="0.85" />
    <path d="M4 12 C 7 9 10 6 13 3" stroke="white" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const PetalMark = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    {[0, 72, 144, 216, 288].map((rot) => (
      <ellipse key={rot} cx="9" cy="5" rx="2.6" ry="4" fill={color} opacity="0.55"
        transform={`rotate(${rot} 9 9)`} />
    ))}
    <circle cx="9" cy="9" r="1.6" fill="var(--ink)" opacity="0.7" />
  </svg>
);

// Category glyphs — small line drawings, all share visual weight
const Glyph = ({ kind, size = 22, color = 'currentColor' }) => {
  const s = { width: size, height: size };
  const props = { fill: 'none', stroke: color, strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'cup':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <path {...props} d="M4 9 H 17 V 16 Q 17 19 14 19 H 7 Q 4 19 4 16 Z" />
          <path {...props} d="M17 11 H 19.5 Q 21 11 21 13 Q 21 15 19.5 15 H 17" />
          <path {...props} d="M8 6 Q 9 4 8 2 M 12 6 Q 13 4 12 2" />
        </svg>
      );
    case 'whisk':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <path {...props} d="M12 3 V 13" />
          <path {...props} d="M8 13 Q 12 22 16 13" />
          <path {...props} d="M10 13 Q 12 20 14 13" />
          <path {...props} d="M9 13 H 15" />
          <circle {...props} cx="12" cy="3" r="1.4" />
        </svg>
      );
    case 'book':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <path {...props} d="M4 5 Q 8 3 12 5 Q 16 3 20 5 V 19 Q 16 17 12 19 Q 8 17 4 19 Z" />
          <path {...props} d="M12 5 V 19" />
        </svg>
      );
    case 'reel':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <circle {...props} cx="12" cy="12" r="8" />
          <circle {...props} cx="12" cy="12" r="2" />
          <circle {...props} cx="12" cy="6" r="1.2" />
          <circle {...props} cx="12" cy="18" r="1.2" />
          <circle {...props} cx="6" cy="12" r="1.2" />
          <circle {...props} cx="18" cy="12" r="1.2" />
        </svg>
      );
    case 'screen':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <rect {...props} x="3" y="5" width="18" height="12" rx="2" />
          <path {...props} d="M8 21 H 16 M 12 17 V 21" />
        </svg>
      );
    case 'disc':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <circle {...props} cx="12" cy="12" r="8.5" />
          <circle {...props} cx="12" cy="12" r="4" />
          <circle {...props} cx="12" cy="12" r="1" fill={color} />
        </svg>
      );
    case 'bean':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <ellipse {...props} cx="12" cy="12" rx="5" ry="8.5" transform="rotate(-15 12 12)" />
          <path {...props} d="M10 4.5 C 16.5 9 7.5 15 14 19.5" />
        </svg>
      );
    case 'music':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <ellipse {...props} cx="8.5" cy="18" rx="3.5" ry="2.4" transform="rotate(-20 8.5 18)" />
          <ellipse {...props} cx="18" cy="15.5" rx="3.5" ry="2.4" transform="rotate(-20 18 15.5)" />
          <path {...props} d="M12 17 V 6 L 21.5 3.5 V 14" />
          <line {...props} x1="12" y1="6" x2="21.5" y2="3.5" strokeWidth="2.2" />
        </svg>
      );
    case 'pin':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <path {...props} d="M12 2 C 8.7 2 6 4.7 6 8 C 6 13 12 22 12 22 C 12 22 18 13 18 8 C 18 4.7 15.3 2 12 2 Z" />
          <circle {...props} cx="12" cy="8" r="2.4" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <path {...props} d="M12 21 C 12 21 3 15 3 9 C 3 6.2 5.2 4 8 4 C 9.9 4 11.4 5 12 6.2 C 12.6 5 14.1 4 16 4 C 18.8 4 21 6.2 21 9 C 21 15 12 21 12 21 Z" />
        </svg>
      );
    case 'dumbbell':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <path {...props} d="M8 12 H 16" />
          <rect {...props} x="2" y="9.5" width="4" height="5" rx="1.4" />
          <rect {...props} x="18" y="9.5" width="4" height="5" rx="1.4" />
          <path {...props} d="M6 8.5 V 15.5 M 18 8.5 V 15.5" />
        </svg>
      );
    case 'pen':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <path {...props} d="M15.5 3 L21 8.5 L8 21.5 L2.5 21.5 L2.5 16 Z" />
          <path {...props} d="M13.5 5 L19 10.5" />
        </svg>
      );
    case 'wine':
      return (
        <svg viewBox="0 0 24 24" {...s} aria-hidden="true">
          <path {...props} d="M8 3 H 16 L 15 10 Q 14.5 14 12 14 Q 9.5 14 9 10 Z" />
          <path {...props} d="M12 14 V 20" />
          <path {...props} d="M8.5 20 H 15.5" />
        </svg>
      );
    default:
      return null;
  }
};

// ───────────────────────────────────────────────────────────────
// Photo placeholder — striped/textured, with a label.
// User can drop a real photo via image-slot later if they want.
// ───────────────────────────────────────────────────────────────

const PhotoPlaceholder = ({ tone = 'rose', shape = 'rounded', label, size = 'md' }) => {
  // tone maps to a soft color; shape controls clip
  const tones = {
    rose:   { bg: '#f7d9dc', stripe: '#eebac0', ink: '#7d4a52' },
    sage:   { bg: '#dde3d2', stripe: '#c5cfb4', ink: '#586147' },
    butter: { bg: '#f4e4c1', stripe: '#e4cf9c', ink: '#7c6535' },
    clay:   { bg: '#e8cfbb', stripe: '#d3b094', ink: '#7a5640' },
    plum:   { bg: '#d8c2cf', stripe: '#bd9eb1', ink: '#6c4d63' },
    sky:    { bg: '#cddee0', stripe: '#aac3c6', ink: '#4f6770' },
  };
  const t = tones[tone] || tones.rose;
  const dims = { sm: 56, md: 96, lg: 160, xl: 240 }[size] || 96;

  const radius =
    shape === 'circle'  ? '50%' :
    shape === 'arch'    ? `${dims / 2}px ${dims / 2}px 14px 14px` :
    shape === 'rounded' ? '14px' : '4px';

  return (
    <div
      style={{
        width: dims, height: dims, borderRadius: radius,
        background: `repeating-linear-gradient(135deg, ${t.bg} 0 8px, ${t.stripe} 8px 10px)`,
        position: 'relative', overflow: 'hidden', flex: 'none',
        boxShadow: 'inset 0 0 0 1px rgba(60, 40, 50, 0.08)',
      }}
      aria-label={label}
    >
      {label && size !== 'sm' && (
        <span style={{
          position: 'absolute', left: 8, bottom: 8,
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 0.4,
          textTransform: 'uppercase', color: t.ink, opacity: 0.8,
        }}>
          {label}
        </span>
      )}
    </div>
  );
};

// ───────────────────────────────────────────────────────────────
// Score badge — bold display number with a thin underline accent.
// No circle. Uses Fraunces SOFT/WONK at heavy weight.
// ───────────────────────────────────────────────────────────────

const ScoreBadge = ({ score, label, size = 'md', color = 'var(--ink)' }) => {
  const s = Number(score);
  const sizes = {
    xs: { num: 18, lab: 8,  gap: 1, pad: 2 },
    sm: { num: 26, lab: 9,  gap: 2, pad: 2 },
    md: { num: 34, lab: 10, gap: 3, pad: 2 },
    lg: { num: 56, lab: 11, gap: 5, pad: 4 },
    xl: { num: 84, lab: 13, gap: 7, pad: 6 },
  };
  const z = sizes[size] || sizes.md;
  const display = (score == null || isNaN(s)) ? '—' : fmtScore(s);
  // Split int / decimal so the .X is smaller
  const [intPart, decPart] = display.includes('.') ? display.split('.') : [display, null];

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: z.gap }}>
      <div style={{
        display: 'inline-flex', alignItems: 'baseline',
        fontFamily: 'var(--font-display)', color,
        fontVariationSettings: '"SOFT" 100, "WONK" 0, "opsz" 144',
        fontWeight: 600, lineHeight: 0.9, letterSpacing: -0.04 + 'em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        <span style={{ fontSize: z.num }}>{intPart}</span>
        {decPart != null && (
          <span style={{
            fontSize: z.num * 0.55, marginLeft: 1,
            color: 'var(--ink-soft)', fontWeight: 500,
          }}>.{decPart}</span>
        )}
      </div>
      {label && (
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: z.lab,
          textTransform: 'uppercase', letterSpacing: 1.4,
          color: 'var(--ink-soft)',
        }}>{label}</span>
      )}
    </div>
  );
};

// Tag chip
const Chip = ({ children, tone = 'rose' }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 9px', borderRadius: 999,
    fontFamily: 'var(--font-mono)', fontSize: 10.5,
    textTransform: 'lowercase', letterSpacing: 0.3,
    background: `var(--chip-${tone}-bg, var(--chip-rose-bg))`,
    color: `var(--chip-${tone}-ink, var(--chip-rose-ink))`,
    border: '1px solid currentColor',
    borderColor: `var(--chip-${tone}-border, var(--chip-rose-border))`,
  }}>{children}</span>
);

// Section header with hand-drawn squiggle
const SectionTitle = ({ eyebrow, title, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
    <div>
      {eyebrow && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.6,
          textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 4,
        }}>{eyebrow}</div>
      )}
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 500,
        color: 'var(--ink)', margin: 0, letterSpacing: -0.5,
      }}>{title}</h2>
      <div style={{ marginTop: 6 }}>
        <Squiggle width={64} color="var(--accent-strong)" />
      </div>
    </div>
    {action}
  </div>
);

// Soft button
const Button = ({ children, variant = 'primary', onClick, icon }) => {
  const styles = {
    primary: {
      background: 'var(--ink)', color: 'var(--paper)',
      border: '1px solid var(--ink)',
    },
    ghost: {
      background: 'transparent', color: 'var(--ink)',
      border: '1px solid var(--rule)',
    },
    accent: {
      background: 'var(--accent)', color: 'var(--ink)',
      border: '1px solid var(--accent-strong)',
    },
  };
  return (
    <button
      onClick={onClick}
      style={{
        ...styles[variant],
        padding: '10px 16px', borderRadius: 999,
        fontFamily: 'var(--font-ui)', fontSize: 13.5, fontWeight: 500,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
        transition: 'transform 120ms ease, box-shadow 120ms ease',
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = 'translateY(1px)')}
      onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {icon}
      {children}
    </button>
  );
};

// Card shell with soft, layered shadow
const Card = ({ children, style, onClick, accent }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--paper)',
      border: '1px solid var(--rule)',
      borderRadius: 18,
      padding: 18,
      cursor: onClick ? 'pointer' : 'default',
      boxShadow: '0 1px 0 rgba(120, 80, 90, 0.04), 0 8px 24px -16px rgba(120, 80, 90, 0.18)',
      transition: 'transform 160ms ease, box-shadow 160ms ease',
      position: 'relative',
      ...(style || {}),
    }}
    onMouseEnter={onClick ? (e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 1px 0 rgba(120, 80, 90, 0.04), 0 18px 32px -18px rgba(120, 80, 90, 0.24)';
    } : undefined}
    onMouseLeave={onClick ? (e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 0 rgba(120, 80, 90, 0.04), 0 8px 24px -16px rgba(120, 80, 90, 0.18)';
    } : undefined}
  >
    {accent && (
      <div style={{
        position: 'absolute', top: 14, right: 14,
        color: `var(--accent-${accent}-strong, var(--accent-strong))`,
      }}>
        <Sparkle size={12} />
      </div>
    )}
    {children}
  </div>
);

Object.assign(window, {
  Squiggle, Sparkle, DottedDivider, WavyUnderline, LeafMark, PetalMark, Glyph,
  PhotoPlaceholder, ScoreBadge, Chip, SectionTitle, Button, Card,
});

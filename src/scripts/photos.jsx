// Photo storage backed by Cloudflare R2 via /api/photos/:id
// Photos are keyed by entry id. The browser never holds a data URL —
// PhotoDisplay renders a direct /api/photos/:id URL and falls back to the
// SVG placeholder if the R2 key doesn't exist (404).

// ─── API helpers ─────────────────────────────────────────────────────────────

// Resize a File to a JPEG Blob (max 900px on longest side, 82% quality).
const resizeImage = (file, maxDim = 900) =>
  new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.82);
    };
    img.src = url;
  });

// Upload photo Blob to R2.
const savePhoto = (id, blob) =>
  fetch(`/api/photos/${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': blob.type || 'image/jpeg' },
    body: blob,
  }).catch(console.error);

// Returns the photo URL if it exists in R2, otherwise null.
// Uses HEAD — no body transferred.
const loadPhoto = (id) =>
  fetch(`/api/photos/${encodeURIComponent(id)}`, { method: 'HEAD' })
    .then((r) => r.ok ? `/api/photos/${encodeURIComponent(id)}` : null)
    .catch(() => null);

// Delete photo from R2.
const deletePhoto = (id) =>
  fetch(`/api/photos/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});

// ─── PhotoDisplay ─────────────────────────────────────────────────────────────
// Renders the R2-hosted photo or falls back to the SVG placeholder.
// Starts optimistic (assumes photo exists); onError triggers the fallback.
const PhotoDisplay = ({ entryId, tone, shape, size = 'md', label }) => {
  const [hasPhoto, setHasPhoto] = React.useState(true);
  const dims = { sm: 56, md: 96, lg: 160, xl: 240 }[size] || 96;

  if (!hasPhoto) {
    return <PhotoPlaceholder tone={tone} shape="rounded" size={size} label={label} />;
  }

  return (
    <img
      src={`/api/photos/${encodeURIComponent(entryId)}`}
      alt={label || ''}
      onError={() => setHasPhoto(false)}
      style={{
        width: dims, height: dims, borderRadius: 14,
        objectFit: 'cover', flex: 'none', display: 'block',
        boxShadow: 'inset 0 0 0 1px rgba(60, 40, 50, 0.08)',
      }}
    />
  );
};

// ─── PhotoUpload ──────────────────────────────────────────────────────────────
// Click-to-upload widget in the add/edit sheet.
// onChange(blob, previewUrl) — blob is uploaded to R2, previewUrl is a
// temporary object URL for the in-sheet preview.
const PhotoUpload = ({ preview, onChange }) => {
  const inputRef = React.useRef(null);
  const [hovering, setHovering] = React.useState(false);
  const SIZE = 96;

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        width: SIZE, height: SIZE, borderRadius: 14, flexShrink: 0,
        border: `2px dashed ${preview ? 'transparent' : 'var(--rule)'}`,
        background: preview ? 'transparent' : 'var(--paper-warm)',
        cursor: 'pointer', overflow: 'hidden', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'border-color 150ms',
      }}
    >
      {preview ? (
        <>
          <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: hovering ? 'rgba(60, 40, 50, 0.42)' : 'rgba(60, 40, 50, 0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 150ms',
          }}>
            {hovering && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: 1.2,
                textTransform: 'uppercase', color: 'white',
              }}>change</span>
            )}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', pointerEvents: 'none', padding: 8 }}>
          <div style={{ fontSize: 20, marginBottom: 4, opacity: hovering ? 0.6 : 0.3, transition: 'opacity 150ms' }}>📷</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: 1.2,
            textTransform: 'uppercase', color: 'var(--ink-soft)', opacity: 0.8,
          }}>add photo</div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            resizeImage(file).then((blob) => {
              const previewUrl = URL.createObjectURL(blob);
              onChange(blob, previewUrl);
            });
          }
          e.target.value = '';
        }}
      />
    </div>
  );
};

Object.assign(window, { savePhoto, loadPhoto, deletePhoto, resizeImage, PhotoDisplay, PhotoUpload });

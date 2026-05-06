// Photo storage (IndexedDB) + PhotoDisplay + PhotoUpload components

const DB_NAME = 'garden-photos';
const STORE_NAME = 'photos';
let _db = null;

const openPhotoDb = () => {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE_NAME);
    req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
};

const savePhoto = (id, dataUrl) =>
  openPhotoDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(dataUrl, id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  }));

const loadPhoto = (id) =>
  openPhotoDb().then((db) => new Promise((resolve) => {
    const req = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  }));

const deletePhoto = (id) =>
  openPhotoDb().then((db) => new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = resolve;
  }));

// Resize + compress to JPEG before storing so photos stay small
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
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = url;
  });

// ─── PhotoDisplay ─────────────────────────────────────────────────────────────
// Drop-in replacement for PhotoPlaceholder — shows the real photo if one has
// been saved for this entry, otherwise falls back to the striped placeholder.
const PhotoDisplay = ({ entryId, tone, shape, size = 'md', label }) => {
  const [src, setSrc] = React.useState(null);

  React.useEffect(() => {
    let live = true;
    loadPhoto(entryId).then((url) => { if (live) setSrc(url || null); });
    return () => { live = false; };
  }, [entryId]);

  const dims = { sm: 56, md: 96, lg: 160, xl: 240 }[size] || 96;
  const radius =
    shape === 'circle'  ? '50%' :
    shape === 'arch'    ? `${dims / 2}px ${dims / 2}px 14px 14px` :
    '14px';

  if (src) {
    return (
      <img
        src={src}
        alt={label || ''}
        style={{
          width: dims, height: dims, borderRadius: radius,
          objectFit: 'cover', flex: 'none', display: 'block',
          boxShadow: 'inset 0 0 0 1px rgba(60, 40, 50, 0.08)',
        }}
      />
    );
  }
  return <PhotoPlaceholder tone={tone} shape={shape} size={size} label={label} />;
};

// ─── PhotoUpload ──────────────────────────────────────────────────────────────
// Square click-to-upload widget used inside the add/edit sheet.
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
          if (file) resizeImage(file).then(onChange);
          e.target.value = '';
        }}
      />
    </div>
  );
};

Object.assign(window, { savePhoto, loadPhoto, deletePhoto, PhotoDisplay, PhotoUpload });

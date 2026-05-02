'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const REPO = 'ddinhhungg/hung-digital-garden';

// Convert ArrayBuffer to base64 safely for large files (no stack overflow)
function toBase64(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  return btoa(binary);
}

interface Article { slug: string; title: string }

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedArticle, setSelectedArticle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [resultMd, setResultMd] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load token from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('gh_token');
    if (saved) { setToken(saved); setTokenSaved(true); }
  }, []);

  // Fetch article list from GitHub when token is available
  useEffect(() => {
    if (!token) return;
    setLoadingArticles(true);
    fetch(`https://api.github.com/repos/${REPO}/contents/content/notes`, {
      headers: { Authorization: `token ${token}` },
    })
      .then(r => r.json())
      .then((files: { name: string }[]) => {
        if (!Array.isArray(files)) return;
        const list = files
          .filter(f => f.name.endsWith('.mdx'))
          .map(f => ({
            slug: f.name.replace('.mdx', ''),
            title: f.name.replace('.mdx', '').replace(/-/g, ' '),
          }));
        setArticles(list);
      })
      .catch(() => {})
      .finally(() => setLoadingArticles(false));
  }, [token]);

  const saveToken = () => {
    localStorage.setItem('gh_token', tokenInput);
    setToken(tokenInput);
    setTokenSaved(true);
  };

  const clearToken = () => {
    localStorage.removeItem('gh_token');
    setToken(''); setTokenSaved(false); setTokenInput('');
    setArticles([]);
  };

  const handleFile = (f: File) => {
    setFile(f); setStatus('idle'); setResultMd('');
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
  }, []);

  const upload = async () => {
    if (!file || !token) return;
    setStatus('uploading'); setErrorMsg('');

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const filename = `${base}-${Date.now()}.${ext}`;
    const path = `public/blog/${filename}`;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = toBase64(arrayBuffer); // safe for large files

      const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
        method: 'PUT',
        headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Add image: ${filename}`, content: base64 }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `GitHub API error ${res.status}`);
      }

      const alt = caption || base.replace(/-/g, ' ');
      const md = caption
        ? `![${alt}](/blog/${filename})\n<p className="article-img-caption">${caption}</p>`
        : `![${alt}](/blog/${filename})`;

      setResultMd(md);
      setStatus('done');
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : 'Upload thất bại');
      setStatus('error');
    }
  };

  const copyMd = () => {
    navigator.clipboard.writeText(resultMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setFile(null); setPreview(''); setCaption('');
    setStatus('idle'); setResultMd(''); setErrorMsg('');
  };

  const articleEditUrl = selectedArticle
    ? `https://github.com/${REPO}/edit/main/content/notes/${selectedArticle}.mdx`
    : `https://github.com/${REPO}/tree/main/content/notes`;

  const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(1) : '0';
  const isLarge = file && file.size > 2 * 1024 * 1024;

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--cream)', fontFamily: 'var(--mono)',
      padding: '48px 32px',
      backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, var(--cream-dk) 27px, var(--cream-dk) 28px)',
    }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            fontSize: 8, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'var(--tomato)', border: '1.5px solid var(--tomato)',
            padding: '3px 8px', borderRadius: 2, display: 'inline-block', marginBottom: 12,
          }}>admin</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 700, color: 'var(--ink)', lineHeight: 1, marginBottom: 8 }}>
            Upload Ảnh
          </h1>
          <p style={{ fontSize: 10, color: 'var(--ink-muted)', lineHeight: 1.8 }}>
            Kéo thả ảnh / GIF → tự upload lên GitHub → copy code dán vào bài viết.<br />
            Hoạt động cho <strong>tất cả bài viết</strong> — cũ lẫn mới.
          </p>
        </div>

        {/* Token */}
        <div style={{ background: 'var(--paper)', border: '1.5px solid var(--cream-dk)', borderRadius: '8px 6px 9px 7px', padding: '18px 20px', marginBottom: 24 }}>
          <div style={{ fontSize: 9, color: 'var(--ink-lt)', marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            GitHub Token {tokenSaved && <span style={{ color: 'var(--sage)' }}>✓ đã lưu</span>}
          </div>
          {tokenSaved ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 9, color: 'var(--ink-muted)' }}>{token.slice(0, 8)}···</span>
              <button onClick={clearToken} style={{ fontFamily: 'var(--mono)', fontSize: 8, cursor: 'pointer', background: 'none', border: '1px solid var(--ink-muted)', padding: '3px 8px', borderRadius: 2, color: 'var(--ink-muted)' }}>đổi token</button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 9, color: 'var(--ink-muted)', marginBottom: 8, lineHeight: 1.7 }}>
                Tạo token tại:{' '}
                <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tomato)' }}>
                  github.com/settings/tokens/new
                </a>{' '}→ tick scope <strong>repo</strong> → Generate.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="password" placeholder="ghp_xxxxxxxxxxxx"
                  value={tokenInput} onChange={e => setTokenInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveToken()}
                  style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 10, background: 'var(--cream)', border: '1.5px solid var(--cream-dk)', padding: '8px 12px', borderRadius: 4, color: 'var(--ink)', outline: 'none' }}
                />
                <button onClick={saveToken} disabled={!tokenInput} style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.1em', background: 'var(--tomato)', color: 'var(--cream)', border: 'none', padding: '8px 16px', borderRadius: 4, cursor: tokenInput ? 'pointer' : 'not-allowed', opacity: tokenInput ? 1 : 0.5 }}>lưu</button>
              </div>
            </div>
          )}
        </div>

        {/* Article selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, color: 'var(--ink-lt)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Liên kết với bài viết (tuỳ chọn)
          </div>
          <select
            value={selectedArticle} onChange={e => setSelectedArticle(e.target.value)}
            style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: 10, background: 'var(--paper)', border: '1.5px solid var(--cream-dk)', padding: '10px 12px', borderRadius: 4, color: 'var(--ink)', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">— không chọn (chỉ upload ảnh) —</option>
            {loadingArticles && <option disabled>đang tải danh sách...</option>}
            {articles.map(a => (
              <option key={a.slug} value={a.slug}>{a.slug}</option>
            ))}
          </select>
          {!tokenSaved && <div style={{ fontSize: 8, color: 'var(--ink-muted)', marginTop: 5 }}>↑ nhập token để tự tải danh sách bài viết</div>}
        </div>

        {/* Drop zone */}
        {!file ? (
          <div
            ref={dropRef}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%', height: 220,
              border: `2px dashed ${isDragging ? 'var(--tomato)' : 'var(--cream-dkr)'}`,
              borderRadius: '10px 8px 11px 9px',
              background: isDragging ? 'rgba(181,52,30,0.04)' : 'var(--paper)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', gap: 10, transition: 'all 0.2s', marginBottom: 20,
            }}
          >
            <div style={{ fontSize: 32 }}>🖼️</div>
            <div style={{ fontSize: 10, color: 'var(--ink-muted)', textAlign: 'center', lineHeight: 1.8 }}>
              Kéo thả ảnh / GIF vào đây<br />
              <span style={{ fontSize: 9, opacity: 0.7 }}>hoặc click để chọn file</span>
            </div>
            <div style={{ fontSize: 8, color: 'var(--ink-muted)', opacity: 0.5 }}>JPG · PNG · GIF · WebP</div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>
        ) : (
          <div style={{ marginBottom: 20 }}>
            {/* Preview */}
            <div style={{ width: '100%', maxHeight: 300, overflow: 'hidden', borderRadius: '10px 8px 11px 9px', border: '1.5px solid var(--cream-dk)', background: '#111', marginBottom: 10, position: 'relative' }}>
              <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', display: 'block' }} />
              <button onClick={reset} style={{ position: 'absolute', top: 8, right: 8, fontFamily: 'var(--mono)', fontSize: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 3, cursor: 'pointer' }}>✕ đổi</button>
            </div>

            <div style={{ fontSize: 9, color: 'var(--ink-muted)', marginBottom: isLarge ? 4 : 10 }}>
              {file.name} — {fileSizeMB} MB
            </div>
            {isLarge && (
              <div style={{ fontSize: 9, color: 'var(--tomato)', background: 'rgba(181,52,30,0.06)', border: '1px solid rgba(181,52,30,0.2)', borderRadius: 4, padding: '6px 10px', marginBottom: 10 }}>
                ⚠ File lớn ({fileSizeMB}MB). GIF nặng có thể làm trang chậm — nên dùng{' '}
                <a href="https://ezgif.com/optimize" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--tomato)' }}>ezgif.com/optimize</a>{' '}
                để nén trước khi upload.
              </div>
            )}

            <input
              type="text" placeholder="Chú thích ảnh (tuỳ chọn)..."
              value={caption} onChange={e => setCaption(e.target.value)}
              style={{ width: '100%', fontFamily: 'var(--hand)', fontSize: 14, background: 'var(--paper)', border: '1.5px solid var(--cream-dk)', padding: '9px 12px', borderRadius: 4, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
            />

            {status !== 'done' && (
              <button
                onClick={upload} disabled={!tokenSaved || status === 'uploading'}
                style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', background: tokenSaved ? 'var(--tomato)' : 'var(--ink-muted)', color: 'var(--cream)', border: 'none', padding: '12px', borderRadius: '7px 5px 8px 6px', cursor: tokenSaved && status !== 'uploading' ? 'pointer' : 'not-allowed', opacity: status === 'uploading' ? 0.7 : 1 }}
              >
                {status === 'uploading' ? '⏳ đang upload...' : !tokenSaved ? '⚠ nhập token trước' : '↑ upload lên GitHub'}
              </button>
            )}
            {status === 'error' && (
              <div style={{ fontSize: 9, color: 'var(--tomato)', marginTop: 8 }}>✕ Lỗi: {errorMsg}</div>
            )}
          </div>
        )}

        {/* Result */}
        {status === 'done' && (
          <div style={{ background: 'var(--paper)', border: '1.5px solid var(--sage)', borderRadius: '8px 6px 9px 7px', padding: '18px 20px' }}>
            <div style={{ fontSize: 9, color: 'var(--sage)', marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>✓ upload thành công</div>
            <div style={{ fontSize: 9, color: 'var(--ink-muted)', marginBottom: 8, lineHeight: 1.8 }}>
              Copy đoạn này, dán vào bài viết thay cho dòng <code style={{ background: 'var(--cream-dk)', padding: '1px 5px', borderRadius: 2 }}>article-img-placeholder</code>:
            </div>
            <pre style={{ background: 'var(--cream)', border: '1px solid var(--cream-dk)', borderRadius: 4, padding: '12px 14px', fontSize: 11, lineHeight: 1.6, color: 'var(--ink)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginBottom: 12 }}>{resultMd}</pre>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button onClick={copyMd} style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', background: copied ? 'var(--sage)' : 'var(--tomato)', color: 'var(--cream)', border: 'none', padding: '10px', borderRadius: '6px 4px 7px 5px', cursor: 'pointer', transition: 'background 0.2s' }}>
                {copied ? '✓ đã copy!' : '📋 copy code'}
              </button>
              {selectedArticle && (
                <a href={articleEditUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em', background: 'var(--paper)', color: 'var(--ink)', textDecoration: 'none', border: '1.5px solid var(--cream-dk)', padding: '10px', borderRadius: '6px 4px 7px 5px', textAlign: 'center', display: 'block' }}>
                  ✏ mở bài viết trên GitHub →
                </a>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={reset} style={{ fontFamily: 'var(--mono)', fontSize: 8, background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer', textDecoration: 'underline' }}>upload ảnh khác</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { getAllPosts } from '@/lib/posts';

export const metadata = { title: "Notes — Hưng's Garden" };

export default function NotesPage() {
  const posts = getAllPosts();

  return (
    <>
      <ScrollReveal />
      <Nav />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '56px 48px 80px' }}>
        <div className="reveal" style={{ marginBottom: 40 }}>
          <div className="section-stamp" style={{ marginBottom: 8 }}>notes</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, color: 'var(--ink)' }}>
            Notes & Writing
          </h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-muted)', marginTop: 10, lineHeight: 1.8 }}>
            Learning notes, reading logs, half-baked ideas worth keeping.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map((post, i) => (
            <Link key={post.slug} href={`/notes/${post.slug}`}
              className={`reveal reveal-delay-${Math.min(i + 1, 4)}`}
              style={{
                background: 'var(--paper)',
                borderRadius: '9px 7px 10px 8px / 8px 9px 7px 10px',
                border: '1.5px solid var(--cream-dk)',
                padding: '20px 22px 16px',
                display: 'flex', gap: 20, alignItems: 'flex-start',
                textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase',
                    border: '1.5px solid', padding: '2px 6px', borderRadius: 2,
                    color: post.tag === 'note' ? 'var(--tomato)' : post.tag === 'project' ? 'var(--sage)' : 'var(--ink-muted)',
                    borderColor: post.tag === 'note' ? 'var(--tomato)' : post.tag === 'project' ? 'var(--sage)' : 'var(--ink-muted)',
                  }}>{post.tag}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-muted)' }}>{post.date}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-muted)' }}>~{post.readTime}min</span>
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 8 }}>{post.title}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-lt)', lineHeight: 1.75 }}>{post.excerpt}</div>
              </div>
              <span style={{ fontFamily: 'var(--hand)', fontSize: 16, color: 'var(--tomato)', flexShrink: 0, marginTop: 4 }}>read →</span>
            </Link>
          ))}

          {posts.length === 0 && (
            <div style={{ fontFamily: 'var(--hand)', fontSize: 18, color: 'var(--ink-muted)', textAlign: 'center', padding: 60, transform: 'rotate(-0.5deg)' }}>
              The garden is being planted... come back soon 🌱
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

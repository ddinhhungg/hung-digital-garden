import TransitionLink from '@/components/TransitionLink';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { getAllPosts } from '@/lib/posts';

export const metadata = { title: "Projects — Hưng's Garden" };

export default function ProjectsPage() {
  const posts = getAllPosts().filter(p => p.tag === 'project');

  return (
    <>
      <ScrollReveal />
      <Nav />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '56px 48px 80px' }}>
        <div className="reveal" style={{ marginBottom: 40 }}>
          <div className="section-stamp" style={{ marginBottom: 8 }}>projects</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, color: 'var(--ink)', margin: '0 0 12px' }}>
            Những thứ mình đã xây
          </h1>
          <p style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-muted)', lineHeight: 1.8, margin: 0 }}>
            Dự án, thứ nghiên cứu, thứ đang làm dở — ghi lại quá trình hơn là kết quả.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map((post, i) => (
            <TransitionLink key={post.slug} href={`/notes/${post.slug}`}
              className={`notes-item reveal reveal-delay-${Math.min(i + 1, 4)}`}
              style={{
                background: 'var(--paper)',
                borderRadius: '9px 7px 10px 8px / 8px 9px 7px 10px',
                border: '1.5px solid var(--cream-dk)',
                padding: '20px 22px 16px',
                display: 'flex', gap: 20, alignItems: 'flex-start',
                textDecoration: 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase',
                    border: '1.5px solid var(--sage)', padding: '2px 6px', borderRadius: 2,
                    color: 'var(--sage)',
                  }}>project</span>
                  {post.date && <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-muted)' }}>{post.date}</span>}
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-muted)' }}>~{post.readTime}min</span>
                </div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 8 }}>{post.title}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-lt)', lineHeight: 1.75 }}>{post.excerpt}</div>
              </div>
              <span style={{ fontFamily: 'var(--hand)', fontSize: 16, color: 'var(--sage)', flexShrink: 0, marginTop: 4 }}>read →</span>
            </TransitionLink>
          ))}

          {posts.length === 0 && (
            <div style={{ fontFamily: 'var(--hand)', fontSize: 18, color: 'var(--ink-muted)', textAlign: 'center', padding: 60, transform: 'rotate(-0.5deg)' }}>
              Đang xây... quay lại sau nhé 🔨
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

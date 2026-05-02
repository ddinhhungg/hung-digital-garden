import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import BookSpine from '@/components/BookSpine';
import { getAllPosts } from '@/lib/posts';

// Drop /public/portrait.jpg để dùng ảnh thật. Để '' nếu chưa có.
const PORTRAIT_SRC = '/portrait.jpg';
// Dán YouTube video ID (phần sau v=). Để '' nếu chưa có video.
const YOUTUBE_ID = '';

export default function HomePage() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <>
      <ScrollReveal />
      <Nav />

      {/* ── HERO ── */}
      <section className="hero page-enter" style={{
        display: 'flex', minHeight: 'calc(100vh - 54px)',
        position: 'relative', overflow: 'hidden', alignItems: 'stretch',
      }}>
        {/* Left notebook page */}
        <div style={{
          flex: '0 0 44%', padding: '64px 44px 56px 56px',
          borderRight: '1px solid var(--cream-dk)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Ruled lines */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, var(--cream-dk) 27px, var(--cream-dk) 28px)',
            opacity: 0.5, pointerEvents: 'none',
          }} />
          {/* Red margin line */}
          <div style={{
            position: 'absolute', left: 70, top: 0, bottom: 0,
            width: 1, background: 'rgba(181,52,30,0.2)', pointerEvents: 'none',
          }} />

          <div className="reveal" style={{
            fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: 'var(--tomato)',
            border: '1.5px solid var(--tomato)', padding: '3px 8px', borderRadius: 2,
            display: 'inline-block', marginBottom: 16, position: 'relative', zIndex: 2, opacity: 0.9,
            width: 'fit-content',
          }}>digital garden</div>

          <h1 className="reveal reveal-delay-1" style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(64px, 7vw, 92px)',
            fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.028em',
            color: 'var(--ink)', marginBottom: 22, position: 'relative', zIndex: 2,
          }}>
            {"Hưng"}<span style={{ color: 'var(--tomato)' }}>.</span>
          </h1>

          <p className="reveal reveal-delay-2" style={{
            fontFamily: 'var(--hand)', fontSize: 24, color: 'var(--ink-lt)',
            lineHeight: 1.5, transform: 'rotate(-0.5deg)',
            marginBottom: 10, position: 'relative', zIndex: 2,
          }}>
            {'"Thinking out loud —'}<br />{'one slow idea at a time."'}
          </p>
          <p className="reveal reveal-delay-2" style={{
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)',
            letterSpacing: '0.04em', marginBottom: 32, position: 'relative', zIndex: 2,
          }}>
            {'Ghi lại để hiểu — từng chút một.'}
          </p>

          <div className="reveal reveal-delay-3" style={{
            display: 'flex', gap: 14, alignItems: 'center', position: 'relative', zIndex: 2,
          }}>
            <a href="#garden-map" style={{
              background: 'var(--tomato)', color: 'var(--cream)',
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em',
              padding: '10px 22px', border: 'none', borderRadius: '7px 5px 8px 6px',
              cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
              transition: 'all 0.2s',
            }}>explore the garden →</a>
            <Link href="/notes" style={{
              fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--ink-muted)',
              textDecoration: 'none',
            }}>or just read</Link>
          </div>
        </div>

        {/* Right page */}
        <div style={{
          flex: 1, padding: '40px 44px 40px 48px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          position: 'relative',
        }}>
          {/* Portrait */}
          <div className="reveal reveal-delay-1" style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 8px' }}>
            <div style={{ position: 'relative', width: 'fit-content' }}>
              <div className="tape" style={{ top: -10, left: '50%', transform: 'translateX(-50%) rotate(2deg)' }} />
              <div style={{
                width: 140, height: 140, background: 'var(--cream-dk)', borderRadius: '50%',
                border: PORTRAIT_SRC ? '1.5px solid var(--cream-dkr)' : '1.5px dashed var(--ink-muted)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 6, overflow: 'hidden',
              }}>
                {PORTRAIT_SRC ? (
                  <img src={PORTRAIT_SRC} alt="Hưng" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 52, fontWeight: 700, color: 'var(--ink-lt)', lineHeight: 1, opacity: 0.4 }}>H</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-muted)', letterSpacing: '0.08em', textAlign: 'center' }}>portrait<br />photo here</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Video */}
          <div className="reveal reveal-delay-2" style={{
            height: 220, width: '100%',
            background: 'linear-gradient(135deg, #2A1F1A 0%, #1C1410 55%, #2D2520 100%)',
            borderRadius: '9px 7px 10px 8px / 8px 10px 7px 9px',
            border: '1.5px solid var(--ink-lt)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, position: 'relative', overflow: 'hidden', cursor: YOUTUBE_ID ? 'default' : 'pointer',
          }}>
            {YOUTUBE_ID ? (
              <iframe
                src={`https://www.youtube.com/embed/${YOUTUBE_ID}?autoplay=1&mute=1&loop=1&playlist=${YOUTUBE_ID}&controls=0&modestbranding=1&playsinline=1&rel=0`}
                title="ambient loop"
                allow="autoplay; encrypted-media; picture-in-picture"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            ) : (
              <>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none',
                  backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
                }} />
                <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 0, height: 0, marginLeft: 4, borderTop: '9px solid transparent', borderBottom: '9px solid transparent', borderLeft: '15px solid rgba(255,255,255,0.7)' }} />
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  intro video / ambient loop
                </div>
                <div style={{ position: 'absolute', bottom: 10, right: 12, fontFamily: 'var(--hand)', fontSize: 13, color: 'rgba(255,255,255,0.22)', transform: 'rotate(-1deg)' }}>
                  embed video ↗
                </div>
              </>
            )}
          </div>

          {/* Quick nav cards */}
          <div className="reveal reveal-delay-3" style={{ display: 'flex', gap: 10 }}>
            {[
              { icon: '📓', label: 'notes', href: '/notes' },
              { icon: '🌱', label: 'projects', href: '/projects' },
              { icon: '🗺️', label: 'journey', href: '/journey' },
              { icon: '💬', label: 'thoughts', href: '/thoughts' },
            ].map(card => (
              <Link key={card.label} href={card.href} style={{
                flex: 1, background: 'var(--paper)',
                borderRadius: '8px 6px 9px 7px / 7px 8px 6px 9px',
                border: '1.5px solid var(--cream-dk)',
                padding: '10px 10px 9px',
                display: 'flex', flexDirection: 'column', gap: 3,
                textDecoration: 'none',
              }}>
                <span style={{ fontSize: 15 }}>{card.icon}</span>
                <span style={{ fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--ink-lt)' }}>{card.label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-muted)' }}>— entries</span>
              </Link>
            ))}
          </div>

          <div className="reveal reveal-delay-4" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <svg width="52" height="24" viewBox="0 0 52 24">
              <path d="M2 12 Q22 5 40 12" stroke="#B5341E" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              <path d="M35 6 L42 12 L35 18" stroke="#B5341E" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--ink-muted)', transform: 'rotate(-0.5deg)' }}>latest updates below</span>
          </div>
        </div>
      </section>

      {/* ── GARDEN MAP ── */}
      <section className="section" id="garden-map">
        <div className="section-header reveal">
          <div className="section-stamp">navigation</div>
          <h2 className="section-title">The Garden Map</h2>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { icon: '📓', title: 'Notes', sub: 'Learning notes, reading logs,\nhalf-baked ideas worth keeping.', bg: '#F7E8D0', rotate: '-1.5deg', href: '/notes' },
            { icon: '🌱', title: 'Projects', sub: 'Things I built, am building,\nor abandoned lovingly.', bg: '#E8F0E9', rotate: '1deg', href: '/projects' },
            { icon: '🗺️', title: 'Journey', sub: 'Timeline of growth, milestones,\nand turning points.', bg: '#F0E8F0', rotate: '-0.8deg', href: '/journey' },
            { icon: '💬', title: 'Thoughts', sub: 'Opinions, observations,\nand little sparks.', bg: '#F5EDDF', rotate: '1.5deg', href: '/thoughts' },
          ].map((card, i) => (
            <Link key={card.title} href={card.href}
              className={`reveal reveal-delay-${i + 1}`}
              style={{
                flex: 1, borderRadius: '10px 8px 11px 9px / 9px 11px 8px 10px',
                border: '1.5px solid rgba(70,50,30,0.13)',
                padding: '24px 20px 18px', cursor: 'pointer', position: 'relative',
                background: card.bg, transform: `rotate(${card.rotate})`,
                transition: 'transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s',
                textDecoration: 'none', display: 'block', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', width: 52, height: 18, background: 'rgba(180,155,110,0.38)', borderRadius: 2 }} />
              <span style={{ fontSize: 26, marginBottom: 10, display: 'block' }}>{card.icon}</span>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{card.title}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-lt)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{card.sub}</div>
              <span style={{ fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--tomato)', marginTop: 14, display: 'block' }}>wander in →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── RECENTLY TENDED ── */}
      <section className="section section-alt">
        <div className="section-header reveal">
          <div className="section-stamp tomato">feed</div>
          <h2 className="section-title">Recently Tended</h2>
        </div>
        <div style={{ display: 'flex', gap: 18 }}>
          {(posts.length > 0 ? posts.map(p => ({ slug: p.slug, tag: p.tag, date: p.date, title: p.title, excerpt: p.excerpt, href: `/notes/${p.slug}` }))
            : [
              { slug: '', tag: 'note' as const, date: 'Apr 28, 2026', title: 'Về việc học chậm và thích nghi với nó', excerpt: 'Không phải mọi thứ đều cần nhanh. Đôi khi học chậm lại là cách duy nhất để hiểu thật sự...', href: '/notes' },
              { slug: '', tag: 'project' as const, date: 'Apr 20, 2026', title: 'Building this garden — process notes', excerpt: 'How I went from zero technical knowledge to having a real website, with AI as my collaborator.', href: '/notes' },
              { slug: '', tag: 'thought' as const, date: 'Apr 12, 2026', title: 'Sự đơn giản không có nghĩa là dễ dàng', excerpt: 'Cái khó nhất không phải làm phức tạp — mà là biết dừng lại đúng lúc và không thêm gì thêm nữa.', href: '/notes' },
            ]
          ).map((post, i) => (
            <Link key={i} href={post.href}
              className={`reveal reveal-delay-${i + 1}`}
              style={{
                flex: 1, background: 'var(--cream)',
                borderRadius: '9px 7px 10px 8px / 8px 9px 7px 10px',
                border: '1.5px solid var(--cream-dk)',
                padding: '18px 18px 14px',
                display: 'flex', flexDirection: 'column', gap: 8,
                cursor: 'pointer', textDecoration: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase',
                  border: '1.5px solid', padding: '2px 6px', borderRadius: 2,
                  color: post.tag === 'note' ? 'var(--tomato)' : post.tag === 'project' ? 'var(--sage)' : 'var(--ink-muted)',
                  borderColor: post.tag === 'note' ? 'var(--tomato)' : post.tag === 'project' ? 'var(--sage)' : 'var(--ink-muted)',
                }}>{post.tag}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-muted)' }}>{post.date}</span>
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>{post.title}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-lt)', lineHeight: 1.75 }}>{post.excerpt}</div>
              <span style={{ fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--tomato)' }}>read more →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PROJECT SHELF ── */}
      <section className="section">
        <div className="section-header reveal">
          <div className="section-stamp">portfolio</div>
          <h2 className="section-title">Project Shelf</h2>
        </div>
        <div className="reveal">
          <div style={{
            display: 'flex', gap: 6, alignItems: 'flex-end', height: 200,
            paddingBottom: 2, borderBottom: '3px solid var(--ink-lt)', position: 'relative',
          }}>
            <div style={{ position: 'absolute', bottom: -6, left: -4, right: -4, height: 4, background: 'var(--ink-lt)', borderRadius: '0 0 2px 2px' }} />
            {[
              { title: 'Project Alpha', tool: 'React', bg: '#8B4A3A', w: 52, h: 178 },
              { title: 'Garden Exp.', tool: 'Python', bg: '#3D5A3E', w: 48, h: 152 },
              { title: 'Visual Study 01', tool: 'Figma', bg: '#6B5A3A', w: 56, h: 186 },
              { title: '— WIP —', tool: '???', bg: '#4A4A5A', w: 44, h: 132 },
              { title: 'Side Thing', tool: 'Swift', bg: '#5A3A3A', w: 50, h: 162 },
              { title: 'Open Source', tool: 'Go', bg: '#3A4A3A', w: 52, h: 170 },
            ].map((book, i) => (
              <BookSpine key={book.title} {...book} delay={i % 4 + 1} />
            ))}
            <span style={{ fontFamily: 'var(--hand)', fontSize: 18, color: 'var(--ink-muted)', alignSelf: 'center', marginLeft: 10 }}>+ more</span>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-muted)', marginTop: 14, letterSpacing: '0.05em' }}>
            ↑ hover a spine to see details · click to read
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="section section-alt" id="about">
        <div className="section-header reveal">
          <div className="section-stamp tomato">the gardener</div>
          <h2 className="section-title">About Hưng</h2>
        </div>
        <div style={{ display: 'flex', gap: 44 }}>
          <div className="reveal" style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative', width: 'fit-content' }}>
              <div className="tape" style={{ top: -10, left: '50%', transform: 'translateX(-50%) rotate(2deg)' }} />
              <div style={{
                width: 200, height: 220, background: 'var(--cream-dk)',
                borderRadius: '10px 8px 11px 9px / 9px 11px 8px 10px',
                border: PORTRAIT_SRC ? '1.5px solid var(--cream-dkr)' : '1.5px dashed var(--ink-muted)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                overflow: 'hidden',
              }}>
                {PORTRAIT_SRC ? (
                  <img src={PORTRAIT_SRC} alt="Hưng" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 64, fontWeight: 700, color: 'var(--ink-lt)', lineHeight: 1, opacity: 0.3 }}>H</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-muted)', letterSpacing: '0.08em', textAlign: 'center' }}>portrait<br />photo here</div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="reveal" style={{
              fontFamily: 'var(--hand)', fontSize: 21, color: 'var(--ink)',
              lineHeight: 1.6, transform: 'rotate(-0.4deg)',
              borderLeft: '3px solid var(--tomato)', paddingLeft: 16, marginBottom: 20,
            }}>
              {'"Mình thích biến những thứ phức tạp thành đơn giản —'}<br />
              {'trong công việc, trong suy nghĩ, và trong cách sống."'}
            </div>

            <div className="reveal reveal-delay-1" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-lt)', lineHeight: 1.9, marginBottom: 24 }}>
              Mình là người làm vận hành và quản lý dự án, thiên về tối ưu quy trình và giải quyết vấn đề thực tế.
              Mình quen làm việc với nhiều phòng ban, thích biến các vấn đề phức tạp thành quy trình rõ ràng,
              dễ triển khai và đo lường được hiệu quả.<br /><br />
              Ngoài công việc, mình thích những thứ trực quan, đơn giản nhưng có chiều sâu —
              từ cách viết, cách trình bày cho đến cách giải quyết vấn đề.
              Trang này là nơi mình ghi lại những thứ đang học, đang xây dựng, và đang suy nghĩ.
            </div>

            <div className="reveal reveal-delay-2">
              <div style={{ fontFamily: 'var(--serif)', fontSize: 12, fontWeight: 600, color: 'var(--ink-lt)', marginBottom: 10, letterSpacing: '0.04em' }}>Growth Log</div>
              {[
                { year: '2024', text: 'Bắt đầu xây dựng digital garden này', color: 'var(--tomato)' },
                { year: '2023', text: 'Placeholder milestone', color: 'var(--ink-muted)' },
                { year: '2022', text: 'Placeholder milestone', color: 'var(--ink-muted)' },
              ].map(item => (
                <div key={item.year} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 9 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, marginTop: 4, flexShrink: 0 }} />
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-lt)', lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{item.year}</span> — {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}


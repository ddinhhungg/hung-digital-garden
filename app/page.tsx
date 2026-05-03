import TransitionLink from '@/components/TransitionLink';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import BookSpine from '@/components/BookSpine';
import { getAllPosts } from '@/lib/posts';
import { hero, navCards, gardenMap, recentlyTended, projectShelf, about } from '@/content.config';

const TAG_COLORS: Record<string, string> = {
  project: '#4E8B5F',  // xanh lá tươi
  note:    '#C0622B',  // cam đất ấm
  thought: '#7B5EA7',  // tím lavender
};

export default function HomePage() {
  const allPosts = getAllPosts();
  const posts = allPosts.slice(0, 3);

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
        <div className="hero-left" style={{
          flex: '0 0 44%', padding: '64px 44px 56px 56px',
          borderRight: '1px solid var(--cream-dk)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, var(--cream-dk) 27px, var(--cream-dk) 28px)',
            opacity: 0.5, pointerEvents: 'none',
          }} />
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
          }}>{hero.badge}</div>

          <h1 className="reveal reveal-delay-1" style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(64px, 7vw, 92px)',
            fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.028em',
            color: 'var(--ink)', marginBottom: 22, position: 'relative', zIndex: 2,
          }}>
            {hero.name}<span style={{ color: 'var(--tomato)' }}>.</span>
          </h1>

          <p className="reveal reveal-delay-2" style={{
            fontFamily: 'var(--hand)', fontSize: 24, color: 'var(--ink-lt)',
            lineHeight: 1.5, transform: 'rotate(-0.5deg)',
            marginBottom: 10, position: 'relative', zIndex: 2,
          }}>
            {hero.quote[0]}<br />{hero.quote[1]}
          </p>
          <p className="reveal reveal-delay-2" style={{
            fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-muted)',
            letterSpacing: '0.04em', marginBottom: 32, position: 'relative', zIndex: 2,
          }}>
            {hero.subtitle}
          </p>

          <div className="reveal reveal-delay-3" style={{
            display: 'flex', gap: 14, alignItems: 'center', position: 'relative', zIndex: 2,
          }}>
            <a href="#garden-map" className="hero-cta" style={{
              background: 'var(--tomato)', color: 'var(--cream)',
              fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em',
              padding: '10px 22px', border: 'none', borderRadius: '7px 5px 8px 6px',
              cursor: 'pointer', textDecoration: 'none', display: 'inline-block',
            }}>{hero.ctaButton}</a>
            <TransitionLink href="/notes" className="hero-read-link" style={{
              fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--ink-muted)',
              textDecoration: 'none',
            }}>{hero.ctaSecondary}</TransitionLink>
          </div>
        </div>

        {/* Right page */}
        <div className="hero-right" style={{
          flex: 1, padding: '28px 44px 0 48px',
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Video */}
          <div className="hero-video reveal reveal-delay-1" style={{
            flex: 1, minHeight: 300, width: '100%',
            background: '#111',
            borderRadius: '10px 8px 10px 8px / 8px 10px 8px 10px',
            border: '1.5px solid var(--ink-lt)',
            position: 'relative', overflow: 'hidden',
          }}>
            <video
              autoPlay muted loop playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            >
              <source src={hero.videoSrc} type="video/mp4" />
            </video>
          </div>

          {/* Quick nav cards */}
          <div className="hero-quicknav reveal reveal-delay-2" style={{
            display: 'flex', gap: 10,
            position: 'relative', zIndex: 2,
            marginTop: -28, marginBottom: 12,
            paddingLeft: 4, paddingRight: 4,
          }}>
            {navCards.map(card => (
              <TransitionLink key={card.label} href={card.href} className="hero-nav-card" style={{
                flex: 1, background: 'var(--paper)',
                borderRadius: '8px 6px 9px 7px / 7px 8px 6px 9px',
                border: '1.5px solid var(--cream-dk)',
                padding: '10px 10px 9px',
                display: 'flex', flexDirection: 'column', gap: 3,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(28,20,16,0.10)',
              }}>
                <span style={{ fontSize: 15 }}>{card.icon}</span>
                <span style={{ fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--ink-lt)' }}>{card.label}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-muted)' }}>— entries</span>
              </TransitionLink>
            ))}
          </div>

          {/* Social links */}
          <div className="reveal reveal-delay-3" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingLeft: 4, paddingRight: 4, marginBottom: 14,
          }}>
            <span style={{ fontFamily: 'var(--hand)', fontSize: 12, color: 'var(--ink-muted)', transform: 'rotate(-0.4deg)' }}>
              {hero.socialLabel}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {hero.socials.map(s => (
                <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="social-pill-dark">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <a href="#garden-map" className="reveal reveal-delay-3" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
            textDecoration: 'none', paddingBottom: 20, opacity: 0.55,
          }}>
            <span style={{ fontFamily: 'var(--hand)', fontSize: 13, color: 'var(--ink-muted)', transform: 'rotate(-0.5deg)' }}>
              {hero.scrollHint}
            </span>
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" style={{ animation: 'arrowBounce 1.6s ease-in-out infinite' }}>
              <path d="M8 1 L8 15 M3 11 L8 16 L13 11" stroke="var(--ink-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── GARDEN MAP ── */}
      <section className="section" id="garden-map">
        <div className="section-header reveal">
          <div className="section-stamp">{gardenMap.stamp}</div>
          <h2 className="section-title">{gardenMap.title}</h2>
        </div>
        <div className="map-grid" style={{ display: 'flex', gap: 20 }}>
          {gardenMap.cards.map((card, i) => (
            <TransitionLink key={card.title} href={card.href}
              className={`map-card reveal reveal-delay-${i + 1}`}
              style={{
                flex: 1, borderRadius: '10px 8px 11px 9px / 9px 11px 8px 10px',
                border: '1.5px solid rgba(70,50,30,0.13)',
                padding: '24px 20px 18px', cursor: 'pointer', position: 'relative',
                background: ['#F7E8D0','#E8F0E9','#F0E8F0','#F5EDDF'][i],
                transform: `rotate(${['-1.5deg','1deg','-0.8deg','1.5deg'][i]})`,
                textDecoration: 'none', display: 'block', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', width: 52, height: 18, background: 'rgba(180,155,110,0.38)', borderRadius: 2 }} />
              <span style={{ fontSize: 26, marginBottom: 10, display: 'block' }}>{card.icon}</span>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{card.title}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-lt)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{card.description}</div>
              <span style={{ fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--tomato)', marginTop: 14, display: 'block' }}>wander in →</span>
            </TransitionLink>
          ))}
        </div>
      </section>

      {/* ── RECENTLY TENDED ── */}
      <section className="section section-alt">
        <div className="section-header reveal">
          <div className="section-stamp tomato">{recentlyTended.stamp}</div>
          <h2 className="section-title">{recentlyTended.title}</h2>
        </div>
        <div className="feed-grid" style={{ display: 'flex', gap: 18 }}>
          {(posts.length > 0
            ? posts.map(p => ({ tag: p.tag, date: p.date, title: p.title, excerpt: p.excerpt, href: `/notes/${p.slug}` }))
            : recentlyTended.fallbackPosts
          ).map((post, i) => (
            <TransitionLink key={i} href={post.href}
              className={`feed-card reveal reveal-delay-${i + 1}`}
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
            </TransitionLink>
          ))}
        </div>
      </section>

      {/* ── PROJECT SHELF ── */}
      <section className="section">
        <div className="section-header reveal">
          <div className="section-stamp">{projectShelf.stamp}</div>
          <h2 className="section-title">{projectShelf.title}</h2>
        </div>
        <div className="reveal">
          <div className="shelf-row" style={{
            display: 'flex', gap: 6, alignItems: 'flex-end', height: 210,
            paddingBottom: 2, borderBottom: '3px solid var(--ink-lt)', position: 'relative',
          }}>
            <div style={{ position: 'absolute', bottom: -6, left: -4, right: -4, height: 4, background: 'var(--ink-lt)', borderRadius: '0 0 2px 2px' }} />
            {allPosts.slice(0, 5).map((post, i) => (
              <BookSpine
                key={post.slug}
                title={post.title}
                tool={post.tag}
                bg={TAG_COLORS[post.tag] ?? '#5A4A3A'}
                w={46 + (i % 3) * 4}
                h={130 + (post.readTime ?? 5) * 8}
                delay={i % 4 + 1}
                href={`/notes/${post.slug}`}
              />
            ))}
            {allPosts.length > 5 && (
              <div style={{
                alignSelf: 'center',
                fontFamily: 'var(--hand)', fontSize: 16,
                color: 'var(--ink-muted)', letterSpacing: '0.02em',
                paddingLeft: 8, whiteSpace: 'nowrap',
              }}>
                +{allPosts.length - 5} more
              </div>
            )}
            {allPosts.length === 0 && (
              <span style={{ fontFamily: 'var(--hand)', fontSize: 14, color: 'var(--ink-muted)', alignSelf: 'center' }}>bài viết sẽ xuất hiện ở đây...</span>
            )}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-muted)', marginTop: 14, letterSpacing: '0.05em' }}>
            ↑ hover để xem tên · click để đọc bài — {allPosts.length} bài viết
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="section section-alt" id="about">
        <div className="section-header reveal">
          <div className="section-stamp tomato">{about.stamp}</div>
          <h2 className="section-title">{about.title}</h2>
        </div>
        <div className="about-content" style={{ display: 'flex', gap: 44 }}>
          <div className="about-portrait reveal" style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ position: 'relative', width: 'fit-content' }}>
              <div className="tape" style={{ top: -10, left: '50%', transform: 'translateX(-50%) rotate(2deg)' }} />
              <div style={{
                width: 200, height: 220, background: 'var(--cream-dk)',
                borderRadius: '10px 8px 11px 9px / 9px 11px 8px 10px',
                border: about.portraitSrc ? '1.5px solid var(--cream-dkr)' : '1.5px dashed var(--ink-muted)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                overflow: 'hidden',
              }}>
                {about.portraitSrc
                  ? <img src={about.portraitSrc} alt={about.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ fontFamily: 'var(--serif)', fontSize: 64, fontWeight: 700, color: 'var(--ink-lt)', opacity: 0.3 }}>H</div>
                }
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="reveal" style={{
              fontFamily: 'var(--hand)', fontSize: 21, color: 'var(--ink)',
              lineHeight: 1.6, transform: 'rotate(-0.4deg)',
              borderLeft: '3px solid var(--tomato)', paddingLeft: 16, marginBottom: 20,
            }}>
              {about.quote[0]}<br />{about.quote[1]}
            </div>

            <div className="reveal reveal-delay-1" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink-lt)', lineHeight: 1.9, marginBottom: 24, whiteSpace: 'pre-line' }}>
              {about.bio}
            </div>

            <div className="reveal reveal-delay-2">
              <div style={{ fontFamily: 'var(--serif)', fontSize: 12, fontWeight: 600, color: 'var(--ink-lt)', marginBottom: 10, letterSpacing: '0.04em' }}>Growth Log</div>
              {about.growthLog.map(item => (
                <div key={item.year} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 9 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.highlight ? 'var(--tomato)' : 'var(--ink-muted)', marginTop: 4, flexShrink: 0 }} />
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

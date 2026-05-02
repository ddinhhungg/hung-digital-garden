import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import JourneyMap from '@/components/JourneyMap';
import { journeyLocations } from '@/journey.config';

export const metadata = { title: "Journey — Hưng's Garden" };

export default function JourneyPage() {
  const visited  = journeyLocations.filter(l => l.status === 'visited').length;
  const wishlist = journeyLocations.filter(l => l.status === 'wishlist').length;

  return (
    <>
      <ScrollReveal />
      <Nav />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 48px 80px' }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 40 }}>
          <div className="section-stamp" style={{ marginBottom: 8 }}>journey</div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400,
            color: 'var(--ink)', margin: '0 0 12px',
          }}>
            Những nơi tôi đã đi
          </h1>
          <p style={{
            fontFamily: 'var(--mono)', fontSize: 10,
            color: 'var(--ink-muted)', lineHeight: 1.8, margin: 0,
          }}>
            {visited} điểm đã đặt chân · {wishlist} điểm đang chờ — ghi chép nhanh về những chuyến đi, trải nghiệm, và cảm nhận.
          </p>
        </div>

        {/* Map */}
        <div className="reveal">
          <JourneyMap locations={journeyLocations} />
        </div>

        {/* Location list */}
        <div style={{ marginTop: 56 }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--ink-muted)',
            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span>tất cả địa điểm</span>
            <div style={{ flex: 1, height: 1, background: 'var(--cream-dk)' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {journeyLocations.map((loc, i) => (
              <div
                key={loc.id}
                className={`reveal reveal-delay-${(i % 4) + 1}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '12px 16px',
                  borderRadius: 4,
                  borderBottom: '1px solid var(--cream-dk)',
                  transition: 'background 0.15s',
                }}
              >
                {/* Status dot */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: loc.status === 'visited' ? 'var(--tomato)' : 'transparent',
                  border: loc.status === 'wishlist' ? '1.5px dashed var(--ink-muted)' : 'none',
                }} />

                {/* Name + country */}
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontFamily: 'var(--serif)', fontSize: 14,
                    color: 'var(--ink)', fontWeight: 500,
                  }}>
                    {loc.name}
                  </span>
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 8,
                    color: 'var(--ink-muted)', marginLeft: 10,
                  }}>
                    {loc.country}
                  </span>
                </div>

                {/* Date */}
                {loc.date && (
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 8,
                    color: 'var(--ink-muted)',
                  }}>
                    {loc.date}
                  </span>
                )}

                {/* Status badge */}
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 7,
                  letterSpacing: '0.08em', padding: '2px 6px', borderRadius: 2,
                  color: loc.status === 'visited' ? 'var(--tomato)' : 'var(--ink-muted)',
                  border: `1px ${loc.status === 'wishlist' ? 'dashed' : 'solid'} currentColor`,
                }}>
                  {loc.status === 'visited' ? 'visited' : 'wishlist'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}

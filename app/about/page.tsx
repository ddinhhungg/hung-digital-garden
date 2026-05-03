import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

export const metadata = { title: "About — Hưng's Garden" };

export default function AboutPage() {
  return (
    <>
      <ScrollReveal />
      <Nav />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 48px 80px' }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 48 }}>
          <div className="section-stamp" style={{ marginBottom: 8 }}>about</div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400,
            color: 'var(--ink)', margin: '0 0 12px',
          }}>
            Dương Đình Hưng
          </h1>
          <p style={{
            fontFamily: 'var(--mono)', fontSize: 10,
            color: 'var(--ink-muted)', lineHeight: 1.8, margin: 0,
          }}>
            Đà Lạt → Sài Gòn · Kinh doanh & Công nghệ
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 48, alignItems: 'start' }}>

          {/* Main content */}
          <div className="reveal">

            {/* Intro */}
            <p style={{
              fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.9,
              color: 'var(--ink)', margin: '0 0 36px',
            }}>
              Mình là Hưng — sinh ra ở Đà Lạt, lớn lên giữa sương mù và những con dốc,
              rồi xuống Sài Gòn học và làm việc từ năm 2021. Đang là sinh viên Kinh doanh
              thương mại tại Đại học Kinh tế TP.HCM, nhưng thật ra mình quan tâm đến
              khá nhiều thứ nằm ngoài giáo trình. Thích ngồi một mình quan sát, nghĩ
              chậm về những điều đang xảy ra xung quanh — và cái digital garden này là
              chỗ mình ghi lại những suy nghĩ đó.
            </p>

            {/* Currently */}
            <div style={{ marginBottom: 32 }}>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--ink-muted)',
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span>Hiện tại</span>
                <div style={{ flex: 1, height: 1, background: 'var(--cream-dk)' }} />
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Học về AI và chuyển đổi số — không chỉ công nghệ, mà cách nó thay đổi cách người ta làm việc',
                  'Làm các dự án về marketing, thương mại điện tử và phân tích dữ liệu — vừa học vừa làm thật',
                  'Viết — không để cho ai, chủ yếu để hiểu rõ hơn những gì mình đang nghĩ',
                  'Thi thoảng đi đâu đó để nhớ ra rằng thế giới rộng hơn màn hình laptop',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--tomato)',
                      marginTop: 3, flexShrink: 0,
                    }}>·</span>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.7, color: 'var(--ink)' }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interests */}
            <div style={{ marginBottom: 40 }}>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--ink-muted)',
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span>Quan tâm đến</span>
                <div style={{ flex: 1, height: 1, background: 'var(--cream-dk)' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  'AI ứng dụng thực tế',
                  'Chuyển đổi số trong kinh doanh',
                  'Hành vi tiêu dùng Gen Z',
                  'Viết như công cụ tư duy',
                  'Du lịch chậm',
                  'Phân tích dữ liệu',
                ].map(tag => (
                  <span key={tag} style={{
                    fontFamily: 'var(--mono)', fontSize: 8,
                    padding: '4px 10px', borderRadius: 2,
                    border: '1px solid var(--cream-dkr)',
                    color: 'var(--ink-muted)', letterSpacing: '0.04em',
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Quote */}
            <p style={{
              fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15,
              color: 'var(--ink-muted)', borderLeft: '3px solid var(--cream-dkr)',
              paddingLeft: 16, margin: 0, lineHeight: 1.8,
            }}>
              Mình tin rằng sống chậm hơn một chút thường giúp nhìn thấy nhiều hơn.
            </p>
          </div>

          {/* Sidebar */}
          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Quick info */}
            <div style={{
              background: 'var(--paper)',
              border: '1.5px solid var(--cream-dk)',
              borderRadius: '9px 7px 10px 8px / 8px 9px 7px 10px',
              padding: '20px 22px',
            }}>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 14,
              }}>
                Quick info
              </div>
              {[
                ['Sinh ra tại', 'Đà Lạt, Lâm Đồng'],
                ['Hiện ở', 'TP. Hồ Chí Minh'],
                ['Học tại', 'UEH — Kinh doanh thương mại'],
                ['Năm sinh', '2003'],
              ].map(([label, value]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--ink-muted)', marginBottom: 2 }}>
                    {label}
                  </div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink)' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div style={{
              background: 'var(--paper)',
              border: '1.5px solid var(--cream-dk)',
              borderRadius: '9px 7px 10px 8px / 8px 9px 7px 10px',
              padding: '20px 22px',
            }}>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 14,
              }}>
                Liên hệ
              </div>
              <p style={{
                fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--ink-muted)',
                lineHeight: 1.8, margin: 0,
              }}>
                Nếu muốn trao đổi về AI, kinh doanh hay chỉ là nói chuyện — cứ nhắn thoải mái.
              </p>
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}

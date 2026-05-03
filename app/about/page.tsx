'use client';

import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { useState } from 'react';

export default function AboutPage() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    const subject = encodeURIComponent(`Nhắn tin từ ${name || 'bạn đọc'} — Hưng's Garden`);
    const body = encodeURIComponent(`Xin chào Hưng,\n\n${message}\n\n— ${name}`);
    window.location.href = `mailto:ddinhhungg@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <ScrollReveal />
      <Nav />
      <div className="page-body" style={{ maxWidth: 900, margin: '0 auto', padding: '56px 48px 80px' }}>

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
            Lâm Đồng → Sài Gòn · Kinh doanh & Công nghệ
          </p>
        </div>

        {/* 2-col grid — collapses on mobile via CSS */}
        <div className="about-grid">

          {/* Main content */}
          <div className="reveal">

            {/* Intro */}
            <p style={{
              fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.9,
              color: 'var(--ink)', margin: '0 0 36px',
            }}>
              Mình là Hưng — sinh ra ở Lâm Đồng, lớn lên giữa sương mù và những con dốc,
              lên thành phố Đà Lạt học cấp 3 rồi xuống Sài Gòn học và làm việc từ năm 2021.
              Đã từng là sinh viên ngành Kinh doanh thương mại tại Đại học Kinh tế TP.HCM,
              giờ thì đã ra trường và đi làm rùi. Thích ngồi một mình quan sát, nghĩ chậm
              về những điều đang xảy ra xung quanh — và cái digital garden này là chỗ mình
              ghi lại những suy nghĩ đó.
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
                  'Tò mò với các công nghệ mới (AI, Automation,...) — không chỉ công nghệ, mà cách nó thay đổi cách người ta làm việc',
                  'Làm các dự án về tối ưu, xây dựng quy trình, marketing, thương mại điện tử và phân tích dữ liệu',
                  'Viết — không để cho ai, chủ yếu để hiểu rõ hơn những gì mình đang nghĩ',
                  'Thi thoảng đi đâu đó để nhớ ra rằng thế giới rộng hơn màn hình laptop (câu này AI bịa sến nhưng thấy cũng đúng)',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--tomato)', marginTop: 3, flexShrink: 0 }}>·</span>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.7, color: 'var(--ink)' }}>{item}</span>
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
                {['AI ứng dụng thực tế', 'Chuyển đổi số trong kinh doanh', 'Hành vi tiêu dùng Gen Z', 'Viết như công cụ tư duy', 'Du lịch chậm', 'Phân tích dữ liệu'].map(tag => (
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
              paddingLeft: 16, margin: '0 0 40px', lineHeight: 1.8,
            }}>
              Mình tin rằng sống chậm hơn một chút thường giúp nhìn thấy nhiều hơn (AI cũng bịa, vẫn thấy đúng mà nó hiểu mình hơn cả mình :)))).
            </p>

            {/* Contact form */}
            <div>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'var(--ink-muted)',
                marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span>Nhắn cho mình</span>
                <div style={{ flex: 1, height: 1, background: 'var(--cream-dk)' }} />
              </div>
              <div style={{
                background: 'var(--paper)',
                border: '1.5px solid var(--cream-dk)',
                borderRadius: '9px 7px 10px 8px / 8px 9px 7px 10px',
                padding: '24px 26px',
              }}>
                <p style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--ink-muted)', margin: '0 0 20px', lineHeight: 1.8 }}>
                  Nếu muốn trao đổi về AI, kinh doanh, hay chỉ đơn giản là muốn nói chuyện — cứ nhắn thoải mái.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--ink-muted)', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tên của bạn</div>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        fontFamily: 'var(--serif)', fontSize: 14,
                        color: 'var(--ink)', background: 'var(--cream)',
                        border: '1.5px solid var(--cream-dk)',
                        borderRadius: 4, padding: '10px 14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--ink-muted)', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Tin nhắn</div>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Bạn muốn nói gì..."
                      rows={4}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        fontFamily: 'var(--serif)', fontSize: 14,
                        color: 'var(--ink)', background: 'var(--cream)',
                        border: '1.5px solid var(--cream-dk)',
                        borderRadius: 4, padding: '10px 14px',
                        outline: 'none', resize: 'vertical',
                      }}
                    />
                  </div>
                  <button
                    onClick={handleSend}
                    style={{
                      alignSelf: 'flex-start',
                      fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: 'var(--ink)', color: 'var(--cream)',
                      border: 'none', borderRadius: 4,
                      padding: '10px 20px', cursor: 'pointer',
                    }}
                  >
                    Gửi qua email →
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="reveal about-sidebar">

            {/* Quick info */}
            <div style={{
              background: 'var(--paper)',
              border: '1.5px solid var(--cream-dk)',
              borderRadius: '9px 7px 10px 8px / 8px 9px 7px 10px',
              padding: '20px 22px',
              marginBottom: 24,
            }}>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: 14,
              }}>
                Quick info
              </div>
              {[
                ['Sinh ra tại', 'Lâm Đồng'],
                ['Cấp 3', 'THPT chuyên Thăng Long, Đà Lạt'],
                ['Đại học', 'UEH — Kinh doanh thương mại'],
                ['Hiện ở', 'TP. Hồ Chí Minh'],
                ['Năm sinh', '2003 · Ma Kết ♑'],
              ].map(([label, value]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--ink-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink)' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Social links */}
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
                Tìm mình ở
              </div>
              {[
                ['Email', 'mailto:ddinhhungg@gmail.com', 'ddinhhungg@gmail.com'],
                ['Facebook', 'https://www.facebook.com/ddinhhungg', 'ddinhhungg'],
                ['Instagram', 'https://instagram.com', 'instagram'],
                ['LinkedIn', 'https://linkedin.com', 'linkedin'],
              ].map(([label, href, display]) => (
                <div key={label} style={{ marginBottom: 10 }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 7, color: 'var(--ink-muted)', marginBottom: 2 }}>{label}</div>
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--tomato)', textDecoration: 'none' }}>
                    {display}
                  </a>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}

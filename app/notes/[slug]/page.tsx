import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Nav from '@/components/Nav';
import ScrollReveal from '@/components/ScrollReveal';
import { ReadingProgress, Ruler, MarginToggle } from '@/components/ArticleClient';
import { getPostBySlug, getAllPosts, type PostMeta } from '@/lib/posts';

export async function generateStaticParams() {
  return getAllPosts().map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return { title: `${post.title} — Hưng's Garden`, description: post.excerpt };
}

const mdxComponents = {
  mark: (props: React.HTMLAttributes<HTMLElement>) => <mark {...props} />,
};

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const currentIdx = allPosts.findIndex(p => p.slug === slug);
  const nextPosts = [
    allPosts[(currentIdx + 1) % allPosts.length],
    allPosts[(currentIdx + 2) % allPosts.length],
    allPosts[(currentIdx + 3) % allPosts.length],
  ].filter(Boolean).slice(0, 3) as PostMeta[];

  return (
    <>
      <ScrollReveal />
      <ReadingProgress />
      <Ruler />
      <Nav showBack />

      <div id="article-outer">
        <div className="article-wrap page-enter">

          {/* HEADER */}
          <header className="article-header reveal">
            <div className="article-breadcrumb">
              <Link href="/">home</Link>
              <span className="breadcrumb-sep">/</span>
              <Link href="/notes">notes</Link>
              <span className="breadcrumb-sep">/</span>
              <span>{post.title_en || post.title}</span>
            </div>
            <div className="article-tag">{post.tag}</div>
            <h1 className="article-title">{post.title}</h1>
            <div className="article-meta">
              <div className="article-meta-item">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="2" y="3" width="12" height="12" rx="2"/><path d="M5 1v4M11 1v4M2 7h12"/>
                </svg>
                {post.date}
              </div>
              <div className="article-meta-item">
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/>
                </svg>
                ~{post.readTime} phút đọc
              </div>
            </div>
          </header>

          {/* BODY */}
          <article className="article-body reveal reveal-delay-1" id="article-body">
            <MDXRemote source={post.content} components={mdxComponents} />
          </article>

          {/* MARGIN NOTES */}
          <MarginToggle>
            {post.marginNotes && post.marginNotes.length > 0 ? (
              <div className="margin-col" id="margin-col">
                {post.marginNotes.map((note, i) => (
                  <div key={i} className={`margin-note${note.style === 'sage' ? ' sage' : ''}`} style={{ top: note.top }}>
                    {note.text}
                  </div>
                ))}
              </div>
            ) : (
              <div className="margin-col" id="margin-col">
                <div className="margin-note" style={{ top: 60 }}>
                  Cảm giác quen thuộc không? Mình gọi đây là "learning theater."
                </div>
                <div className="margin-note sage" style={{ top: 280 }}>
                  → Feynman Technique: giải thích như dạy cho một đứa trẻ 12 tuổi.
                </div>
                <div className="margin-note" style={{ top: 520 }}>
                  Spaced repetition apps: Anki, RemNote.
                </div>
              </div>
            )}
          </MarginToggle>

          {/* ARTICLE FOOTER */}
          <footer className="article-footer reveal">
            {post.tags && post.tags.length > 0 && (
              <div className="article-footer-tags">
                {post.tags.map(tag => (
                  <span key={tag} className="article-footer-tag">{tag}</span>
                ))}
              </div>
            )}

            {nextPosts.length > 0 && (
              <>
                <div className="next-up-title">→ tiếp theo trong vườn</div>
                <div className="next-cards">
                  {nextPosts.map((next, i) => (
                    <Link key={next.slug} href={`/notes/${next.slug}`} className="next-card" style={i === 2 ? { transform: 'rotate(0.5deg)' } : {}}>
                      <div className="next-card-tag">{next.tag}</div>
                      <div className="next-card-title">{next.title}</div>
                      <div className="next-card-link">đọc tiếp →</div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </footer>

          {/* BACK STRIP */}
          <div className="back-strip reveal">
            <Link href="/" className="back-link">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M10 3L5 8l5 5"/>
              </svg>
              ← back to the garden
            </Link>
            <div className="back-note">cảm ơn bạn đã đọc ☁</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer reveal">
      <div className="footer-logo">{"Hưng's Garden"}</div>
      <div className="footer-links">
        <a href="https://github.com/ddinhhungg" className="footer-link" target="_blank" rel="noopener noreferrer">github</a>
        <a href="https://facebook.com" className="footer-link" target="_blank" rel="noopener noreferrer">facebook</a>
        <a href="https://instagram.com" className="footer-link" target="_blank" rel="noopener noreferrer">instagram</a>
        <a href="https://linkedin.com" className="footer-link" target="_blank" rel="noopener noreferrer">linkedin</a>
        <a href="mailto:hello@example.com" className="footer-link">email</a>
        <a href="/rss.xml" className="footer-link">rss</a>
      </div>
      <div className="footer-note">drop me a note ✉</div>
    </footer>
  );
}

const FOOTER_LINKS = [
  { href: "/garage", label: "The Garage" },
  { href: "/sold", label: "Sold" },
  { href: "/whoweare", label: "Who We Are" },
  { href: "/whatwedo", label: "What We Do" },
  { href: "/contact", label: "Contact Us" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <h2>REVART</h2>
          <p className="footer-brand-sub">GARAGE</p>
          <p className="footer-tagline">
            Specialists In Luxury &amp; Performance Automobile Sales
          </p>
        </div>

        <div className="footer-locations">
          <div className="footer-location">
            <h3>RevArt Midwest</h3>
            <p>Indianapolis, IN</p>
            <p>Location details coming soon</p>
            <p>(000) 000-0000</p>
          </div>

          <div className="footer-location">
            <h3>RevArt South</h3>
            <p>Miami, FL</p>
            <p>Location coming soon</p>
            <p>(000) 000-0000</p>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer">
          <h4>Explore</h4>
          {FOOTER_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="footer-bottom">
        <p>© 2026 RevArt · Powered by Ayvaro</p>
        <p className="footer-social">Follow us: Instagram · Facebook · X</p>
      </div>
    </footer>
  );
}
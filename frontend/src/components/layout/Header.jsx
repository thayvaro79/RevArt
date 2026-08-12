import { useState } from "react";

const NAV_LINKS = [
  { href: "/garage", label: "The Garage" },
  { href: "/sold", label: "Sold" },
  { href: "/whoweare", label: "Who We Are" },
  { href: "/whatwedo", label: "What We Do" },
  { href: "/contact", label: "Contact Us" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-logo">REVART</div>

        <nav className="site-nav">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="hamburger-btn"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      <div className="site-header-divider"></div>

      <nav className={`mobile-nav ${menuOpen ? "mobile-nav-open" : ""}`}>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
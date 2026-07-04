export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="site-logo">REVART</div>

        <nav className="site-nav">
          {/* <a href="/">Home</a> */}
          <a href="/garage">The Garage</a>
          <a href="/about">Sold</a>
          <a href="/whoweare">Who We Are</a>
          <a href="/whatwedo">What We Do</a>
          <a href="/contact">Contact Us</a>
        </nav>
      </div>

      <div className="site-header-divider"></div>
    </header>
  );
}
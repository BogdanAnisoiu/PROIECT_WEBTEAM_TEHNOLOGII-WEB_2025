import './Navbar.css';
function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <div className="logo-icon">
                    {/* logo abstract svg */}
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <span className="brand-name">ProiectWeb</span>
            </div>

            <ul className="navbar-links">
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
            </ul>

            <div className="navbar-auth">
                <a href='/Autentificare' className="btn-Autentificare">Autentificare</a>
                <a href='/Inregistrare' className="btn-Inregistrare">Inregistrare</a>
            </div>
        </nav>
    );

}

export default Navbar;

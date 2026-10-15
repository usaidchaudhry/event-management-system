import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ToastContainer from './ToastContainer.jsx';

export default function Layout() {
  const { pathname } = useLocation();

  // Start each page at the top when navigating.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar />
      <main id="main" className="app-main">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

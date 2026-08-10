import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        Scout Dossier
      </Link>

      <div className="navbar__right">
        {user ? (
          <>
            <Link to="/watchlist" className="navbar__link">
              Watchlist
            </Link>
            <Link to="/my-reports" className="navbar__link">
              Moji izveštaji
            </Link>
            <span className="navbar__user">{user.username}</span>
            <button className="btn btn--outline btn--sm" onClick={handleLogout}>
              Odjava
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn--gold btn--sm">
            Prijava
          </Link>
        )}
      </div>
    </nav>
  );
}

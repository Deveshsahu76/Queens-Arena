const Navbar = ({ user, currentPage, setCurrentPage, logout }) => {
  return (
    <nav className="navbar">
      <h2>♛ Queens Arena</h2>

      <div className="nav-links">
        {user ? (
          <>
            <button
              className={currentPage === "game" ? "active-nav" : ""}
              onClick={() => setCurrentPage("game")}
            >
              Game
            </button>

            <button
              className={currentPage === "leaderboard" ? "active-nav" : ""}
              onClick={() => setCurrentPage("leaderboard")}
            >
              Leaderboard
            </button>

            <span className="user-name">Hi, {user.name}</span>

            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <button
              className={currentPage === "login" ? "active-nav" : ""}
              onClick={() => setCurrentPage("login")}
            >
              Login
            </button>

            <button
              className={currentPage === "register" ? "active-nav" : ""}
              onClick={() => setCurrentPage("register")}
            >
              Register
            </button>

            <button
              className={currentPage === "leaderboard" ? "active-nav" : ""}
              onClick={() => setCurrentPage("leaderboard")}
            >
              Leaderboard
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
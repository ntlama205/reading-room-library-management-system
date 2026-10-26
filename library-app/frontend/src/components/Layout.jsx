import { useNavigate, useLocation } from "react-router-dom";

export default function Layout({ user, pendingCount, onLogout, children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const admin = user.role === "admin";

  const tabs = [
    ["/", "Dashboard"],
    ["/books", "Books"],
    ["/transactions", "Transactions"],
    ...(admin ? [["/members", "Members"], ["/requests", "Requests"]] : []),
  ];

  return (
    <div id="appArea">
      <div className="masthead">
        <div className="title">
          The Reading Room
          <small>Community Library Ledger</small>
        </div>
        <div className="masthead-right">
          <span id="welcomeText">{user.name}</span>
          <span className={"role-badge " + (admin ? "role-admin" : "")}>
            {admin ? "ADMIN" : "MEMBER"}
          </span>
        </div>
      </div>

      <nav>
        {tabs.map(([path, label]) => (
          <button key={path} className={"tab" + (pathname === path ? " active" : "")} onClick={() => navigate(path)}>
            {label}
            {path === "/requests" && pendingCount > 0 && <span className="badge-count">{pendingCount}</span>}
          </button>
        ))}
        <span className="spacer" />
        <button className="logout-btn" onClick={() => { onLogout(); navigate("/"); }}>Log Out</button>
      </nav>

      <div className="card-surface">{children}</div>
    </div>
  );
}

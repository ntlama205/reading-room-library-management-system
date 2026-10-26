import { useState } from "react";

const digits = (v) => v.replace(/\D/g, "");

export default function Login({ pending, onLogin, refresh }) {
  const [mode, setMode] = useState("login");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loginMsg, setLoginMsg] = useState("");
  const [signupMsg, setSignupMsg] = useState({ text: "", ok: false });

  const switchMode = (m) => {
    setMode(m); setLoginMsg(""); setSignupMsg({ text: "", ok: false });
    setId(""); setPassword(""); setName("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginMsg("");
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId: id.trim(), password: password.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed.");
      onLogin(data);
    } catch (error) { setLoginMsg(error.message || "Cannot connect to MySQL."); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const n = name.trim(), i = id.trim(), p = password.trim();
    if (!n || !i || !p) { setSignupMsg({ text: "Please enter your name, a membership ID, and a password.", ok: false }); return; }
    if (!/^\\d+$/.test(i)) { setSignupMsg({ text: "Membership ID must contain digits only.", ok: false }); return; }
    try {
      const response = await fetch("http://localhost:5000/api/requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, membershipId: i, password: p })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request could not be submitted.");
      await refresh();
      setSignupMsg({ text: `Request submitted. An admin needs to approve "${i}" before you can check in.`, ok: true });
      setId(""); setPassword(""); setName("");
    } catch (error) { setSignupMsg({ text: error.message || "Could not connect to MySQL.", ok: false }); }
  };

  return (
    <section id="loginPage">
      <div className="login-card card-surface">
        <span className="stamp">OFFICIAL CATALOG</span>
        <h1>COMMUNITY LIBRARY</h1>
        <p className="sub">THE READING ROOM</p>

        <div className="toggle-row">
          <button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>Check In</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>SIGN IN</button>
        </div>

        {mode === "login" ? (
          <>
            <form onSubmit={handleLogin}>
              <input type="text" placeholder="MEMBERSHIP ID" autoComplete="off" value={id} onChange={(e) => setId(digits(e.target.value))} />
              <input type="password" placeholder="PASSWORD" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value.toUpperCase())} />
              <button type="submit">Enter</button>
            </form>
            <p className="error">{loginMsg}</p>
          </>
        ) : (
          <form onSubmit={handleSignup}>
            <input type="text" placeholder="YOUR NAME" autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="text" placeholder="CHOOSE A MEMBERSHIP ID" autoComplete="off" value={id} onChange={(e) => setId(digits(e.target.value))} />
            <input type="password" placeholder="CHOOSE A PASSWORD" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value.toUpperCase())} />
            <p className="hint-small">An admin must approve this before.</p>
            <button type="submit">Submit Request</button>
          </form>
        )}

        {mode === "signup" && (
          <p className="notice" style={{ color: signupMsg.ok ? "var(--forest-dark)" : "var(--stamp-red)" }}>{signupMsg.text}</p>
        )}
        <p className="hint">First time here? Sign in with <strong>admin</strong> to review and approve membership requests.</p>
      </div>
    </section>
  );
}

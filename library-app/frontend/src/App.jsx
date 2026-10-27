import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Transactions from "./pages/Transactions";
import Members from "./pages/Members";
import Requests from "./pages/Requests";

const API = "https://reading-room-library-management-api.onrender.com/api";
export default function App() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const refresh = async () => {
    const [br, tr, ur, rr] = await Promise.all([
      fetch(`${API}/books`), fetch(`${API}/transactions`),
      fetch(`${API}/users`), fetch(`${API}/requests`)
    ]);
    for (const response of [br, tr, ur, rr]) {
      if (!response.ok) throw new Error(`API request failed (${response.status}).`);
    }
    const [b, t, u, r] = await Promise.all([br.json(), tr.json(), ur.json(), rr.json()]);
    setBooks(b); setTransactions(t); setUsers(u); setPending(r);
  };

  useEffect(() => {
    refresh().catch(() => setLoadError("Cannot connect to MySQL. Start MySQL and the backend, then refresh this page."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="screen-border"><section className="page active"><h2>Connecting to the library database…</h2></section></div>;
  if (loadError) return <div className="screen-border"><section className="page active"><h2>Database connection required</h2><p className="error">{loadError}</p><button onClick={() => { setLoading(true); setLoadError(""); refresh().catch(() => setLoadError("Cannot connect to MySQL. Check the backend terminal and .env settings.")).finally(() => setLoading(false)); }}>Retry connection</button></section></div>;

  if (!current) return <div className="screen-border"><Login pending={pending} onLogin={setCurrent} refresh={refresh} /></div>;
  const admin = current.role === "admin";
  return <div className="screen-border">
    <Layout user={current} pendingCount={pending.length} onLogout={() => setCurrent(null)}>
      <Routes>
        <Route path="/" element={<Dashboard books={books} user={current} />} />
        <Route path="/books" element={<Books books={books} setBooks={setBooks} user={current} />} />
        <Route path="/transactions" element={<Transactions books={books} setBooks={setBooks} transactions={transactions} setTransactions={setTransactions} user={current} />} />
        {admin && <Route path="/members" element={<Members users={users} setUsers={setUsers} current={current} setCurrent={setCurrent} />} />}
        {admin && <Route path="/requests" element={<Requests pending={pending} refresh={refresh} />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  </div>;
}

import { useState } from "react";
import StatCard from "../components/StatCard";

export default function Dashboard({ books, user }) {
  const [q, setQ] = useState("");
  const admin = user.role === "admin";
  const s = q.toLowerCase();
  const list = books.filter((b) => [b.title, b.author, b.genre].some((x) => x.toLowerCase().includes(s)));
  const low = books.filter((b) => Number(b.qty) < 2).length;
  const copies = books.reduce((a, b) => a + Number(b.qty), 0);

  return (
    <section className="page active">
      <h2>Shelf Overview</h2>
      <div className={"you-are-stamp " + (admin ? "admin" : "")}>
        {admin ? "LOGGED IN AS LIBRARIAN / ADMIN" : "LOGGED IN AS COMMUNITY MEMBER"}
      </div>
      <div className="stat-row">
        <StatCard num={books.length} label="Unique Titles" />
        <StatCard num={copies} label="Total Books" />
        <StatCard num={low} label="Low Stock Titles" warn={low > 0} />
      </div>
      <p className="deck">Titles with fewer than 2 copies are stamped LOW STOCK.</p>
      <div className="search-row">
        <input type="text" placeholder="Search by title, author, or genre…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <table>
        <thead><tr>{["Title", "Author", "Genre", "ISBN", "Qty", "Status"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {list.length === 0 ? (
            <tr className="empty-row"><td colSpan={6}>No books found matching search.</td></tr>
          ) : list.map((b) => {
            const isLow = Number(b.qty) < 2;
            return (
              <tr key={b.isbn} className={isLow ? "low-stock" : ""}>
                <td>{b.title}</td><td>{b.author}</td><td>{b.genre}</td><td>{b.isbn}</td><td>{b.qty}</td>
                <td><span className={"status-pill " + (isLow ? "status-low" : "status-ok")}>{isLow ? "LOW STOCK" : "IN STOCK"}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

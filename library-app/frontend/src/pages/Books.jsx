import { useState } from "react";
import BookForm from "../components/BookForm";

export default function Books({ books, setBooks, user }) {
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const admin = user.role === "admin";
  const s = q.toLowerCase();
  const list = books.filter((b) => b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s) || b.isbn.includes(s));

  const save = async (book) => {
    try {
      const response = await fetch(editing ? `http://localhost:5000/api/books/isbn/${encodeURIComponent(editing.isbn)}` : "http://localhost:5000/api/books", {
        method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(book)
      });
      const data = response.status === 204 ? null : await response.json();
      if (!response.ok) return data?.error || "Could not save book.";
      if (editing) setBooks(books.map((b) => b.isbn === editing.isbn ? { ...book, id: data?.id || b.id } : b));
      else setBooks([...books, data]);
      setEditing(null); return "";
    } catch { return "Cannot connect to the backend. Check that the server is running."; }
  };
  const remove = async (isbn) => {
    if (!confirm("Are you sure you want to remove this book?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/books/isbn/${encodeURIComponent(isbn)}`, { method: "DELETE" });
      if (!response.ok) { const data = await response.json(); alert(data.error || "Could not delete book."); return; }
      setBooks(books.filter((b) => b.isbn !== isbn));
    } catch { alert("Cannot connect to the backend."); }
  };

  return (
    <section className="page active">
      <h2>Book Management</h2>
      <p className="deck">Catalog a new title, or update one already on the shelf.</p>
      {admin && <BookForm editing={editing} onSave={save} />}
      <div className="search-row">
        <input type="text" placeholder="Search by title, author, or ISBN…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <table>
        <thead><tr>{["Title", "Author", "Genre", "ISBN", "Qty", "Actions"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {list.length === 0 ? (
            <tr className="empty-row"><td colSpan={6}>No books cataloged.</td></tr>
          ) : list.map((b) => (
            <tr key={b.isbn}>
              <td>{b.title}</td><td>{b.author}</td><td>{b.genre}</td><td>{b.isbn}</td><td>{b.qty}</td>
              <td>
                {admin ? (
                  <>
                    <button onClick={() => setEditing(b)}>Edit</button>
                    <button className="danger" onClick={() => remove(b.isbn)}>Delete</button>
                  </>
                ) : "View Only"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

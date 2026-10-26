import { useState } from "react";
import Field from "../components/Field";

export default function Transactions({ books, setBooks, transactions, setTransactions, user }) {
  const [isbn, setIsbn] = useState("");
  const [type, setType] = useState("add");
  const [qty, setQty] = useState("");
  const [msg, setMsg] = useState("");
  const admin = user.role === "admin";
  const selected = isbn || books[0]?.isbn || "";

  const submit = async (e) => {
    e.preventDefault();
    const amount = Number(qty), book = books.find((b) => b.isbn === selected);
    if (!book) return setMsg("Selected book not found.");
    if (!Number.isInteger(amount) || amount < 1) return setMsg("Enter a positive whole quantity.");
    if (type === "deduct" && book.qty < amount) return setMsg(`Insufficient stock! Only ${book.qty} available.`);
    try {
      const response = await fetch("http://localhost:5000/api/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isbn: selected, type, qty: amount }) });
      const data = await response.json();
      if (!response.ok) return setMsg(data.error || "Could not save transaction.");
      setBooks(books.map((b) => b.isbn === selected ? { ...b, qty: data.remaining } : b));
      setTransactions([data, ...transactions]); setMsg(""); setQty("");
    } catch { setMsg("Cannot connect to the backend. Transaction was not saved."); }
  };

  return (
    <section className="page active">
      <h2>Transactions</h2>
      <p className="deck">Record books arriving or being borrowed. History is kept below.</p>
      {admin && (
        <form className="entry-form" onSubmit={submit}>
          <div className="full">
            <label htmlFor="transIsbn">Book</label>
            <select id="transIsbn" required value={selected} onChange={(e) => setIsbn(e.target.value)}>
              {books.map((b) => <option key={b.isbn} value={b.isbn}>{b.title} ({b.isbn}) — Current Qty: {b.qty}</option>)}
            </select>
          </div>
          <Field id="transType" label="Type">
            <select id="transType" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="add">Add Stock (arrived)</option>
              <option value="deduct">Deduct Stock (borrowed)</option>
            </select>
          </Field>
          <Field id="transQty" label="Quantity">
            <input id="transQty" type="number" min="1" required value={qty} onChange={(e) => setQty(e.target.value)} />
          </Field>
          <button type="submit">Save Transaction</button>
        </form>
      )}
      <p className="error">{msg}</p>

      <h2 style={{ marginTop: 24 }}>Transaction History</h2>
      <table>
        <thead><tr>{["Date / Time", "Book", "Type", "Qty"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr className="empty-row"><td colSpan={4}>No transaction records found.</td></tr>
          ) : transactions.map((t, i) => (
            <tr key={i}><td>{t.date}</td><td>{t.title}</td><td>{t.type}</td><td>{t.qty}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

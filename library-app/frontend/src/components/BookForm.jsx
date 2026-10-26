import { useState, useEffect } from "react";
import Field from "./Field";

const blank = { title: "", author: "", genre: "", isbn: "", qty: "" };

// onSave(book) returns an error message, or "" when it worked
export default function BookForm({ editing, onSave }) {
  const [f, setF] = useState(blank);
  const [err, setErr] = useState("");

  useEffect(() => { setF(editing ? { ...editing, qty: String(editing.qty) } : blank); setErr(""); }, [editing]);

  const set = (k) => (e) => setF({ ...f, [k]: k === "isbn" ? e.target.value.replace(/\D/g, "") : e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const msg = onSave({ title: f.title.trim(), author: f.author.trim(), genre: f.genre.trim(), isbn: f.isbn.trim(), qty: parseInt(f.qty, 10) });
    setErr(msg);
    if (!msg) setF(blank);
  };

  return (
    <form className="entry-form" onSubmit={submit}>
      <Field id="bookTitle" label="Title"><input id="bookTitle" required value={f.title} onChange={set("title")} /></Field>
      <Field id="bookAuthor" label="Author"><input id="bookAuthor" required value={f.author} onChange={set("author")} /></Field>
      <Field id="bookGenre" label="Genre"><input id="bookGenre" required value={f.genre} onChange={set("genre")} /></Field>
      <Field id="bookIsbn" label="ISBN"><input id="bookIsbn" required inputMode="numeric" value={f.isbn} onChange={set("isbn")} /></Field>
      <Field id="bookQty" label="Quantity"><input id="bookQty" type="number" min="0" required value={f.qty} onChange={set("qty")} /></Field>
      <p className="field-error">{err}</p>
      <button type="submit">{editing ? "Update Book" : "Add Book"}</button>
    </form>
  );
}

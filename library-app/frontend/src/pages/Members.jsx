import { useState } from "react";
import UserForm from "../components/UserForm";

export default function Members({ users, setUsers, current, setCurrent }) {
  const [editing, setEditing] = useState(null);

  const save = async (u) => {
    if (!/^\\d+$/.test(u.membershipId)) return "Membership ID must contain digits only.";
    try {
      const response = await fetch(editing ? `http://localhost:5000/api/users/membership/${encodeURIComponent(editing.membershipId)}` : "http://localhost:5000/api/users", {
        method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(u)
      });
      const data = await response.json();
      if (!response.ok) return data.error || "Could not save user.";
      const saved = { ...u, id: data.id || editing?.id };
      if (editing) { setUsers(users.map((x) => x.membershipId === editing.membershipId ? saved : x)); if (current.membershipId === editing.membershipId) setCurrent(saved); }
      else setUsers([...users, data]);
      setEditing(null); return "";
    } catch { return "Cannot connect to the backend."; }
  };
  const remove = async (id) => {
    if (current.membershipId === id) return alert("You cannot delete your own account while logged in!");
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/membership/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) { const data = await response.json(); alert(data.error || "Could not delete user."); return; }
      setUsers(users.filter((u) => u.membershipId !== id));
    } catch { alert("Cannot connect to the backend."); }
  };

  return (
    <section className="page active">
      <h2>Member Directory</h2>
      <p className="deck">Everyone here has already been approved. Add staff directly, or update details.</p>
      <UserForm editing={editing} onSave={save} />
      <table>
        <thead><tr>{["Name", "Membership ID", "Role", "Actions"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.membershipId}>
              <td>{u.name}</td><td>{u.membershipId}</td>
              <td><span className={"status-pill " + (u.role === "admin" ? "status-admin" : "status-member")}>{u.role === "admin" ? "ADMIN" : "MEMBER"}</span></td>
              <td>
                <button onClick={() => setEditing(u)}>Edit</button>
                <button className="danger" onClick={() => remove(u.membershipId)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function Requests({ pending, refresh }) {
  const act = async (r, action) => {
    if (action === "reject" && !confirm("Reject this membership request?")) return;
    try {
      const response = await fetch(action === "approve" ? `http://localhost:5000/api/requests/${r.id}/approve` : `http://localhost:5000/api/requests/${r.id}`, {
        method: action === "approve" ? "POST" : "DELETE"
      });
      if (!response.ok) { const data = await response.json(); alert(data.error || "Action failed."); return; }
      await refresh();
    } catch { alert("Cannot connect to the backend."); }
  };
  return <section className="page active">
    <h2>Membership Requests</h2>
    <p className="deck">Approve a request to turn it into a member account, or reject it to remove it.</p>
    <table><thead><tr>{["Name", "Requested ID", "Submitted", "Actions"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
      <tbody>{pending.length === 0 ? <tr className="empty-row"><td colSpan={4}>No pending membership requests.</td></tr> : pending.map((r) => <tr key={r.id}>
        <td>{r.name}</td><td>{r.membershipId}</td><td>{r.dateRequested}</td>
        <td><button className="approve" onClick={() => act(r, "approve")}>Approve</button><button className="danger" onClick={() => act(r, "reject")}>Reject</button></td>
      </tr>)}</tbody>
    </table>
  </section>;
}

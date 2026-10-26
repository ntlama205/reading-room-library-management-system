export default function StatCard({ num, label, warn }) {
  return (
    <div className={"stat-card" + (warn ? " warn" : "")}>
      <div className="stat-num">{num}</div>
      <span className="stat-label">{label}</span>
    </div>
  );
}

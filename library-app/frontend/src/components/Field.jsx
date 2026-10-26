// Label + input pair used in the entry forms
export default function Field({ id, label, children }) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

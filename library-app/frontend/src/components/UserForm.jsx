import { useState, useEffect } from "react";
import Field from "./Field";

const blank = { name: "", membershipId: "", password: "", role: "member" };

export default function UserForm({ editing, onSave }) {
  const [f, setF] = useState(blank);
  const [err, setErr] = useState("");

  useEffect(() => { setF(editing ? { ...editing, password: "" } : blank); setErr(""); }, [editing]);

  const set = (k) => (e) => {
    let v = e.target.value;
    if (k === "membershipId") v = v.replace(/\D/g, "");
    if (k === "password") v = v.toUpperCase();
    setF({ ...f, [k]: v });
  };

  const submit = (e) => {
    e.preventDefault();
    const msg = onSave({ ...f, name: f.name.trim(), membershipId: f.membershipId.trim(), password: f.password.trim() });
    setErr(msg);
    if (!msg) setF(blank);
  };

  return (
    <form className="entry-form" onSubmit={submit}>
      <Field id="userName" label="Name"><input id="userName" required value={f.name} onChange={set("name")} /></Field>
      <Field id="userMembershipId" label="Membership ID"><input id="userMembershipId" required inputMode="numeric" value={f.membershipId} onChange={set("membershipId")} /></Field>
      <Field id="userPassword" label="Password"><input id="userPassword" type="password" placeholder="Leave blank to keep current" value={f.password} onChange={set("password")} /></Field>
      <Field id="userRole" label="Role">
        <select id="userRole" value={f.role} onChange={set("role")}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
      </Field>
      <p className="field-error">{err}</p>
      <button type="submit">{editing ? "Update Member" : "Add Member"}</button>
    </form>
  );
}

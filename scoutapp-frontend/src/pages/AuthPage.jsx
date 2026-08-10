import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const result =
        mode === "login"
          ? await api.login({ email: form.email, password: form.password })
          : await api.register(form);

      login(result.user, result.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page page--narrow">
      <p className="page__eyebrow">Scout Dossier</p>
      <h1 className="page__title">{mode === "login" ? "Prijava" : "Registracija"}</h1>

      <div className="auth-toggle">
        <button
          className={`auth-toggle__btn ${mode === "login" ? "auth-toggle__btn--active" : ""}`}
          onClick={() => setMode("login")}
          type="button"
        >
          Prijava
        </button>
        <button
          className={`auth-toggle__btn ${mode === "register" ? "auth-toggle__btn--active" : ""}`}
          onClick={() => setMode("register")}
          type="button"
        >
          Registracija
        </button>
      </div>

      <form className="add-form" onSubmit={handleSubmit}>
        {mode === "register" && (
          <label>
            Korisničko ime
            <input
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Lozinka
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn--gold" disabled={saving}>
          {saving ? "Sačekaj..." : mode === "login" ? "Prijavi se" : "Registruj se"}
        </button>
      </form>
    </div>
  );
}

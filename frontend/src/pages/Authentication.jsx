import * as React from "react";
import { AuthContext } from "../context/AuthContext";
import styles from "../styles/AuthStyle.module.css";

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0);
  const [focused, setFocused] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const switchTab = (idx) => {
    setFormState(idx);
    setError("");
    setMessage("");
  };
  const fillDemo = () => {
    setUsername("demoUser");
    setPassword("demouser21604");
  };
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (formState === 0) {
        await handleLogin(username, password);
        setMessage("Welcome back! Taking you in…");
      } else {
        const result = await handleRegister(name, username, password);
        setMessage(result);
        setTimeout(() => switchTab(0), 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  const inputClass = (field) =>
    `${styles.input} ${focused === field ? styles.inputFocused : ""}`;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            Mind<span className={styles.brandLogoAccent}>Space</span>.
          </div>
          <div className={styles.brandSub}>Your focused study space</div>
        </div>

        <div className={styles.tabs}>
          {["Sign in", "Sign up"].map((label, idx) => (
            <button
              key={label}
              className={`${styles.tab} ${formState === idx ? styles.tabActive : ""}`}
              onClick={() => switchTab(idx)}
            >
              {label}
            </button>
          ))}
        </div>

        {formState === 0 && (
          <button className={styles.demoBtn} onClick={fillDemo}>
            Use DEMO credentials
          </button>
        )}

        {error && <div className={styles.alertError}>{error}</div>}
        {message && <div className={styles.alertSuccess}>{message}</div>}

        <form className={styles.form} onSubmit={handleAuth} noValidate>
          {formState === 1 && (
            <div className={styles.fieldWrap}>
              <label className={styles.fieldLabel}>Full Name</label>
              <input
                className={inputClass("name")}
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused("")}
              />
            </div>
          )}

          <div className={styles.fieldWrap}>
            <label className={styles.fieldLabel}>Username</label>
            <input
              className={inputClass("username")}
              type="text"
              placeholder="your_username"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocused("username")}
              onBlur={() => setFocused("")}
            />
          </div>

          <div className={styles.fieldWrap}>
            <label className={styles.fieldLabel}>Password</label>
            <input
              className={inputClass("password")}
              type="password"
              placeholder="••••••••"
              autoComplete={
                formState === 0 ? "current-password" : "new-password"
              }
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused("")}
            />
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading
              ? "Please wait…"
              : formState === 0
                ? "Sign in →"
                : "Create account →"}
          </button>
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>
            {formState === 0 ? "new here?" : "already a member?"}
          </span>
          <div className={styles.dividerLine} />
        </div>

        <div className={styles.switchWrap}>
          <button
            className={styles.switchBtn}
            onClick={() => switchTab(formState === 0 ? 1 : 0)}
          >
            {formState === 0 ? "Create a free account" : "Sign in instead"}
          </button>
        </div>
      </div>
    </div>
  );
}

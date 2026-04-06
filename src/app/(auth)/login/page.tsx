import styles from './page.module.css'

export default function LoginPage() {
  return (
    <div className={styles.container}>
      {/* Background decoration */}
      <div className={styles.bgDecor}>
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
        <div className={styles.bgCircle3} />
      </div>

      {/* Login Card */}
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>🏫</div>
          <h1 className={styles.title}>SISPRO</h1>
          <p className={styles.subtitle}>Sistem Informasi Sekolah Profesional</p>
        </div>

        <form className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder="Masukkan username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Kata Sandi
            </label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="Masukkan kata sandi"
              autoComplete="current-password"
            />
          </div>

          <div className={styles.options}>
            <label className={styles.remember}>
              <input type="checkbox" />
              <span>Ingat saya</span>
            </label>
            <a href="#" className={styles.forgot}>Lupa kata sandi?</a>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Masuk
          </button>
        </form>

        <div className={styles.footer}>
          <p>&copy; 2026 SISPRO. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

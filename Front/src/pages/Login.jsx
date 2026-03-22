import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const words = [
  { text: "Productividad", font: "'Roboto', sans-serif" },
  { text: "Recompensas", font: "'Montserrat', sans-serif" },
  { text: "Motivación", font: "'Pacifico', cursive" },
  { text: "Equipos", font: "'Oswald', sans-serif" },
  { text: "SMART Goals", font: "'Bebas Neue', cursive" },
  { text: "Colaboración", font: "'Lobster', cursive" },
  { text: "Éxito", font: "'Playfair Display', serif" }
]

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/app/dashboard'

  // Animación de palabras
  const [wordIdx, setWordIdx] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => {
      setWordIdx(idx => (idx + 1) % words.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('trp_saved_email')
    if (saved) setEmail(saved)
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Completa todos los campos'); return }
    try {
      setLoading(true)
      await login(email, password)
      if (remember) localStorage.setItem('trp_saved_email', email)
      else localStorage.removeItem('trp_saved_email')
      navigate(from, { replace: true })
      window.location.reload() // <-- fuerza recarga tras login
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    const { value: formValues } = await import('sweetalert2').then(module => module.default.fire({
      title: 'Recuperar Contraseña',
      html: `
        <p style="font-size: 14px; opacity: 0.8; margin-bottom: 16px;">Ingresa tu correo y la nueva contraseña que deseas usar.</p>
        <input id="rec-email" type="email" class="swal2-input" placeholder="tucorreo@empresa.com" style="width: 80%">
        <input id="rec-pass" type="password" class="swal2-input" placeholder="Nueva contraseña (min 6)" style="width: 80%">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Cambiar Contraseña',
      cancelButtonText: 'Cancelar',
      background: '#1E1E2F',
      color: '#FFFFFF',
      confirmButtonColor: '#00C896',
      cancelButtonColor: '#E53E3E',
      preConfirm: () => {
        const emailBox = document.getElementById('rec-email').value.trim();
        const passBox = document.getElementById('rec-pass').value.trim();
        if (!emailBox || passBox.length < 6) {
          import('sweetalert2').then(module => module.default.showValidationMessage('Revisa tu correo y asegúrate que la contraseña tenga al menos 6 caracteres'));
          return false;
        }
        return { email: emailBox, newPassword: passBox };
      }
    }));

    if (formValues) {
      try {
        const api = await import('../services/api.js');
        await api.resetPassword(formValues.email, formValues.newPassword);
        import('sweetalert2').then(module => module.default.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: 'Ya puedes iniciar sesión con tu nueva contraseña.',
          background: '#1E1E2F',
          color: '#FFFFFF',
          confirmButtonColor: '#00C896'
        }));
      } catch (err) {
        import('sweetalert2').then(module => module.default.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'No se pudo cambiar la contraseña',
          background: '#1E1E2F',
          color: '#FFFFFF',
          confirmButtonColor: '#E53E3E'
        }));
      }
    }
  }

  return (
    <div className="login-layout">
      <div className="login-left">
        <div className="transicion-palabras">
          <h2
            style={{
              fontFamily: words[wordIdx].font,
              transition: 'font-family 0.5s, opacity 0.5s'
            }}
            key={words[wordIdx].text}
          >
            {words[wordIdx].text}
          </h2>
        </div>
      </div>
      <div className="login-right">
        <div className="auth-card card">
          <div className="auth-header">
            <h1 className="auth-title">UrewardGo</h1>
            <p className="auth-subtitle">Aumenta la productividad con recompensas SMART</p>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            <label>Correo electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ejemplo@empresa.com" autoComplete="email" />

            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="********" autoComplete="current-password" />

            {error && <div className="error">{error}</div>}

            <div className="row auth-row">
              <label className="remember">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                <span>Recordarme</span>
              </label>
              <Link to="/register" className="link">¿No tienes cuenta?</Link>
            </div>

            <div className="row auth-row" style={{ marginTop: -10, justifyContent: 'center' }}>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#63b3ed', textDecoration: 'underline', cursor: 'pointer', fontSize: 13 }}
                onClick={handleForgotPassword}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button className="btn auth-btn" disabled={loading}>
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </button>

            <button
              type="button"
              className="btn outline auth-btn"
              onClick={async () => {
                try {
                  setLoading(true)
                  const demoEmail = 'demo@taskreward.pro'
                  const demoPass = 'password123'
                  try { await login(demoEmail, demoPass) }
                  catch {
                    const api = await import('../services/api.js')
                    try { await api.register({ name: 'Usuario Demo', email: demoEmail, password: demoPass }) } catch { }
                    await login(demoEmail, demoPass)
                  }
                  navigate('/app/dashboard', { replace: true })
                } catch { setError('No se pudo entrar en modo demo') }
                finally { setLoading(false) }
              }}
            >
              Entrar como demo
            </button>

            <p className="hint">Demo – Contraseña para todos los usuarios: <code>password123</code></p>
          </form>
        </div>
      </div>
    </div>
  )
}


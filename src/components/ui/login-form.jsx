import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function LoginForm({ className, ...props }) {
  return (
    <form className="login-form">

      <div className="fiel-group">
        <label htmlFor="cpf" className="field-label">CPF</label>
        <input
          id="cpf"
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={handleCpfChange}
          className="field-input"
        // autoComplete="username"
        />
      </div>

      <div className="fiel-group">
        <div className="fiel-label-row">
          <label htmlFor="Senha" className="fiel-label">Senha</label>
          <a href="#" className="forgot-link">Esqueceu a senha?</a>
        </div>
        <div className="password-wrapper">
          <input
            id="password"
            type="text"
            inputMode="text"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field-input password-input"
          // autoComplete="current-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {/* {showPassword ? (<EyeOffIcon />) : (<EyeIcon />)} */}
          </button>
        </div>
      </div>

      <button type="button" className="btn-entrar" onClick={handleSubmit}>
        Entrar
      </button>
    </form>
  )
}

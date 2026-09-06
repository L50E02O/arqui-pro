import { useState, type FormEvent } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import "../../styles/auth/login/FormularioLogin.css";

type Props = {
    onSubmit: (email: string, password: string) => void;
};

export default function FormularioLogin({onSubmit}: Props){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Comentado para quitar el boton de recordar
    // const [remember, setRemember] = useState(false);

    // Para mostrar y ocultar la contraseña
    const [ showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSubmit(email, password);
    }
    
    const togglePasswordVisibility = ()=>{
        setShowPassword(!showPassword)
    }

    return (
        <div className="flc-login-card"> {/* Contenedor principal para la tarjeta */}
            <div className="flc-logo-section">
                <span className="flc-logo-color-box"></span>
                <span className="flc-logo-text">ArquiPro</span>
            </div>
            
            <h1 className="flc-welcome-title">Bienvenido</h1>
            <p className="flc-subtitle">Inicia sesión para continuar</p>

            <form onSubmit={handleSubmit} className="flc-login-form">
                
                {/* Campo de Correo Electrónico */}
                <div className="flc-input-group">
                    <label htmlFor="email" className="flc-input-label">Correo electrónico</label>
                    <div className="flc-input-with-icon">
                        {/* Icono de Usuario (User) - se agrega al lado derecho */}
                        <User className="flc-input-start-icon" size={20} color="#adb5bd"/>
                        <input 
                            className="flc-form-input"
                            type="email"
                            id="email"
                            placeholder="Introduce tu correo"
                            value={email}
                            onChange={(e)=> setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
                
                {/* Campo de Contraseña */}
                <div className="flc-input-group">
                    <div className="flc-password-header">
                        <label htmlFor="password" className="flc-input-label">Contraseña</label>
                        <a href="/forgot-password" className="flc-forgot-password-link">¿Olvidaste tu contraseña?</a>
                    </div>
                    <div className="flc-input-with-icon">
                        <Lock className="flc-input-start-icon" size={20} color="#adb5bd"></Lock>
                        <input 
                            className="flc-form-input"
                            // Alterna el tipo entre 'password' y 'text'
                            type={showPassword ? "text" : "password"} 
                            id="password"
                            placeholder="Introduce tu contraseña"
                            value={password}
                            onChange={(e)=> setPassword(e.target.value)}
                            required
                        />
                        {/* Icono de Ojo (Eye/EyeOff) para alternar visibilidad */}
                        {showPassword ? (
                            <EyeOff 
                                className="flc-password-toggle-icon" 
                                size={20} 
                                color="#adb5bd" 
                                onClick={togglePasswordVisibility}
                            />
                        ) : (
                            <Eye 
                                className="flc-password-toggle-icon" 
                                size={20} 
                                color="#adb5bd" 
                                onClick={togglePasswordVisibility}
                            />
                        )}
                        
                        {/* Opcional: Icono de candado (Lock) si deseas que aparezca también */}
                        {/* <Lock className="flc-input-start-icon" size={20} color="#adb5bd"/> */} 
                    </div>
                </div>

                {/* Botón de Login */}
                <button type="submit" className="flc-login-button">Iniciar sesión</button>
            </form>
            
            {/* Sección de Sign Up */}
            <p className="flc-signup-text">
                ¿No tienes una cuenta? <a href="/registro-cliente" className="flc-signup-link">Regístrate</a>
            </p>
        </div>
    );
}
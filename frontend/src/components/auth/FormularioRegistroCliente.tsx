import React, { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, User, Mail, Smartphone, CornerDownRight } from "lucide-react";
import type { RegistroUsuarioInput } from "../../types/usuario.types";
import "../../styles/auth/registro/FormularioRegistroCliente.css"; 

// Definimos los tipos de datos locales para el formulario
interface ClienteFormData {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    cedula: string;
}

interface Props {
    onSubmit: (data: RegistroUsuarioInput) => void;
    onRegisterAsArquitecto: () => void;
}

export default function FormularioRegistroClientes({ onSubmit, onRegisterAsArquitecto}: Props) {
    const [formData, setFormData] = useState<ClienteFormData>({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        passwordConfirmation: "",
        cedula: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
        // Limpiar el error al escribir
        if (error) setError(null);
    };

    const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        // 1. Limitar a solo números
        value = value.replace(/[^0-9]/g, ''); 
        // 2. Limitar a 10 dígitos
        if (value.length > 10) value = value.substring(0, 10);

        setFormData(prev => ({
            ...prev,
            cedula: value
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        const { nombre, apellido, email, password, passwordConfirmation, cedula } = formData;

        // --- Validaciones ---
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 dígitos.");
            return;
        }

        if (password !== passwordConfirmation) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        
        if (cedula.length !== 10) {
            setError("La cédula debe contener exactamente 10 dígitos.");
            return;
        }

        // --- Preparar datos para la API ---
        const dataToSend: RegistroUsuarioInput = {
            nombre,
            apellido,
            email,
            password,
            password_confirmation: passwordConfirmation,
            rol: 'cliente',
            cliente_attributes: {
                cedula,
            }
        };

        onSubmit(dataToSend);
    };

    return (
        <div className="frcc-register-card">
            {/* Logo Section */}
            <div className="frcc-logo-section">
                <div className="frcc-logo-color-box"></div>
                <span className="frcc-logo-text">ArquiPro</span>
            </div>

            {/* Títulos */}
            <h1 className="frcc-welcome-title">Crea tu cuenta de cliente</h1>
            <p className="frcc-subtitle">Regístrate para empezar a ver portafolios y conectar con profesionales.</p>

            {error && <div className="frcc-validation-error">{error}</div>}

            <form className="frcc-register-form" onSubmit={handleSubmit}>
                
                {/* Nombre y Apellido (Fila) */}
                <div className="frcc-input-row">
                    <div className="frcc-input-group">
                        <label htmlFor="nombre" className="frcc-input-label">Nombre</label>
                        <div className="frcc-input-with-icon">
                            <User className="frcc-input-start-icon" size={20} color="#adb5bd"/>
                            <input
                                className="frcc-form-input"
                                type="text"
                                id="nombre"
                                placeholder="Introduce tu nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="frcc-input-group">
                        <label htmlFor="apellido" className="frcc-input-label">Apellido</label>
                        <div className="frcc-input-with-icon">
                            <User className="frcc-input-start-icon" size={20} color="#adb5bd"/>
                            <input
                                className="frcc-form-input"
                                type="text"
                                id="apellido"
                                placeholder="Introduce tu apellido"
                                value={formData.apellido}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Email */}
                <div className="frcc-input-group">
                    <label htmlFor="email" className="frcc-input-label">Correo electrónico</label>
                    <div className="frcc-input-with-icon">
                        <Mail className="frcc-input-start-icon" size={20} color="#adb5bd"/>
                        <input 
                            className="frcc-form-input"
                            type="email"
                            id="email"
                            placeholder="Introduce tu correo electrónico"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Contraseña */}
                <div className="frcc-input-group">
                    <label htmlFor="password" className="frcc-input-label">Contraseña</label>
                    <div className="frcc-input-with-icon">
                        <Lock className="frcc-input-start-icon" size={20} color="#adb5bd"/>
                        <input
                            className="frcc-form-input"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Crea una contraseña"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6} // Validación HTML mínima
                        />
                        <button
                            type="button"
                            className="frcc-password-toggle-icon"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                
                {/* Confirmar Contraseña */}
                <div className="frcc-input-group">
                    <label htmlFor="passwordConfirmation" className="frcc-input-label">Confirmar contraseña</label>
                    <div className="frcc-input-with-icon">
                        <CornerDownRight className="frcc-input-start-icon" size={20} color="#adb5bd"/>
                        <input
                            className="frcc-form-input"
                            type={showConfirmPassword ? "text" : "password"}
                            id="passwordConfirmation"
                            placeholder="Confirma tu contraseña"
                            value={formData.passwordConfirmation}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                         <button
                            type="button"
                            className="frcc-password-toggle-icon"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                {/* Cédula */}
                <div className="frcc-input-group">
                    <label htmlFor="cedula" className="frcc-input-label">Cédula</label>
                    <div className="frcc-input-with-icon">
                        <Smartphone className="frcc-input-start-icon" size={20} color="#adb5bd"/>
                        <input
                            className="frcc-form-input"
                            type="tel"
                            id="cedula"
                            placeholder="Introduce tu número de cédula"
                            value={formData.cedula}
                            onChange={handleCedulaChange}
                            required
                            maxLength={10} // Límite visual, la validación final es en JS
                        />
                    </div>
                </div>

                {/* Botón de Registro */}
                <button
                    type="submit"
                    className="frcc-register-button"
                >
                    Crear cuenta
                </button>
            </form>

            {/* Sección de "Already have an account?" */}
            <div className="frcc-signup-text">
                ¿Ya tienes una cuenta? <a href="/login" className="frcc-signup-link">Inicia sesión</a>
            </div>
            
            {/* Botón de "Register as Architect" */}
            <div className="frcc-architect-register-container">
                <button className="frcc-architect-register-button"
                    onClick={onRegisterAsArquitecto}
                >
                    Registrarme como arquitecto <CornerDownRight size={20} style={{marginLeft: '8px'}}/>
                </button>
            </div>
        </div>
    );
}

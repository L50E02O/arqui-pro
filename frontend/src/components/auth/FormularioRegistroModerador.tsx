import React, { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, User, Mail, CornerDownRight } from "lucide-react";
import type { RegistroUsuarioInput } from "../../types/usuario.types";
import "../../styles/auth/registro/FormularioRegistroModerador.css"

// Definimos los tipos de datos locales para el formulario
interface ModeradorFormData{
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    passwordConfirmation: string;
}

// Mantenemos FieldErrors SÓLO para la clase CSS del input
interface FieldErrors{
    email?: string; // Lo usaremos solo para cambiar la clase CSS del input
}

interface Props {
    onSubmit: (data: RegistroUsuarioInput) => void;
    // La referencia manejará el mensaje de error general desde el padre (API)
    onApiError: React.MutableRefObject<((error: string) => void) | null>
}

export default function FormularioRegistroModerador({ onSubmit, onApiError }: Props){
    const [formData, setFormData] = useState<ModeradorFormData>({
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        passwordConfirmation: "",     
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    // Este estado se usará para errores locales Y los errores de la API
    const [generalError, setGeneralError] = useState<string | null>(null); 
    // Estado para errores visuales de campo (email ya existe)
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    /**
     * Función que se expone al componente padre (vía onApiError ref) para recibir el mensaje de error de la API.
     */
    const handleApiError = (apiError: string) => {
        const newFieldErrors: FieldErrors = {};
        const lowerError = apiError.toLowerCase();

        // 1. Mapear errores de API a errores de campo visuales (solo para el CSS)
        if (lowerError.includes("correo") || lowerError.includes("email")) {
            newFieldErrors.email = 'api-error'; // Marcador visual
        }

        // 2. Mostrar el mensaje de error de la API en el error general
        setFieldErrors(newFieldErrors);
        setGeneralError(apiError);
    };

    // Asignamos la función handleApiError a la referencia del padre usando useEffect para asegurar que solo se haga una vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (onApiError.current === null) {
            onApiError.current = handleApiError as unknown as ((error: string) => void);
        }
    }, [onApiError]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
        
        // Limpiar errores generales y de campo al escribir
        if (generalError) setGeneralError(null);

        // Limpiar marcador visual de errores de campo específicos
        if (fieldErrors[id as keyof FieldErrors]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[id as keyof FieldErrors];
                return newErrors;
            });
        }
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setGeneralError(null);
        setFieldErrors({});

        const { nombre, apellido, email, password, passwordConfirmation } = formData;

        // --- Validaciones locales ---
        if (password.length < 6) {
            setGeneralError("La contraseña debe tener al menos 6 dígitos.");
            return;
        }

        if (password !== passwordConfirmation) {
            setGeneralError("Las contraseñas no coinciden.");
            return;
        }

        // --- Preparar datos para la API ---
        const dataToSend: RegistroUsuarioInput = {
            nombre,
            apellido,
            email,
            password,
            password_confirmation: passwordConfirmation,
            rol: 'moderador'
        };
        onSubmit(dataToSend);    
    };

    return (
        <div className="frm-register-card">
            
            {/* Logo Section */}
            <div className="frm-logo-section">
                <div className="frm-logo-color-box"></div>
                <span className="frm-logo-text">ArquiPro - Moderador</span>
            </div>

            {/* Títulos */}
            <h1 className="frm-welcome-title">Registro de Moderador</h1>
            <p className="frm-subtitle">Acceso exclusivo para el personal de moderación y administración.</p>

            <form className="frm-register-form" onSubmit={handleSubmit}>
                
                {/* Error General (validaciones locales y errores de API) */}
                {generalError && <div className="frm-validation-error">{generalError}</div>}
                
                {/* 1ra Fila: Nombre (columna 1), Apellido (columna 2) */}
                
                <div className="frm-input-group">
                    <label htmlFor="nombre" className="frm-input-label">Nombre</label>
                    <div className="frm-input-with-icon">
                        <User className="frm-input-start-icon" size={20} color="#adb5bd"/>
                        <input
                            className="frm-form-input"
                            type="text"
                            id="nombre"
                            placeholder="Ingresa el nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="frm-input-group">
                    <label htmlFor="apellido" className="frm-input-label">Apellido</label>
                    <div className="frm-input-with-icon">
                        <User className="frm-input-start-icon" size={20} color="#adb5bd"/>
                        <input
                            className="frm-form-input"
                            type="text"
                            id="apellido"
                            placeholder="Ingresa el apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* 2da Fila: Email (span 2) */}
                <div className="frm-input-group frm-full-span">
                    <label htmlFor="email" className="frm-input-label">Email Corporativo</label>
                    <div className="frm-input-with-icon">
                        <Mail className="frm-input-start-icon" size={20} color="#adb5bd"/>
                        <input 
                            className={`frm-form-input ${fieldErrors.email ? 'frm-input-error-state' : ''}`}
                            type="email"
                            id="email"
                            placeholder="Ingresa el correo electrónico"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                
                {/* 3ra Fila: Contraseña y Confirmación (span 2) */}
                <div className="frm-input-group frm-full-span">
                    <label htmlFor="password" className="frm-input-label">Contraseña</label>
                    <div className="frm-input-with-icon">
                        <Lock className="frm-input-start-icon" size={20} color="#adb5bd"/>
                        <input
                            className="frm-form-input"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Crea una contraseña segura"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6} 
                        />
                        <button
                            type="button"
                            className="frm-password-toggle-icon"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                
                <div className="frm-input-group frm-full-span">
                    <label htmlFor="passwordConfirmation" className="frm-input-label">Confirmación de Contraseña</label>
                    <div className="frm-input-with-icon">
                        <CornerDownRight className="frm-input-start-icon" size={20} color="#adb5bd"/>
                        <input
                            className="frm-form-input"
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
                            className="frm-password-toggle-icon"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                
                {/* Botón de Registro (span 2) */}
                <button
                    type="submit"
                    className="frm-register-button"
                >
                    Registrar Moderador
                </button>
            </form>

            {/* Sección de "Already have an account?" */}
            <div className="frm-login-text">
                ¿Ya tienes una cuenta? <a href="/login" className="frm-login-link">Iniciar sesión</a>
            </div>
        </div>
    );
}
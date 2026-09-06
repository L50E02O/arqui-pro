import { useState, useEffect } from "react";
import FormularioLogin from "../../components/auth/FormularioLogin";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../../styles/auth/login/LoginPage.css";
import imagenLogin from "../../assets/login.webp"

export default function LoginPage(){
    const navigate = useNavigate();
    const { login, user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirección automática si ya está autenticado
    useEffect(() => {
        if (isAuthenticated && user) {
            console.log('👤 Usuario ya autenticado, redirigiendo...', user.rol);
            
            if (user.rol === 'moderador') {
                navigate("/moderador/dashboard", { replace: true });
            } else if (user.rol === "cliente") {
                navigate("/cliente/home", { replace: true });
            } else if (user.rol === "arquitecto") {
                navigate("/arquitecto/profile", { replace: true });
            } else {
                navigate("/", { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    const handleLogin = async (email: string, password: string)=>{  
        setError(null);
        setLoading(true);

        try{
            await login(email, password);
            
            // Login exitoso, redirigir según el rol del usuario
            // Obtener el usuario del localStorage ya que el estado puede no haberse actualizado
            const userData = localStorage.getItem('user_data');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                console.log(parsedUser.rol)
                if (parsedUser.rol === 'moderador') {
                    navigate("/moderador/dashboard");
                }
                else if(parsedUser.rol === "cliente"){
                    navigate("/cliente/home")
                }
                else if(parsedUser.rol === "arquitecto"){
                    navigate("/arquitecto/profile")
                }
                else {
                    navigate("/");
                }
            } else {
                navigate("/");
            }
            
        } catch(error: any){
            // No imprimir el objeto error completo para evitar ruido en la consola
            // Manejar mensajes de error esperados y mostrar al usuario
            if (error.response?.status === 401) {
                setError("Email o contraseña incorrectos");
            } else if (error.response?.status === 404) {
                setError("Usuario no encontrado");
            } else if (error.response?.status === 403) {
                // Acceso prohibido: puede ser cuenta suspendida o arquitecto no verificado
                const msg = error.response?.data?.status?.message || error.response?.data?.message || 'Acceso prohibido';
                setError(msg);
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else if (error.response?.data?.status?.message) {
                setError(error.response.data.status.message);
            } else {
                setError("Ocurrió un error inesperado al intentar iniciar sesión");
            }
        } finally{
            setLoading(false);
        }
    };

    return (
        <div className="lp-login-page-center-container">
            {/* Botón para regresar al home */}
            <button 
                onClick={() => navigate('/')} 
                className="lp-back-to-home-button"
                aria-label="Volver al inicio"
            >
                <ArrowLeft size={20} />
                <span>Volver al inicio</span>
            </button>

            <div className="lp-login-page-container">
                {/* Lado izquierdo para la imagen */}
                <div className="lp-image-side">
                    <img className="lp-login-illustration" src={imagenLogin} alt="imagen de login" />
                    {loading && <div className="lp-login-loading-message">Cargando...</div>}
                    {error && <div className="lp-login-error-message">{error}</div>}
                </div>

                {/* Lado derecho para el formulario de Login (centrado) */}
                <div className="lp-form-side">
                    <FormularioLogin onSubmit={handleLogin} />
                </div>
            </div>
        </div>
    );
}
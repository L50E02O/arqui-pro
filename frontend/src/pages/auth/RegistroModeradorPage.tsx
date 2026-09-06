import { useEffect, useRef, useState } from "react";
import type { RegistroUsuarioInput, Usuario } from "../../types/usuario.types";
import { registroUsuario } from "../../services/api/auth/authService";
import FormularioRegistroModerador from "../../components/auth/FormularioRegistroModerador";
import { useNavigate } from "react-router-dom";


export default function RegistroModeradorPage(){
    const navigate = useNavigate();
    // Simulamos useNavigate para evitar el error de importación
    
    const [apiError, setApiError] = useState<string | null>(null);
    
    // Ref para exponer la función de manejo de errores de la API al componente FormularioRegistroModerador
    const formApiErrorRef = useRef<((error: string) => void) | null>(null);


    // Cuando el error de la API cambia en este componente, se lo pasamos al formulario hijo
    useEffect(() => {
        if (apiError && formApiErrorRef.current) {
            formApiErrorRef.current(apiError);
            // Limpiamos el error después de pasarlo al formulario para evitar bucles o reenvíos
            setApiError(null); 
        }
    }, [apiError]);

    const handleRegistroSubmit = async (data: RegistroUsuarioInput) => {
        
        try {
            const nuevoUsuario: Usuario = await registroUsuario(data);

            console.log("Moderador registrado:", nuevoUsuario);
            // Navegar a la página de inicio de sesión después del registro exitoso
            navigate('/login'); 
        } catch (error: any) {
            let errorMessage = "Error en el registro del moderador. Por favor, intente más tarde.";
            
            // Intentamos obtener un mensaje de error específico de la respuesta del backend
            if (error && error.response && error.response.data) {
                if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else if (error.response.data.errors && Object.keys(error.response.data.errors).length > 0) {
                    // Manejo de errores de validación estructurados
                    const firstErrorKey = Object.keys(error.response.data.errors)[0];
                    const firstErrorMessages = error.response.data.errors[firstErrorKey];
                    if (Array.isArray(firstErrorMessages) && firstErrorMessages.length > 0) {
                         // Usamos solo el mensaje
                         errorMessage = firstErrorMessages[0]; 
                    }
                }
            } else if (error && error.message) {
                errorMessage = error.message;
            }
            
            // Guardamos el error en el estado para que useEffect lo pase al formulario
            setApiError(errorMessage);
        }
    };

    return (
        <div className="registro-page-container"> 
            <div className="form-side">
                <FormularioRegistroModerador
                    onSubmit={handleRegistroSubmit} 
                    onApiError={formApiErrorRef} 
                />
            </div>
        </div>
    );
}
import { API_CONFIG, setAuthToken, getAuthToken, removeAuthToken} from "../../../config/api.config"
import axiosInstance from "../axiosInstance"
import type { Usuario, RegistroUsuarioInput, AuthResponse, LoginInput } from "../../../types/usuario.types"

// Registro de usuarios
export async function registroUsuario(usuarioData: RegistroUsuarioInput): Promise<Usuario>{
    try{
        const response = await axiosInstance.post(`${API_CONFIG.REST_API_URL}/usuarios`, { usuario: usuarioData });
        return response.data.data; // si todo sale bien retorna los datos del usurio registrado
    } catch(error){
        throw error; // si sale mal lanza este error
    }
}

// Login de usuarios
export async function loginUsuario(loginData: LoginInput): Promise<AuthResponse>{
    try{
        const response = await axiosInstance.post(`${API_CONFIG.REST_API_URL}/usuarios/sign_in`, { usuario: loginData });
        
        // El backend devuelve: { status: {...}, data: {...}, token: "..." }
        // Transformar a: { usuario: {...}, token: "..." }
        const authResponse: AuthResponse = {
            usuario: response.data.data, // Los datos del usuario están en 'data'
            token: response.data.token
        };
        
        setAuthToken(authResponse.token); // guarda el token en el local storage
        return authResponse; // si todo sale bien retorna el token y datos del usuario
    }catch(error){
        throw error; // si sale mal lanza este error
    }
}

// Cerrar sesión de usuario
export async function logoutUsuario(){
    try{
        const token = getAuthToken(); 
        const response = await axiosInstance.delete(`${API_CONFIG.REST_API_URL}/usuarios/sign_out`, { 
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });
        removeAuthToken();
        return response; //Si todo sale bien retorna un mensaje de exito
    } catch(error){
        throw error; // si sale algo mal retonar un mensaje de error
    }
}
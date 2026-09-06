import FormularioRegistroClientes from "../../components/auth/FormularioRegistroCliente";
import { useNavigate } from "react-router-dom";
import { registroUsuario } from "../../services/api/auth/authService";
import type { RegistroUsuarioInput, Usuario } from "../../types/usuario.types";
import "../../styles/auth/registro/RegistroClientePage.css";

type Props = Record<string, never>;

export default function RegistroClientePage({}: Props) {
  const navigate = useNavigate();

  const handleRegistroSubmit = async (data: RegistroUsuarioInput) => {
    try {
      const nuevoUsuario: Usuario = await registroUsuario(data);
      console.log('[INFO] Usuario registrado:', nuevoUsuario);
      navigate('/login');
    } catch (error: any) {
      let errorMessage = 'Error en el registro. Por favor, intente más tarde.';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    }
  };

  function handleRegisterAsArquitecto() {
    navigate('/registro-arquitecto');
  }

  return (
    <div className="rcp-registro-page-container">
      <div className="rcp-form-side">
        <FormularioRegistroClientes
          onSubmit={handleRegistroSubmit}
          onRegisterAsArquitecto={handleRegisterAsArquitecto}
        />
      </div>
    </div>
  );
}
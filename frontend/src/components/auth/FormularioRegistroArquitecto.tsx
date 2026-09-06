import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import type { RegistroUsuarioInput } from '../../types/usuario.types';
import ArquitectoAccountFields from './steps/ArquitectoAccountFields';
import ArquitectoProfessionalFields from './steps/ArquitectoProfessionalFields';
import '../../styles/auth/registro/FormularioRegistroArquitecto.css';

interface ArquitectoFormData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  cedula: string;
  descripcion: string;
  especialidades: string[];
  ubicacion: string;
}

interface FieldErrors {
  email?: string;
  cedula?: string;
}

type Props = {
  onSubmit: (data: RegistroUsuarioInput) => void;
  onApiError: React.MutableRefObject<((error: string) => void) | null>;
  onRegisterAsCliente: () => void;
};

const ESPECIALIDADES_OPCIONES = [
  'Residencial',
  'Comercial',
  'Industrial',
  'Interiores',
  'Paisajismo',
  'Sustentable / Bioclimática',
  'Restauración / Patrimonio',
  'Urbanismo',
  'Hospitalario',
  'Educativo',
];

export default function FormularioRegistroArquitecto({
  onSubmit,
  onApiError,
  onRegisterAsCliente,
}: Props) {
  const [formData, setFormData] = useState<ArquitectoFormData>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    cedula: '',
    descripcion: '',
    especialidades: [],
    ubicacion: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEspecialidadesDropdown, setShowEspecialidadesDropdown] = useState(false);
  const especialidadesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        especialidadesRef.current &&
        !especialidadesRef.current.contains(event.target as Node)
      ) {
        setShowEspecialidadesDropdown(false);
      }
    };

    if (showEspecialidadesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEspecialidadesDropdown]);

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleApiError = (apiError: string) => {
    const newFieldErrors: FieldErrors = {};
    const lowerError = apiError.toLowerCase();

    if (lowerError.includes('correo') || lowerError.includes('email')) {
      newFieldErrors.email = 'api-error';
    }
    if (lowerError.includes('cédula') || lowerError.includes('cedula')) {
      newFieldErrors.cedula = 'api-error';
    }

    setFieldErrors(newFieldErrors);
    setGeneralError(apiError);
  };

  if (onApiError.current === null) {
    onApiError.current = handleApiError as unknown as (error: string) => void;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (generalError) {
      setGeneralError(null);
    }
    if (fieldErrors[id as keyof FieldErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [id]: undefined,
      }));
    }
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setFormData((prev) => ({
        ...prev,
        cedula: value,
      }));

      if (fieldErrors.cedula) {
        setFieldErrors((prev) => ({ ...prev, cedula: undefined }));
      }
      if (generalError) {
        setGeneralError(null);
      }
    }
  };

  const toggleEspecialidad = (especialidad: string) => {
    setFormData((prev) => {
      const exists = prev.especialidades.includes(especialidad);
      return {
        ...prev,
        especialidades: exists
          ? prev.especialidades.filter((e) => e !== especialidad)
          : [...prev.especialidades, especialidad],
      };
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    const {
      nombre,
      apellido,
      email,
      password,
      passwordConfirmation,
      cedula,
      descripcion,
      especialidades: especialidadesArr,
      ubicacion,
    } = formData;

    if (
      !nombre ||
      !apellido ||
      !email ||
      !password ||
      !passwordConfirmation ||
      !cedula ||
      !descripcion ||
      !ubicacion
    ) {
      setGeneralError('Todos los campos son obligatorios.');
      return;
    }

    if (especialidadesArr.length === 0) {
      setGeneralError('Debes seleccionar al menos una especialidad.');
      return;
    }

    if (password !== passwordConfirmation) {
      setGeneralError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setGeneralError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (cedula.length !== 10) {
      setGeneralError('La cédula profesional debe tener exactamente 10 dígitos numéricos.');
      setFieldErrors((prev) => ({ ...prev, cedula: 'invalid' }));
      return;
    }

    const dataToSend: RegistroUsuarioInput = {
      nombre,
      apellido,
      email,
      password,
      password_confirmation: passwordConfirmation,
      rol: 'arquitecto',
      arquitecto_attributes: {
        cedula,
        descripcion,
        especialidades: especialidadesArr.join(', '),
        ubicacion,
      },
    };
    onSubmit(dataToSend);
  };

  return (
    <div className="fra-register-card">
      <div className="fra-logo-section">
        <div className="fra-logo-color-box"></div>
        <span className="fra-logo-text">ArquiPro</span>
      </div>

      <h1 className="fra-welcome-title">Regístrate como Arquitecto</h1>
      <p className="fra-subtitle">
        Únete a nuestra plataforma para mostrar tu trabajo y conectar con nuevos clientes.
      </p>

      {generalError && <div className="fra-validation-error">{generalError}</div>}

      <form className="fra-register-form" onSubmit={handleSubmit}>
        <ArquitectoAccountFields
          nombre={formData.nombre}
          apellido={formData.apellido}
          email={formData.email}
          password={formData.password}
          passwordConfirmation={formData.passwordConfirmation}
          cedula={formData.cedula}
          fieldErrors={fieldErrors}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          setShowPassword={setShowPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          onChange={handleChange}
          onCedulaChange={handleCedulaChange}
        />

        <ArquitectoProfessionalFields
          ubicacion={formData.ubicacion}
          descripcion={formData.descripcion}
          especialidades={formData.especialidades}
          especialidadesOpciones={ESPECIALIDADES_OPCIONES}
          showEspecialidadesDropdown={showEspecialidadesDropdown}
          setShowEspecialidadesDropdown={setShowEspecialidadesDropdown}
          especialidadesRef={especialidadesRef}
          onChange={handleChange}
          onToggleEspecialidad={toggleEspecialidad}
        />

        <button type="submit" className="fra-submit-button">
          Registrarme
        </button>

        <div className="fra-register-link-container">
          ¿Eres un cliente buscando arquitectos?{' '}
          <a
            href="#cliente"
            onClick={(e) => {
              e.preventDefault();
              onRegisterAsCliente();
            }}
            className="fra-register-link"
          >
            Regístrate aquí
          </a>
        </div>
      </form>
    </div>
  );
}
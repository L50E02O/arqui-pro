import React from 'react';
import { Eye, EyeOff, Lock, User, Mail, Smartphone, CornerDownRight } from 'lucide-react';

type Props = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  cedula: string;
  fieldErrors: { email?: string; cedula?: string };
  showPassword: boolean;
  showConfirmPassword: boolean;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCedulaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ArquitectoAccountFields({
  nombre,
  apellido,
  email,
  password,
  passwordConfirmation,
  cedula,
  fieldErrors,
  showPassword,
  showConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
  onChange,
  onCedulaChange,
}: Props) {
  return (
    <>
      {/* 1ra Fila: Nombre, Apellido, Email */}
      <div className="fra-input-row">
        <div className="fra-input-group">
          <label htmlFor="nombre" className="fra-input-label">Nombre</label>
          <div className="fra-input-with-icon">
            <User className="fra-input-start-icon" size={20} color="#adb5bd" />
            <input
              className="fra-form-input"
              type="text"
              id="nombre"
              placeholder="Ingresa tu nombre"
              value={nombre}
              onChange={onChange}
              required
            />
          </div>
        </div>
        <div className="fra-input-group">
          <label htmlFor="apellido" className="fra-input-label">Apellido</label>
          <div className="fra-input-with-icon">
            <User className="fra-input-start-icon" size={20} color="#adb5bd" />
            <input
              className="fra-form-input"
              type="text"
              id="apellido"
              placeholder="Ingresa tu apellido"
              value={apellido}
              onChange={onChange}
              required
            />
          </div>
        </div>
        <div className="fra-input-group">
          <label htmlFor="email" className="fra-input-label">Email</label>
          <div className="fra-input-with-icon">
            <Mail className="fra-input-start-icon" size={20} color="#adb5bd" />
            <input
              className={`fra-form-input ${fieldErrors.email ? 'fra-input-error-state' : ''}`}
              type="email"
              id="email"
              placeholder="Ingresa tu correo electrónico"
              value={email}
              onChange={onChange}
              required
            />
          </div>
        </div>
      </div>

      {/* 2da Fila: Contraseña, Confirmación, Cédula */}
      <div className="fra-input-row">
        <div className="fra-input-group">
          <label htmlFor="password" className="fra-input-label">Contraseña</label>
          <div className="fra-input-with-icon">
            <Lock className="fra-input-start-icon" size={20} color="#adb5bd" />
            <input
              className="fra-form-input"
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Crea una contraseña"
              value={password}
              onChange={onChange}
              required
              minLength={6}
            />
            <button
              type="button"
              className="fra-password-toggle-icon"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="fra-input-group">
          <label htmlFor="passwordConfirmation" className="fra-input-label">Confirmación de Contraseña</label>
          <div className="fra-input-with-icon">
            <CornerDownRight className="fra-input-start-icon" size={20} color="#adb5bd" />
            <input
              className="fra-form-input"
              type={showConfirmPassword ? 'text' : 'password'}
              id="passwordConfirmation"
              placeholder="Confirma tu contraseña"
              value={passwordConfirmation}
              onChange={onChange}
              required
              minLength={6}
            />
            <button
              type="button"
              className="fra-password-toggle-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ocultar confirmación de contraseña' : 'Mostrar confirmación de contraseña'}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="fra-input-group">
          <label htmlFor="cedula" className="fra-input-label">Cédula</label>
          <div className="fra-input-with-icon">
            <Smartphone className="fra-input-start-icon" size={20} color="#adb5bd" />
            <input
              className={`fra-form-input ${fieldErrors.cedula ? 'fra-input-error-state' : ''}`}
              type="tel"
              id="cedula"
              placeholder="Ingresa tu número de cédula"
              value={cedula}
              onChange={onCedulaChange}
              required
              maxLength={10}
            />
          </div>
        </div>
      </div>
    </>
  );
}

# Components - Common

Componentes **reutilizables** que se usan en múltiples páginas. Siguen los principios de **Atomic Design**.

---

## 📋 Propósito

- Crear componentes genéricos y reutilizables
- Evitar duplicación de código
- Mantener UI consistente
- Facilitar mantenimiento

---

## 🧩 Atomic Design

Organizamos componentes por nivel de complejidad:

```
Átomos → Moléculas → Organismos
```

### Átomos (Elementos básicos)

- `Button/` - Botones
- `Input/` - Campos de texto
- `Label/` - Etiquetas
- `Icon/` - Iconos
- `Avatar/` - Imágenes de usuario

### Moléculas (Combinaciones simples)

- `Card/` - Tarjetas de contenido
- `FormField/` - Input + Label
- `SearchBar/` - Input + Icon
- `Dropdown/` - Select personalizado

### Organismos (Componentes complejos)

- `Modal/` - Ventanas emergentes
- `Table/` - Tablas de datos
- `Form/` - Formularios completos
- `Navbar/` - Barra de navegación

---

## 📁 Estructura de un Componente

Cada componente tiene su propia carpeta:

```
Button/
├── Button.tsx           # Componente principal
├── Button.types.ts      # Tipos TypeScript
├── Button.module.css    # Estilos (opcional)
└── index.ts             # Export barrel
```

---

## 🔧 Ejemplo: Button

### `Button.tsx`

```typescript
import React from 'react';
import type { ButtonProps } from './Button.types';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
}) => {
  const baseClasses = 'rounded font-semibold transition-colors';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizeClasses = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2',
    large: 'px-6 py-3 text-lg',
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### `Button.types.ts`

```typescript
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}
```

### `index.ts`

```typescript
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

---

## 🔧 Ejemplo: Input

### `Input.tsx`

```typescript
import React from 'react';
import type { InputProps } from './Input.types';

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  ...inputProps
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}
      
      <input
        className={`
          w-full px-3 py-2 border rounded
          ${error ? 'border-red-500' : 'border-gray-300'}
          focus:outline-none focus:ring-2
          ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'}
        `}
        {...inputProps}
      />
      
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-gray-500 text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
};
```

### `Input.types.ts`

```typescript
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
```

---

## 🔧 Ejemplo: Card

### `Card.tsx`

```typescript
import React from 'react';
import type { CardProps } from './Card.types';

export const Card: React.FC<CardProps> = ({
  children,
  title,
  footer,
  onClick,
}) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-6
        ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
      `}
      onClick={onClick}
    >
      {title && (
        <h3 className="text-xl font-bold mb-4">{title}</h3>
      )}
      
      <div className="mb-4">
        {children}
      </div>
      
      {footer && (
        <div className="border-t pt-4 text-sm text-gray-600">
          {footer}
        </div>
      )}
    </div>
  );
};
```

---

## 🔧 Ejemplo: Modal

### `Modal.tsx`

```typescript
import React from 'react';
import type { ModalProps } from './Modal.types';

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};
```

---

## 💡 Principios

### 1. **Props Tipadas**
Siempre define tipos TypeScript para props.

### 2. **Composición**
Usa `children` para permitir composición.

```tsx
<Card>
  <h1>Título</h1>
  <p>Contenido</p>
</Card>
```

### 3. **Variantes**
Usa props para variantes (tamaño, color, estilo).

```tsx
<Button variant="primary" size="large">Guardar</Button>
```

### 4. **Accesibilidad**
Incluye atributos ARIA cuando sea necesario.

```tsx
<button aria-label="Cerrar modal" onClick={onClose}>✕</button>
```

### 5. **Reutilización**
Si usas un componente más de 2 veces, créalo aquí.

---

## 📚 Recursos

- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [React Docs - Composition](https://react.dev/learn/passing-props-to-a-component)
- [Tailwind CSS](https://tailwindcss.com/docs)

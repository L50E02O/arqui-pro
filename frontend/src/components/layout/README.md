# Components - Layout

Componentes que definen la **estructura y disposición** de la aplicación (Header, Sidebar, Footer, etc.).

---

## 📋 Propósito

- Definir estructura visual consistente
- Mantener layouts reutilizables
- Centralizar navegación y menús
- Separar layout de contenido

---

## 📁 Estructura

```
layout/
├── MainLayout/          # Layout principal con Sidebar + Header
├── AuthLayout/          # Layout para login/registro
├── DashboardLayout/     # Layout específico para dashboard
├── Header/              # Barra superior
├── Sidebar/             # Menú lateral
├── Footer/              # Pie de página
└── Breadcrumbs/         # Navegación de ruta
```

---

## 🔧 MainLayout

Layout principal usado en la mayoría de páginas autenticadas.

### `MainLayout.tsx`

```typescript
import React from 'react';
import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { Footer } from '../Footer';

interface Props {
  children: React.ReactNode;
}

export const MainLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
};
```

### Uso

```tsx
import { MainLayout } from '@/components/layout/MainLayout';

const ProyectosPage = () => {
  return (
    <MainLayout>
      <h1>Proyectos</h1>
      {/* contenido */}
    </MainLayout>
  );
};
```

---

## 🔧 Header

Barra superior con logo, navegación y menú de usuario.

### `Header.tsx`

```typescript
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const Header: React.FC = () => {
  const { usuario, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          ArquiPro
        </Link>

        {/* Navegación */}
        <nav className="flex gap-6">
          <Link to="/proyectos" className="hover:text-blue-600">
            Proyectos
          </Link>
          <Link to="/arquitectos" className="hover:text-blue-600">
            Arquitectos
          </Link>
          <Link to="/conversaciones" className="hover:text-blue-600">
            Conversaciones
          </Link>
        </nav>

        {/* Usuario */}
        <div className="flex items-center gap-4">
          <span className="text-sm">{usuario?.nombre}</span>
          <button
            onClick={logout}
            className="text-sm text-red-600 hover:underline"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
};
```

---

## 🔧 Sidebar

Menú lateral para navegación secundaria.

### `Sidebar.tsx`

```typescript
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const Sidebar: React.FC = () => {
  const { usuario } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/proyectos', label: 'Proyectos', icon: '🏗️' },
    { to: '/arquitectos', label: 'Arquitectos', icon: '👷' },
    { to: '/conversaciones', label: 'Conversaciones', icon: '💬' },
    { to: '/perfil', label: 'Mi Perfil', icon: '👤' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <nav className="space-y-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded transition-colors
              ${isActive ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
```

---

## 🔧 AuthLayout

Layout para páginas de autenticación (sin Header/Sidebar).

### `AuthLayout.tsx`

```typescript
import React from 'react';

interface Props {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">ArquiPro</h1>
          <p className="text-gray-600 mt-2">Plataforma de arquitectura</p>
        </div>
        
        {/* Contenido */}
        {children}
      </div>
    </div>
  );
};
```

### Uso

```tsx
import { AuthLayout } from '@/components/layout/AuthLayout';

const LoginPage = () => {
  return (
    <AuthLayout>
      <h2>Iniciar Sesión</h2>
      <form>{/* campos */}</form>
    </AuthLayout>
  );
};
```

---

## 🔧 Footer

Pie de página con enlaces y copyright.

### `Footer.tsx`

```typescript
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center text-sm text-gray-600">
        <p>© 2025 ArquiPro. Todos los derechos reservados.</p>
        
        <div className="flex gap-4">
          <a href="/terminos" className="hover:text-blue-600">Términos</a>
          <a href="/privacidad" className="hover:text-blue-600">Privacidad</a>
          <a href="/soporte" className="hover:text-blue-600">Soporte</a>
        </div>
      </div>
    </footer>
  );
};
```

---

## 🔧 Breadcrumbs

Navegación de ruta para mostrar ubicación actual.

### `Breadcrumbs.tsx`

```typescript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  return (
    <nav className="flex gap-2 text-sm text-gray-600 mb-4">
      <Link to="/" className="hover:text-blue-600">Inicio</Link>
      
      {paths.map((path, index) => {
        const url = `/${paths.slice(0, index + 1).join('/')}`;
        const isLast = index === paths.length - 1;
        
        return (
          <React.Fragment key={url}>
            <span>/</span>
            {isLast ? (
              <span className="text-gray-900 font-medium capitalize">{path}</span>
            ) : (
              <Link to={url} className="hover:text-blue-600 capitalize">
                {path}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
```

---

## 💡 Mejores Prácticas

### 1. **Composición**
Layouts reciben `children` para inyectar contenido.

### 2. **Rutas Protegidas**
Valida autenticación en layouts:

```tsx
const MainLayout = ({ children }) => {
  const { usuario, loading } = useAuth();
  
  if (loading) return <Spinner />;
  if (!usuario) return <Navigate to="/login" />;
  
  return <div>{/* layout */}</div>;
};
```

### 3. **Responsive**
Usa Tailwind para adaptar layouts a mobile:

```tsx
<div className="hidden md:block"> {/* Sidebar solo en desktop */}
  <Sidebar />
</div>
```

---

## 📚 Recursos

- [React Router Layouts](https://reactrouter.com/en/main/start/overview#layout-routes)
- [Tailwind Responsive](https://tailwindcss.com/docs/responsive-design)

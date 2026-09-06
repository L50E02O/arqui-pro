# Hooks

**Custom hooks** de React para encapsular lógica reutilizable.

---

## 📋 Propósito

- Extraer lógica de componentes
- Reutilizar comportamientos
- Separar UI de lógica de negocio
- Facilitar testing

---

## 📁 Estructura

```
hooks/
├── useAuth.ts               # Autenticación
├── useProyectos.ts          # Lista de proyectos
├── useProyecto.ts           # Proyecto individual
├── useArquitectos.ts        # Lista de arquitectos
├── useDebounce.ts           # Debounce para búsquedas
├── useLocalStorage.ts       # Persistencia local
├── useFetch.ts              # Hook genérico para peticiones
└── useForm.ts               # Manejo de formularios
```

---

## 🔧 Hook de Autenticación

### `useAuth.ts`

```typescript
import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '@/services/api/authService';
import type { Usuario } from '@/types/usuario.types';

interface AuthContext {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al montar
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authService.getCurrentUser()
        .then(setUsuario)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUsuario(user);
  };

  const logout = async () => {
    await authService.logout();
    setUsuario(null);
  };

  const register = async (data: any) => {
    const user = await authService.register(data);
    setUsuario(user);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Uso

```tsx
const LoginPage = () => {
  const { login } = useAuth();
  
  const handleSubmit = async () => {
    await login('email@example.com', 'password');
  };
};
```

---

## 🔧 Hook para Lista de Datos

### `useProyectos.ts`

```typescript
import { useState, useEffect } from 'react';
import { proyectosService } from '@/services/api/proyectosService';
import type { Proyecto } from '@/types/proyecto.types';

export const useProyectos = () => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    proyectosService.getAll()
      .then(setProyectos)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await proyectosService.getAll();
      setProyectos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { proyectos, loading, error, refresh };
};
```

### Uso

```tsx
const ProyectosPage = () => {
  const { proyectos, loading, error, refresh } = useProyectos();

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refresh}>Refrescar</button>
      {proyectos.map(p => <div key={p.id}>{p.titulo}</div>)}
    </div>
  );
};
```

---

## 🔧 Hook para Datos Individuales

### `useProyecto.ts`

```typescript
import { useState, useEffect } from 'react';
import { proyectosService } from '@/services/api/proyectosService';
import type { Proyecto } from '@/types/proyecto.types';

export const useProyecto = (id: string) => {
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    proyectosService.getById(id)
      .then(setProyecto)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const update = async (data: Partial<Proyecto>) => {
    const updated = await proyectosService.update(id, data);
    setProyecto(updated);
  };

  const deleteProyecto = async () => {
    await proyectosService.delete(id);
  };

  return { proyecto, loading, error, update, deleteProyecto };
};
```

---

## 🔧 Hook Debounce

Para optimizar búsquedas en tiempo real.

### `useDebounce.ts`

```typescript
import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};
```

### Uso

```tsx
const SearchPage = () => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      // Hacer búsqueda solo después de 500ms sin cambios
      searchService.search(debouncedQuery);
    }
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
};
```

---

## 🔧 Hook LocalStorage

### `useLocalStorage.ts`

```typescript
import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
};
```

### Uso

```tsx
const Settings = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Cambiar tema: {theme}
    </button>
  );
};
```

---

## 🔧 Hook Genérico Fetch

### `useFetch.ts`

```typescript
import { useState, useEffect } from 'react';

interface UseFetchOptions {
  skip?: boolean;
}

export const useFetch = <T>(
  fetcher: () => Promise<T>,
  options: UseFetchOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!options.skip);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!options.skip) {
      execute();
    }
  }, []);

  return { data, loading, error, refetch: execute };
};
```

### Uso

```tsx
const MyComponent = () => {
  const { data, loading, refetch } = useFetch(
    () => proyectosService.getAll()
  );

  return (
    <div>
      <button onClick={refetch}>Refrescar</button>
      {loading ? 'Cargando...' : data?.length}
    </div>
  );
};
```

---

## 🔧 Hook para Formularios

### `useForm.ts`

```typescript
import { useState } from 'react';

export const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const setFieldError = (name: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, handleChange, setFieldError, reset };
};
```

### Uso

```tsx
const RegisterForm = () => {
  const { values, errors, handleChange, reset } = useForm({
    email: '',
    password: '',
    nombre: '',
  });

  return (
    <form>
      <Input
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
      />
      <button onClick={reset}>Limpiar</button>
    </form>
  );
};
```

---

## 💡 Mejores Prácticas

1. **Nombrar con `use`**: Todos los hooks deben empezar con `use`
2. **Un propósito por hook**: Cada hook debe hacer una cosa bien
3. **Reutilización**: Si usas lógica más de 2 veces, crea un hook
4. **Dependencias**: Define bien el array de dependencias en `useEffect`
5. **Testing**: Los hooks son fáciles de testear con `@testing-library/react-hooks`

---

## 📚 Recursos

- [React Hooks](https://react.dev/reference/react)
- [Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)

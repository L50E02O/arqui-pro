# Registro de Usuarios con Roles

El endpoint de registro ahora permite crear un usuario junto con su registro asociado (Cliente, Arquitecto o Moderador) en una sola petición usando **nested attributes**.

## Endpoint

```
POST /usuarios
Content-Type: application/json
```

## Ejemplos de Uso

### 1. Registrar un Cliente

```json
{
  "usuario": {
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.cliente@test.com",
    "password": "123456",
    "password_confirmation": "123456",
    "rol": "cliente",
    "estado_cuenta": "activo",
    "fecha_registro": "2025-10-24",
    "foto_perfil": "https://i.pravatar.cc/300?img=15",
    "cliente_attributes": {
      "cedula": "1234567890"
    }
  }
}
```

**Campos requeridos para Cliente:**
- `cedula` (string, único) ✅

### 2. Registrar un Arquitecto

```json
{
  "usuario": {
    "nombre": "María",
    "apellido": "González",
    "email": "maria.arquitecto@test.com",
    "password": "123456",
    "password_confirmation": "123456",
    "rol": "arquitecto",
    "estado_cuenta": "activo",
    "fecha_registro": "2025-10-24",
    "foto_perfil": "https://i.pravatar.cc/300?img=25",
    "arquitecto_attributes": {
      "cedula": "0987654321",
      "descripcion": "Arquitecta especializada en diseño urbano con 10 años de experiencia",
      "especialidades": "Diseño Urbano, Arquitectura Sostenible, Planificación",
      "ubicacion": "Quito-Pichincha-Ecuador",
      "verificado": false,
      "valoracion_prom_proyecto": 0.0,
      "vistas_perfil": 0
    }
  }
}
```

**Campos requeridos para Arquitecto:**
- `cedula` (string, único) ✅
- `descripcion` (text) ✅
- `especialidades` (string) ✅
- `ubicacion` (string) ✅
- `verificado` (boolean, default: false) - opcional
- `valoracion_prom_proyecto` (float, default: 0.0) - opcional
- `vistas_perfil` (integer, default: 0) - opcional

### 3. Registrar un Moderador

```json
{
  "usuario": {
    "nombre": "Carlos",
    "apellido": "Ramírez",
    "email": "carlos.moderador@test.com",
    "password": "123456",
    "password_confirmation": "123456",
    "rol": "moderador",
    "estado_cuenta": "activo",
    "fecha_registro": "2025-10-24",
    "foto_perfil": "https://i.pravatar.cc/300?img=35",
    "moderador_attributes": {}
  }
}
```

**Campos para Moderador:**
- No requiere campos adicionales (solo se crea la relación con el usuario)
- Puedes enviar `moderador_attributes: {}` vacío

## Campos del Usuario (comunes a todos)

| Campo | Tipo | Requerido | Validación |
|-------|------|-----------|------------|
| `nombre` | string | ✅ | presence |
| `apellido` | string | ✅ | presence |
| `email` | string | ✅ | presence, uniqueness |
| `password` | string | ✅ | presence |
| `password_confirmation` | string | ✅ | debe coincidir con password |
| `rol` | string | ✅ | debe ser: 'cliente', 'arquitecto', o 'moderador' |
| `estado_cuenta` | string | ✅ | debe ser: 'activo' o 'suspendido' |
| `fecha_registro` | date | ✅ | presence |
| `foto_perfil` | string | ❌ | opcional (URL) |

## Respuestas

### Éxito (201 Created)

```json
{
  "status": "success",
  "data": {
    "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.cliente@test.com",
    "rol": "cliente",
    "estado_cuenta": "activo",
    "fecha_registro": "2025-10-24",
    "foto_perfil": "https://i.pravatar.cc/300?img=15",
    "created_at": "2025-10-24T10:30:00.000Z",
    "updated_at": "2025-10-24T10:30:00.000Z",
    "cliente": {
      "id": "b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e",
      "cedula": "1234567890",
      "usuario_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
    }
  }
}
```

### Error de Validación (422 Unprocessable Entity)

```json
{
  "status": "error",
  "errors": [
    "Email ya está en uso",
    "Cliente cedula ya está en uso",
    "Arquitecto descripcion no puede estar en blanco"
  ]
}
```

### Error de Rol Incorrecto (422)

Si intentas enviar datos de un rol que no coincide:

```json
{
  "status": "error",
  "errors": [
    "Un cliente no puede tener datos de arquitecto o moderador"
  ]
}
```

## Validaciones Importantes

1. **Solo se puede crear un tipo de registro asociado:** No puedes enviar `cliente_attributes` y `arquitecto_attributes` al mismo tiempo.

2. **El rol debe coincidir con el registro asociado:**
   - Si `rol: "cliente"` → solo puedes enviar `cliente_attributes`
   - Si `rol: "arquitecto"` → solo puedes enviar `arquitecto_attributes`
   - Si `rol: "moderador"` → solo puedes enviar `moderador_attributes`

3. **Cédula única:** La cédula debe ser única tanto para clientes como para arquitectos.

4. **Email único:** El email del usuario debe ser único en toda la plataforma.

## Ejemplo con cURL

```bash
# Registrar un arquitecto
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": {
      "nombre": "Ana",
      "apellido": "Martínez",
      "email": "ana.arq@test.com",
      "password": "123456",
      "password_confirmation": "123456",
      "rol": "arquitecto",
      "estado_cuenta": "activo",
      "fecha_registro": "2025-10-24",
      "arquitecto_attributes": {
        "cedula": "1122334455",
        "descripcion": "Especialista en arquitectura comercial",
        "especialidades": "Comercial, Retail Design",
        "ubicacion": "Guayaquil-Guayas-Ecuador"
      }
    }
  }'
```

## Notas de Implementación

- Los atributos anidados se manejan automáticamente por Rails usando `accepts_nested_attributes_for`
- Los valores por defecto (como `verificado: false`, `valoracion_prom_proyecto: 0.0`) se establecen en la base de datos si no se proporcionan
- El `usuario_id` se establece automáticamente en la relación `has_one`
- Se genera automáticamente un `jti` (JWT Token ID) para la autenticación con Devise JWT

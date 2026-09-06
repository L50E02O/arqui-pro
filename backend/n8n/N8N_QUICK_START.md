# Guía Rápida: Configuración de n8n para Tareas Programadas

## Pasos Rápidos

### 1. Configurar API Key

```bash
# Generar API Key (Linux/Mac)
openssl rand -hex 32

# O usar un generador online
```

Agrega la API Key generada en:
- `backend/auth-microservicio/.env`: `N8N_API_KEY=tu-api-key-aqui`
- `docker-compose.yml` (opcional, para pasarla al contenedor): `N8N_API_KEY=tu-api-key-aqui`

### 2. Levantar n8n

```bash
docker-compose up -d n8n
```

Accede a: `http://localhost:5678`
- Usuario: `admin`
- Contraseña: `changeme123` (o la configurada en `N8N_PASSWORD`)

### 3. Importar Workflow

1. En n8n: **Workflows** → **Import from File**
2. Selecciona: `docs/n8n-workflow-cleanup-tokens.json`
3. Configura la variable de entorno `N8N_API_KEY` en el workflow (Settings → Environment Variables)
4. Activa el workflow (toggle en la esquina superior)

### 4. Verificar

El workflow se ejecutará automáticamente cada 24 horas. Para probarlo manualmente:
1. Haz clic en **Execute Workflow**
2. Revisa **Executions** para ver el resultado

## Estructura de Archivos

```
arqui-pro/
├── docker-compose.yml                    # Configuración de n8n
├── docs/
│   ├── N8N_EVENT_BUS.md                  # Documentación completa
│   ├── N8N_QUICK_START.md               # Esta guía rápida
│   └── n8n-workflow-cleanup-tokens.json # Workflow exportado
└── backend/
    └── auth-microservicio/
        ├── .env.n8n.example              # Ejemplo de configuración
        └── src/
            └── auth/
                ├── auth.controller.ts   # Endpoint /cleanup-tokens
                ├── auth.service.ts       # Lógica de limpieza
                └── guards/
                    └── api-key.guard.ts  # Guard de autenticación
```

## Endpoint Creado

**POST** `/auth/cleanup-tokens`

**Headers requeridos**:
```
X-API-Key: tu-api-key-segura
Content-Type: application/json
```

**Respuesta**:
```json
{
  "success": true,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "deleted": {
    "revoked_tokens": 150,
    "refresh_tokens": 45,
    "total": 195
  }
}
```

## Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "API Key inválida" | Verifica que `N8N_API_KEY` esté configurada en ambos lugares |
| "Connection refused" | Verifica que el API Gateway esté corriendo en el puerto 3000 |
| Workflow no se ejecuta | Verifica que esté activo (toggle) y revisa el Schedule Trigger |
| No se eliminan tokens | Verifica que haya tokens expirados en la BD y revisa logs |

## Próximos Pasos

- Revisa la [documentación completa](N8N_EVENT_BUS.md) para más detalles
- Personaliza el schedule según tus necesidades
- Agrega más tareas programadas siguiendo el mismo patrón


### CAMBIAR POR APPEND EN EL NODO combinar resultados y generar api-key 

1. **Generar API Key**:
   ```bash
   openssl rand -hex 32
   ```

2. **Configurar Auth Service**:
   ```env
   # backend/auth-microservicio/.env
   N8N_API_KEY=tu-api-key-generada

  remplanzar variable en http repost
# Script completo: Crea tablas e inserta datos de prueba
# Ejecutar con: .\scripts\create-tables-and-seed.ps1

Write-Host "=== Creando tablas e insertando datos de prueba ===" -ForegroundColor Cyan

# =====================================================
# PASO 1: Crear tabla ARQUITECTOS
# =====================================================
$sqlCreateArquitectos = @"
-- Crear tabla arquitectos si no existe
CREATE TABLE IF NOT EXISTS arquitectos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cedula VARCHAR(50) UNIQUE NOT NULL,
    valoracion_prom_proyecto REAL DEFAULT 0.0 NOT NULL,
    descripcion TEXT NOT NULL,
    especialidades VARCHAR(255) NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    verificado BOOLEAN DEFAULT false NOT NULL,
    vistas_perfil INT DEFAULT 0 NOT NULL,
    usuario_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Crear indices
CREATE INDEX IF NOT EXISTS idx_arquitectos_cedula ON arquitectos(cedula);
CREATE INDEX IF NOT EXISTS idx_arquitectos_usuario_id ON arquitectos(usuario_id);

-- Crear funcion para update_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
\$\$ language 'plpgsql';

-- Crear trigger (drop si existe primero)
DROP TRIGGER IF EXISTS update_arquitectos_updated_at ON arquitectos;
CREATE TRIGGER update_arquitectos_updated_at
BEFORE UPDATE ON arquitectos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
"@

# =====================================================
# PASO 2: Crear tabla VERIFICACIONES
# =====================================================
$sqlCreateVerificaciones = @"
-- Crear tabla verificaciones si no existe
CREATE TABLE IF NOT EXISTS verificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    estado VARCHAR(20) DEFAULT 'pendiente' NOT NULL CHECK (estado IN ('pendiente', 'verificado', 'rechazado')),
    fecha_verificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    arquitecto_id UUID NOT NULL,
    moderador_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Crear indices
CREATE INDEX IF NOT EXISTS idx_verificaciones_arquitecto_id ON verificaciones(arquitecto_id);
CREATE INDEX IF NOT EXISTS idx_verificaciones_moderador_id ON verificaciones(moderador_id);

-- Crear funcion para update_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS \$\$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
\$\$ language 'plpgsql';

-- Crear trigger (drop si existe primero)
DROP TRIGGER IF EXISTS update_verificaciones_updated_at ON verificaciones;
CREATE TRIGGER update_verificaciones_updated_at
BEFORE UPDATE ON verificaciones
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
"@

# =====================================================
# PASO 3: Datos de SEED
# =====================================================
# UUIDs predefinidos
$arq1 = "a1111111-1111-1111-1111-111111111111"
$arq2 = "a2222222-2222-2222-2222-222222222222"
$arq3 = "a3333333-3333-3333-3333-333333333333"
$arq4 = "a4444444-4444-4444-4444-444444444444"
$arq5 = "a5555555-5555-5555-5555-555555555555"
$usr1 = "u1111111-1111-1111-1111-111111111111"
$usr2 = "u2222222-2222-2222-2222-222222222222"
$usr3 = "u3333333-3333-3333-3333-333333333333"
$usr4 = "u4444444-4444-4444-4444-444444444444"
$usr5 = "u5555555-5555-5555-5555-555555555555"
$mod1 = "m1111111-1111-1111-1111-111111111111"

$sqlSeedArquitectos = @"
-- Limpiar datos seed existentes
DELETE FROM arquitectos WHERE cedula LIKE 'SEED-%';

-- Insertar 5 arquitectos
INSERT INTO arquitectos (id, cedula, valoracion_prom_proyecto, descripcion, especialidades, ubicacion, verificado, vistas_perfil, usuario_id)
VALUES 
    ('$arq1', 'SEED-001', 4.5, 'Arquitecto senior con experiencia en diseno residencial', 'Diseno Residencial, Remodelaciones', 'Ciudad de Mexico', true, 120, '$usr1'),
    ('$arq2', 'SEED-002', 4.8, 'Especialista en arquitectura sustentable', 'Arquitectura Sustentable, LEED', 'Guadalajara', true, 85, '$usr2'),
    ('$arq3', 'SEED-003', 0.0, 'Arquitecto junior buscando oportunidades', 'Diseno de Interiores', 'Monterrey', false, 15, '$usr3'),
    ('$arq4', 'SEED-004', 3.2, 'Experiencia en proyectos comerciales', 'Arquitectura Comercial, Retail', 'Puebla', false, 45, '$usr4'),
    ('$arq5', 'SEED-005', 4.0, 'Especialista en restauracion historica', 'Restauracion, Patrimonio', 'Oaxaca', false, 60, '$usr5')
ON CONFLICT (cedula) DO UPDATE SET
    valoracion_prom_proyecto = EXCLUDED.valoracion_prom_proyecto,
    descripcion = EXCLUDED.descripcion,
    updated_at = NOW();
"@

$sqlSeedVerificaciones = @"
-- Limpiar verificaciones existentes para arquitectos seed
DELETE FROM verificaciones WHERE arquitecto_id IN (
    '$arq1', '$arq2', '$arq3', '$arq4', '$arq5'
);

-- Insertar 5 verificaciones: 2 verificado, 2 pendiente, 1 rechazado
INSERT INTO verificaciones (estado, arquitecto_id, moderador_id)
VALUES 
    ('verificado', '$arq1', '$mod1'),
    ('verificado', '$arq2', '$mod1'),
    ('pendiente', '$arq3', '$mod1'),
    ('pendiente', '$arq4', '$mod1'),
    ('rechazado', '$arq5', '$mod1');
"@

# =====================================================
# EJECUTAR
# =====================================================

Write-Host ""
Write-Host "[1/4] Creando tabla arquitectos..." -ForegroundColor Yellow
docker exec -i postgres-arquitecto-semana10 psql -U arquitecto_user -d arquitecto_db -c "$sqlCreateArquitectos" 2>&1 | Out-Null
Write-Host "[OK] Tabla arquitectos creada" -ForegroundColor Green

Write-Host ""
Write-Host "[2/4] Creando tabla verificaciones..." -ForegroundColor Yellow
docker exec -i postgres-verificacion-semana10 psql -U verificacion_user -d verificacion_db -c "$sqlCreateVerificaciones" 2>&1 | Out-Null
Write-Host "[OK] Tabla verificaciones creada" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] Insertando arquitectos..." -ForegroundColor Yellow
docker exec -i postgres-arquitecto-semana10 psql -U arquitecto_user -d arquitecto_db -c "$sqlSeedArquitectos"
Write-Host "[OK] Arquitectos insertados" -ForegroundColor Green

Write-Host ""
Write-Host "[4/4] Insertando verificaciones..." -ForegroundColor Yellow
docker exec -i postgres-verificacion-semana10 psql -U verificacion_user -d verificacion_db -c "$sqlSeedVerificaciones"
Write-Host "[OK] Verificaciones insertadas" -ForegroundColor Green

# =====================================================
# VERIFICAR
# =====================================================
Write-Host ""
Write-Host "=== Verificando datos ===" -ForegroundColor Cyan

Write-Host ""
Write-Host "ARQUITECTOS:" -ForegroundColor Yellow
docker exec -i postgres-arquitecto-semana10 psql -U arquitecto_user -d arquitecto_db -c "SELECT cedula, especialidades, ubicacion, verificado FROM arquitectos WHERE cedula LIKE 'SEED-%' ORDER BY cedula;"

Write-Host ""
Write-Host "VERIFICACIONES por estado:" -ForegroundColor Yellow
docker exec -i postgres-verificacion-semana10 psql -U verificacion_user -d verificacion_db -c "SELECT estado, COUNT(*) as cantidad FROM verificaciones GROUP BY estado ORDER BY estado;"

Write-Host ""
Write-Host "=== SEED COMPLETADO ===" -ForegroundColor Green
Write-Host "   5 arquitectos (2 verificados, 3 no verificados)" -ForegroundColor White
Write-Host "   5 verificaciones (2 verificado, 2 pendiente, 1 rechazado)" -ForegroundColor White


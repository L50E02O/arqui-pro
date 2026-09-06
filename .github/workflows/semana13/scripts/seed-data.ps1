# Script de Seed - Inserta datos de prueba en las bases de datos
# Ejecutar con: .\scripts\seed-data.ps1

Write-Host "=== Insertando datos de prueba ===" -ForegroundColor Cyan

# UUIDs predefinidos para arquitectos
$arq1 = "a1111111-1111-1111-1111-111111111111"
$arq2 = "a2222222-2222-2222-2222-222222222222"
$arq3 = "a3333333-3333-3333-3333-333333333333"
$arq4 = "a4444444-4444-4444-4444-444444444444"
$arq5 = "a5555555-5555-5555-5555-555555555555"

# UUIDs para usuarios y moderadores
$usr1 = "u1111111-1111-1111-1111-111111111111"
$usr2 = "u2222222-2222-2222-2222-222222222222"
$usr3 = "u3333333-3333-3333-3333-333333333333"
$usr4 = "u4444444-4444-4444-4444-444444444444"
$usr5 = "u5555555-5555-5555-5555-555555555555"
$mod1 = "m1111111-1111-1111-1111-111111111111"

# SQL para insertar arquitectos
$sqlArquitectos = @"
-- Limpiar datos existentes (opcional)
DELETE FROM arquitectos WHERE cedula LIKE 'SEED-%';

-- Insertar 5 arquitectos de prueba
INSERT INTO arquitectos (id, cedula, valoracion_prom_proyecto, descripcion, especialidades, ubicacion, verificado, vistas_perfil, usuario_id, created_at, updated_at)
VALUES 
    ('$arq1', 'SEED-001', 4.5, 'Arquitecto senior con 15 anios de experiencia en diseno residencial', 'Diseno Residencial, Remodelaciones', 'Ciudad de Mexico', true, 120, '$usr1', NOW(), NOW()),
    ('$arq2', 'SEED-002', 4.8, 'Especialista en arquitectura sustentable y edificios verdes', 'Arquitectura Sustentable, LEED', 'Guadalajara', true, 85, '$usr2', NOW(), NOW()),
    ('$arq3', 'SEED-003', 0.0, 'Arquitecto junior recien graduado buscando oportunidades', 'Diseno de Interiores', 'Monterrey', false, 15, '$usr3', NOW(), NOW()),
    ('$arq4', 'SEED-004', 3.2, 'Experiencia en proyectos comerciales y centros comerciales', 'Arquitectura Comercial, Retail', 'Puebla', false, 45, '$usr4', NOW(), NOW()),
    ('$arq5', 'SEED-005', 4.0, 'Especialista en restauracion de edificios historicos', 'Restauracion, Patrimonio', 'Oaxaca', false, 60, '$usr5', NOW(), NOW())
ON CONFLICT (cedula) DO UPDATE SET
    valoracion_prom_proyecto = EXCLUDED.valoracion_prom_proyecto,
    descripcion = EXCLUDED.descripcion,
    especialidades = EXCLUDED.especialidades,
    ubicacion = EXCLUDED.ubicacion,
    verificado = EXCLUDED.verificado,
    vistas_perfil = EXCLUDED.vistas_perfil,
    updated_at = NOW();
"@

# SQL para insertar verificaciones
$sqlVerificaciones = @"
-- Limpiar verificaciones existentes para estos arquitectos
DELETE FROM verificaciones WHERE arquitecto_id IN (
    '$arq1', '$arq2', '$arq3', '$arq4', '$arq5'
);

-- Insertar verificaciones con diferentes estados
-- 2 VERIFICADOS, 2 PENDIENTES, 1 RECHAZADO
INSERT INTO verificaciones (id, estado, fecha_verificacion, arquitecto_id, moderador_id, created_at, updated_at)
VALUES 
    -- Arquitecto 1: VERIFICADO
    (gen_random_uuid(), 'verificado', NOW() - INTERVAL '30 days', '$arq1', '$mod1', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),
    
    -- Arquitecto 2: VERIFICADO
    (gen_random_uuid(), 'verificado', NOW() - INTERVAL '15 days', '$arq2', '$mod1', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
    
    -- Arquitecto 3: PENDIENTE
    (gen_random_uuid(), 'pendiente', NOW() - INTERVAL '5 days', '$arq3', '$mod1', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    
    -- Arquitecto 4: PENDIENTE
    (gen_random_uuid(), 'pendiente', NOW() - INTERVAL '2 days', '$arq4', '$mod1', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    
    -- Arquitecto 5: RECHAZADO
    (gen_random_uuid(), 'rechazado', NOW() - INTERVAL '10 days', '$arq5', '$mod1', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');
"@

Write-Host ""
Write-Host "[1/2] Insertando arquitectos en postgres-arquitecto..." -ForegroundColor Yellow
docker exec -i postgres-arquitecto-semana10 psql -U arquitecto_user -d arquitecto_db -c "$sqlArquitectos"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Arquitectos insertados correctamente" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Error insertando arquitectos" -ForegroundColor Red
}

Write-Host ""
Write-Host "[2/2] Insertando verificaciones en postgres-verificacion..." -ForegroundColor Yellow
docker exec -i postgres-verificacion-semana10 psql -U verificacion_user -d verificacion_db -c "$sqlVerificaciones"

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Verificaciones insertadas correctamente" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Error insertando verificaciones" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Verificando datos insertados ===" -ForegroundColor Cyan

Write-Host ""
Write-Host "Arquitectos:" -ForegroundColor Yellow
docker exec -i postgres-arquitecto-semana10 psql -U arquitecto_user -d arquitecto_db -c "SELECT cedula, especialidades, ubicacion, verificado FROM arquitectos WHERE cedula LIKE 'SEED-%' ORDER BY cedula;"

Write-Host ""
Write-Host "Verificaciones:" -ForegroundColor Yellow
docker exec -i postgres-verificacion-semana10 psql -U verificacion_user -d verificacion_db -c "SELECT estado, COUNT(*) as cantidad FROM verificaciones GROUP BY estado ORDER BY estado;"

Write-Host ""
Write-Host "[OK] Seed completado!" -ForegroundColor Green
Write-Host "   - 5 arquitectos creados (2 verificados, 3 no verificados)" -ForegroundColor White
Write-Host "   - 5 verificaciones creadas (2 verificado, 2 pendiente, 1 rechazado)" -ForegroundColor White

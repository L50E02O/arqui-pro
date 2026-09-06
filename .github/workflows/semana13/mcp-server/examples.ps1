# Ejemplos de uso del MCP Server con PowerShell# MCP Server - PowerShell Test Suite

























































































































































































































Write-Host "✓ Ejemplos completados" -ForegroundColor GreenWrite-Host ""}    Write-Host "Error: $_" -ForegroundColor Red} catch {    $response.Content | ConvertFrom-Json | ConvertTo-Json    $response = Invoke-WebRequest -Uri "$BASE_URL/rpc" -Method Post -Headers $headers -Body $bodytry {} | ConvertTo-Json    }        missing_id = $true    params = @{    method = "es_pendiente"    id = "invalid-params-1"    jsonrpc = "2.0"$body = @{Write-Host "POST $BASE_URL/rpc" -ForegroundColor GrayWrite-Host "[10] Error: Parámetros inválidos" -ForegroundColor Blue# ============================================================================# 10. Error: Parámetros Inválidos# ============================================================================Write-Host ""}    Write-Host "Error: $_" -ForegroundColor Red} catch {    $response.Content | ConvertFrom-Json | ConvertTo-Json    $response = Invoke-WebRequest -Uri "$BASE_URL/rpc" -Method Post -Headers $headers -Body $bodytry {} | ConvertTo-Json    params = @{}    method = "tool_que_no_existe"    id = "invalid-tool-1"    jsonrpc = "2.0"$body = @{Write-Host "POST $BASE_URL/rpc" -ForegroundColor GrayWrite-Host "[9] Error: Tool no existe" -ForegroundColor Blue# ============================================================================# 9. Error: Tool No Encontrada# ============================================================================Write-Host ""}    Write-Host "Error: $_" -ForegroundColor Red} catch {    $response.Content | ConvertFrom-Json | ConvertTo-Json    $response = Invoke-WebRequest -Uri "$BASE_URL/rpc" -Method Post -Headers $headers -Body $bodytry {} | ConvertTo-Json    }        razon = "Documentación validada exitosamente"        id = "verify-456"    params = @{    method = "cambiar_a_verificado"    id = "change-to-verified-2"    jsonrpc = "2.0"$body = @{Write-Host "POST $BASE_URL/rpc" -ForegroundColor GrayWrite-Host "[8] cambiar_a_verificado: Con razón" -ForegroundColor Blue# ============================================================================# 8. Cambiar a Verificado (con razón)# ============================================================================Write-Host ""}    Write-Host "Error: $_" -ForegroundColor Red} catch {    $response.Content | ConvertFrom-Json | ConvertTo-Json    $response = Invoke-WebRequest -Uri "$BASE_URL/rpc" -Method Post -Headers $headers -Body $bodytry {} | ConvertTo-Json    }        id = "verify-123"    params = @{    method = "cambiar_a_verificado"    id = "change-to-verified-1"    jsonrpc = "2.0"$body = @{Write-Host "POST $BASE_URL/rpc" -ForegroundColor GrayWrite-Host "[7] cambiar_a_verificado: Sin razón" -ForegroundColor Blue# ============================================================================# 7. Cambiar a Verificado (sin razón)# ============================================================================Write-Host ""}    Write-Host "Error: $_" -ForegroundColor Red} catch {    $response.Content | ConvertFrom-Json | ConvertTo-Json    $response = Invoke-WebRequest -Uri "$BASE_URL/rpc" -Method Post -Headers $headers -Body $bodytry {} | ConvertTo-Json    }        id = "verify-123"    params = @{    method = "es_pendiente"    id = "check-pending-1"    jsonrpc = "2.0"$body = @{Write-Host "POST $BASE_URL/rpc" -ForegroundColor GrayWrite-Host "[6] es_pendiente: Validar estado" -ForegroundColor Blue# ============================================================================# 6. Verificar si es Pendiente# ============================================================================Write-Host ""}    Write-Host "Error: $_" -ForegroundColor Red} catch {    $response.Content | ConvertFrom-Json | ConvertTo-Json    $response = Invoke-WebRequest -Uri "$BASE_URL/rpc" -Method Post -Headers $headers -Body $bodytry {} | ConvertTo-Json    }        estado = "PENDIENTE"        arquitectoId = "arch-456"    params = @{    method = "buscar_verificacion"    id = "search-by-arch-1"    jsonrpc = "2.0"$body = @{Write-Host "POST $BASE_URL/rpc" -ForegroundColor GrayWrite-Host "[5] buscar_verificacion: Buscar por arquitectoId" -ForegroundColor Blue# ============================================================================# 5. Buscar Verificaciones de un Arquitecto# ============================================================================Write-Host ""}    Write-Host "Error: $_" -ForegroundColor Red} catch {    $response.Content | ConvertFrom-Json | ConvertTo-Json    $response = Invoke-WebRequest -Uri "$BASE_URL/rpc" -Method Post -Headers $headers -Body $bodytry {} | ConvertTo-Json    }        limit = 5        estado = "PENDIENTE"    params = @{    method = "buscar_verificacion"    id = "search-pending-1"    jsonrpc = "2.0"$body = @{Write-Host "POST $BASE_URL/rpc" -ForegroundColor GrayWrite-Host "[4] buscar_verificacion: Buscar por estado" -ForegroundColor Blue# ============================================================================# 4. Buscar Verificaciones Pendientes# ============================================================================Write-Host ""}    Write-Host "Error: $_" -ForegroundColor Red} catch {    $response.Content | ConvertFrom-Json | ConvertTo-Json    $response = Invoke-WebRequest -Uri "$BASE_URL/rpc" -Method Post -Headers $headers -Body $bodytry {} | ConvertTo-Json    }        id = "verify-123"    params = @{    method = "buscar_verificacion"    id = "search-by-id-1"    jsonrpc = "2.0"$body = @{Write-Host "POST $BASE_URL/rpc" -ForegroundColor GrayWrite-Host "[3] buscar_verificacion: Buscar por ID" -ForegroundColor Blue# ============================================================================# 3. Buscar Verificación por ID# ============================================================================Write-Host ""}    Write-Host "Error: $_" -ForegroundColor Red} catch {    $response.Content | ConvertFrom-Json | ConvertTo-Json    $response = Invoke-WebRequest -Uri "$BASE_URL/tools" -Method Gettry {Write-Host "GET $BASE_URL/tools" -ForegroundColor GrayWrite-Host "[2] Listar tools disponibles" -ForegroundColor Blue# ============================================================================# 2. Listar Tools Disponibles# ============================================================================Write-Host ""}    Write-Host "Error: $_" -ForegroundColor Red} catch {    $response.Content | ConvertFrom-Json | ConvertTo-Json    $response = Invoke-WebRequest -Uri "$BASE_URL/health" -Method Gettry {Write-Host "GET $BASE_URL/health" -ForegroundColor GrayWrite-Host "[1] Verificar estado del servidor" -ForegroundColor Blue# ============================================================================# 1. Health Check# ============================================================================}    "Content-Type" = "application/json"$headers = @{$BASE_URL = "http://localhost:9000"Write-Host ""Write-Host "════════════════════════════════════════════════════════" -ForegroundColor CyanWrite-Host "   MCP Server - Ejemplos con PowerShell" -ForegroundColor CyanWrite-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan# Asume que el servidor está corriendo en http://localhost:9000# Ejemplos de pruebas usando PowerShell
# 
# Ejecutar: .\examples.ps1

param(
    [string]$BaseUrl = "http://localhost:3500"
)

$MCP_RPC_URL = "$BaseUrl/rpc"

Write-Host "================================" -ForegroundColor Green
Write-Host "MCP Server - PowerShell Test Suite" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Función auxiliar para hacer requests JSON-RPC
function Invoke-MCPTool {
    param(
        [string]$Method,
        [hashtable]$Params,
        [string]$Id = (Get-Random -Minimum 1000 -Maximum 9999).ToString()
    )
    
    $body = @{
        jsonrpc = "2.0"
        method = $Method
        id = $Id
    }
    
    if ($Params) {
        $body["params"] = $Params
    }
    
    Write-Host "[$Method] ID: $Id" -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $MCP_RPC_URL `
            -Method Post `
            -Headers @{"Content-Type" = "application/json"} `
            -Body ($body | ConvertTo-Json -Depth 10) `
            -ErrorAction Stop
        
        $result = $response.Content | ConvertFrom-Json
        
        if ($result.error) {
            Write-Host "❌ Error: $($result.error.message)" -ForegroundColor Red
            if ($result.error.data) {
                Write-Host "Data: $($result.error.data | ConvertTo-Json)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "✓ Exitoso" -ForegroundColor Green
            Write-Host ($result.result | ConvertTo-Json -Depth 5) -ForegroundColor White
        }
    } catch {
        Write-Host "❌ Error de conexión: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Test 1: Health Check
Write-Host "[Test 1] GET /health" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/health" -Method Get
    Write-Host $response.Content -ForegroundColor White
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: List Tools
Write-Host "[Test 2] tools.list - Listar todos los tools" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.list" -Id "test-1"

# Test 3: Get All Tools with Schemas
Write-Host "[Test 3] tools.all - Obtener todos con esquemas" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.all" -Id "test-2"

# Test 4: Describe buscar_verificacion
Write-Host "[Test 4] tools.describe - Describir buscar_verificacion" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.describe" `
    -Params @{name = "buscar_verificacion"} `
    -Id "test-3"

# Test 5: Describe es_pendiente
Write-Host "[Test 5] tools.describe - Describir es_pendiente" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.describe" `
    -Params @{name = "es_pendiente"} `
    -Id "test-4"

# Test 6: Describe cambiar_a_verificado
Write-Host "[Test 6] tools.describe - Describir cambiar_a_verificado" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.describe" `
    -Params @{name = "cambiar_a_verificado"} `
    -Id "test-5"

# Test 7: Buscar por ID
Write-Host "[Test 7] buscar_verificacion - Buscar por ID" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.call" `
    -Params @{
        name = "buscar_verificacion"
        params = @{
            id = "550e8400-e29b-41d4-a716-446655440000"
        }
    } `
    -Id "test-6"

# Test 8: Buscar por Arquitecto
Write-Host "[Test 8] buscar_verificacion - Buscar por arquitecto_id" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.call" `
    -Params @{
        name = "buscar_verificacion"
        params = @{
            arquitecto_id = "660e8400-e29b-41d4-a716-446655440001"
        }
    } `
    -Id "test-7"

# Test 9: Buscar por Estado
Write-Host "[Test 9] buscar_verificacion - Buscar por estado" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.call" `
    -Params @{
        name = "buscar_verificacion"
        params = @{
            estado = "pendiente"
        }
    } `
    -Id "test-8"

# Test 10: es_pendiente
Write-Host "[Test 10] es_pendiente - Validar si está pendiente" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.call" `
    -Params @{
        name = "es_pendiente"
        params = @{
            id = "550e8400-e29b-41d4-a716-446655440000"
        }
    } `
    -Id "test-9"

# Test 11: cambiar_a_verificado (sin validación)
Write-Host "[Test 11] cambiar_a_verificado - Sin validación de estado" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.call" `
    -Params @{
        name = "cambiar_a_verificado"
        params = @{
            id = "550e8400-e29b-41d4-a716-446655440000"
            moderador_id = "880e8400-e29b-41d4-a716-446655440003"
            razon = "Documentación verificada"
            validar_pendiente = "false"
        }
    } `
    -Id "test-10"

# Test 12: cambiar_a_verificado (con validación)
Write-Host "[Test 12] cambiar_a_verificado - Con validación de estado" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.call" `
    -Params @{
        name = "cambiar_a_verificado"
        params = @{
            id = "550e8400-e29b-41d4-a716-446655440000"
            moderador_id = "880e8400-e29b-41d4-a716-446655440003"
            razon = "Verificación completada"
            validar_pendiente = "true"
        }
    } `
    -Id "test-11"

# Test 13: Error - UUID Inválido
Write-Host "[Test 13] Error - UUID inválido" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.call" `
    -Params @{
        name = "buscar_verificacion"
        params = @{
            id = "uuid-invalido"
        }
    } `
    -Id "test-12"

# Test 14: Error - Parámetro requerido faltante
Write-Host "[Test 14] Error - Parámetro requerido faltante" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.call" `
    -Params @{
        name = "es_pendiente"
        params = @{}
    } `
    -Id "test-13"

# Test 15: Error - Tool no existe
Write-Host "[Test 15] Error - Tool no existe" -ForegroundColor Yellow
Invoke-MCPTool -Method "tools.call" `
    -Params @{
        name = "tool_inexistente"
        params = @{}
    } `
    -Id "test-14"

Write-Host "================================" -ForegroundColor Green
Write-Host "Test Suite Completado" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

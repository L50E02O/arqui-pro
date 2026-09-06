# Ejemplos de Test para Gemini Integration
# Para Windows PowerShell 5.1+

$apiUrl = "http://localhost:3000"
$headers = @{"Content-Type" = "application/json"}

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Gemini Integration - API Testing (PowerShell)             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# ============================================
# TEST 1: Health Check
# ============================================
Write-Host ""
Write-Host "=== TEST 1: Health Check ===" -ForegroundColor Yellow
Write-Host "GET $apiUrl/api/gemini/health" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/api/gemini/health" -Method Get
    $json = $response.Content | ConvertFrom-Json
    $json | ConvertTo-Json | Write-Host -ForegroundColor Green
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

# ============================================
# TEST 2: List Tools
# ============================================
Write-Host ""
Write-Host "=== TEST 2: List Available Tools ===" -ForegroundColor Yellow
Write-Host "GET $apiUrl/api/gemini/tools" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "$apiUrl/api/gemini/tools" -Method Get
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Count: $($json.count)" -ForegroundColor Green
    $json.tools | ForEach-Object {
        Write-Host "  - $($_.name): $($_.description)" -ForegroundColor White
    }
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

# ============================================
# TEST 3: Simple Query
# ============================================
Write-Host ""
Write-Host "=== TEST 3: Simple Query ===" -ForegroundColor Yellow
Write-Host 'POST $apiUrl/api/gemini/ask with message: "¿Hola Gemini?"' -ForegroundColor Gray
try {
    $body = @{"message" = "¿Hola Gemini?"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$apiUrl/api/gemini/ask" `
        -Method Post -Headers $headers -Body $body
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($json.response)" -ForegroundColor Green
    Write-Host "Tools Used: $($json.toolsUsed)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

# ============================================
# TEST 4: Query About Verifications
# ============================================
Write-Host ""
Write-Host "=== TEST 4: Count Verifications ===" -ForegroundColor Yellow
Write-Host 'POST with message: "¿Cuántas verificaciones hay?"' -ForegroundColor Gray
try {
    $body = @{"message" = "¿Cuántas verificaciones hay?"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$apiUrl/api/gemini/ask" `
        -Method Post -Headers $headers -Body $body
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($json.response)" -ForegroundColor Green
    Write-Host "Tools Used: $($json.toolsUsed)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

# ============================================
# TEST 5: Query Pending Verifications
# ============================================
Write-Host ""
Write-Host "=== TEST 5: Pending Verifications ===" -ForegroundColor Yellow
Write-Host 'POST with message: "¿Cuáles son las verificaciones pendientes?"' -ForegroundColor Gray
try {
    $body = @{"message" = "¿Cuáles son las verificaciones pendientes?"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$apiUrl/api/gemini/ask" `
        -Method Post -Headers $headers -Body $body
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($json.response)" -ForegroundColor Green
    Write-Host "Tools Used: $($json.toolsUsed)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

# ============================================
# TEST 6: Check If Pending
# ============================================
Write-Host ""
Write-Host "=== TEST 6: Check If Pending ===" -ForegroundColor Yellow
Write-Host 'POST with message: "¿Está pendiente la verificación 1?"' -ForegroundColor Gray
try {
    $body = @{"message" = "¿Está pendiente la verificación 1?"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$apiUrl/api/gemini/ask" `
        -Method Post -Headers $headers -Body $body
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($json.response)" -ForegroundColor Green
    Write-Host "Tools Used: $($json.toolsUsed)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

# ============================================
# TEST 7: Update Verification
# ============================================
Write-Host ""
Write-Host "=== TEST 7: Update Verification ===" -ForegroundColor Yellow
Write-Host 'POST with message: "Marca la verificación 1 como verificada"' -ForegroundColor Gray
try {
    $body = @{"message" = "Marca la verificación 1 como verificada"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$apiUrl/api/gemini/ask" `
        -Method Post -Headers $headers -Body $body
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($json.response)" -ForegroundColor Green
    Write-Host "Tools Used: $($json.toolsUsed)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

# ============================================
# TEST 8: Update with Comment
# ============================================
Write-Host ""
Write-Host "=== TEST 8: Update With Comment ===" -ForegroundColor Yellow
Write-Host 'POST with comment' -ForegroundColor Gray
try {
    $body = @{"message" = "Marca la verificación 1 como verificada con comentario: Cumple especificaciones"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$apiUrl/api/gemini/ask" `
        -Method Post -Headers $headers -Body $body
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($json.response)" -ForegroundColor Green
    Write-Host "Tools Used: $($json.toolsUsed)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

# ============================================
# TEST 9: Complex Query
# ============================================
Write-Host ""
Write-Host "=== TEST 9: Complex Query ===" -ForegroundColor Yellow
Write-Host 'POST with complex message' -ForegroundColor Gray
try {
    $body = @{"message" = "Busca todas las verificaciones pendientes"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$apiUrl/api/gemini/ask" `
        -Method Post -Headers $headers -Body $body
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($json.response)" -ForegroundColor Green
    Write-Host "Tools Used: $($json.toolsUsed)" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

# ============================================
# TEST 10: Test Endpoint
# ============================================
Write-Host ""
Write-Host "=== TEST 10: Test Endpoint ===" -ForegroundColor Yellow
Write-Host 'POST to test endpoint' -ForegroundColor Gray
try {
    $body = @{"message" = "Este es un mensaje de prueba"} | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$apiUrl/api/gemini/test" `
        -Method Post -Headers $headers -Body $body
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Response: $($json.response)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
}

# ============================================
# Summary
# ============================================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ All Tests Completed                                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host ""
Write-Host "Documentation available at:" -ForegroundColor Cyan
Write-Host "  - SETUP_GEMINI.md" -ForegroundColor White
Write-Host "  - api-gateway/GEMINI_INTEGRATION.md" -ForegroundColor White
Write-Host "  - api-gateway/GEMINI_TESTING.md" -ForegroundColor White

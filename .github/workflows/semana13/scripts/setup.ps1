# Setup script para la integración de Gemini + MCP Server
# Para Windows PowerShell 5.1+

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Gemini + MCP Server Integration Setup (Windows)           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Function para verificar si comando existe
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
if (Test-CommandExists node) {
    $nodeVersion = node -v
    Write-Host "✓ Node.js $nodeVersion encontrado" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js no encontrado. Por favor instala Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Step 1: Configurando MCP Server                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$mcpServerPath = "2parcial\semana13\mcp-server"
if (Test-Path $mcpServerPath) {
    Write-Host "Entrando al directorio mcp-server..." -ForegroundColor Yellow
    Push-Location $mcpServerPath
    
    if (-Not (Test-Path "node_modules")) {
        Write-Host "Instalando dependencias de MCP Server..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ MCP Server dependencias instaladas" -ForegroundColor Green
        } else {
            Write-Host "✗ Error al instalar MCP Server dependencias" -ForegroundColor Red
            Pop-Location
            exit 1
        }
    } else {
        Write-Host "✓ MCP Server dependencias ya instaladas" -ForegroundColor Green
    }
    
    Pop-Location
} else {
    Write-Host "⚠ Directorio mcp-server no encontrado en $mcpServerPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Step 2: Configurando API Gateway                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$apiGatewayPath = "2parcial\semana13\api-gateway"
if (Test-Path $apiGatewayPath) {
    Write-Host "Entrando al directorio api-gateway..." -ForegroundColor Yellow
    Push-Location $apiGatewayPath
    
    if (-Not (Test-Path "node_modules")) {
        Write-Host "Instalando dependencias de API Gateway..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ API Gateway dependencias instaladas" -ForegroundColor Green
        } else {
            Write-Host "✗ Error al instalar API Gateway dependencias" -ForegroundColor Red
            Pop-Location
            exit 1
        }
    } else {
        Write-Host "✓ API Gateway dependencias ya instaladas" -ForegroundColor Green
    }
    
    # Verificar si .env existe
    if (-Not (Test-Path ".env")) {
        Write-Host ""
        Write-Host "⚠ Archivo .env no encontrado" -ForegroundColor Yellow
        Write-Host "Creando .env basado en .env.example..." -ForegroundColor Yellow
        
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "✓ Archivo .env creado" -ForegroundColor Green
        } else {
            Write-Host "✗ No se encontró .env.example" -ForegroundColor Red
            Pop-Location
            exit 1
        }
        
        Write-Host ""
        Write-Host "IMPORTANTE: Debes editar el archivo .env e insertar tu GEMINI_API_KEY" -ForegroundColor Red
        Write-Host ""
        Write-Host "Opciones para editar .env:" -ForegroundColor Yellow
        Write-Host "  1. Notepad: notepad .env" -ForegroundColor White
        Write-Host "  2. VS Code: code .env" -ForegroundColor White
        Write-Host "  3. PowerShell: .\.env | notepad" -ForegroundColor White
        Write-Host ""
        
        $response = Read-Host "¿Ya configuraste GEMINI_API_KEY en .env? (s/n)"
        if ($response -ne "s" -And $response -ne "S") {
            Write-Host "Por favor configura GEMINI_API_KEY primero" -ForegroundColor Red
            Pop-Location
            exit 1
        }
    } else {
        Write-Host "✓ Archivo .env ya existe" -ForegroundColor Green
    }
    
    Pop-Location
} else {
    Write-Host "✗ Directorio api-gateway no encontrado en $apiGatewayPath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Setup Completado ✓                                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. En PowerShell Terminal 1, inicia MCP Server:" -ForegroundColor Cyan
Write-Host "   cd 2parcial\semana13\mcp-server" -ForegroundColor White
Write-Host "   npm run start" -ForegroundColor White
Write-Host ""
Write-Host "2. En PowerShell Terminal 2, inicia API Gateway:" -ForegroundColor Cyan
Write-Host "   cd 2parcial\semana13\api-gateway" -ForegroundColor White
Write-Host "   npm run start" -ForegroundColor White
Write-Host ""
Write-Host "3. En PowerShell Terminal 3, prueba la integración:" -ForegroundColor Cyan
Write-Host '   Invoke-WebRequest -Uri "http://localhost:3000/api/gemini/health" -Method Get | Select-Object -ExpandProperty Content | ConvertFrom-Json | Format-List' -ForegroundColor White
Write-Host ""
Write-Host "Para más información, consulta:" -ForegroundColor Yellow
Write-Host "  - 2parcial\semana13\SETUP_GEMINI.md" -ForegroundColor White
Write-Host "  - 2parcial\semana13\api-gateway\GEMINI_INTEGRATION.md" -ForegroundColor White
Write-Host "  - 2parcial\semana13\api-gateway\GEMINI_TESTING.md" -ForegroundColor White
Write-Host ""
Write-Host "¡Listo para integrar Gemini! 🚀" -ForegroundColor Green

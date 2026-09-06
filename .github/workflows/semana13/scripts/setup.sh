#!/bin/bash

# Setup script para la integración de Gemini + MCP Server
# Este script configura todo lo necesario para ejecutar la integración

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Gemini + MCP Server Integration Setup                   ║"
echo "║  (para Linux/MacOS)                                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Color functions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} encontrado${NC}"
else
    echo -e "${RED}✗ Node.js no encontrado. Por favor instala Node.js 18+${NC}"
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Step 1: Configurando MCP Server                         ║"
echo "╚══════════════════════════════════════════════════════════╝"

if [ -d "2parcial/semana13/mcp-server" ]; then
    echo "Entrando al directorio mcp-server..."
    cd 2parcial/semana13/mcp-server
    
    if [ ! -d "node_modules" ]; then
        echo "Instalando dependencias de MCP Server..."
        npm install
    else
        echo -e "${GREEN}✓ MCP Server dependencias ya instaladas${NC}"
    fi
    
    cd ../../../
else
    echo -e "${YELLOW}⚠ Directorio mcp-server no encontrado${NC}"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Step 2: Configurando API Gateway                        ║"
echo "╚══════════════════════════════════════════════════════════╝"

if [ -d "2parcial/semana13/api-gateway" ]; then
    echo "Entrando al directorio api-gateway..."
    cd 2parcial/semana13/api-gateway
    
    if [ ! -d "node_modules" ]; then
        echo "Instalando dependencias de API Gateway..."
        npm install
    else
        echo -e "${GREEN}✓ API Gateway dependencias ya instaladas${NC}"
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo ""
        echo -e "${YELLOW}⚠ Archivo .env no encontrado${NC}"
        echo "Creando .env basado en .env.example..."
        cp .env.example .env
        echo -e "${GREEN}✓ Archivo .env creado${NC}"
        echo ""
        echo -e "${YELLOW}IMPORTANTE:${NC} Debes editar el archivo .env e insertar tu GEMINI_API_KEY"
        echo "Ejecuta: nano .env (o usa tu editor favorito)"
        echo ""
        read -p "¿Ya configuraste GEMINI_API_KEY en .env? (s/n): " response
        if [[ ! "$response" =~ ^[sS]$ ]]; then
            echo -e "${RED}Por favor configura GEMINI_API_KEY primero${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✓ Archivo .env ya existe${NC}"
    fi
    
    cd ../../../
else
    echo -e "${RED}✗ Directorio api-gateway no encontrado${NC}"
    exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Setup Completado ✓                                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Próximos pasos:"
echo ""
echo "1. En Terminal 1, inicia MCP Server:"
echo "   $ cd 2parcial/semana13/mcp-server"
echo "   $ npm run start"
echo ""
echo "2. En Terminal 2, inicia API Gateway:"
echo "   $ cd 2parcial/semana13/api-gateway"
echo "   $ npm run start"
echo ""
echo "3. En Terminal 3, prueba la integración:"
echo "   $ curl -X GET http://localhost:3000/api/gemini/health"
echo ""
echo "Para más información, consulta:"
echo "  - 2parcial/semana13/SETUP_GEMINI.md"
echo "  - 2parcial/semana13/api-gateway/GEMINI_INTEGRATION.md"
echo "  - 2parcial/semana13/api-gateway/GEMINI_TESTING.md"
echo ""

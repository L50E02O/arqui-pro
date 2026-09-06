#!/bin/bash#!/bin/bash






















































































































































































echo -e "${GREEN}✓ Ejemplos completados${NC}"echo ""  }' | jq .    }      "missing_id": true    "params": {    "method": "es_pendiente",    "id": "invalid-params-1",    "jsonrpc": "2.0",  -d '{  -H "$CONTENT_TYPE" \curl -s -X POST "$BASE_URL/rpc" \echo ""echo "POST $BASE_URL/rpc"echo -e "${BLUE}[10] Error: Parámetros inválidos${NC}"# ============================================================================# 10. Error: Parámetros Inválidos# ============================================================================echo ""  }' | jq .    "params": {}    "method": "tool_que_no_existe",    "id": "invalid-tool-1",    "jsonrpc": "2.0",  -d '{  -H "$CONTENT_TYPE" \curl -s -X POST "$BASE_URL/rpc" \echo ""echo "POST $BASE_URL/rpc"echo -e "${BLUE}[9] Error: Tool no existe${NC}"# ============================================================================# 9. Error: Tool No Encontrada# ============================================================================echo ""  }' | jq .    }      "razon": "Documentación validada exitosamente"      "id": "verify-456",    "params": {    "method": "cambiar_a_verificado",    "id": "change-to-verified-2",    "jsonrpc": "2.0",  -d '{  -H "$CONTENT_TYPE" \curl -s -X POST "$BASE_URL/rpc" \echo ""echo "POST $BASE_URL/rpc"echo -e "${BLUE}[8] cambiar_a_verificado: Con razón${NC}"# ============================================================================# 8. Cambiar a Verificado (con razón)# ============================================================================echo ""  }' | jq .    }      "id": "verify-123"    "params": {    "method": "cambiar_a_verificado",    "id": "change-to-verified-1",    "jsonrpc": "2.0",  -d '{  -H "$CONTENT_TYPE" \curl -s -X POST "$BASE_URL/rpc" \echo ""echo "POST $BASE_URL/rpc"echo -e "${BLUE}[7] cambiar_a_verificado: Sin razón${NC}"# ============================================================================# 7. Cambiar a Verificado (sin razón)# ============================================================================echo ""  }' | jq .    }      "id": "verify-123"    "params": {    "method": "es_pendiente",    "id": "check-pending-1",    "jsonrpc": "2.0",  -d '{  -H "$CONTENT_TYPE" \curl -s -X POST "$BASE_URL/rpc" \echo ""echo "POST $BASE_URL/rpc"echo -e "${BLUE}[6] es_pendiente: Validar estado${NC}"# ============================================================================# 6. Verificar si es Pendiente# ============================================================================echo ""  }' | jq .    }      "estado": "PENDIENTE"      "arquitectoId": "arch-456",    "params": {    "method": "buscar_verificacion",    "id": "search-by-arch-1",    "jsonrpc": "2.0",  -d '{  -H "$CONTENT_TYPE" \curl -s -X POST "$BASE_URL/rpc" \echo ""echo "POST $BASE_URL/rpc"echo -e "${BLUE}[5] buscar_verificacion: Buscar por arquitectoId${NC}"# ============================================================================# 5. Buscar Verificaciones de un Arquitecto# ============================================================================echo ""  }' | jq .    }      "limit": 5      "estado": "PENDIENTE",    "params": {    "method": "buscar_verificacion",    "id": "search-pending-1",    "jsonrpc": "2.0",  -d '{  -H "$CONTENT_TYPE" \curl -s -X POST "$BASE_URL/rpc" \echo ""echo "POST $BASE_URL/rpc"echo -e "${BLUE}[4] buscar_verificacion: Buscar por estado${NC}"# ============================================================================# 4. Buscar Verificaciones Pendientes# ============================================================================echo ""  }' | jq .    }      "id": "verify-123"    "params": {    "method": "buscar_verificacion",    "id": "search-by-id-1",    "jsonrpc": "2.0",  -d '{  -H "$CONTENT_TYPE" \curl -s -X POST "$BASE_URL/rpc" \echo ""echo "POST $BASE_URL/rpc"echo -e "${BLUE}[3] buscar_verificacion: Buscar por ID${NC}"# ============================================================================# 3. Buscar Verificación por ID# ============================================================================echo ""curl -s "$BASE_URL/tools" | jq .echo "GET $BASE_URL/tools"echo -e "${BLUE}[2] Listar tools disponibles${NC}"# ============================================================================# 2. Listar Tools Disponibles# ============================================================================echo ""curl -s "$BASE_URL/health" | jq .echo "GET $BASE_URL/health"echo -e "${BLUE}[1] Verificar estado del servidor${NC}"# ============================================================================# 1. Health Check# ============================================================================NC='\033[0m'YELLOW='\033[1;33m'BLUE='\033[0;34m'GREEN='\033[0;32m'# Colores para outputCONTENT_TYPE="Content-Type: application/json"BASE_URL="http://localhost:9000"# Variablesecho ""echo "╚════════════════════════════════════════════════════════╝"echo "║   MCP Server - Ejemplos con cURL                       ║"echo "╔════════════════════════════════════════════════════════╗"# Asume que el servidor está corriendo en http://localhost:9000# Ejemplos de uso del MCP Server con cURL
# MCP Server - Test Suite
# Ejemplos de pruebas usando cURL
# 
# Ejecutar: bash examples.sh

BASE_URL="http://localhost:3500/rpc"

echo "=================================="
echo "MCP Server - Test Suite"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo -e "${BLUE}[Test 1] GET /health${NC}"
curl -X GET http://localhost:3500/health
echo ""
echo ""

# Test 2: List Tools
echo -e "${BLUE}[Test 2] List Tools (tools.list)${NC}"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.list",
    "id": "1"
  }'
echo ""
echo ""

# Test 3: Get All Tools with Schemas
echo -e "${BLUE}[Test 3] Get All Tools with Schemas (tools.all)${NC}"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.all",
    "id": "2"
  }'
echo ""
echo ""

# Test 4: Describe buscar_verificacion Tool
echo -e "${BLUE}[Test 4] Describe Tool: buscar_verificacion${NC}"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.describe",
    "params": {
      "name": "buscar_verificacion"
    },
    "id": "3"
  }'
echo ""
echo ""

# Test 5: Buscar Verificación por ID
echo -e "${BLUE}[Test 5] Call Tool: buscar_verificacion (search by ID)${NC}"
echo -e "${YELLOW}Note: Cambia el ID con un UUID válido de tu base de datos${NC}"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "buscar_verificacion",
      "params": {
        "id": "550e8400-e29b-41d4-a716-446655440000"
      }
    },
    "id": "4"
  }'
echo ""
echo ""

# Test 6: Buscar Verificación por Arquitecto
echo -e "${BLUE}[Test 6] Call Tool: buscar_verificacion (search by arquitecto_id)${NC}"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "buscar_verificacion",
      "params": {
        "arquitecto_id": "660e8400-e29b-41d4-a716-446655440001"
      }
    },
    "id": "5"
  }'
echo ""
echo ""

# Test 7: Buscar Verificación por Estado
echo -e "${BLUE}[Test 7] Call Tool: buscar_verificacion (search by estado)${NC}"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "buscar_verificacion",
      "params": {
        "estado": "pendiente"
      }
    },
    "id": "6"
  }'
echo ""
echo ""

# Test 8: Validar si está Pendiente
echo -e "${BLUE}[Test 8] Call Tool: es_pendiente${NC}"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "es_pendiente",
      "params": {
        "id": "550e8400-e29b-41d4-a716-446655440000"
      }
    },
    "id": "7"
  }'
echo ""
echo ""

# Test 9: Cambiar a Verificado (SIN validación)
echo -e "${BLUE}[Test 9] Call Tool: cambiar_a_verificado (sin validación)${NC}"
echo -e "${YELLOW}Note: Cambia el ID y moderador_id con UUIDs válidos${NC}"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "cambiar_a_verificado",
      "params": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "moderador_id": "880e8400-e29b-41d4-a716-446655440003",
        "razon": "Documentación completa y verificada",
        "validar_pendiente": "false"
      }
    },
    "id": "8"
  }'
echo ""
echo ""

# Test 10: Cambiar a Verificado (CON validación)
echo -e "${BLUE}[Test 10] Call Tool: cambiar_a_verificado (con validación)${NC}"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "cambiar_a_verificado",
      "params": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "moderador_id": "880e8400-e29b-41d4-a716-446655440003",
        "razon": "Verificación completada",
        "validar_pendiente": "true"
      }
    },
    "id": "9"
  }'
echo ""
echo ""

# Test 11: Error - Parámetros Inválidos
echo -e "${BLUE}[Test 11] Error Test: Invalid UUID${NC}"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "buscar_verificacion",
      "params": {
        "id": "invalid-uuid"
      }
    },
    "id": "10"
  }'
echo ""
echo ""

# Test 12: Error - Parámetros Faltantes
echo -e "${BLUE}[Test 12] Error Test: Missing required parameter${NC}"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "es_pendiente",
      "params": {}
    },
    "id": "11"
  }'
echo ""
echo ""

# Test 13: Error - Tool no existe
echo -e "${BLUE}[Test 13] Error Test: Tool not found${NC}"
curl -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools.call",
    "params": {
      "name": "tool_inexistente",
      "params": {}
    },
    "id": "12"
  }'
echo ""
echo ""

echo -e "${GREEN}=================================="
echo "Test Suite Completado"
echo "==================================${NC}"

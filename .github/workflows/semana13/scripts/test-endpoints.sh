#!/bin/bash

# Ejemplos de cURL para Testing Gemini Integration
# Copia y pega directamente en tu terminal

# ============================================
# ENDPOINT 1: Health Check
# ============================================
echo "=== Testing Health Endpoint ==="
curl -X GET http://localhost:3000/api/gemini/health

echo ""
echo ""

# ============================================
# ENDPOINT 2: List Tools
# ============================================
echo "=== Listing Available Tools ==="
curl -X GET http://localhost:3000/api/gemini/tools

echo ""
echo ""

# ============================================
# ENDPOINT 3: Simple Query
# ============================================
echo "=== Simple Query Test ==="
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Hola Gemini?"}'

echo ""
echo ""

# ============================================
# ENDPOINT 4: Query About Verifications
# ============================================
echo "=== Query: Count Verifications ==="
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuántas verificaciones hay?"}'

echo ""
echo ""

# ============================================
# ENDPOINT 5: Query Pending Verifications
# ============================================
echo "=== Query: Pending Verifications ==="
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Cuáles son las verificaciones pendientes?"}'

echo ""
echo ""

# ============================================
# ENDPOINT 6: Check If Pending
# ============================================
echo "=== Query: Check If Verification Is Pending ==="
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "¿Está pendiente la verificación 1?"}'

echo ""
echo ""

# ============================================
# ENDPOINT 7: Update Verification
# ============================================
echo "=== Query: Update Verification ==="
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Marca la verificación 1 como verificada"}'

echo ""
echo ""

# ============================================
# ENDPOINT 8: Update with Comment
# ============================================
echo "=== Query: Update With Comment ==="
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Marca la verificación 1 como verificada con comentario: Cumple especificaciones"}'

echo ""
echo ""

# ============================================
# ENDPOINT 9: Complex Query
# ============================================
echo "=== Query: Complex (Multiple Tools) ==="
curl -X POST http://localhost:3000/api/gemini/ask \
  -H "Content-Type: application/json" \
  -d '{"message": "Busca todas las verificaciones pendientes y dime cuál es la más antigua"}'

echo ""
echo ""

# ============================================
# ENDPOINT 10: Test Endpoint
# ============================================
echo "=== Test Endpoint ==="
curl -X POST http://localhost:3000/api/gemini/test \
  -H "Content-Type: application/json" \
  -d '{"message": "Este es un mensaje de prueba"}'

echo ""
echo ""

echo "✅ All test commands completed!"

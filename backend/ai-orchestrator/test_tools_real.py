"""
Test Script para verificar que las MCP Tools funcionan con datos REALES
Ejecutar con: python test_tools_real.py
Asegúrate de que Rails esté corriendo en http://localhost:3000
"""

import asyncio
import sys
import os

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.mcp import MCPServer

# Colores para output
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
BLUE = "\033[94m"
RESET = "\033[0m"


async def test_buscar_arquitectos():
    """Test 1: Buscar arquitectos REALES"""
    print(f"\n{BLUE}═══════════════════════════════════════════════════════════{RESET}")
    print(f"{BLUE}[SEARCH]  TEST 1: Buscar Arquitectos REALES{RESET}")
    print(f"{BLUE}═══════════════════════════════════════════════════════════{RESET}")
    
    mcp = MCPServer()
    tool = mcp.get_tool("buscar_arquitectos")
    
    if not tool:
        print(f"{RED}[ERROR]  Tool 'buscar_arquitectos' no encontrada{RESET}")
        return False
    
    result = await tool.safe_execute()
    
    if result["success"]:
        data = result["data"]
        print(f"{GREEN}[SUCCESS]  Éxito! Datos REALES de la BD:{RESET}")
        print(f"   Total arquitectos: {data.get('total', 0)}")
        print(f"   Fuente: {data.get('fuente', 'desconocida')}")
        
        if data.get("arquitectos"):
            print(f"   Primeros arquitectos:")
            for arq in data["arquitectos"][:3]:
                print(f"      - ID: {arq['id']}, Nombre: {arq['nombre']}, Ubicación: {arq['ubicacion']}")
        return True
    else:
        print(f"{RED}[ERROR]  Error: {result.get('error', 'Error desconocido')}{RESET}")
        if "sugerencia" in result.get("data", {}):
            print(f"{YELLOW}   [NOTE]  {result['data']['sugerencia']}{RESET}")
        return False


async def test_listar_proyectos():
    """Test 2: Listar proyectos REALES"""
    print(f"\n{BLUE}═══════════════════════════════════════════════════════════{RESET}")
    print(f"{BLUE}[LIST]  TEST 2: Listar Proyectos REALES{RESET}")
    print(f"{BLUE}═══════════════════════════════════════════════════════════{RESET}")
    
    mcp = MCPServer()
    tool = mcp.get_tool("listar_proyectos")
    
    if not tool:
        print(f"{RED}[ERROR]  Tool 'listar_proyectos' no encontrada{RESET}")
        return False
    
    result = await tool.safe_execute()
    
    if result["success"]:
        data = result["data"]
        print(f"{GREEN}[SUCCESS]  Éxito! Datos REALES de la BD:{RESET}")
        print(f"   Total proyectos: {data.get('total', 0)}")
        
        if data.get("proyectos"):
            print(f"   Primeros proyectos:")
            for p in data["proyectos"][:3]:
                print(f"      - ID: {p['id']}, Título: {p['titulo']}, Estado: {p['estado']}")
        return True
    else:
        print(f"{RED}[ERROR]  Error: {result.get('error', 'Error desconocido')}{RESET}")
        return False


async def test_verificaciones():
    """Test 3: Listar verificaciones REALES"""
    print(f"\n{BLUE}═══════════════════════════════════════════════════════════{RESET}")
    print(f"{BLUE}[OK]  TEST 3: Listar Verificaciones REALES{RESET}")
    print(f"{BLUE}═══════════════════════════════════════════════════════════{RESET}")
    
    mcp = MCPServer()
    tool = mcp.get_tool("verificaciones")
    
    if not tool:
        print(f"{RED}[ERROR]  Tool 'verificaciones' no encontrada{RESET}")
        return False
    
    result = await tool.safe_execute()
    
    if result["success"]:
        data = result["data"]
        print(f"{GREEN}[SUCCESS]  Éxito! Datos REALES de la BD:{RESET}")
        print(f"   Total verificaciones: {data.get('total', 0)}")
        
        if data.get("verificaciones"):
            print(f"   Primeras verificaciones:")
            for v in data["verificaciones"][:3]:
                print(f"      - ID: {v['id']}, Estado: {v['estado']}, Arquitecto: {v['arquitecto_nombre']}")
        return True
    else:
        print(f"{RED}[ERROR]  Error: {result.get('error', 'Error desconocido')}{RESET}")
        return False


async def test_crear_solicitud_simulado():
    """Test 4: Crear solicitud (verificación de endpoint)"""
    print(f"\n{BLUE}═══════════════════════════════════════════════════════════{RESET}")
    print(f"{BLUE}[NOTE]  TEST 4: Verificar endpoint Crear Solicitud{RESET}")
    print(f"{BLUE}═══════════════════════════════════════════════════════════{RESET}")
    
    mcp = MCPServer()
    tool = mcp.get_tool("crear_solicitud")
    
    if not tool:
        print(f"{RED}[ERROR]  Tool 'crear_solicitud' no encontrada{RESET}")
        return False
    
    # Este test verificará si el endpoint está disponible
    # Pasamos un contexto simulado
    result = await tool.safe_execute(
        descripcion="Test de conexión - no crear",
        context={
            "user_id": "test-user-123",
            "user_role": "cliente"
        }
    )
    
    # Verificamos si hay conexión al servidor
    data = result.get("data", {})
    if data.get("creado_en_bd"):
        print(f"{GREEN}[SUCCESS]  Endpoint funcionando correctamente{RESET}")
        print(f"   Se creó solicitud ID: {data.get('solicitud', {}).get('id')}")
        return True
    elif "conectar" in str(data.get("error", "")).lower():
        print(f"{YELLOW}[WARN]  Rails API no disponible{RESET}")
        print(f"   Ejecuta: cd backend/APIREST && rails server")
        return False
    else:
        print(f"{YELLOW}[WARN]  Respuesta: {data}{RESET}")
        return False


async def main():
    """Ejecutar todos los tests"""
    print(f"\n{BLUE}╔═══════════════════════════════════════════════════════════╗{RESET}")
    print(f"{BLUE}║    [TEST]  TEST DE MCP TOOLS CON DATOS REALES                  ║{RESET}")
    print(f"{BLUE}║    Asegúrate de que Rails esté corriendo                  ║{RESET}")
    print(f"{BLUE}║    cd backend/APIREST && rails server                     ║{RESET}")
    print(f"{BLUE}╚═══════════════════════════════════════════════════════════╝{RESET}")
    
    results = []
    
    # Test 1: Buscar arquitectos
    results.append(("Buscar Arquitectos", await test_buscar_arquitectos()))
    
    # Test 2: Listar proyectos
    results.append(("Listar Proyectos", await test_listar_proyectos()))
    
    # Test 3: Verificaciones
    results.append(("Verificaciones", await test_verificaciones()))
    
    # Test 4: Crear solicitud (verificación)
    results.append(("Crear Solicitud", await test_crear_solicitud_simulado()))
    
    # Resumen
    print(f"\n{BLUE}═══════════════════════════════════════════════════════════{RESET}")
    print(f"{BLUE}[METRICS]  RESUMEN DE TESTS{RESET}")
    print(f"{BLUE}═══════════════════════════════════════════════════════════{RESET}")
    
    passed = 0
    failed = 0
    
    for name, success in results:
        if success:
            print(f"   {GREEN}[SUCCESS]  {name}: PASÓ{RESET}")
            passed += 1
        else:
            print(f"   {RED}[ERROR]  {name}: FALLÓ{RESET}")
            failed += 1
    
    print(f"\n   Total: {passed} pasados, {failed} fallidos")
    
    if failed == 0:
        print(f"\n{GREEN} ¡Todos los tests pasaron! Las tools funcionan con datos REALES{RESET}")
    else:
        print(f"\n{YELLOW}[WARN]  Algunos tests fallaron. Verifica que Rails esté corriendo.{RESET}")


if __name__ == "__main__":
    asyncio.run(main())

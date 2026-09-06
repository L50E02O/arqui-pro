"""
Script de testing para AI Orchestrator
Prueba las diferentes funcionalidades del chatbot
"""

import requests
import json


BASE_URL = "http://localhost:8001"


def print_response(title: str, response: dict):
    """Imprime respuesta formateada"""
    print(f"\n{'='*60}")
    print(f"[TEST]  {title}")
    print(f"{'='*60}")
    print(json.dumps(response, indent=2, ensure_ascii=False))
    print(f"{'='*60}\n")


def test_health():
    """Test 1: Health check"""
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response.json())
    return response.status_code == 200


def test_list_tools():
    """Test 2: Listar tools disponibles"""
    response = requests.get(f"{BASE_URL}/api/v1/tools")
    tools = response.json()
    
    print(f"\n[TOOL]  Tools disponibles ({len(tools)}):")
    for tool in tools:
        print(f"  - {tool['name']}: {tool['description'][:50]}...")
    
    return len(tools) >= 5


def test_chat_simple():
    """Test 3: Chat simple sin tools"""
    payload = {
        "message": "Hola, ¿qué servicios ofreces?",
        "user_id": "test-user-123"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/chat",
        json=payload
    )
    
    result = response.json()
    print_response("Chat Simple", result)
    return response.status_code == 200


def test_buscar_arquitectos():
    """Test 4: Búsqueda de arquitectos (invoca tool)"""
    payload = {
        "message": "Busca arquitectos especializados en diseño moderno en Bogotá",
        "user_id": "test-user-123",
        "context": {"rol": "cliente"}
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/chat",
        json=payload
    )
    
    result = response.json()
    print_response("Búsqueda de Arquitectos", result)
    
    # Verificar que se ejecutó la tool
    tools_executed = result.get("tools_executed", [])
    if tools_executed:
        print(f"[SUCCESS]  Tool ejecutada: {tools_executed[0]['tool_name']}")
        return True
    else:
        print("[WARN]   No se ejecutó ninguna tool")
        return False


def test_estadisticas():
    """Test 5: Solicitar estadísticas (invoca tool de reporte)"""
    payload = {
        "message": "Muéstrame las estadísticas del arquitecto con ID abc-123",
        "user_id": "test-user-123",
        "context": {"rol": "moderador"}
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/chat",
        json=payload
    )
    
    result = response.json()
    print_response("Estadísticas de Arquitecto", result)
    return response.status_code == 200


def test_crear_solicitud():
    """Test 6: Crear solicitud de proyecto (invoca tool de acción)"""
    payload = {
        "message": """
        Quiero crear una solicitud de proyecto:
        - Arquitecto: Juan Pérez (ID: arq-456)
        - Descripción: Remodelación de cocina
        - Presupuesto: 25000000
        - Plazo: 45 días
        - Ubicación: Bogotá
        """,
        "user_id": "cliente-789",
        "context": {"rol": "cliente"}
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/chat",
        json=payload
    )
    
    result = response.json()
    print_response("Crear Solicitud de Proyecto", result)
    return response.status_code == 200


def test_execute_tool_directly():
    """Test 7: Ejecutar tool directamente (sin LLM)"""
    tool_name = "buscar_arquitectos"
    params = {
        "ubicacion": "Medellín",
        "rating_min": 4.0
    }
    
    response = requests.post(
        f"{BASE_URL}/api/v1/tools/{tool_name}/execute",
        json=params
    )
    
    result = response.json()
    print_response(f"Ejecutar Tool: {tool_name}", result)
    return result.get("success", False)


def run_all_tests():
    """Ejecuta todos los tests"""
    print("\n" + "="*60)
    print("[START]  Iniciando tests del AI Orchestrator")
    print("="*60)
    
    tests = [
        ("Health Check", test_health),
        ("Listar Tools", test_list_tools),
        ("Chat Simple", test_chat_simple),
        ("Buscar Arquitectos", test_buscar_arquitectos),
        ("Estadísticas", test_estadisticas),
        ("Crear Solicitud", test_crear_solicitud),
        ("Ejecutar Tool Directamente", test_execute_tool_directly)
    ]
    
    results = []
    
    for name, test_func in tests:
        print(f"\n▶️  Ejecutando: {name}...")
        try:
            success = test_func()
            results.append((name, success))
            print(f"[SUCCESS]  {name}: {'PASS' if success else 'FAIL'}")
        except Exception as e:
            results.append((name, False))
            print(f"[ERROR]  {name}: ERROR - {e}")
    
    # Resumen
    print("\n" + "="*60)
    print("[METRICS]  RESUMEN DE TESTS")
    print("="*60)
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for name, success in results:
        status = "[SUCCESS]  PASS" if success else "[ERROR]  FAIL"
        print(f"{status:15} {name}")
    
    print(f"\n[STATS]  Total: {passed}/{total} tests pasados ({passed/total*100:.1f}%)")
    print("="*60 + "\n")


if __name__ == "__main__":
    import sys
    
    # Verificar que el servidor esté corriendo
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        if response.status_code != 200:
            print("[ERROR]  Error: Servidor no está saludable")
            sys.exit(1)
    except requests.exceptions.ConnectionError:
        print(f"[ERROR]  Error: No se puede conectar a {BASE_URL}")
        print("\n[NOTE]  Asegúrate de que el servidor esté corriendo:")
        print("   python main.py")
        sys.exit(1)
    
    # Ejecutar tests
    run_all_tests()

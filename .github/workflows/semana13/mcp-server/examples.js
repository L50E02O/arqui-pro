/**// MCP Server - Test Suite en JavaScript/Node.js


































































































































































































































module.exports = { executeTool, makeRequest };}  });    showGeminiIntegration();  runExamples().then(() => {if (require.main === module) {// Ejecutar}  `);[Base de Datos]    ↓[Backend Microservicio] (REST)    ↓[MCP Server] (JSON-RPC 2.0)    ↓[Gemini] (Function Calling)    ↓[API Gateway] (NestJS)    ↓User RequestARQUITECTURA GENERAL:   → Usa buscar_verificacion para mostrar estado actual   → Gemini informa que no puede cambiar porque no está pendiente3. Si resultado.esPendiente = false:   → Retorna éxito   → Gemini ejecuta cambiar_a_verificado(id=verify-456)2. Si resultado.esPendiente = true:1. Gemini ejecuta es_pendiente(id=verify-456) para validarUsuario: "Marca verify-456 como verificado"FLUJO DE CAMBIO DE ESTADO:   "Sí, la verificación verify-123 está pendiente"5. Gemini procesa resultado y responde al usuario:   }     }       estadoActual: "PENDIENTE"       esPendiente: true,       id: "verify-123",     data: {     success: true,   {4. MCP Server ejecuta la tool y retorna:   }     params: { id: "verify-123" }     method: "es_pendiente",     id: "request-1",     jsonrpc: "2.0",   POST /rpc {3. Gemini decide usar es_pendiente:   - cambiar_a_verificado   - es_pendiente   - buscar_verificacion2. Gemini recibe el prompt y disponibles tools MCP:   "¿Está pendiente la verificación verify-123?"1. Usuario envía prompt a través de API Gateway:El flujo típico sería:╚════════════════════════════════════════════════════════╝║   Integración con Gemini Function Calling              ║╔════════════════════════════════════════════════════════╗  console.log(`function showGeminiIntegration() { */ * (Este es pseudocódigo - requiere Google Generative AI SDK) * Ejemplo de integración con Gemini Function Calling/**}  console.log('\n✓ Ejemplos completados\n');  }    console.error('Error global:', error);  } catch (error) {    });      // Falta el parámetro 'id'    await executeTool('es_pendiente', {    console.log('\n[8] Error: Parámetros inválidos');    // 8. Error: Parámetros inválidos    await executeTool('herramienta_inexistente', {});    console.log('\n[7] Error: Tool no existe');    // 7. Error: Tool no existe    });      razon: 'Aprobado después de revisión exhaustiva',      id: 'verify-456',    await executeTool('cambiar_a_verificado', {    console.log('\n[6] Cambiar a verificado');    // 6. Cambiar a verificado    });      id: 'verify-123',    await executeTool('es_pendiente', {    console.log('\n[5] Validar si verificación es pendiente');    // 5. Validar si es pendiente    });      limit: 5,      estado: 'PENDIENTE',    await executeTool('buscar_verificacion', {    console.log('\n[4] Buscar todas las verificaciones pendientes');    // 4. Buscar todas las pendientes    });      id: 'verify-123',    await executeTool('buscar_verificacion', {    console.log('\n[3] Buscar verificación por ID');    // 3. Buscar verificación por ID    console.log('Tools disponibles:', Object.keys(tools.data.tools).join(', '));    const tools = await makeRequest('GET', '/tools');    console.log('\n[2] Listar Tools');    // 2. Listar tools    console.log('Backend:', health.data.backend.status);    console.log('Status:', health.status);    const health = await makeRequest('GET', '/health');    console.log('\n[1] Health Check');    // 1. Health check  try {  `);╚════════════════════════════════════════════════════════╝║   MCP Server - Ejemplos JavaScript                     ║╔════════════════════════════════════════════════════════╗  console.log(`async function runExamples() { */ * Ejemplos principales/**}  }    console.error('❌ Error:', error.message);  } catch (error) {    return response.data;    console.log(JSON.stringify(response.data, null, 2));    console.log('✓ Respuesta:');    const response = await makeRequest('POST', '/rpc', request);  try {  console.log('Parámetros:', params);  console.log(`\n📤 Ejecutando: ${method}`);  };    params,    method,    id,    jsonrpc: '2.0',  const request = {  const id = `${method}-${Date.now()}`;async function executeTool(method, params = {}) { */ * Ejecuta una tool via JSON-RPC/**}  });    req.end();    }      req.write(JSON.stringify(data));    if (data) {    req.on('error', reject);    });      });        }          });            data: body,            status: res.statusCode,          resolve({        } catch (e) {          });            data: JSON.parse(body),            status: res.statusCode,          resolve({        try {      res.on('end', () => {      });        body += chunk;      res.on('data', (chunk) => {      let body = '';    const req = http.request(options, (res) => {    };      },        'Content-Type': 'application/json',      headers: {      method: method,      path: url.pathname + url.search,      port: url.port || 80,      hostname: url.hostname,    const options = {    const url = new URL(BASE_URL + path);  return new Promise((resolve, reject) => {function makeRequest(method, path, data = null) { */ * Helper para hacer requests HTTP/**const BASE_URL = 'http://localhost:9000';const http = require('http'); */ * Ejecutar con: node examples.js * Ejemplos de uso del MCP Server// 
// Uso:
// node examples.js
// node examples.js http://localhost:3500

const BASE_URL = process.argv[2] || 'http://localhost:3500';
const MCP_RPC_URL = `${BASE_URL}/rpc`;

/**
 * Función auxiliar para hacer requests
 */
async function invoke(method, params, id = `req-${Date.now()}`) {
  const payload = {
    jsonrpc: '2.0',
    method,
    id,
  };

  if (params) {
    payload.params = params;
  }

  console.log(`\n[${method}] ID: ${id}`);
  console.log('Request:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(MCP_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.error) {
      console.error('❌ Error:', result.error.message);
      if (result.error.data) {
        console.error('Data:', JSON.stringify(result.error.data, null, 2));
      }
    } else {
      console.log('✓ Exitoso');
      console.log('Result:', JSON.stringify(result.result, null, 2));
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

/**
 * Ejecutar tests
 */
async function runTests() {
  console.log('════════════════════════════════════════');
  console.log('MCP Server - JavaScript Test Suite');
  console.log('════════════════════════════════════════');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`MCP RPC URL: ${MCP_RPC_URL}`);

  // Test 1: Health Check
  console.log('\n\n--- Test 1: GET /health ---');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test 2: List Tools
  console.log('\n--- Test 2: tools.list ---');
  await invoke('tools.list', null, '1');

  // Test 3: Get All Tools
  console.log('\n--- Test 3: tools.all ---');
  await invoke('tools.all', null, '2');

  // Test 4: Describe buscar_verificacion
  console.log('\n--- Test 4: tools.describe (buscar_verificacion) ---');
  await invoke('tools.describe', { name: 'buscar_verificacion' }, '3');

  // Test 5: Describe es_pendiente
  console.log('\n--- Test 5: tools.describe (es_pendiente) ---');
  await invoke('tools.describe', { name: 'es_pendiente' }, '4');

  // Test 6: Describe cambiar_a_verificado
  console.log('\n--- Test 6: tools.describe (cambiar_a_verificado) ---');
  await invoke('tools.describe', { name: 'cambiar_a_verificado' }, '5');

  // Test 7: Buscar por ID
  console.log('\n--- Test 7: buscar_verificacion (por ID) ---');
  await invoke(
    'tools.call',
    {
      name: 'buscar_verificacion',
      params: {
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
    '6'
  );

  // Test 8: Buscar por arquitecto_id
  console.log('\n--- Test 8: buscar_verificacion (por arquitecto_id) ---');
  await invoke(
    'tools.call',
    {
      name: 'buscar_verificacion',
      params: {
        arquitecto_id: '660e8400-e29b-41d4-a716-446655440001',
      },
    },
    '7'
  );

  // Test 9: Buscar por estado
  console.log('\n--- Test 9: buscar_verificacion (por estado) ---');
  await invoke(
    'tools.call',
    {
      name: 'buscar_verificacion',
      params: {
        estado: 'pendiente',
      },
    },
    '8'
  );

  // Test 10: es_pendiente
  console.log('\n--- Test 10: es_pendiente ---');
  await invoke(
    'tools.call',
    {
      name: 'es_pendiente',
      params: {
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    },
    '9'
  );

  // Test 11: cambiar_a_verificado (sin validación)
  console.log('\n--- Test 11: cambiar_a_verificado (sin validación) ---');
  await invoke(
    'tools.call',
    {
      name: 'cambiar_a_verificado',
      params: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        moderador_id: '880e8400-e29b-41d4-a716-446655440003',
        razon: 'Documentación completa',
        validar_pendiente: 'false',
      },
    },
    '10'
  );

  // Test 12: cambiar_a_verificado (con validación)
  console.log('\n--- Test 12: cambiar_a_verificado (con validación) ---');
  await invoke(
    'tools.call',
    {
      name: 'cambiar_a_verificado',
      params: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        moderador_id: '880e8400-e29b-41d4-a716-446655440003',
        razon: 'Verificación completada',
        validar_pendiente: 'true',
      },
    },
    '11'
  );

  // Test 13: Error - UUID inválido
  console.log('\n--- Test 13: Error - UUID inválido ---');
  await invoke(
    'tools.call',
    {
      name: 'buscar_verificacion',
      params: {
        id: 'uuid-invalido',
      },
    },
    '12'
  );

  // Test 14: Error - Parámetro faltante
  console.log('\n--- Test 14: Error - Parámetro faltante ---');
  await invoke(
    'tools.call',
    {
      name: 'es_pendiente',
      params: {},
    },
    '13'
  );

  // Test 15: Error - Tool no existe
  console.log('\n--- Test 15: Error - Tool no existe ---');
  await invoke(
    'tools.call',
    {
      name: 'tool_inexistente',
      params: {},
    },
    '14'
  );

  console.log('\n\n════════════════════════════════════════');
  console.log('Test Suite Completado');
  console.log('════════════════════════════════════════');
}

// Ejecutar tests
runTests().catch(console.error);

// Cliente de prueba para el microservicio websocket (socket.io-client)
// Uso:
// npm install socket.io-client
//
// MODO 1 - Sin autenticacion (solo eventos en memoria):
// node test-client.js
//
// MODO 2 - Con autenticacion (para crear mensajes reales):
// TOKEN="Bearer tu_jwt_aqui" node test-client.js
//
// MODO 3 - Testing completo con API REST:
// 1. Inicia API REST: cd backend/APIREST && rails s
// 2. Obten token: curl -X POST http://localhost:3002/login -d '{"email":"test@test.com","password":"123456"}'
// 3. Ejecuta: TOKEN="Bearer eyJ..." node test-client.js

const { io } = require('socket.io-client');

const WS_HOST = process.env.WS_HOST || 'http://localhost:3006';
const TOKEN = process.env.TOKEN || 'Bearer <tu_jwt_aqui>';
const USUARIO_ID = process.env.USUARIO_ID;
const CONVERSACION_ID = process.env.CONVERSACION_ID;

if (!USUARIO_ID || !CONVERSACION_ID) {
  console.error('[ERROR] Se requiere USUARIO_ID y CONVERSACION_ID como variables de entorno');
  process.exit(1);
}

// Namespace de Chat
const chat = io(WS_HOST + '/chat', {
  extraHeaders: { Authorization: TOKEN },
  transports: ['websocket']
});

chat.on('connect', () => {
  console.log('[INFO] Chat conectado con ID:', chat.id);
  chat.emit('join_conversation', { conversacion_id: CONVERSACION_ID });
  setTimeout(() => {
    chat.emit('message:create', {
      contenido: 'Prueba desde test-client',
      remitente_id: USUARIO_ID,
      conversacion_id: CONVERSACION_ID
    });
  }, 500);
});

chat.on('connection:established', (data) => {
  console.log('[INFO] Conexion establecida:', data);
});

chat.on('conversation:joined', (data) => {
  console.log('[INFO] Unido a conversacion:', data);
});

chat.on('message:new', (m) => {
  console.log('[INFO] Nuevo mensaje recibido:', m);
});

chat.on('error', (error) => console.error('[ERROR] Error en chat:', error));

// Namespace de Mensajes
const mensajes = io(WS_HOST + '/mensajes', { extraHeaders: { Authorization: TOKEN } });

mensajes.on('connect', () => {
  console.log('[INFO] Mensajes conectado con ID:', mensajes.id);
  mensajes.emit('join_conversation', { conversacion_id: CONVERSACION_ID });
  setTimeout(() => {
    mensajes.emit('message:create', {
      contenido: 'Prueba desde namespace de mensajes',
      emisor_id: USUARIO_ID,
      conversacion_id: CONVERSACION_ID,
      tipo: 'texto'
    });
  }, 1000);
});

mensajes.on('conversation:joined', (data) => {
  console.log('[INFO] Mensajes - Unido a conversacion:', data);
});

mensajes.on('message:new', (m) => {
  console.log('[INFO] Nuevo mensaje en namespace mensajes:', m);
});

mensajes.on('error', (error) => {
  console.error('[ERROR] Error en mensajes:', error);
});

// Namespace de Notificaciones
const noti = io(WS_HOST + '/notificacion', { extraHeaders: { Authorization: TOKEN } });

noti.on('connect', () => {
  console.log('[INFO] Notificaciones conectado con ID:', noti.id);
  console.log('[INFO] Enviando evento usuario:conectar');
  noti.emit('usuario:conectar', { usuario_id: 'test-user-123' });
});

noti.on('usuario:conectado', (data) => {
  console.log('[INFO] Usuario conectado:', data);
});

noti.on('usuario:online', (data) => {
  console.log('[INFO] Usuario online:', data);
});

noti.on('notificacion:nueva', (n) => {
  console.log('[INFO] Nueva notificacion recibida:', n);
});

noti.on('notificacion:sistema', (n) => {
  console.log('[INFO] Notificacion del sistema:', n);
});

noti.on('disconnect', () => {
  console.log('[INFO] Notificaciones desconectado');
});

noti.on('connect_error', (error) => {
  console.error('[ERROR] Error de conexion en notificaciones:', error.message);
});

chat.on('error', (err) => {
  console.error('[ERROR] Error en chat:', err);
  if (err.message === 'could_not_create_message') {
    console.error('[INFO] Asegurate de que la API REST este en ejecucion en el puerto configurado');
  }
});

noti.on('error', (e) => console.error('[ERROR] Error en notificaciones:', e));

console.log('\n[INFO] Cliente WebSocket ejecutandose. Presiona Ctrl+C para detener.');

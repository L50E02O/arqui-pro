"""
Query 9: Buscar Conversaciones
Búsqueda avanzada de conversaciones con múltiples filtros.
"""
import strawberry
from typing import Optional, List
from infrastructure.rest_client import rest_client
from graphql_types.historial_conversacion import HistorialConversacion
from adapters.schemas.conversacion_schema import ConversacionType
from adapters.schemas.cliente_schema import ClienteType
from adapters.schemas.arquitecto_schema import ArquitectoType
from adapters.schemas.usuario_schema import UsuarioType
from adapters.schemas.mensaje_schema import MensajeType


async def resolver_buscar_conversaciones(
    proyecto_id: Optional[strawberry.ID] = None,
    cliente_id: Optional[strawberry.ID] = None,
    arquitecto_id: Optional[strawberry.ID] = None
) -> List[HistorialConversacion]:
    """
    Búsqueda avanzada de conversaciones:
    - Filtro por proyecto
    - Filtro por cliente
    - Filtro por arquitecto
    Retorna lista de historiales de conversaciones que cumplan criterios
    """
    try:
        # Obtener todas las conversaciones
        conversaciones_data = await rest_client.get_conversaciones()
        resultados = []
        
        for conv in conversaciones_data:
            # Aplicar filtro de proyecto
            if proyecto_id is not None:
                if str(conv.get("proyecto_id")) != str(proyecto_id):
                    continue
            
            # Aplicar filtro de cliente
            if cliente_id is not None:
                if str(conv.get("cliente_id")) != str(cliente_id):
                    continue
            
            # Aplicar filtro de arquitecto
            if arquitecto_id is not None:
                if str(conv.get("arquitecto_id")) != str(arquitecto_id):
                    continue
            
            # Construir conversacion
            conversacion = ConversacionType(
                id=conv.get("id"),
                fecha=conv.get("fecha"),
                cliente_id=conv.get("cliente_id"),
                arquitecto_id=conv.get("arquitecto_id"),
            )
            
            # Obtener datos del cliente
            try:
                cli_data = await rest_client.get_cliente(str(conv.get("cliente_id")))
                cli_usuario_data = cli_data.get("usuario", {})
                
                cliente = ClienteType(
                    id=cli_data.get("id"),
                    cedula=cli_data.get("cedula"),
                    usuario_id=cli_usuario_data.get("id"),
                )
                
                cliente_usuario = UsuarioType(
                    id=cli_usuario_data.get("id"),
                    nombre=cli_usuario_data.get("nombre"),
                    apellido=cli_usuario_data.get("apellido"),
                    email=cli_usuario_data.get("email"),
                    estado_cuenta=cli_usuario_data.get("estado_cuenta"),
                    rol=cli_usuario_data.get("rol"),
                    fecha_registro=cli_usuario_data.get("fecha_registro"),
                    foto_perfil=cli_usuario_data.get("foto_perfil"),
                )
            except:
                continue  # Saltar si no se puede obtener cliente
            
            # Obtener datos del arquitecto
            try:
                arq_data = await rest_client.get_arquitecto(str(conv.get("arquitecto_id")))
                arq_usuario_data = arq_data.get("usuario", {})
                
                arquitecto = ArquitectoType(
                    id=arq_data.get("id"),
                    cedula=arq_data.get("cedula"),
                    valoracion_prom_proyecto=arq_data.get("valoracion_prom_proyecto") or 0.0,
                    descripcion=arq_data.get("descripcion") or "",
                    especialidades=arq_data.get("especialidades") or "",
                    ubicacion=arq_data.get("ubicacion") or "",
                    verificado=arq_data.get("verificado") or False,
                    vistas_perfil=arq_data.get("vistas_perfil") or 0,
                    usuario_id=arq_usuario_data.get("id"),
                )
                
                arquitecto_usuario = UsuarioType(
                    id=arq_usuario_data.get("id"),
                    nombre=arq_usuario_data.get("nombre"),
                    apellido=arq_usuario_data.get("apellido"),
                    email=arq_usuario_data.get("email"),
                    estado_cuenta=arq_usuario_data.get("estado_cuenta"),
                    rol=arq_usuario_data.get("rol"),
                    fecha_registro=arq_usuario_data.get("fecha_registro"),
                    foto_perfil=arq_usuario_data.get("foto_perfil"),
                )
            except:
                continue  # Saltar si no se puede obtener arquitecto
            
            # Obtener mensajes de la conversación
            mensajes_data = await rest_client.get_mensajes(params={"conversacion_id": str(conv.get("id"))})
            mensajes_filtrados = [m for m in mensajes_data if str(m.get("conversacion_id")) == str(conv.get("id"))]
            
            mensajes_list = [
                MensajeType(
                    id=m.get("id"),
                    contenido=m.get("contenido"),
                    fecha_envio=m.get("fecha_envio"),
                    leido=m.get("leido") or False,
                    conversacion_id=m.get("conversacion_id"),
                    usuario_emisor_id=m.get("usuario_emisor_id"),
                )
                for m in mensajes_filtrados
            ]
            
            # Contar mensajes no leídos
            mensajes_no_leidos = sum(1 for m in mensajes_filtrados if not m.get("leido"))
            
            # Construir historial
            historial = HistorialConversacion(
                conversacion=conversacion,
                cliente=cliente,
                cliente_usuario=cliente_usuario,
                arquitecto=arquitecto,
                arquitecto_usuario=arquitecto_usuario,
                mensajes=mensajes_list,
                total_mensajes=len(mensajes_list),
                mensajes_no_leidos=mensajes_no_leidos
            )
            resultados.append(historial)
        
        return resultados
    except Exception as e:
        print(f"[ERROR]  Error en buscarConversaciones: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

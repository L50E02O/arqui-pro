"""
Query 3: Historial de Conversación
Obtiene el historial completo de una conversación con participantes y mensajes.
"""
import strawberry
from typing import Optional
from infrastructure.rest_client import rest_client
from graphql_types.historial_conversacion import HistorialConversacion
from adapters.schemas.arquitecto_schema import ArquitectoType
from adapters.schemas.usuario_schema import UsuarioType
from adapters.schemas.cliente_schema import ClienteType
from adapters.schemas.conversacion_schema import ConversacionType
from adapters.schemas.mensaje_schema import MensajeType


async def resolver_historial_conversacion(conversacion_id: strawberry.ID) -> Optional[HistorialConversacion]:
    """
    Obtiene el historial completo de una conversación incluyendo:
    - Datos de la conversación
    - Cliente y su usuario
    - Arquitecto y su usuario
    - Lista completa de mensajes
    - Total de mensajes y mensajes no leídos
    """
    try:
        # Obtener conversación
        conv_data = await rest_client.get_conversacion(str(conversacion_id))
        conversacion = ConversacionType(
            id=conv_data.get("id"),
            fecha=conv_data.get("fecha"),
            cliente_id=conv_data.get("cliente_id"),
            arquitecto_id=conv_data.get("arquitecto_id"),
        )
        
        # Obtener cliente
        cli_data = await rest_client.get_cliente(str(conv_data.get("cliente_id")))
        
        # El serializer de Rails incluye el usuario completo
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
        
        # Obtener arquitecto
        arq_data = await rest_client.get_arquitecto(str(conv_data.get("arquitecto_id")))
        
        # El serializer de Rails incluye el usuario completo
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
        
        # Obtener mensajes
        mensajes_data = await rest_client.get_mensajes(params={"conversacion_id": str(conversacion_id)})
        mensajes = [
            MensajeType(
                id=m.get("id"),
                contenido=m.get("contenido"),
                fecha_envio=m.get("fecha_envio"),
                leido=m.get("leido") or False,
                conversacion_id=m.get("conversacion_id"),
                remitente_id=m.get("remitente_id"),
            )
            for m in mensajes_data
            if str(m.get("conversacion_id")) == str(conversacion_id)
        ]
        
        # Contar mensajes no leídos
        no_leidos = sum(1 for m in mensajes if not m.leido)
        
        return HistorialConversacion(
            conversacion=conversacion,
            cliente=cliente,
            cliente_usuario=cliente_usuario,
            arquitecto=arquitecto,
            arquitecto_usuario=arquitecto_usuario,
            mensajes=mensajes,
            total_mensajes=len(mensajes),
            mensajes_no_leidos=no_leidos
        )
    except Exception as e:
        print(f"[ERROR]  Error en historialConversacion: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

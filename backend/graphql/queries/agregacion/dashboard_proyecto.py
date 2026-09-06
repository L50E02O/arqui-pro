"""
Query 2: Dashboard de Proyecto
Obtiene un dashboard completo de un proyecto con toda la información relevante.
"""
import strawberry
from typing import Optional
from infrastructure.rest_client import rest_client
from graphql_types.dashboard_proyecto import DashboardProyecto
from adapters.schemas.arquitecto_schema import ArquitectoType
from adapters.schemas.usuario_schema import UsuarioType
from adapters.schemas.cliente_schema import ClienteType
from adapters.schemas.proyecto_schema import ProyectoType
from adapters.schemas.avance_schema import AvanceType
from adapters.schemas.valoracion_schema import ValoracionType


async def resolver_dashboard_proyecto(proyecto_id: strawberry.ID) -> Optional[DashboardProyecto]:
    """
    Obtiene un dashboard completo de un proyecto incluyendo:
    - Datos del proyecto
    - Arquitecto responsable y su usuario
    - Cliente y su usuario (si existe)
    - Lista de avances
    - Lista de valoraciones
    - Métricas calculadas
    """
    try:
        # Obtener proyecto
        proy_data = await rest_client.get_proyecto(str(proyecto_id))
        proyecto = ProyectoType(
            id=proy_data.get("id"),
            titulo_proyecto=proy_data.get("titulo_proyecto"),
            valoracion_promedio=proy_data.get("valoracion_promedio") or 0.0,
            descripcion=proy_data.get("descripcion") or "",
            tipo_proyecto=proy_data.get("tipo_proyecto") or "",
            fecha_publicacion=proy_data.get("fecha_publicacion"),
            arquitecto_id=proy_data.get("arquitecto_id"),
            conversacion_id=proy_data.get("conversacion_id"),
            cliente_id=proy_data.get("cliente_id"),
            solicitud_proyecto_id=proy_data.get("solicitud_proyecto_id"),
        )
        
        # Obtener arquitecto
        arq_data = await rest_client.get_arquitecto(str(proy_data.get("arquitecto_id")))
        
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
        
        # Usar el usuario que ya viene en la respuesta del arquitecto
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
        
        # Obtener cliente (opcional)
        cliente = None
        cliente_usuario = None
        if proy_data.get("cliente_id"):
            try:
                cli_data = await rest_client.get_cliente(str(proy_data.get("cliente_id")))
                
                # El serializer de Rails incluye el usuario completo
                cli_usuario_data = cli_data.get("usuario", {})
                
                cliente = ClienteType(
                    id=cli_data.get("id"),
                    cedula=cli_data.get("cedula"),
                    usuario_id=cli_usuario_data.get("id"),
                )
                
                # Usar el usuario que ya viene en la respuesta del cliente
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
                pass
        
        # Obtener avances
        avances_data = await rest_client.get_avances(params={"proyecto_id": str(proyecto_id)})
        avances = [
            AvanceType(
                id=a.get("id"),
                descripcion=a.get("descripcion"),
                fecha=a.get("fecha"),
                proyecto_id=a.get("proyecto_id"),
            )
            for a in avances_data
            if str(a.get("proyecto_id")) == str(proyecto_id)
        ]
        
        # Obtener valoraciones
        valoraciones_data = await rest_client.get_valoraciones(params={"proyecto_id": str(proyecto_id)})
        valoraciones = [
            ValoracionType(
                id=v.get("id"),
                calificacion=v.get("calificacion"),
                comentario=v.get("comentario"),
                fecha=v.get("fecha"),
                cliente_id=v.get("cliente_id"),
                proyecto_id=v.get("proyecto_id"),
            )
            for v in valoraciones_data
            if str(v.get("proyecto_id")) == str(proyecto_id)
        ]
        
        # Calcular valoración promedio
        if valoraciones:
            val_prom = sum(v.calificacion for v in valoraciones) / len(valoraciones)
        else:
            val_prom = proy_data.get("valoracion_promedio") or 0.0
        
        return DashboardProyecto(
            proyecto=proyecto,
            arquitecto=arquitecto,
            arquitecto_usuario=arquitecto_usuario,
            cliente=cliente,
            cliente_usuario=cliente_usuario,
            avances=avances,
            valoraciones=valoraciones,
            total_avances=len(avances),
            valoracion_promedio=val_prom
        )
    except Exception as e:
        print(f"[ERROR]  Error en dashboardProyecto: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

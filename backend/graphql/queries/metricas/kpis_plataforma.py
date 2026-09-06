"""
Query 5: KPIs de la Plataforma
Obtiene KPIs generales de toda la plataforma.
"""
from infrastructure.rest_client import rest_client
from graphql_types.kpis_plataforma import KPIsPlataforma, UsuariosPorRol


async def resolver_kpis_plataforma() -> KPIsPlataforma:
    """
    Obtiene KPIs generales de la plataforma:
    - Total de usuarios
    - Usuarios agrupados por rol
    - Total de proyectos
    - Total de arquitectos y clientes
    - Total de incidencias
    - Arquitectos verificados
    """
    try:
        # Obtener todos los usuarios
        usuarios_data = await rest_client.get_usuarios()
        total_usuarios = len(usuarios_data)
        
        # Agrupar por rol
        roles_dict = {}
        for u in usuarios_data:
            rol = u.get("rol") or "sin_rol"
            roles_dict[rol] = roles_dict.get(rol, 0) + 1
        
        usuarios_por_rol = [
            UsuariosPorRol(rol=rol, cantidad=cant)
            for rol, cant in roles_dict.items()
        ]
        
        # Obtener proyectos
        proyectos_data = await rest_client.get_proyectos()
        total_proyectos = len(proyectos_data)
        
        # Obtener arquitectos
        arquitectos_data = await rest_client.get_arquitectos()
        total_arquitectos = len(arquitectos_data)
        arquitectos_verificados = sum(1 for a in arquitectos_data if a.get("verificado"))
        
        # Obtener clientes
        clientes_data = await rest_client.get_clientes()
        total_clientes = len(clientes_data)
        
        # Obtener incidencias
        incidencias_data = await rest_client.get_incidencias()
        total_incidencias = len(incidencias_data)
        
        return KPIsPlataforma(
            total_usuarios=total_usuarios,
            usuarios_por_rol=usuarios_por_rol,
            total_proyectos=total_proyectos,
            total_arquitectos=total_arquitectos,
            total_clientes=total_clientes,
            total_incidencias=total_incidencias,
            arquitectos_verificados=arquitectos_verificados
        )
    except Exception as e:
        print(f"[ERROR]  Error en kpisPlataforma: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

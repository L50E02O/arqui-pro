# src/main.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import strawberry
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, JSONResponse
from strawberry.fastapi import GraphQLRouter
from typing import Optional, List

# Importar tipos personalizados
from graphql_types.perfil_completo_arquitecto import PerfilCompletoArquitecto
from graphql_types.dashboard_proyecto import DashboardProyecto
from graphql_types.historial_conversacion import HistorialConversacion
from graphql_types.estadisticas_arquitecto import EstadisticasArquitecto
from graphql_types.kpis_plataforma import KPIsPlataforma
from graphql_types.metricas_proyecto import MetricasProyecto
from graphql_types.arquitecto_busqueda import ArquitectoBusqueda
from graphql_types.reporte_incidencias import ReporteIncidencias

# Importar resolvers de queries - Grupo 1: Información Agregada
from queries.agregacion.perfil_completo_arquitecto import resolver_perfil_completo_arquitecto
from queries.agregacion.dashboard_proyecto import resolver_dashboard_proyecto
from queries.agregacion.historial_conversacion import resolver_historial_conversacion

# Importar resolvers de queries - Grupo 2: Análisis y Métricas
from queries.metricas.estadisticas_arquitecto import resolver_estadisticas_arquitecto
from queries.metricas.kpis_plataforma import resolver_kpis_plataforma
from queries.metricas.metricas_proyecto import resolver_metricas_proyecto

# Importar resolvers de queries - Grupo 3: Búsqueda Avanzada
from queries.busqueda.buscar_arquitectos import resolver_buscar_arquitectos
from queries.busqueda.buscar_proyectos import resolver_buscar_proyectos
from queries.busqueda.buscar_conversaciones import resolver_buscar_conversaciones
from queries.busqueda.buscar_incidencias import resolver_buscar_incidencias


@strawberry.type
class Query:
    """
    Root Query Type - 9 Queries Especializadas.
    
    Organización:
    
    [METRICS]  GRUPO 1: Información Agregada (combinan múltiples entidades)
    - perfilCompletoArquitecto: Perfil detallado de arquitecto con estadísticas
    - dashboardProyecto: Vista completa de proyecto con métricas
    - historialConversacion: Conversación con todos sus mensajes
    
    [STATS]  GRUPO 2: Análisis y Métricas (cálculos y estadísticas)
    - estadisticasArquitecto: Métricas calculadas de un arquitecto
    - kpisPlataforma: Indicadores generales de la plataforma
    - metricasProyecto: Análisis detallado de un proyecto
    
    [SEARCH]  GRUPO 3: Búsqueda Avanzada (filtros complejos)
    - buscarArquitectos: Búsqueda con filtros múltiples
    - buscarProyectos: Búsqueda avanzada de proyectos
    - buscarConversaciones: Búsqueda de conversaciones
    
    Nota: CRUD (crear/actualizar/eliminar) se realiza directamente
    desde el frontend al API REST de Rails.
    """
    
    # ========== GRUPO 1: Información Agregada ==========
    
    @strawberry.field(description="Obtiene el perfil completo de un arquitecto con sus proyectos y estadísticas")
    async def perfil_completo_arquitecto(self, arquitecto_id: strawberry.ID) -> Optional[PerfilCompletoArquitecto]:
        return await resolver_perfil_completo_arquitecto(arquitecto_id)
    
    @strawberry.field(description="Obtiene el dashboard completo de un proyecto con avances, valoraciones e incidencias")
    async def dashboard_proyecto(self, proyecto_id: strawberry.ID) -> Optional[DashboardProyecto]:
        return await resolver_dashboard_proyecto(proyecto_id)
    
    @strawberry.field(description="Obtiene el historial completo de una conversación con todos sus mensajes")
    async def historial_conversacion(self, conversacion_id: strawberry.ID) -> Optional[HistorialConversacion]:
        return await resolver_historial_conversacion(conversacion_id)
    
    # ========== GRUPO 2: Análisis y Métricas ==========
    
    @strawberry.field(description="Obtiene estadísticas calculadas de un arquitecto (proyectos por tipo, valoraciones)")
    async def estadisticas_arquitecto(self, arquitecto_id: strawberry.ID) -> Optional[EstadisticasArquitecto]:
        return await resolver_estadisticas_arquitecto(arquitecto_id)
    
    @strawberry.field(description="Obtiene KPIs generales de la plataforma (usuarios, proyectos, estadísticas)")
    async def kpis_plataforma(self) -> KPIsPlataforma:
        return await resolver_kpis_plataforma()
    
    @strawberry.field(description="Obtiene métricas calculadas de un proyecto (avances, valoraciones, días transcurridos)")
    async def metricas_proyecto(self, proyecto_id: strawberry.ID) -> Optional[MetricasProyecto]:
        return await resolver_metricas_proyecto(proyecto_id)
    
    # ========== GRUPO 3: Búsqueda Avanzada ==========
    
    @strawberry.field(description="Búsqueda avanzada de arquitectos con filtros (especialidad, valoración, verificado)")
    async def buscar_arquitectos(
        self,
        especialidad: Optional[str] = None,
        valoracion_minima: Optional[float] = None,
        verificado: Optional[bool] = None,
        limite: Optional[int] = None
    ) -> List[ArquitectoBusqueda]:
        return await resolver_buscar_arquitectos(especialidad, valoracion_minima, verificado, limite)
    
    @strawberry.field(description="Búsqueda avanzada de proyectos con filtros (tipo, arquitecto, estado)")
    async def buscar_proyectos(
        self,
        tipo_proyecto: Optional[str] = None,
        arquitecto_id: Optional[strawberry.ID] = None,
        estado: Optional[str] = None
    ) -> List[DashboardProyecto]:
        return await resolver_buscar_proyectos(tipo_proyecto, arquitecto_id, estado)
    
    @strawberry.field(description="Búsqueda avanzada de conversaciones con filtros (proyecto, cliente, arquitecto)")
    async def buscar_conversaciones(
        self,
        proyecto_id: Optional[strawberry.ID] = None,
        cliente_id: Optional[strawberry.ID] = None,
        arquitecto_id: Optional[strawberry.ID] = None
    ) -> List[HistorialConversacion]:
        return await resolver_buscar_conversaciones(proyecto_id, cliente_id, arquitecto_id)
    
    @strawberry.field(description="Búsqueda de incidencias con filtros (estado, límite)")
    async def buscar_incidencias(
        self,
        estado: Optional[str] = None,
        limite: Optional[int] = None
    ) -> List[ReporteIncidencias]:
        return await resolver_buscar_incidencias(estado, limite)


# Schema sin mutaciones
schema = strawberry.Schema(query=Query)
graphql_app = GraphQLRouter(schema)  # lo usaremos solo para la UI

app = FastAPI(title="Arquitectos / Usuarios GraphQL Service")

# Configurar CORS para permitir peticiones desde el frontend
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Otro posible puerto
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Permitir GET, POST, OPTIONS, etc.
    allow_headers=["*"],  # Permitir todos los headers
)

# POST personalizado para controlar status HTTP según errores
@app.post("/graphql")
async def graphql_post(request: Request):
    body = await request.json()
    query = body.get("query")
    variables = body.get("variables")
    operation_name = body.get("operationName")

    # ejecutar la operación con el schema de Strawberry
    result = await schema.execute(
        query,
        variable_values=variables,
        context_value={"request": request},
        operation_name=operation_name,
    )

    # preparar lista de errores y calcular severidad
    errors_out = []
    severity = 0  # 0 -> 200, 4 -> 400, 5 -> 500
    if result.errors:
        for e in result.errors:
            ext = getattr(e, "extensions", None) or {}
            code = str(ext.get("code", "")) if ext else ""
            # si no hay extensions asumimos error servidor (500)
            if not ext:
                severity = max(severity, 5)
            elif code.startswith("4"):
                severity = max(severity, 4)
            elif code.startswith("5"):
                severity = max(severity, 5)
            # business codes como 202 o 300 no aumentan severity (se quedan 0 / 200) a menos que haya otros errores
            errors_out.append({
                "message": getattr(e, "message", str(e)),
                "extensions": ext or None,
            })

    # mapear severity a status HTTP
    status_code = 200
    if severity == 4:
        status_code = 400
    elif severity == 5:
        status_code = 500

    payload = {}
    payload["data"] = result.data if result.data is not None else None
    if errors_out:
        payload["errors"] = errors_out

    return JSONResponse(content=payload, status_code=status_code)

# Añadir GET para redirigir a la UI y evitar 405 al abrir /graphql en el navegador
@app.get("/graphql")
async def graphql_get():
    return RedirectResponse(url="/graphql/ui")

# Mantener UI (GraphiQL) en /graphql/ui para evitar conflicto de rutas POST
app.include_router(graphql_app, prefix="/graphql/ui")

@app.get("/")
async def root():
    return RedirectResponse(url="/graphql/ui")

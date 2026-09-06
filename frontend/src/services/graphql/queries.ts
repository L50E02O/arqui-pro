import { gql } from '@apollo/client'

export const BUSCAR_ARQUITECTOS = gql`
  query BuscarArquitectos(
    $especialidad: String
    $verificado: Boolean
    $valoracionMinima: Float
    $limite: Int
  ) {
    buscarArquitectos(
      especialidad: $especialidad
      verificado: $verificado
      valoracionMinima: $valoracionMinima
      limite: $limite
    ) {
      id
      cedula
      especialidades
      descripcion
      valoracionPromedioProyecto
      verificado
      usuario {
        id
        nombre
        apellido
        email
        fotoPerfil
      }
      proyectos {
        id
        tituloProyecto
        valoracionPromedio
      }
    }
  }
`

export const ESTADISTICAS_ARQUITECTO = gql`
  query EstadisticasArquitecto($arquitectoId: ID!) {
    estadisticasArquitecto(arquitectoId: $arquitectoId) {
      arquitecto {
        id
        nombre
        apellido
        especialidades
        verificado
      }
      proyectosCompletados
      proyectosEnCurso
      valoracionPromedio
      totalValoraciones
      distribucionValoraciones {
        estrellas
        cantidad
      }
      proyectosRecientes {
        id
        tituloProyecto
        tipoProyecto
        valoracionPromedio
      }
      mejoraValoracion {
        promedioPeriodoAnterior
        promedioPeriodoActual
        cambio
      }
    }
  }
`

export const PERFIL_COMPLETO_ARQUITECTO = gql`
  query PerfilCompletoArquitecto($arquitectoId: ID!) {
    perfilCompletoArquitecto(arquitectoId: $arquitectoId) {
      arquitecto {
        id
        cedula
        valoracionPromProyecto
        descripcion
        especialidades
        ubicacion
        verificado
        vistasPerfil
        usuarioId
      }
      usuario {
        id
        nombre
        apellido
        email
        fotoPerfil
        estadoCuenta
        rol
        fechaRegistro
      }
      proyectos {
        id
        tituloProyecto
        descripcion
        tipoProyecto
        valoracionPromedio
        fechaPublicacion
        arquitectoId
        conversacionId
        clienteId
      }
      totalProyectos
      valoracionPromedio
    }
  }
`

export const GET_MODERATOR_STATS = gql`
  query GetModeratorStats {
    kpisPlataforma {
      totalUsuarios
      totalProyectos
      arquitectosVerificados
      totalIncidencias
    }
  }
`

export const GET_VERIFICACIONES = gql`
  query GetVerificaciones(
    $estado: String
    $limite: Int
    $offset: Int
  ) {
    verificaciones(
      estado: $estado
      limite: $limite
      offset: $offset
    ) {
      id
      arquitectoId
      estado
      fechaSolicitud
      fechaResolucion
      moderadorId
      comentarios
      arquitecto {
        id
        cedula
        usuario {
          nombre
          apellido
          email
        }
      }
      moderador {
        nombre
        apellido
      }
    }
  }
`

export const GET_INCIDENCIAS = gql`
  query GetIncidencias(
    $estado: String
    $limite: Int
    $offset: Int
  ) {
    incidencias(
      estado: $estado
      limite: $limite
      offset: $offset
    ) {
      id
      descripcion
      estado
      fechaCreacion
      fechaResolucion
      emisorId
      infractorId
      moderadorId
      emisor {
        nombre
        apellido
      }
      infractor {
        nombre
        apellido
      }
      moderador {
        nombre
        apellido
      }
    }
  }
`

// Consultas para Reportes del Moderador
export const REPORTE_KPIS_PLATAFORMA = gql`
  query ReporteKPIsPlataforma {
    kpisPlataforma {
      totalUsuarios
      totalProyectos
      arquitectosVerificados
      totalIncidencias
      totalArquitectos
      totalClientes
      usuariosPorRol {
        rol
        cantidad
      }
    }
  }
`

export const REPORTE_ARQUITECTOS = gql`
  query ReporteArquitectos(
    $especialidad: String
    $verificado: Boolean
    $valoracionMinima: Float
    $limite: Int
  ) {
    buscarArquitectos(
      especialidad: $especialidad
      verificado: $verificado
      valoracionMinima: $valoracionMinima
      limite: $limite
    ) {
      id
      cedula
      especialidades
      descripcion
      valoracionPromedioProyecto
      verificado
      usuario {
        id
        nombre
        apellido
        email
        fotoPerfil
      }
      proyectos {
        id
        tituloProyecto
        valoracionPromedio
      }
    }
  }
`

export const REPORTE_PROYECTOS = gql`
  query ReporteProyectos(
    $tipoProyecto: String
    $arquitectoId: ID
    $estado: String
  ) {
    buscarProyectos(
      tipoProyecto: $tipoProyecto
      arquitectoId: $arquitectoId
      estado: $estado
    ) {
      proyecto {
        id
        tituloProyecto
        descripcion
        tipoProyecto
        fechaPublicacion
        arquitectoId
        clienteId
        valoracionPromedio
      }
      arquitecto {
        id
        cedula
        especialidades
      }
      arquitectoUsuario {
        id
        nombre
        apellido
        email
      }
      cliente {
        id
      }
      clienteUsuario {
        id
        nombre
        apellido
        email
      }
      avances {
        id
        descripcion
        fecha
      }
      valoraciones {
        id
        calificacion
        comentario
      }
      totalAvances
      valoracionPromedio
    }
  }
`

export const REPORTE_INCIDENCIAS = gql`
  query ReporteIncidencias(
    $estado: String
    $limite: Int
  ) {
    buscarIncidencias(
      estado: $estado
      limite: $limite
    ) {
      incidencia {
        id
        descripcion
        estado
        fecha
        usuarioEmisorId
        usuarioInfractorId
        moderadorId
      }
      emisor {
        id
        nombre
        apellido
        email
        estadoCuenta
        rol
      }
      infractor {
        id
        nombre
        apellido
        email
        estadoCuenta
        rol
      }
      moderador {
        id
        nombre
        apellido
        email
        estadoCuenta
        rol
      }
    }
  }
`
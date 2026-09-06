-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ar_internal_metadata (
  key character varying NOT NULL,
  value character varying,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone NOT NULL,
  CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key)
);
CREATE TABLE public.arquitectos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cedula character varying NOT NULL,
  valoracion_prom_proyecto double precision NOT NULL DEFAULT 0.0,
  descripcion text NOT NULL,
  especialidades character varying NOT NULL,
  ubicacion character varying NOT NULL,
  verificado boolean NOT NULL DEFAULT false,
  vistas_perfil integer NOT NULL DEFAULT 0,
  usuario_id uuid NOT NULL,
  CONSTRAINT arquitectos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.avances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  descripcion text NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_TIMESTAMP,
  proyecto_id uuid NOT NULL,
  CONSTRAINT avances_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rails_572537cce9 FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id)
);
CREATE TABLE public.clientes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cedula character varying NOT NULL,
  usuario_id uuid NOT NULL,
  CONSTRAINT clientes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.conversaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  cliente_id uuid NOT NULL,
  arquitecto_id uuid NOT NULL,
  CONSTRAINT conversaciones_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rails_5f43e7bc9c FOREIGN KEY (arquitecto_id) REFERENCES public.arquitectos(id),
  CONSTRAINT fk_rails_329be3d704 FOREIGN KEY (cliente_id) REFERENCES public.clientes(id)
);
CREATE TABLE public.imagen_asociaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  asociable_type character varying NOT NULL CHECK (asociable_type::text = ANY (ARRAY['Proyecto'::character varying::text, 'Mensaje'::character varying::text, 'Incidencia'::character varying::text, 'Avance'::character varying::text])),
  asociable_id character varying NOT NULL,
  imagen_id uuid NOT NULL,
  CONSTRAINT imagen_asociaciones_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rails_697bd41d0a FOREIGN KEY (imagen_id) REFERENCES public.imagenes(id)
);
CREATE TABLE public.imagenes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  imagen_url text NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT imagenes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.incidencias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  descripcion text NOT NULL,
  estado character varying NOT NULL DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying::text, 'resuelto'::character varying::text, 'en revision'::character varying::text])),
  fecha date NOT NULL DEFAULT CURRENT_TIMESTAMP,
  usuario_emisor_id uuid NOT NULL,
  usuario_infractor_id uuid NOT NULL,
  moderador_id uuid NOT NULL,
  CONSTRAINT incidencias_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rails_1d7e573720 FOREIGN KEY (moderador_id) REFERENCES public.moderadores(id),
  CONSTRAINT fk_rails_bf22fe3bf4 FOREIGN KEY (usuario_emisor_id) REFERENCES public.usuarios(id),
  CONSTRAINT fk_rails_4f693e470b FOREIGN KEY (usuario_infractor_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.mensajes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  contenido text NOT NULL,
  fecha_envio date NOT NULL DEFAULT CURRENT_TIMESTAMP,
  leido boolean NOT NULL DEFAULT false,
  conversacion_id uuid NOT NULL,
  remitente_id uuid NOT NULL,
  hora_envio time without time zone,
  CONSTRAINT mensajes_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rails_53ca1f0aa6 FOREIGN KEY (conversacion_id) REFERENCES public.conversaciones(id),
  CONSTRAINT fk_rails_21e36c2460 FOREIGN KEY (remitente_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.moderadores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  num_incidencias_resueltas integer NOT NULL DEFAULT 0,
  num_arquitectos_verificados integer NOT NULL DEFAULT 0,
  CONSTRAINT moderadores_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mensaje text NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  leido boolean NOT NULL DEFAULT false,
  usuario_id uuid NOT NULL,
  CONSTRAINT notificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rails_d4af169109 FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.proyectos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo_proyecto text NOT NULL,
  valoracion_promedio double precision NOT NULL DEFAULT 0.0,
  descripcion text NOT NULL,
  tipo_proyecto character varying NOT NULL CHECK (tipo_proyecto::text = ANY (ARRAY['portafolio'::character varying::text, 'contratado'::character varying::text])),
  fecha_publicacion date NOT NULL DEFAULT CURRENT_DATE,
  arquitecto_id uuid NOT NULL,
  conversacion_id uuid,
  cliente_id uuid,
  solicitud_proyecto_id uuid,
  CONSTRAINT proyectos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rails_fe0d7cc01f FOREIGN KEY (arquitecto_id) REFERENCES public.arquitectos(id),
  CONSTRAINT fk_rails_007635d5a5 FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT fk_rails_009ba53258 FOREIGN KEY (conversacion_id) REFERENCES public.conversaciones(id),
  CONSTRAINT fk_rails_22abd5127b FOREIGN KEY (solicitud_proyecto_id) REFERENCES public.solicitudes_proyecto(id)
);
CREATE TABLE public.schema_migrations (
  version character varying NOT NULL,
  CONSTRAINT schema_migrations_pkey PRIMARY KEY (version)
);
CREATE TABLE public.sistema_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo character varying NOT NULL,
  mensaje text NOT NULL,
  estado character varying NOT NULL CHECK (estado::text = ANY (ARRAY['exito'::character varying, 'error'::character varying]::text[])),
  fecha_ejecucion timestamp without time zone NOT NULL,
  created_at timestamp without time zone NOT NULL,
  updated_at timestamp without time zone NOT NULL,
  CONSTRAINT sistema_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.solicitudes_proyecto (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  estado character varying NOT NULL DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying::text, 'aceptado'::character varying::text, 'rechazado'::character varying::text])),
  fecha date NOT NULL DEFAULT CURRENT_DATE,
  arquitecto_id uuid NOT NULL,
  cliente_id uuid NOT NULL,
  CONSTRAINT solicitudes_proyecto_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rails_7851616dd0 FOREIGN KEY (arquitecto_id) REFERENCES public.arquitectos(id),
  CONSTRAINT fk_rails_9bc68b23a4 FOREIGN KEY (cliente_id) REFERENCES public.clientes(id)
);
CREATE TABLE public.usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  apellido character varying NOT NULL,
  email character varying NOT NULL DEFAULT ''::character varying,
  estado_cuenta character varying NOT NULL DEFAULT 'activo'::character varying CHECK (estado_cuenta::text = ANY (ARRAY['suspendido'::character varying::text, 'activo'::character varying::text])),
  encrypted_password character varying NOT NULL DEFAULT ''::character varying,
  rol character varying NOT NULL CHECK (rol::text = ANY (ARRAY['cliente'::character varying::text, 'arquitecto'::character varying::text, 'moderador'::character varying::text])),
  fecha_registro date NOT NULL DEFAULT CURRENT_DATE,
  foto_perfil character varying,
  remember_created_at timestamp without time zone,
  jti character varying,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id)
);
CREATE TABLE public.valoraciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  calificacion double precision NOT NULL,
  comentario text NOT NULL,
  fecha date NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cliente_id uuid NOT NULL,
  proyecto_id uuid NOT NULL,
  CONSTRAINT valoraciones_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rails_432ca4ce47 FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT fk_rails_f6edc536e4 FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id)
);
CREATE TABLE public.verificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  estado character varying NOT NULL DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying::text, 'verificado'::character varying::text, 'rechazado'::character varying::text])),
  fecha_verificacion date NOT NULL DEFAULT CURRENT_DATE,
  arquitecto_id uuid NOT NULL,
  moderador_id uuid NOT NULL,
  CONSTRAINT verificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT fk_rails_a2417ed916 FOREIGN KEY (arquitecto_id) REFERENCES public.arquitectos(id),
  CONSTRAINT fk_rails_827c6e60e2 FOREIGN KEY (moderador_id) REFERENCES public.moderadores(id)
);
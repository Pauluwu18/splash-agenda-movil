-- =========================================================================
-- ESQUEMA COMPLETO PARA SUPABASE - SPLASH AGENDA MOBILE
-- Copia y pega este contenido en el 'SQL Editor' de tu consola de Supabase
-- =========================================================================

-- 1. Tabla de Operarios / Colaboradores
CREATE TABLE IF NOT EXISTS operarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dni TEXT,
    nombres TEXT NOT NULL,
    apellidos TEXT,
    nombre TEXT, -- Compatibilidad legacy
    telefono TEXT,
    cargo TEXT DEFAULT 'Operario', -- 'Líder', 'Operario', 'Apoyo', 'Técnico'
    rol TEXT DEFAULT 'Operario',
    sucursal TEXT DEFAULT 'Las Flores',
    sueldo_por_servicio NUMERIC(10, 2) DEFAULT 25.00,
    en_capacitacion BOOLEAN DEFAULT FALSE,
    color TEXT DEFAULT '#00CED1',
    activo BOOLEAN DEFAULT TRUE,
    estado TEXT DEFAULT 'ACTIVO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Clientes (para autocompletado rápido por teléfono en tiempo real)
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL UNIQUE,
    distrito TEXT,
    direccion TEXT,
    empresa_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla Principal de Agendas / Servicios
CREATE TABLE IF NOT EXISTS servicios_agenda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_nombre TEXT NOT NULL,
    telefono TEXT NOT NULL,
    distrito TEXT NOT NULL,
    direccion TEXT NOT NULL,
    referencia TEXT,
    link_maps TEXT,
    fecha DATE NOT NULL,
    horario TEXT NOT NULL, -- 'Mañana', 'Tarde', 'Extras'
    hora_estimada TEXT,    -- ej. '1:30pm - 2:30pm Aprox'
    servicio_detalle TEXT NOT NULL, -- ej. '6 sillas + butaca'
    items JSONB DEFAULT '[]'::jsonb,
    precio_final NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    descuento NUMERIC(10, 2) DEFAULT 0.00,
    monto_extra NUMERIC(10, 2) DEFAULT 0.00,
    metodo_pago TEXT NOT NULL DEFAULT 'Efectivo',
    comentarios TEXT,
    estado TEXT DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'EN_CAMINO', 'COMPLETADO', 'CANCELADO'
    es_taxi BOOLEAN DEFAULT FALSE,
    es_rectificacion BOOLEAN DEFAULT FALSE,
    sucursal_nombre TEXT DEFAULT 'Las Flores',
    vehiculo_id TEXT,
    van_nombre TEXT,
    empresa_id TEXT,
    empresa_nombre TEXT DEFAULT 'SPLASH',
    empresa_color TEXT DEFAULT '#00CED1',
    canal_origen_id TEXT,
    operario_id UUID,
    operario_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    orden INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para consultas de agenda ultra rápidas
CREATE INDEX IF NOT EXISTS idx_servicios_fecha ON servicios_agenda(fecha);
CREATE INDEX IF NOT EXISTS idx_servicios_telefono ON servicios_agenda(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

-- Habilitar Row Level Security (RLS) público
ALTER TABLE operarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_agenda ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para clave anónima (Lectura y Escritura permitida)
CREATE POLICY "Permitir todo operarios" ON operarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo servicios" ON servicios_agenda FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- ACTIVAR REALTIME DE POSTGRES (Sincronización instantánea PC <-> Móvil)
-- =========================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'servicios_agenda'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE servicios_agenda;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'operarios'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE operarios;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'clientes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE clientes;
  END IF;
END $$;

-- =========================================================================
-- ESQUEMA COMPLETO PARA SUPABASE - APP AGENDA MÓVIL
-- Copia y pega este contenido en el 'SQL Editor' de tu consola de Supabase
-- =========================================================================

-- 1. Tabla de Operarios / Personas que van al servicio
CREATE TABLE IF NOT EXISTS operarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    telefono TEXT,
    cargo TEXT DEFAULT 'Técnico', -- 'Técnico', 'Operario', 'Líder', 'Apoyo'
    color TEXT DEFAULT '#06b6d4', -- Color para chips en la agenda
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Clientes (para autocompletado rápido por teléfono)
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    telefono TEXT NOT NULL UNIQUE,
    distrito TEXT,
    direccion TEXT,
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
    fecha DATE NOT NULL,
    horario TEXT NOT NULL, -- 'Mañana', 'Tarde', 'Extras'
    hora_estimada TEXT,    -- ej. '09:00 AM'
    servicio_detalle TEXT NOT NULL, -- ej. 'Lavado Sedán + Tratamiento'
    precio_final NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    monto_extra NUMERIC(10, 2) DEFAULT 0.00,
    metodo_pago TEXT NOT NULL DEFAULT 'Efectivo', -- 'Efectivo', 'Yape / Plin', 'Transferencia', 'Tarjeta'
    comentarios TEXT,
    estado TEXT DEFAULT 'PENDIENTE', -- 'PENDIENTE', 'EN_CAMINO', 'COMPLETADO', 'CANCELADO'
    es_taxi BOOLEAN DEFAULT FALSE,
    orden INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabla Intermedia: Quiénes van al servicio (Personas asignadas)
CREATE TABLE IF NOT EXISTS servicio_operarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servicio_id UUID NOT NULL REFERENCES servicios_agenda(id) ON DELETE CASCADE,
    operario_id UUID NOT NULL REFERENCES operarios(id) ON DELETE CASCADE,
    es_lider BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(servicio_id, operario_id)
);

-- Índices para búsquedas ultra rápidas
CREATE INDEX IF NOT EXISTS idx_servicios_fecha ON servicios_agenda(fecha);
CREATE INDEX IF NOT EXISTS idx_servicios_telefono ON servicios_agenda(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

-- Habilitar Row Level Security (RLS) público para la app móvil
ALTER TABLE operarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios_agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicio_operarios ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para clave anónima (Lectura y Escritura permitida)
CREATE POLICY "Permitir todo operarios" ON operarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo servicios" ON servicios_agenda FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo servicio_operarios" ON servicio_operarios FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- DATOS INICIALES DE PRUEBA (Opcional - para ver la agenda con datos de inmediato)
-- =========================================================================
INSERT INTO operarios (nombre, telefono, cargo, color) VALUES
('Carlos Mendoza', '987111222', 'Líder', '#0284c7'),
('Miguel Ángel Quispe', '987333444', 'Operario', '#0d9488'),
('José Ramírez', '987555666', 'Apoyo', '#f59e0b'),
('David Flores', '987777888', 'Operario', '#8b5cf6')
ON CONFLICT DO NOTHING;


-- ══════════════════════════════════════════════
--  AHAVAH NAILS STUDIO — Base de datos
--  Ejecuta este script en tu PostgreSQL de Railway
--  Railway → tu proyecto → PostgreSQL → Query
-- ══════════════════════════════════════════════

-- ── VISITAS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS visitas (
  id         SERIAL PRIMARY KEY,
  total      INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar fila inicial del contador
INSERT INTO visitas (total) VALUES (0)
ON CONFLICT DO NOTHING;

-- ── COMENTARIOS ──────────────────────────────
CREATE TABLE IF NOT EXISTS comentarios (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100)  NOT NULL,
  comentario  TEXT          NOT NULL,
  calificacion INTEGER      NOT NULL DEFAULT 5
                            CHECK (calificacion BETWEEN 1 AND 5),
  aprobado    BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índice para traer solo los aprobados rápido
CREATE INDEX IF NOT EXISTS idx_comentarios_aprobado
  ON comentarios (aprobado, created_at DESC);

-- ── CITAS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS citas (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100)  NOT NULL,
  telefono    VARCHAR(20)   NOT NULL,
  servicio    VARCHAR(100)  NOT NULL,
  fecha_hora  TIMESTAMPTZ   NOT NULL,
  notas       TEXT,
  estado      VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                            CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índice para buscar citas por fecha
CREATE INDEX IF NOT EXISTS idx_citas_fecha
  ON citas (fecha_hora, estado);

-- ══════════════════════════════════════════════
-- Servicios disponibles (para validación)
-- ══════════════════════════════════════════════
-- manicure_gel, nail_art, acrilico_polygel,
-- pedicure_spa, pack_novias, retiro_mantenimiento

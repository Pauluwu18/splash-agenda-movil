# 📱 SPLASH - App Agenda Móvil

Aplicación web móvil optimizada para teléfonos inteligentes (diseñada para agendar servicios de manera rápida y sencilla, señalar qué personas/operarios acudirán al servicio y compartir por WhatsApp con un solo toque).

---

## 🚀 Funcionalidades Principales

1. **Creación Rápida de Agendas (Móvil):**
   - Selector táctil de fecha (Hoy, Mañana o calendario nativo).
   - Turnos rápidos: ☀️ Mañana, 🌅 Tarde, ⏱️ Extras, más hora estimada.
   - Detección inteligente de cliente frecuente por número de teléfono.
   - Ubicación con lista de distritos y campo de dirección con referencia.
   - Sugerencias rápidas de servicios y precios en soles (S/).

2. **Asignación de Personas / Operarios:**
   - Chips visuales táctiles para marcar quién o quiénes irán a atender el servicio.
   - Pestaña de **Personas** para registrar nuevos colaboradores (nombre, cargo, teléfono y color identificador).

3. **Acciones de Guardado Duales:**
   - 🟢 **Guardar y compartir agenda:** Guarda en la base de datos y abre inmediatamente el modal de WhatsApp con la plantilla de confirmación lista para enviar al cliente o al operario asignado.
   - 💾 **Solo guardar:** Guarda la cita y actualiza la agenda del día.

4. **Tablero Diario de Agenda:**
   - Navegación rápida entre días (`< Hoy >`).
   - Filtros por turno (Mañana, Tarde, Extras).
   - Botones directos de 1 toque: 📞 Llamar, 💬 WhatsApp, 🗺️ Abrir dirección en Google Maps.
   - Cambio de estado: Pendiente, En camino, Realizado, Cancelado.

5. **Base de Datos Supabase + Modo Local Offline:**
   - Conexión nativa con **Supabase** (`@supabase/supabase-js`).
   - Si aún no tienes Supabase configurado, la app funciona de inmediato en **Modo Local (LocalStorage)** para que puedas probarla sin esperas.

---

## 🛠️ Cómo Iniciar la App

Abre tu terminal en esta carpeta (`C:\Users\M.S.I\OneDrive\Documentos\app agenda`) y ejecuta:

```bash
npm run dev
```

La app estará corriendo en:
- En tu PC: `http://localhost:3000`
- **En tu teléfono celular (en la misma red Wi-Fi):** Abre el navegador de tu celular y entra a la dirección de red que te muestra la terminal (ejemplo: `http://192.168.1.XX:3000`).

---

## ⚡ Cómo Configurar Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. Ve a la sección **SQL Editor** en Supabase.
3. Abre el archivo `supabase_schema.sql` incluido en esta carpeta, copia todo su contenido y ejecútalo en Supabase. Esto creará automáticamente las tablas:
   - `operarios`
   - `clientes`
   - `servicios_agenda`
   - `servicio_operarios`
4. En Supabase, ve a **Project Settings -> API** y copia:
   - `Project URL`
   - `anon public key`
5. Puedes agregarlos al archivo `.env` o introducirlos directamente desde la app en el botón **"Supa"** de la barra inferior.

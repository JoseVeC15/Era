# era-nails

Landing page y panel de administración para **Era Nails & Hair** — salón especializado en plástica de pies brasileña en Fernando de la Mora, Asunción, Paraguay.

## Stack

- **Next.js** (App Router) + TypeScript
- **Supabase** — base de datos y autenticación
- **YCloud** — envío de mensajes WhatsApp
- **Vercel** — despliegue

## Estructura

```
app/
  page.tsx              # Landing page pública
  admin/                # Panel de administración (requiere auth)
    login/              # Login con Supabase Auth
    schedule/           # Grilla semanal de turnos
    reservas/           # Listado y gestión de reservas
    crm/                # Conversaciones WhatsApp
    horarios/           # Horarios de atención
    pagos/              # Métodos de pago
  api/
    slots/              # CRUD de turnos disponibles
    appointments/       # CRUD de reservas
    crm/                # Mensajería WhatsApp
    business-hours/     # Horarios del negocio
    blocked-dates/      # Fechas bloqueadas
    days-off/           # Días libres
    payment-methods/    # Métodos de pago

components/             # Secciones de la landing + componentes admin
lib/
  supabase/             # Clientes Supabase (server, client)
  utils.ts              # Helpers de formato de fechas y horarios
```

## Setup local

1. Clonar el repositorio y entrar a la carpeta:
   ```bash
   cd era-nails
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Copiar el archivo de entorno:
   ```bash
   cp .env.example .env.local
   ```
   Completar cada variable (ver sección Variables de entorno).

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (solo servidor, nunca exponer) |
| `ADMIN_EMAIL` | Email del único usuario con acceso al panel admin |
| `YCLOUD_API_KEY` | API key de YCloud para WhatsApp |
| `YCLOUD_WHATSAPP_NUMBER` | Número de WhatsApp Business (formato +595...) |

## Scripts

```bash
npm run dev         # Servidor de desarrollo
npm run build       # Build de producción
npm run start       # Servidor de producción
npm run lint        # ESLint
npm run typecheck   # Verificación de tipos TypeScript
npm test            # Tests unitarios (Vitest)
```

## Despliegue en Vercel

El proyecto está conectado al repositorio GitHub y se despliega automáticamente en cada push a `main`. Asegurarse de tener todas las variables de entorno configuradas en el panel de Vercel antes del primer despliegue.

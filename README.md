
## Prueba Técnica para RFlex - Felipe Burgos - Postulación a Ingeniero Full-Stack Semi-Senior

Consiste en una aplicación web de gestión de asistencia y planificación de turnos construida con Laravel y React (Inertia.js). Permite administrar empleados, sucursales, áreas, dispositivos y reportes de asistencia en una estructura multiempresa.

## Características

- **Gestión de Usuarios**: Control de usuarios y perfiles con roles
- **Administración de Estructura Empresarial**: Holding, Empresa, Sucursal y Área
- **Gestión de Dispositivos**: Registro y administración de dispositivos de marcaje
- **Planificación de Turnos**: Creación y gestión de horarios de trabajo
- **Control de Asistencia**: Registro automático de asistencia con trabajos en background
- **Dashboard**: Panel de control con métricas de asistencia
- **Reportes**: Generación de reportes de asistencia y ausencias con capacidad de exportar a Excel (Mediante descarga de archivo con librería "maatwebsite/excel")
- **Autenticación**: Sistema seguro de autenticación con verificación de email

## Estructura del Proyecto

```
app/
├── Exports/          # Exportadores de datos
├── Http/
│   ├── Controllers/  # Controladores principales y API
│   ├── Middleware/   # Middleware personalizado
│   └── Requests/     # Form Request validation
├── Jobs/             # Trabajos en background
├── Models/           # Modelos Eloquent
└── Providers/        # Service Providers

resources/
├── js/              # Componentes React y páginas Inertia
│   ├── Components/  # Componentes reutilizables
│   ├── Layouts/     # Layouts de aplicación
│   └── Pages/       # Páginas principales
├── css/             # Estilos
└── views/           # Blade templates
```

## Requisitos

- PHP 8.1+
- Laravel 10+
- Node.js y npm
- MySQL o PostgreSQL

## Instalación

1. Clonar el repositorio
2. Instalar dependencias PHP: `composer install`
3. Instalar dependencias JavaScript: `npm install`
4. Copiar archivo `.env.example` a `.env`
5. Ejecutar migraciones: `php artisan migrate`
6. Compilar assets: `npm run build`

Contiene Seeder de prueba: 
`php artisan db:seed --class=Pruebas1_seeder`

Este seeder crea datos de prueba incluyendo:
- Una estructura empresarial completa (Holding, Empresa, Sucursal y Áreas)
- 5 empleados con diferentes escenarios de asistencia
- Dispositivos de marcaje biométrico
- Turnos y registros de asistencia
- Usuarios administrativos para pruebas

## Uso

Iniciar servidor de desarrollo:
```bash
php artisan serve
npm run dev
```

## Tecnologías

- **Backend**: Laravel 10, PHP 8.1
- **Frontend**: React, Inertia.js
- **Base de Datos**: MySQL
- **Autenticación**: Laravel Sanctum
- **Validación**: Form Requests
- **Jobs**: Queue system

## API de Asistencia

### Endpoints Disponibles

#### Registrar Marcas de Asistencia
```
POST /api/v1/marcas
```
Recibe lotes de marcas desde relojes biométricos, aplicación móvil o API externa.

**Body (JSON):**
```json
{
    "device_serial": "DEVICE001",
    "marks": [
        {
            "rut": "12345678-9",
            "type": "in",
            "timestamp": "2026-02-27T08:30:00"
        },
        {
            "rut": "12345678-9",
            "type": "out",
            "timestamp": "2026-02-27T17:30:00"
        }
    ]
}
```

#### Listar Marcas de Asistencia
```
GET /admin/marcas
```
Consulta marcas con filtros opcionales:
- `employee_rut`: RUT del empleado
- `date`: Fecha específica (YYYY-MM-DD)
- `device_id`: ID del dispositivo

#### Listar Turnos de Empleado
```
GET /admin/turnos
```
Parámetros requeridos:
- `employee_id`: ID del empleado
- `month`: Mes opcional (YYYY-MM)

Retorna turnos con métricas: retrasos, horas extras, horas faltantes.

#### Conciliar Turno Manualmente
```
POST /admin/conciliar/{shift_id}
```
Permite a administradores asociar marcas automáticamente a turnos dentro de un rango de ±30 minutos.

### Procesos en Background

- **ProcesoDeAsistencia**: Se ejecuta cada 5 minutos para procesar marcas pendientes
- **ProcesoDeAusencia**: Se ejecuta diariamente a las 00:00 para generar registros de ausencias


## Licencia

Licencia MIT. Ver archivo LICENSE para más detalles.
Licencia Standard GitHub Dev.
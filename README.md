
# Arco — API REST (Servidor)

Descripción
-----------

Este repositorio contiene la API REST que provee datos para la aplicación frontend `arco/`.
La API está hecha con Node.js y Express y utiliza MySQL (vía `mysql2`) como almacenamiento.

Este README describe de forma precisa la estructura real del repositorio, cómo ejecutar el servidor en desarrollo, los endpoints disponibles, el esquema de la base de datos y cómo levantar todo con Docker Compose. He quitado la información genérica/incorrecta (por ejemplo referencias a MongoDB, a carpetas `/src` inexistentes o al puerto 3000 para el servidor).

Resumen rápido
--------------
- Entrada: API REST en `server/index.js` escuchando en el puerto 5001.
- Conexión DB: `server/db.js` (mysql2/promise) conectando al MySQL expuesto en el host en el puerto 3307.
- Esquema y datos de ejemplo: `server/init.sql`.

Estructura de archivos (relevante)
--------------------------------
- `index.js` — archivo principal del servidor (Express).
- `db.js` — configuración del pool de conexiones a MySQL.
- `init.sql` — script SQL para crear tablas y datos de ejemplo.
- `Dockerfile` — Dockerfile del servidor.
- `package.json`, `package-lock.json` — dependencias y scripts.
- `README.md` — este archivo.

Requisitos previos
------------------
- Node.js (v16+ recomendable)
- npm (o pnpm/yarn)
- Docker & Docker Compose (si se quiere ejecutar en contenedores)

Instalación y ejecución (desarrollo)
----------------------------------

1) Instalar dependencias

```bash
cd server
npm install
```

2) Ejecutar servidor en modo desarrollo

```bash
npm run dev
```

El servidor escuchará en http://localhost:5001 por defecto.

Ejecutar todo con Docker Compose
--------------------------------

En la raíz del repositorio hay un `docker-compose.yml` que orquesta tres servicios:

- `arco-app` (frontend) — puerto 3000
- `api-server` (este servidor) — puerto 5001
- `posta-db` (MySQL) — puerto 3307 en el host

Levantar todo:

```bash
docker compose up --build
```

Endpoints principales
---------------------

- Salud
  - GET /health
  - Respuesta: { "status": "OK", "message": "API funcionando correctamente" }

- Paquetes turísticos
  - GET /api/packages — listar paquetes (filtros: `activity_type`, `difficulty`, `is_active`)
  - GET /api/packages/:id — ver detalle de un paquete
  - POST /api/packages — crear paquete (requeridos: `name`, `description`, `activity_type`, `price`)
  - PUT /api/packages/:id — actualizar paquete
  - DELETE /api/packages/:id — borrar paquete

- Contacto
  - POST /api/contact — crear mensaje de contacto (requeridos: `name`, `email`, `message`)
  - GET /api/contact — listar mensajes (filtro: `status`)
  - GET /api/contact/:id — ver mensaje específico
  - PUT /api/contact/:id — actualizar estado (`status`)
  - DELETE /api/contact/:id — eliminar mensaje

Ejemplos rápidos (curl)
----------------------

Listar paquetes:

```bash
curl http://localhost:5001/api/packages
```

Crear mensaje de contacto:

```bash
curl -s -X POST http://localhost:5001/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Juan", "email":"juan@example.com", "message":"Consulta sobre el trekking"}'
```

Conexión a la base de datos
---------------------------

La conexión está definida en `server/db.js` y actualmente usa valores fijos (development):

- host: `localhost`
- port: `3307`
- user: `posta-db-username`
- password: `posta-db-password`
- database: `posta-db`

Estas credenciales coinciden con las variables definidas en `docker-compose.yml` para el servicio `posta-db`.

Recomendación: usar variables de entorno
---------------------------------------

Para mayor seguridad y flexibilidad, se recomienda cambiar `db.js` para leer las credenciales desde variables de entorno y añadir un archivo `server/.env.example`. Ejemplo de variables a exponer:

- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

Esquema de la base de datos (resumen)
------------------------------------

El script `server/init.sql` crea dos tablas principales:

- `tour_packages` — campos clave: `id`, `name`, `description`, `activity_type` (ENUM: 'trekking','mountain-bike','naturaleza','fogon'), `difficulty` (ENUM: 'bajo','medio','alto'), `duration_hours`, `max_participants`, `price`, `location`, `image_url`, `is_active`, `created_at`, `updated_at`.
- `contact_messages` — campos clave: `id`, `name`, `email`, `message`, `phone`, `status` (ENUM: 'pending','read','replied'), `created_at`.

El script también inserta ejemplos de paquetes para facilitar la demo.

Solución de problemas comunes
-----------------------------

- Error de conexión a MySQL: verifica que el contenedor `posta-db` esté corriendo y que el puerto 3307 del host esté libre (`docker ps`, `docker logs <container>`).
- Si el servidor muestra errores al iniciar relacionados con la base de datos, espera unos segundos y vuelve a intentarlo: MySQL puede tardar en inicializarse.
- Puerto 5001 ocupado: modifica el puerto en `index.js` o libera el puerto.

Calidad y mantenimiento
-----------------------

- No hay tests automáticos incluidos actualmente.
- En `package.json` se incluyen dependencias `eslint` y `prettier` para estilo.

Contribuciones
--------------

- Abrí un branch y enviá un PR para cambios mayores. Si modificás la estructura de la DB, actualizá `init.sql` y documentá las migraciones.

Licencia
--------

- Actualmente no hay una licencia especificada. Añadí un `LICENSE` si querés publicar el proyecto con términos claros.

Contacto
-------

Si querés que reescriba `db.js` para usar variables de entorno, añada un `.env.example`, o incluya ejemplos Postman/Insomnia, lo hago a continuación.


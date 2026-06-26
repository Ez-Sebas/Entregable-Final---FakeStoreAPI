# ShopExplorer 🛍️

Aplicación web que consume la [FakeStoreAPI](https://fakestoreapi.com/) para explorar un catálogo de productos. El usuario puede filtrar por categoría, buscar por nombre, ver el detalle de cada producto y guardarlo en un backend propio hecho con Node.js puro.

---

## Tecnologías utilizadas

- **Frontend:** HTML, CSS, JavaScript (ES6+), Fetch API
- **Backend:** Node.js (módulo nativo `http`, sin frameworks ni librerías externas)
- **API externa:** [FakeStoreAPI](https://fakestoreapi.com/) (gratuita, sin API key)

---

## Estructura del proyecto

```
ShopExplorer/
├── backend/
│   ├── models/
│   │   └── Product.js          # Clase Product (POO)
│   ├── store/
│   │   └── ProductStore.js     # Almacén en memoria (Singleton)
│   └── server.js               # Servidor HTTP con Node.js puro
├── frontend/
│   ├── index.html              # Estructura de la página
│   ├── styles.css              # Diseño de la página
│   └── app.js                  # Lógica del frontend y consumo de la API
└── README.md
```

---

## Requisitos previos

Antes de correr el proyecto asegúrate de tener instalado:

- [Node.js](https://nodejs.org/) versión 18 o superior
- Extensión **Live Server** en Visual Studio Code

Para verificar que Node.js está instalado, abre una terminal y ejecuta:

```bash
node --version
```

Debe mostrar algo como `v18.0.0` o superior.

---

## Instalación

1. Clona o descarga el repositorio en tu computador.

2. Abre la carpeta del proyecto en Visual Studio Code.

3. Este proyecto **no necesita instalar dependencias** — el backend usa únicamente módulos nativos de Node.js.

---

## Ejecución

El proyecto tiene dos partes que deben correr al mismo tiempo: el backend y el frontend. Necesitas **dos terminales abiertas**.

### 1. Arrancar el backend

Abre una terminal, navega a la carpeta `backend` y ejecuta el servidor:

```bash
cd backend
node server.js
```

Si todo está bien, verás este mensaje en la terminal:

```
╔══════════════════════════════════════════╗
║       ShopExplorer — Backend listo       ║
╠══════════════════════════════════════════╣
║  Servidor corriendo en:                  ║
║  http://localhost:3000                   ║
╠══════════════════════════════════════════╣
║  Rutas disponibles:                      ║
║  GET  /products  → lista de guardados    ║
║  POST /products  → guardar producto      ║
╚══════════════════════════════════════════╝
```

> El servidor debe estar corriendo **antes** de abrir el frontend.

### 2. Arrancar el frontend

Abre el archivo `frontend/index.html` con **Live Server**:

- Click derecho sobre `index.html` en el explorador de VS Code
- Selecciona **"Open with Live Server"**

El navegador abrirá automáticamente la aplicación en `http://127.0.0.1:5500`.

---

## Uso de la aplicación

| Acción | Cómo hacerlo |
|---|---|
| Ver todos los productos | Se cargan automáticamente al abrir la página |
| Filtrar por categoría | Clic en los botones de categoría bajo el título |
| Buscar un producto | Escribir en la barra de búsqueda del header |
| Ver detalle de un producto | Clic sobre cualquier tarjeta |
| Guardar un producto | Clic en "Guardar producto" en la tarjeta o en el modal |
| Ver productos guardados | Clic en el botón "Guardados" en el header |

Cada vez que se guarda un producto, el backend imprime un mensaje en su terminal con el detalle del producto guardado.

---

## Rutas del backend

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/products` | Devuelve todos los productos guardados en memoria |
| `POST` | `/products` | Recibe y guarda un producto enviado desde el frontend |

---

## Notas importantes

- Los productos guardados se almacenan **en memoria**. Si el servidor se reinicia, los datos se pierden. Esto es el comportamiento esperado según los requisitos del proyecto.
- El frontend y el backend corren en puertos distintos (`5500` y `3000`). El servidor tiene CORS configurado para permitir esta comunicación.
- No se requiere ninguna API key para usar FakeStoreAPI.

git init

git add .

git commit -m "feat: proyecto ShopExplorer completo"

git remote add origin https://github.com/TU_USUARIO/ShopExplorer.git

git branch -M main

git push -u origin main
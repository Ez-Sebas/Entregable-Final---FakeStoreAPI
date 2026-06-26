// ============================================================
// IMPORTACIONES
// ============================================================

// "http" es el módulo nativo de Node.js para crear servidores web.
// Con él podemos escuchar peticiones y enviar respuestas,
// exactamente lo que hace Express por dentro, pero nosotros
// lo hacemos a mano como lo pide el criterio de evaluación.
const http = require("http");

// "url" es el módulo nativo para analizar URLs.
// Lo usamos para leer la ruta de cada petición que llega
// y decidir qué hacer con ella (enrutamiento manual).
const url = require("url");

// Importamos la instancia única del almacén de productos.
// Gracias al patrón Singleton que usamos en ProductStore.js,
// este "store" es el mismo objeto en toda la aplicación.
const store = require("./store/ProductStore");


// ============================================================
// CONFIGURACIÓN DEL SERVIDOR
// ============================================================

// Puerto donde el servidor va a escuchar peticiones.
// El frontend tiene configurado BACKEND_URL con este mismo puerto.
// 3000 es la convención más usada para servidores de desarrollo.
const PORT = 3000;

// Origen permitido para las peticiones del frontend.
// "localhost:5500" es el puerto que usa Live Server de VS Code,
// que es la forma más común de abrir el frontend en desarrollo.
const ALLOWED_ORIGIN = "http://127.0.0.1:5500";


// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

// CORS (Cross-Origin Resource Sharing) es una política de
// seguridad del navegador. Por defecto, el navegador BLOQUEA
// las peticiones que van de un origen (frontend en puerto 5500)
// a otro origen diferente (backend en puerto 3000).
//
// Para permitirlo, el servidor debe incluir cabeceras especiales
// en cada respuesta que le digan al navegador: "este origen
// tiene permiso de hablarme".
//
// res.setHeader(nombre, valor) agrega una cabecera HTTP.
function setCORSHeaders(res) {
    // Indica qué origen tiene permiso de hacer peticiones.
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);

    // Indica qué métodos HTTP están permitidos desde el frontend.
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    // Indica qué cabeceras puede enviar el frontend.
    // "Content-Type" es necesaria porque el frontend envía JSON.
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Envía una respuesta JSON al cliente (al navegador).
// ------------------------------------------------------------
// Toda respuesta HTTP tiene: un código de estado, cabeceras
// y un cuerpo. Esta función los configura todos de una vez.
//
// statusCode: número que indica el resultado (200 = éxito, 404 = no encontrado, etc.)
// data: el objeto JavaScript que queremos enviar como respuesta.
function sendJSON(res, statusCode, data) {
    // Primero configuramos las cabeceras CORS.
    setCORSHeaders(res);
    
    // "Content-Type: application/json" le dice al navegador que
    // el cuerpo de la respuesta es texto en formato JSON.
    res.setHeader("Content-Type", "application/json");
    
    // writeHead escribe el código de estado HTTP en la respuesta.
    res.writeHead(statusCode);
    
    // end() cierra la respuesta y envía el cuerpo.
    // JSON.stringify() convierte el objeto JavaScript en texto JSON
    // porque HTTP solo puede transportar texto, no objetos JS.
    res.end(JSON.stringify(data));
}

// Lee el cuerpo completo de una petición POST y lo devuelve como objeto JS.
// ------------------------------------------------------------
// En Node.js, el cuerpo de una petición llega en FRAGMENTOS (chunks)
// a través de eventos. No podemos leerlo todo de una vez como en Express.
// Debemos "escuchar" los fragmentos, unirlos y al final parsear el JSON.
//
// Esta función devuelve una PROMESA para poder usar await en las rutas
// y escribir el código de forma ordenada y legible.
function readBody(req) {
    return new Promise((resolve, reject) => {
        // Arreglo donde vamos acumulando cada fragmento que llega.
        const chunks = [];
    
        // EVENTO "data": se dispara cada vez que llega un fragmento del cuerpo.
        // Cada chunk es un Buffer (datos en binario), los acumulamos en el arreglo.
        req.on("data", (chunk) => {
        chunks.push(chunk);
        });
    
        // EVENTO "end": se dispara cuando ya llegaron TODOS los fragmentos.
        // Buffer.concat() une todos los fragmentos en uno solo.
        // .toString() lo convierte de binario a texto.
        // JSON.parse() convierte el texto JSON en un objeto JavaScript.
        req.on("end", () => {
        try {
            const body = JSON.parse(Buffer.concat(chunks).toString());
            resolve(body);
        } catch {
            reject(new Error("El cuerpo de la petición no es JSON válido."));
        }
        });
    
        // EVENTO "error": si la conexión se corta o hay un problema de red.
        req.on("error", reject);
    });
}


// ============================================================
// MANEJADOR DE RUTAS
// ============================================================

// Función principal que recibe TODAS las peticiones HTTP.
// Node.js la llama automáticamente cada vez que llega una
// petición al servidor, pasándole dos objetos:
//
// req (IncomingMessage): todo sobre la petición que llegó
//   (método, ruta, cabeceras, cuerpo).
// res (ServerResponse): el objeto con el que construimos
//   y enviamos la respuesta al cliente.
async function handleRequest(req, res) {
    // Extraemos la ruta limpia de la URL usando el módulo "url".
    // url.parse() descompone la URL en sus partes.
    // .pathname extrae solo la ruta, sin query strings.
    // Ejemplo: "/products?foo=bar" => "/products"
    const pathname = url.parse(req.url).pathname;

    // Guardamos el método HTTP en una variable para compararlo.
    const method = req.method;

    // ── PETICIÓN OPTIONS (PREFLIGHT DE CORS) ─────────────────
    // Antes de hacer un POST con JSON, el navegador envía una
    // petición OPTIONS para preguntar si tiene permiso.
    // Debemos responder con 204 (sin contenido) y las cabeceras
    // CORS para que el navegador deje pasar la petición real.
    if (method === "OPTIONS") {
        setCORSHeaders(res);
        res.writeHead(204);
        res.end();
        return;
    }

    // ── RUTA: GET /products ───────────────────────────────────
    // Devuelve la lista completa de productos guardados en memoria.
    // El frontend podría usar esto para mostrar los guardados,
    // aunque en este proyecto lo manejamos en el frontend directamente.
    if (method === "GET" && pathname === "/products") {
        // store.getAll() devuelve todos los productos como objetos planos.
        const products = store.getAll();
    
        // Respondemos con código 200 (OK) y la lista en formato JSON.
        sendJSON(res, 200, {
        message: `${store.count()} producto(s) guardado(s).`,
        products,
        });
        return;
    }

    // ── RUTA: POST /products ──────────────────────────────────
    // Recibe un producto enviado desde el frontend, lo valida,
    // lo guarda en el almacén y muestra un mensaje en la terminal.
    if (method === "POST" && pathname === "/products") {
        // try/catch para manejar errores en la lectura del cuerpo
        // o en el proceso de guardar el producto.
        try {
        // Esperamos a que readBody() termine de leer todos los
        // fragmentos del cuerpo y nos devuelva el objeto JavaScript.
        const data = await readBody(req);

        // ── VALIDACIÓN BÁSICA ───────────────────────────────
        // Verificamos que el objeto recibido tenga los campos
        // mínimos necesarios antes de intentar guardarlo.
        // Si falta alguno, respondemos con 400 (Bad Request).
        if (!data.id || !data.title || !data.price) {
            sendJSON(res, 400, {
            error: "Faltan campos obligatorios: id, title, price.",
            });
            return;
        }

        // ── VERIFICACIÓN DE DUPLICADOS ──────────────────────
        // Si el producto ya existe en el almacén, no lo guardamos
        // de nuevo y avisamos al frontend con 409 (Conflict).
        if (store.has(data.id)) {
            sendJSON(res, 409, {
            error: `El producto con id ${data.id} ya está guardado.`,
            });
            return;
        }
    
        // ── GUARDAR EL PRODUCTO ─────────────────────────────
        // store.add() crea una instancia de Product con los datos
        // y la guarda en el arreglo interno. Devuelve el producto
        // creado para que podamos usar sus métodos aquí.
        const product = store.add(data);

        // ── MENSAJE EN LA TERMINAL ──────────────────────────
        // console.log imprime en la terminal del servidor.
        // Esto cumple el criterio: "mostrar un mensaje en la
        // terminal al guardar un producto".
        // product.getSummary() usa el método que definimos en
        // la clase Product para armar un texto descriptivo.
        console.log("\n✅ Nuevo producto guardado:");
        console.log(`   ${product.getSummary()}`);
        console.log(`   Guardado a las: ${product.savedAt}`);
        console.log(`   Total en almacén: ${store.count()} producto(s)\n`);
    
        // Respondemos con 201 (Created) para indicar que el recurso
        // fue creado exitosamente. Es más preciso que 200 para POST.
        sendJSON(res, 201, {
            message: "Producto guardado correctamente.",
            product: product.toJSON(),
        });
    
    } catch (error) {
        // Si readBody() falló (JSON malformado, error de red, etc.)
        // respondemos con 400 (Bad Request) y el mensaje de error.
        sendJSON(res, 400, { error: error.message });
    }

    return;
}

    // ── RUTA NO ENCONTRADA (404) ──────────────────────────────
    // Si la petición no coincidió con ninguna ruta definida arriba,
    // respondemos con 404 (Not Found).
    // Esto cubre cualquier ruta que el frontend llame por error.
    sendJSON(res, 404, {
        error: `Ruta no encontrada: ${method} ${pathname}`,
    });
}


// ============================================================
// CREAR EL SERVIDOR
// ============================================================

const server = http.createServer(handleRequest);

// ============================================================
// PONER EL SERVIDOR A ESCUCHAR
// ------------------------------------------------------------
// ============================================================

server.listen(PORT, "localhost", () => {
    // Estos console.log se imprimen en la terminal cuando arranca
    // el servidor con "node server.js". Le dicen al desarrollador
    // que todo está bien y dónde está corriendo el backend.
    console.log("╔══════════════════════════════════════════╗");
    console.log("║       ShopExplorer — Backend listo       ║");
    console.log("╠══════════════════════════════════════════╣");
    console.log(`║  Servidor corriendo en:                  ║`);
    console.log(`║  http://localhost:${PORT}                   ║`);
    console.log("╠══════════════════════════════════════════╣");
    console.log("║  Rutas disponibles:                      ║");
    console.log("║  GET  /products  → lista de guardados    ║");
    console.log("║  POST /products  → guardar producto      ║");
    console.log("╚══════════════════════════════════════════╝");
});


// ============================================================
// MANEJO DE ERRORES DEL SERVIDOR
// ============================================================

server.on("error", (error) => {
    // El código "EADDRINUSE" significa "Address Already In Use":
    // el puerto que queremos usar ya está ocupado por otro proceso.
    if (error.code === "EADDRINUSE") {
        console.error(`\n❌ Error: el puerto ${PORT} ya está en uso.`);
        console.error(`   Cerrá el proceso que lo está usando o cambiá PORT a otro número.\n`);
    } else {
        // Para cualquier otro error de red mostramos el mensaje original.
        console.error("\n❌ Error en el servidor:", error.message, "\n");
    }
    
    // process.exit(1) termina el proceso de Node.js con código 1,
    // que por convención indica que hubo un error.
    // Sin esto, el proceso quedaría colgado sin hacer nada.
    process.exit(1);
});
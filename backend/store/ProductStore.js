// ── IMPORTACIÓN DE DEPENDENCIAS ─────────────────────────────
// require() es la forma de Node.js de importar módulos.
// Aquí traemos la clase Product que definimos en models/Product.js
// para poder crear instancias con los datos que lleguen del frontend.
// El ".." sube una carpeta (de /store a /backend) y luego
// entra a /models/Product.js.
const Product = require("../models/Product")

// ============================================================
// CLASE PRODUCTSTORE — ALMACÉN EN MEMORIA
// ------------------------------------------------------------
// Esta clase actúa como una "base de datos liviana" en RAM.
// Centraliza toda la lógica de almacenamiento: agregar productos,
// consultarlos y verificar si ya existen.
//
// Al tenerlo en una clase, si en el futuro quisiéramos cambiar
// el almacenamiento (por ejemplo, usar un archivo JSON o una
// base de datos real), solo tocaríamos este archivo.
// ============================================================
class ProductStore {
    constructor() {
        // "products" es el arreglo donde vivem todos los productos guardados.
        // Empieza vacío y se va llenando cada vez que el frontend
        // envía un POST con un nuevo producto.
        this.products = [];
    }

    // ── MÉTODOS ────────────────────────────────────────────────

    // Recibe los datos crudos que llegaron del frontend (el payload),
    // crea una instancia de Product con ellos y la guarda en el arreglo.
    // Devuelve el producto creado para que server.js pueda usarlo
    // (por ejemplo, para imprimirlo en la terminal o responder al frontend).
    add(data) {
        // Creamos una instancia de Product con los datos recibidos.
        // Esto transforma el objeto crudo del JSON en un objeto estructurado
        // con atributos propios y métodos disponibles (formatPrice, getSummary, etc.)
        const product = new Product(data);

        // Agregamos el producto al arreglo de productos guardados.
        // .push() inserta el elemento al final del arreglo.
        this.products.push(product);

        // Devolvemos el producto recién creado para que quien llamó
        // este método pueda usarlo (ej: imprimir getSummary() en terminal).
        return product;
    }

    // Devuelve true si ya existe un producto con ese id en el almacén.
    // Lo usamos en server.js para evitar guardar el mismo producto dos veces.
    // .some() recorre el arreglo y devuelve true en cuanto encuentra
    // un elemento que cumpla la condición — deja de buscar ahí.
    has(id) {
        return this.products.some((p) => p.id === id);
    }

    // Devuelve una copia del arreglo completo de productos guardados.
    // El .map(p => p.toJSON()) convierte cada instancia de Product
    // en un objeto plano, listo para ser convertido a JSON y enviado
    // como respuesta HTTP desde el servidor.
    getAll() {
        return this.products.map((p) => p.toJSON());
    }

    // Devuelve cuántos productos hay guardados en este momento.
    // Lo usamos para el mensaje que se imprime en la terminal.
    count() {
        return this.products.length;
    }
}

// Exportamos una instancia única de ProductStore.
// Gracias al caché de módulos de Node.js, todos los archivos
// que hagan require() de este módulo obtendrán siempre
// el mismo objeto con los mismos datos adentro.
module.exports = new ProductStore();
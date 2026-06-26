// ============================================================
// PROGRAMACIÓN ORIENTADA A OBJETOS — CLASE Product
// ============================================================

class Product {
    // El constructor recibe un objeto "data" con los campos que
    // el frontend nos envió en el cuerpo del POST (el payload).
    // Cada this.atributo guarda un campo de ese objeto.
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.price = data.price;
        this.category = data.category;
        this.image = data.image;
        this.rating = data.rating;
        this.savedAt = new Date().toISOString();
    }

// ── MÉTODOS ────────────────────────────────────────────────

// Devuelve el precio formateado con símbolo de dólar y 2 decimales.
// .toFixed(2) convierte el número a string con exactamente 2 decimales.
// Ejemplo: 29.9 => "$29.90"
formatPrice() {
    return `$${this.price.toFixed(2)}`;
}

// Devuelve un resumen corto del producto como texto.
  // Útil para el mensaje que se imprime en la terminal del servidor
  // cuando se guarda un producto nuevo.
getSummary() {
    return `[ID: ${this.id}] ${this.title} — ${this.formatPrice()} (${this.category})`;
}

// Devuelve el objeto como un "objeto plano" de JavaScript.
// Lo usamos cuando necesitamos enviar el producto como respuesta
// JSON desde el servidor, ya que JSON.stringify no incluye métodos,
// solo propiedades — con este método controlamos exactamente qué campos saldrán.
toJSON() {
    return {
        id: this.id,
        title: this.title,
        price: this.price,
        category: this.category,
        image: this.image,
        rating: this.rating,
        savedAt: this.savedAt
    }
}
}

module.exports = Product
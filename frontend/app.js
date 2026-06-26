// URL base de FakeStoreAPI (la API gratuita).
const BASE_URL = "https://fakestoreapi.com"

// URL base de NUESTRO backend hecho con Node.js puro (puerto 3000).
const BACKEND_URL = "http://localhost:3000"

// ============================================================
// REFERENCIAS AL DOM
// ============================================================

// Contenedor donde se van a pintar las tarjetas de productos.
const productsGrid = document.getElementById("productsGrid")

// Barra de estado: muestra "Cargando...", errores o resultados.
const statusBar = document.getElementById("statusBar")
const statusText = document.getElementById("statusText")
const spinner = document.getElementById("spinner")

// Input de búsqueda en el header.
const searchInput = document.getElementById("searchInput")

// Botón que abre el panel lateral de guardados y el contador numérico.
const savedBtn = document.getElementById("savedBtn")
const savedCount = document.getElementById("savedCount")

// Contenedor de los botones de categoría (filtros).
const categoryFilters = document.getElementById("categoryFilters")

// Elementos del MODAL de detalle del producto.
const modalOverlay = document.getElementById("modalOverlay")
const modalTitle = document.getElementById("modalTitle")
const modalImg = document.getElementById("modalImg")
const modalCategory = document.getElementById("modalCategory")
const modalPrice = document.getElementById("modalPrice")
const modalRating = document.getElementById("modalRating")
const modalDescription = document.getElementById("modalDescription")
const saveModalBtn = document.getElementById("saveModalBtn")
const closeModalBtn  = document.getElementById("closeModal")

// Elementos del PANEL LATERAL de productos guardados.
const savedPanel = document.getElementById("savedPanel")
const savedList  = document.getElementById("savedList")
const closePanelBtn = document.getElementById("closePanel")

// Div del TOAST (notificación pequeña que aparece abajo).
const toast = document.getElementById("toast")

// Div del ESTADO VACÍO (cuando la búsqueda no da resultados).
const emptyState = document.getElementById("emptyState")
const emptyTerm = document.getElementById("emptyTerm")


// ============================================================
// VARIABLES DE ESTADO DE LA APLICACIÓN
// ============================================================

// Guarda TODOS los productos que llegaron de la API.
// Los necesitamos completos para filtrar y buscar sin volver
// a hacer otra petición a la API cada vez.
let allProducts = []

// Guarda qué categoría está seleccionada en este momento.
let activeCategory = "all"

// Referencia al producto que tiene el modal abierto ahora mismo.
// Lo necesitamos para saber qué guardar cuando el usuario
// presiona el botón "Guardar producto" dentro del modal.
let currentProduct = null

// Arreglo con los IDs de los productos ya guardados en el backend.
// Lo usamos para marcar visualmente los botones como "guardado"
// y para evitar guardar el mismo producto dos veces.
let savedIds = []


// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

// Arma la URL completa uniendo la URL base con la ruta recibida.
function buildUrl(path){
    return `${BASE_URL}/${path}`
}

// Muestra u oculta el spinner y actualiza el texto de la barra de estado.
// El segundo parámetro "isError" cambia el color del texto a rojo si es true.
// classList.toggle agrega la clase si no la tiene, o la quita si ya la tiene.
function setStatus(message, isError = false) {
    statusText.textContent = message
    spinner.style.display = isError ? "none" : "block"
    statusBar.className = isError ? "error" : ""
}

// Oculta completamente la barra de estado cuando ya no se necesita.
function hideStatus() {
    statusBar.style.display = "none"
}

// Muestra una notificación pequeña (toast) en la parte inferior de la pantalla.
// Recibe el mensaje y el tipo ("success" o "error") para cambiar el color.
// setTimeout programa una función para que se ejecute después de un tiempo.
// En este caso, oculta el toast automáticamente después de 2.5 segundos.
function showToast(message, type = "success") {
    toast.textContent = message
    toast.className = `show ${type}`
    setTimeout(() => {
        toast.className = ""
    }, 2500);
}

// Convierte un número de rating (ej: 3.9) en estrellas visuales.
// Math.round() redondea al entero más cercano: 3.9 => 4.
// "★".repeat(n) repite el carácter n veces.
// "☆".repeat(n) rellena con estrellas vacías hasta completar 5.
function formatStars(rating) {
    const full  = Math.round(rating)
    const empty = 5 - full
    return "★".repeat(full) + "☆".repeat(empty)
}

// Filtra y muestra los productos según la categoría activa y el texto buscado.
// Esta función se llama cada vez que el usuario cambia de categoría o escribe
// en el buscador — trabaja siempre sobre "allProducts" (la lista completa).
function applyFilters() {
    const term  = searchInput.value.trim().toLowerCase()

    // .filter() recorre el arreglo y devuelve un nuevo arreglo solo con los
    // elementos que cumplen la condición que le pasamos.
    const filtered = allProducts.filter((product) => {
        // El producto pertenece a la categoría activa,
        // o la categoría activa es "all" (mostrar todas).
        const matchesCategory = activeCategory === "all" || product.category === activeCategory

        // El título del producto contiene el texto buscado.
        // .includes() devuelve true si el string contiene el texto recibido.
        const matchesSearch = product.title.toLowerCase().includes(term)

        // El producto se incluye en el resultado solo si cumple AMBAS condiciones.
        return matchesCategory && matchesSearch;
    })

    // Limpiamos el grid antes de volver a pintarlo.
    productsGrid.innerHTML = ""

    // Si no hay resultados, mostramos el estado vacío con el término buscado.
    // Si sí hay resultados, renderizamos cada producto como una tarjeta.
    if (filtered.length === 0) {
        emptyState.classList.add("visible")
        emptyTerm.textContent = `"${term}"`
    } else {
        emptyState.classList.remove("visible")
        filtered.forEach((product) => renderCard(product))
    }
}

// Crea y agrega al grid la tarjeta visual de un producto.
// Recibe un objeto producto que viene de la API (ya procesado).
// document.createElement crea un elemento HTML nuevo en memoria.
// innerHTML asigna el contenido HTML interno de ese elemento.
// appendChild lo inserta al final del contenedor grid.
function renderCard(product) {
    const card = document.createElement("article")
    card.className = "card"

    // Verificamos si este producto ya fue guardado para mostrar el botón
    // en estado "guardado" desde el principio si corresponde.
    const isSaved = savedIds.includes(product.id)
    const btnLabel = isSaved ? "✓ Guardado" : "Guardar"
    const btnClass = isSaved ? "save-btn saved" : "save-btn"

    card.innerHTML = `
        <div class="card-img-wrap">
            <img src="${product.image}" alt="${product.title}" loading="lazy"/>
        </div>
        <div class="card-body">
            <p class="card-category">${product.category}</p>
            <p class="card-title">${product.title}</p>
            <div class="card-rating">
                <span class="stars">${formatStars(product.rating.rate)}</span>
                <span>${product.rating.rate} (${product.rating.count})</span>
            </div>
        </div>
        <div class="card-footer">
            <span class="card-price">$${product.price.toFixed(2)}</span>
            <button class="${btnClass}" data-id="${product.id}">${btnLabel}</button>
        </div>
    `

    // EVENTO click en la tarjeta completa: abre el modal de detalle.
    // Pero solo si el clic NO fue en el botón guardar — para eso usamos
    // closest(), que sube por el DOM buscando si el clic tocó un .save-btn.
    card.addEventListener("click", (event) => {
        if (!event.target.closest(".save-btn")) {
            openModal(product)
        }
    })

    // EVENTO click en el botón "Guardar" de la tarjeta.
    // querySelector busca el botón dentro de esta tarjeta específica.
    const saveBtn = card.querySelector(".save-btn")
    saveBtn.addEventListener("click", (event) => {
        // stopPropagation evita que el clic "suba" a la tarjeta y abra el modal.
        event.stopPropagation()
        saveProduct(product, saveBtn)
    });
    
    productsGrid.appendChild(card)
}

// Genera los botones de filtro de categoría en el header.
// Recibe el arreglo de categorías que devuelve la API.
// Creamos un botón por cada categoría y lo agregamos al contenedor.
function renderCategoryButtons(categories) {
    categories.forEach((cat) => {
        const btn = document.createElement("button")
        btn.className   = "cat-btn"
        btn.textContent = cat
        btn.dataset.cat = cat
    
        // EVENTO click en cada botón de categoría.
        btn.addEventListener("click", () => {
            // Quitamos la clase "active" del botón que la tenía antes.
            document.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("active"))
            // Le ponemos "active" al botón que el usuario acaba de presionar.
            btn.classList.add("active")
            // Actualizamos la variable de estado con la categoría seleccionada.
            activeCategory = cat
            // Volvemos a filtrar y pintar el grid con la nueva categoría.
            applyFilters()
        });
    
        categoryFilters.appendChild(btn)
    });
}

// ============================================================
// FUNCIONES ASÍNCRONAS — FETCH Y CONSUMO DE LA API
// ============================================================

// Pide a la API la lista de todos los productos disponibles.
// La API devuelve un arreglo JSON con 20 productos.
async function fetchProducts() {
    // await pausa aquí hasta que el servidor responda.
    const response = await fetch(buildUrl("products"))
    
    // response.ok es true si el servidor respondió con éxito (código 200-299).
    // Si es false significa que algo salió mal (404, 500, etc.).
    if (!response.ok) {
        throw new Error("No se pudieron cargar los productos.")
    }
    
    // .json() lee el cuerpo de la respuesta y lo convierte en un objeto JS.
    // También devuelve una promesa, por eso usamos await.
    return response.json()
}

// Pide a la API el listado de todas las categorías disponibles.
// FakeStoreAPI tiene un endpoint específico para esto: /products/categories
async function fetchCategories() {
    const response = await fetch(buildUrl("products/categories"))
    if (!response.ok) {
        throw new Error("No se pudieron cargar las categorías.")
    }
    return response.json()
}

// Función principal que inicia la aplicación: pide productos y categorías
// al mismo tiempo usando Promise.all(), luego los muestra en pantalla.
//
// Promise.all() recibe un arreglo de promesas y espera a que TODAS
// terminen en paralelo. Si alguna falla, lanza un error inmediatamente.
// Esto es más eficiente que esperar una, luego la otra, una por una.
async function loadApp() {
    setStatus("Cargando productos...")

    // try: intentamos ejecutar el código que puede fallar.
    // catch: si algo dentro de try lanza un error, llegamos aquí.
    // finally: se ejecuta SIEMPRE, haya error o no.
    try {
        // Lanzamos las dos peticiones al mismo tiempo y esperamos ambas.
        const [products, categories] = await Promise.all([
            fetchProducts(),
            fetchCategories(),
        ])
    
        // Guardamos los productos en la variable global para poder
        // filtrarlos después sin volver a pedirlos a la API.
        allProducts = products
    
        // Pintamos los botones de categoría con los datos que llegaron.
        renderCategoryButtons(categories)
    
        // Pintamos todos los productos en el grid.
        products.forEach((product) => renderCard(product))
    
        // Actualizamos la barra de estado con la cantidad de resultados.
        hideStatus()
    
    } catch (error) {
        // Si algo falló, mostramos el mensaje de error al usuario.
        setStatus(error.message, true)
    }
}


// ============================================================
// MODAL DE DETALLE DEL PRODUCTO
// ============================================================

// Abre el modal con la información completa del producto recibido.
// Rellena cada elemento del modal con los datos del producto
// y guarda el producto en "currentProduct" para usarlo al guardar.
function openModal(product) {
    // Guardamos el producto actual en la variable global para que
    // el botón "Guardar" dentro del modal sepa qué producto enviar.
    currentProduct = product
    
    // Rellenamos cada parte del modal con los datos del producto.
    modalTitle.textContent = product.title
    modalImg.src = product.image
    modalImg.alt = product.title
    modalCategory.textContent = product.category
    modalPrice.textContent = `$${product.price.toFixed(2)}`
    modalRating.textContent = `${formatStars(product.rating.rate)}  ${product.rating.rate} de 5 (${product.rating.count} reseñas)`
    modalDescription.textContent = product.description
    
    // Revisamos si este producto ya fue guardado para mostrar el
    // botón del modal en el estado correcto desde el principio.
    if (savedIds.includes(product.id)) {
        saveModalBtn.textContent = "✓ Ya guardado"
        saveModalBtn.classList.add("saved")
    } else {
        saveModalBtn.textContent = "⭐ Guardar producto"
        saveModalBtn.classList.remove("saved")
    }
    
    // Agregamos la clase "open" al overlay para que el CSS lo muestre.
    // También actualizamos aria-hidden para accesibilidad: los lectores
    // de pantalla sabrán que el modal ahora está visible.
    modalOverlay.classList.add("open")
    modalOverlay.setAttribute("aria-hidden", "false")
}

// Cierra el modal quitando la clase "open" del overlay.
function closeModal() {
    modalOverlay.classList.remove("open")
    modalOverlay.setAttribute("aria-hidden", "true")
    // Limpiamos currentProduct porque ya no hay ningún modal abierto.
    currentProduct = null
}


// ============================================================
// PANEL LATERAL DE GUARDADOS
// ============================================================

// Abre el panel lateral de guardados.
function openSavedPanel() {
    savedPanel.classList.add("open")
}

// Cierra el panel lateral de guardados.
function closeSavedPanel() {
    savedPanel.classList.remove("open")
}

// Agrega visualmente un producto guardado al panel lateral.
// En vez de reconstruir toda la lista cada vez, solo agregamos
// el nuevo elemento al final — es más eficiente.
function addItemToPanel(product) {
    // Si el panel tenía el mensaje de "vacío", lo quitamos primero.
    const empty = savedList.querySelector(".saved-empty")
    if (empty) empty.remove()
    
    // Creamos el elemento visual del producto guardado.
    const item = document.createElement("div")
    item.className = "saved-item"
    item.innerHTML = `
        <img src="${product.image}" alt="${product.title}" />
        <div class="saved-item-info">
            <p class="saved-item-title">${product.title}</p>
            <p class="saved-item-price">$${product.price.toFixed(2)}</p>
        </div>
    `
    
    savedList.appendChild(item)
}

// Actualiza el número que aparece en el botón "Guardados" del header.
// Este contador le dice al usuario cuántos productos lleva guardados.
function updateSavedCount() {
    savedCount.textContent = savedIds.length
}

// ============================================================
// GUARDAR PRODUCTO EN EL BACKEND
// ============================================================

async function saveProduct(product, buttonElement) {
    // Si el producto ya fue guardado, no hacemos nada.
    // Esto evita duplicados tanto en el frontend como en el backend.
    if (savedIds.includes(product.id)) {
        showToast("Este producto ya está guardado.", "error")
        return
    }
    
    // Armamos el objeto que vamos a enviar al backend.
    // Solo mandamos los campos que necesitamos, no todo el objeto crudo.
    const payload = {
        id: product.id,
        title: product.title,
        price: product.price,
        category: product.category,
        image: product.image,
        rating: product.rating.rate,
    }
    
    // try/catch para manejar posibles errores de red o del servidor.
    try {
        // fetch() con method "POST" envía el objeto al backend.
        // headers le dice al servidor que el cuerpo es JSON.
        // body es el contenido que enviamos, convertido a texto con JSON.stringify().
        const response = await fetch(`${BACKEND_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        });
    
        // Verificamos que el servidor respondió con éxito.
        if (!response.ok) {
        throw new Error("El servidor no pudo guardar el producto.");
        }
    
        // Si llegamos aquí, el guardado fue exitoso.
        // Agregamos el id a nuestra lista local de guardados.
        savedIds.push(product.id)
    
        // Actualizamos visualmente el botón que disparó la acción.
        // buttonElement puede ser el botón de la tarjeta o el del modal.
        if (buttonElement) {
        buttonElement.textContent = "✓ Guardado"
        buttonElement.classList.add("saved")
        }
    
        // También actualizamos el botón del modal si está abierto
        // y muestra el mismo producto que se acaba de guardar.
        if (currentProduct && currentProduct.id === product.id) {
        saveModalBtn.textContent = "✓ Ya guardado"
        saveModalBtn.classList.add("saved")
        }
    
        // Buscamos si en el grid hay una tarjeta de este producto
        // y actualizamos su botón "Guardar" también.
        // querySelector con atributo data-id busca el botón de esa tarjeta.
        const cardBtn = productsGrid.querySelector(`.save-btn[data-id="${product.id}"]`)
        if (cardBtn) {
        cardBtn.textContent = "✓ Guardado"
        cardBtn.classList.add("saved")
        }
    
        // Agregamos el producto al panel lateral y actualizamos el contador.
        addItemToPanel(product)
        updateSavedCount()
    
        // Mostramos una notificación de éxito al usuario.
        showToast(`"${product.title.slice(0, 30)}..." guardado correctamente.`)
    
    } catch (error) {
        // Si algo falló (sin conexión, servidor caído, etc.), mostramos el error.
        showToast(error.message, "error")
    }
}

// ============================================================
// REGISTRO DE EVENTOS DEL DOM
// ============================================================

// EVENTO DOMContentLoaded: se dispara cuando el HTML terminó de
// cargar completamente. Aquí arrancamos la app.
// Es el punto de entrada: sin esto, el JS intentaría manipular
// elementos del DOM que todavía no existen.
document.addEventListener("DOMContentLoaded", loadApp)

// EVENTO keydown: se dispara cada vez que el usuario presiona
// una tecla. "Escape" cierra el modal si está abierto.
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeModal()
    }
})

// EVENTO input en el buscador: se dispara con cada letra que
// el usuario escribe o borra. Aplicamos los filtros en tiempo real
// sin necesidad de que presione Enter ni ningún botón.
searchInput.addEventListener("input", () => {
    applyFilters()
})

// EVENTO keydown en el buscador: si el usuario presiona Enter
// también aplicamos los filtros (algunos usuarios esperan esto).
// preventDefault evita que el formulario se envíe y recargue la página.
searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault()
        applyFilters()
    }
})

// EVENTO click en el botón "Guardados" del header: abre el panel lateral.
savedBtn.addEventListener("click", () => {
    openSavedPanel()
})

// EVENTO click en el botón "×" del panel lateral: lo cierra.
closePanelBtn.addEventListener("click", () => {
    closeSavedPanel()
})

// EVENTO click en el botón "×" del modal: lo cierra.
closeModalBtn.addEventListener("click", () => {
    closeModal()
})

// EVENTO click en el overlay del modal: si el usuario hace clic
// en el fondo oscuro (fuera del modal), también lo cerramos.
// event.target es el elemento exacto donde se hizo clic.
// Solo cerramos si el clic fue en el overlay, no en el modal mismo.
modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) {
        closeModal()
    }
})

// EVENTO click en el botón "Guardar" dentro del modal.
// Usa currentProduct (el que se guardó al abrir el modal)
// y pasa el propio botón para actualizarlo visualmente.
saveModalBtn.addEventListener("click", () => {
    if (currentProduct) {
        saveProduct(currentProduct, saveModalBtn)
    }
})

// EVENTO click en el botón "Todos" de categorías (ya existe en el HTML).
// Los demás botones de categoría se crean dinámicamente en renderCategoryButtons().
document.querySelector(".cat-btn[data-cat='all']").addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("active"))
    document.querySelector(".cat-btn[data-cat='all']").classList.add("active")
    activeCategory = "all"
    applyFilters()
})
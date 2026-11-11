// Reemplaza esto con tu URL de Google Apps Script (la que termina en /exec)
const URL_API = "https://script.google.com/macros/s/AKfycbwcM-ab_mLpr6jyVIhOPU1Ax3T6_lmC1BR_TyumWSgqFbUKm4ySX8x3cRhkJSD0O_r9uQ/exec";

document.addEventListener("DOMContentLoaded", function() {
    cargarOpcionesDesplegables();
});

// 1. Cargar las opciones del selector desde Google Sheets
function cargarOpcionesDesplegables() {
    fetch(URL_API + "?action=getEstadosAnimo")
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("filtro-estado");
            // Mantenemos la opción de "todos" y añadimos las de Sheets
            data.forEach(item => {
                let option = document.createElement("option");
                option.value = item;
                option.textContent = item;
                select.appendChild(option);
            });
        })
        .catch(error => console.error("Error al cargar opciones:", error));
}

// 2. Controlar el filtrado (si elige "todos" o un estado específico)
function filtrarRegistros() {
    const seleccion = document.getElementById("filtro-estado").value;
    const contenedor = document.getElementById("resultado-busqueda");
    
    contenedor.innerHTML = "<p>Cargando registros...</p>";

    if (seleccion === "todos") {
        // Traer todos los registros
        fetch(URL_API + "?action=getTodos")
            .then(response => response.json())
            .then(data => {
                mostrarRegistrosEnPantalla(data);
            })
            .catch(error => {
                contenedor.innerHTML = "<p>Error al cargar los datos.</p>";
                console.error(error);
            });
    } else {
        // Filtrar por el estado de ánimo seleccionado (puedes adaptar esta lógica según prefieras)
        fetch(URL_API + "?action=getTodos")
            .then(response => response.json())
            .then(data => {
                // Filtramos localmente los que coincidan con el estado de ánimo (ej: columna de estado)
                // Asumiendo que la columna 1 o 2 es el estado de ánimo
                const filtrados = data.filter(fila => fila.includes(seleccion));
                mostrarRegistrosEnPantalla(filtrados);
            })
            .catch(error => {
                contenedor.innerHTML = "<p>Error al filtrar.</p>";
                console.error(error);
            });
    }
}

// 3. Dibujar los resultados en la interfaz
function mostrarRegistrosEnPantalla(registros) {
    const contenedor = document.getElementById("resultado-busqueda");
    contenedor.innerHTML = "";

    if (!registros || registros.length === 0) {
        contenedor.innerHTML = "<p>No hay registros guardados todavía.</p>";
        return;
    }

    registros.forEach(fila => {
        let div = document.createElement("div");
        div.className = "tarjeta-versiculo";
        // Mostramos los datos de la fila de forma limpia
        div.innerHTML = `<p><strong>Fuente / Contenido:</strong> ${fila.join(" - ")}</p>`;
        contenedor.appendChild(div);
    });
}

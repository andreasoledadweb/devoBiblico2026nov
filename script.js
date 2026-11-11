const URL_API = "https://script.google.com/macros/s/AKfycbwAONnrouBDKa71KNGdDkZuYl3KTM6q7mrK1gdmlnr56tWPt9L69nkCnj8-rgmcrkGVNA/exec";

document.addEventListener("DOMContentLoaded", function() {
    cargarDesplegableSheets();
});

// Carga las opciones normales desde Google Sheets
function cargarDesplegableSheets() {
    fetch(URL_API + "?action=getEstadosAnimo")
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById("filtro-estado");
            data.forEach(item => {
                let opt = document.createElement("option");
                opt.value = item;
                opt.textContent = item;
                select.appendChild(opt);
            });
        })
        .catch(error => console.error("Error cargando opciones:", error));
}

// Nueva función de control para el desplegable
function seleccionarFiltro() {
    const valor = document.getElementById("filtro-estado").value;
    
    if (valor === "todos") {
        // Trae y muestra todos los registros guardados sin filtrar
        fetch(URL_API + "?action=getTodos")
            .then(res => res.json())
            .then(data => mostrarEnPantalla(data))
            .catch(err => console.error(err));
    } else {
        // Tu comportamiento original de filtro por el estado seleccionado
        fetch(URL_API + "?action=getTodos")
            .then(res => res.json())
            .then(data => {
                const filtrados = data.filter(fila => fila.includes(valor));
                mostrarEnPantalla(filtrados);
            })
            .catch(err => console.error(err));
    }
}

function mostrarEnPantalla(registros) {
    const contenedor = document.getElementById("contenedor-datos");
    contenedor.innerHTML = "";
    
    if (!registros || registros.length === 0) {
        contenedor.innerHTML = "<p>No hay registros.</p>";
        return;
    }

    registros.forEach(fila => {
        let div = document.createElement("div");
        div.className = "item-resultado";
        div.textContent = fila.join(" - ");
        contenedor.appendChild(div);
    });
}

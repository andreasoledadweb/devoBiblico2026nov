// Coloca la URL de tu Aplicación Web de Apps Script aquí
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-sCzMPodt-sa00m5dxymFsBGmUNeje_dOy_ec5uEtXSHd9SLDYgkkV7-4dq7c8l21PQ/exec";

let datosGlobales = {
  estadosAnimo: [],
  registrosNov2026: [],
  antiguoTestamento: [],
  nuevoTestamento: [],
  registrosMemorizados: []
};

document.addEventListener("DOMContentLoaded", () => {
  cargarTodosLosDatos();

  // Escuchar cambio en el switch de SÍ / NO
  const switchBtn = document.getElementById("switch-aprendido");
  if (switchBtn) {
    switchBtn.addEventListener("change", (e) => {
      document.getElementById("label-switch").innerText = e.target.checked ? "SÍ" : "NO";
    });
  }
});

function toggleModoOscuro() {
  document.body.classList.toggle("modo-oscuro");
  const esOscuro = document.body.classList.contains("modo-oscuro");
  document.getElementById("icono-modo").innerText = esOscuro ? "☀️" : "🌙";
}

function mostrarSeccion(seccionId) {
  document.querySelectorAll(".seccion-contenido").forEach(sec => sec.classList.add("oculto"));
  document.querySelectorAll(".menu-botones-principal .btn-menu").forEach(btn => btn.classList.remove("active"));

  document.getElementById(seccionId).classList.remove("oculto");
  event.target.classList.add("active");
}

function mostrarSubPractica(subId) {
  document.querySelectorAll(".sub-practica-contenido").forEach(sub => sub.classList.add("oculto"));
  document.querySelectorAll(".sub-menu .btn-sub-menu").forEach(btn => btn.classList.remove("active"));

  document.getElementById(subId).classList.remove("oculto");
  event.target.classList.add("active");
}

// Cargar información inicial desde Google Sheets
async function cargarTodosLosDatos() {
  try {
    const res = await fetch(SCRIPT_URL);
    datosGlobales = await res.json();

    poblarSelectsEstadoAnimo();
  } catch (err) {
    console.error("Error al cargar datos:", err);
  }
}

function poblarSelectsEstadoAnimo() {
  const animos = datosGlobales.estadosAnimo || [];
  
  llenarSelect("add-estado-animo", animos, "-- Selecciona --");
  llenarSelect("guard-estado-animo", animos, "-- Selecciona --");
  
  // Extraer estados de ánimo que existen en 'memorizado'
  const animosMem = [...new Set(datosGlobales.registrosMemorizados.map(r => r.animo))];
  llenarSelect("mem-estado-animo", animosMem, "-- Selecciona --");
}

function llenarSelect(elementId, lista, defaultText) {
  const select = document.getElementById(elementId);
  if (!select) return;
  select.innerHTML = `<option value="">${defaultText}</option>`;
  lista.forEach(item => {
    select.innerHTML += `<option value="${item}">${item}</option>`;
  });
}

// ================= AGREGAR =================
function generarVistaPreviaAgregar() {
  const animo = document.getElementById("add-estado-animo").value;
  const fuente = document.getElementById("add-fuente").value;
  const contenido = document.getElementById("add-contenido").value;

  if (!animo || !fuente || !contenido) {
    alert("Por favor completa todos los campos.");
    return;
  }

  document.getElementById("pv-animo").innerText = animo;
  document.getElementById("pv-fuente").innerText = fuente;
  document.getElementById("pv-contenido").innerText = contenido;

  document.getElementById("vista-previa-container").classList.remove("oculto");
}

function modificarAgregar() {
  document.getElementById("vista-previa-container").classList.add("oculto");
}

function limpiarFormAgregar() {
  document.getElementById("form-agregar").reset();
  document.getElementById("vista-previa-container").classList.add("oculto");
  document.getElementById("msg-agregar").innerText = "";
}

async function guardarEnSheetsAgregar() {
  const animo = document.getElementById("pv-animo").innerText;
  const fuente = document.getElementById("pv-fuente").innerText;
  const contenido = document.getElementById("pv-contenido").innerText;

  const msg = document.getElementById("msg-agregar");
  msg.innerText = "Guardando...";

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "guardarNov2026", animo, fuente, contenido })
    });
    const data = await res.json();
    if (data.status === "success") {
      msg.innerText = "¡Guardado exitosamente!";
      setTimeout(() => {
        limpiarFormAgregar();
        cargarTodosLosDatos();
      }, 1200);
    }
  } catch (err) {
    msg.innerText = "Error al guardar.";
  }
}

// ================= GUARDADOS =================
function filtrarFuentesGuardadas() {
  const animoSel = document.getElementById("guard-estado-animo").value;
  const reg = datosGlobales.registrosNov2026 || [];
  const filtrados = reg.filter(r => r.animo === animoSel);
  
  const fuentes = [...new Set(filtrados.map(r => r.fuente))];
  llenarSelect("guard-fuente", fuentes, "-- Selecciona Fuente --");
}

function probarConocimientoGuardados() {
  const animo = document.getElementById("guard-estado-animo").value;
  const fuente = document.getElementById("guard-fuente").value;

  const reg = datosGlobales.registrosNov2026.find(r => r.animo === animo && r.fuente === fuente);
  if (!reg) return;

  document.getElementById("guard-contenido-real").value = reg.contenido;
  document.getElementById("revelado-guardados-container").classList.remove("oculto");
}

function limpiarGuardados() {
  document.getElementById("form-guardados").reset();
  document.getElementById("revelado-guardados-container").classList.add("oculto");
  document.getElementById("msg-guardados").innerText = "";
  document.getElementById("switch-aprendido").checked = false;
  document.getElementById("label-switch").innerText = "NO";
}

async function guardarMemorizado() {
  const esAprendido = document.getElementById("switch-aprendido").checked;
  if (!esAprendido) {
    alert("Marca el interruptor en SÍ para guardar en Memorizados.");
    return;
  }

  const animo = document.getElementById("guard-estado-animo").value;
  const fuente = document.getElementById("guard-fuente").value;
  const contenido = document.getElementById("guard-contenido-real").value;

  const msg = document.getElementById("msg-guardados");
  msg.innerText = "Guardando en Memorizados...";

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ action: "guardarMemorizado", animo, fuente, contenido })
    });
    const data = await res.json();
    if (data.status === "success") {
      msg.innerText = "¡Agregado a la hoja Memorizado!";
      setTimeout(() => {
        limpiarGuardados();
        cargarTodosLosDatos();
      }, 1200);
    }
  } catch (err) {
    msg.innerText = "Error al guardar.";
  }
}

// ================= PRACTICAR: ORDEN BIBLIA =================
function cargarGruposBiblia() {
  const testamento = document.getElementById("testamento-select").value;
  let lista = [];

  if (testamento === "Antiguo Testamento") {
    lista = datosGlobales.antiguoTestamento.map(g => g.grupo);
  } else if (testamento === "Nuevo Testamento") {
    lista = datosGlobales.nuevoTestamento.map(g => g.grupo);
  }

  llenarSelect("grupo-select", [...new Set(lista)], "-- Selecciona Grupo --");
}

function probarConocimientoOrden() {
  const testamento = document.getElementById("testamento-select").value;
  const grupo = document.getElementById("grupo-select").value;

  let reg = null;
  if (testamento === "Antiguo Testamento") {
    reg = datosGlobales.antiguoTestamento.find(g => g.grupo === grupo);
  } else if (testamento === "Nuevo Testamento") {
    reg = datosGlobales.nuevoTestamento.find(g => g.grupo === grupo);
  }

  if (!reg) return;

  document.getElementById("orden-contenido-real").value = reg.contenido;
  document.getElementById("revelado-orden-container").classList.remove("oculto");
}

function limpiarOrdenBiblia() {
  document.getElementById("testamento-select").value = "";
  document.getElementById("grupo-select").innerHTML = '<option value="">-- Selecciona Testamento Primero --</option>';
  document.getElementById("orden-practica-input").value = "";
  document.getElementById("revelado-orden-container").classList.add("oculto");
}

// ================= PRACTICAR: APRENDIDOS =================
function filtrarFuentesMemorizadas() {
  const animoSel = document.getElementById("mem-estado-animo").value;
  const reg = datosGlobales.registrosMemorizados || [];
  const filtrados = reg.filter(r => r.animo === animoSel);
  
  const fuentes = [...new Set(filtrados.map(r => r.fuente))];
  llenarSelect("mem-fuente", fuentes, "-- Selecciona Fuente --");
}

function probarConocimientoMemorizados() {
  const animo = document.getElementById("mem-estado-animo").value;
  const fuente = document.getElementById("mem-fuente").value;

  const reg = datosGlobales.registrosMemorizados.find(r => r.animo === animo && r.fuente === fuente);
  if (!reg) return;

  document.getElementById("mem-contenido-real").value = reg.contenido;
  document.getElementById("revelado-mem-container").classList.remove("oculto");
}

function limpiarMemorizados() {
  document.getElementById("mem-estado-animo").value = "";
  document.getElementById("mem-fuente").innerHTML = '<option value="">-- Selecciona Estado de Ánimo Primero --</option>';
  document.getElementById("mem-practica-input").value = "";
  document.getElementById("revelado-mem-container").classList.add("oculto");
}

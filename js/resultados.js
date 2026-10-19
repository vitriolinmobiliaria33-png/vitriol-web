const supabaseClient = window.supabase.createClient(
  'https://lirhxxvemagoyvlijfrj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcmh4eHZlbWFnb3l2bGlqZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTUzMjYsImV4cCI6MjA4ODE3MTMyNn0.s-E_H_9awM0zZ_r14SH6NmEJ3Y4KeUo_R3CxQKQ7sDw'
);



let paginaActual = 1;
const cantidadPorPagina = 9;
let ordenActual = '';

const whatsapp = document.querySelector('.whatsapp-float');

async function inicializarFiltros() {
  const { data: operaciones } = await supabaseClient.from('Operaciones').select('*');
  const { data: tipos } = await supabaseClient.from('Tipos').select('*');

  const filtroOperacion = document.getElementById("filtroOperacion");
  const filtroTipo = document.getElementById("filtroTipo");

  operaciones.forEach(op => {
    filtroOperacion.innerHTML += `<option value="${op.id}">${op.name}</option>`;
  });

  tipos.forEach(tipo => {
    filtroTipo.innerHTML += `<option value="${tipo.id}">${tipo.name}</option>`;
  });

  const params = new URLSearchParams(window.location.search);
  if (params.get("operacion")) filtroOperacion.value = params.get("operacion");
  if (params.get("tipo")) filtroTipo.value = params.get("tipo");
  if (params.get("barrio")) document.getElementById("filtroBarrio").value = params.get("barrio");

  cargarResultados(true);
}

async function cargarResultados(resetearPagina = false) {

  const contenedor = document.getElementById("contenedorResultados");

  // Mostrar loading en lugar de las cards
  contenedor.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Cargando propiedades...</p>
    </div>
  `;

  if (resetearPagina) {
    paginaActual = 1;
  }

  const inicioRango = (paginaActual - 1) * cantidadPorPagina;
  const finRango = inicioRango + cantidadPorPagina - 1;

  const operacion = document.getElementById("filtroOperacion").value;
  const tipo = document.getElementById("filtroTipo").value;
  const barrio = document.getElementById("filtroBarrio").value;

  const dormitorios = document.getElementById("filtroDormitorios").value;
  const precioMin = document.getElementById("filtroPrecioMin").value;
  const precioMax = document.getElementById("filtroPrecioMax").value;

  let query = supabaseClient
    .from('Propiedades')
    .select(`
      *,
      Barrios (name),
      Tipos (name),
      Operaciones (name),
      Imagenes (image_url, is_main)
    `, { count: 'exact' });

  if (operacion) query = query.eq('Operaciones_id', operacion);
  if (tipo) query = query.eq('Tipos_id', tipo);
  if (barrio) query = query.ilike('Barrios.name', `%${barrio}%`);

  if (dormitorios) query = query.gte('bedrooms', dormitorios);
  if (precioMin) query = query.gte('price', precioMin);
  if (precioMax) query = query.lte('price', precioMax);

  // Ordenamiento
  if (ordenActual === 'precioAsc') query = query.order('price', { ascending: true });
  else if (ordenActual === 'precioDesc') query = query.order('price', { ascending: false });
  else if (ordenActual === 'recientes') query = query.order('id', { ascending: false });
  else query = query.order('id', { ascending: false });

  query = query.range(inicioRango, finRango);

  const { data, count, error } = await query;

  console.log("DATA:", data);
console.log("ERROR:", error);

  if (error) {
    console.log("Error cargando resultados:", error);
    contenedor.innerHTML = "<p>Error cargando propiedades.</p>";
    return;
  }

  // Mostrar cards
  contenedor.innerHTML = "";

  mostrarResultados(data);
  renderizarPaginacion(count);
}


function optimizarImagen(url){ if(url.includes("res.cloudinary.com")){ return url.replace("/upload/", "/upload/w_800,q_70,f_jpg/") } return url }

function mostrarResultados(propiedades) {
  const contenedor = document.getElementById("contenedorResultados");

  if (propiedades.length === 0) {
    contenedor.innerHTML = `<p class="sin-resultados">No hay propiedades disponibles con esos filtros.</p>`;
    return;
  }

  propiedades.forEach(propiedad => {
    let imagenUrl = 'https://via.placeholder.com/300x200?text=Sin+Imagen';

if (propiedad.Imagenes && propiedad.Imagenes.length > 0) {
  
  const imagenPrincipal = propiedad.Imagenes.find(img => img.is_main);

  const urlOriginal = imagenPrincipal 
    ? imagenPrincipal.image_url 
    : propiedad.Imagenes[0].image_url;
  imagenUrl = optimizarImagen(urlOriginal);
}

    const nombreTipo = propiedad.Tipos ? propiedad.Tipos.name : 'N/A';
    const nombreOperacion = propiedad.Operaciones ? propiedad.Operaciones.name : 'N/A';
    const nombreBarrio = propiedad.Barrios ? propiedad.Barrios.name : 'N/A';

    const cantDormitorios = propiedad.bedrooms ? propiedad.bedrooms : '-';

    const card = `
        <div class="card-propiedad" onclick="verPropiedad(${propiedad.id})" style="cursor:pointer;">
            <img src="${imagenUrl}" alt="Imagen de propiedad">
            <div class="card-info">
                <h3 class="precio">
                ${propiedad.Moneda === 'USD' ? 'USD' : '$'} 
                ${propiedad.price ? propiedad.price.toLocaleString('es-AR') : 'Consultar'}
                </h3>
                <p class="detalles">${nombreTipo} • ${nombreOperacion} • ${cantDormitorios} Dorm.</p>
                <p class="ubicacion">${nombreBarrio}</p>
            </div>
        </div>
        `;

    contenedor.innerHTML += card;
  });
}

window.verPropiedad = function(id) {
    window.location.href = `propiedades.html?id=${id}`;
};

function renderizarPaginacion(totalItems) {
  const contenedor = document.getElementById("contenedorPaginacion");
  contenedor.innerHTML = "";

  const totalPaginas = Math.ceil(totalItems / cantidadPorPagina);

  if (totalPaginas <= 1) return;

  // Función auxiliar para crear botones o puntos suspensivos
  const crearElemento = (texto, paginaDestino, esActivo = false, esDeshabilitado = false, esPuntos = false) => {
    const elemento = document.createElement(esPuntos ? "span" : "button");
    elemento.innerHTML = texto;

    if (esPuntos) {
      elemento.className = "pagina-puntos";
      return elemento;
    }

    if (esActivo) {
      elemento.className = "pagina-activa";
    } else {
      elemento.className = "pagina-inactiva";
      if (!esDeshabilitado) {
        elemento.onclick = () => {
          paginaActual = paginaDestino;
          cargarResultados(false);
          // Opcional: Hace scroll suave hacia arriba al cambiar de página
          document.querySelector('.seccion-resultados').scrollIntoView({ behavior: 'smooth' });
        };
      } else {
        elemento.classList.add("pagina-deshabilitada");
      }
    }
    return elemento;
  };

  // 1. Botón Anterior
  contenedor.appendChild(crearElemento("&laquo;", paginaActual - 1, false, paginaActual === 1));

  // 2. Lógica para mostrar números y puntos suspensivos
  let paginasVisibles = [];
  
  if (totalPaginas <= 5) {
    // Si hay 5 o menos páginas, mostramos todas
    for (let i = 1; i <= totalPaginas; i++) paginasVisibles.push(i);
  } else {
    // Si hay muchas páginas, calculamos los recortes
    if (paginaActual <= 3) {
      paginasVisibles = [1, 2, 3, 4, "...", totalPaginas];
    } else if (paginaActual >= totalPaginas - 2) {
      paginasVisibles = [1, "...", totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
    } else {
      paginasVisibles = [1, "...", paginaActual - 1, paginaActual, paginaActual + 1, "...", totalPaginas];
    }
  }

  // 3. Renderizar los números y puntos
  paginasVisibles.forEach(p => {
    if (p === "...") {
      contenedor.appendChild(crearElemento("...", null, false, false, true));
    } else {
      contenedor.appendChild(crearElemento(p, p, p === paginaActual));
    }
  });

  // 4. Botón Siguiente
  contenedor.appendChild(crearElemento("&raquo;", paginaActual + 1, false, paginaActual === totalPaginas));
}

let indiceSeleccionado = -1;

async function buscarBarrios() {
  const texto = document.getElementById("filtroBarrio").value;
  const contenedor = document.getElementById("sugerenciasBarrios");

  if (texto.length < 1) {
    contenedor.innerHTML = "";
    cargarResultados(true);
    return;
  }

  const { data } = await supabaseClient
    .from('Barrios')
    .select('*')
    .ilike('name', `%${texto}%`);

  contenedor.innerHTML = "";
  data.forEach(barrio => {
    contenedor.innerHTML += `
        <div class="sugerencia" onclick="seleccionarBarrio('${barrio.name}')">
            ${barrio.name}
        </div>
        `;
  });
}

window.seleccionarBarrio = function (nombre) {
  document.getElementById("filtroBarrio").value = nombre;
  document.getElementById("sugerenciasBarrios").innerHTML = "";
  cargarResultados(true);
}

function manejarTeclas(e) {
  const items = document.querySelectorAll(".sugerencia");

  if (e.key === "Enter" && items.length === 0) {
    cargarResultados(true);
    return;
  }

  if (items.length === 0) return;

  if (e.key === "ArrowDown") {
    indiceSeleccionado++;
    if (indiceSeleccionado >= items.length) indiceSeleccionado = 0;
  }
  if (e.key === "ArrowUp") {
    indiceSeleccionado--;
    if (indiceSeleccionado < 0) indiceSeleccionado = items.length - 1;
  }
  if (e.key === "Enter") {
    if (indiceSeleccionado >= 0) {
      items[indiceSeleccionado].click();
    }
  }

  items.forEach(item => item.classList.remove("activo"));
  if (indiceSeleccionado >= 0) {
    items[indiceSeleccionado].classList.add("activo");
  }
}

document.addEventListener("click", function (event) {
  const input = document.getElementById("filtroBarrio");
  const contenedor = document.getElementById("sugerenciasBarrios");
  if (input && contenedor && !input.contains(event.target)) {
    contenedor.innerHTML = "";
  }
});

document.getElementById("filtroOperacion").addEventListener("change", () => cargarResultados(true));
document.getElementById("filtroTipo").addEventListener("change", () => cargarResultados(true));

const inputBarrio = document.getElementById("filtroBarrio");
inputBarrio.addEventListener("input", buscarBarrios);
inputBarrio.addEventListener("keydown", manejarTeclas);
document.getElementById("filtroDormitorios").addEventListener("change", () => cargarResultados(true));

// ── Filtro Precio Dropdown ──────────────────────────────────
const btnFiltroPrecio = document.getElementById("btnFiltroPrecio");
const precioDropdown  = document.getElementById("precioDropdown");
const sliderMin       = document.getElementById("sliderMin");
const sliderMax       = document.getElementById("sliderMax");
const inputMin        = document.getElementById("filtroPrecioMin");
const inputMax        = document.getElementById("filtroPrecioMax");
const rangeFill       = document.getElementById("precioRangeFill");
const labelPrecio     = document.getElementById("labelPrecio");

const PRECIO_MAX_DEFAULT = 25000000;

function actualizarFill() {
  const min = parseInt(sliderMin.value);
  const max = parseInt(sliderMax.value);
  const total = PRECIO_MAX_DEFAULT; // Tu PRECIO_MAX_DEFAULT
  
  const leftPct = (min / total) * 100;
  const widthPct = ((max - min) / total) * 100;
  
  rangeFill.style.left = leftPct + "%";
  rangeFill.style.width = widthPct + "%";
}

function formatearPrecio(v) {
  if (v >= 25000000) return "$" + (v / 25000000).toFixed(v % 25000000 === 0 ? 0 : 1) + "M";
  if (v >= 1000)    return "$" + (v / 1000).toFixed(0) + "k";
  return "$" + v;
}

function actualizarLabel() {
  const min = parseInt(sliderMin.value);
  const max = parseInt(sliderMax.value);
  const sinMin = min === 0;
  const sinMax = max === PRECIO_MAX_DEFAULT;
  if (sinMin && sinMax) {
    labelPrecio.textContent = "Precio";
    btnFiltroPrecio.classList.remove("activo");
  } else if (sinMin) {
    labelPrecio.textContent = "Hasta " + formatearPrecio(max);
    btnFiltroPrecio.classList.add("activo");
  } else if (sinMax) {
    labelPrecio.textContent = "Desde " + formatearPrecio(min);
    btnFiltroPrecio.classList.add("activo");
  } else {
    labelPrecio.textContent = formatearPrecio(min) + " – " + formatearPrecio(max);
    btnFiltroPrecio.classList.add("activo");
  }
}

sliderMin.addEventListener("input", () => {
  if (parseInt(sliderMin.value) > parseInt(sliderMax.value) - 10000)
    sliderMin.value = parseInt(sliderMax.value) - 10000;
  inputMin.value = sliderMin.value === "0" ? "" : sliderMin.value;
  actualizarFill();
});

sliderMax.addEventListener("input", () => {
  if (parseInt(sliderMax.value) < parseInt(sliderMin.value) + 10000)
    sliderMax.value = parseInt(sliderMin.value) + 10000;
  inputMax.value = sliderMax.value === String(PRECIO_MAX_DEFAULT) ? "" : sliderMax.value;
  actualizarFill();
});

inputMin.addEventListener("input", () => {
  const v = parseInt(inputMin.value) || 0;
  sliderMin.value = Math.min(v, parseInt(sliderMax.value) - 10000);
  actualizarFill();
});

inputMax.addEventListener("input", () => {
  const v = parseInt(inputMax.value) || PRECIO_MAX_DEFAULT;
  sliderMax.value = Math.max(v, parseInt(sliderMin.value) + 10000);
  actualizarFill();
});

btnFiltroPrecio.addEventListener("click", (e) => {
  e.stopPropagation();
  precioDropdown.classList.toggle("abierto");
  btnFiltroPrecio.classList.toggle("dropdown-abierto");
});

document.addEventListener("click", (e) => {
  if (!precioDropdown.contains(e.target) && e.target !== btnFiltroPrecio) {
    precioDropdown.classList.remove("abierto");
    btnFiltroPrecio.classList.remove("dropdown-abierto");
  }
});

document.getElementById("btnAplicarPrecio").addEventListener("click", () => {
  actualizarLabel();
  precioDropdown.classList.remove("abierto");
  btnFiltroPrecio.classList.remove("dropdown-abierto");
  cargarResultados(true);
});

document.getElementById("btnLimpiarPrecio").addEventListener("click", () => {
  sliderMin.value = 0;
  sliderMax.value = PRECIO_MAX_DEFAULT;
  inputMin.value  = "";
  inputMax.value  = "";
  actualizarFill();
  actualizarLabel();
  cargarResultados(true);
});

// ── Filtros Móvil Modal ─────────────────────────────────────
const btnFiltrosMovil  = document.getElementById("btnFiltrosMovil");
const filtrosModal     = document.getElementById("filtrosModal");
const filtrosOverlay   = document.getElementById("filtrosModalOverlay");
const btnCerrarFiltros = document.getElementById("btnCerrarFiltros");
const btnAplicarMovil  = document.getElementById("btnAplicarFiltrosMovil");
const btnLimpiarMovil  = document.getElementById("btnLimpiarFiltrosMovil");
const filtrosBadge     = document.getElementById("filtrosBadge");

// Slider móvil
const sliderMinM = document.getElementById("sliderMinMovil");
const sliderMaxM = document.getElementById("sliderMaxMovil");
const inputMinM  = document.getElementById("filtroPrecioMinMovil");
const inputMaxM  = document.getElementById("filtroPrecioMaxMovil");
const rangeFillM = document.getElementById("precioRangeFillMovil");

function actualizarFillMovil() {
  const min = parseInt(sliderMinM.value);
  const max = parseInt(sliderMaxM.value);
  rangeFillM.style.left  = (min / PRECIO_MAX_DEFAULT * 100) + "%";
  rangeFillM.style.width = ((max - min) / PRECIO_MAX_DEFAULT * 100) + "%";
}

sliderMinM.addEventListener("input", () => {
  if (parseInt(sliderMinM.value) > parseInt(sliderMaxM.value) - 10000)
    sliderMinM.value = parseInt(sliderMaxM.value) - 10000;
  inputMinM.value = sliderMinM.value === "0" ? "" : sliderMinM.value;
  actualizarFillMovil();
});

sliderMaxM.addEventListener("input", () => {
  if (parseInt(sliderMaxM.value) < parseInt(sliderMinM.value) + 10000)
    sliderMaxM.value = parseInt(sliderMinM.value) + 10000;
  inputMaxM.value = sliderMaxM.value === String(PRECIO_MAX_DEFAULT) ? "" : sliderMaxM.value;
  actualizarFillMovil();
});

inputMinM.addEventListener("input", () => {
  const v = parseInt(inputMinM.value) || 0;
  sliderMinM.value = Math.min(v, parseInt(sliderMaxM.value) - 10000);
  actualizarFillMovil();
});

inputMaxM.addEventListener("input", () => {
  const v = parseInt(inputMaxM.value) || PRECIO_MAX_DEFAULT;
  sliderMaxM.value = Math.max(v, parseInt(sliderMinM.value) + 10000);
  actualizarFillMovil();
});

actualizarFillMovil();

// Abrir modal — sincroniza los valores actuales del desktop
function abrirModal() {
  whatsapp.classList.add("oculto");
  document.getElementById("filtroOperacionMovil").value   = document.getElementById("filtroOperacion").value;
  document.getElementById("filtroTipoMovil").value        = document.getElementById("filtroTipo").value;
  document.getElementById("filtroDormitoriosMovil").value = document.getElementById("filtroDormitorios").value;
  document.getElementById("filtroBarrioMovil").value      = document.getElementById("filtroBarrio").value;
  sliderMinM.value = sliderMin.value;
  sliderMaxM.value = sliderMax.value;
  inputMinM.value  = inputMin.value;
  inputMaxM.value  = inputMax.value;
  actualizarFillMovil();
  filtrosModal.classList.add("abierto");
  filtrosOverlay.classList.add("abierto");
  document.body.style.overflow = "hidden";
}

function cerrarModal() {
  whatsapp.classList.remove("oculto");
  filtrosModal.classList.remove("abierto");
  filtrosOverlay.classList.remove("abierto");
  document.body.style.overflow = "";
}

btnFiltrosMovil.addEventListener("click", abrirModal);
btnCerrarFiltros.addEventListener("click", cerrarModal);
filtrosOverlay.addEventListener("click", cerrarModal);

// Autocompletado de barrios dentro del modal
async function buscarBarriosMovil() {
  const texto = document.getElementById("filtroBarrioMovil").value;
  const cont  = document.getElementById("sugerenciasBarriosMovil");
  if (texto.length < 1) { cont.innerHTML = ""; return; }
  const { data } = await supabaseClient.from('Barrios').select('*').ilike('name', `%${texto}%`);
  cont.innerHTML = "";
  data.forEach(b => {
    const d = document.createElement("div");
    d.className = "sugerencia";
    d.textContent = b.name;
    d.onclick = () => {
      document.getElementById("filtroBarrioMovil").value = b.name;
      cont.innerHTML = "";
    };
    cont.appendChild(d);
  });
}
document.getElementById("filtroBarrioMovil").addEventListener("input", buscarBarriosMovil);

// Badge: cuenta filtros activos
function actualizarBadge() {
  const vals = [
    document.getElementById("filtroOperacion").value,
    document.getElementById("filtroTipo").value,
    document.getElementById("filtroDormitorios").value,
    document.getElementById("filtroBarrio").value,
    document.getElementById("filtroPrecioMin").value,
    document.getElementById("filtroPrecioMax").value,
  ];
  const count = vals.filter(Boolean).length;
  if (count > 0) {
    filtrosBadge.textContent = count;
    filtrosBadge.style.display = "inline-flex";
    btnFiltrosMovil.classList.add("activo");
  } else {
    filtrosBadge.style.display = "none";
    btnFiltrosMovil.classList.remove("activo");
  }
}

// Aplicar: móvil → desktop → buscar
btnAplicarMovil.addEventListener("click", () => {
  document.getElementById("filtroOperacion").value   = document.getElementById("filtroOperacionMovil").value;
  document.getElementById("filtroTipo").value        = document.getElementById("filtroTipoMovil").value;
  document.getElementById("filtroDormitorios").value = document.getElementById("filtroDormitoriosMovil").value;
  document.getElementById("filtroBarrio").value      = document.getElementById("filtroBarrioMovil").value;
  sliderMin.value = sliderMinM.value;
  sliderMax.value = sliderMaxM.value;
  inputMin.value  = inputMinM.value;
  inputMax.value  = inputMaxM.value;
  actualizarFill();
  actualizarLabel();
  cerrarModal();
  actualizarBadge();
  cargarResultados(true);
});

// Limpiar: solo resetea dentro del modal (sin cerrar)
btnLimpiarMovil.addEventListener("click", () => {
  document.getElementById("filtroOperacionMovil").value   = "";
  document.getElementById("filtroTipoMovil").value        = "";
  document.getElementById("filtroDormitoriosMovil").value = "";
  document.getElementById("filtroBarrioMovil").value      = "";
  sliderMinM.value = 0;
  sliderMaxM.value = PRECIO_MAX_DEFAULT;
  inputMinM.value  = "";
  inputMaxM.value  = "";
  actualizarFillMovil();
});

// Poblar selects del modal con las opciones cargadas del desktop
// Se llama después de que inicializarFiltros() terminó
function poblarSelectsMovil() {
  ["filtroOperacion", "filtroTipo"].forEach(id => {
    const src  = document.getElementById(id);
    const dest = document.getElementById(id + "Movil");
    Array.from(src.options).forEach(opt => {
      if (opt.value !== "") dest.appendChild(opt.cloneNode(true));
    });
  });
}

// Reemplazamos el llamado final para que cargue también los selects del modal
const _inicializarOriginal = inicializarFiltros;
inicializarFiltros = async function() {
  await _inicializarOriginal();
  poblarSelectsMovil();
};

// ── Ordenar ──────────────────────────────────────────
function setupOrdenar(btnId, dropdownId, opcionClass) {
    const btn = document.getElementById(btnId);
    const dropdown = document.getElementById(dropdownId);
    if (!btn || !dropdown) return;

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
    });

    document.addEventListener('click', function() {
        dropdown.classList.remove('active');
    });

    dropdown.querySelectorAll('.' + opcionClass).forEach(function(opcion) {
        opcion.addEventListener('click', function() {
            ordenActual = this.dataset.orden;
            // Actualizar activa en AMBOS dropdowns
            document.querySelectorAll('.ordenar-opcion, .ordenar-opcion-movil')
                .forEach(b => b.classList.remove('activa'));
            // Marcar la opcion equivalente en ambos
            document.querySelectorAll('[data-orden="' + ordenActual + '"]')
                .forEach(b => b.classList.add('activa'));
            // Actualizar texto de ambos botones
            const texto = this.textContent.trim();
            ['btnOrdenar', 'btnOrdenarMovil'].forEach(id => {
                const b = document.getElementById(id);
                if (b) b.childNodes[0].textContent = texto + ' ';
            });
            dropdown.classList.remove('active');
            cargarResultados(true);
        });
    });
}

setupOrdenar('btnOrdenar', 'ordenarDropdown', 'ordenar-opcion');
setupOrdenar('btnOrdenarMovil', 'ordenarDropdownMovil', 'ordenar-opcion-movil');

actualizarFill();
inicializarFiltros();

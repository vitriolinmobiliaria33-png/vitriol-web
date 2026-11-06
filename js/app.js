const supabaseClient = window.supabase.createClient(
  'https://lirhxxvemagoyvlijfrj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcmh4eHZlbWFnb3l2bGlqZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTUzMjYsImV4cCI6MjA4ODE3MTMyNn0.s-E_H_9awM0zZ_r14SH6NmEJ3Y4KeUo_R3CxQKQ7sDw'
)

let indiceSeleccionado = -1

async function cargarPropiedades() {

  const { data, error } = await supabaseClient
  .from('Propiedades')
  .select(`
    *,
    Barrios (name),
    Tipos (name),
    Operaciones (name),
    Imagenes!inner (image_url, is_main)
  `)
  .eq('destacada', true)
  .limit(12)
  
    
  console.log(data)

  if(error){
    console.log(error)
    return
  }

  mostrarPropiedades(data)

}

function optimizarCloudinary(url){
  if(!url.includes('res.cloudinary.com')) return url

  return url.replace('/upload/', '/upload/w_400,q_auto,f_jpg/')
}


function optimizarImagen(url){

  if(url.includes("?")){
    return url + "&w=800&q=70&auto=format"
  }

  return url + "?w=800&q=70&auto=format"
}

let propiedadesGlobal = []
let mostrandoTodas = false



function mostrarPropiedades(propiedades){

  propiedadesGlobal = propiedades

  renderPropiedades()

}

function renderPropiedades(){

  const contenedor = document.getElementById("Propiedades")

  contenedor.innerHTML = ""

  propiedadesGlobal.forEach(propiedad => {

    const imagenPrincipal = propiedad.Imagenes.find(img => img.is_main)

    const card = `
<div class="card" onclick="verPropiedad(${propiedad.id})">

<img src="${optimizarCloudinary(imagenPrincipal.image_url)}">

<div class="card-info">

<h3>
  ${propiedad.Moneda?.trim().toUpperCase() === 'USD' ? 'USD' : propiedad.Moneda?.trim().toUpperCase() === 'EUR' ? '€' : '$'}
  ${propiedad.price.toLocaleString('es-AR')}
</h3>


<p>${[propiedad.Tipos?.name?.trim(), propiedad.Operaciones?.name?.trim()].filter(Boolean).join(' • ')}</p>

${propiedad.Barrios?.name?.trim() ? `<p>${propiedad.Barrios.name.trim()}</p>` : ''}

<button>Ver propiedad</button>

</div>

</div>
`

    contenedor.innerHTML += card

  })

  setTimeout(ajustarAlturaInicial, 50)

  const btnContainer = document.querySelector(".ver-mas-container")

if(propiedadesGlobal.length <= 4){
  btnContainer.style.display = "none"
}else{
  btnContainer.style.display = "block"
}

}

const btnVerMas = document.getElementById("btnVerMas")

btnVerMas.addEventListener("click", () => {

  const contenedor = document.getElementById("Propiedades")

  if(contenedor.classList.contains("expandido")){

    contenedor.classList.remove("expandido")
    ajustarAlturaInicial()
    btnVerMas.textContent = "Ver más propiedades"

  }else{

    contenedor.classList.add("expandido")
    contenedor.style.maxHeight = contenedor.scrollHeight + "px"
    btnVerMas.textContent = "Ver menos propiedades"

  }

})


function ajustarAlturaInicial(){

  const contenedor = document.getElementById("Propiedades")
  const cards = contenedor.querySelectorAll(".card")

  if(cards.length === 0) return

  const altura = cards[0].offsetHeight

  contenedor.style.maxHeight = altura + "px"

}




async function cargarFiltros() {

  const { data: operaciones } = await supabaseClient
    .from('Operaciones')
    .select('*')

  const { data: tipos } = await supabaseClient
    .from('Tipos')
    .select('*')

  const filtroOperacion = document.getElementById("filtroOperacion")
  const filtroTipo = document.getElementById("filtroTipo")

  operaciones.forEach(op => {
    filtroOperacion.innerHTML += `<option value="${op.id}">${op.name}</option>`
  })

  tipos.forEach(tipo => {
    filtroTipo.innerHTML += `<option value="${tipo.id}">${tipo.name}</option>`
  })

}





async function filtrar(){

  const operacion = filtroOperacion.value
  const tipo = filtroTipo.value
  const barrio = filtroBarrio.value

  let query = supabaseClient
    .from('Propiedades')
    .select(`
  *,
  Barrios!inner (name),
  Tipos (name),
  Operaciones (name),
  Imagenes!inner (image_url, is_main)
`)

  if(operacion){
    query = query.eq('Operaciones_id', operacion)
  }

  if(tipo){
    query = query.eq('Tipos_id', tipo)
  }

  if(barrio){
  query = query.ilike('Barrios.name', `%${barrio}%`)
}

  const { data, error } = await query

  console.log(data)
  mostrarPropiedades(data)
}


// ── Barrios: se cargan una sola vez y se buscan sin importar acentos ni mayúsculas ──
let barriosPromesa = null
let pedidoSugerencias = 0

function normalizarTexto(texto){
  return (texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

async function cargarListaBarrios(){
  const [resBarrios, resProps] = await Promise.all([
    supabaseClient.from('Barrios').select('id, name'),
    supabaseClient.from('Propiedades').select('Barrios_id')
  ])
  if(resBarrios.error) throw resBarrios.error
  const hayConteo = !resProps.error && Array.isArray(resProps.data)
  const conPropiedades = new Set((resProps.data || []).map(p => p.Barrios_id))
  return (resBarrios.data || []).map(b => ({
    id: b.id,
    name: (b.name || '').trim(),
    clave: normalizarTexto(b.name),
    conPropiedades: !hayConteo || conPropiedades.has(b.id)
  }))
}

function obtenerBarrios(){
  if(!barriosPromesa){
    barriosPromesa = cargarListaBarrios().catch(e => {
      barriosPromesa = null
      throw e
    })
  }
  return barriosPromesa
}

// Sugerencias: solo barrios con propiedades, sin repetidos, primero los que empiezan igual
async function sugerenciasDeBarrio(texto){
  const clave = normalizarTexto(texto)
  if(!clave) return []
  const barrios = await obtenerBarrios()
  const vistos = new Set()
  return barrios
    .filter(b => b.conPropiedades && b.clave.includes(clave))
    .sort((a, b) => (b.clave.startsWith(clave) - a.clave.startsWith(clave)) || a.name.localeCompare(b.name, 'es'))
    .filter(b => !vistos.has(b.clave) && vistos.add(b.clave))
}

async function buscarBarrios(){

  const input = document.getElementById("filtroBarrio")
  const texto = input.value
  const contenedor = document.getElementById("sugerenciasBarrios")
  const miPedido = ++pedidoSugerencias
  indiceSeleccionado = -1

  if(!texto.trim()){
    contenedor.innerHTML = ""
    return
  }

  let lista = []
  try{
    lista = await sugerenciasDeBarrio(texto)
  }catch(e){
    console.log("Error cargando barrios:", e)
  }
  if(miPedido !== pedidoSugerencias || input.value !== texto) return

  contenedor.innerHTML = ""

  lista.forEach(barrio => {
    const d = document.createElement("div")
    d.className = "sugerencia"
    d.textContent = barrio.name
    d.addEventListener("click", () => seleccionarBarrio(barrio.name))
    contenedor.appendChild(d)
  })

}


function seleccionarBarrio(nombre){

  pedidoSugerencias++
  indiceSeleccionado = -1

  const input = document.getElementById("filtroBarrio")

  input.value = nombre

  document.getElementById("sugerenciasBarrios").innerHTML = ""

}
window.seleccionarBarrio = seleccionarBarrio



window.verPropiedad = function(id){
  window.location.href = `propiedades.html?id=${id}`
}

document.addEventListener("click", function(event){

  const input = document.getElementById("filtroBarrio")
  const contenedor = document.getElementById("sugerenciasBarrios")

  if(!input.contains(event.target)){
    contenedor.innerHTML = ""
  }

})

function manejarTeclas(e){

  const contenedor = document.getElementById("sugerenciasBarrios")
  const items = contenedor.querySelectorAll(".sugerencia")

  // Enter: si hay un barrio marcado con las flechas, se elige ese; después se busca
  if(e.key === "Enter"){
    e.preventDefault()
    if(indiceSeleccionado >= 0 && items[indiceSeleccionado]){
      items[indiceSeleccionado].click()
    }
    pedidoSugerencias++
    indiceSeleccionado = -1
    contenedor.innerHTML = ""
    document.getElementById("btnBuscar").click()
    return
  }

  if(e.key === "Escape"){
    pedidoSugerencias++
    indiceSeleccionado = -1
    contenedor.innerHTML = ""
    return
  }

  if(items.length === 0) return

  if(e.key === "ArrowDown"){
    e.preventDefault()
    indiceSeleccionado++
    if(indiceSeleccionado >= items.length) indiceSeleccionado = 0
  }

  if(e.key === "ArrowUp"){
    e.preventDefault()
    indiceSeleccionado--
    if(indiceSeleccionado < 0) indiceSeleccionado = items.length - 1
  }

  items.forEach(item => item.classList.remove("activo"))

  if(indiceSeleccionado >= 0 && items[indiceSeleccionado]){
    items[indiceSeleccionado].classList.add("activo")
  }

}

const btnBuscar = document.getElementById("btnBuscar")

btnBuscar.addEventListener("click", function(){

  const operacion = document.getElementById("filtroOperacion").value
  const tipo = document.getElementById("filtroTipo").value
  const barrio = document.getElementById("filtroBarrio").value

  const url = `resultados.html?operacion=${operacion}&tipo=${tipo}&barrio=${encodeURIComponent(barrio)}`

  window.location.href = url

})



document.getElementById("filtroBarrio").addEventListener("keydown", manejarTeclas)
document.getElementById("filtroBarrio").addEventListener("input", buscarBarrios)



cargarPropiedades()
cargarFiltros()
obtenerBarrios().catch(e => console.log("Error cargando barrios:", e))

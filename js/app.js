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
  ${propiedad.Moneda?.trim().toUpperCase() === 'USD' ? 'USD' : '$'} 
  ${propiedad.price.toLocaleString('es-AR')}
</h3>


<p>${propiedad.Tipos.name} • ${propiedad.Operaciones.name}</p>

<p>${propiedad.Barrios.name}</p>

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

  const { data: barrios } = await supabaseClient
    .from('Barrios')
    .select('*')

  const filtroOperacion = document.getElementById("filtroOperacion")
  const filtroTipo = document.getElementById("filtroTipo")
  const filtroBarrio = document.getElementById("filtroBarrio")

  operaciones.forEach(op => {
    filtroOperacion.innerHTML += `<option value="${op.id}">${op.name}</option>`
  })

  tipos.forEach(tipo => {
    filtroTipo.innerHTML += `<option value="${tipo.id}">${tipo.name}</option>`
  })

  barrios.forEach(barrio => {
    filtroBarrio.innerHTML += `<option value="${barrio.id}">${barrio.name}</option>`
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


async function buscarBarrios(){

  const texto = filtroBarrio.value
  const contenedor = document.getElementById("sugerenciasBarrios")

  if(texto.length < 1){
    contenedor.innerHTML = ""
    return
  }

  const { data } = await supabaseClient
    .from('Barrios')
    .select('*')
    .ilike('name', `%${texto}%`)

  contenedor.innerHTML = ""

  data.forEach(barrio => {
    contenedor.innerHTML += `
    <div class="sugerencia" onclick="seleccionarBarrio('${barrio.name}')">
      ${barrio.name}
    </div>
  `
  })

}


window.seleccionarBarrio = function(nombre){

  const input = document.getElementById("filtroBarrio")

  input.value = nombre

  document.getElementById("sugerenciasBarrios").innerHTML = ""

}



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

document.getElementById("filtroBarrio").addEventListener("keydown", function(e){

  if(e.key === "Enter"){

    const dropdown = document.getElementById("sugerenciasBarrios")

    if(dropdown.innerHTML.trim() !== ""){
      return
    }

    document.getElementById("btnBuscar").click()

  }

})

function manejarTeclas(e){

  const items = document.querySelectorAll(".sugerencia")

  if(items.length === 0) return

  if(e.key === "ArrowDown"){
    indiceSeleccionado++
    if(indiceSeleccionado >= items.length) indiceSeleccionado = 0
  }

  if(e.key === "ArrowUp"){
    indiceSeleccionado--
    if(indiceSeleccionado < 0) indiceSeleccionado = items.length - 1
  }

  if(e.key === "Enter"){
    if(indiceSeleccionado >= 0){
      items[indiceSeleccionado].click()
    }
  }

  items.forEach(item => item.classList.remove("activo"))

  if(indiceSeleccionado >= 0){
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



filtroBarrio.addEventListener("keydown", manejarTeclas)



cargarPropiedades()
cargarFiltros()

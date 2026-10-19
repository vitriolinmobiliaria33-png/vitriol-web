const menuBtn = document.getElementById('id_menuBtn')
const menuNav = document.getElementById('id_menuNav')
const menuOverlay = document.getElementById('id_menuOverlay')
const whatsapp = document.querySelector('.whatsapp-float')

menuBtn.addEventListener('click', function () {


    const abierto = menuNav.classList.toggle('active')

    menuBtn.classList.toggle('active')
    menuOverlay.classList.toggle('active')

    if(abierto){
        whatsapp.classList.add('oculto')
    }else{
        whatsapp.classList.remove('oculto')
    }
    
});

menuOverlay.addEventListener('click', function () {
    menuBtn.classList.remove('active')
    menuNav.classList.remove('active')
    menuOverlay.classList.remove('active')
    whatsapp.classList.remove('oculto')
});

const menuLinks = document.querySelectorAll('#id_menuNav a')
menuLinks.forEach(function (link) {
    link.addEventListener('click', function () {
        menuBtn.classList.remove('active')
        menuNav.classList.remove('active')
        menuOverlay.classList.remove('active')
        whatsapp.classList.remove('oculto')
    })
})
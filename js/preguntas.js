// ============================================================
//  VITRIOL INMOBILIARIA — FAQ accordion
// ============================================================

document.querySelectorAll('.faq-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const item    = trigger.closest('.faq-item');
    const body    = item.querySelector('.faq-body');
    const abierto = item.classList.contains('abierto');

    // Cerrar todos los hermanos del mismo grupo
    item.closest('.faq-list').querySelectorAll('.faq-item').forEach(sib => {
      if (sib !== item) {
        sib.classList.remove('abierto');
        sib.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
        sib.querySelector('.faq-body').style.maxHeight = '0';
      }
    });

    // Alternar el item actual
    if (abierto) {
      item.classList.remove('abierto');
      trigger.setAttribute('aria-expanded', 'false');
      body.style.maxHeight = '0';
    } else {
      item.classList.add('abierto');
      trigger.setAttribute('aria-expanded', 'true');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  });
});
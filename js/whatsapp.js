/* ============================================================
   VITRIOL INMOBILIARIA — Botones de WhatsApp (21/11/2026)
   Abre WhatsApp directo, sin la página intermedia de WhatsApp
   ("Abrir WhatsApp / usar WhatsApp Web"):
   - En el celular abre la app de WhatsApp en el momento.
     Si no tiene la app, a los 1,6 s sigue por wa.me.
   - En la PC abre WhatsApp Web directo en el chat, en otra pestaña.
   Vale para todos los links a wa.me o api.whatsapp.com de la página,
   también los que se arman después con JavaScript.
============================================================ */
(function () {
  var NUMERO = '5493512761400';

  function esCelular() {
    var uad = navigator.userAgentData;
    if (uad && uad.mobile) return true;
    var ua = navigator.userAgent || '';
    if (/Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile|BlackBerry/i.test(ua)) return true;
    // iPad con iPadOS se presenta como Mac: se reconoce por la pantalla táctil.
    return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  }

  function datos(href) {
    try {
      var u = new URL(href, location.href);
      var host = u.hostname.replace(/^www\./, '');
      var tel = '';
      if (host === 'wa.me') {
        tel = u.pathname.replace(/\D/g, '');
      } else if (/(^|\.)whatsapp\.com$/.test(host) && /\/send/.test(u.pathname)) {
        tel = (u.searchParams.get('phone') || '').replace(/\D/g, '');
      } else {
        return null;
      }
      return { tel: tel || NUMERO, texto: u.searchParams.get('text') || '' };
    } catch (e) {
      return null;
    }
  }

  function abrir(d) {
    var q = 'phone=' + d.tel + (d.texto ? '&text=' + encodeURIComponent(d.texto) : '');
    if (esCelular()) {
      var salio = false;
      var marcar = function () { salio = true; };
      document.addEventListener('visibilitychange', marcar, { once: true });
      window.addEventListener('pagehide', marcar, { once: true });
      window.addEventListener('blur', marcar, { once: true });
      location.href = 'whatsapp://send?' + q;
      setTimeout(function () {
        if (!salio && document.visibilityState === 'visible') {
          location.href = 'https://wa.me/' + d.tel + (d.texto ? '?text=' + encodeURIComponent(d.texto) : '');
        }
      }, 1600);
    } else {
      var url = 'https://web.whatsapp.com/send?' + q;
      var w = window.open(url, '_blank');
      if (w) {
        try { w.opener = null; } catch (e) { /* nada */ }
      } else {
        location.href = url;
      }
    }
  }

  document.addEventListener('click', function (ev) {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!a) return;
    var d = datos(a.getAttribute('href'));
    if (!d) return;
    ev.preventDefault();
    abrir(d);
  }, true);
})();

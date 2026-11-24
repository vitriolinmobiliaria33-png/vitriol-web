/* ============================================================
   VITRIOL INMOBILIARIA — Buscador, listado y ficha en inglés (/en/), alemán (/de/),
   italiano (/it/) y francés (/fr/)  (21/11/2026; italiano y francés desde el 24/11/2026)
   - Lee Supabase en vivo, solo lectura: qué propiedades están publicadas, precio, fotos y datos.
     Así una baja o un cambio de precio en la web se ven enseguida también en inglés y en alemán.
   - Los títulos y las descripciones traducidos salen de /<idioma>/textos.json
     (los arma 156 - .../programas/armar_textos.py). Si una propiedad es nueva o cambió su texto
     en castellano y todavía no se tradujo, se muestra un texto armado con sus datos, en el idioma
     de la página: nunca en castellano.
   - El cálculo de limpiar() y fnv() es el mismo que el de armar_textos.py: si se cambia uno, cambiar el otro.
============================================================ */
(function () {
  'use strict';

  var IDIOMAS = ['en', 'de', 'it', 'fr'];
  var L = String(document.documentElement.lang || '').slice(0, 2).toLowerCase();
  if (IDIOMAS.indexOf(L) === -1) L = 'en';
  var LOCALE = { en: 'en-GB', de: 'de-DE', it: 'it-IT', fr: 'fr-FR' }[L];
  var SB = 'https://lirhxxvemagoyvlijfrj.supabase.co/rest/v1/';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpcmh4eHZlbWFnb3l2bGlqZnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1OTUzMjYsImV4cCI6MjA4ODE3MTMyNn0.s-E_H_9awM0zZ_r14SH6NmEJ3Y4KeUo_R3CxQKQ7sDw';
  var WA = '5493512761400';
  var DOM = 'https://vitriolinmobiliaria.com';
  var POR_PAGINA = 12;
  var URLS = {
    es: { lista: '/resultados.html', ficha: '/propiedades.html' },
    en: { inicio: '/en/', lista: '/en/properties.html', ficha: '/en/property.html' },
    de: { inicio: '/de/', lista: '/de/immobilien.html', ficha: '/de/immobilie.html' },
    it: { inicio: '/it/', lista: '/it/immobili.html', ficha: '/it/immobile.html' },
    fr: { inicio: '/fr/', lista: '/fr/biens.html', ficha: '/fr/bien.html' }
  };
  var U = URLS[L];
  // Links "ver esta propiedad en…" de la ficha: cada uno en su idioma.
  var VER_EN = {
    es: 'Ver esta propiedad en español', en: 'View this property in English', de: 'Diese Immobilie auf Deutsch ansehen',
    it: 'Vedi questo immobile in italiano', fr: 'Voir ce bien en français'
  };

  var TX = ({
    en: {
      todas_op: 'Buy or rent', comprar: 'Buy', alquilar: 'Rent',
      todos_tipos: 'All property types', tipo: 'Property type', otro: 'Property',
      lugar: 'Search location', buscar: 'Search properties',
      dorm: 'Bedrooms', dorm_n: '{n}+ bedrooms', cualquiera: 'Any',
      precio: 'Price', moneda: 'Currency', min: 'Min', max: 'Max', aplicar: 'Apply', limpiar: 'Clear',
      precio_desde: 'From {a}', precio_hasta: 'Up to {b}',
      precio_nota: 'Prices in other currencies are converted approximately.',
      orden: ['Newest first', 'Lowest price', 'Highest price'], ordenar: 'Sort by',
      filtros: 'Filters', limpiar_todo: 'Clear all filters',
      cuenta1: '1 property', cuenta: '{n} properties',
      ninguna: 'No properties match these filters.',
      cargando: 'Loading properties…', cargando_ficha: 'Loading…',
      error: 'We could not load the properties. Please try again in a moment.',
      ver: 'View property', venta: 'For sale', alquiler: 'For rent', por_mes: '/ month',
      consultar: 'Price on request',
      dorm1: 'bedroom', dormN: 'bedrooms', bano1: 'bathroom', banoN: 'bathrooms',
      m2_cub: 'm² covered', m2_tot: 'm² total', m2_lote: 'm² plot', cochera: 'Garage', si: 'Yes',
      credito: 'Mortgage', credito_si: 'eligible',
      titulo_auto: { venta: '{tipo} for sale in {lugar}', alquiler: '{tipo} for rent in {lugar}' },
      desc_auto: 'The full English description of this property is on its way. Write to us on WhatsApp and we will send you all the details, photos and videos.',
      descripcion: 'Description', fotos: 'Photos', video: 'Video',
      interesado: 'Interested in this property?', btn_wa: 'WhatsApp us', btn_mail: 'Email us',
      nota_contacto: 'We reply in English. Mon–Fri 9:00–18:00 and Sat 9:00–13:00, Argentina time (GMT−3).',
      mapa_exacta: 'View the location on Google Maps', mapa_zona: 'View the area on Google Maps',
      inicio: 'Home', propiedades: 'Properties', volver: 'Back to all properties',
      no_esta: 'This property is no longer available.', ver_todas: 'See all properties',
      wa_prop: "Hello! I'm interested in this property: {t} ({u})", asunto: 'Enquiry: {t}',
      nota_cambio: 'Approximate conversions: €1 = USD {eur} (European Central Bank, {f1}) and USD 1 = ARS {ars} (official rate in Argentina, {f2}). The price in the original currency is the one that applies.',
      foto: 'photo', anterior: 'Previous page', siguiente: 'Next page'
    },
    de: {
      todas_op: 'Kaufen oder mieten', comprar: 'Kaufen', alquilar: 'Mieten',
      todos_tipos: 'Alle Immobilienarten', tipo: 'Immobilienart', otro: 'Immobilie',
      lugar: 'Ort suchen', buscar: 'Immobilien suchen',
      dorm: 'Schlafzimmer', dorm_n: 'ab {n} Schlafzimmer', cualquiera: 'Beliebig',
      precio: 'Preis', moneda: 'Währung', min: 'Min.', max: 'Max.', aplicar: 'Anwenden', limpiar: 'Zurücksetzen',
      precio_desde: 'ab {a}', precio_hasta: 'bis {b}',
      precio_nota: 'Preise in anderen Währungen werden ungefähr umgerechnet.',
      orden: ['Neueste zuerst', 'Preis aufsteigend', 'Preis absteigend'], ordenar: 'Sortieren',
      filtros: 'Filter', limpiar_todo: 'Alle Filter zurücksetzen',
      cuenta1: '1 Immobilie', cuenta: '{n} Immobilien',
      ninguna: 'Keine Immobilien entsprechen diesen Filtern.',
      cargando: 'Immobilien werden geladen …', cargando_ficha: 'Wird geladen …',
      error: 'Die Immobilien konnten nicht geladen werden. Bitte versuchen Sie es gleich noch einmal.',
      ver: 'Zur Immobilie', venta: 'Zu verkaufen', alquiler: 'Zu vermieten', por_mes: '/ Monat',
      consultar: 'Preis auf Anfrage',
      dorm1: 'Schlafzimmer', dormN: 'Schlafzimmer', bano1: 'Badezimmer', banoN: 'Badezimmer',
      m2_cub: 'm² überdacht', m2_tot: 'm² gesamt', m2_lote: 'm² Grundstück', cochera: 'Garage', si: 'Ja',
      credito: 'Hypothekenfinanzierung', credito_si: 'möglich',
      titulo_auto: { venta: '{tipo} zu verkaufen in {lugar}', alquiler: '{tipo} zu vermieten in {lugar}' },
      desc_auto: 'Die ausführliche deutsche Beschreibung dieser Immobilie folgt in Kürze. Schreiben Sie uns per WhatsApp, und wir senden Ihnen alle Details, Fotos und Videos.',
      descripcion: 'Beschreibung', fotos: 'Fotos', video: 'Video',
      interesado: 'Interesse an dieser Immobilie?', btn_wa: 'Per WhatsApp schreiben', btn_mail: 'E-Mail schreiben',
      nota_contacto: 'Schreiben Sie uns gern auf Deutsch. Mo–Fr 9:00–18:00 und Sa 9:00–13:00 Uhr, argentinische Zeit (GMT−3).',
      mapa_exacta: 'Lage auf Google Maps ansehen', mapa_zona: 'Umgebung auf Google Maps ansehen',
      inicio: 'Start', propiedades: 'Immobilien', volver: 'Zurück zu allen Immobilien',
      no_esta: 'Diese Immobilie ist nicht mehr verfügbar.', ver_todas: 'Alle Immobilien ansehen',
      wa_prop: 'Hallo! Ich interessiere mich für diese Immobilie: {t} ({u})', asunto: 'Anfrage: {t}',
      nota_cambio: 'Ungefähre Umrechnung: 1 € = {eur} USD (Europäische Zentralbank, {f1}) und 1 USD = {ars} ARS (offizieller Kurs in Argentinien, {f2}). Maßgeblich ist der Preis in der Originalwährung.',
      foto: 'Foto', anterior: 'Vorherige Seite', siguiente: 'Nächste Seite'
    },
    it: {
      todas_op: 'Comprare o affittare', comprar: 'Comprare', alquilar: 'Affittare',
      todos_tipos: 'Tutte le tipologie', tipo: 'Tipologia', otro: 'Immobile',
      lugar: 'Cerca una località', buscar: 'Cerca immobili',
      dorm: 'Camere', dorm_n: 'Almeno {n} camere', cualquiera: 'Qualsiasi',
      precio: 'Prezzo', moneda: 'Valuta', min: 'Min.', max: 'Max.', aplicar: 'Applica', limpiar: 'Azzera',
      precio_desde: 'Da {a}', precio_hasta: 'Fino a {b}',
      precio_nota: 'I prezzi in altre valute sono convertiti in modo approssimativo.',
      orden: ['Più recenti', 'Prezzo crescente', 'Prezzo decrescente'], ordenar: 'Ordina per',
      filtros: 'Filtri', limpiar_todo: 'Azzera tutti i filtri',
      cuenta1: '1 immobile', cuenta: '{n} immobili',
      ninguna: 'Nessun immobile corrisponde a questi filtri.',
      cargando: 'Caricamento degli immobili…', cargando_ficha: 'Caricamento…',
      error: 'Non è stato possibile caricare gli immobili. Riprovate tra qualche istante.',
      ver: "Vedi l'immobile", venta: 'In vendita', alquiler: 'In affitto', por_mes: '/ mese',
      consultar: 'Prezzo su richiesta',
      dorm1: 'camera', dormN: 'camere', bano1: 'bagno', banoN: 'bagni',
      m2_cub: 'm² coperti', m2_tot: 'm² totali', m2_lote: 'm² di terreno', cochera: 'Box auto', si: 'Sì',
      credito: 'Mutuo', credito_si: 'finanziabile',
      titulo_auto: { venta: '{tipo} in vendita – {lugar}', alquiler: '{tipo} in affitto – {lugar}' },
      desc_auto: 'La descrizione completa in italiano di questo immobile è in arrivo. Scriveteci su WhatsApp e vi invieremo tutti i dettagli, le foto e i video.',
      descripcion: 'Descrizione', fotos: 'Foto', video: 'Video',
      interesado: 'Le interessa questo immobile?', btn_wa: 'Scriveteci su WhatsApp', btn_mail: "Inviateci un'e-mail",
      nota_contacto: 'Potete scriverci in italiano. Lun–Ven 9:00–18:00 e Sab 9:00–13:00, ora argentina (GMT−3).',
      mapa_exacta: 'Vedi la posizione su Google Maps', mapa_zona: 'Vedi la zona su Google Maps',
      inicio: 'Home', propiedades: 'Immobili', volver: 'Torna a tutti gli immobili',
      no_esta: 'Questo immobile non è più disponibile.', ver_todas: 'Vedi tutti gli immobili',
      wa_prop: 'Buongiorno! Vorrei informazioni su questo immobile: {t} ({u})', asunto: 'Richiesta: {t}',
      nota_cambio: 'Conversioni approssimative: 1 € = {eur} USD (Banca centrale europea, {f1}) e 1 USD = {ars} ARS (cambio ufficiale in Argentina, {f2}). Fa fede il prezzo nella valuta originale.',
      foto: 'foto', anterior: 'Pagina precedente', siguiente: 'Pagina successiva'
    },
    fr: {
      todas_op: 'Acheter ou louer', comprar: 'Acheter', alquilar: 'Louer',
      todos_tipos: 'Tous les types de biens', tipo: 'Type de bien', otro: 'Bien',
      lugar: 'Rechercher un lieu', buscar: 'Rechercher',
      dorm: 'Chambres', dorm_n: 'Au moins {n} chambres', cualquiera: 'Indifférent',
      precio: 'Prix', moneda: 'Devise', min: 'Min.', max: 'Max.', aplicar: 'Appliquer', limpiar: 'Effacer',
      precio_desde: 'À partir de {a}', precio_hasta: "Jusqu'à {b}",
      precio_nota: "Les prix dans d'autres devises sont convertis de façon approximative.",
      orden: ['Plus récents', 'Prix croissant', 'Prix décroissant'], ordenar: 'Trier par',
      filtros: 'Filtres', limpiar_todo: 'Effacer tous les filtres',
      cuenta1: '1 bien', cuenta: '{n} biens',
      ninguna: 'Aucun bien ne correspond à ces filtres.',
      cargando: 'Chargement des biens…', cargando_ficha: 'Chargement…',
      error: "Nous n'avons pas pu charger les biens. Veuillez réessayer dans un instant.",
      ver: 'Voir le bien', venta: 'À vendre', alquiler: 'À louer', por_mes: '/ mois',
      consultar: 'Prix sur demande',
      dorm1: 'chambre', dormN: 'chambres', bano1: 'salle de bains', banoN: 'salles de bains',
      m2_cub: 'm² couverts', m2_tot: 'm² au total', m2_lote: 'm² de terrain', cochera: 'Garage', si: 'Oui',
      credito: 'Prêt immobilier', credito_si: 'éligible',
      titulo_auto: { venta: '{tipo} à vendre – {lugar}', alquiler: '{tipo} à louer – {lugar}' },
      desc_auto: 'La description complète en français de ce bien arrive bientôt. Écrivez-nous sur WhatsApp et nous vous enverrons tous les détails, les photos et les vidéos.',
      descripcion: 'Description', fotos: 'Photos', video: 'Vidéo',
      interesado: 'Ce bien vous intéresse ?', btn_wa: 'Écrivez-nous sur WhatsApp', btn_mail: 'Envoyez-nous un e-mail',
      nota_contacto: "Vous pouvez nous écrire en français. Du lundi au vendredi de 9 h à 18 h et le samedi de 9 h à 13 h, heure de l'Argentine (GMT−3).",
      mapa_exacta: "Voir l'emplacement sur Google Maps", mapa_zona: 'Voir le secteur sur Google Maps',
      inicio: 'Accueil', propiedades: 'Biens', volver: 'Retour à tous les biens',
      no_esta: "Ce bien n'est plus disponible.", ver_todas: 'Voir tous les biens',
      wa_prop: "Bonjour ! Ce bien m'intéresse : {t} ({u})", asunto: 'Demande : {t}',
      nota_cambio: "Conversions approximatives : 1 € = {eur} USD (Banque centrale européenne, {f1}) et 1 USD = {ars} ARS (taux officiel en Argentine, {f2}). Seul le prix dans la devise d'origine fait foi.",
      foto: 'photo', anterior: 'Page précédente', siguiente: 'Page suivante'
    }
  })[L];

  // Tipografía francesa: espacio fino que no corta antes de ? ! : ; y entre el número y la unidad.
  function tipoFr(v) {
    if (typeof v === 'string') {
      return v.replace(/ ([?!:;»])/g, '\u202f$1').replace(/« /g, '«\u202f')
        .replace(/(\d) (h\b|€|USD|ARS|m²)/g, '$1\u00a0$2');
    }
    if (Array.isArray(v)) return v.map(tipoFr);
    if (v && typeof v === 'object') {
      var o = {};
      Object.keys(v).forEach(function (k) { o[k] = tipoFr(v[k]); });
      return o;
    }
    return v;
  }
  if (L === 'fr') TX = tipoFr(TX);

  // ── Utilidades ──────────────────────────────────────────────
  function limpiar(s) {
    return String(s == null ? '' : s).replace(/\r\n?/g, '\n').replace(/^[ \t\n]+|[ \t\n]+$/g, '');
  }
  function fnv(s) {
    var h = 0x811c9dc5;
    var bytes = new TextEncoder().encode(s);
    for (var i = 0; i < bytes.length; i++) {
      h ^= bytes[i];
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ('0000000' + (h >>> 0).toString(16)).slice(-8);
  }
  function norm(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function f(plantilla, datos) {
    return plantilla.replace(/\{(\w+)\}/g, function (_, k) { return datos[k] == null ? '' : datos[k]; });
  }
  function num(n, dec) {
    return Number(n).toLocaleString(LOCALE, { maximumFractionDigits: dec == null ? 0 : dec });
  }
  function fecha(iso) {
    if (!iso) return '';
    var d = new Date(iso + 'T12:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString(LOCALE, { day: 'numeric', month: L === 'en' ? 'short' : 'long', year: 'numeric' });
  }
  function moneda(p) {
    var m = String(p.Moneda || '').trim().toUpperCase();
    return m === 'EUR' ? 'EUR' : m === 'USD' ? 'USD' : 'ARS';
  }
  function fmtPrecio(n, m) {
    var simbolo = m === 'EUR' ? '€' : m;
    if (L === 'en') return m === 'EUR' ? '€' + num(n) : m + ' ' + num(n);   // €3,990,000 · USD 895,000
    if (L === 'it') return simbolo + '\u00a0' + num(n);                       // € 3.990.000 · USD 895.000
    return num(n) + '\u00a0' + simbolo;                                       // 3.990.000 € (de) · 3 990 000 € (fr)
  }
  function redondear(v) {
    // Como las fichas fijas: de a 1.000 en precios de venta; de a 10 en alquileres chicos.
    var paso = v >= 10000 ? 1000 : v >= 1000 ? 100 : 10;
    return Math.round(v / paso) * paso;
  }
  function wa(texto) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(texto); }
  function esVideo(url) { return /\.(mp4|mov|webm|m4v|ogg)(\?.*)?$/i.test(url || ''); }
  function ruta(url) { return String(url || '').indexOf(DOM) === 0 ? url.slice(DOM.length) : url; }
  function param(nombre) { return new URLSearchParams(location.search).get(nombre) || ''; }

  // ── Datos ───────────────────────────────────────────────────
  var textosP = null;
  function textos() {
    if (!textosP) {
      textosP = fetch('/' + L + '/textos.json', { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error('textos ' + r.status);
        return r.json();
      }).catch(function (e) { textosP = null; throw e; });
    }
    return textosP;
  }
  function sb(path) {
    return fetch(SB + path, { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } }).then(function (r) {
      if (!r.ok) throw new Error('supabase ' + r.status);
      return r.json();
    });
  }
  var CAMPOS = 'id,title,price,Moneda,Operaciones_id,Tipos_id,Barrios_id,bedrooms,bathrooms,TotalMeters,CoverMeters,garage,' +
    'Barrios(name),Imagenes(id,image_url,is_main)';
  function listaEnVivo() {
    return sb('Propiedades?select=' + encodeURIComponent(CAMPOS) + '&order=id.desc');
  }

  // Una propiedad de Supabase + sus textos → todo lo que muestran las tarjetas y la ficha
  function armar(p, T) {
    var b = T.barrios[String(p.Barrios_id)] || null;
    var nombreBarrio = b ? b.n : limpiar(p.Barrios && p.Barrios.name);
    var region = b ? b.r : '';
    var clave = b ? b.k : norm(nombreBarrio);
    var tipo = T.tipos[String(p.Tipos_id)] || TX.otro;
    var op = p.Operaciones_id === 2 ? 'alquiler' : 'venta';
    var tr = T.p[String(p.id)] || null;
    var tituloOk = !!(tr && tr.ht === fnv(limpiar(p.title)));
    var titulo = tituloOk ? tr.t : f(TX.titulo_auto[op], { tipo: tipo, lugar: nombreBarrio || region || '' });
    var imgs = (p.Imagenes || []).slice().sort(function (a, c) {
      return (c.is_main === true) - (a.is_main === true) || a.id - c.id;
    });
    var fotos = imgs.filter(function (i) { return !esVideo(i.image_url); }).map(function (i) { return ruta(i.image_url); });
    var videos = imgs.filter(function (i) { return esVideo(i.image_url); }).map(function (i) { return ruta(i.image_url); });
    var m = moneda(p);
    var n = Number(p.price) || 0;
    var usd = n ? (m === 'USD' ? n : m === 'EUR' ? n * T.cambio.eur_usd : n / T.cambio.ars_usd) : 0;
    var precio = n ? fmtPrecio(n, m) + (op === 'alquiler' ? ' ' + TX.por_mes : '') : TX.consultar;
    var conv = '';
    if (n) {
      var dest = m === 'USD' ? 'EUR' : (m === 'EUR' ? 'USD' : (L === 'en' ? 'USD' : 'EUR'));
      var v = dest === 'USD' ? usd : usd / T.cambio.eur_usd;
      conv = '≈ ' + fmtPrecio(redondear(v), dest) + (op === 'alquiler' ? ' ' + TX.por_mes : '');
    }
    var esLote = p.Tipos_id === 3 || p.Tipos_id === 10;
    var fichas = [];
    if (p.bedrooms) fichas.push([num(p.bedrooms), p.bedrooms === 1 ? TX.dorm1 : TX.dormN]);
    if (p.bathrooms) fichas.push([num(p.bathrooms), p.bathrooms === 1 ? TX.bano1 : TX.banoN]);
    if (p.CoverMeters && !esLote) fichas.push([num(p.CoverMeters, 2) + ' m²', TX.m2_cub.replace('m² ', '')]);
    if (p.TotalMeters && (esLote || p.TotalMeters !== p.CoverMeters)) {
      fichas.push([num(p.TotalMeters, 2) + ' m²', (esLote ? TX.m2_lote : TX.m2_tot).replace('m² ', '')]);
    }
    return {
      id: p.id, p: p, tr: tr, tituloOk: tituloOk, titulo: titulo, tipo: tipo, op: op,
      barrio: nombreBarrio, region: region, lugar: [nombreBarrio, region].filter(Boolean).join(' · '),
      clave: clave, fotos: fotos, videos: videos, moneda: m, n: n, usd: usd, precio: precio, conv: conv,
      fichas: fichas, link: (T.est && T.est[String(p.id)]) || (U.ficha + '?id=' + p.id)
    };
  }

  function tarjeta(x) {
    var foto = x.fotos[0] || '/recursos/hero_poster.jpg';
    var fichas = x.fichas.slice(0, 3).map(function (a) { return a[0] + ' ' + a[1]; }).join(' · ');
    return '<a class="en-card" href="' + esc(x.link) + '">' +
      '<div class="en-card-img"><img src="' + esc(foto) + '" alt="' + esc(x.titulo) + '" loading="lazy"></div>' +
      '<div class="en-card-info">' +
      '<p class="bi-card-tag">' + esc((x.op === 'alquiler' ? TX.alquiler : TX.venta) + ' · ' + x.tipo) + '</p>' +
      '<p class="en-card-precio">' + esc(x.precio) + (x.conv ? ' <span>' + esc(x.conv) + '</span>' : '') + '</p>' +
      '<h3>' + esc(x.titulo) + '</h3>' +
      (x.lugar ? '<p class="en-card-lugar">' + esc(x.lugar) + '</p>' : '') +
      (fichas ? '<p class="en-card-fichas">' + esc(fichas) + '</p>' : '') +
      '<span class="en-card-btn">' + esc(TX.ver) + '</span>' +
      '</div></a>';
  }

  // ── Sugerencias de lugar (inicio y listado) ─────────────────
  function opcionesLugar(T, lista) {
    var usados = {};
    lista.forEach(function (x) { usados[x.p.Barrios_id] = true; });
    var out = [], vistos = {};
    (T.regiones || []).forEach(function (r) {
      var hay = lista.some(function (x) { return x.clave.indexOf(norm(r)) !== -1; });
      if (hay && !vistos[r]) { vistos[r] = 1; out.push({ texto: r, valor: r, clave: norm(r), region: true }); }
    });
    Object.keys(T.barrios).forEach(function (id) {
      if (!usados[id]) return;
      var b = T.barrios[id];
      var etiqueta = b.r ? b.n + ' · ' + b.r : b.n;
      if (vistos[etiqueta]) return;
      vistos[etiqueta] = 1;
      out.push({ texto: etiqueta, valor: b.n, clave: b.k, region: false });
    });
    return out;
  }

  function autocompletar(input, caja, opciones, alElegir) {
    var activo = -1;
    function cerrar() { caja.innerHTML = ''; caja.classList.remove('abierta'); activo = -1; }
    function mostrar() {
      var q = norm(input.value);
      cerrar();
      if (!q) return;
      var res = opciones().filter(function (o) { return o.clave.indexOf(q) !== -1 || norm(o.texto).indexOf(q) !== -1; });
      res.sort(function (a, b) {
        var pa = norm(a.texto).indexOf(q) === 0, pb = norm(b.texto).indexOf(q) === 0;
        return (pb - pa) || (b.region - a.region) || a.texto.localeCompare(b.texto, L);
      });
      res.slice(0, 8).forEach(function (o) {
        var d = document.createElement('div');
        d.className = 'sugerencia';
        d.textContent = o.texto;
        d.addEventListener('mousedown', function (e) { e.preventDefault(); });
        d.addEventListener('click', function () { input.value = o.valor; cerrar(); alElegir(o); });
        caja.appendChild(d);
      });
      if (caja.children.length) caja.classList.add('abierta');
    }
    input.addEventListener('input', mostrar);
    input.addEventListener('blur', function () { setTimeout(cerrar, 120); });
    input.addEventListener('keydown', function (e) {
      var items = caja.querySelectorAll('.sugerencia');
      if (e.key === 'Enter') {
        e.preventDefault();
        if (activo >= 0 && items[activo]) { items[activo].click(); return; }
        cerrar();
        alElegir(null);
        return;
      }
      if (e.key === 'Escape') { cerrar(); return; }
      if (!items.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); activo = (activo + 1) % items.length; }
      else if (e.key === 'ArrowUp') { e.preventDefault(); activo = (activo - 1 + items.length) % items.length; }
      else return;
      items.forEach(function (it, i) { it.classList.toggle('activo', i === activo); });
    });
  }

  function opcionesTipo(T, lista, select) {
    var hay = {};
    lista.forEach(function (x) { hay[x.p.Tipos_id] = true; });
    (T.grupos_tipo || []).forEach(function (g) {
      var ids = g[0].split(',');
      if (!ids.some(function (i) { return hay[i]; })) return;
      var o = document.createElement('option');
      o.value = g[0];
      o.textContent = g[1];
      select.appendChild(o);
    });
  }

  function coincide(x, filtro) {
    if (filtro.op && String(x.p.Operaciones_id) !== filtro.op) return false;
    if (filtro.tipo && filtro.tipo.split(',').indexOf(String(x.p.Tipos_id)) === -1) return false;
    if (filtro.dorm && !((x.p.bedrooms || 0) >= Number(filtro.dorm))) return false;
    if (filtro.lugar) {
      var q = norm(filtro.lugar);
      if (x.clave.indexOf(q) === -1 && norm(x.titulo).indexOf(q) === -1) return false;
    }
    return true;
  }

  // ── Inicio: buscador del hero ───────────────────────────────
  function iniciarBuscador() {
    var caja = document.getElementById('biBuscador');
    if (!caja) return;
    var selOp = document.getElementById('filtroOperacion');
    var selTipo = document.getElementById('filtroTipo');
    var input = document.getElementById('filtroBarrio');
    var sug = document.getElementById('sugerenciasBarrios');
    var opciones = [];
    function ir() {
      var q = new URLSearchParams();
      if (selOp.value) q.set('op', selOp.value);
      if (selTipo.value) q.set('type', selTipo.value);
      if (input.value.trim()) q.set('loc', input.value.trim());
      var s = q.toString();
      location.href = U.lista + (s ? '?' + s : '');
    }
    document.getElementById('btnBuscar').addEventListener('click', ir);
    // Elegir una sugerencia solo completa el lugar; Enter busca.
    autocompletar(input, sug, function () { return opciones; }, function (o) { if (!o) ir(); });
    Promise.all([textos(), sb('Propiedades?select=id,title,Tipos_id,Operaciones_id,Barrios_id')]).then(function (r) {
      var T = r[0];
      var lista = r[1].map(function (p) { return armar(p, T); });
      opcionesTipo(T, lista, selTipo);
      opciones = opcionesLugar(T, lista);
    }).catch(function (e) { console.log('Buscador:', e); });
  }

  // ── Listado ─────────────────────────────────────────────────
  function iniciarListado() {
    var grilla = document.getElementById('biGrilla');
    if (!grilla) return;
    var el = {
      op: document.getElementById('biOp'), tipo: document.getElementById('biTipo'), dorm: document.getElementById('biDorm'),
      lugar: document.getElementById('biLugar'), sug: document.getElementById('biSug'), orden: document.getElementById('biOrden'),
      btnPrecio: document.getElementById('biBtnPrecio'), panel: document.getElementById('biPrecioPanel'),
      moneda: document.getElementById('biMoneda'), min: document.getElementById('biMin'), max: document.getElementById('biMax'),
      cuenta: document.getElementById('biCuenta'), paginas: document.getElementById('biPaginas'), nota: document.getElementById('biNota'),
      btnFiltros: document.getElementById('biBtnFiltros'), barra: document.getElementById('biBarra'),
      nFiltros: document.getElementById('biFiltrosN')
    };
    var T = null, todas = [], pagina = Math.max(1, parseInt(param('page'), 10) || 1);
    var precioActivo = { moneda: param('cur') || (L === 'en' ? 'USD' : 'EUR'), min: param('min'), max: param('max') };

    el.op.value = ['1', '2'].indexOf(param('op')) !== -1 ? param('op') : '';
    el.dorm.value = ['1', '2', '3', '4'].indexOf(param('bed')) !== -1 ? param('bed') : '';
    el.lugar.value = param('loc');
    el.orden.value = ['precio_asc', 'precio_desc'].indexOf(param('sort')) !== -1 ? param('sort') : '';
    el.moneda.value = precioActivo.moneda === 'EUR' ? 'EUR' : 'USD';
    el.min.value = precioActivo.min;
    el.max.value = precioActivo.max;

    function filtro() {
      return { op: el.op.value, tipo: el.tipo.value, dorm: el.dorm.value, lugar: el.lugar.value.trim() };
    }
    function enUSD(v, m) {
      if (v === '' || v == null || isNaN(Number(v))) return null;
      return m === 'EUR' ? Number(v) * T.cambio.eur_usd : Number(v);
    }
    function etiquetaPrecio() {
      var m = precioActivo.moneda, a = precioActivo.min, b = precioActivo.max;
      var activo = a !== '' || b !== '';
      el.btnPrecio.classList.toggle('activo', activo);
      if (!activo) { el.btnPrecio.textContent = TX.precio; return; }
      var fa = a !== '' ? fmtPrecio(Number(a), m) : '', fb = b !== '' ? fmtPrecio(Number(b), m) : '';
      el.btnPrecio.textContent = a !== '' && b !== '' ? fa + ' – ' + fb : (a !== '' ? f(TX.precio_desde, { a: fa }) : f(TX.precio_hasta, { b: fb }));
    }
    function actualizarURL() {
      var q = new URLSearchParams();
      var fl = filtro();
      if (fl.op) q.set('op', fl.op);
      if (fl.tipo) q.set('type', fl.tipo);
      if (fl.dorm) q.set('bed', fl.dorm);
      if (fl.lugar) q.set('loc', fl.lugar);
      if (precioActivo.min !== '' || precioActivo.max !== '') {
        q.set('cur', precioActivo.moneda);
        if (precioActivo.min !== '') q.set('min', precioActivo.min);
        if (precioActivo.max !== '') q.set('max', precioActivo.max);
      }
      if (el.orden.value) q.set('sort', el.orden.value);
      if (pagina > 1) q.set('page', String(pagina));
      var s = q.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
      var n = ['op', 'type', 'bed', 'loc', 'min', 'max'].filter(function (k) { return q.has(k); }).length;
      if (q.has('min') && q.has('max')) n--;
      el.nFiltros.textContent = n ? '(' + n + ')' : '';
    }
    function mostrar(volverArriba) {
      var fl = filtro();
      var minU = enUSD(precioActivo.min, precioActivo.moneda), maxU = enUSD(precioActivo.max, precioActivo.moneda);
      var res = todas.filter(function (x) {
        if (!coincide(x, fl)) return false;
        if (minU != null || maxU != null) {
          if (!x.usd) return false;
          if (minU != null && x.usd < minU * 0.999) return false;
          if (maxU != null && x.usd > maxU * 1.001) return false;
        }
        return true;
      });
      if (el.orden.value === 'precio_asc' || el.orden.value === 'precio_desc') {
        var s = el.orden.value === 'precio_asc' ? 1 : -1;
        res.sort(function (a, b) {
          if (!a.usd !== !b.usd) return a.usd ? -1 : 1;
          return s * (a.usd - b.usd) || b.id - a.id;
        });
      }
      var total = Math.max(1, Math.ceil(res.length / POR_PAGINA));
      if (pagina > total) pagina = total;
      el.cuenta.textContent = res.length === 1 ? TX.cuenta1 : f(TX.cuenta, { n: num(res.length) });
      if (!res.length) {
        grilla.innerHTML = '<div class="bi-vacio"><p>' + esc(TX.ninguna) + '</p><button type="button" class="en-btn en-btn-linea" id="biLimpiarTodo">' +
          esc(TX.limpiar_todo) + '</button></div>';
        document.getElementById('biLimpiarTodo').addEventListener('click', limpiarTodo);
      } else {
        grilla.innerHTML = res.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(tarjeta).join('');
      }
      paginar(total);
      actualizarURL();
      if (volverArriba) document.querySelector('.bi-lista').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function paginar(total) {
      el.paginas.innerHTML = '';
      if (total <= 1) return;
      var lista = [];
      if (total <= 7) { for (var i = 1; i <= total; i++) lista.push(i); }
      else if (pagina <= 4) lista = [1, 2, 3, 4, 5, '…', total];
      else if (pagina >= total - 3) lista = [1, '…', total - 4, total - 3, total - 2, total - 1, total];
      else lista = [1, '…', pagina - 1, pagina, pagina + 1, '…', total];
      function boton(texto, destino, extra) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = texto;
        if (extra) b.setAttribute('aria-label', extra);
        if (destino === pagina) b.className = 'activa';
        if (destino == null || destino < 1 || destino > total) b.disabled = true;
        else b.addEventListener('click', function () { pagina = destino; mostrar(true); });
        el.paginas.appendChild(b);
      }
      boton('‹', pagina - 1, TX.anterior);
      lista.forEach(function (x) {
        if (x === '…') { var s = document.createElement('span'); s.textContent = '…'; el.paginas.appendChild(s); }
        else boton(String(x), x);
      });
      boton('›', pagina + 1, TX.siguiente);
    }
    function cambio() { pagina = 1; mostrar(false); }
    function limpiarTodo() {
      el.op.value = ''; el.tipo.value = ''; el.dorm.value = ''; el.lugar.value = ''; el.orden.value = '';
      precioActivo.min = ''; precioActivo.max = ''; el.min.value = ''; el.max.value = '';
      etiquetaPrecio();
      cambio();
    }
    [el.op, el.tipo, el.dorm, el.orden].forEach(function (s) { s.addEventListener('change', cambio); });
    autocompletar(el.lugar, el.sug, function () { return T ? opcionesLugar(T, todas) : []; }, cambio);
    el.lugar.addEventListener('input', function () { if (!el.lugar.value.trim()) cambio(); });

    // Precio: panel con moneda, mínimo y máximo
    el.btnPrecio.addEventListener('click', function (e) {
      e.stopPropagation();
      el.panel.hidden = !el.panel.hidden;
      el.btnPrecio.setAttribute('aria-expanded', String(!el.panel.hidden));
      if (!el.panel.hidden) el.min.focus();
    });
    el.panel.addEventListener('click', function (e) { e.stopPropagation(); });
    document.addEventListener('click', function () { el.panel.hidden = true; el.btnPrecio.setAttribute('aria-expanded', 'false'); });
    function aplicarPrecio() {
      var a = el.min.value.trim(), b = el.max.value.trim();
      if (a !== '' && b !== '' && Number(a) > Number(b)) { var t = a; a = b; b = t; el.min.value = a; el.max.value = b; }
      precioActivo = { moneda: el.moneda.value, min: a, max: b };
      el.panel.hidden = true;
      etiquetaPrecio();
      cambio();
    }
    document.getElementById('biAplicarPrecio').addEventListener('click', aplicarPrecio);
    document.getElementById('biLimpiarPrecio').addEventListener('click', function () {
      el.min.value = ''; el.max.value = '';
      aplicarPrecio();
    });
    [el.min, el.max].forEach(function (i) {
      i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); aplicarPrecio(); } });
    });

    // Celular: los filtros se abren y se cierran con un botón
    el.btnFiltros.addEventListener('click', function () {
      var abierta = el.barra.classList.toggle('abierta');
      el.btnFiltros.setAttribute('aria-expanded', String(abierta));
    });

    etiquetaPrecio();
    grilla.innerHTML = '<p class="bi-cargando">' + esc(TX.cargando) + '</p>';
    Promise.all([textos(), listaEnVivo()]).then(function (r) {
      T = r[0];
      todas = r[1].map(function (p) { return armar(p, T); });
      opcionesTipo(T, todas, el.tipo);
      var t = param('type');
      if (t && Array.prototype.some.call(el.tipo.options, function (o) { return o.value === t; })) el.tipo.value = t;
      el.nota.textContent = f(TX.nota_cambio, {
        eur: num(T.cambio.eur_usd, 4), f1: fecha(T.cambio.fecha_bce), ars: num(T.cambio.ars_usd, 2), f2: fecha(T.cambio.fecha_ars)
      });
      mostrar(false);
    }).catch(function (e) {
      console.log('Listado:', e);
      grilla.innerHTML = '<p class="bi-cargando">' + esc(TX.error) + '</p>';
    });
  }

  // ── Ficha genérica ──────────────────────────────────────────
  function meta(nombre, valor, esProp) {
    var sel = esProp ? 'meta[property="' + nombre + '"]' : 'meta[name="' + nombre + '"]';
    var m = document.querySelector(sel);
    if (!m) { m = document.createElement('meta'); m.setAttribute(esProp ? 'property' : 'name', nombre); document.head.appendChild(m); }
    m.setAttribute('content', valor);
  }
  function enlace(rel, href, hreflang) {
    var l = document.createElement('link');
    l.rel = rel;
    l.href = href;
    if (hreflang) l.hreflang = hreflang;
    document.head.appendChild(l);
  }

  function iniciarFicha() {
    var cont = document.getElementById('biFicha');
    if (!cont) return;
    var id = parseInt(param('id'), 10);
    function noEsta() {
      cont.innerHTML = '<div class="bi-vacio"><p>' + esc(TX.no_esta) + '</p><a class="en-btn" href="' + U.lista + '">' + esc(TX.ver_todas) + '</a></div>';
    }
    if (!id) { noEsta(); return; }
    cont.innerHTML = '<p class="bi-cargando">' + esc(TX.cargando_ficha) + '</p>';
    textos().then(function (T) {
      if (T.est && T.est[String(id)]) { location.replace(T.est[String(id)]); return null; }
      return sb('Propiedades?select=*,Barrios(name),Imagenes(id,image_url,is_main)&id=eq.' + id).then(function (filas) {
        if (!filas || !filas.length) { noEsta(); return; }
        mostrarFicha(cont, filas[0], T);
      });
    }).catch(function (e) {
      console.log('Ficha:', e);
      cont.innerHTML = '<p class="bi-cargando">' + esc(TX.error) + '</p>';
    });
  }

  function mostrarFicha(cont, p, T) {
    var x = armar(p, T);
    var tr = x.tr;
    var descOk = !!(tr && tr.d && tr.h === fnv(limpiar(p.title) + '\n' + limpiar(p.description)));
    var url = DOM + U.ficha + '?id=' + p.id;
    var fichas = x.fichas.slice();
    if (p.garage) fichas.push([TX.si, TX.cochera]);
    if (p['Apto_crédito']) fichas.push([TX.credito_si, TX.credito]);
    var g = T.geo && T.geo[String(p.id)];
    var mapa = g ? '<a class="en-mapa" href="https://www.google.com/maps/search/?api=1&amp;query=' + g[0] + ',' + g[1] +
      '" target="_blank" rel="noopener">' + esc(g[2] ? TX.mapa_exacta : TX.mapa_zona) + '</a>' : '';
    var foto = x.fotos[0] || '/recursos/hero_poster.jpg';
    var texto = descOk ? tr.d : TX.desc_auto;
    var msj = f(TX.wa_prop, { t: x.titulo, u: url });
    var video = x.videos.length ? '<h2>' + esc(TX.video) + '</h2>' + x.videos.map(function (v) {
      return '<video class="en-video" controls preload="none" playsinline poster="' + esc(foto) + '"><source src="' + esc(v) + '" type="video/mp4"></video>';
    }).join('') : '';
    var galeria = x.fotos.slice(1).map(function (fo, i) {
      return '<a href="' + esc(fo) + '" target="_blank" rel="noopener"><img src="' + esc(fo) + '" alt="' + esc(x.titulo + ' – ' + TX.foto + ' ' + (i + 1)) + '" loading="lazy"></a>';
    }).join('');
    cont.innerHTML =
      '<nav class="en-breadcrumb"><a href="' + U.inicio + '">' + esc(TX.inicio) + '</a> <span>/</span> <a href="' + U.lista + '">' +
      esc(TX.propiedades) + '</a> <span>/</span> <span>' + esc(x.barrio || x.region) + '</span></nav>' +
      '<div class="en-prop-foto"><img src="' + esc(foto) + '" alt="' + esc(x.titulo) + '" fetchpriority="high"></div>' +
      '<div class="en-prop"><article class="en-prop-izq">' +
      '<p class="en-tags"><span>' + esc(x.op === 'alquiler' ? TX.alquiler : TX.venta) + '</span><span>' + esc(x.tipo) + '</span></p>' +
      '<h1>' + esc(x.titulo) + '</h1>' +
      (x.lugar ? '<p class="en-lugar">' + esc(x.lugar) + '</p>' : '') +
      '<p class="en-precio">' + esc(x.precio) + (x.conv ? ' <span class="en-conv">' + esc(x.conv) + '</span>' : '') + '</p>' +
      (fichas.length ? '<div class="en-fichas">' + fichas.map(function (a) {
        return '<div class="en-ficha"><strong>' + esc(a[0]) + '</strong><span>' + esc(a[1]) + '</span></div>';
      }).join('') + '</div>' : '') +
      '<h2>' + esc(TX.descripcion) + '</h2><div class="bi-desc' + (descOk ? '' : ' bi-desc-auto') + '">' + esc(texto) + '</div>' +
      video +
      (galeria ? '<h2>' + esc(TX.fotos) + '</h2><div class="en-fotos">' + galeria + '</div>' : '') +
      (x.conv ? '<p class="en-nota">' + esc(f(TX.nota_cambio, { eur: num(T.cambio.eur_usd, 4), f1: fecha(T.cambio.fecha_bce), ars: num(T.cambio.ars_usd, 2), f2: fecha(T.cambio.fecha_ars) })) + '</p>' : '') +
      '<p class="bi-volver"><a href="' + U.lista + '">← ' + esc(TX.volver) + '</a></p>' +
      '</article><aside class="en-prop-der"><div class="en-contacto">' +
      '<p class="en-contacto-titulo">' + esc(TX.interesado) + '</p>' +
      '<p class="en-contacto-precio">' + esc(x.precio) + '</p>' +
      '<a class="en-btn en-btn-wa" href="' + esc(wa(msj)) + '" target="_blank" rel="noopener">' + esc(TX.btn_wa) + '</a>' +
      '<a class="en-btn en-btn-linea" href="mailto:contacto@vitriolinmobiliaria.com?subject=' + encodeURIComponent(f(TX.asunto, { t: x.titulo })) + '">' + esc(TX.btn_mail) + '</a>' +
      '<p class="en-contacto-nota">' + esc(TX.nota_contacto) + '</p>' + mapa +
      ['es'].concat(IDIOMAS).filter(function (o) { return o !== L; }).map(function (o) {
        return '<a class="en-es" href="' + URLS[o].ficha + '?id=' + p.id + '" hreflang="' + o + '" lang="' + o + '">' + esc(VER_EN[o]) + '</a>';
      }).join('') +
      '</div></aside></div>';

    // Botón flotante de WhatsApp con el mensaje de esta propiedad
    var flotante = document.querySelector('.whatsapp-float');
    if (flotante) flotante.href = wa(msj);
    // Selectores de idioma del menú: a esta misma propiedad en el otro idioma
    Array.prototype.forEach.call(document.querySelectorAll('a.idioma-switch[data-ficha]'), function (a) {
      var otro = URLS[a.getAttribute('hreflang')];
      if (otro) a.href = otro.ficha + '?id=' + p.id;
    });

    // Título, descripción, canónica e idiomas de esta ficha
    var resumen = [x.precio, x.lugar].filter(Boolean).join(' · ');
    document.title = x.titulo + ' | Vitriol Inmobiliaria';
    meta('description', (x.titulo + '. ' + resumen).slice(0, 300));
    meta('og:title', x.titulo, true);
    meta('og:description', resumen, true);
    meta('og:url', url, true);
    if (x.fotos[0]) meta('og:image', (x.fotos[0].charAt(0) === '/' ? DOM : '') + x.fotos[0], true);
    enlace('canonical', url);
    enlace('alternate', url, L);
    ['es'].concat(IDIOMAS).filter(function (o) { return o !== L; }).forEach(function (o) {
      enlace('alternate', DOM + URLS[o].ficha + '?id=' + p.id, o);
    });
    enlace('alternate', DOM + URLS.en.ficha + '?id=' + p.id, 'x-default');
  }

  function arrancar() {
    iniciarBuscador();
    iniciarListado();
    iniciarFicha();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();

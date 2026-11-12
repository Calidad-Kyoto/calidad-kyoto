/**
 * logica.js — Funciones puras del Portal de Calidad (sin DOM). Se prueban con node _dev/test-logica.js.
 * Días hábiles = lunes a viernes; los feriados NO se descuentan.
 */
var Logica = (function () {
  'use strict';

  var ORDEN_CRITICIDAD = { Urgente: 0, Media: 1, Baja: 2 };
  var CRITICIDADES = ['Urgente', 'Media', 'Baja'];

  /** 'yyyy-MM-dd' → número de día UTC (o null). */
  function diaUTC(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return null;
    return Date.UTC(+m[1], +m[2] - 1, +m[3]) / 86400000;
  }

  /** Días lunes a viernes d con desde < d ≤ hasta. */
  function diasHabiles(desde, hasta) {
    var a = diaUTC(desde), b = diaUTC(hasta);
    if (a === null || b === null) return null;
    var n = 0;
    for (var d = a + 1; d <= b; d++) {
      var dow = new Date(d * 86400000).getUTCDay();
      if (dow !== 0 && dow !== 6) n++;
    }
    return n;
  }

  function avisosDe(problema, avisos) {
    return (avisos || []).filter(function (a) { return String(a.problema_id) === String(problema.id); });
  }

  function primerAviso(problema, avisos) {
    var fechas = [problema.fecha_aviso].concat(avisosDe(problema, avisos).map(function (a) { return a.fecha; }))
      .filter(function (f) { return diaUTC(f) !== null; });
    fechas.sort();
    return fechas[0] || '';
  }

  function estadoProblema(problema, avisos, hoy) {
    var primero = primerAviso(problema, avisos);
    var areas = [];
    [problema.area_aviso].concat(avisosDe(problema, avisos).map(function (a) { return a.area; })).forEach(function (a) {
      if (a && areas.indexOf(a) < 0) areas.push(a);
    });
    var solucionado = problema.solucionado === 'Sí';
    var alta = problema.fecha_alta || '';
    var pendiente = !alta && !solucionado;
    return {
      primerAviso: primero,
      nAreas: areas.length,
      areas: areas,
      pendienteEscalar: pendiente,
      diasSinEscalar: pendiente ? diasHabiles(primero, hoy) : null,
      diasAvisoAlta: alta ? diasHabiles(primero, alta) : null,
      diasAltaSolucion: alta && solucionado ? diasHabiles(alta, problema.fecha_solucion) : null,
      diasTotal: solucionado ? diasHabiles(primero, problema.fecha_solucion) : null
    };
  }

  function ordenarAbiertos(problemas, avisos) {
    return (problemas || []).filter(function (p) { return p.solucionado !== 'Sí'; })
      .map(function (p) { return { p: p, f: primerAviso(p, avisos) }; })
      .sort(function (x, y) {
        var c = (ORDEN_CRITICIDAD[x.p.criticidad] ?? 9) - (ORDEN_CRITICIDAD[y.p.criticidad] ?? 9);
        return c || (x.f < y.f ? -1 : x.f > y.f ? 1 : 0);
      })
      .map(function (x) { return x.p; });
  }

  function promedio(nums) {
    var v = nums.filter(function (n) { return typeof n === 'number'; });
    if (!v.length) return null;
    var s = v.reduce(function (a, b) { return a + b; }, 0);
    return Math.round((s / v.length) * 10) / 10;
  }

  function tiempos(estados) {
    return {
      avisoAlta: promedio(estados.map(function (e) { return e.diasAvisoAlta; })),
      altaSolucion: promedio(estados.map(function (e) { return e.diasAltaSolucion; })),
      total: promedio(estados.map(function (e) { return e.diasTotal; }))
    };
  }

  function metricasMantenimiento(problemas, avisos, sucursal, hoy) {
    var lista = (problemas || []).filter(function (p) { return !sucursal || sucursal === 'Todas' || p.sucursal === sucursal; });
    var con = lista.map(function (p) { return { p: p, e: estadoProblema(p, avisos, hoy) }; });
    var abiertos = { Urgente: 0, Media: 0, Baja: 0 };
    var mes = String(hoy || '').slice(0, 7);
    var pendientes = 0, solMes = 0;
    con.forEach(function (x) {
      if (x.p.solucionado !== 'Sí') {
        if (abiertos[x.p.criticidad] !== undefined) abiertos[x.p.criticidad]++;
        if (x.e.pendienteEscalar) pendientes++;
      } else if (String(x.p.fecha_solucion || '').slice(0, 7) === mes) solMes++;
    });
    var porSucursal = {}, porCriticidad = {};
    con.forEach(function (x) {
      (porSucursal[x.p.sucursal] = porSucursal[x.p.sucursal] || []).push(x.e);
      (porCriticidad[x.p.criticidad] = porCriticidad[x.p.criticidad] || []).push(x.e);
    });
    Object.keys(porSucursal).forEach(function (k) { porSucursal[k] = tiempos(porSucursal[k]); });
    Object.keys(porCriticidad).forEach(function (k) { porCriticidad[k] = tiempos(porCriticidad[k]); });
    return {
      abiertos: abiertos,
      pendientesEscalar: pendientes,
      solucionadosMes: solMes,
      promedios: tiempos(con.map(function (x) { return x.e; })),
      porSucursal: porSucursal,
      porCriticidad: porCriticidad
    };
  }

  /** La de fecha más nueva; si empatan, la cargada después (más abajo en el Sheet). */
  function masReciente(a, b) {
    if (!a) return b;
    return String(b.fecha) >= String(a.fecha) ? b : a;
  }

  function ultimaPorCategoria(compras) {
    var out = {};
    (compras || []).forEach(function (c) { out[c.categoria] = masReciente(out[c.categoria], c); });
    return out;
  }

  function ranking(proveedores, compras, noVolver) {
    var porId = {};
    (proveedores || []).forEach(function (p) { porId[p.id] = p; });
    var grupos = {};
    (compras || []).forEach(function (c) {
      if (!porId[c.proveedor_id]) return;
      var cat = grupos[c.categoria] = grupos[c.categoria] || {};
      (cat[c.proveedor_id] = cat[c.proveedor_id] || []).push(c);
    });
    var out = {};
    Object.keys(grupos).forEach(function (cat) {
      out[cat] = Object.keys(grupos[cat]).map(function (pid) {
        var cs = grupos[cat][pid];
        var cal = cs.map(function (c) { return c.calificacion === '' || c.calificacion === null || c.calificacion === undefined ? null : Number(c.calificacion); })
          .filter(function (n) { return n !== null && !isNaN(n); });
        var bloqueo = (noVolver || []).filter(function (n) { return String(n.proveedor_id) === String(pid) && n.categoria === cat; })[0] || null;
        return {
          proveedor: porId[pid],
          promedio: promedio(cal),
          nCalificadas: cal.length,
          nCompras: cs.length,
          ultimaCompra: cs.reduce(masReciente, null),
          bloqueo: bloqueo
        };
      }).sort(function (a, b) {
        if (!!a.bloqueo !== !!b.bloqueo) return a.bloqueo ? 1 : -1;
        if (a.promedio !== b.promedio) {
          if (a.promedio === null) return 1;
          if (b.promedio === null) return -1;
          return b.promedio - a.promedio;
        }
        return b.nCompras - a.nCompras;
      });
    });
    return out;
  }

  function precioUnitario(total, cantidad) {
    total = Number(total); cantidad = Number(cantidad);
    if (!(cantidad > 0) || isNaN(total)) return null;
    return Math.round((total / cantidad) * 100) / 100;
  }

  /** '1.500,50' → 1500.5 · '45.000' → 45000 · '1500.5' → 1500.5 */
  function parseNumeroAR(texto) {
    var s = String(texto === undefined || texto === null ? '' : texto).trim().replace(/\$|\s/g, '');
    if (!s) return null;
    if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
    return Number(s);
  }

  var FMT = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function formatoPesos(n) {
    if (n === null || n === undefined || n === '' || isNaN(Number(n))) return '—';
    return '$ ' + FMT.format(Number(n));
  }

  function tipoLink(url) {
    var u = String(url || '').trim();
    if (!/^https?:\/\//i.test(u)) return null;
    var host = '', ruta = '';
    var m = /^https?:\/\/([^\/?#]+)([^?#]*)/i.exec(u);
    if (m) { host = m[1].toLowerCase(); ruta = m[2].toLowerCase(); }
    if (host === 'docs.google.com' && ruta.indexOf('/spreadsheets') === 0) return 'sheets';
    if (host === 'docs.google.com' && ruta.indexOf('/forms') === 0) return 'form';
    if (host.indexOf('canva.com') >= 0) return 'canva';
    if (host === 'datastudio.google.com' || host === 'lookerstudio.google.com') return 'looker';
    if (host.indexOf('sharepoint.com') >= 0) return 'sharepoint';
    if (host === 'script.google.com') return 'appsscript';
    if (host.indexOf('nissan') >= 0) return 'nissan';
    return 'web';
  }

  function linkWhatsApp(tel) {
    var d = String(tel || '').split('/')[0].replace(/\D/g, '');
    if (d.charAt(0) === '0') d = d.slice(1);
    if (d.length < 10) return null;
    if (d.indexOf('54') !== 0) d = '549' + d;
    return 'https://wa.me/' + d;
  }

  function normalizar(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  }

  return {
    CRITICIDADES: CRITICIDADES,
    diasHabiles: diasHabiles, primerAviso: primerAviso, estadoProblema: estadoProblema,
    ordenarAbiertos: ordenarAbiertos, metricasMantenimiento: metricasMantenimiento,
    ranking: ranking, ultimaPorCategoria: ultimaPorCategoria, precioUnitario: precioUnitario,
    parseNumeroAR: parseNumeroAR, formatoPesos: formatoPesos, tipoLink: tipoLink,
    linkWhatsApp: linkWhatsApp, normalizar: normalizar
  };
})();
if (typeof module !== 'undefined') module.exports = Logica;

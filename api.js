/**
 * api.js — Conexión con el Apps Script del Sheet. Sin endpoint en config.js → modo demo.
 */
var Api = (function () {
  'use strict';

  function endpoint() { return String((window.PORTAL_CONFIG || {}).endpoint || '').trim(); }
  function esDemo() { return !endpoint(); }

  var n = 0;
  function jsonp(url, ms) {
    return new Promise(function (resolve, reject) {
      var nombre = '__portal_cb_' + Date.now() + '_' + (n++);
      var script = document.createElement('script');
      var t = setTimeout(function () { limpiar(); reject(new Error('El Sheet tardó demasiado en responder. Probá de nuevo.')); }, ms || 30000);
      function limpiar() { clearTimeout(t); delete window[nombre]; script.remove(); }
      window[nombre] = function (d) { limpiar(); resolve(d); };
      script.onerror = function () { limpiar(); reject(new Error('No se pudo conectar con el Sheet. Revisá tu conexión.')); };
      script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'accion=datos&callback=' + nombre + '&_=' + Date.now();
      document.head.appendChild(script);
    });
  }

  function cargar() {
    if (esDemo()) return Demo.cargar();
    return jsonp(endpoint(), 30000).then(function (d) {
      if (!d || !d.ok) throw new Error((d && d.msg) || 'El Sheet respondió con un error.');
      return d;
    });
  }

  /** Guarda o anula. Rechaza con Error(msg) si el Sheet lo rechaza o hay un error de red. */
  function guardar(accion, datos) {
    var quien = App.quien();
    if (esDemo()) return Demo.guardar(accion, datos, quien);
    return fetch(endpoint(), { method: 'POST', body: JSON.stringify({ accion: accion, datos: datos, quien: quien }) })
      .catch(function () { throw new Error('No se pudo conectar con el Sheet. Revisá tu conexión y probá de nuevo.'); })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok) throw new Error((d && d.msg) || 'No se pudo guardar.');
        return d.registro;
      });
  }

  return { cargar: cargar, guardar: guardar, esDemo: esDemo };
})();

/**
 * app.js — Estructura común: solapas, quién carga, modales, menús, panel lateral, avisos (toasts).
 */
var App = (function () {
  'use strict';

  var SOLAPAS = ['accesos', 'proveedores', 'mantenimiento'];
  var modulos = {};
  var actual = 'accesos';
  var CLAVE_QUIEN = 'portal.quien';

  var App = {
    datos: null,
    registrar: function (nombre, modulo) { modulos[nombre] = modulo; }
  };

  // ───── utilidades ─────
  App.esc = function (s) {
    return String(s === undefined || s === null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  App.uuid = function () {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  };
  App.hoy = function () {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  App.fecha = function (iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
    return m ? m[3] + '/' + m[2] + '/' + m[1] : '';
  };
  App.fechaCorta = function (iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ''));
    return m ? m[3] + '/' + m[2] : '';
  };
  App.iconos = function () { if (window.lucide) lucide.createIcons(); };
  App.opciones = function (lista, elegido, vacio) {
    return (vacio ? '<option value="">' + App.esc(vacio) + '</option>' : '') + lista.map(function (x) {
      return '<option' + (x === elegido ? ' selected' : '') + '>' + App.esc(x) + '</option>';
    }).join('');
  };
  App.estrellas = function (valor) {
    if (valor === null || valor === undefined || valor === '') return '<span class="etq">Sin calificar</span>';
    var v = Number(valor), html = '';
    for (var i = 1; i <= 5; i++) html += '<span class="' + (v >= i - 0.25 ? 'llena' : 'vacia') + '"><i data-lucide="star"></i></span>';
    var txt = String(Math.round(v * 10) / 10).replace('.', ',');
    return '<span class="estrellas" role="img" aria-label="' + txt + ' de 5">' + html + '</span>';
  };

  // ───── quién carga ─────
  App.quien = function () {
    try { var q = JSON.parse(localStorage.getItem(CLAVE_QUIEN) || 'null'); return q && q.nombre && q.area ? q : null; }
    catch (e) { return App._quienMemoria || null; }
  };
  function guardarQuien(q) {
    App._quienMemoria = q;
    try { localStorage.setItem(CLAVE_QUIEN, JSON.stringify(q)); } catch (e) { /* sin almacenamiento: queda en memoria */ }
    pintarQuien();
  }
  function pintarQuien() {
    var q = App.quien() || App._quienMemoria;
    document.getElementById('quien-texto').textContent = q ? q.nombre + ' · ' + q.area : 'Identificate';
  }
  App.pedirQuien = function () {
    return new Promise(function (resolve) {
      var q = App.quien() || App._quienMemoria || {};
      var areas = (App.datos && App.datos.config.areas) || [];
      App.modal({
        titulo: '¿Quién está cargando?',
        textoGuardar: 'Continuar',
        cuerpo:
          '<p style="margin:0;color:var(--texto-2)">Queda registrado en cada carga. Se recuerda en este navegador.</p>' +
          '<div class="campo"><label for="q-nombre">Tu nombre</label><input id="q-nombre" class="entrada" autocomplete="name" value="' + App.esc(q.nombre || '') + '"></div>' +
          '<div class="campo"><label for="q-area">Tu área</label><select id="q-area" class="entrada">' + App.opciones(areas, q.area || 'Calidad') + '</select></div>',
        onGuardar: function (el) {
          var nombre = el.querySelector('#q-nombre').value.trim();
          if (!nombre) return Promise.reject(new Error('Escribí tu nombre'));
          var nuevo = { nombre: nombre, area: el.querySelector('#q-area').value };
          guardarQuien(nuevo);
          resolve(nuevo);
          return Promise.resolve();
        },
        onCancelar: function () { resolve(null); }
      });
    });
  };
  /** Devuelve quién carga; si no está, lo pide. Rechaza si el usuario cancela. */
  App.asegurarQuien = function () {
    var q = App.quien() || App._quienMemoria;
    if (q) return Promise.resolve(q);
    return App.pedirQuien().then(function (r) { if (!r) throw new Error('cancelado'); return r; });
  };

  // ───── toasts ─────
  App.toast = function (texto, tipo) {
    var cont = document.getElementById('toasts');
    var t = document.createElement('div');
    t.className = 'toast toast--' + (tipo || 'ok');
    t.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    t.innerHTML = '<i data-lucide="' + (tipo === 'error' ? 'alert-circle' : 'check-circle-2') + '"></i><span>' + App.esc(texto) + '</span>';
    cont.appendChild(t);
    App.iconos();
    setTimeout(function () { t.classList.add('saliendo'); setTimeout(function () { t.remove(); }, 220); }, tipo === 'error' ? 6000 : 3200);
  };

  // ───── modal ─────
  var ENFOCABLES = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  /**
   * App.modal({titulo, cuerpo, textoGuardar, peligro, onAbrir(el), onGuardar(el) → Promise, onCancelar}) → cerrar()
   */
  App.modal = function (o) {
    var previo = document.activeElement;
    var capa = document.getElementById('capa-modal');
    var fondo = document.createElement('div');
    fondo.className = 'modal-fondo';
    fondo.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">' +
      '<div class="modal__cabeza"><h2 id="modal-titulo">' + App.esc(o.titulo) + '</h2>' +
      '<button type="button" class="btn-icono" data-cerrar aria-label="Cerrar"><i data-lucide="x"></i></button></div>' +
      '<form class="modal__form" novalidate><div class="modal__cuerpo">' + o.cuerpo +
      '<div class="modal__error" hidden></div></div>' +
      '<div class="modal__pie"><button type="button" class="btn btn--fantasma" data-cerrar>Cancelar</button>' +
      '<button type="submit" class="btn ' + (o.peligro ? 'btn--primario' : 'btn--primario') + '">' + App.esc(o.textoGuardar || 'Guardar') + '</button></div>' +
      '</form></div>';
    capa.appendChild(fondo);
    App.iconos();
    var modal = fondo.querySelector('.modal');
    var form = fondo.querySelector('form');
    var btn = form.querySelector('[type=submit]');
    var err = fondo.querySelector('.modal__error');
    var cerrado = false;
    var guardando = false;

    function cerrar(cancelado) {
      if (cerrado) return;
      if (cancelado && guardando) return; // no se cierra mientras guarda: si falla, el error tiene que verse
      cerrado = true;
      document.removeEventListener('keydown', teclas, true);
      fondo.remove();
      if (cancelado && o.onCancelar) o.onCancelar();
      if (previo && previo.focus) previo.focus();
    }
    function teclas(e) {
      if (e.key === 'Escape') { e.stopPropagation(); cerrar(true); }
      if (e.key === 'Tab') {
        var f = Array.prototype.filter.call(modal.querySelectorAll(ENFOCABLES), function (x) { return x.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    }
    document.addEventListener('keydown', teclas, true);
    fondo.addEventListener('mousedown', function (e) { if (e.target === fondo) cerrar(true); });
    fondo.querySelectorAll('[data-cerrar]').forEach(function (b) { b.addEventListener('click', function () { cerrar(true); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (btn.disabled) return;
      err.hidden = true;
      modal.querySelectorAll('[aria-invalid]').forEach(function (x) { x.removeAttribute('aria-invalid'); });
      var texto = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Guardando…';
      guardando = true;
      Promise.resolve().then(function () { return o.onGuardar(modal); }).then(function () {
        guardando = false;
        cerrar(false);
      }, function (e2) {
        guardando = false;
        btn.disabled = false;
        btn.textContent = texto;
        err.textContent = e2 && e2.message ? e2.message : String(e2);
        err.hidden = false;
        marcarCampo(modal, err.textContent);
        err.scrollIntoView({ block: 'nearest' });
      });
    });
    if (o.onAbrir) o.onAbrir(modal);
    var primero = modal.querySelector('.modal__cuerpo ' + ENFOCABLES);
    (primero || btn).focus();
    return function () { cerrar(false); };
  };
  /** Marca en rojo el campo que menciona el mensaje de error (por su data-campo). */
  function marcarCampo(modal, msg) {
    var m = String(msg).toLowerCase();
    modal.querySelectorAll('[data-campo]').forEach(function (x) {
      x.getAttribute('data-campo').split('|').forEach(function (palabra) {
        if (palabra && m.indexOf(palabra) >= 0) x.setAttribute('aria-invalid', 'true');
      });
    });
  }

  App.confirmar = function (titulo, texto, textoBoton) {
    return new Promise(function (resolve) {
      App.modal({
        titulo: titulo, textoGuardar: textoBoton || 'Confirmar', peligro: true,
        cuerpo: '<p style="margin:0">' + App.esc(texto) + '</p>',
        onGuardar: function () { resolve(true); return Promise.resolve(); },
        onCancelar: function () { resolve(false); }
      });
    });
  };

  // ───── menú de tres puntos ─────
  var menuAbierto = null;
  function cerrarMenu() { if (menuAbierto) { menuAbierto.remove(); menuAbierto = null; } }
  document.addEventListener('click', function (e) { if (menuAbierto && !menuAbierto.contains(e.target)) cerrarMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrarMenu(); });
  window.addEventListener('resize', cerrarMenu);
  /** items: [{texto, icono, peligro, accion}] */
  App.menu = function (boton, items) {
    cerrarMenu();
    var m = document.createElement('div');
    m.className = 'menu';
    m.setAttribute('role', 'menu');
    m.innerHTML = items.map(function (it, i) {
      return '<button type="button" role="menuitem" data-i="' + i + '" class="' + (it.peligro ? 'peligro' : '') + '">' +
        '<i data-lucide="' + it.icono + '"></i>' + App.esc(it.texto) + '</button>';
    }).join('');
    document.body.appendChild(m);
    var r = boton.getBoundingClientRect();
    var ancho = m.offsetWidth;
    m.style.top = (window.scrollY + r.bottom + 4) + 'px';
    m.style.left = Math.max(8, Math.min(window.scrollX + r.right - ancho, window.scrollX + document.documentElement.clientWidth - ancho - 8)) + 'px';
    App.iconos();
    m.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (!b) return;
      e.stopPropagation();
      cerrarMenu();
      items[Number(b.getAttribute('data-i'))].accion();
    });
    menuAbierto = m;
    var primero = m.querySelector('button');
    if (primero) primero.focus();
  };

  // ───── panel lateral ─────
  /** App.lateral({titulo, subtitulo, render(cuerpoEl)}) → {cerrar, refrescar} */
  App.lateral = function (o) {
    var previo = document.activeElement;
    var fondo = document.createElement('div');
    fondo.className = 'lateral-fondo';
    var panel = document.createElement('aside');
    panel.className = 'lateral';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', o.titulo);
    document.body.appendChild(fondo);
    document.body.appendChild(panel);
    function teclas(e) { if (e.key === 'Escape' && !document.querySelector('.modal-fondo')) cerrar(); }
    if (App._cerrarLateral) App._cerrarLateral();
    App._cerrarLateral = cerrar;
    function cerrar() {
      document.removeEventListener('keydown', teclas);
      if (App._cerrarLateral === cerrar) App._cerrarLateral = null;
      fondo.remove(); panel.remove();
      if (previo && previo.focus && document.body.contains(previo)) previo.focus();
    }
    function refrescar() {
      var t = typeof o.titulo === 'function' ? o.titulo() : o.titulo;
      panel.innerHTML = '<div class="lateral__cabeza"><div><h2 style="font-size:20px">' + App.esc(t) + '</h2>' +
        (o.subtitulo ? '<div style="color:var(--texto-2);font-size:14px;margin-top:4px">' + o.subtitulo() + '</div>' : '') +
        '</div><button type="button" class="btn-icono" data-cerrar aria-label="Cerrar"><i data-lucide="x"></i></button></div>' +
        '<div class="lateral__cuerpo"></div>';
      panel.querySelector('[data-cerrar]').addEventListener('click', cerrar);
      o.render(panel.querySelector('.lateral__cuerpo'));
      App.iconos();
    }
    fondo.addEventListener('click', cerrar);
    document.addEventListener('keydown', teclas);
    refrescar();
    panel.querySelector('[data-cerrar]').focus();
    return { cerrar: cerrar, refrescar: refrescar, abierto: function () { return document.body.contains(panel); } };
  };

  // ───── guardar con identidad + recarga ─────
  /** Pide quién (si falta), guarda y recarga los datos. Devuelve el registro. */
  App.guardar = function (accion, datos) {
    return App.asegurarQuien().then(function () { return Api.guardar(accion, datos); }).then(function (reg) {
      return App.recargar(true).then(function () { return reg; });
    });
  };

  // ───── solapas ─────
  function moverIndicador() {
    var b = document.querySelector('.solapa[data-solapa="' + actual + '"]');
    var ind = document.querySelector('.solapas__indicador');
    if (!b || !ind) return;
    ind.style.width = b.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + b.offsetLeft + 'px)';
  }
  App.irA = function (solapa, sinAnimar) {
    if (SOLAPAS.indexOf(solapa) < 0) solapa = 'accesos';
    if (App._cerrarLateral) App._cerrarLateral();
    actual = solapa;
    SOLAPAS.forEach(function (s) {
      var b = document.getElementById('tab-' + s);
      var p = document.getElementById('panel-' + s);
      var activa = s === solapa;
      b.setAttribute('aria-selected', activa ? 'true' : 'false');
      b.tabIndex = activa ? 0 : -1;
      p.hidden = !activa;
      if (activa && !sinAnimar) { p.classList.remove('entrando'); void p.offsetWidth; p.classList.add('entrando'); }
    });
    if (location.hash !== '#' + solapa) history.replaceState(null, '', '#' + solapa);
    if (!sinAnimar && window.scrollY > 80) window.scrollTo({ top: 0 });
    moverIndicador();
  };

  function renderTodo() {
    SOLAPAS.forEach(function (s) {
      if (modulos[s]) modulos[s].render(document.getElementById('panel-' + s), App.datos);
    });
    App.iconos();
  }

  function esqueleto() {
    SOLAPAS.forEach(function (s) {
      document.getElementById('panel-' + s).innerHTML = '<div class="esqueleto" aria-busy="true" aria-label="Cargando">' +
        '<div></div><div></div><div></div><div></div><div></div><div></div></div>';
    });
  }

  function errorCarga(e) {
    SOLAPAS.forEach(function (s) {
      document.getElementById('panel-' + s).innerHTML = '<div class="error-carga"><h2>No se pudieron cargar los datos</h2>' +
        '<p>' + App.esc(e.message || e) + '</p><button type="button" class="btn btn--primario" data-reintentar><i data-lucide="refresh-cw"></i>Reintentar</button></div>';
    });
    document.querySelectorAll('[data-reintentar]').forEach(function (b) { b.addEventListener('click', function () { App.recargar(); }); });
    App.iconos();
  }

  /** Vuelve a pedir todos los datos. silencioso = sin esqueletos (después de guardar). */
  App.recargar = function (silencioso) {
    if (!silencioso) esqueleto();
    return Api.cargar().then(function (d) {
      App.datos = d;
      renderTodo();
      if (App._alRecargar) App._alRecargar.forEach(function (fn) { fn(); });
    }, function (e) {
      if (silencioso) { App.toast('Se guardó, pero no se pudo actualizar la vista: ' + e.message, 'error'); return; }
      errorCarga(e);
    });
  };
  App.alRecargar = function (fn) { (App._alRecargar = App._alRecargar || []).push(fn); };

  App.iniciar = function () {
    document.getElementById('banner-demo').hidden = !Api.esDemo();
    document.querySelectorAll('.solapa').forEach(function (b) {
      b.addEventListener('click', function () { App.irA(b.getAttribute('data-solapa')); });
      b.addEventListener('keydown', function (e) {
        var i = SOLAPAS.indexOf(actual);
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var sig = SOLAPAS[(i + (e.key === 'ArrowRight' ? 1 : SOLAPAS.length - 1)) % SOLAPAS.length];
          App.irA(sig);
          document.getElementById('tab-' + sig).focus();
        }
      });
    });
    document.getElementById('btn-quien').addEventListener('click', function () { App.pedirQuien(); });
    window.addEventListener('hashchange', function () { App.irA(location.hash.slice(1)); });
    window.addEventListener('resize', moverIndicador);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moverIndicador);
    pintarQuien();
    App.irA(location.hash.slice(1) || 'accesos', true);
    App.iconos();
    App.recargar();
  };

  return App;
})();

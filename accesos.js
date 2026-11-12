/**
 * accesos.js — Solapa Accesos: botones a todas las herramientas y aplicativos.
 */
var Accesos = (function () {
  'use strict';

  var GRUPOS = ['Herramientas internas', 'Aplicativos Nissan'];
  var TIPOS = {
    sheets: { icono: 'sheet', texto: 'Google Sheets' },
    form: { icono: 'clipboard-list', texto: 'Formulario' },
    canva: { icono: 'palette', texto: 'Canva' },
    looker: { icono: 'bar-chart-3', texto: 'Looker Studio' },
    sharepoint: { icono: 'folder', texto: 'SharePoint' },
    appsscript: { icono: 'app-window', texto: 'App web' },
    nissan: { icono: 'car', texto: 'Nissan' },
    web: { icono: 'globe', texto: 'Sitio web' }
  };
  var busqueda = '';
  var panel = null;

  function esFecha(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }

  function tarjeta(a) {
    var tipo = TIPOS[Logica.tipoLink(a.url)];
    var obs = a.observacion;
    if (a.actualizado && !esFecha(a.actualizado)) obs = obs ? obs + ' · ' + a.actualizado : a.actualizado;
    var meta = tipo ? '<span class="etq">' + tipo.texto + '</span>' : '<span class="etq"><i data-lucide="lock"></i>Sin link</span>';
    if (esFecha(a.actualizado)) meta += '<span>Actualizado ' + App.fecha(a.actualizado) + '</span>';
    var cuerpo =
      '<span class="acceso__icono"><i data-lucide="' + (tipo ? tipo.icono : 'lock') + '"></i></span>' +
      '<span class="acceso__cuerpo"><span class="acceso__nombre">' + App.esc(a.nombre) + '</span>' +
      '<span class="acceso__meta">' + meta + '</span>' +
      (obs ? '<span class="acceso__obs">' + App.esc(obs) + '</span>' : '') + '</span>';
    var menu = '<button type="button" class="btn-icono acceso__menu" data-menu="' + App.esc(a.id) + '" aria-label="Opciones de ' + App.esc(a.nombre) + '"><i data-lucide="more-vertical"></i></button>';
    if (!a.url) return '<div class="tarjeta acceso acceso--bloqueado">' + cuerpo + menu + '</div>';
    return '<div style="position:relative"><a class="tarjeta tarjeta--interactiva acceso" href="' + App.esc(a.url) + '" target="_blank" rel="noopener">' + cuerpo + '</a>' + menu + '</div>';
  }

  function pintarLista() {
    var cont = panel.querySelector('[data-lista]');
    var q = Logica.normalizar(busqueda);
    var lista = (App.datos.accesos || []).filter(function (a) {
      return !q || Logica.normalizar(a.nombre + ' ' + a.observacion).indexOf(q) >= 0;
    });
    if (!lista.length) {
      cont.innerHTML = '<div class="vacio"><i data-lucide="search-x"></i><p>No hay accesos que coincidan con “' + App.esc(busqueda) + '”.</p></div>';
      App.iconos();
      return;
    }
    cont.innerHTML = GRUPOS.map(function (g) {
      var items = lista.filter(function (a) { return a.grupo === g; });
      if (!items.length) return '';
      return '<section class="grupo"><h2 class="grupo__titulo">' + g + ' <span class="contador">' + items.length + '</span></h2>' +
        '<div class="grilla-accesos">' + items.map(tarjeta).join('') + '</div></section>';
    }).join('');
    App.iconos();
  }

  function formulario(a) {
    a = a || { grupo: 'Herramientas internas' };
    var titulo = a.id ? 'Editar acceso' : 'Agregar acceso';
    var id = a.id || App.uuid(); // uno solo por formulario: un reintento no duplica
    App.asegurarQuien().then(function () {
      App.modal({
        titulo: titulo,
        cuerpo:
          '<div class="campo"><label for="ac-nombre">Nombre</label><input id="ac-nombre" class="entrada" data-campo="nombre" value="' + App.esc(a.nombre || '') + '" required></div>' +
          '<div class="campo"><label for="ac-url">Link</label><input id="ac-url" class="entrada" type="url" inputmode="url" data-campo="link|http" placeholder="https://…" value="' + App.esc(a.url || '') + '">' +
          '<span class="ayuda">Dejalo vacío si no tiene link (por ejemplo, si se entra solo por tablet).</span></div>' +
          '<div class="campo"><label for="ac-obs">Observación</label><input id="ac-obs" class="entrada" value="' + App.esc(a.observacion || '') + '" placeholder="Ej: Se ingresa con el gmail de Calidad"></div>' +
          (a.id ? '' : '<div class="campo"><label for="ac-grupo">Grupo</label><select id="ac-grupo" class="entrada">' + App.opciones(GRUPOS, a.grupo) + '</select></div>'),
        onGuardar: function (el) {
          var datos = {
            id: id,
            grupo: a.id ? a.grupo : el.querySelector('#ac-grupo').value,
            nombre: el.querySelector('#ac-nombre').value.trim(),
            url: el.querySelector('#ac-url').value.trim(),
            observacion: el.querySelector('#ac-obs').value.trim()
          };
          if (!datos.nombre) return Promise.reject(new Error('Falta el nombre del acceso'));
          return App.guardar('guardarAcceso', datos).then(function () { App.toast(a.id ? 'Acceso actualizado' : 'Acceso agregado'); });
        }
      });
    }).catch(function () {});
  }

  function anular(a) {
    App.confirmar('Anular acceso', '“' + a.nombre + '” deja de aparecer en el portal. La fila queda en el Sheet marcada como anulada.', 'Anular')
      .then(function (si) {
        if (!si) return;
        App.guardar('anular', { tabla: 'accesos', id: a.id })
          .then(function () { App.toast('Acceso anulado'); }, function (e) { if (e.message !== 'cancelado') App.toast(e.message, 'error'); });
      });
  }

  function render(contenedor) {
    panel = contenedor;
    var total = (App.datos.accesos || []).length;
    contenedor.innerHTML =
      '<div class="panel__cabeza"><div><h1>Accesos</h1><p>' + total + ' herramientas y aplicativos en un click.</p></div>' +
      '<div class="acciones"><button type="button" class="btn btn--primario" data-nuevo><i data-lucide="plus"></i>Agregar acceso</button></div></div>' +
      '<div class="barra"><label class="buscador"><span class="visualmente-oculto">Buscar acceso</span><i data-lucide="search"></i>' +
      '<input type="search" class="entrada" data-buscar placeholder="Buscar por nombre u observación…" value="' + App.esc(busqueda) + '"></label></div>' +
      '<div data-lista></div>';
    contenedor.querySelector('[data-nuevo]').addEventListener('click', function () { formulario(); });
    contenedor.querySelector('[data-buscar]').addEventListener('input', function (e) { busqueda = e.target.value; pintarLista(); });
    contenedor.querySelector('[data-lista]').addEventListener('click', function (e) {
      var b = e.target.closest('[data-menu]');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      var a = App.datos.accesos.find(function (x) { return x.id === b.getAttribute('data-menu'); });
      if (!a) return;
      App.menu(b, [
        { texto: 'Editar', icono: 'pencil', accion: function () { formulario(a); } },
        { texto: 'Anular', icono: 'archive-x', peligro: true, accion: function () { anular(a); } }
      ]);
    });
    pintarLista();
  }

  App.registrar('accesos', { render: render });
  return { render: render };
})();

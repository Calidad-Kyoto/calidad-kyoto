/**
 * mantenimiento.js — Solapa Mantenimiento: problemas por sucursal, criticidad, tres fechas y tablero.
 * Tiempos en días hábiles (lunes a viernes; los feriados no se descuentan).
 */
var Mantenimiento = (function () {
  'use strict';

  var sucursal = 'Todas';
  var vista = 'abiertos';
  var panel = null;

  function etqCriticidad(c) {
    var icono = { Urgente: 'siren', Media: 'alert-triangle', Baja: 'arrow-down-circle' }[c] || 'circle';
    return '<span class="etq etq--' + String(c).toLowerCase() + '"><i data-lucide="' + icono + '"></i>' + App.esc(c) + '</span>';
  }
  function dias(n) { return n === null || n === undefined ? '—' : n + (n === 1 ? ' día hábil' : ' días hábiles'); }
  function num(n) { return n === null || n === undefined ? '—' : String(n).replace('.', ','); }
  function problemaPorId(id) { return (App.datos.problemas || []).find(function (p) { return p.id === id; }); }
  function filtrados() {
    return (App.datos.problemas || []).filter(function (p) { return sucursal === 'Todas' || p.sucursal === sucursal; });
  }

  function kpis(m) {
    function k(clase, valor, etq, icono, sufijo) {
      return '<div class="tarjeta kpi kpi--' + clase + '"><div class="kpi__valor">' + valor + (sufijo ? '<small>' + sufijo + '</small>' : '') + '</div>' +
        '<div class="kpi__etq"><i data-lucide="' + icono + '"></i>' + etq + '</div></div>';
    }
    return '<div class="kpis">' +
      k('urgente', m.abiertos.Urgente, 'Urgentes abiertos', 'siren') +
      k('media', m.abiertos.Media, 'Media abiertos', 'alert-triangle') +
      k('baja', m.abiertos.Baja, 'Baja abiertos', 'arrow-down-circle') +
      k('pend', m.pendientesEscalar, 'Pendientes de escalar', 'mail-warning') +
      k('ok', m.solucionadosMes, 'Solucionados este mes', 'check-circle-2') +
      k('tiempo', num(m.promedios.avisoAlta), 'Aviso → Alta (promedio)', 'send', m.promedios.avisoAlta === null ? '' : 'días háb.') +
      k('tiempo', num(m.promedios.altaSolucion), 'Alta → Solución (promedio)', 'wrench', m.promedios.altaSolucion === null ? '' : 'días háb.') +
      k('tiempo', num(m.promedios.total), 'Total (promedio)', 'timer', m.promedios.total === null ? '' : 'días háb.') +
      '</div>';
  }

  function tablaTiempos(titulo, filas, grupo) {
    return '<div class="tarjeta tabla-wrap"><table class="tabla"><caption>' + titulo + ' <span style="font-weight:400;color:var(--texto-2);font-size:13px">(días hábiles)</span></caption>' +
      '<thead><tr><th scope="col">' + (grupo === 'suc' ? 'Sucursal' : 'Criticidad') + '</th><th scope="col" class="num">Aviso → Alta</th><th scope="col" class="num">Alta → Solución</th><th scope="col" class="num">Total</th></tr></thead><tbody>' +
      filas.map(function (f) {
        var t = f.t || { avisoAlta: null, altaSolucion: null, total: null };
        return '<tr><th scope="row" style="background:none;color:var(--texto);border-bottom:1px solid var(--borde)">' + (grupo === 'crit' ? etqCriticidad(f.nombre) : App.esc(f.nombre)) + '</th>' +
          '<td class="num">' + num(t.avisoAlta) + '</td><td class="num">' + num(t.altaSolucion) + '</td><td class="num">' + num(t.total) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function tarjetaProblema(p, hoy) {
    var e = Logica.estadoProblema(p, App.datos.avisos, hoy);
    var estado = e.pendienteEscalar
      ? '<span class="etq etq--pendiente"><i data-lucide="mail-warning"></i>Pendiente de escalar · ' + dias(e.diasSinEscalar) + '</span>'
      : '<span class="etq"><i data-lucide="send"></i>Alta ' + App.fechaCorta(p.fecha_alta) + ' · ' + dias(Logica.diasHabiles(p.fecha_alta, hoy)) + ' desde el alta</span>';
    var otras = e.areas.slice(1);
    return '<article class="tarjeta problema problema--' + App.esc(p.criticidad) + '">' +
      '<div class="problema__cabeza">' + etqCriticidad(p.criticidad) + '<span class="etq"><i data-lucide="map-pin"></i>' + App.esc(p.sucursal) + '</span>' +
      (p.referencia_id ? '<span class="etq"><i data-lucide="repeat"></i>Repetido</span>' : '') + '</div>' +
      '<div class="problema__desc">' + App.esc(p.descripcion) + '</div>' +
      '<div class="problema__meta"><span><i data-lucide="megaphone" style="width:14px;height:14px;vertical-align:-2px"></i> Avisó: ' + App.esc(p.area_aviso) + ' · ' + App.fechaCorta(e.primerAviso) + '</span>' +
      (otras.length ? '<span class="etq" title="' + App.esc(e.areas.join(', ')) + '"><i data-lucide="users"></i>+' + otras.length + (otras.length === 1 ? ' área' : ' áreas') + ': ' + App.esc(otras.join(', ')) + '</span>' : '') +
      estado + '</div>' +
      '<div class="problema__acciones">' +
      '<button type="button" class="btn btn--chico" data-aviso="' + App.esc(p.id) + '"><i data-lucide="megaphone"></i>Sumar aviso</button>' +
      (p.fecha_alta ? '' : '<button type="button" class="btn btn--chico" data-alta="' + App.esc(p.id) + '"><i data-lucide="send"></i>Cargar alta</button>') +
      '<button type="button" class="btn btn--chico" data-solucionar="' + App.esc(p.id) + '"><i data-lucide="check-circle-2"></i>Marcar solucionado</button></div>' +
      '<button type="button" class="btn-icono problema__menu" data-menu="' + App.esc(p.id) + '" aria-label="Opciones del problema ' + App.esc(p.descripcion) + '"><i data-lucide="more-vertical"></i></button>' +
      '</article>';
  }

  function tablaSolucionados(lista, hoy) {
    if (!lista.length) return '<div class="vacio"><i data-lucide="clipboard-check"></i><p>Todavía no hay problemas solucionados' + (sucursal === 'Todas' ? '' : ' en ' + App.esc(sucursal)) + '.</p></div>';
    return '<div class="tarjeta tabla-wrap"><table class="tabla tabla--tarjetas"><thead><tr>' +
      '<th scope="col">Sucursal</th><th scope="col">Problema</th><th scope="col">Criticidad</th><th scope="col">Aviso</th><th scope="col">Alta</th><th scope="col">Solución</th>' +
      '<th scope="col" class="num">Aviso→Alta</th><th scope="col" class="num">Alta→Sol.</th><th scope="col" class="num">Total</th><th scope="col"><span class="visualmente-oculto">Opciones</span></th></tr></thead><tbody>' +
      lista.map(function (p) {
        var e = Logica.estadoProblema(p, App.datos.avisos, hoy);
        return '<tr><td data-etq="Sucursal">' + App.esc(p.sucursal) + '</td><td data-etq="Problema">' + App.esc(p.descripcion) + '</td>' +
          '<td data-etq="Criticidad">' + etqCriticidad(p.criticidad) + '</td><td data-etq="Aviso">' + App.fecha(e.primerAviso) + '</td>' +
          '<td data-etq="Alta">' + (App.fecha(p.fecha_alta) || '—') + '</td><td data-etq="Solución">' + App.fecha(p.fecha_solucion) + '</td>' +
          '<td data-etq="Aviso→Alta" class="num">' + num(e.diasAvisoAlta) + '</td><td data-etq="Alta→Sol." class="num">' + num(e.diasAltaSolucion) + '</td>' +
          '<td data-etq="Total" class="num"><strong>' + num(e.diasTotal) + '</strong></td>' +
          '<td data-etq=""><button type="button" class="btn-icono" data-menu="' + App.esc(p.id) + '" aria-label="Opciones del problema ' + App.esc(p.descripcion) + '"><i data-lucide="more-vertical"></i></button></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  function pintar() {
    var hoy = App.hoy();
    var d = App.datos;
    var m = Logica.metricasMantenimiento(d.problemas, d.avisos, sucursal, hoy);
    var todas = Logica.metricasMantenimiento(d.problemas, d.avisos, 'Todas', hoy);
    var cont = panel.querySelector('[data-cuerpo]');
    var lista = filtrados();
    var abiertos = Logica.ordenarAbiertos(lista, d.avisos);
    var solucionados = lista.filter(function (p) { return p.solucionado === 'Sí'; })
      .sort(function (a, b) { return String(b.fecha_solucion).localeCompare(String(a.fecha_solucion)); });
    panel.querySelector('[data-n-abiertos]').textContent = abiertos.length;
    panel.querySelector('[data-n-sol]').textContent = solucionados.length;
    cont.innerHTML = kpis(m) +
      '<div class="tablas-tiempo">' +
      tablaTiempos('Tiempo promedio por sucursal', d.config.sucursales.map(function (s) { return { nombre: s, t: todas.porSucursal[s] }; }), 'suc') +
      tablaTiempos('Tiempo promedio por criticidad' + (sucursal === 'Todas' ? '' : ' · ' + App.esc(sucursal)), d.config.criticidades.map(function (c) { return { nombre: c, t: m.porCriticidad[c] }; }), 'crit') +
      '</div>' +
      (vista === 'abiertos'
        ? (abiertos.length ? '<div class="lista-problemas">' + abiertos.map(function (p) { return tarjetaProblema(p, hoy); }).join('') + '</div>'
          : '<div class="vacio"><i data-lucide="party-popper"></i><p>No hay problemas abiertos' + (sucursal === 'Todas' ? '' : ' en ' + App.esc(sucursal)) + '.</p></div>')
        : tablaSolucionados(solucionados, hoy));
    App.iconos();
  }

  // ───── formularios ─────
  function formProblema(p) {
    p = p || {};
    var d = App.datos;
    var editando = !!p.id;
    var crit = p.criticidad || 'Media';
    var id = p.id || App.uuid(); // fijo por formulario: un reintento no duplica
    var idsAviso = {}; // un id por problema sugerido en "Sumar aviso a este"
    App.asegurarQuien().then(function (q) {
      App.modal({
        titulo: editando ? 'Editar problema' : 'Cargar problema de mantenimiento',
        cuerpo:
          '<div class="grilla-form">' +
          '<div class="campo"><label for="mt-suc">Sucursal</label><select id="mt-suc" class="entrada" data-campo="sucursal">' + App.opciones(d.config.sucursales, p.sucursal || (sucursal !== 'Todas' ? sucursal : ''), 'Elegí la sucursal') + '</select></div>' +
          '<div class="campo"><label for="mt-area">Área que avisó</label><select id="mt-area" class="entrada" data-campo="área">' + App.opciones(d.config.areas, p.area_aviso || q.area) + '</select></div>' +
          '<div class="campo ancho" data-similares hidden></div>' +
          '<div class="campo ancho"><label for="mt-desc">Descripción del problema</label><textarea id="mt-desc" class="entrada" data-campo="descripción" placeholder="Ej: Pérdida de agua en el baño de clientes">' + App.esc(p.descripcion || '') + '</textarea></div>' +
          '<div class="campo ancho"><span class="etiqueta" id="mt-crit-l">Criticidad</span><div class="segmentado" role="group" aria-labelledby="mt-crit-l">' +
          d.config.criticidades.map(function (c) { return '<button type="button" data-v="' + App.esc(c) + '" aria-pressed="' + (c === crit) + '">' + App.esc(c) + '</button>'; }).join('') + '</div></div>' +
          '<div class="campo"><label for="mt-aviso">Fecha de aviso</label><input id="mt-aviso" type="date" class="entrada" data-campo="aviso" value="' + App.esc(p.fecha_aviso || App.hoy()) + '"></div>' +
          '<div class="campo"><label for="mt-alta">Fecha de alta (opcional)</label><input id="mt-alta" type="date" class="entrada" data-campo="alta" value="' + App.esc(p.fecha_alta || '') + '">' +
          '<span class="ayuda">Cuando se envió el correo a los encargados.</span></div>' +
          (editando ? '<div class="campo"><label for="mt-sol">¿Solucionado?</label><select id="mt-sol" class="entrada">' + App.opciones(['No', 'Sí'], p.solucionado || 'No') + '</select></div>' +
            '<div class="campo"><label for="mt-fsol">Fecha de solución</label><input id="mt-fsol" type="date" class="entrada" data-campo="solución" value="' + App.esc(p.fecha_solucion || '') + '"></div>' : '') +
          '<div class="campo ancho" data-ref-campo hidden><label for="mt-ref">¿Se repite un problema ya solucionado? (opcional)</label><select id="mt-ref" class="entrada"></select></div>' +
          '</div>',
        onAbrir: function (el) {
          var $ = function (s) { return el.querySelector(s); };
          el.querySelectorAll('.segmentado button').forEach(function (b) {
            b.addEventListener('click', function () {
              crit = b.getAttribute('data-v');
              el.querySelectorAll('.segmentado button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
            });
          });
          function alCambiarSucursal() {
            var s = $('#mt-suc').value;
            var abiertos = s ? Logica.ordenarAbiertos(d.problemas.filter(function (x) { return x.sucursal === s && x.id !== p.id; }), d.avisos) : [];
            var box = $('[data-similares]');
            if (!editando && abiertos.length) {
              box.hidden = false;
              box.innerHTML = '<div class="similares"><h3>¿Ya está cargado? Sumá el aviso</h3>' + abiertos.map(function (x) {
                return '<div class="similar"><span>' + etqCriticidad(x.criticidad) + ' ' + App.esc(x.descripcion) + '</span>' +
                  '<button type="button" class="btn btn--chico" data-sumar-a="' + App.esc(x.id) + '">Sumar aviso a este</button></div>';
              }).join('') + '</div>';
              App.iconos();
              box.querySelectorAll('[data-sumar-a]').forEach(function (b) {
                b.addEventListener('click', function () {
                  var destino = problemaPorId(b.getAttribute('data-sumar-a'));
                  var area = $('#mt-area').value, fecha = $('#mt-aviso').value;
                  b.disabled = true; b.textContent = 'Sumando…';
                  idsAviso[destino.id] = idsAviso[destino.id] || App.uuid();
                  Api.guardar('sumarAviso', { id: idsAviso[destino.id], problema_id: destino.id, area: area, fecha: fecha })
                    .then(function () {
                      App.toast('Aviso de ' + area + ' sumado a “' + destino.descripcion + '”');
                      el.querySelector('[data-cerrar]').click();
                      return App.recargar(true);
                    }, function (e) { b.disabled = false; b.textContent = 'Sumar aviso a este'; App.toast(e.message, 'error'); });
                });
              });
            } else { box.hidden = true; box.innerHTML = ''; }
            var sol = s ? d.problemas.filter(function (x) { return x.sucursal === s && x.solucionado === 'Sí' && x.id !== p.id; }) : [];
            $('[data-ref-campo]').hidden = !sol.length;
            $('#mt-ref').innerHTML = '<option value="">No, es un problema nuevo</option>' + sol.map(function (x) {
              return '<option value="' + App.esc(x.id) + '"' + (x.id === p.referencia_id ? ' selected' : '') + '>' + App.esc(x.descripcion) + ' (solucionado ' + App.fecha(x.fecha_solucion) + ')</option>';
            }).join('');
          }
          $('#mt-suc').addEventListener('change', alCambiarSucursal);
          alCambiarSucursal();
        },
        onGuardar: function (el) {
          var $ = function (s) { return el.querySelector(s); };
          if (!$('#mt-suc').value) return Promise.reject(new Error('Elegí la sucursal'));
          var datos = {
            id: id,
            sucursal: $('#mt-suc').value,
            area_aviso: $('#mt-area').value,
            descripcion: $('#mt-desc').value.trim(),
            criticidad: crit,
            fecha_aviso: $('#mt-aviso').value,
            fecha_alta: $('#mt-alta').value,
            solucionado: editando ? $('#mt-sol').value : 'No',
            fecha_solucion: editando ? $('#mt-fsol').value : '',
            referencia_id: $('#mt-ref').value,
            observaciones: p.observaciones || ''
          };
          if (!datos.descripcion) return Promise.reject(new Error('Falta la descripción del problema'));
          return Api.guardar('guardarProblema', datos).then(function () {
            App.toast(editando ? 'Problema actualizado' : 'Problema cargado');
            return App.recargar(true);
          });
        }
      });
    }).catch(function () {});
  }

  /** Modal chico de una sola fecha (alta o solución) sobre un problema existente. */
  function formFecha(p, tipo) {
    var esAlta = tipo === 'alta';
    App.asegurarQuien().then(function () {
      App.modal({
        titulo: esAlta ? 'Cargar fecha de alta' : 'Marcar como solucionado',
        textoGuardar: esAlta ? 'Guardar alta' : 'Marcar solucionado',
        cuerpo: '<p style="margin:0"><strong>' + App.esc(p.descripcion) + '</strong> · ' + App.esc(p.sucursal) + '</p>' +
          '<div class="campo"><label for="ff-fecha">' + (esAlta ? 'Fecha en que se envió el correo a los encargados' : 'Fecha de solución') + '</label>' +
          '<input id="ff-fecha" type="date" class="entrada" data-campo="alta|solución" value="' + App.hoy() + '"></div>',
        onGuardar: function (el) {
          var f = el.querySelector('#ff-fecha').value;
          var datos = Object.assign({}, p, esAlta ? { fecha_alta: f } : { solucionado: 'Sí', fecha_solucion: f });
          return App.guardar('guardarProblema', datos).then(function () { App.toast(esAlta ? 'Alta cargada' : 'Problema solucionado'); });
        }
      });
    }).catch(function () {});
  }

  function formAviso(p) {
    var id = App.uuid();
    App.asegurarQuien().then(function (q) {
      App.modal({
        titulo: 'Sumar aviso de otra área',
        textoGuardar: 'Sumar aviso',
        cuerpo: '<p style="margin:0"><strong>' + App.esc(p.descripcion) + '</strong> · ' + App.esc(p.sucursal) + '</p>' +
          '<div class="campo"><label for="av-area">Área que avisa</label><select id="av-area" class="entrada" data-campo="área">' + App.opciones(App.datos.config.areas, q.area) + '</select></div>' +
          '<div class="campo"><label for="av-fecha">Fecha del aviso</label><input id="av-fecha" type="date" class="entrada" data-campo="fecha" value="' + App.hoy() + '"></div>',
        onGuardar: function (el) {
          return App.guardar('sumarAviso', { id: id, problema_id: p.id, area: el.querySelector('#av-area').value, fecha: el.querySelector('#av-fecha').value })
            .then(function () { App.toast('Aviso sumado'); });
        }
      });
    }).catch(function () {});
  }

  function anular(p) {
    App.confirmar('Anular problema', '“' + p.descripcion + '” deja de aparecer y de contar en el tablero. Queda en el Sheet marcado como anulado.', 'Anular')
      .then(function (si) {
        if (si) App.guardar('anular', { tabla: 'problemas', id: p.id })
          .then(function () { App.toast('Problema anulado'); }, function (e) { if (e.message !== 'cancelado') App.toast(e.message, 'error'); });
      });
  }

  function render(contenedor) {
    panel = contenedor;
    var d = App.datos;
    contenedor.innerHTML =
      '<div class="panel__cabeza"><div><h1>Mantenimiento</h1><p>Problemas por sucursal, ordenados por criticidad. Tiempos en días hábiles (lunes a viernes).</p></div>' +
      '<div class="acciones"><button type="button" class="btn btn--primario" data-nuevo><i data-lucide="plus"></i>Cargar problema</button></div></div>' +
      '<div class="barra"><div class="chips" role="group" aria-label="Filtrar por sucursal">' + ['Todas'].concat(d.config.sucursales).map(function (s) {
        return '<button type="button" class="chip" data-suc="' + App.esc(s) + '" aria-pressed="' + (s === sucursal) + '">' + App.esc(s) + '</button>';
      }).join('') + '</div><span style="flex:1"></span>' +
      '<div class="subpestanas" role="tablist" aria-label="Estado">' +
      '<button type="button" role="tab" data-vista="abiertos" aria-selected="' + (vista === 'abiertos') + '">Abiertos (<span data-n-abiertos>0</span>)</button>' +
      '<button type="button" role="tab" data-vista="solucionados" aria-selected="' + (vista === 'solucionados') + '">Solucionados (<span data-n-sol>0</span>)</button></div></div>' +
      '<div data-cuerpo></div>';
    contenedor.querySelector('[data-nuevo]').addEventListener('click', function () { formProblema(); });
    contenedor.querySelectorAll('[data-suc]').forEach(function (b) {
      b.addEventListener('click', function () {
        sucursal = b.getAttribute('data-suc');
        contenedor.querySelectorAll('[data-suc]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        pintar();
      });
    });
    contenedor.querySelectorAll('[data-vista]').forEach(function (b) {
      b.addEventListener('click', function () {
        vista = b.getAttribute('data-vista');
        contenedor.querySelectorAll('[data-vista]').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
        pintar();
      });
    });
    contenedor.querySelector('[data-cuerpo]').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var id = b.getAttribute('data-aviso') || b.getAttribute('data-alta') || b.getAttribute('data-solucionar') || b.getAttribute('data-menu');
      var p = id && problemaPorId(id);
      if (!p) return;
      if (b.hasAttribute('data-aviso')) formAviso(p);
      else if (b.hasAttribute('data-alta')) formFecha(p, 'alta');
      else if (b.hasAttribute('data-solucionar')) formFecha(p, 'solucion');
      else if (b.hasAttribute('data-menu')) {
        e.stopPropagation();
        var items = [{ texto: 'Editar', icono: 'pencil', accion: function () { formProblema(p); } }];
        if (p.solucionado === 'Sí') items.push({ texto: 'Reabrir (no solucionado)', icono: 'rotate-ccw', accion: function () {
          App.guardar('guardarProblema', Object.assign({}, p, { solucionado: 'No', fecha_solucion: '' }))
            .then(function () { App.toast('Problema reabierto'); }, function (er) { if (er.message !== 'cancelado') App.toast(er.message, 'error'); });
        } });
        items.push({ texto: 'Anular', icono: 'archive-x', peligro: true, accion: function () { anular(p); } });
        App.menu(b, items);
      }
    });
    pintar();
  }

  App.registrar('mantenimiento', { render: render });
  return { render: render };
})();

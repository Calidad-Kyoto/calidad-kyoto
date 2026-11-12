/**
 * proveedores.js — Solapa Proveedores y compras: ranking por categoría, última compra, "No volver a comprar".
 */
var Proveedores = (function () {
  'use strict';

  var filtroCat = 'Todas';
  var busqueda = '';
  var panel = null;
  var lateral = null;
  var lateralId = null;

  function prov(id) { return (App.datos.proveedores || []).find(function (p) { return p.id === id; }); }
  function comprasDe(id) {
    return (App.datos.compras || []).filter(function (c) { return c.proveedor_id === id; })
      .sort(function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); });
  }
  function bloqueosDe(id) { return (App.datos.noVolver || []).filter(function (n) { return n.proveedor_id === id; }); }

  function telefonos(p, conBotones) {
    return String(p.telefono || '').split(' / ').filter(String).map(function (t) {
      var wa = Logica.linkWhatsApp(t);
      return '<a class="btn btn--chico" href="tel:' + App.esc(t.replace(/[^\d+]/g, '')) + '" aria-label="Llamar a ' + App.esc(p.nombre) + ' al ' + App.esc(t) + '"><i data-lucide="phone"></i>' + App.esc(t) + '</a>' +
        (wa && conBotones ? '<a class="btn btn--chico" href="' + wa + '" target="_blank" rel="noopener" aria-label="WhatsApp a ' + App.esc(p.nombre) + '"><i data-lucide="message-circle"></i>WhatsApp</a>' : '');
    }).join('');
  }

  function detalleCompra(c) {
    var pu = Logica.precioUnitario(c.precio_total, c.cantidad);
    return App.esc(c.cantidad) + ' u. · ' + Logica.formatoPesos(c.precio_total) + ' · ' + Logica.formatoPesos(pu) + '/u · ' + App.fecha(c.fecha);
  }

  // ───── listado ─────
  function pintarLista() {
    var cont = panel.querySelector('[data-lista]');
    var d = App.datos;
    var rk = Logica.ranking(d.proveedores, d.compras, d.noVolver);
    var ultimas = Logica.ultimaPorCategoria(d.compras);
    var q = Logica.normalizar(busqueda);
    var cats = d.config.categorias.filter(function (c) { return rk[c]; })
      .concat(Object.keys(rk).filter(function (c) { return d.config.categorias.indexOf(c) < 0; }));
    if (filtroCat !== 'Todas') cats = cats.filter(function (c) { return c === filtroCat; });

    var html = cats.map(function (cat) {
      var filas = rk[cat].filter(function (r) {
        if (!q) return true;
        var productos = comprasDe(r.proveedor.id).filter(function (c) { return c.categoria === cat; }).map(function (c) { return c.producto; }).join(' ');
        return Logica.normalizar(r.proveedor.nombre + ' ' + productos).indexOf(q) >= 0;
      });
      if (!filas.length) return '';
      var u = ultimas[cat];
      var pu = u ? prov(u.proveedor_id) : null;
      return '<section class="categoria"><h2 class="categoria__titulo">' + App.esc(cat) + '</h2><div class="tarjeta">' +
        (u ? '<div class="ultima"><span class="etq"><i data-lucide="history"></i>Última compra</span><strong>' + App.esc(u.producto) + '</strong>' +
          '<span>' + detalleCompra(u) + ' · ' + App.esc(pu ? pu.nombre : '') + '</span></div>' : '') +
        '<ol class="lista-prov">' + filas.map(function (r, i) {
          var p = r.proveedor;
          return '<li class="prov' + (r.bloqueo ? ' prov--bloqueado' : '') + '" data-prov="' + App.esc(p.id) + '" tabindex="0" role="button" aria-label="Ver historial de ' + App.esc(p.nombre) + '">' +
            '<span class="prov__pos">' + (r.bloqueo ? '<i data-lucide="ban"></i>' : (i + 1)) + '</span>' +
            '<div><div class="prov__nombre">' + App.esc(p.nombre) + '</div><div class="prov__meta">' +
            (r.promedio === null ? '<span class="etq">Sin calificar</span>' : App.estrellas(r.promedio) + '<span>' + String(r.promedio).replace('.', ',') + '</span>') +
            '<span>' + r.nCompras + (r.nCompras === 1 ? ' compra' : ' compras') + '</span>' +
            (r.bloqueo ? '<span class="etq etq--rojo"><i data-lucide="ban"></i>No volver a comprar</span>' : '') + '</div>' +
            (r.bloqueo ? '<div class="prov__motivo">' + App.esc(r.bloqueo.motivo) + '</div>' : '') + '</div>' +
            '<div class="prov__acciones">' + telefonos(p, true) + '</div></li>';
        }).join('') + '</ol></div></section>';
    }).join('');

    var sinCompras = (d.proveedores || []).filter(function (p) { return !comprasDe(p.id).length; })
      .filter(function (p) { return !q || Logica.normalizar(p.nombre).indexOf(q) >= 0; });
    if (filtroCat === 'Todas' && sinCompras.length) {
      html += '<section class="categoria"><h2 class="categoria__titulo">Proveedores sin compras registradas</h2><div class="tarjeta"><ol class="lista-prov">' +
        sinCompras.map(function (p) {
          return '<li class="prov" data-prov="' + App.esc(p.id) + '" tabindex="0" role="button" aria-label="Ver ' + App.esc(p.nombre) + '"><span class="prov__pos">–</span>' +
            '<div><div class="prov__nombre">' + App.esc(p.nombre) + '</div><div class="prov__meta">' + App.esc(p.contacto || '') + '</div></div>' +
            '<div class="prov__acciones">' + telefonos(p, true) + '</div></li>';
        }).join('') + '</ol></div></section>';
    }
    cont.innerHTML = html || '<div class="vacio"><i data-lucide="package-search"></i><p>' +
      (q || filtroCat !== 'Todas' ? 'No hay resultados para ese filtro.' : 'Todavía no hay compras. Registrá la primera con “Registrar compra”.') + '</p></div>';
    App.iconos();
  }

  // ───── panel lateral del proveedor ─────
  function abrirProveedor(id) {
    lateralId = id;
    lateral = App.lateral({
      titulo: function () { var p = prov(lateralId); return p ? p.nombre : 'Proveedor'; },
      subtitulo: function () {
        var p = prov(lateralId);
        return p ? App.esc([p.contacto && 'Contacto: ' + p.contacto, p.nota].filter(Boolean).join(' · ')) : '';
      },
      render: function (cuerpo) {
        var p = prov(lateralId);
        if (!p) { cuerpo.innerHTML = '<div class="vacio">Este proveedor ya no está disponible.</div>'; return; }
        var compras = comprasDe(p.id);
        var bloqueos = bloqueosDe(p.id);
        var catsProv = Array.from(new Set(compras.map(function (c) { return c.categoria; })));
        cuerpo.innerHTML =
          '<div class="acciones">' + telefonos(p, true) +
          '<button type="button" class="btn btn--chico" data-editar-prov><i data-lucide="pencil"></i>Editar datos</button>' +
          '<button type="button" class="btn btn--chico btn--primario" data-comprar><i data-lucide="plus"></i>Nueva compra</button></div>' +
          '<div><h3 style="font-size:16px;margin-bottom:8px">No volver a comprar</h3>' +
          (catsProv.length ? catsProv.map(function (cat) {
            var b = bloqueos.find(function (x) { return x.categoria === cat; });
            return '<div class="bloqueo-cat" style="margin-bottom:6px"><div><strong>' + App.esc(cat) + '</strong>' +
              (b ? '<div class="prov__motivo">' + App.esc(b.motivo) + ' · ' + App.fecha(b.fecha) + '</div>' : '<div style="font-size:13px;color:var(--texto-2)">Habilitado</div>') + '</div>' +
              (b ? '<button type="button" class="btn btn--chico" data-desbloquear="' + App.esc(b.id) + '"><i data-lucide="rotate-ccw"></i>Quitar marca</button>'
                 : '<button type="button" class="btn btn--chico" data-bloquear="' + App.esc(cat) + '"><i data-lucide="ban"></i>Marcar</button>') + '</div>';
          }).join('') : '<p style="margin:0;color:var(--texto-2);font-size:14px">Se puede marcar cuando haya compras en una categoría.</p>') + '</div>' +
          '<div><h3 style="font-size:16px;margin-bottom:8px">Historial de compras (' + compras.length + ')</h3><div class="historial">' +
          (compras.length ? compras.map(function (c) {
            return '<div class="tarjeta compra"><div class="compra__fila"><span class="compra__prod">' + App.esc(c.producto) + '</span>' +
              '<button type="button" class="btn-icono" data-menu-compra="' + App.esc(c.id) + '" aria-label="Opciones de la compra ' + App.esc(c.producto) + '"><i data-lucide="more-vertical"></i></button></div>' +
              '<div class="compra__detalle">' + App.esc(c.categoria) + ' · ' + detalleCompra(c) + '</div>' +
              '<div class="compra__fila" style="margin-top:6px">' + App.estrellas(c.calificacion) +
              (c.calificacion === '' || c.calificacion === null ? '<button type="button" class="btn btn--chico" data-calificar="' + App.esc(c.id) + '"><i data-lucide="star"></i>Calificar</button>' : '') + '</div>' +
              (c.comentario ? '<div class="compra__detalle" style="margin-top:4px">“' + App.esc(c.comentario) + '”</div>' : '') +
              '<div class="compra__detalle" style="margin-top:4px">Cargó: ' + App.esc(c.creado_por || '') + '</div></div>';
          }).join('') : '<div class="vacio">Sin compras registradas.</div>') + '</div></div>';

        cuerpo.querySelector('[data-editar-prov]').addEventListener('click', function () { formProveedor(p); });
        cuerpo.querySelector('[data-comprar]').addEventListener('click', function () { formCompra({ proveedor_id: p.id }); });
        cuerpo.querySelectorAll('[data-bloquear]').forEach(function (b) {
          b.addEventListener('click', function () { formNoVolver(p, b.getAttribute('data-bloquear')); });
        });
        cuerpo.querySelectorAll('[data-desbloquear]').forEach(function (b) {
          b.addEventListener('click', function () {
            App.guardar('anular', { tabla: 'noVolver', id: b.getAttribute('data-desbloquear') })
              .then(function () { App.toast('Se quitó la marca “No volver a comprar”'); }, function (e) { if (e.message !== 'cancelado') App.toast(e.message, 'error'); });
          });
        });
        cuerpo.querySelectorAll('[data-calificar]').forEach(function (b) {
          b.addEventListener('click', function () { formCompra(compraPorId(b.getAttribute('data-calificar'))); });
        });
        cuerpo.querySelectorAll('[data-menu-compra]').forEach(function (b) {
          b.addEventListener('click', function (e) {
            e.stopPropagation();
            var c = compraPorId(b.getAttribute('data-menu-compra'));
            App.menu(b, [
              { texto: 'Editar / calificar', icono: 'pencil', accion: function () { formCompra(c); } },
              { texto: 'Anular compra', icono: 'archive-x', peligro: true, accion: function () { anularCompra(c); } }
            ]);
          });
        });
      }
    });
  }
  function compraPorId(id) { return (App.datos.compras || []).find(function (c) { return c.id === id; }); }

  function anularCompra(c) {
    App.confirmar('Anular compra', 'La compra de “' + c.producto + '” deja de contar en el ranking. Queda en el Sheet marcada como anulada.', 'Anular')
      .then(function (si) {
        if (si) App.guardar('anular', { tabla: 'compras', id: c.id })
          .then(function () { App.toast('Compra anulada'); }, function (e) { if (e.message !== 'cancelado') App.toast(e.message, 'error'); });
      });
  }

  // ───── formularios ─────
  function estrellasInput(valor) {
    var html = '<div class="estrellas-input" role="radiogroup" aria-label="Calificación">';
    for (var i = 1; i <= 5; i++) {
      html += '<button type="button" role="radio" aria-checked="' + (Number(valor) === i) + '" aria-label="' + i + (i === 1 ? ' estrella' : ' estrellas') + '" data-estrella="' + i + '" class="' + (Number(valor) >= i ? 'on' : '') + '"><i data-lucide="star"></i></button>';
    }
    return html + '<button type="button" class="btn btn--chico btn--fantasma" data-sin-calif style="width:auto">Sin calificar</button></div>';
  }

  function formCompra(c) {
    c = c || {};
    var d = App.datos;
    var editando = !!c.id;
    var calif = c.calificacion === undefined ? '' : c.calificacion;
    var p0 = c.proveedor_id ? prov(c.proveedor_id) : null;
    // ids fijos por formulario: si la respuesta se pierde y se reintenta, el Sheet actualiza en vez de duplicar
    var ids = { compra: c.id || App.uuid(), proveedor: App.uuid(), noVolver: App.uuid() };
    App.asegurarQuien().then(function () {
      App.modal({
        titulo: editando ? 'Editar compra' : 'Registrar compra',
        cuerpo:
          '<div class="grilla-form">' +
          '<div class="campo"><label for="co-fecha">Fecha</label><input id="co-fecha" type="date" class="entrada" data-campo="fecha" value="' + App.esc(c.fecha || App.hoy()) + '"></div>' +
          '<div class="campo"><label for="co-cat">Categoría</label><select id="co-cat" class="entrada" data-campo="categoría">' + App.opciones(d.config.categorias, c.categoria, 'Elegí una categoría') + '</select></div>' +
          '<div class="campo ancho"><label for="co-prov">Proveedor</label><input id="co-prov" class="entrada" list="co-provs" autocomplete="off" data-campo="proveedor" placeholder="Escribí para buscar o cargá uno nuevo" value="' + App.esc(p0 ? p0.nombre : '') + '">' +
          '<datalist id="co-provs">' + (d.proveedores || []).map(function (p) { return '<option value="' + App.esc(p.nombre) + '">'; }).join('') + '</datalist>' +
          '<span class="ayuda" data-prov-ayuda>Si no está en la lista, escribí el nombre y se crea como proveedor nuevo.</span></div>' +
          '<div class="campo" data-nuevo hidden><label for="co-tel">Teléfono del proveedor nuevo</label><input id="co-tel" class="entrada" inputmode="tel" data-campo="teléfono" placeholder="3794 123456">' +
          '<span class="ayuda">Con código de área, sin 0 ni 15. Ej: 3794 123456</span></div>' +
          '<div class="campo" data-nuevo hidden><label for="co-contacto">Contacto (opcional)</label><input id="co-contacto" class="entrada"></div>' +
          '<div class="campo ancho"><label for="co-prod">Producto</label><input id="co-prod" class="entrada" data-campo="producto" placeholder="Ej: Calcomanías para vehículos" value="' + App.esc(c.producto || '') + '"></div>' +
          '<div class="campo"><label for="co-cant">Cantidad</label><input id="co-cant" class="entrada" inputmode="decimal" data-campo="cantidad" value="' + App.esc(c.cantidad || '') + '"></div>' +
          '<div class="campo"><label for="co-precio">Precio total ($)</label><input id="co-precio" class="entrada" inputmode="decimal" data-campo="precio" placeholder="Ej: 45.000,50" value="' + App.esc(c.precio_total === undefined ? '' : String(c.precio_total).replace('.', ',')) + '">' +
          '<span class="ayuda" data-unitario>Precio por unidad: —</span></div>' +
          '<div class="campo ancho"><span class="etiqueta">¿Cómo salió?</span>' + estrellasInput(calif) +
          '<span class="ayuda">Podés calificar después, cuando llegue la mercadería.</span></div>' +
          '<div class="campo ancho"><label for="co-com">Comentario</label><textarea id="co-com" class="entrada" placeholder="Ej: Salieron despegadas, mala impresión">' + App.esc(c.comentario || '') + '</textarea></div>' +
          '<div class="campo ancho" data-bloq hidden><label class="check"><input type="checkbox" id="co-bloq"><span><strong>Marcar “No volver a comprar”</strong> a este proveedor en esta categoría</span></label>' +
          '<input id="co-motivo" class="entrada" data-campo="motivo" placeholder="Motivo (ej: calcomanías de mala calidad)" hidden></div>' +
          '</div>',
        onAbrir: function (el) {
          var $ = function (s) { return el.querySelector(s); };
          function provElegido() {
            var n = Logica.normalizar($('#co-prov').value);
            return n ? (d.proveedores || []).find(function (p) { return Logica.normalizar(p.nombre) === n; }) : null;
          }
          function actualizarNuevo() {
            var escrito = $('#co-prov').value.trim();
            var nuevo = !!escrito && !provElegido();
            el.querySelectorAll('[data-nuevo]').forEach(function (x) { x.hidden = !nuevo; });
            $('[data-prov-ayuda]').textContent = nuevo ? 'Proveedor nuevo: completá su teléfono.' :
              (escrito ? 'Proveedor existente.' : 'Si no está en la lista, escribí el nombre y se crea como proveedor nuevo.');
          }
          function actualizarUnitario() {
            var pu = Logica.precioUnitario(Logica.parseNumeroAR($('#co-precio').value), Logica.parseNumeroAR($('#co-cant').value));
            $('[data-unitario]').textContent = 'Precio por unidad: ' + Logica.formatoPesos(pu);
          }
          function pintarEstrellas() {
            el.querySelectorAll('[data-estrella]').forEach(function (b) {
              var i = Number(b.getAttribute('data-estrella'));
              b.classList.toggle('on', calif !== '' && Number(calif) >= i);
              b.setAttribute('aria-checked', String(Number(calif) === i));
            });
            var malo = calif !== '' && Number(calif) <= 2;
            $('[data-bloq]').hidden = !malo;
            if (!malo) { $('#co-bloq').checked = false; $('#co-motivo').hidden = true; }
          }
          $('#co-prov').addEventListener('input', actualizarNuevo);
          $('#co-cant').addEventListener('input', actualizarUnitario);
          $('#co-precio').addEventListener('input', actualizarUnitario);
          el.querySelectorAll('[data-estrella]').forEach(function (b) {
            b.addEventListener('click', function () { calif = Number(b.getAttribute('data-estrella')); pintarEstrellas(); });
          });
          $('[data-sin-calif]').addEventListener('click', function () { calif = ''; pintarEstrellas(); });
          $('#co-bloq').addEventListener('change', function () { $('#co-motivo').hidden = !$('#co-bloq').checked; if ($('#co-bloq').checked) $('#co-motivo').focus(); });
          el._provElegido = provElegido;
          actualizarNuevo(); actualizarUnitario(); pintarEstrellas();
        },
        onGuardar: function (el) {
          var $ = function (s) { return el.querySelector(s); };
          var nombreProv = $('#co-prov').value.trim();
          if (!nombreProv) return Promise.reject(new Error('Elegí o escribí el proveedor'));
          if (!$('#co-cat').value) return Promise.reject(new Error('Elegí la categoría'));
          var cantidad = Logica.parseNumeroAR($('#co-cant').value);
          var precio = Logica.parseNumeroAR($('#co-precio').value);
          if (cantidad === null) return Promise.reject(new Error('La cantidad tiene que ser un número'));
          if (precio === null) return Promise.reject(new Error('El precio total tiene que ser un número'));
          var existente = el._provElegido();
          var datos = {
            id: ids.compra,
            fecha: $('#co-fecha').value,
            categoria: $('#co-cat').value,
            producto: $('#co-prod').value.trim(),
            cantidad: cantidad,
            precio_total: precio,
            calificacion: calif,
            comentario: $('#co-com').value.trim()
          };
          if (existente) datos.proveedor_id = existente.id;
          else {
            var tel = $('#co-tel').value.trim();
            if (!tel) return Promise.reject(new Error('Falta el teléfono del proveedor nuevo'));
            datos.proveedor_nuevo = { id: ids.proveedor, nombre: nombreProv, telefono: tel, contacto: $('#co-contacto').value.trim() };
          }
          var bloquear = $('#co-bloq').checked;
          var motivo = $('#co-motivo').value.trim();
          if (bloquear && !motivo) return Promise.reject(new Error('Escribí el motivo de “No volver a comprar”'));
          return Api.guardar('guardarCompra', datos).then(function (reg) {
            if (!bloquear) return reg;
            return Api.guardar('guardarNoVolver', { id: ids.noVolver, proveedor_id: reg.proveedor.id, categoria: datos.categoria, motivo: motivo });
          }).then(function () {
            App.toast(editando ? 'Compra actualizada' : 'Compra registrada');
            return App.recargar(true);
          });
        }
      });
    }).catch(function () {});
  }

  function formProveedor(p) {
    p = p || {};
    var id = p.id || App.uuid();
    App.asegurarQuien().then(function () {
      App.modal({
        titulo: p.id ? 'Editar proveedor' : 'Nuevo proveedor',
        cuerpo:
          '<div class="campo"><label for="pr-nombre">Nombre</label><input id="pr-nombre" class="entrada" data-campo="nombre|existe" value="' + App.esc(p.nombre || '') + '"></div>' +
          '<div class="campo"><label for="pr-tel">Teléfono</label><input id="pr-tel" class="entrada" inputmode="tel" data-campo="teléfono" value="' + App.esc(p.telefono || '') + '">' +
          '<span class="ayuda">Con código de área, sin 0 ni 15. Si tiene más de uno, separalos con “ / ”.</span></div>' +
          '<div class="campo"><label for="pr-contacto">Contacto</label><input id="pr-contacto" class="entrada" value="' + App.esc(p.contacto || '') + '"></div>' +
          '<div class="campo"><label for="pr-nota">Nota</label><textarea id="pr-nota" class="entrada" placeholder="Ej: Entrega en 48 hs, pedir factura A">' + App.esc(p.nota || '') + '</textarea></div>',
        onGuardar: function (el) {
          var datos = {
            id: id,
            nombre: el.querySelector('#pr-nombre').value.trim(),
            telefono: el.querySelector('#pr-tel').value.trim(),
            contacto: el.querySelector('#pr-contacto').value.trim(),
            nota: el.querySelector('#pr-nota').value.trim()
          };
          return App.guardar('guardarProveedor', datos).then(function () { App.toast(p.id ? 'Proveedor actualizado' : 'Proveedor agregado'); });
        }
      });
    }).catch(function () {});
  }

  function formNoVolver(p, categoria) {
    var id = App.uuid();
    App.asegurarQuien().then(function () {
      App.modal({
        titulo: 'No volver a comprar',
        textoGuardar: 'Marcar',
        cuerpo: '<p style="margin:0"><strong>' + App.esc(p.nombre) + '</strong> en <strong>' + App.esc(categoria) + '</strong></p>' +
          '<div class="campo"><label for="nv-motivo">Motivo</label><textarea id="nv-motivo" class="entrada" data-campo="motivo" placeholder="Ej: Calcomanías de mala calidad, se despegaron"></textarea></div>',
        onGuardar: function (el) {
          return App.guardar('guardarNoVolver', { id: id, proveedor_id: p.id, categoria: categoria, motivo: el.querySelector('#nv-motivo').value.trim() })
            .then(function () { App.toast('Marcado “No volver a comprar”'); });
        }
      });
    }).catch(function () {});
  }

  function render(contenedor) {
    panel = contenedor;
    var d = App.datos;
    contenedor.innerHTML =
      '<div class="panel__cabeza"><div><h1>Proveedores y compras</h1><p>A quién se le compró, a qué precio y cómo salió.</p></div>' +
      '<div class="acciones"><button type="button" class="btn" data-nuevo-prov><i data-lucide="user-plus"></i>Nuevo proveedor</button>' +
      '<button type="button" class="btn btn--primario" data-nueva-compra><i data-lucide="shopping-cart"></i>Registrar compra</button></div></div>' +
      '<div class="barra"><label class="buscador"><span class="visualmente-oculto">Buscar proveedor o producto</span><i data-lucide="search"></i>' +
      '<input type="search" class="entrada" data-buscar placeholder="Buscar proveedor o producto…" value="' + App.esc(busqueda) + '"></label>' +
      '<div class="chips" role="group" aria-label="Filtrar por categoría">' + ['Todas'].concat(d.config.categorias).map(function (c) {
        return '<button type="button" class="chip" data-cat="' + App.esc(c) + '" aria-pressed="' + (c === filtroCat) + '">' + App.esc(c) + '</button>';
      }).join('') + '</div></div><div data-lista></div>';
    contenedor.querySelector('[data-nueva-compra]').addEventListener('click', function () { formCompra(); });
    contenedor.querySelector('[data-nuevo-prov]').addEventListener('click', function () { formProveedor(); });
    contenedor.querySelector('[data-buscar]').addEventListener('input', function (e) { busqueda = e.target.value; pintarLista(); });
    contenedor.querySelectorAll('[data-cat]').forEach(function (b) {
      b.addEventListener('click', function () {
        filtroCat = b.getAttribute('data-cat');
        contenedor.querySelectorAll('[data-cat]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        pintarLista();
      });
    });
    var lista = contenedor.querySelector('[data-lista]');
    function abrirDesde(e) {
      if (e.target.closest('a,button')) return;
      var li = e.target.closest('[data-prov]');
      if (li) abrirProveedor(li.getAttribute('data-prov'));
    }
    lista.addEventListener('click', abrirDesde);
    lista.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { if (e.target.matches('[data-prov]')) { e.preventDefault(); abrirDesde(e); } } });
    pintarLista();
  }

  App.alRecargar(function () { if (lateral && lateral.abierto()) lateral.refrescar(); });
  App.registrar('proveedores', { render: render });
  return { render: render };
})();

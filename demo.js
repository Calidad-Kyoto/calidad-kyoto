/**
 * demo.js — Datos de ejemplo en memoria para probar la página sin el Sheet (endpoint vacío en config.js).
 * Los accesos son los reales del Sheet "Sheets Madre"; proveedores y problemas son de ejemplo.
 */
var Demo = (function () {
  'use strict';

  function hace(dias) {
    var d = new Date(); d.setDate(d.getDate() - dias);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  var quienDemo = 'Ejemplo (Calidad)';

  var datos = {
    ok: true,
    config: {
      sucursales: ['Corrientes', 'Resistencia', 'Posadas'],
      areas: ['Ventas Convencional', 'Ventas Plan de Ahorro', 'Posventa', 'Administración', 'RRHH', 'Calidad'],
      categorias: ['Librería', 'Indumentaria', 'Iluminación (focos y faros)', 'Identificadores', 'Calcomanías y gráfica', 'Otros'],
      criticidades: ['Urgente', 'Media', 'Baja']
    },
    accesos: [
      {"grupo":"Herramientas internas","nombre":"Control de salon (sitio web)","url":"https://tchequim.github.io/kyoto-checklist/kyoto_checklist.html","observacion":"","actualizado":"","id":"acc-01"},
      {"grupo":"Herramientas internas","nombre":"Control de salon (Google Sheets)","url":"https://docs.google.com/spreadsheets/u/0/d/1JdiWC9Hc9KzFnBhcCZeGFQ_IJsl_kEdYHHsjhW-5AZM/edit","observacion":"","actualizado":"","id":"acc-02"},
      {"grupo":"Herramientas internas","nombre":"Llamado de acompañamiento","url":"https://docs.google.com/spreadsheets/d/1S-1LF1TWW14gm8q93jH463cGwWjJUwecagxxqXjw7v0/edit?gid=1203804187","observacion":"","actualizado":"","id":"acc-03"},
      {"grupo":"Herramientas internas","nombre":"Control ND+","url":"https://docs.google.com/spreadsheets/d/1Jf_r4xgX8pEVEH47deegkT87xFzqZmVZRS5nwpc6S0c/edit?gid=0","observacion":"","actualizado":"","id":"acc-04"},
      {"grupo":"Herramientas internas","nombre":"Canvas (Sitio Web)","url":"https://tchequim.github.io/Canvas-Kyoto-Nissan/","observacion":"","actualizado":"","id":"acc-05"},
      {"grupo":"Herramientas internas","nombre":"Canvas (Sheets)","url":"https://docs.google.com/spreadsheets/d/1S5VR40TiBIncUkghQSg1hwpV806UiMq7G3Oyd_x6sK0/edit?gid=1143316186","observacion":"","actualizado":"","id":"acc-06"},
      {"grupo":"Herramientas internas","nombre":"Capacitacion interna Kyoto","url":"https://kyoto-evaluaciones.vercel.app/login","observacion":"","actualizado":"","id":"acc-07"},
      {"grupo":"Herramientas internas","nombre":"Cuadro de entregas","url":"https://docs.google.com/spreadsheets/d/1yjfQ8c1u5_U70Twa5zdbwOxE_gNhp1Or/edit?rtpof=true","observacion":"","actualizado":"","id":"acc-08"},
      {"grupo":"Herramientas internas","nombre":"Carpetas","url":"https://docs.google.com/spreadsheets/d/1FlWumHv-C3Q7MNrdicThNBF4jl0cdob-IbTZHLb_gq0/edit?gid=820767650","observacion":"","actualizado":"","id":"acc-09"},
      {"grupo":"Herramientas internas","nombre":"Mysteris","url":"https://docs.google.com/spreadsheets/d/1S-1LF1TWW14gm8q93jH463cGwWjJUwecagxxqXjw7v0/edit?gid=1203804187","observacion":"","actualizado":"","id":"acc-10"},
      {"grupo":"Herramientas internas","nombre":"Auditoria de Ordenes","url":"https://docs.google.com/spreadsheets/d/1p_hGmk3y39D8_M7p0hjIwJP-r7ufeuANVODfGzCKKO0/edit?gid=1544007904","observacion":"","actualizado":"","id":"acc-11"},
      {"grupo":"Herramientas internas","nombre":"Animacion de encuestas","url":"https://docs.google.com/spreadsheets/d/1HsioCzjpNQ2hh2YrAIHzp3JDsHdyWF31IhAuWeHBDDk/edit?usp=drive_web&ouid=109654619163256961129","observacion":"","actualizado":"","id":"acc-12"},
      {"grupo":"Herramientas internas","nombre":"Planes de acción","url":"https://docs.google.com/spreadsheets/d/1NJZnMSYQRkFr0W5NfOcIE8sXQLtBxDP4oxLiOHmSqzg/edit?gid=1095281162","observacion":"","actualizado":"","id":"acc-13"},
      {"grupo":"Herramientas internas","nombre":"Control CRM - Pilot (Sitio Web)","url":"https://script.google.com/macros/s/AKfycbwJ5h6eZdMZU5s56GZ4xr_509Ho5_z6GGQduI6JvRwObzXggp4pYN-Kw4-eK2-QK95Ufg/exec","observacion":"","actualizado":"","id":"acc-14"},
      {"grupo":"Herramientas internas","nombre":"Control CRM - Pilot (Google Sheets)","url":"https://docs.google.com/spreadsheets/d/17YFb5PvFzDU01Yr0l5iY3HEnzVSrRLcPsmJ8qrp7h-g/edit?gid=1622098482","observacion":"","actualizado":"","id":"acc-15"},
      {"grupo":"Herramientas internas","nombre":"Control temporal de CRM","url":"https://docs.google.com/spreadsheets/d/1ZsKkD1a8DrjiyXPTPNtQM2eGWGfQfAEtsIgkACPmp7c/edit?gid=0","observacion":"Corresponde desarrollar herramienta (uso de temporal para controles semanales)","actualizado":"","id":"acc-16"},
      {"grupo":"Herramientas internas","nombre":"Patentamiento (variable acceso Carolina)","url":"https://docs.google.com/spreadsheets/d/1ZIK47NQB9NcGNPCxEiYUnjhVpNX5UJlc/edit?usp=drive_web&ouid=109654619163256961129&rtpof=true","observacion":"","actualizado":"","id":"acc-17"},
      {"grupo":"Herramientas internas","nombre":"Indicadores de Calidad SERNISSAN","url":"https://docs.google.com/spreadsheets/d/1aNAX3dIPte_HePPtcIdO-YAyQcE6BX0bFt_Fn4yLiK0/edit?gid=1974360692","observacion":"","actualizado":"","id":"acc-18"},
      {"grupo":"Herramientas internas","nombre":"Registro de salon Resistencia","url":"https://docs.google.com/spreadsheets/d/1I9Koo5FGtyeJyigv7Z-FlZDXdvfHjckl5OCCCQRV8m0/edit?gid=56837991","observacion":"","actualizado":"","id":"acc-19"},
      {"grupo":"Herramientas internas","nombre":"Registro de salon Corrientes","url":"https://docs.google.com/spreadsheets/d/1WtuFg18Usy4W2DEsd1ZUMuX0zS1BeOl3wZ0GMOieAuY/edit?gid=1405813828","observacion":"","actualizado":"","id":"acc-20"},
      {"grupo":"Herramientas internas","nombre":"Registro de salon Posadas","url":"https://docs.google.com/spreadsheets/d/1ifp8-JnMHJp-9qnpCwWZCyzoMgq94Z8m/edit?gid=1434899758","observacion":"","actualizado":"","id":"acc-21"},
      {"grupo":"Herramientas internas","nombre":"Encuesta Pre entrega (Google Form)","url":"https://docs.google.com/forms/d/e/1FAIpQLSfOn6K9wafS2e4kamPDnR2kZzq5IMm40IyEr8uIDBwzhu2pew/viewform?pli=1","observacion":"","actualizado":"","id":"acc-22"},
      {"grupo":"Herramientas internas","nombre":"Encuesta Pre entrega (Google Sheets)","url":"https://docs.google.com/spreadsheets/d/1cIMOdH2uoK4YB_fQ8tinUzw70G2LrEqhsmHbFfZoTEY/edit?gid=1037667495","observacion":"","actualizado":"","id":"acc-23"},
      {"grupo":"Herramientas internas","nombre":"Gafetes (Canvas)","url":"https://www.canva.com/design/DAHLbNxVLTY/SaxGAIgVyU8oRiulDHeWBA/edit","observacion":"","actualizado":"","id":"acc-24"},
      {"grupo":"Herramientas internas","nombre":"Sharepoint CQ Nissan","url":"https://nissangroupnam.sharepoint.com/sites/NA_NNA_004976/CQ/Forms/AllItems.aspx?e=5%3Ace27c12d8b4b4c43aeaab692f90dd3f0&sharingv2=true&fromShare=true&at=9&CID=14629398-67ec-4b36-95e5-7791472a5e04&FolderCTID=0x01200001291DAA540B2B4888882A125C65A73E&id=%2Fsites%2FNA_NNA_004976%2FCQ%2FCQ+Red","observacion":"","actualizado":"","id":"acc-25"},
      {"grupo":"Herramientas internas","nombre":"SaleForce","url":"","observacion":"","actualizado":"","id":"acc-26"},
      {"grupo":"Herramientas internas","nombre":"Tasa de repuestas  y encuestas","url":"https://docs.google.com/spreadsheets/d/1HsioCzjpNQ2hh2YrAIHzp3JDsHdyWF31IhAuWeHBDDk/edit?gid=0","observacion":"","actualizado":"","id":"acc-27"},
      {"grupo":"Herramientas internas","nombre":"Sheets Auditoria de ordenes","url":"https://datastudio.google.com/u/0/reporting/6d5e8de4-6414-4bf7-bab0-60b5f9fda46f/page/Vwm1F","observacion":"","actualizado":"","id":"acc-28"},
      {"grupo":"Herramientas internas","nombre":"Formulario Google Form de Auditoria de OR","url":"https://docs.google.com/forms/u/2/d/11FVXxE1kwP1LHFKwq4kjc7zUqq3rs-KP9gVlIcPHYME/preview?edit_requested=true","observacion":"","actualizado":"Se ingresa con gmail de calidad","id":"acc-29"},
      {"grupo":"Herramientas internas","nombre":"Autocalibracion","url":"https://docs.google.com/spreadsheets/d/1Hs2q4Bfqwj9DsP9AXb7D3oRAONvzG2iJbyRDgir5aTs/edit?gid=462388748","observacion":"","actualizado":"","id":"acc-30"},
      {"grupo":"Herramientas internas","nombre":"Academia Kyoto","url":"https://docs.google.com/spreadsheets/d/1475cvQaG-ZsYvURFiQa6JJVpBANfy4jPtK3PsvKh5Vw/edit?gid=1109163823","observacion":"","actualizado":"","id":"acc-31"},
      {"grupo":"Herramientas internas","nombre":"Ciclo 14","url":"https://docs.google.com/spreadsheets/d/1uwW9jLeHxsQSmGUcFoEspgXi4ZZjv3HuWjlEGE9xFBw/edit?gid=674536743","observacion":"Carga Tobias/ Ojo con los integrales solo se cargo en Posventa el desvio","actualizado":"","id":"acc-32"},
      {"grupo":"Herramientas internas","nombre":"Control tareas (sheets)","url":"https://docs.google.com/spreadsheets/d/1uhinZNX-aug4FhDcyR8s9tViM5KXDZFnU8cNm9nQz-A/edit?gid=0","observacion":"","actualizado":"","id":"acc-33"},
      {"grupo":"Herramientas internas","nombre":"Control de tarea (app web)","url":"https://script.google.com/macros/s/AKfycby-ImOU61t7dOd_mU2tN5KG9IEi7s-WJA_Nw6dhqTREgAoWjyWizeaIvnwIRw-NGN3P/exec","observacion":"","actualizado":"","id":"acc-34"},
      {"grupo":"Aplicativos Nissan","nombre":"VOC","url":"https://routepesquisa.com.br/VOC_Latam/","observacion":"","actualizado":"","id":"acc-35"},
      {"grupo":"Aplicativos Nissan","nombre":"CAC","url":"https://nissan.my.site.com/CAC/login?ec=302&startURL=%2FCAC%2Fs%2F","observacion":"","actualizado":"","id":"acc-36"},
      {"grupo":"Aplicativos Nissan","nombre":"SaleForce","url":"https://nissan.my.site.com/login?ec=302&startURL=%2Fs%2F","observacion":"","actualizado":"","id":"acc-37"},
      {"grupo":"Aplicativos Nissan","nombre":"Nissan Home","url":"https://nsam-dealersalestool.na.nissancloud.com/dst-marketportal/api/v1/marketportal/market","observacion":"","actualizado":"","id":"acc-38"},
      {"grupo":"Aplicativos Nissan","nombre":"ND+","url":"","observacion":"se ingresa solo por tablet","actualizado":"","id":"acc-39"},
      {"grupo":"Aplicativos Nissan","nombre":"SharePoint","url":"https://nissangroupnam.sharepoint.com/sites/NA_NNA_004976/CQ/Forms/AllItems.aspx?id=%2Fsites%2FNA%5FNNA%5F004976%2FCQ%2FCQ%20Red%2FCampa%C3%B1a%20Una%20Experiencia%205%20Estrellas%2FEditables%20FY25%2FEDITABLES&viewid=45429cdc%2D2cda%2D49e7%2Db447%2D581e5507de1c&e=5%3Ace27c12d8b4b4c43aeaab692f90dd3f0&sharingv2=true&fromShare=true&at=9&CID=ae9dee73%2Dc4f9%2D4147%2Db437%2D4da35f3332c4&FolderCTID=0x01200001291DAA540B2B4888882A125C65A73E","observacion":"","actualizado":"","id":"acc-40"},
      {"grupo":"Aplicativos Nissan","nombre":"Academia","url":"https://academiasernissan.com/login/index.php","observacion":"","actualizado":"","id":"acc-41"},
      {"grupo":"Aplicativos Nissan","nombre":"SERNISSAN","url":"https://sernissan.com/login/?r=SHM0ZHVTSHlSN2RyOHRwSG1GNWRLQT09","observacion":"","actualizado":"","id":"acc-42"}
    ],
    proveedores: [
      { id: 'p-1', nombre: 'Librería Centro (ejemplo)', telefono: '3794 123456', contacto: 'Marta', nota: 'Entrega en el día' },
      { id: 'p-2', nombre: 'Gráfica Norte (ejemplo)', telefono: '3624 555111', contacto: '', nota: '' },
      { id: 'p-3', nombre: 'Uniformes del Litoral (ejemplo)', telefono: '3764 222333', contacto: 'Jorge', nota: 'Pedir talles con 10 días' },
      { id: 'p-4', nombre: 'Imprenta Rápida (ejemplo)', telefono: '3794 987654', contacto: '', nota: '' }
    ],
    compras: [
      { id: 'c-1', fecha: hace(40), proveedor_id: 'p-1', categoria: 'Librería', producto: 'Carpetas A4 con logo', cantidad: 200, precio_total: 180000, calificacion: 5, comentario: 'Muy buena terminación', area: 'Calidad', creado_por: quienDemo },
      { id: 'c-2', fecha: hace(12), proveedor_id: 'p-2', categoria: 'Calcomanías y gráfica', producto: 'Calcomanías para vehículos', cantidad: 300, precio_total: 95000, calificacion: 1, comentario: 'Salieron despegadas y con mala impresión', area: 'Calidad', creado_por: quienDemo },
      { id: 'c-3', fecha: hace(70), proveedor_id: 'p-4', categoria: 'Calcomanías y gráfica', producto: 'Calcomanías de servicio', cantidad: 200, precio_total: 70000, calificacion: 4, comentario: '', area: 'Calidad', creado_por: quienDemo },
      { id: 'c-4', fecha: hace(5), proveedor_id: 'p-3', categoria: 'Indumentaria', producto: 'Chombas para operarios', cantidad: 25, precio_total: 437500, calificacion: '', comentario: '', area: 'Calidad', creado_por: quienDemo }
    ],
    noVolver: [
      { id: 'n-1', proveedor_id: 'p-2', categoria: 'Calcomanías y gráfica', motivo: 'Calcomanías de mala calidad: se despegaron', fecha: hace(11), creado_por: quienDemo }
    ],
    problemas: [
      { id: 'm-1', sucursal: 'Corrientes', descripcion: 'Pérdida de agua en el baño de clientes', criticidad: 'Urgente', area_aviso: 'Posventa', fecha_aviso: hace(6), fecha_alta: '', solucionado: 'No', fecha_solucion: '', referencia_id: '', observaciones: '', creado_por: quienDemo },
      { id: 'm-2', sucursal: 'Resistencia', descripcion: 'Aire acondicionado del salón no enfría', criticidad: 'Urgente', area_aviso: 'Ventas Convencional', fecha_aviso: hace(9), fecha_alta: hace(8), solucionado: 'No', fecha_solucion: '', referencia_id: '', observaciones: '', creado_por: quienDemo },
      { id: 'm-3', sucursal: 'Posadas', descripcion: 'Luminaria quemada en el sector de entregas', criticidad: 'Media', area_aviso: 'Calidad', fecha_aviso: hace(15), fecha_alta: hace(14), solucionado: 'No', fecha_solucion: '', referencia_id: '', observaciones: '', creado_por: quienDemo },
      { id: 'm-4', sucursal: 'Corrientes', descripcion: 'Puerta de vidrio del ingreso traba', criticidad: 'Baja', area_aviso: 'Administración', fecha_aviso: hace(20), fecha_alta: hace(18), solucionado: 'No', fecha_solucion: '', referencia_id: '', observaciones: '', creado_por: quienDemo },
      { id: 'm-5', sucursal: 'Resistencia', descripcion: 'Dispenser de agua del lounge sin funcionar', criticidad: 'Media', area_aviso: 'RRHH', fecha_aviso: hace(25), fecha_alta: hace(24), solucionado: 'Sí', fecha_solucion: hace(19), referencia_id: '', observaciones: '', creado_por: quienDemo },
      { id: 'm-6', sucursal: 'Posadas', descripcion: 'Goteras en el taller', criticidad: 'Urgente', area_aviso: 'Posventa', fecha_aviso: hace(12), fecha_alta: hace(11), solucionado: 'Sí', fecha_solucion: hace(4), referencia_id: '', observaciones: '', creado_por: quienDemo }
    ],
    avisos: [
      { id: 'a-1', problema_id: 'm-1', area: 'Ventas Convencional', fecha: hace(5), creado_por: quienDemo },
      { id: 'a-2', problema_id: 'm-2', area: 'Ventas Plan de Ahorro', fecha: hace(9), creado_por: quienDemo }
    ]
  };

  function copia(o) { return JSON.parse(JSON.stringify(o)); }
  function firma(q) { return q.nombre + ' (' + q.area + ')'; }
  function upsert(lista, id, campos, quien) {
    var i = lista.findIndex(function (x) { return x.id === id; });
    if (i >= 0) { Object.assign(lista[i], campos); return lista[i]; }
    var nuevo = Object.assign({ id: id || ('d-' + Date.now()), creado_por: firma(quien) }, campos);
    lista.push(nuevo);
    return nuevo;
  }
  function falta(v, msg) { if (v === undefined || v === null || String(v).trim() === '') throw new Error(msg); }

  var acciones = {
    guardarAcceso: function (d, q) {
      falta(d.nombre, 'Falta el nombre del acceso');
      if (d.url && !/^https?:\/\//i.test(d.url)) throw new Error('El link tiene que empezar con http:// o https://');
      return upsert(datos.accesos, d.id, { grupo: d.grupo, nombre: d.nombre, url: d.url || '', observacion: d.observacion || '',
        actualizado: d.grupo === 'Herramientas internas' ? hace(0) : '' }, q);
    },
    guardarProveedor: function (d, q) {
      falta(d.nombre, 'Falta el nombre del proveedor'); falta(d.telefono, 'Falta el teléfono del proveedor');
      var dup = datos.proveedores.find(function (p) { return p.id !== d.id && Logica.normalizar(p.nombre) === Logica.normalizar(d.nombre); });
      if (dup) throw new Error('Ya existe el proveedor "' + dup.nombre + '"');
      return upsert(datos.proveedores, d.id, { nombre: d.nombre, telefono: d.telefono, contacto: d.contacto || '', nota: d.nota || '' }, q);
    },
    guardarCompra: function (d, q) {
      falta(d.producto, 'Falta el producto');
      if (!(Number(d.cantidad) > 0)) throw new Error('La cantidad tiene que ser mayor a 0');
      if (d.precio_total === '' || d.precio_total === null || Number(d.precio_total) < 0) throw new Error('El precio total tiene que ser un número mayor o igual a 0');
      var prov;
      if (d.proveedor_nuevo) {
        var pn = d.proveedor_nuevo;
        falta(pn.nombre, 'Falta el nombre del proveedor');
        prov = datos.proveedores.find(function (p) { return Logica.normalizar(p.nombre) === Logica.normalizar(pn.nombre); });
        if (prov) {
          var tels = prov.telefono.split(' / ');
          if (pn.telefono && tels.indexOf(pn.telefono) < 0) prov.telefono = tels.concat(pn.telefono).join(' / ');
        } else prov = acciones.guardarProveedor(pn, q);
      } else {
        prov = datos.proveedores.find(function (p) { return p.id === d.proveedor_id; });
        if (!prov) throw new Error('El proveedor elegido no existe');
      }
      var compra = upsert(datos.compras, d.id, { fecha: d.fecha, proveedor_id: prov.id, categoria: d.categoria, producto: d.producto,
        cantidad: Number(d.cantidad), precio_total: Number(d.precio_total), calificacion: d.calificacion === '' ? '' : Number(d.calificacion),
        comentario: d.comentario || '', area: q.area }, q);
      return { compra: compra, proveedor: prov };
    },
    guardarNoVolver: function (d, q) {
      falta(d.motivo, 'Falta el motivo de "No volver a comprar"');
      var previo = datos.noVolver.find(function (n) { return n.proveedor_id === d.proveedor_id && n.categoria === d.categoria; });
      return upsert(datos.noVolver, previo ? previo.id : d.id, { proveedor_id: d.proveedor_id, categoria: d.categoria, motivo: d.motivo, fecha: hace(0) }, q);
    },
    guardarProblema: function (d, q) {
      falta(d.sucursal, 'Elegí la sucursal'); falta(d.descripcion, 'Falta la descripción del problema');
      if (d.fecha_alta && d.fecha_alta < d.fecha_aviso) throw new Error('La fecha de alta no puede ser anterior al aviso');
      var sol = d.solucionado === 'Sí';
      var fs = sol ? (d.fecha_solucion || hace(0)) : '';
      if (sol && fs < d.fecha_aviso) throw new Error('La fecha de solución no puede ser anterior al aviso');
      return upsert(datos.problemas, d.id, { sucursal: d.sucursal, descripcion: d.descripcion, criticidad: d.criticidad, area_aviso: d.area_aviso,
        fecha_aviso: d.fecha_aviso, fecha_alta: d.fecha_alta || '', solucionado: sol ? 'Sí' : 'No', fecha_solucion: fs,
        referencia_id: d.referencia_id || '', observaciones: d.observaciones || '' }, q);
    },
    sumarAviso: function (d, q) {
      var previo = datos.avisos.find(function (a) { return a.id === d.id; });
      if (previo) return previo;
      return upsert(datos.avisos, d.id, { problema_id: d.problema_id, area: d.area, fecha: d.fecha }, q);
    },
    anular: function (d) {
      var mapa = { accesos: 'accesos', proveedores: 'proveedores', compras: 'compras', noVolver: 'noVolver', problemas: 'problemas', avisos: 'avisos' };
      var lista = datos[mapa[d.tabla]];
      var i = lista ? lista.findIndex(function (x) { return x.id === d.id; }) : -1;
      if (i < 0) throw new Error('No se encontró el registro a anular');
      lista.splice(i, 1);
      return { id: d.id, anulado: 'Sí' };
    }
  };

  function demora(v) { return new Promise(function (res) { setTimeout(function () { res(v); }, 350); }); }

  return {
    cargar: function () { return demora(copia(datos)); },
    guardar: function (accion, d, quien) {
      return demora().then(function () {
        if (!acciones[accion]) throw new Error('Acción desconocida: ' + accion);
        return copia(acciones[accion](copia(d), quien));
      });
    }
  };
})();

(function () {
  'use strict';

  /* ===== Configuración ===== */
  var CFG = window.NOOVA_CONFIG || {};   // se edita en assets/js/config.js
  var NOOVA_WHATSAPP = CFG.whatsapp || '';
  var REGISTRO_ENDPOINT = CFG.registroEndpoint || '';

  var raiz = document.querySelector('.nc');
  if (!raiz) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cada = function (lista, fn) { Array.prototype.forEach.call(lista, fn); };

  /* ===== Demo: escena y automatización ===== */
  var demo = raiz.querySelector('[data-demo]');
  var vivo = raiz.querySelector('[data-live]');
  if (demo) {
    var tabs = Array.prototype.slice.call(demo.querySelectorAll('[role="tab"]'));
    var paneles = Array.prototype.slice.call(demo.querySelectorAll('[role="tabpanel"]'));
    var tiempos = [];
    var limpiar = function () { tiempos.forEach(clearTimeout); tiempos = []; };

    var reiniciar = function (panel) {
      var items = panel.querySelectorAll('[data-antes]');
      cada(items, function (li) {
        li.classList.remove('is-on', 'is-just');
        li.querySelector('.nc-estado').textContent = li.getAttribute('data-antes');
      });
      panel.querySelector('.nc-lista').style.setProperty('--p', '0');
      panel.querySelector('[data-cuenta]').textContent = items.length + ' acciones';
      panel.querySelector('[data-run]').disabled = false;
    };

    var ejecutar = function (panel) {
      limpiar();
      reiniciar(panel);
      var items = Array.prototype.slice.call(panel.querySelectorAll('[data-antes]'));
      var lista = panel.querySelector('.nc-lista');
      var cuenta = panel.querySelector('[data-cuenta]');
      var boton = panel.querySelector('[data-run]');
      var hecho = panel.getAttribute('data-hecho');
      boton.disabled = true;
      items.forEach(function (li, i) {
        tiempos.push(setTimeout(function () {
          li.classList.add('is-on');
          li.querySelector('.nc-estado').textContent = li.getAttribute('data-despues');
          if (!reduce) {
            li.classList.remove('is-just');
            void li.offsetWidth;
            li.classList.add('is-just');
          }
          lista.style.setProperty('--p', items.length > 1 ? String(i / (items.length - 1)) : '1');
          if (i < items.length - 1) {
            cuenta.textContent = 'Ejecutando ' + (i + 1) + ' de ' + items.length;
          } else {
            cuenta.textContent = hecho;
            boton.disabled = false;
            if (vivo) {
              vivo.textContent = hecho + ': ' + items.map(function (x) {
                return x.querySelector('.nc-disp').textContent + ', ' + x.getAttribute('data-despues').toLowerCase();
              }).join('; ') + '.';
            }
          }
        }, reduce ? 0 : 260 + 560 * i));
      });
    };

    var elegir = function (tab, correr) {
      tabs.forEach(function (t) {
        var activo = t === tab;
        t.setAttribute('aria-selected', activo ? 'true' : 'false');
        t.tabIndex = activo ? 0 : -1;
      });
      var id = tab.getAttribute('aria-controls');
      paneles.forEach(function (p) { p.hidden = p.id !== id; });
      var panel = document.getElementById(id);
      limpiar();
      if (correr) ejecutar(panel); else reiniciar(panel);
    };

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        if (tab.getAttribute('aria-selected') !== 'true') elegir(tab, true);
      });
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var sig = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
        sig.focus();
        elegir(sig, true);
      });
    });

    paneles.forEach(function (p) {
      p.querySelector('[data-run]').addEventListener('click', function () { ejecutar(p); });
    });

    // La escena se ejecuta sola una vez, cuando la tarjeta aparece en pantalla
    if (!reduce && 'IntersectionObserver' in window) {
      var vista = new IntersectionObserver(function (entradas) {
        if (!entradas[0].isIntersecting) return;
        vista.disconnect();
        var activo = paneles.filter(function (p) { return !p.hidden; })[0];
        tiempos.push(setTimeout(function () { ejecutar(activo); }, 450));
      }, { threshold: 0.55 });
      vista.observe(demo.querySelector('.nc-demo-card'));
    }
  }

  /* ===== Botón fijo en celular ===== */
  var fijo = raiz.querySelector('[data-sticky]');
  if (fijo && 'IntersectionObserver' in window) {
    var visibles = {};
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) { visibles[en.target.getAttribute('data-oculta-sticky')] = en.isIntersecting; });
      var mostrar = !Object.keys(visibles).some(function (k) { return visibles[k]; });
      fijo.classList.toggle('is-on', mostrar);
    });
    cada(raiz.querySelectorAll('[data-oculta-sticky]'), function (el) { observador.observe(el); });
  }

  /* ===== Formulario de interesados ===== */
  var form = raiz.querySelector('[data-form]');
  var exito = raiz.querySelector('[data-exito]');
  if (form && exito) {
    var reglas = {
      'nc-nombre': function (el) { return el.value.trim().length >= 3; },
      'nc-whatsapp': function (el) { var d = el.value.replace(/\D/g, ''); return d.length >= 10 && d.length <= 13; },
      'nc-ciudad': function (el) { return el.value.trim().length >= 2; },
      'nc-oficio': function (el) { return el.value !== ''; },
      'nc-autorizo': function (el) { return el.checked; }
    };
    var marcar = function (el, ok) {
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      var err = document.getElementById(el.id + '-error');
      if (err) err.hidden = ok;
    };
    Object.keys(reglas).forEach(function (id) {
      var el = document.getElementById(id);
      var evento = (el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'input';
      el.addEventListener(evento, function () {
        if (el.getAttribute('aria-invalid') === 'true') marcar(el, reglas[id](el));
      });
    });

    var linkWa = exito.querySelector('[data-wa]');
    var bloqueNormal = exito.querySelector('[data-normal]');
    var bloqueAviso = exito.querySelector('[data-aviso]');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var primero = null;
      Object.keys(reglas).forEach(function (id) {
        var el = document.getElementById(id);
        var ok = reglas[id](el);
        marcar(el, ok);
        if (!ok && !primero) primero = el;
      });
      if (primero) { primero.focus(); return; }

      var horario = form.querySelector('input[name="horario"]:checked');
      var datos = {
        nombre: form.nombre.value.trim(),
        whatsapp: form.whatsapp.value.trim(),
        ciudad: form.ciudad.value.trim(),
        oficio: form.oficio.value,
        horario: horario ? horario.value : '',
        curso: 'Curso de Domótica presencial',
        fecha: new Date().toISOString(),
        pagina: location.href
      };
      var lineas = [
        'Hola, NOOVA Academy. Quiero registrarme como interesado en el Curso de Domótica.',
        '',
        'Nombre: ' + datos.nombre,
        'WhatsApp: ' + datos.whatsapp,
        'Ciudad: ' + datos.ciudad,
        'Me dedico a: ' + datos.oficio
      ];
      if (datos.horario) lineas.push('Horario preferido: ' + datos.horario);
      var mensaje = lineas.join('\n');
      var numeroListo = /^\d{8,15}$/.test(NOOVA_WHATSAPP);
      var url = 'https://wa.me/' + NOOVA_WHATSAPP + '?text=' + encodeURIComponent(mensaje);

      // Registro opcional en un servidor propio
      if (REGISTRO_ENDPOINT) {
        try {
          var cuerpo = JSON.stringify(datos);
          if (navigator.sendBeacon) navigator.sendBeacon(REGISTRO_ENDPOINT, new Blob([cuerpo], { type: 'text/plain;charset=UTF-8' }));
          else fetch(REGISTRO_ENDPOINT, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: cuerpo });
        } catch (err) {}
      }
      // Analítica, si está instalada en el sitio
      try {
        if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
        if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead');
      } catch (err) {}
      try { raiz.dispatchEvent(new CustomEvent('nc:registro', { bubbles: true, detail: datos })); } catch (err) {}

      bloqueNormal.hidden = !numeroListo;
      bloqueAviso.hidden = numeroListo;
      linkWa.hidden = !numeroListo;
      if (numeroListo) linkWa.href = url;
      else exito.querySelector('[data-mensaje]').textContent = mensaje;
      form.hidden = true;
      exito.hidden = false;
      exito.focus({ preventScroll: true });
      exito.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });

      if (numeroListo) {
        var ventana = window.open(url, '_blank');
        if (ventana) { try { ventana.opener = null; } catch (err) {} }
        else { window.location.href = url; }
      }
    });

    exito.querySelector('[data-volver]').addEventListener('click', function () {
      exito.hidden = true;
      form.hidden = false;
      document.getElementById('nc-nombre').focus();
    });
  }
})();

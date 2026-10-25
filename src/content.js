(function () {
  'use strict';
  if (globalThis.DHLAddressHelperStarted) return;
  globalThis.DHLAddressHelperStarted = true;
  let host, active, pending = false, cartHost, cartStatus, cartInput;
  const storageKey = 'dhl-address-helper-reference';
  let reference = '';
  try { reference = sessionStorage.getItem(storageKey) || ''; } catch {}
  function remember(text) {
    reference = text;
    try { if (text) sessionStorage.setItem(storageKey, text); else sessionStorage.removeItem(storageKey); } catch {}
  }
  function refreshCart() {
    const isCart = new URL(location.href).searchParams.get('type') === 'ShoppingCart';
    if (!isCart) { cartHost?.remove(); cartHost = null; return; }
    if (!cartHost?.isConnected) {
      cartHost = document.createElement('dhl-address-cart-helper');
      const shadow = cartHost.attachShadow({mode: 'closed'});
      shadow.innerHTML = `<style>${css}</style><div class="panel"><label for="reference">Originaltext der Empf\u00e4ngeradresse</label><textarea id="reference" readonly aria-label="Urspr\u00fcnglich eingegebener Adresstext"></textarea><p>Zum manuellen Vergleich mit dem Empf\u00e4nger im Warenkorb. Der Text bleibt nur f\u00fcr diesen Tab gespeichert.</p><button type="button">Originaltext l\u00f6schen</button><p role="status" aria-live="polite"></p></div>`;
      cartInput = shadow.querySelector('textarea');
      cartStatus = shadow.querySelector('[role=status]');
      const notice = document.createElement('p');
      notice.textContent = 'Paketadresshelfer · Unabhängiges privates Projekt. Nicht von DHL entwickelt oder unterstützt.';
      shadow.querySelector('.panel').prepend(notice);
      shadow.querySelector('button').addEventListener('click', () => { remember(''); refreshCart(); });
      (document.getElementById('versenden-react-root') || document.querySelector('main') || document.body).prepend(cartHost);
    }
    if (cartInput.value !== reference) cartInput.value = reference;
    const message = reference ? '' : 'Noch kein Originaltext vorhanden. Bitte die Adresse zuerst mit dem Adresshelfer im Formular \u00fcbernehmen.';
    if (cartStatus.textContent !== message) cartStatus.textContent = message;
  }
  // Inline stylesheet keeps the isolated shadow UI independent of site CSS.
  const css = ':host{display:block;margin:16px 0;color:#222;font:14px/1.45 Arial,sans-serif}*{box-sizing:border-box}.panel{padding:16px;border:1px solid #b8c9df;border-top:4px solid #245a91;background:#f1f6fc;border-radius:6px}label{display:block;font-weight:bold;margin-bottom:8px}textarea{display:block;width:100%;min-height:100px;padding:9px;font:inherit;color:#222;background:white}button{margin-top:10px;padding:10px 16px;border:0;border-radius:3px;background:#245a91;color:white;cursor:pointer;font-weight:bold}p{margin:8px 0 0}button:focus-visible,textarea:focus-visible{outline:3px solid #1559b7;outline-offset:2px}';
  function refresh() {
    pending = false;
    refreshCart();
    const found = DHLFormDetector.detect(document, globalThis.DHLAddressConfig || {}, {forDisplay: true});
    if (!found) { host?.remove(); host = null; active = null; return; }
    active = found;
    if (host?.isConnected && host.parentElement === found.scope) return;
    host?.remove();
    host = document.createElement('dhl-address-helper');
    const shadow = host.attachShadow({mode: 'closed'});
    // Visible attribution distinguishes this private project from the shipping provider.
    shadow.innerHTML = `<style>${css}</style><div class="panel"><label for="address">Empfängeradresse übernehmen</label><textarea id="address" placeholder="Max Mustermann&#10;Musterstraße 15a&#10;12345 Musterstadt" autocomplete="off" spellcheck="false"></textarea><button type="button">Adresse übernehmen</button><p>Nur Name, Straße, Hausnummer und PLZ. Bitte das Ergebnis prüfen.</p><p role="status" aria-live="polite"></p></div>`;
    const textarea = shadow.querySelector('textarea'), status = shadow.querySelector('[role=status]');
    const projectNotice = document.createElement('p');
    projectNotice.textContent = 'Paketadresshelfer · Unabhängiges privates Projekt. Nicht von DHL entwickelt oder unterstützt.';
    shadow.querySelector('.panel').prepend(projectNotice);
    textarea.value = reference;
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.textContent = 'Text und Empfängeradresse löschen';
    clearButton.style.marginLeft = '12px';
    shadow.querySelector('button').after(clearButton);
    clearButton.addEventListener('click', () => {
      textarea.value = '';
      remember('');
      try {
        DHLFormFiller.clear(active);
        status.textContent = 'Originaltext und Empfängername, Straße, Hausnummer, PLZ und Wohnort wurden geleert.';
      } catch (error) { status.textContent = 'Originaltext gelöscht. ' + error.message; }
      DHLFormFiller.focusPostalCode();
    });
    shadow.querySelector('button').addEventListener('click', () => {
      try {
        const address = DHLAddressParser.parseAddress(textarea.value);
        if (Object.values(active.fields).some(field => field.disabled || field.readOnly)) {
          status.textContent = 'DHL hat noch Adressfelder gesperrt. Bitte zuerst PLZ und Wohnort im DHL-Formular prüfen bzw. auswählen und danach erneut Adresse übernehmen anklicken.';
          DHLFormFiller.focusPostalCode();
          return;
        }
        DHLFormFiller.fill(active, address);
        remember(textarea.value);
        status.textContent = 'Adresse übernommen. Bitte die Felder und die Ortsbestimmung durch DHL prüfen.';
      } catch (error) { status.textContent = error.message; }
    });
    const legend = found.scope.querySelector(':scope > legend');
    if (legend) legend.after(host); else found.scope.prepend(host);
  }
  function schedule() {
    if (!pending) { pending = true; setTimeout(refresh, 200); }
  }
  new MutationObserver(schedule).observe(document.documentElement, {childList: true, subtree: true, attributes: true, attributeFilter: ['name', 'autocomplete', 'aria-label', 'aria-labelledby', 'disabled', 'readonly', 'hidden', 'class', 'style'], characterData: true});
  addEventListener('popstate', schedule);
  addEventListener('hashchange', schedule);
  addEventListener('pageshow', schedule);
  refresh();
})();

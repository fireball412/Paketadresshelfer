(function (root) {
  'use strict';
  let cancelPendingFocus;
  function focusPostalCode(doc = root.document) {
    cancelPendingFocus?.();
    const initialUrl = root.location?.href;
    function attempt() {
      if (root.location?.href !== initialUrl) return false;
      // Other address fields may briefly disappear while DHL renders an update.
      const exact = doc?.querySelectorAll?.('[id="address.receiver.plz"]');
      const postalField = exact?.length === 1 ? exact[0] : root.DHLFormDetector.detect(doc, root.DHLAddressConfig || {}, {forDisplay: true})?.fields.postalCode;
      if (!postalField || !postalField.isConnected || postalField.disabled || postalField.readOnly || (postalField.getClientRects && !postalField.getClientRects().length)) return false;
      if (doc?.activeElement !== postalField) {
        postalField.scrollIntoView?.({block: 'center', inline: 'nearest', behavior: 'instant'});
        postalField.focus();
        postalField.click();
      }
      return !doc || doc.activeElement === postalField;
    }
    const focused = attempt();
    if (!doc?.addEventListener || !root.setTimeout) return focused;
    // DHL can replace the focused input after its asynchronous postcode lookup.
    // Retry briefly, but never take focus back after the user starts interacting.
    const timers = [];
    const cancel = () => {
      timers.forEach(timer => root.clearTimeout(timer));
      doc.removeEventListener('pointerdown', onInteraction, true);
      doc.removeEventListener('keydown', onInteraction, true);
      if (cancelPendingFocus === cancel) cancelPendingFocus = null;
    };
    const onInteraction = event => { if (event.isTrusted) cancel(); };
    cancelPendingFocus = cancel;
    doc.addEventListener('pointerdown', onInteraction, true);
    doc.addEventListener('keydown', onInteraction, true);
    for (const delay of [100, 300, 700, 1400]) timers.push(root.setTimeout(() => {
      if (root.location?.href !== initialUrl) { cancel(); return; }
      attempt();
      if (delay === 1400) cancel();
    }, delay));
    return true;
  }
  function fill(target, address) {
    const current = root.DHLFormDetector.detect();
    const keys = target ? Object.keys(target.fields) : [];
    const allowed = target?.fields.fullName ? ['fullName', 'street', 'houseNumber', 'postalCode'] : ['firstName', 'lastName', 'street', 'houseNumber', 'postalCode'];
    if (!current || keys.length !== allowed.length || !allowed.every(k => keys.includes(k) && current.fields[k] === target.fields[k]) || Object.keys(current.fields).length !== keys.length) throw new Error('Das Formular hat sich geändert oder ist nicht eindeutig. Bitte erneut versuchen.');
    const values = {...address, fullName: `${address.firstName || ''} ${address.lastName || ''}`.trim()};
    if (!address.firstName || !address.lastName || !keys.every(k => typeof values[k] === 'string' && values[k])) throw new Error('Die Adresse ist unvollständig.');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    for (const key of keys) {
      const field = target.fields[key];
      if (!field.isConnected || field.disabled || field.readOnly) throw new Error('Das Formular wurde während der Übernahme geändert. Bitte die Felder prüfen.');
      setter.call(field, values[key]);
      field.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
      field.dispatchEvent(new Event('change', {bubbles: true}));
      field.dispatchEvent(new FocusEvent('blur', {bubbles: false}));
      field.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
    }
    if (!focusPostalCode()) throw new Error('Adresse übernommen. Das PLZ-Feld ist nicht mehr erreichbar; bitte manuell prüfen.');
  }
  function clear(target, doc = document) {
    const current = root.DHLFormDetector.detect(doc, root.DHLAddressConfig || {}, {forDisplay: true});
    const keys = target ? Object.keys(target.fields) : [];
    if (!current || !keys.length || !keys.every(key => current.fields[key] === target.fields[key])) throw new Error('Das Empfängerformular hat sich geändert. Bitte erneut versuchen.');
    // The shared DHL container also contains sender fields: use only exact receiver IDs.
    const cityMatches = [...doc.querySelectorAll('[id="address.receiver.city"]')];
    if (cityMatches.length !== 1 || !current.scope.contains(cityMatches[0])) throw new Error('Das Empfänger-Wohnortfeld ist nicht eindeutig erkennbar. Es wurde nichts gelöscht.');
    const fields = [...Object.values(current.fields).filter(field => field !== current.fields.postalCode), cityMatches[0], current.fields.postalCode];
    if (fields.some(field => !field?.isConnected)) throw new Error('Das Empfängerformular ist nicht mehr erreichbar.');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    for (const field of fields) {
      if (!field.isConnected) throw new Error('Das Formular wurde beim Leeren geändert. Bitte die Empfängerfelder prüfen.');
      // Clearing is explicitly allowed for DHL's temporarily disabled address fields.
      setter.call(field, '');
      field.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
      field.dispatchEvent(new Event('change', {bubbles: true}));
      field.dispatchEvent(new FocusEvent('blur', {bubbles: false}));
      field.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
    }
    if (fields.some(field => field.value !== '')) throw new Error('DHL hat einzelne Empfängerwerte wiederhergestellt. Bitte die Felder prüfen.');
  }
  root.DHLFormFiller = {fill, clear, focusPostalCode};
})(globalThis);

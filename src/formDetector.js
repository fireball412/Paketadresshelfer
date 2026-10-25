(function (root) {
  'use strict';
  const keys = ['firstName', 'lastName', 'street', 'houseNumber', 'postalCode'];
  const patterns = {
    fullName: /^(vor und nachname|vollständiger name|full name|fullname|name)$/,
    firstName: /^(vorname|first name|firstname|given name)$/,
    lastName: /^(nachname|familienname|last name|lastname|surname|family name)$/,
    street: /^(straße|strasse|street|street name|streetname|address line1)$/,
    houseNumber: /^(hausnummer|hausnr|house number|housenumber|street number)$/,
    postalCode: /^(postleitzahl|plz|postal code|postalcode|zip|zip code)$/
  };
  const autocomplete = {fullName: 'name', firstName: 'given-name', lastName: 'family-name', postalCode: 'postal-code'};
  const normalize = s => s.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().replace(/[_:.*-]/g, ' ').replace(/\s+/g, ' ').trim();
  const inputs = (scope, options) => [...scope.querySelectorAll('input')].filter(el => (options.forDisplay || (!el.disabled && !el.readOnly)) && ['text', 'search', 'tel', 'number'].includes(el.type) && el.getClientRects().length);
  const hints = el => [el.name, el.getAttribute('aria-label'), ...[...(el.labels || [])].map(l => l.textContent)].filter(Boolean).map(normalize);
  function mapScope(scope, config, options = {}) {
    const candidates = inputs(scope, options), fields = {};
    const combined = config.nameMode === 'combined' || (config.nameMode !== 'separate' && candidates.some(el => hints(el).some(s => patterns.fullName.test(s)) || el.autocomplete === 'name'));
    const selectedKeys = combined ? ['fullName', 'street', 'houseNumber', 'postalCode'] : keys;
    for (const key of selectedKeys) {
      let matches;
      if (config.fields?.[key]) matches = [...scope.querySelectorAll(config.fields[key])].filter(el => candidates.includes(el));
      else matches = candidates.filter(el => hints(el).some(s => patterns[key].test(s)) || (autocomplete[key] && el.autocomplete.split(/\s+/).includes(autocomplete[key])));
      if (matches.length !== 1) return null;
      fields[key] = matches[0];
    }
    if (new Set(Object.values(fields)).size !== selectedKeys.length) return null;
    // Explicit mappings must also never select a field described as the city.
    if (Object.values(fields).some(el => /address-level2/.test(el.autocomplete) || hints(el).some(s => /^(ort|wohnort|stadt|city|town)$/.test(s)))) return null;
    return {scope, fields};
  }
  function detect(doc = document, config = root.DHLAddressConfig || {}, options = {}) {
    try {
      // IDs observed on the actual DHL recipient form, 2026-10-25.
      // Never use sender fields or infer a name field from an arbitrary input.
      if (!config.recipientScope && config.dhlCombinedProfile !== false) {
        const selectors = {fullName: '[id="address.receiver.name2"]', street: '[id="address.receiver.street"]', houseNumber: '[id="address.receiver.streetNumber"]', postalCode: '[id="address.receiver.plz"]'};
        const matches = Object.fromEntries(Object.entries(selectors).map(([key, selector]) => [key, [...doc.querySelectorAll(selector)]]));
        if (Object.values(matches).every(list => list.length === 1)) {
          let scope = matches.fullName[0].parentElement;
          while (scope && !Object.values(matches).every(list => scope.contains(list[0]))) scope = scope.parentElement;
          // DHL puts both address blocks in one container. Exact receiver IDs
          // keep the mapping safe even when sender inputs share this ancestor.
          if (scope) {
            const result = mapScope(scope, {nameMode: 'combined', fields: selectors}, options);
            if (result) return result;
          }
        }
      }
      const scopes = config.recipientScope ? [...doc.querySelectorAll(config.recipientScope)] : [...doc.querySelectorAll('fieldset, section, [role="group"], form')].filter(el => {
        const heading = el.querySelector(':scope > legend, :scope > h1, :scope > h2, :scope > h3, :scope > h4');
        const label = el.getAttribute('aria-label') || (el.getAttribute('aria-labelledby') || '').split(/\s+/).map(id => doc.getElementById(id)?.textContent || '').join(' ') || heading?.textContent || '';
        return /empfänger|empfaenger|recipient/i.test(label) && !/absender|sender/i.test(label);
      });
      const results = scopes.map(scope => mapScope(scope, config, options)).filter(Boolean);
      const unique = results.filter((r, i) => results.findIndex(other => Object.keys(r.fields).length === Object.keys(other.fields).length && Object.keys(r.fields).every(k => r.fields[k] === other.fields[k])) === i);
      return unique.length === 1 ? unique[0] : null;
    } catch { return null; }
  }
  function diagnose(doc = document) {
    // Keine values, IDs, Namen, Labels oder sonstigen freien Seitentexte ausgeben.
    return [...doc.querySelectorAll('input')].map((el, index) => ({
      index, type: el.type, visible: !!el.getClientRects().length,
      disabled: el.disabled, readOnly: el.readOnly,
      recognizedRoles: ['fullName', ...keys].filter(key => hints(el).some(s => patterns[key].test(s)) || (autocomplete[key] && el.autocomplete.split(/\s+/).includes(autocomplete[key]))),
      hasName: !!el.name, hasLabel: !!el.labels?.length, hasAriaLabel: el.hasAttribute('aria-label')
    }));
  }
  root.DHLFormDetector = {detect, diagnose, keys};
})(globalThis);

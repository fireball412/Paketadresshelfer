(function (root) {
  'use strict';
  const fail = message => { throw new Error(message); };
  const capitalizeInitial = value => value.replace(/\p{L}/u, letter => letter.toLocaleUpperCase('de-DE'));
  function parseAddress(input) {
    if (typeof input !== 'string' || input.length > 2000) fail('Bitte eine kurze, vollständige Empfängeradresse eingeben.');
    const lines = input.normalize('NFC').trim().split(/\r?\n|\r|;/).map(s => s.trim()).filter(Boolean);
    while (lines.length && /^(deutschland|germany|de)$/i.test(lines.at(-1))) lines.pop();
    let parts = lines;
    if (lines.length === 1) {
      parts = lines[0].split(',').map(s => s.trim());
      if (parts.length === 4) parts = [parts[0] + ', ' + parts[1], ...parts.slice(2)];
    }
    if (parts.length !== 3) fail('Bitte Name, Straße mit Hausnummer und PLZ mit Ort in drei Zeilen angeben. Firmen und Adresszusätze bitte separat prüfen.');
    const postal = parts[2].match(/^(?:D\s*-\s*)?(\d{5})\s+([\p{L}][\p{L}\p{M}\s.'()/-]*?)(?:\s*,\s*(?:Deutschland|Germany))?$/iu);
    if (!postal || postal[1] === '00000') fail('Bitte eine fünfstellige deutsche PLZ mit Ort angeben.');
    const number = '(\\d{1,4}(?:\\s?[a-zA-Z])?(?:\\s?[-/]\\s?\\d{1,4}(?:\\s?[a-zA-Z])?)?)';
    const streetText = '([\\p{L}][\\p{L}\\p{M}\\d .’\u0027-]*[\\p{L}.])';
    let street = parts[1].match(new RegExp('^' + streetText + '\\s+' + number + '$', 'u'));
    let streetName, houseNumber;
    if (street) [, streetName, houseNumber] = street;
    else {
      street = parts[1].match(new RegExp('^' + number + '\\s+' + streetText + '$', 'u'));
      if (street) [, houseNumber, streetName] = street;
    }
    if (!street || /^(postfach|packstation|poststation|filiale)\b/i.test(streetName)) fail('Straße und Hausnummer sind nicht eindeutig erkennbar (z. B. Musterstraße 15a).');
    const name = parts[0].replace(/\s+/g, ' ').trim();
    if (!/^[\p{L}\p{M} .’',-]+$/u.test(name) || /\b(herrn?|frau|familie|firma|gmbh|c\/o|dr|prof)\b/i.test(name)) fail('Bitte ausschließlich Vor- und Nachnamen ohne Anrede, Titel oder Firma eingeben.');
    let firstName, lastName;
    if (name.includes(',')) {
      const pair = name.split(',').map(s => s.trim());
      if (pair.length !== 2) fail('Der Name ist mehrdeutig. Bitte Nachname, Vorname verwenden.');
      [lastName, firstName] = pair;
    } else {
      const words = name.split(' ');
      if (words.length !== 2) fail('Bei mehrteiligen Namen bitte „Nachname, Vorname“ verwenden, jeweils vollständig.');
      [firstName, lastName] = words;
    }
    if (![firstName, lastName].every(s => s && /\p{L}/u.test(s))) fail('Vorname und Nachname müssen vollständig sein.');
    return {firstName: capitalizeInitial(firstName), lastName: capitalizeInitial(lastName), street: capitalizeInitial(streetName.trim().replace(/\s+/g, ' ')), houseNumber: houseNumber.replace(/\s*([/-])\s*/g, '$1'), postalCode: postal[1]};
  }
  root.DHLAddressParser = {parseAddress};
  if (typeof module !== 'undefined') module.exports = {parseAddress};
})(globalThis);

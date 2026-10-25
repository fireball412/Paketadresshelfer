const {test} = require('node:test');
const assert = require('node:assert/strict');
const {parseAddress} = require('../src/addressParser');
const expected = {firstName: 'Max', lastName: 'Mustermann', street: 'Musterstraße', houseNumber: '15', postalCode: '12345'};
for (const text of [
  'Max Mustermann\nMusterstraße 15\n12345 Berlin',
  'Mustermann, Max\nMusterstraße 15\n12345 Berlin',
  'Max Mustermann, Musterstraße 15, 12345 Berlin',
  'Max Mustermann\r\nMusterstraße 15\r\nD-12345 Berlin\r\nDeutschland',
  'Max Mustermann;15 Musterstraße;12345 Berlin',
  '  Max   Mustermann  \n  Musterstraße 15 \n12345 Berlin\nGermany'
]) test('Format: ' + JSON.stringify(text), () => assert.deepEqual(parseAddress(text), expected));
for (const houseNumber of ['15a', '15/1', '15-17', '15 a', '15/1b']) {
  test('Hausnummer ' + houseNumber, () => assert.equal(parseAddress(`Max Mustermann\nMusterstr. ${houseNumber}\n01234 Berlin`).houseNumber, houseNumber));
}
test('Mehrteilige Namen und Umlaute', () => assert.deepEqual(parseAddress('von Müller-Lüdenscheidt, Anna Maria\nStraße des 17. Juni 12\n10623 Berlin'), {firstName:'Anna Maria',lastName:'Von Müller-Lüdenscheidt',street:'Straße des 17. Juni',houseNumber:'12',postalCode:'10623'}));

test('Kleingeschriebene Namen und Straße beginnen groß', () => {
  assert.deepEqual(parseAddress('max mustermann\nmusterstraße 15\n12345 Berlin'), expected);
  const address = parseAddress('özdemir, ümit\näußere Straße 15a\n01234 Berlin');
  assert.equal(address.firstName, 'Ümit');
  assert.equal(address.lastName, 'Özdemir');
  assert.equal(address.street, 'Äußere Straße');
  assert.equal(address.houseNumber, '15a');
});

test('Bestehende Schreibweise hinter dem Anfangsbuchstaben bleibt erhalten', () => {
  const address = parseAddress('jean-Luc mcDonald\nam alten Markt 15\n12345 Berlin');
  assert.equal(address.firstName, 'Jean-Luc');
  assert.equal(address.lastName, 'McDonald');
  assert.equal(address.street, 'Am alten Markt');
});
for (const text of ['', 'Max\nMusterstraße 15\n12345 Berlin', 'Max Mustermann\nMusterstraße\n12345 Berlin', 'Max Mustermann\nMusterstraße 15\n1234 Berlin', 'Max Mustermann\nMusterstraße 15\n123456 Berlin', 'Anna Maria Müller\nMusterstraße 15\n12345 Berlin', 'Firma GmbH\nMusterstraße 15\n12345 Berlin', 'Max Mustermann\nPostfach 123\n12345 Berlin\nZusatz', 'Max Mustermann\nMusterstraße 15\n00000 Berlin', 'Max Mustermann\nMusterstraße 15\n12345']) {
  test('Unvollständig oder mehrdeutig: ' + JSON.stringify(text), () => assert.throws(() => parseAddress(text)));
}

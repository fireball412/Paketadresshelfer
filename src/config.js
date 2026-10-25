// Erst nach Prüfung des echten Formulars konkrete Selektoren eintragen.
// Alle Selektoren sind relativ zu recipientScope; keine Ortsfelder zuordnen.
globalThis.DHLAddressConfig = {
  recipientScope: null,
  nameMode: 'auto', // 'combined' für ein Namensfeld, 'separate' für zwei
  dhlCombinedProfile: true,
  fields: {fullName: null, firstName: null, lastName: null, street: null, houseNumber: null, postalCode: null}
};

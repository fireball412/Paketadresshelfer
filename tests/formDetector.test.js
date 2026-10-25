const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function setup(names) {
  const fields=names.map(name=>({name,type:'text',autocomplete:'',labels:[],getAttribute:()=>null,hasAttribute:()=>false,getClientRects:()=>[{}]}));
  const scope={querySelectorAll:()=>fields};
  const doc={querySelectorAll:selector=>selector==='input'?fields:[scope]};
  const context={}; vm.createContext(context);
  vm.runInContext(fs.readFileSync('src/formDetector.js','utf8'),context);
  return {detector:context.DHLFormDetector,doc,fields,config:{recipientScope:'.verified',fields:{}}};
}
test('Eindeutige fünf getrennte Felder werden erkannt',()=>{
  const {detector,doc,config,fields}=setup(['firstName','lastName','street','houseNumber','postalCode','city']);
  const result=detector.detect(doc,config);
  assert.equal(result.fields.firstName,fields[0]);
  assert.equal(result.fields.postalCode,fields[4]);
  assert.equal(Object.values(result.fields).includes(fields[5]),false);
});
test('Gemeinsames Namensfeld wie auf der verlinkten DHL-Seite wird erkannt',()=>{
  const {detector,doc,config,fields}=setup(['Vor- und Nachname','street','houseNumber','postalCode','city']);
  const result=detector.detect(doc,config);
  assert.equal(result.fields.fullName,fields[0]);
  assert.equal(Object.keys(result.fields).length,4);
  assert.equal(Object.values(result.fields).includes(fields[4]),false);
});
test('Doppelte Zielfelder verhindern eine Übernahme',()=>{
  const {detector,doc,config}=setup(['firstName','firstName','lastName','street','houseNumber','postalCode']);
  assert.equal(detector.detect(doc,config),null);
});

test('Gesperrte DHL-Adressfelder verhindern nur das Schreiben, nicht die Anzeige',()=>{
  const {detector,doc,config,fields}=setup(['Vor- und Nachname','street','houseNumber','postalCode']);
  fields[1].disabled=true;
  fields[2].disabled=true;
  assert.equal(detector.detect(doc,config),null);
  const display=detector.detect(doc,config,{forDisplay:true});
  assert.ok(display);
  assert.equal(display.fields.street,fields[1]);
  fields[1].disabled=false;
  fields[2].disabled=false;
  assert.ok(detector.detect(doc,config));
});
test('Diagnose enthält keine freien Attribute oder Eingabewerte',()=>{
  const {detector,doc,fields}=setup(['privaterName']); fields[0].value='Geheime Adresse';
  const report=JSON.stringify(detector.diagnose(doc));
  assert.equal(report.includes('privaterName'),false);
  assert.equal(report.includes('Geheime Adresse'),false);
});
test('DHL-Profil erkennt nur Empfänger-IDs auch im gemeinsamen Absenderbereich',()=>{
  const {detector,fields}=setup(['Vor- und Nachname','street','houseNumber','postalCode']);
  const ids=['address.receiver.name2','address.receiver.street','address.receiver.streetNumber','address.receiver.plz'];
  let hasSender=false;
  const scope={
    contains:el=>fields.includes(el),
    querySelector:()=>hasSender?{}:null,
    querySelectorAll:selector=>selector==='input'?fields:fields.filter((el,i)=>selector===`[id="${ids[i]}"]`)
  };
  fields.forEach(el=>{el.parentElement=scope;});
  const doc={querySelectorAll:selector=>fields.filter((el,i)=>selector===`[id="${ids[i]}"]`)};
  const result=detector.detect(doc,{});
  assert.ok(result);
  assert.equal(result.fields.fullName,fields[0]);
  assert.equal(result.fields.postalCode,fields[3]);
  hasSender=true;
  const sharedResult=detector.detect(doc,{});
  assert.ok(sharedResult);
  assert.deepEqual(Object.values(sharedResult.fields),fields);
  hasSender=false;
  fields[3].disabled=true;
  assert.equal(detector.detect(doc,{}),null);
});

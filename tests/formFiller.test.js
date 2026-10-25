const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

test('PLZ-Fokus folgt ersetzten DHL-Feldern und endet bei Benutzereingaben', () => {
  const timers=new Map(), listeners=new Map();
  let nextTimer=0, field;
  const doc={activeElement:null,querySelectorAll:()=>[field],addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name)};
  const makeField=()=>({isConnected:true,focus(){doc.activeElement=this;},click(){}});
  field=makeField();
  const context={document:doc,location:{href:'https://www.dhl.de/?type=ShipmentEditorAddressInput'},setTimeout:fn=>{timers.set(++nextTimer,fn);return nextTimer;},clearTimeout:id=>timers.delete(id),DHLFormDetector:{detect:()=>null}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('src/formFiller.js','utf8'),context);
  assert.equal(context.DHLFormFiller.focusPostalCode(),true);
  assert.equal(doc.activeElement,field);
  field.isConnected=false;
  field=makeField();
  timers.get(1)();
  assert.equal(doc.activeElement,field);
  listeners.get('keydown')({isTrusted:true});
  assert.equal(timers.size,0);
  assert.equal(listeners.size,0);
});

test('PLZ-Fokus funktioniert auch bei noch gesperrten Straßenfeldern', () => {
  const postalCode={isConnected:true,focus(){this.focused=true;},click(){this.clicked=true;}};
  const context={DHLFormDetector:{detect:(doc,config,options)=>options?.forDisplay?{fields:{postalCode}}:null}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('src/formFiller.js','utf8'),context);
  assert.equal(context.DHLFormFiller.focusPostalCode(),true);
  assert.equal(postalCode.focused,true);
  assert.equal(postalCode.clicked,true);
  postalCode.disabled=true;
  assert.equal(context.DHLFormFiller.focusPostalCode(),false);
});

test('Leeren entfernt Empfänger inklusive gesperrter Felder und Wohnort, niemals Absender', () => {
  class Input {
    constructor() { this.stored='Vorhanden'; this.isConnected=true; this.events=[]; }
    set value(value) { this.stored=value; }
    get value() { return this.stored; }
    dispatchEvent(event) { this.events.push(event.type); }
  }
  const fields=Object.fromEntries(['fullName','street','houseNumber','postalCode'].map(key=>[key,new Input()]));
  fields.street.disabled=true;
  fields.houseNumber.disabled=true;
  const city=new Input(), sender=new Input();
  const scope={contains:field=>field===city || Object.values(fields).includes(field)};
  const target={scope,fields};
  let cityMatches=[city];
  const doc={querySelectorAll:selector=>selector==='[id="address.receiver.city"]'?cityMatches:[]};
  const context={HTMLInputElement:Input,Event:class {constructor(type){this.type=type;}},FocusEvent:class {constructor(type){this.type=type;}},DHLFormDetector:{detect:()=>target}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('src/formFiller.js','utf8'),context);
  cityMatches=[city,new Input()];
  assert.throws(()=>context.DHLFormFiller.clear(target,doc));
  assert.equal(fields.fullName.value,'Vorhanden');
  cityMatches=[city];
  context.DHLFormFiller.clear(target,doc);
  for (const field of [...Object.values(fields),city]) {
    assert.equal(field.value,'');
    assert.deepEqual(field.events,['input','change','blur','focusout']);
  }
  assert.equal(sender.value,'Vorhanden');
  assert.deepEqual(sender.events,[]);
});
test('Gemeinsames Namensfeld: vier Ziele, PLZ zuletzt, keine weiteren Felder', () => {
  const writes=[];
  class Input {
    constructor(key) { this.key=key; this.isConnected=true; this.events=[]; }
    focus() { this.focused=true; }
    click() { this.clicks=(this.clicks || 0)+1; }
    set value(value) { writes.push([this.key,value]); }
    dispatchEvent(event) { this.events.push(event.type); }
  }
  const fields=Object.fromEntries(['fullName','street','houseNumber','postalCode'].map(k=>[k,new Input(k)]));
  const target={fields};
  const context={HTMLInputElement:Input,Event:class {constructor(type){this.type=type;}},FocusEvent:class {constructor(type){this.type=type;}},DHLFormDetector:{detect:()=>target}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('src/formFiller.js','utf8'),context);
  context.DHLFormFiller.fill(target,{firstName:'Anna Maria',lastName:'von Müller',street:'Musterstraße',houseNumber:'15a',postalCode:'01234'});
  assert.deepEqual(writes,[['fullName','Anna Maria von Müller'],['street','Musterstraße'],['houseNumber','15a'],['postalCode','01234']]);
  for (const field of Object.values(fields)) assert.deepEqual(field.events,['input','change','blur','focusout']);
  assert.equal(fields.postalCode.focused,true);
  assert.equal(fields.postalCode.clicks,1);
  assert.equal(fields.fullName.clicks,undefined);
  target.fields.city=new Input('city');
  assert.throws(()=>context.DHLFormFiller.fill(target,{firstName:'Max',lastName:'Mustermann'}));
  assert.equal(writes.length,4);
});
test('Schreibt exakt fünf Felder mit nativen Setter und Events, niemals Ort', () => {
  class Input {
    constructor() { this.events=[]; this.isConnected=true; }
    focus() { this.focused=true; }
    click() { this.clicks=(this.clicks || 0)+1; }
    set value(value) { this.stored=value; }
    get value() { return this.stored; }
    dispatchEvent(event) { this.events.push(event.type); }
  }
  const keys=['firstName','lastName','street','houseNumber','postalCode'];
  const fields=Object.fromEntries(keys.map(k=>[k,new Input()]));
  const city=new Input(); city.value='Unverändert';
  const target={fields};
  const context={HTMLInputElement:Input,Event:class {constructor(type){this.type=type;}},FocusEvent:class {constructor(type){this.type=type;}},DHLFormDetector:{keys,detect:()=>target}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('src/formFiller.js','utf8'),context);
  const address={firstName:'Max',lastName:'Mustermann',street:'Musterstraße',houseNumber:'15',postalCode:'12345'};
  context.DHLFormFiller.fill(target,address);
  for(const key of keys) { assert.equal(fields[key].value,address[key]); assert.deepEqual(fields[key].events,['input','change','blur','focusout']); }
  assert.equal(city.value,'Unverändert'); assert.deepEqual(city.events,[]);
  assert.equal(fields.postalCode.focused,true);
  assert.equal(fields.postalCode.clicks,1);
  assert.equal(city.clicks,undefined);
  context.DHLFormDetector.detect=()=>null;
  assert.throws(()=>context.DHLFormFiller.fill(target,address));
});

# Paketadresshelfer

> Unabhängiges privates Open-Source-Projekt zur Verwendung mit der DHL Online Frankierung. Keine Verbindung zu DHL und keine offizielle Unterstützung durch DHL. DHL ist eine Marke ihres jeweiligen Rechteinhabers.

**Experimentelle Software:** Es wird keine Fehlerfreiheit, korrekte Adresszuordnung oder erfolgreiche Zustellung zugesichert. Prüfe vor dem Kauf einer Versandmarke jeden Empfängerwert und den Wohnort manuell. Die automatische Großschreibung verändert Vorname, Nachname und Straßenname.

Die Software wird unter der [MIT-Lizenz](LICENSE) bereitgestellt. Deren Gewährleistungs- und Haftungsregelungen gelten im Rahmen des anwendbaren Rechts; zwingende gesetzliche Haftung bleibt unberührt. Es werden keine Garantie, feste Wartungsdauer oder Updatefristen zugesagt.

Lokale Chrome-Erweiterung zum Einfügen deutscher Empfängeradressen in die DHL Online Frankierung. Kopiere eine Adresse in die Eingabebox und übernimm sie mit einem Klick. Im Warenkorb erscheint der Originaltext zum manuellen Vergleich.

Die Erweiterung arbeitet ohne Backend, externe Bibliotheken oder eigene Netzwerkaufrufe. Sie schickt keine Bestellung ab.

## Installation in Google Chrome unter Windows

Du brauchst Google Chrome und den vollständigen Projektordner. Node.js und eine Paketinstallation sind für die Benutzung nicht erforderlich. Die Erweiterung wird lokal geladen, nicht über den Chrome Web Store.

### 1. Projektordner vorbereiten

Falls du eine ZIP-Datei erhalten hast, entpacke sie im Windows-Explorer über **Alle extrahieren**. Wähle bei der Installation den entpackten Ordner, nicht die ZIP-Datei.

Im richtigen Ordner liegen direkt diese Dateien und Unterordner:

```text
Paketadresshelfer/
├── manifest.json
├── diagnostics.html
├── src/
├── tests/
└── README.md
```

Ein möglicher Speicherort ist:

```text
C:\Projekte\Paketadresshelfer
```

Bei einem anderen Speicherort wählst du entsprechend deinen Ordner. Behalte ihn nach der Installation an diesem Ort: Chrome lädt die Erweiterung weiterhin aus diesem Verzeichnis.

### 2. Erweiterungsverwaltung öffnen

1. Öffne Chrome in dem Profil, mit dem du DHL verwendest.
2. Gib `chrome://extensions` direkt in die Adresszeile ein und drücke **Enter**.
3. Schalte oben rechts **Entwicklermodus** ein.

### 3. Erweiterung laden

1. Klicke auf **Entpackte Erweiterung laden**.
2. Navigiere zum Projektordner.
3. Wähle den Ordner, in dem `manifest.json` direkt liegt. Wähle weder die Datei selbst noch den Unterordner `src`.
4. Bestätige mit **Ordner auswählen**.
5. Prüfe, ob die Karte **Paketadresshelfer** erscheint und der Schalter eingeschaltet ist.

Diese Installationsschritte entsprechen der [offiziellen Chrome-Anleitung für lokale Erweiterungen](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

### 4. Symbol anheften – optional

Klicke neben der Chrome-Adresszeile auf das **Puzzleteil** und beim Paketadresshelfer auf die **Stecknadel**. Über das Symbol erreichst du die Diagnose. Für die Adressübernahme musst du das Symbol nicht anklicken.

### 5. DHL-Seite öffnen

1. Öffne die [DHL Online Frankierung](https://www.dhl.de/de/privatkunden/pakete-versenden/online-frankieren.html?type=ShipmentEditorAddressInput).
2. Wähle bei Bedarf zuerst dein Versandprodukt und gehe zum Schritt **Adressdaten**. Der Direktlink setzt einen passenden DHL-Vorgang voraus.
3. War die Seite während der Installation schon geöffnet, lade sie mit **Strg + R** neu. Sichere vorher gegebenenfalls benötigte Eingaben.
4. Im erkannten Empfängerbereich erscheint die Box **Empfängeradresse übernehmen**.

## Adresse übernehmen

Füge die Adresse am besten in drei Zeilen ein:

```text
max mustermann
musterstraße 15a
12345 Berlin
```

Klicke auf **Adresse übernehmen**. Der Helfer trägt Vorname, Nachname, Straße, Hausnummer und PLZ ein. Auf der DHL-Seite werden Vor- und Nachname in einem gemeinsamen Feld zusammengeführt.

Der erste Buchstabe von Vorname, Nachname und Straßenname wird großgeschrieben. Der Rest bleibt erhalten: `max mustermann` wird zu `Max Mustermann`, `am alten Markt` zu `Am alten Markt`. Es wird nicht jedes Wort großgeschrieben. Dein Originaltext bleibt unverändert.

Nach der Übernahme wird zum PLZ-Feld gescrollt und der Eingabefokus darauf gesetzt. **Der echte Mauszeiger wird nicht verschoben.** Bei verzögerten DHL-Updates erfolgen kurzzeitig erneute Fokusversuche. Sobald du selbst klickst oder eine Taste drückst, enden diese Versuche.

**Prüfe anschließend alle Werte und den Wohnort.** Der Helfer befüllt den Wohnort nicht; seine Ermittlung übernimmt DHL. Wähle den passenden Ort aus, falls DHL eine Auswahl anbietet.

### Wenn Straße und Hausnummer gesperrt sind

Die Eingabebox bleibt auch bei gesperrten DHL-Feldern sichtbar. Eine Übernahme ist dann noch nicht möglich. Trage zunächst die PLZ direkt im DHL-Formular ein und prüfe beziehungsweise wähle den Wohnort. Sobald DHL die Felder freigibt, klicke erneut auf **Adresse übernehmen**.

### Weitere unterstützte Formate

| Eingabe | Beispiel |
| --- | --- |
| Eine Zeile mit Kommas | `Max Mustermann, Musterstraße 15a, 12345 Berlin` |
| PLZ mit Länderpräfix | `D-12345 Berlin` |
| Hausnummer vor der Straße | `15a Musterstraße` |
| Zusätzliche Länderzeile | `Deutschland`, `Germany` oder `DE` |
| Mehrteiliger Name mit eindeutiger Trennung | `von Müller, Anna Maria` in der Namenszeile |

Bei mehrteiligen Namen gilt **Nachname, Vorname**. Das Beispiel wird nach den aktuellen Regeln als `Anna Maria Von Müller` übernommen. `Anna Maria Müller` ohne Komma wird wegen der uneindeutigen Aufteilung abgelehnt.

Nicht unterstützt werden unter anderem Firmen, Anreden, Titel, Postfächer, Packstationen, Filialadressen, ausländische Adressen und weitere Adresszusätze im eingefügten Text. Die Prüfung erkennt das Format, bestätigt aber nicht, ob eine Adresse tatsächlich existiert.

## Originaltext im Warenkorb

Nach erfolgreicher Übernahme bleibt der Originaltext für den Seitenwechsel im selben Tab gespeichert. Im [DHL-Warenkorb](https://www.dhl.de/de/privatkunden/pakete-versenden/online-frankieren.html?type=ShoppingCart) erscheint er unter **Originaltext der Empfängeradresse** in einem schreibgeschützten Textfeld.

Vergleiche den Text selbst mit der Empfängeradresse. Es findet kein automatischer Vergleich statt. Angezeigt wird nur die zuletzt erfolgreich übernommene Adresse. Bei mehreren Sendungen ist der Text nicht jeder Sendung einzeln zugeordnet.

Mit **Originaltext löschen** entfernst du den Vergleichstext. Die DHL-Adresse im Warenkorb wird dadurch nicht gelöscht.

## Text und Empfängerfelder leeren

Im Schritt **Adressdaten** steht neben **Adresse übernehmen** der Button **Text und Empfängeradresse löschen**. Er leert:

- den eigenen Text und den gespeicherten Originaltext;
- den Empfängernamen;
- Straße und Hausnummer;
- PLZ und Wohnort des Empfängers.

Absender, Adresszusatz, E-Mail und Land bleiben unverändert. Das Leeren des Wohnorts ist eine ausdrückliche Ausnahme: Bei der normalen Übernahme bleibt die Ortsbestimmung DHL überlassen.

Ist das Empfänger-Wohnortfeld nicht eindeutig erkennbar, wird nur der eigene Text gelöscht und ein Hinweis angezeigt; die DHL-Felder werden dann nicht geleert. Prüfe bei einer Fehlermeldung die verbliebenen Werte. Nach dem Leeren wird das PLZ-Feld fokussiert.

## Änderungen und Updates laden

Änderungen an den Dateien werden nicht automatisch in bereits geöffneten DHL-Seiten aktiv.

1. Speichere beziehungsweise aktualisiere die Projektdateien im installierten Ordner.
2. Öffne `chrome://extensions`.
3. Klicke auf der Karte **Paketadresshelfer** auf das kreisförmige Pfeilsymbol **Neu laden**.
4. Wechsle zur DHL-Seite und lade auch diese mit **Strg + R** neu.

**Zuerst die Erweiterung, danach die DHL-Seite neu laden.** Eine Deinstallation ist für Updates nicht nötig.

## Fehlerbehebung

| Problem | Vorgehen |
| --- | --- |
| „Entpackte Erweiterung laden“ fehlt | Auf `chrome://extensions` den Entwicklermodus einschalten. |
| Manifest fehlt oder kann nicht geladen werden | ZIP vollständig entpacken und den Ordner mit `manifest.json` auswählen. Bei verschachtelten Download-Ordnern eine Ebene tiefer prüfen. |
| Keine Eingabebox | Erweiterung eingeschaltet? Richtiges Chrome-Profil? Erweiterung und danach DHL-Seite neu laden. Zum Schritt **Adressdaten** und zur normalen Empfängeradresse wechseln. |
| Straße und Hausnummer gesperrt | Zuerst PLZ und Wohnort direkt bei DHL prüfen beziehungsweise auswählen, danach erneut übernehmen. |
| Adresse wird abgelehnt | Drei Zeilen verwenden; mehrteilige Namen als `Nachname, Vorname` schreiben; Titel und Zusätze entfernen. |
| Kein Originaltext im Warenkorb | Zuerst erfolgreich mit dem Helfer übernehmen und im selben Tab zum Warenkorb wechseln. Manuell ausgefüllte DHL-Adressen erzeugen keinen Originaltext. |
| PLZ-Fokus fehlt | Während des Fokuswechsels kurz nicht klicken oder tippen. Bei einem zwischenzeitlichen DHL-Update erneut versuchen. Der Mauszeiger bewegt sich nicht. |
| Löschen meldet einen Fehler | Empfängerfelder prüfen und gegebenenfalls manuell leeren. Bei unklarer Zuordnung bricht der Helfer ab. |
| Update scheint wirkungslos | Nach dem Neuladen der Erweiterung auch die DHL-Seite neu laden. |

### Diagnose öffnen

Öffne auf der DHL-Seite das Erweiterungssymbol und klicke auf **Aktuelle DHL-Seite prüfen**. Die Diagnose enthält Feldindex, Typ, Sichtbarkeit, Sperrstatus und erkannte Feldrollen. Eingabewerte und freie Seitentexte werden nicht ausgegeben.

Bei gesperrten Adressfeldern kann `formRecognized: false` erscheinen, obwohl die Eingabebox sichtbar ist: Die Diagnose prüft die zum Schreiben freigegebenen Felder.

Änderungen am DHL-Formular können eine Anpassung erfordern. Für eine technische Analyse nur bereinigte HTML-Ausschnitte verwenden und vorher Eingabewerte sowie personenbezogene Inhalte entfernen.

## Daten und Berechtigungen

Die Verarbeitung erfolgt lokal im Browser. Nach erfolgreicher Übernahme liegt der Originaltext im `sessionStorage` der DHL-Seite für den jeweiligen Tab. Er übersteht Seitenaktualisierungen und Navigation innerhalb derselben DHL-Origin. Du kannst ihn über die Löschbuttons entfernen. Normalerweise endet die Sitzung beim Schließen des Tabs; eine Browser-Sitzungswiederherstellung kann Sitzungsdaten wiederherstellen. Zum bewussten Entfernen deshalb den Löschbutton verwenden.

`sessionStorage` gehört zur DHL-Seite und ist kein ausschließlich für die Erweiterung zugänglicher Speicher. Die Erweiterung erstellt keine Adressprotokolle und nutzt keine eigene Serverübertragung. Die in DHL-Felder übernommenen Daten werden von der DHL-Webseite nach deren eigener Funktionsweise verarbeitet.

| Berechtigung bzw. Bereich | Zweck |
| --- | --- |
| `https://dhl.de/*`, `https://*.dhl.de/*` | Automatisches Laden der Skripte auf HTTPS-DHL-Seiten; Anzeige im erkannten Formular beziehungsweise Warenkorb. |
| `activeTab`, `scripting` | Ausführen der ausdrücklich angeklickten Diagnose im aktuellen DHL-Tab. |

Zum Deaktivieren auf `chrome://extensions` den Schalter ausschalten. Zum Deinstallieren **Entfernen** wählen. Bereits geöffnete DHL-Seiten anschließend neu laden. Gespeicherten Originaltext bei Bedarf vorher über den Löschbutton entfernen.

## Entwicklung und Tests

Nur für automatisierte Tests ist Node.js ab Version 18 erforderlich. Externe Pakete müssen nicht installiert werden. Im Projektordner ausführen:

```powershell
npm test
```

Alternativ:

```powershell
node --test tests/*.test.js
```

Die Tests prüfen Adressformate, Großschreibung der Anfangsbuchstaben, Feldzuordnung, Schreibereignisse, gezieltes Leeren einschließlich Wohnort sowie Fokusversuche bei ersetzten PLZ-Feldern. Sie ersetzen keinen vollständigen Test auf der echten DHL-Seite.

`tests/local-form.html` lässt sich direkt in Chrome öffnen. Die Seite lädt die Skripte selbst; eine Freigabe der Erweiterung für Datei-URLs ist dafür nicht nötig. Sie simuliert getrennte und gemeinsame Namensfelder sowie dynamisch ersetzte Formulare, aber nicht die echte DHL-Ortsbestimmung. Der DHL-spezifische Löschvorgang für den Wohnort lässt sich mit diesem generischen Testformular nicht vollständig nachstellen.

### Dateien

| Datei | Aufgabe |
| --- | --- |
| `manifest.json` | Manifest V3, Skriptreihenfolge und Berechtigungen |
| `src/addressParser.js` | Adresse zerlegen und Anfangsbuchstaben großschreiben |
| `src/formDetector.js` | Empfängerfelder erkennen und Diagnose erstellen |
| `src/config.js` | Optionale Anpassung der Formularzuordnung |
| `src/formFiller.js` | Übernahme, Leeren und PLZ-Fokus |
| `src/content.js` | Oberfläche, Originaltext und Beobachtung dynamischer Seitenänderungen |
| `src/ui.css` | Lesbare Stilvorlage; die Oberfläche verwendet Inline-Stile im Shadow DOM |
| `diagnostics.html`, `src/diagnostics.js` | Diagnose über das Erweiterungssymbol |
| `tests/` | Automatisierte Tests und lokale Testseite |

### Formularzuordnung anpassen

Das eingebaute DHL-Profil verwendet die beobachteten Empfänger-IDs `address.receiver.name2`, `address.receiver.street`, `address.receiver.streetNumber` und `address.receiver.plz`. Zum Leeren des Wohnorts wird zusätzlich `address.receiver.city` geprüft. So werden die Absenderfelder im gemeinsamen DHL-Container nicht angesprochen.

Weitere Formulare werden anhand eindeutiger Labels, Namen, ARIA-Attribute und passender Autocomplete-Tokens erkannt. Bei mehrdeutiger Zuordnung wird nicht geschrieben. In `src/config.js` lassen sich `recipientScope`, `nameMode` und relative Feldselektoren anpassen; `dhlCombinedProfile: false` deaktiviert das eingebaute Profil. Dem normalen Schreibprofil niemals ein Wohnortfeld zuordnen.

Ein MutationObserver erkennt nachgeladene Formulare. Native Value-Setter sowie `input`, `change`, `blur` und `focusout` informieren die DHL-Seite über Änderungen. Das Verhalten nach DHL-Updates muss zusätzlich im Browser geprüft werden.

## Fehlerberichte und Sicherheitsmeldungen

Verwende für Fehlerberichte die [Issue-Vorlage](.github/ISSUE_TEMPLATE/bug_report.md) und ausschließlich erfundene Beispieldaten. Keine echten Empfängerdaten, E-Mail-Adressen oder ungeschwärzten Screenshots hochladen. Hinweise zum vertraulichen Melden von Sicherheitsproblemen stehen in [SECURITY.md](SECURITY.md).

Vor einer Veröffentlichung muss auch die Git-Historie auf persönliche Daten geprüft werden: Das Löschen einer aktuellen Datei entfernt keine früheren Commits. Eine `.gitignore` entfernt bereits eingecheckte Dateien ebenfalls nicht aus der Historie. Bildschirmaufnahmen gehören erst nach einer gesonderten Datenschutzprüfung in ein öffentliches Repository.

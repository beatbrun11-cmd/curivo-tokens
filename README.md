# @curivo/tokens

Die Farbwerte von Curivo. **Eine Quelle für alle Module.**

Kein Code, keine Bausteine, keine Geometrie — nur Werte. Die Module bringen
ihre eigenen Bauteile mit.

## Verwenden

```json
"dependencies": {
  "@curivo/tokens": "git+https://github.com/beatbrun11-cmd/curivo-tokens.git#v1.0.3"
}
```

Das Paket liefert gebautes JavaScript und Typdefinitionen aus. Es braucht in
keinem Verbraucher eine `transpilePackages`-Einstellung.

```ts
import { farbenFuerTailwind } from "@curivo/tokens/tailwind";

// tailwind.config.ts
theme: { extend: { colors: farbenFuerTailwind } }
```

```ts
import { alleFarben, FARBEN, DIENSTARTEN } from "@curivo/tokens";

alleFarben["interactive-text"];   // "#0C6B6B"
FARBEN.status;                    // die Statusfamilie
```

## Die Gruppen

| Gruppe | Wofür |
|---|---|
| `marke` | Der Markenton in seinen Zuständen: Text, Hover, gedrückt, Fläche, Rand |
| `flaechen` | Grundflächen. Sie tragen keine Bedeutung |
| `schrift` | Fliesstext und Nebentext |
| `navigation` | Die Schale |
| `status` | Erfolg, Warnung, Fehler, Hinweis, neutral — je Fläche, Rand, Text |
| `dienstart` | Früh, Spät, Nacht. Eine **Kategorie**, keine Bewertung |
| `legacy` | Abgelöste Werte. Stehen hier, damit die Migration sie auflösen kann — nicht für neue Arbeit |

## Was hier gilt

**Jeder Wert ist gemessen.** WCAG 2.1: 4.5 zu 1 für Text, 3.0 für Rahmen an
Bedienelementen. Eine halbtransparente Farbe hat nicht ihren eigenen Kontrast,
sondern den ihrer Mischung mit dem Untergrund — sie muss vor der Messung
komponiert werden.

**Die Dienstarten sind eine Kategorie, kein Status.** Zuvor trug der Frühdienst
den Markenton und der Spätdienst den Warnton; Früh sah damit aus wie eine
Bedienhandlung, Spät wie eine Warnung. Sie haben jetzt eine eigene Familie.

**Das Abzeichen trägt immer das Wort.** Die Farbe ordnet, sie benennt nicht.

## Versionieren

Über Git-Tags. Verbraucher pinnen ausdrücklich auf eine Version — ein
schwebender Zweig hiesse, dass eine Farbänderung ungeprüft in laufende
Anwendungen wandert.

```
npm run build && npm test && node scripts/kontraste.mjs
git tag v1.0.3 && git push origin v1.0.3
```

Die Prüfung läuft auch in CI — bei jedem Push und bei jedem Tag. Was hier
durchgeht, geht in alle Module gleichzeitig; ein Fehler ist dann nicht an einer
Stelle falsch, sondern überall.

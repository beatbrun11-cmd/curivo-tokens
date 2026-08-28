#!/usr/bin/env node
/**
 * Schreibt `src/version.ts` -- die Kennung, die mit dem Paket reist.
 *
 * **Warum sie nicht von Hand gepflegt wird.** Die uebliche Route `npm version
 * patch` erzeugt Commit UND Tag in einem Schritt. Eine von Hand gepflegte Zahl
 * waere in diesem Moment noch die alte: das Tag ist oeffentlich und
 * installierbar, bevor irgendein Lauf es rot melden kann.
 *
 * **Warum die Nummer allein nicht genuegt.** Die Verbraucher verlangen in
 * ihrer Sperrdatei ausdruecklich eine Commit-Kennung statt eines Tags, weil ein
 * Tag sich verschieben laesst. Genau dort faellt ein Vergleich zweier
 * Versionsnummern zurueck: `git tag -f v1.0.3` nach einer Farbkorrektur, ein
 * Modul baut neu, das andere nicht -- beide sagen «1.0.3», und die Farben sind
 * verschieden.
 *
 * Darum traegt die Kennung einen Fingerabdruck der Farbwerte selbst. Gleiche
 * Kennung heisst dann: gleiche Farben. Nicht: gleiche Absicht.
 *
 * Aufruf: node scripts/fassung-schreiben.mjs
 *   -- als `prebuild` vor jedem Bauen
 *   -- als `version` beim Anheben, damit die Datei im selben Commit landet
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const wurzel = new URL("..", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("package.json", wurzel), "utf8"));

// Ueber die rohen Bytes, nicht ueber ein neu serialisiertes Objekt: sonst
// verschoebe eine andere Einrueckung den Fingerabdruck, ohne dass sich eine
// Farbe geaendert haette.
const farbstand = createHash("sha256")
  .update(readFileSync(new URL("src/farben.json", wurzel)))
  .digest("hex")
  .slice(0, 8);

const inhalt = `/**
 * ERZEUGT von scripts/fassung-schreiben.mjs -- nicht von Hand aendern.
 *
 * Die Kennung, die mit dem Paket reist und die beide Module an ihrer
 * oeffentlichen Anmeldeseite ausgeben. Sie besteht aus der Fassungsnummer und
 * einem Fingerabdruck der Farbwerte.
 *
 * Der Fingerabdruck ist der Teil, der etwas beweist: ein verschobenes Tag mit
 * geaenderten Farben traegt dieselbe Nummer, aber einen anderen Abdruck. Zwei
 * Module mit derselben KENNUNG zeigen dieselben Farben.
 */
export const VERSION = ${JSON.stringify(manifest.version)};

/** Fingerabdruck der Farbwerte -- die ersten acht Stellen des SHA-256. */
export const FARBSTAND = ${JSON.stringify(farbstand)};

/** Was die Module ausgeben: Fassung und Farbstand zusammen. */
export const KENNUNG = \`\${VERSION}+\${FARBSTAND}\`;
`;

writeFileSync(new URL("src/version.ts", wurzel), inhalt);
console.log(`version.ts: ${manifest.version}+${farbstand}`);

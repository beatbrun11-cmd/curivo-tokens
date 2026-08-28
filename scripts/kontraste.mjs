#!/usr/bin/env node
/**
 * Misst die Farbpaare, die im Paket eine Schwelle haben.
 *
 * **Warum hier und nicht nur beim Verbraucher.** Diese Werte gehen in alle
 * Module gleichzeitig. Ein Wert, der erst beim Einbauen auffaellt, ist einmal
 * zu spaet gemessen -- und wer das Tag setzt, ist nicht zwingend derselbe, der
 * ihn einbaut.
 *
 * Aufruf: node scripts/kontraste.mjs
 */
import { readFileSync } from "fs";

const farben = JSON.parse(new TextDecoder().decode(readFileSync(new URL("../src/farben.json", import.meta.url))));
const alle = Object.assign({}, ...Object.values(farben));

const TEXT = 4.5;
const NICHT_TEXT = 3.0;

const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.replace("#", "").slice(i, i + 2), 16));
const lin = (c) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const leucht = (h) => { const [r, g, b] = rgb(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const k = (a, b) => { const [x, y] = [leucht(a), leucht(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/** Die Gruende, auf denen etwas ueberhaupt vorkommen kann. */
const GRUENDE = ["surface-default", "surface-page", "surface-warm"];

const pruefungen = [];

// Marke
pruefungen.push(["Markenton als Text auf weiss", alle["interactive-text"], alle["surface-default"], TEXT]);
pruefungen.push(["weiss auf dem Markenton", alle["surface-default"], alle["interactive-text"], TEXT]);
pruefungen.push(["weiss im Hover", alle["surface-default"], alle["interactive-text-hover"], TEXT]);
pruefungen.push(["weiss gedrueckt", alle["surface-default"], alle["interactive-text-active"], TEXT]);
pruefungen.push(["Markenton auf getoenter Flaeche", alle["interactive-text"], alle["interactive-surface"], TEXT]);
pruefungen.push(["Interaktionsrand gegen weiss", alle["interactive-border"], alle["surface-default"], NICHT_TEXT]);

// Schrift auf jedem Grund
for (const grund of GRUENDE) {
  pruefungen.push([`Fliesstext auf ${grund}`, alle["text-primary"], alle[grund], TEXT]);
  pruefungen.push([`Nebentext auf ${grund}`, alle["text-muted"], alle[grund], TEXT]);
}

// Status: Text auf eigener Flaeche, Rand gegen jeden Grund
for (const art of ["success", "warning", "danger", "info"]) {
  pruefungen.push([`${art}: Text auf eigener Flaeche`, alle[`status-${art}-text`], alle[`status-${art}-surface`], TEXT]);
  for (const grund of GRUENDE) {
    pruefungen.push([`${art}: Rand auf ${grund}`, alle[`status-${art}-border`], alle[grund], NICHT_TEXT]);
  }
}

// Dienstarten: dito
for (const d of ["frueh", "spaet", "nacht"]) {
  pruefungen.push([`${d}: Text auf eigener Flaeche`, alle[`dienst-${d}-text`], alle[`dienst-${d}-surface`], TEXT]);
  for (const grund of GRUENDE) {
    pruefungen.push([`${d}: Rand auf ${grund}`, alle[`dienst-${d}-border`], alle[grund], NICHT_TEXT]);
  }
}

let fehler = 0;
for (const [name, vorne, hinten, schwelle] of pruefungen) {
  const v = k(vorne, hinten);
  const ok = v >= schwelle;
  if (!ok) fehler++;
  console.log(`${ok ? "  ok  " : "FEHLER"}  ${v.toFixed(2).padStart(6)} / ${schwelle}  ${name}`);
}

/**
 * Und die Gegenrichtung: keine Dienstart darf die Marken- oder Statusfarben
 * tragen. Eine Kategorie, die aussieht wie eine Warnung, ist eine Falle.
 */
const fremd = new Set([
  ...Object.values(farben.marke),
  ...Object.values(farben.status),
  "#00B4B4",
  "#E8A817",
  "#4B0082",
]);
for (const [name, wert] of Object.entries(farben.dienstart)) {
  if (fremd.has(wert)) {
    console.error(`FEHLER  ${name} traegt ${wert} -- das ist eine Marken- oder Statusfarbe.`);
    fehler++;
  }
}

console.log("");
if (fehler) {
  console.error(`${fehler} Pruefung(en) durchgefallen.`);
  process.exit(1);
}
console.log(`Alle ${pruefungen.length} Pruefungen bestanden.`);

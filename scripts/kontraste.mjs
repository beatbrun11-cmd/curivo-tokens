#!/usr/bin/env node
/**
 * Misst jedes Farbpaar, das eine Schwelle hat.
 *
 * **Warum hier und nicht erst beim Verbraucher.** Diese Werte gehen in alle
 * Module gleichzeitig. Ein Wert, der erst beim Einbauen auffaellt, ist einmal
 * zu spaet gemessen -- und wer das Tag setzt, ist nicht zwingend derselbe, der
 * ihn einbaut.
 *
 * **Abgeleitet, nicht getippt.** Eine getippte Liste von Familien und Gruenden
 * misst, was jemand einmal aufgeschrieben hat. Sie waechst nicht mit der Datei
 * mit: Eine neue Statusfamilie oder eine neue Flaeche taucht darin nie auf,
 * und der Lauf meldet weiter «alle bestanden» ueber einen Umfang, der nicht
 * mehr stimmt. Genau so blieb `status-neutral` ungemessen, dessen Rand 1.60
 * erreicht.
 *
 * Aufruf: node scripts/kontraste.mjs
 */
import { readFileSync } from "fs";

const farben = JSON.parse(
  new TextDecoder().decode(readFileSync(new URL("../src/farben.json", import.meta.url)))
);
const alle = Object.assign({}, ...Object.values(farben));

const TEXT = 4.5;
const NICHT_TEXT = 3.0;

/**
 * Halbtransparenz gibt es hier nicht -- und das wird erzwungen, nicht gehofft.
 *
 * Eine halbtransparente Farbe hat nicht ihren eigenen Kontrast, sondern den
 * ihrer Mischung mit dem Untergrund. Wer sie misst, ohne sie vorher ueber
 * ihren Grund zu legen, misst eine Farbe, die nie zu sehen war. In diesem Haus
 * ist das viermal passiert (2.07, 1.86, 1.72, 1.48).
 *
 * Dieses Skript komponiert NICHT. Darum darf es auch keinen Wert annehmen, der
 * Komposition braucht: ein achtstelliger Hex-Wert wird abgelehnt, statt dass
 * sein Alphakanal still abgeschnitten wird. Wer Transparenz einfuehrt, muss
 * zuerst die Komposition nachruesten.
 */
const rgb = (h) => {
  if (!/^#[0-9A-F]{6}$/.test(h)) {
    console.error(`FEHLER  «${h}» ist kein sechsstelliger Hex-Wert in Grossschreibung.`);
    console.error("        Halbtransparenz braucht Komposition, die es hier nicht gibt.");
    process.exit(1);
  }
  return [0, 2, 4].map((i) => parseInt(h.slice(1 + i, 3 + i), 16));
};
const lin = (c) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const leucht = (h) => { const [r, g, b] = rgb(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const k = (a, b) => { const [x, y] = [leucht(a), leucht(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

/**
 * Wofuer eine Flaeche da ist, steht in `rollen.json` -- nicht hier.
 *
 * Schrift und umrandete Bauteile haben verschiedene Gruende. `surface-blue`
 * traegt Schrift, aber kein Abzeichen liegt darauf; sie als Bauteilgrund zu
 * messen ergaebe acht Fehler fuer Kombinationen, die es nicht gibt. Sie
 * wegzulassen hiesse, ihren Textkontrast nie anzusehen.
 *
 * Die Zuordnung liegt bei den Werten, damit eine neue Flaeche eine Entscheidung
 * erzwingt statt still durchzurutschen.
 */
const rollen = JSON.parse(
  new TextDecoder().decode(readFileSync(new URL("../src/rollen.json", import.meta.url)))
);
const TEXTGRUENDE = rollen.textgruende;
const BAUTEILGRUENDE = rollen.bauteilgruende;

const ohneRolle = Object.keys(farben.flaechen).filter(
  (f) => !TEXTGRUENDE.includes(f) && !BAUTEILGRUENDE.includes(f)
);
if (ohneRolle.length) {
  console.error(`FEHLER  Ohne Rolle in rollen.json: ${ohneRolle.join(", ")}`);
  console.error("        Traegt die Flaeche Schrift, Bauteile, beides oder nichts?");
  process.exit(1);
}

/**
 * Was eine Haarlinie ist und was ein Rand.
 *
 * WCAG 1.4.11 verlangt 3.0 fuer nicht-textliche Elemente, die Bedeutung
 * TRAGEN -- die Grenze eines Bedienelements, die Farbe eines Zustands. Eine
 * Trennlinie, die nur Flaechen scheidet, traegt keine Bedeutung: sie fiele
 * weg, ohne dass Information verloren geht.
 *
 * Beide stehen hier namentlich, mit Begruendung, statt dass die Schleife sie
 * stillschweigend auslaesst. Eine Ausnahme, die niemand sieht, ist von einer
 * Luecke nicht zu unterscheiden.
 */
const HAARLINIEN = {
  "status-neutral-border": "Neutral traegt keine Bedeutung ueber die Farbe -- es ist der Zustand «nichts Besonderes». Die Linie scheidet Flaechen, sie grenzt kein Bedienelement ab.",
  "nav-divider": "Trennt Gruppen in der Navigationsleiste. Ohne sie ginge keine Information verloren, nur Ruhe.",
};

const pruefungen = [];
const ausnahmen = [];

/** Marke: die Bedienhandlungen. */
pruefungen.push(["Markenton als Text auf weiss", alle["interactive-text"], alle["surface-default"], TEXT]);
pruefungen.push(["weiss auf dem Markenton", alle["surface-default"], alle["interactive-text"], TEXT]);
pruefungen.push(["weiss im Hover", alle["surface-default"], alle["interactive-text-hover"], TEXT]);
pruefungen.push(["weiss gedrueckt", alle["surface-default"], alle["interactive-text-active"], TEXT]);
pruefungen.push(["Markenton auf getoenter Flaeche", alle["interactive-text"], alle["interactive-surface"], TEXT]);
pruefungen.push(["Interaktionsrand gegen weiss", alle["interactive-border"], alle["surface-default"], NICHT_TEXT]);

/** Schrift: jede Schriftfarbe auf jedem Grund, der Schrift traegt. */
for (const grund of TEXTGRUENDE) {
  for (const schrift of Object.keys(farben.schrift)) {
    pruefungen.push([`${schrift} auf ${grund}`, alle[schrift], alle[grund], TEXT]);
  }
}

/**
 * Status und Dienstart: die Familien kommen aus der Datei.
 *
 * Aus `status-success-surface` wird die Familie `success` erkannt. Eine neue
 * Familie ist damit ab ihrer ersten Zeile gemessen.
 */
const familien = (gruppe, praefix) => [
  ...new Set(
    Object.keys(farben[gruppe]).map((n) => n.slice(praefix.length).replace(/-(surface|border|text)$/, ""))
  ),
];

for (const [gruppe, praefix] of [["status", "status-"], ["dienstart", "dienst-"]]) {
  for (const art of familien(gruppe, praefix)) {
    const flaeche = alle[`${praefix}${art}-surface`];
    const rand = alle[`${praefix}${art}-border`];
    const text = alle[`${praefix}${art}-text`];

    pruefungen.push([`${art}: Text auf eigener Flaeche`, text, flaeche, TEXT]);

    const grund = HAARLINIEN[`${praefix}${art}-border`];
    if (grund) {
      ausnahmen.push([`${praefix}${art}-border`, grund, Math.min(...BAUTEILGRUENDE.map((g) => k(rand, alle[g])))]);
    } else {
      for (const g of BAUTEILGRUENDE) {
        pruefungen.push([`${art}: Rand auf ${g}`, rand, alle[g], NICHT_TEXT]);
      }
    }
  }
}

/** Navigation: eine eigene Familie mit eigenen Paaren. */
pruefungen.push(["Navigationseintrag auf seinem Grund", alle["nav-item"], alle["nav-surface"], TEXT]);
pruefungen.push(["Navigationseintrag im Hover", alle["nav-item"], alle["nav-item-hover"], TEXT]);
pruefungen.push(["aktiver Eintrag auf seiner Flaeche", alle["nav-active-text"], alle["nav-active-surface"], TEXT]);
ausnahmen.push(["nav-divider", HAARLINIEN["nav-divider"], k(alle["nav-divider"], alle["nav-surface"])]);

let fehler = 0;
for (const [name, vorne, hinten, schwelle] of pruefungen) {
  const v = k(vorne, hinten);
  const ok = v >= schwelle;
  if (!ok) fehler++;
  console.log(`${ok ? "  ok  " : "FEHLER"}  ${v.toFixed(2).padStart(6)} / ${schwelle}  ${name}`);
}

console.log("");
for (const [name, grund, wert] of ausnahmen) {
  console.log(`  ohne Schwelle  ${wert.toFixed(2)}  ${name}`);
  console.log(`                 ${grund}`);
}

/**
 * Jeder Wert der Datei muss vorkommen -- gemessen oder begruendet ausgenommen.
 *
 * Sonst waechst die Datei und der Umfang nicht mit: ein neues Token liesse den
 * Lauf gruen, ohne je angesehen worden zu sein. `legacy` ist ausgenommen, weil
 * die Gruppe die abgeloesten Werte fuehrt, damit die Migration sie ueberhaupt
 * noch aufloesen kann.
 */
const beruehrt = new Set([
  ...pruefungen.flatMap(([, a, b]) => [a, b]),
  ...ausnahmen.map(([n]) => alle[n]),
]);
const ungesehen = Object.entries(alle).filter(
  ([n, w]) => !beruehrt.has(w) && !Object.keys(farben.legacy).includes(n)
);
if (ungesehen.length) {
  console.error("");
  for (const [n] of ungesehen) {
    console.error(`FEHLER  ${n} kommt in keiner Pruefung und in keiner Ausnahme vor.`);
  }
  fehler += ungesehen.length;
}

console.log("");
if (fehler) {
  console.error(`${fehler} Pruefung(en) durchgefallen.`);
  process.exit(1);
}
console.log(`${pruefungen.length} Paare gemessen, ${ausnahmen.length} begruendete Ausnahmen.`);

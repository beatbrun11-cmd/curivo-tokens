import { describe, expect, it } from "vitest";
import { FARBEN, alleFarben, DIENSTARTEN } from "../index";

/**
 * Wächter über die eine Farbquelle.
 *
 * Was hier durchgeht, geht in ALLE Module. Ein Fehler ist damit nicht an
 * einer Stelle falsch, sondern überall gleichzeitig.
 */
describe("Farbquelle", () => {
  it("jeder Wert ist eine vollständige Hex-Farbe", () => {
    // Kurzformen wie `#FFF` und Namen wie `white` rechnet der Kontrast-Wächter
    // nicht -- er würde sie stillschweigend als 0 behandeln.
    const krumm = Object.entries(alleFarben).filter(([, v]) => !/^#[0-9A-F]{6}$/.test(v));
    expect(krumm).toEqual([]);
  });

  it("nur die bekannten Werte stehen doppelt", () => {
    /**
     * Gleiche Werte unter verschiedenen Namen sind nicht falsch — sie meinen
     * verschiedene Rollen, die heute zufaellig gleich aussehen. Falsch waere,
     * wenn eine NEUE Dopplung unbemerkt entstuende: dann haette jemand eine
     * Rolle mit dem Wert einer anderen belegt, statt ihr einen eigenen zu
     * geben, und beim naechsten Anpassen wanderten beide mit.
     *
     * Darum die Liste: sie haelt fest, welche Dopplungen gewollt sind, und
     * warum.
     */
    /**
     * Indiziert nach NAMENSPAAR, nicht nach Wert. Nach Wert indiziert hiesse:
     * ist `#FFFFFF` einmal erlaubt, ist es ueberall erlaubt — dann koennte
     * jemand einen Statustext auf Weiss setzen und der Test bliebe gruen.
     */
    const GEWOLLT: Record<string, string> = {
      "flaechen.surface-page|navigation.nav-surface":
        "Seitengrund und Navigationsflaeche sind dasselbe Weiss-Grau",
      "marke.interactive-surface|navigation.nav-active-surface":
        "die aktive Navigation und die getoente Interaktionsflaeche",
      "flaechen.surface-warm|status.status-neutral-surface":
        "warme Flaeche und neutrale Statusflaeche",
      "marke.interactive-text|navigation.nav-active-text":
        "Markenton als Text und als aktiver Navigationseintrag",
      "navigation.nav-item|status.status-neutral-text":
        "Navigationseintrag und neutraler Statustext",
      "dienstart.dienst-nacht-border|dienstart.dienst-nacht-surface":
        "das gefuellte Nacht-Abzeichen hat keinen eigenen Rand",
      "dienstart.dienst-frueh-surface|dienstart.dienst-nacht-text":
        "das helle Abzeichen ist weiss, die Schrift auf dem dunklen auch",
      "dienstart.dienst-frueh-surface|flaechen.surface-default":
        "das helle Abzeichen sitzt auf reinem Weiss",
      "dienstart.dienst-nacht-text|flaechen.surface-default":
        "weiss ist Flaeche und Schrift zugleich",
    };

    const proWert: Record<string, string[]> = {};
    for (const [gruppe, werte] of Object.entries(FARBEN)) {
      if (gruppe === "legacy") continue;
      for (const [name, wert] of Object.entries(werte as Record<string, string>)) {
        (proWert[wert] ??= []).push(`${gruppe}.${name}`);
      }
    }
    const unerklaert: string[] = [];
    for (const [wert, namen] of Object.entries(proWert)) {
      if (namen.length < 2) continue;
      for (let i = 0; i < namen.length; i++) {
        for (let j = i + 1; j < namen.length; j++) {
          const paar = [namen[i], namen[j]].sort().join("|");
          if (!GEWOLLT[paar]) unerklaert.push(`${wert}: ${paar}`);
        }
      }
    }
    expect(unerklaert).toEqual([]);
  });

  it("die drei Dienstarten tragen je Fläche, Rand und Text", () => {
    // Eine Kategorie, keine Bewertung -- und ihre Stufen unterscheiden sich an
    // der Form, nicht nur am Ton: Umriss, getönt, gefüllt.
    for (const d of DIENSTARTEN) {
      for (const teil of ["surface", "border", "text"]) {
        expect(alleFarben[`dienst-${d}-${teil}`], `dienst-${d}-${teil}`).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });

  it("die Dienstarten benutzen weder Marken- noch Statusfarben", () => {
    /**
     * Zuvor trug Früh den Markenton und Spät den Warnton.
     * Früh sah damit aus wie eine Bedienhandlung, Spät wie eine Warnung — eine
     * Kategorie, die sich als etwas anderes ausgibt.
     */
    const fremd = new Set([
      ...Object.values(FARBEN.marke),
      ...Object.values(FARBEN.status),
      ...Object.values(FARBEN.legacy),
      // Und die Farben, die es zuvor waren. Sie stehen in keiner Gruppe
      // dieser Datei — ohne sie liesse der Test genau den Rueckfall durch, den
      // er verhindern soll.
      "#00B4B4", // trug frueher den Fruehdienst
      "#E8A817", // Gold: trug frueher den Spaetdienst UND die Warnung
      "#4B0082", // das alte Violett des Nachtdienstes
    ]);
    const kollision = Object.entries(alleFarben)
      .filter(([n, v]) => n.startsWith("dienst-") && fremd.has(v))
      .map(([n]) => n);
    expect(kollision).toEqual([]);
  });

  it("die Legacy-Gruppe ist als solche erkennbar", () => {
    // Sie steht hier, damit die Migration die alten Werte noch auflösen kann.
    // Wer sie für neue Arbeit benutzt, soll es wenigstens sehen.
    expect(Object.keys(FARBEN.legacy).every((k) => k.startsWith("brand-"))).toBe(true);
  });
});

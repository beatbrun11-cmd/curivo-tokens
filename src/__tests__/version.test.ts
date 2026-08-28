import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FARBSTAND, KENNUNG, VERSION } from "../version";

/**
 * `version.ts` wird erzeugt, nicht gepflegt. Diese Pruefungen fangen den Fall,
 * dass jemand die Datei von Hand aendert oder das Erzeugen ueberspringt --
 * dann sagt das Paket etwas ueber sich, was nicht stimmt, und beide Module
 * geben es an ihrer oeffentlichen Seite aus.
 */
describe("Kennung des Pakets", () => {
  it("die Fassung stimmt mit dem Manifest ueberein", () => {
    const manifest = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8")
    );
    expect(VERSION).toBe(manifest.version);
  });

  it("der Farbstand ist der Abdruck der Farbdatei", () => {
    /**
     * Der Teil, der etwas beweist. Ein verschobenes Tag mit geaenderten Farben
     * traegt dieselbe Nummer -- aber einen anderen Abdruck. Waere er von Hand
     * gepflegt, waere er wieder nur eine Behauptung.
     */
    const erwartet = createHash("sha256")
      .update(readFileSync(new URL("../farben.json", import.meta.url)))
      .digest("hex")
      .slice(0, 8);
    expect(FARBSTAND).toBe(erwartet);
  });

  it("die Kennung setzt beides zusammen", () => {
    expect(KENNUNG).toBe(`${VERSION}+${FARBSTAND}`);
  });
});

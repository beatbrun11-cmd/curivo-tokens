import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { VERSION } from "../version";

describe("Fassungsnummer", () => {
  it("stimmt mit dem Manifest ueberein", () => {
    // Von Hand gepflegt und darum pruefbedürftig: eine Fassung, die sich
    // selbst falsch benennt, laesst zwei Module gleich aussehen, die es
    // nicht sind.
    const manifest = JSON.parse(
      readFileSync(new URL("../../package.json", import.meta.url), "utf8")
    );
    expect(VERSION).toBe(manifest.version);
  });
});

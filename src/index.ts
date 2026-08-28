import farben from "./farben.json";

/**
 * Die Farbwerte von Curivo — eine Quelle für alle Module.
 *
 * **Warum ein Paket und keine Kopie.** In einem der Module nennt sich eine
 * CSS-Datei selbst «Spiegelbild» der Tailwind-Konfiguration — und die beiden
 * sind trotzdem zweimal auseinandergelaufen, innerhalb einer Dateigrenze von
 * zwei Zeilen. Über zwei Repositories hinweg wäre es eine Frage von Wochen.
 *
 * **Was hier NICHT hineingehört.** Keine Bausteine, keine Klassen, keine
 * Geometrie. Nur Werte. Die Module bringen ihre eigenen Bauteile mit; die
 * Bibliotheken zusammenzulegen wäre ein anderes Vorhaben mit anderen Risiken.
 *
 * **Jeder Wert ist gemessen.** Die Schwellen aus WCAG 2.1 — 4.5 für Text,
 * 3.0 für Rahmen an Bedienelementen. Wer hier einen Wert ändert, ändert ihn
 * für alle Module gleichzeitig.
 */
export const FARBEN = farben;

/** Alle Werte flach, wie Tailwind sie erwartet. */
export const alleFarben: Record<string, string> = Object.assign(
  {},
  ...Object.values(farben)
);

/**
 * Die Dienstarten sind eine KATEGORIE, kein Status.
 *
 * Zuvor trug der Frühdienst den Markenton und der Spätdienst den Warnton:
 * Früh sah damit aus wie eine Bedienhandlung, Spät wie eine Warnung — eine
 * Kategorie, die sich als etwas anderes ausgibt. Beide Abzeichen erreichten
 * ausserdem nur 1.94 bzw. 1.81 zu 1.
 *
 * Sie sind jetzt eine eigene Familie in drei Stufen, die dem Tag folgt: hell,
 * getönt, dunkel.
 *
 * **Was die Farbe hier leistet und was nicht.** Das Abzeichen trägt immer das
 * Wort — «Frühdienst», «Spätdienst», «Nachtdienst». Die Farbe ordnet, sie
 * benennt nicht. Ein erster Entwurf gab Früh und Spät denselben Rahmen und
 * unterschied sie allein an einer Tönung von 1.39 zu 1; das war als «Umriss
 * gegen getönt» beschrieben und hielt in Wirklichkeit nichts. Jetzt
 * unterscheiden sich Fläche UND Rahmen UND Text.
 *
 * Gemessen: Text auf eigener Fläche 10.41 / 7.73 / 14.51, Rahmen gegen weiss
 * 3.85 / 8.86 / 14.51. Früh gegen Spät: Flächen 2.02, Rahmen 2.30 — auf
 * warmem Grund noch 1.84.
 */
export const DIENSTARTEN = ["frueh", "spaet", "nacht"] as const;
export type Dienstart = (typeof DIENSTARTEN)[number];

export { VERSION } from "./version";

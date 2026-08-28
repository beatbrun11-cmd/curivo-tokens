/**
 * ERZEUGT von scripts/fassung-schreiben.mjs -- nicht von Hand aendern.
 *
 * Die Kennung, die mit dem Paket reist und die beide Module an ihrer
 * oeffentlichen Anmeldeseite ausgeben. Sie besteht aus der Fassungsnummer und
 * einem Fingerabdruck der Farbwerte.
 *
 * Der Fingerabdruck ist der Teil, der etwas beweist: ein verschobenes Tag mit
 * geaenderten Farben traegt dieselbe Nummer, aber einen anderen Abdruck. Zwei
 * Module mit derselben KENNUNG beziehen dieselbe Quelle -- was sie daraus
 * machen, sagt die Kennung nicht. Wer einzelne Werte in seiner eigenen
 * Konfiguration ueberschreibt, zeigt trotz gleicher Kennung andere Farben.
 */
export const VERSION = "1.1.1";

/** Fingerabdruck der Farbwerte -- die ersten acht Stellen des SHA-256. */
export const FARBSTAND = "41906acb";

/** Was die Module ausgeben: Fassung und Farbstand zusammen. */
export const KENNUNG = `${VERSION}+${FARBSTAND}`;

/**
 * Welche Fassung der Farben hier liegt.
 *
 * **Wozu.** Flow und Voice sind zwei getrennte Repositories mit zwei getrennten
 * Auslieferungen. Beide beziehen diese Werte, aber nichts zwingt sie auf
 * dieselbe Fassung -- ausser man kann von aussen sehen, welche wo laeuft. Die
 * Module geben diesen Wert an ihren oeffentlichen Seiten aus; der Waechter
 * vergleicht sie und schlaegt an, wenn sie auseinanderlaufen.
 *
 * Eine Absichtserklaerung in einer Manifestdatei taugt dafuer nicht: sie sagt,
 * was jemand aufgeschrieben hat, nicht was gebaut wurde. Dieser Wert reist mit
 * dem Paket und ist darum das, was wirklich laeuft.
 *
 * Er wird von Hand gepflegt und von `version.test.ts` gegen `package.json`
 * geprueft -- eine Fassung, die sich selbst falsch benennt, waere schlimmer
 * als gar keine.
 */
export const VERSION = "1.0.3";

import { alleFarben } from "./index";

/**
 * Der Farbteil einer Tailwind-Konfiguration.
 *
 * Gedacht zum Einsetzen in `theme.extend.colors`. Alle Module ziehen ihre
 * Farben daraus, damit keines eine eigene Liste führt.
 */
export const farbenFuerTailwind = alleFarben;

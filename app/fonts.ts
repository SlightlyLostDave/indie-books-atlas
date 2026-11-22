import { Playfair_Display, Jost, IBM_Plex_Mono } from "next/font/google";

/**
 * The three locked families (BRIEF 2.2), shared by the root layout and
 * global-error, which renders its own document.
 */
export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
});

export const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const fontVariables = [playfair.variable, jost.variable, plexMono.variable].join(" ");

/** Sets the stored theme class before first paint (dark by default). */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
    document.documentElement.classList.add(theme);
  } catch (e) {}
})();
`;

import { defineTheme } from "@astryxdesign/core";
import { neutralTheme } from "@astryxdesign/theme-neutral";

const NAVY = "#121a25";
const PANEL_NAVY = "#172231";
const CREAM = "#f7f4ed";
const GOLD = "#c59042";
const GOLD_HOVER = "#d7a95f";

export const sswTheme = defineTheme({
  name: "ssw",
  extends: neutralTheme,
  color: {
    accent: GOLD,
  },
  tokens: {
    "--color-background-body": [CREAM, NAVY],
    "--color-background-surface": ["#ffffff", PANEL_NAVY],
    "--color-background-card": ["#ffffff", PANEL_NAVY],
    "--color-background-muted": ["#f1ede4", "#0e1620"],
    "--color-background-popover": ["#ffffff", PANEL_NAVY],
    "--color-text-primary": [NAVY, CREAM],
    "--color-text-secondary": ["#5b5346", "rgba(247, 244, 237, 0.65)"],
    "--color-border": ["rgba(18, 26, 37, 0.12)", "rgba(255, 255, 255, 0.12)"],
    "--color-border-emphasized": [
      "rgba(18, 26, 37, 0.24)",
      "rgba(255, 255, 255, 0.24)",
    ],
    "--color-on-accent": NAVY,
  },
  components: {
    button: {
      "variant:primary": {
        backgroundColor: GOLD,
        color: NAVY,
        ":hover": { backgroundColor: GOLD_HOVER },
      },
    },
    badge: {
      "variant:info": {
        backgroundColor: GOLD,
        color: NAVY,
      },
    },
  },
});

import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

// ============================================================================
// DESIGN TOKENS - Centralized color and design system
// ============================================================================

// Primary gradient colors
export const GRADIENT_COLORS = {
  blue: "#3b82f6", // Primary blue
  blueLight: "#60a5fa", // Light blue for button gradients
  purple: "#9333ea", // Primary purple
} as const;

// Accent colors
export const ACCENT_COLORS = {
  cyan: {
    300: "#67e8f9",
    400: "#22d3ee",
    bg: "rgba(6, 182, 212, 0.15)", // Background with opacity
  },
} as const;

// Use case icon colors
export const ICON_COLORS = {
  teal: "#14b8a6",
  blue: GRADIENT_COLORS.blue,
  green: "#22c55e",
  yellow: "#eab308",
  purple: GRADIENT_COLORS.purple,
  orange: "#f97316",
} as const;

// Gradient helpers
export const GRADIENTS = {
  primary: `linear-gradient(90deg, ${GRADIENT_COLORS.blue}, ${GRADIENT_COLORS.purple})`,
  primaryReverse: `linear-gradient(90deg, ${GRADIENT_COLORS.purple}, ${GRADIENT_COLORS.blue})`,
  primaryDiagonal: `linear-gradient(135deg, ${GRADIENT_COLORS.blue}, ${GRADIENT_COLORS.purple})`,
  primaryDiagonalReverse: `linear-gradient(135deg, ${GRADIENT_COLORS.purple}, ${GRADIENT_COLORS.blue})`,
  button: `linear-gradient(90deg, ${GRADIENT_COLORS.blueLight}, ${GRADIENT_COLORS.purple})`,
} as const;

// Custom theme configuration for Chakra UI v3
// Poppins for headings and main text, Roboto for body text
// Default text colors set to black/dark gray
export const customTheme = defineConfig({
  theme: {
    tokens: {
      colors: {
        primary: {
          50: { value: "#faf5ff" },
          100: { value: "#f3e8ff" },
          200: { value: "#e9d5ff" },
          300: { value: "#d8b4fe" },
          400: { value: "#c084fc" },
          500: { value: "#a855f7" },
          600: { value: GRADIENT_COLORS.purple }, // Purple
          700: { value: "#7e22ce" },
          800: { value: "#6b21a8" },
          900: { value: "#581c87" },
        },
        accent: {
          blue: { value: GRADIENT_COLORS.blue },
          blueLight: { value: GRADIENT_COLORS.blueLight },
          purple: { value: GRADIENT_COLORS.purple },
          cyan: {
            300: { value: ACCENT_COLORS.cyan[300] },
            400: { value: ACCENT_COLORS.cyan[400] },
          },
        },
      },
      fonts: {
        heading: { value: "var(--font-poppins), system-ui, sans-serif" },
        body: { value: "var(--font-roboto), system-ui, sans-serif" },
        mono: { value: "var(--font-roboto), monospace" },
      },
    },
    semanticTokens: {
      colors: {
        "button.primary": { value: "{colors.primary.600}" },
        "button.primary.hover": { value: "{colors.primary.700}" },
        "button.secondary": { value: "rgba(20, 184, 166, 0.1)" },
        "button.secondary.hover": { value: "rgba(20, 184, 166, 0.2)" },
        "fg.default": { value: "{colors.gray.900}" },
        "fg.muted": { value: "{colors.gray.600}" },
        "fg.subtle": { value: "{colors.gray.500}" },
      },
    },
  },
  globalCss: {
    body: {
      color: "gray.900",
    },
    h1: {
      color: "gray.900",
    },
    h2: {
      color: "gray.900",
    },
    h3: {
      color: "gray.900",
    },
    h4: {
      color: "gray.900",
    },
    h5: {
      color: "gray.900",
    },
    h6: {
      color: "gray.900",
    },
  },
});

// Create the system with custom theme
export const customSystem = createSystem(defaultConfig, customTheme);

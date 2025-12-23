import { extendTheme } from "@chakra-ui/react";

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
  pink: "#ec4899",
  indigo: "#6366f1",
  cyan: "#06b6d4",
  emerald: "#10b981",
  violet: "#8b5cf6",
  rose: "#f43f5e",
} as const;

// Gradient helpers
export const GRADIENTS = {
  primary: `linear-gradient(90deg, ${GRADIENT_COLORS.blue}, ${GRADIENT_COLORS.purple})`,
  primaryReverse: `linear-gradient(90deg, ${GRADIENT_COLORS.purple}, ${GRADIENT_COLORS.blue})`,
  primaryDiagonal: `linear-gradient(135deg, ${GRADIENT_COLORS.blue}, ${GRADIENT_COLORS.purple})`,
  primaryDiagonalReverse: `linear-gradient(135deg, ${GRADIENT_COLORS.purple}, ${GRADIENT_COLORS.blue})`,
  button: `linear-gradient(90deg, ${GRADIENT_COLORS.blueLight}, ${GRADIENT_COLORS.purple})`,
} as const;

// Custom theme configuration for Chakra UI v2
// Poppins for headings and main text, Roboto for body text
// Default text colors set to black/dark gray
export const customTheme = extendTheme({
  colors: {
    primary: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: GRADIENT_COLORS.purple, // Purple
      700: "#7e22ce",
      800: "#6b21a8",
      900: "#581c87",
    },
    accent: {
      blue: GRADIENT_COLORS.blue,
      blueLight: GRADIENT_COLORS.blueLight,
      purple: GRADIENT_COLORS.purple,
      cyan: {
        300: ACCENT_COLORS.cyan[300],
        400: ACCENT_COLORS.cyan[400],
      },
    },
  },
  fonts: {
    heading: "var(--font-poppins), system-ui, sans-serif",
    body: "var(--font-roboto), system-ui, sans-serif",
    mono: "var(--font-roboto), monospace",
  },
  semanticTokens: {
    colors: {
      "button.primary": "primary.600",
      "button.primary.hover": "primary.700",
      "button.secondary": "rgba(20, 184, 166, 0.1)",
      "button.secondary.hover": "rgba(20, 184, 166, 0.2)",
      "fg.default": "gray.900",
      "fg.muted": "gray.600",
      "fg.subtle": "gray.500",
    },
  },
  styles: {
    global: {
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
  },
});

// Export as customSystem for backward compatibility
export const customSystem = customTheme;

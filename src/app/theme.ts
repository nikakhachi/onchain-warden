import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

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
          500: { value: "#a855f7" }, // Warmer vibrant purple
          600: { value: "#9333ea" }, // Darker purple
          700: { value: "#7e22ce" },
          800: { value: "#6b21a8" },
          900: { value: "#581c87" },
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
        "fg.default": { value: "{colors.gray.900}" }, // Default foreground color (black)
        "fg.muted": { value: "{colors.gray.600}" }, // Muted text color
        "fg.subtle": { value: "{colors.gray.500}" }, // Subtle text color
      },
    },
  },
  globalCss: {
    body: {
      color: "gray.900", // Default body text color to black/dark gray
    },
    h1: {
      color: "gray.900", // Default heading color to black/dark gray
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

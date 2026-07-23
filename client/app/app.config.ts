// English description: Configures the shared Nuxt UI theme and component defaults.
export default defineAppConfig({
  ui: {
    colors: {
      primary: "red",
      secondary: "slate",
      success: "sky",
      info: "blue",
      warning: "yellow",
      error: "red",
      neutral: "slate",
    },
    button: {
      slots: {
        base: "relative cursor-pointer pointer-events-auto select-none",
      },
    },
  },
})

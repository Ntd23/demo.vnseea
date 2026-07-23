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
    input: {
      slots: {
        base: "text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
        leadingIcon: "text-[var(--icon-secondary)]",
        trailingIcon: "text-[var(--icon-secondary)]",
      },
      variants: {
        variant: {
          outline:
            "bg-[var(--bg-surface)] ring ring-inset ring-[var(--border-light)]",
          subtle:
            "bg-[var(--bg-muted)] ring ring-inset ring-[var(--border-light)]",
        },
      },
    },
    textarea: {
      slots: {
        base: "text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
        leadingIcon: "text-[var(--icon-secondary)]",
        trailingIcon: "text-[var(--icon-secondary)]",
      },
      variants: {
        variant: {
          outline:
            "bg-[var(--bg-surface)] ring ring-inset ring-[var(--border-light)]",
          subtle:
            "bg-[var(--bg-muted)] ring ring-inset ring-[var(--border-light)]",
        },
      },
    },
    select: {
      slots: {
        base: "text-[var(--text-primary)]",
        value: "text-[var(--text-primary)]",
        placeholder: "text-[var(--text-secondary)]",
        leadingIcon: "text-[var(--icon-secondary)]",
        trailingIcon: "text-[var(--icon-secondary)]",
        content:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] ring-[var(--border-light)]",
        empty: "text-[var(--text-secondary)]",
        label: "text-[var(--text-primary)]",
        separator: "bg-[var(--border-light)]",
        item: "text-[var(--text-primary)] data-highlighted:not-data-disabled:text-[var(--text-primary)] data-highlighted:not-data-disabled:before:bg-[var(--bg-surface-hover)]",
        itemLeadingIcon: "text-[var(--icon-secondary)]",
        itemDescription: "text-[var(--text-secondary)]",
      },
      variants: {
        variant: {
          outline:
            "bg-[var(--bg-surface)] ring ring-inset ring-[var(--border-light)] hover:bg-[var(--bg-surface-hover)]",
          subtle:
            "bg-[var(--bg-muted)] ring ring-inset ring-[var(--border-light)] hover:bg-[var(--bg-surface-hover)]",
        },
      },
    },
    selectMenu: {
      slots: {
        base: "text-[var(--text-primary)]",
        value: "text-[var(--text-primary)]",
        placeholder: "text-[var(--text-secondary)]",
        leadingIcon: "text-[var(--icon-secondary)]",
        trailingIcon: "text-[var(--icon-secondary)]",
        content:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] ring-[var(--border-light)]",
        input:
          "border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-primary)]",
        empty: "text-[var(--text-secondary)]",
        label: "text-[var(--text-primary)]",
        separator: "bg-[var(--border-light)]",
        item: "text-[var(--text-primary)] data-highlighted:not-data-disabled:text-[var(--text-primary)] data-highlighted:not-data-disabled:before:bg-[var(--bg-surface-hover)]",
        itemLeadingIcon: "text-[var(--icon-secondary)]",
        itemDescription: "text-[var(--text-secondary)]",
      },
      variants: {
        variant: {
          outline:
            "bg-[var(--bg-surface)] ring ring-inset ring-[var(--border-light)] hover:bg-[var(--bg-surface-hover)]",
          subtle:
            "bg-[var(--bg-muted)] ring ring-inset ring-[var(--border-light)] hover:bg-[var(--bg-surface-hover)]",
        },
      },
    },
    listbox: {
      slots: {
        root: "bg-[var(--bg-surface)] text-[var(--text-primary)] ring-[var(--border-light)]",
        input:
          "border-[var(--border-light)] bg-[var(--bg-surface)] text-[var(--text-primary)]",
        label: "text-[var(--text-primary)]",
        separator: "bg-[var(--border-light)]",
        empty: "text-[var(--text-secondary)]",
        loading: "text-[var(--text-secondary)]",
        item: "text-[var(--text-primary)] data-highlighted:not-data-disabled:text-[var(--text-primary)] data-highlighted:not-data-disabled:before:bg-[var(--bg-surface-hover)]",
        itemLeadingIcon: "text-[var(--icon-secondary)]",
        itemDescription: "text-[var(--text-secondary)]",
      },
    },
  },
});

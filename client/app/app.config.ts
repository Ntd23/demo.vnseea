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
    icons: {
      light: "i-ph-sun-bold",
      dark: "i-ph-moon-bold",
    },
    button: {
      slots: {
        base: "relative cursor-pointer pointer-events-auto select-none",
      },
    },
    avatar: {
      slots: {
        root: "bg-[var(--bg-muted)]",
        fallback: "text-[var(--text-secondary)]",
        icon: "text-[var(--icon-secondary)]",
      },
    },
    card: {
      slots: {
        root: "text-[var(--text-primary)]",
        header: "border-[var(--border-light)]",
        title: "text-[var(--text-primary)]",
        description: "text-[var(--text-secondary)]",
        body: "text-[var(--text-primary)]",
        footer: "border-[var(--border-light)]",
      },
      variants: {
        variant: {
          outline: {
            root: "bg-[var(--bg-surface)] ring-[var(--border-light)] divide-[var(--border-light)]",
          },
          soft: {
            root: "bg-[var(--bg-muted)] divide-[var(--border-light)]",
          },
          subtle: {
            root: "bg-[var(--bg-muted)] ring-[var(--border-light)] divide-[var(--border-light)]",
          },
        },
      },
    },
    toast: {
      slots: {
        root: "bg-[var(--bg-surface)] text-[var(--text-primary)] ring-[var(--border-light)]",
        title: "text-[var(--text-primary)]",
        description: "text-[var(--text-secondary)]",
      },
    },
    modal: {
      slots: {
        overlay: "bg-elevated/75",
        content:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] divide-[var(--border-light)] ring-[var(--border-light)]",
        header: "border-[var(--border-light)]",
        body: "text-[var(--text-primary)]",
        footer: "border-[var(--border-light)]",
        title: "text-[var(--text-primary)]",
        description: "text-[var(--text-secondary)]",
      },
    },
    commandPalette: {
      slots: {
        root: "bg-[var(--bg-surface)] text-[var(--text-primary)] divide-[var(--border-light)]",
        input: "text-[var(--text-primary)]",
        close:
          "text-[var(--icon-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]",
        back: "text-[var(--icon-secondary)]",
        content: "bg-[var(--bg-surface)]",
        empty: "text-[var(--text-secondary)]",
        label: "text-[var(--text-primary)]",
        item: "text-[var(--text-primary)] data-highlighted:not-data-disabled:text-[var(--text-primary)] data-highlighted:not-data-disabled:before:bg-[var(--bg-surface-hover)]",
        itemLeadingIcon: "text-[var(--icon-secondary)]",
        itemTrailingHighlightedIcon: "text-[var(--icon-secondary)]",
        itemLabel: "text-[var(--text-primary)]",
        itemDescription: "text-[var(--text-secondary)]",
        itemLabelBase:
          "text-[var(--text-primary)] [&>mark]:bg-[var(--bg-surface-active)] [&>mark]:text-[var(--text-brand)]",
        itemLabelPrefix: "text-[var(--text-secondary)]",
        itemLabelSuffix:
          "text-[var(--text-secondary)] [&>mark]:bg-[var(--bg-surface-active)] [&>mark]:text-[var(--text-brand)]",
        footer: "border-[var(--border-light)] text-[var(--text-secondary)]",
      },
    },
    contentSearch: {
      slots: {
        modal:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] ring-[var(--border-light)] shadow-[var(--shadow-xl)]",
        input: "border-[var(--border-light)] bg-[var(--bg-surface)]",
      },
    },
    drawer: {
      slots: {
        overlay: "bg-elevated/75",
        content:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] ring-[var(--border-light)]",
        handle: "!bg-[var(--bg-surface-active)]",
        title: "text-[var(--text-primary)]",
        description: "text-[var(--text-secondary)]",
        body: "text-[var(--text-primary)]",
      },
    },
    slideover: {
      slots: {
        overlay: "bg-elevated/75",
        content:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] divide-[var(--border-light)] ring-[var(--border-light)]",
        header: "border-[var(--border-light)]",
        body: "text-[var(--text-primary)]",
        footer: "border-[var(--border-light)]",
        title: "text-[var(--text-primary)]",
        description: "text-[var(--text-secondary)]",
      },
    },
    popover: {
      slots: {
        content:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] ring-[var(--border-light)]",
        arrow: "fill-[var(--bg-surface)] stroke-[var(--border-light)]",
      },
    },
    dropdownMenu: {
      slots: {
        content:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] ring-[var(--border-light)]",
        input: "border-[var(--border-light)]",
        empty: "text-[var(--text-secondary)]",
        viewport: "divide-[var(--border-light)]",
        arrow: "fill-[var(--bg-surface)] stroke-[var(--border-light)]",
        label: "text-[var(--text-primary)]",
        separator: "bg-[var(--border-light)]",
        item: "text-[var(--text-primary)] data-highlighted:before:bg-[var(--bg-surface-hover)] data-[state=open]:before:bg-[var(--bg-surface-hover)]",
        itemLeadingIcon: "text-[var(--icon-secondary)]",
        itemDescription: "text-[var(--text-secondary)]",
        itemLabelExternalIcon: "text-[var(--icon-secondary)]",
      },
    },
    tooltip: {
      slots: {
        content:
          "bg-[var(--bg-surface)] text-[var(--text-primary)] ring-[var(--border-light)]",
        arrow: "fill-[var(--bg-surface)] stroke-[var(--border-light)]",
      },
    },
    formField: {
      slots: {
        label: "text-[var(--text-primary)]",
        description: "text-[var(--text-secondary)]",
        hint: "text-[var(--text-secondary)]",
        help: "text-[var(--text-secondary)]",
      },
    },
    checkbox: {
      slots: {
        base: "ring-[var(--border-light)]",
        label: "text-[var(--text-primary)]",
        description: "text-[var(--text-secondary)]",
      },
      variants: {
        variant: {
          card: {
            root: "border-[var(--border-light)] bg-[var(--bg-surface)]",
          },
        },
      },
    },
    radioGroup: {
      slots: {
        legend: "text-[var(--text-primary)]",
        item: "text-[var(--text-primary)]",
        base: "ring-[var(--border-light)]",
        label: "text-[var(--text-primary)]",
        description: "text-[var(--text-secondary)]",
      },
      variants: {
        variant: {
          card: {
            item: "border-[var(--border-light)] bg-[var(--bg-surface)]",
          },
          table: {
            item: "border-[var(--border-light)] bg-[var(--bg-surface)]",
          },
        },
      },
    },
    fileUpload: {
      slots: {
        base: "border-[var(--border-light)] bg-[var(--bg-surface)]",
        label: "text-[var(--text-primary)]",
        description: "text-[var(--text-secondary)]",
        fileName: "text-[var(--text-primary)]",
        fileSize: "text-[var(--text-secondary)]",
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
    inputDate: {
      slots: {
        base: "text-[var(--text-primary)]",
        leadingIcon: "text-[var(--icon-secondary)]",
        trailingIcon: "text-[var(--icon-secondary)]",
        segment:
          "text-[var(--text-primary)] data-placeholder:text-[var(--text-secondary)] data-[segment=literal]:text-[var(--text-secondary)]",
        separatorIcon: "text-[var(--icon-secondary)]",
      },
      variants: {
        variant: {
          outline:
            "bg-[var(--bg-surface)] ring ring-inset ring-[var(--border-light)]",
          soft: "bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] focus:bg-[var(--bg-surface-hover)]",
          subtle:
            "bg-[var(--bg-muted)] ring ring-inset ring-[var(--border-light)]",
        },
      },
    },
    inputNumber: {
      slots: {
        base: "text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
        increment: "text-[var(--icon-secondary)]",
        decrement: "text-[var(--icon-secondary)]",
      },
      variants: {
        variant: {
          outline:
            "bg-[var(--bg-surface)] ring ring-inset ring-[var(--border-light)]",
          soft: "bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] focus:bg-[var(--bg-surface-hover)]",
          subtle:
            "bg-[var(--bg-muted)] ring ring-inset ring-[var(--border-light)]",
        },
      },
    },
    pinInput: {
      slots: {
        base: "text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]",
      },
      variants: {
        variant: {
          outline:
            "bg-[var(--bg-surface)] ring ring-inset ring-[var(--border-light)]",
          soft: "bg-[var(--bg-muted)] hover:bg-[var(--bg-surface-hover)] focus:bg-[var(--bg-surface-hover)]",
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
    table: {
      slots: {
        root: "border-[var(--border-light)]",
        base: "bg-[var(--bg-surface)] text-[var(--text-primary)]",
        tbody: "divide-[var(--border-light)]",
        tr: "data-[selected=true]:bg-[var(--bg-surface-hover)]",
        th: "text-[var(--text-primary)]",
        td: "text-[var(--text-secondary)]",
        separator: "bg-[var(--border-light)]",
        empty: "text-[var(--text-secondary)]",
      },
    },
    user: {
      slots: {
        name: "text-[var(--text-primary)]",
        description: "text-[var(--text-secondary)]",
      },
    },
    skeleton: {
      base: "bg-[var(--bg-surface-hover)]",
    },
    progress: {
      slots: {
        base: "bg-[var(--bg-surface-active)]",
        status: "text-[var(--text-secondary)]",
      },
    },
    slider: {
      slots: {
        track: "bg-[var(--bg-surface-active)]",
        thumb: "bg-[var(--bg-surface)]",
      },
    },
    switch: {
      slots: {
        base: "border-[var(--border-light)] data-[state=unchecked]:bg-[var(--bg-surface-active)]",
        thumb: "bg-[var(--color-on-brand)]",
        icon: "text-[var(--color-primary-700)]",
        label: "text-[var(--text-primary)]",
        description: "text-[var(--text-secondary)]",
      },
    },
  },
});

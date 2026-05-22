// English description: Owns the TipTap editor instance, command toolbar state, and content synchronization for blog authoring.

import type { Ref } from "vue"
import { TiptapImage, TiptapStarterKit, useEditor } from "#imports"

type CreateBlogEditorTool = {
  key: string
  label: string
  icon: string
  isActive: () => boolean
  run: () => void
}

export function useCreateBlogEditorVM(content: Ref<string>) {
  const { t } = useI18n()

  const logEditorState = (step: string, payload: Record<string, unknown> = {}) => {
    console.info("[CreateBlogTipTap]", step, {
      hasEditor: Boolean(editor.value),
      contentLength: content.value.length,
      ...payload,
    })
  }

  const readPastedImage = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ""))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const syncContentFromEditor = () => {
    const instance = editor.value
    if (!instance) return

    content.value = instance.getHTML()
    logEditorState("content-updated", {
      htmlLength: content.value.length,
      textLength: instance.getText().trim().length,
      isEmpty: instance.isEmpty,
    })
  }

  const editor = useEditor({
    content: content.value,
    extensions: [
      TiptapStarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      TiptapImage.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "create-blog-page__tiptap-image",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: "create-blog-page__tiptap-content",
      },
      handlePaste: (view, event) => {
        const files = Array.from(event.clipboardData?.files ?? [])
          .filter(file => file.type.startsWith("image/"))

        if (!files.length) return false

        event.preventDefault()

        files.forEach((file) => {
          readPastedImage(file)
            .then((src) => {
              editor.value
                ?.chain()
                .focus()
                .setImage({ src, alt: file.name })
                .run()
            })
            .catch((error) => {
              console.error("[CreateBlogTipTap] paste image failed", error)
            })
        })

        return true
      },
    },
    onCreate: ({ editor }) => {
      logEditorState("created", {
        hasProseMirror: Boolean(editor.view.dom.closest(".ProseMirror")),
        editorIsEditable: editor.isEditable,
        htmlLength: editor.getHTML().length,
      })
    },
    onUpdate: syncContentFromEditor,
  })

  const editorTools = computed<CreateBlogEditorTool[]>(() => [
    {
      key: "bold",
      label: t("pages.createBlogPage.actionBold"),
      icon: "i-ph-text-b-bold",
      isActive: () => Boolean(editor.value?.isActive("bold")),
      run: () => {
        editor.value?.chain().focus().toggleBold().run()
      },
    },
    {
      key: "heading",
      label: t("pages.createBlogPage.actionHeading"),
      icon: "i-ph-text-h-bold",
      isActive: () => Boolean(editor.value?.isActive("heading", { level: 2 })),
      run: () => {
        editor.value?.chain().focus().toggleHeading({ level: 2 }).run()
      },
    },
    {
      key: "quote",
      label: t("pages.createBlogPage.actionQuote"),
      icon: "i-ph-quotes-fill",
      isActive: () => Boolean(editor.value?.isActive("blockquote")),
      run: () => {
        editor.value?.chain().focus().toggleBlockquote().run()
      },
    },
    {
      key: "bullet-list",
      label: t("pages.createBlogPage.actionList"),
      icon: "i-ph-list-bullets-bold",
      isActive: () => Boolean(editor.value?.isActive("bulletList")),
      run: () => {
        editor.value?.chain().focus().toggleBulletList().run()
      },
    },
  ])

  const isEditorReady = computed(() => Boolean(editor.value))

  const isEditorEmpty = computed(() => {
    const instance = editor.value
    if (instance) return instance.isEmpty

    const html = content.value.trim()
    return !html || html === "<p></p>"
  })

  onMounted(() => {
    logEditorState("mounted")
  })

  watch(content, (value) => {
    const instance = editor.value
    if (!instance || instance.getHTML() === value) return

    logEditorState("external-content-sync", {
      nextLength: value.length,
    })
    instance.commands.setContent(value || "", { emitUpdate: false })
  })

  onBeforeUnmount(() => {
    logEditorState("before-unmount")
  })

  return {
    editor,
    editorTools,
    isEditorReady,
    isEditorEmpty,
  }
}

export interface SettingField {
  label: string
  value: any
  type: "text" | "number" | "select" | "checkbox" | "toggle" | "password" | "textarea"
  options?: Array<{ label: string, value: any }>
  placeholder?: string
}

export interface SettingSection {
  title: string
  description?: string
  fields?: SettingField[]
  toggles?: Array<{ label: string, description: string, value: boolean }>
  items?: Array<{ label: string, icon: string, description: string }>
  actions?: Array<{ label: string, color: string, icon: string }>
}

export interface SettingPage {
  slug: string
  label: string
  icon: string
  description: string
  sections: SettingSection[]
}

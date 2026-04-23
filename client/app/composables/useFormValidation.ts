/**
 * Composable for basic form validation logic.
 * Designed to work easily with @nuxt/ui <UForm> component.
 */
export const useFormValidation = () => {
  // Common regex patterns
  const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^(0[3|5|7|8|9])+([0-9]{8})$/, // Vietnamese phone number format
    url: /^https?:\/\/.+\..+/,
  }

  /**
   * Helper to create a validation function for @nuxt/ui UForm.
   * Usage: <UForm :validate="validateForm" ...>
   */
  const createValidator = (schema: Record<string, ((val: any) => string | boolean)[]>) => {
    return (state: any) => {
      const errors: { path: string; message: string }[] = []

      for (const path in schema) {
        const rules = schema[path]
        for (const rule of rules) {
          const result = rule(state[path])
          if (typeof result === "string") {
            errors.push({ path, message: result })
            break // Only show first error for each field
          }
        }
      }

      return errors
    }
  }

  // Common rules
  const required = (message = "Trường này là bắt buộc") => (val: any) => !!val || message
  const email = (message = "Email không hợp lệ") => (val: string) => !val || patterns.email.test(val) || message
  const minLength = (min: number, message?: string) => (val: string) => 
    !val || val.length >= min || (message || `Tối thiểu ${min} ký tự`)
  const phone = (message = "Số điện thoại không hợp lệ") => (val: string) => !val || patterns.phone.test(val) || message

  return {
    patterns,
    createValidator,
    rules: {
      required,
      email,
      minLength,
      phone,
    },
  }
}

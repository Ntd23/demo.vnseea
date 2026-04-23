import { useBreakpoints, breakpointsTailwind } from "@vueuse/core"
import { computed } from "vue"

/**
 * Global composable for handling application breakpoints.
 * Uses standard Tailwind CSS breakpoints.
 * 
 * sm: 640px
 * md: 768px
 * lg: 1024px
 * xl: 1280px
 * 2xl: 1536px
 */
export const useAppBreakpoints = () => {
  const breakpoints = useBreakpoints(breakpointsTailwind)

  // Basic flags
  const isMobile = breakpoints.smaller("md") // < 768px
  const isTablet = breakpoints.between("md", "lg") // 768px - 1024px
  const isDesktop = breakpoints.greaterOrEqual("lg") // >= 1024px
  
  // Specific laptop/desktop range
  const isLaptop = breakpoints.between("lg", "xl") // 1024px - 1280px
  const isWide = breakpoints.greaterOrEqual("xl") // >= 1280px

  // Convenience for layout logic
  const shouldShowSidebar = breakpoints.greaterOrEqual("lg")
  const isTouchDevice = computed(() => isMobile.value || isTablet.value)

  return {
    breakpoints,
    isMobile,
    isTablet,
    isDesktop,
    isLaptop,
    isWide,
    shouldShowSidebar,
    isTouchDevice,
  }
}

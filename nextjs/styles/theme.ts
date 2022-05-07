import { extendTheme, type ThemeConfig, type ColorMode, theme as baseTheme } from "@chakra-ui/react"
import { StyleConfig } from "@chakra-ui/theme-tools"

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const Card: StyleConfig = {
  baseStyle: ({ colorMode }: { colorMode: ColorMode }) => ({
    border: "1px",
    borderColor: colorMode === 'light' ? "surfaceStrokeLight" : "surfaceStrokeDark",
    borderRadius: "lg",
    bg: colorMode === 'light' ? "surfaceLight" : "surfaceDark"
  })
}

const colors = {
  surfaceLight: baseTheme.colors.white,
  surfaceDark: baseTheme.colors.gray[700],
  surfaceStrokeLight: baseTheme.colors.gray[300],
  surfaceStrokeDark: baseTheme.colors.gray[600],
  toolbarSurfaceLight: baseTheme.colors.gray[300],
  toolbarSurfaceDark: baseTheme.colors.gray[800],
}

const breakpoints = {
  sm: '40em', // default: 30em
  md: '60em', // default: 48em
  lg: '75em', // default: 62em
  xl: '80em', // default: 80em
  '2xl': '96em', // default: 96em
}

const theme = extendTheme({
  config,
  colors,
  breakpoints,
  components: {
    Card
  },
  styles: {
    global: ({ colorMode }: { colorMode: ColorMode }) => ({
      body: {
        bg: colorMode === 'light' ? "gray.100" : "gray.900"
      }
    })
  }
})

export default theme
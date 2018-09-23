// @flow
import * as React from 'react'

export type ThemeContextType = {
    primary: string,
    primaryVariant: string,
    secondary: string,
    secondaryVariant: string,
    background: string,
    surface: string,
    error: string,
    onPrimary: string,
    onSecondary: string,
    onBackground: string,
    onSurface: string,
    onError: string    
}

// .dark-primary-color    { background: #00796B; }
// .default-primary-color { background: #009688; }
// .light-primary-color   { background: #B2DFDB; }
// .text-primary-color    { color: #FFFFFF; }
// .accent-color          { background: #448AFF; }
// .primary-text-color    { color: #212121; }
// .secondary-text-color  { color: #757575; }
// .divider-color         { border-color: #BDBDBD; }

// <resources>
//   <color name="primaryColor">#1976d2</color>
//   <color name="primaryLightColor">#63a4ff</color>
//   <color name="primaryDarkColor">#004ba0</color>
//   <color name="secondaryColor">#009688</color>
//   <color name="secondaryLightColor">#52c7b8</color>
//   <color name="secondaryDarkColor">#00675b</color>
//   <color name="primaryTextColor">#ffffff</color>
//   <color name="secondaryTextColor">#000000</color>
// </resources>
// https://material.io/tools/color

// https://material.io/design/material-theming/implementing-your-theme.html#color
export const ThemeContext = React.createContext({
    primary: "#6200EE",
    primaryVariant: "#3700B3",
    secondary: "#03DAC6",
    secondaryVariant: "#018786",
    background: "#FFFFFF",
    surface: "#FFFFFF",
    error: "#C51162",
    onPrimary: "#FFFFFF",
    onSecondary: "#000000",
    onBackground: "#000000",
    onSurface: "#000000",
    onError: "#FFFFFF"    
});
/**
 * Design Tokens — Governança
 * Fonte: export de variáveis do Figma (Design - Governança)
 * https://www.figma.com/design/Tfv3nBHSellofAk3LygS7K/Design---Governanca
 *
 * Espelho tipado de tokens.css. Mesma arquitetura em 2 camadas:
 *   primitives — valores brutos (não usar direto na UI)
 *   semantic   — apontam para primitivos (usar nos componentes)
 */

export const primitives = {
  color: {
    branco: { 1000: '#ffffff' },
    cinza: {
      50: '#fdfdfd',
      100: '#fafafb',
      200: '#f3f4f5',
      300: '#ebedef',
      400: '#dfe1e5',
      500: '#cccfd5',
      600: '#b4b9c1',
      700: '#999faa',
      800: '#7d8593',
      900: '#5d6779',
      1000: '#3a465c',
    },
    preto: {
      50: '#f8f8f9',
      100: '#f0f1f3',
      200: '#e1e3e6',
      300: '#cdd1d5',
      400: '#b4bac1',
      500: '#9ba3ac',
      600: '#7e8793',
      700: '#606b7a',
      800: '#424f61',
      900: '#243448',
      1000: '#06182f',
    },
    marca: {
      50: '#f8f9fb',
      100: '#eff1f6',
      200: '#dde1ec',
      300: '#c4cbdf',
      400: '#a8b2cf',
      500: '#8e9ac1',
      600: '#7282b2',
      700: '#5669a3',
      800: '#405697',
      900: '#2e458c',
      1000: '#1c3582',
    },
    verde: {
      50: '#f8fbf9',
      100: '#eff6f0',
      200: '#dcebdf',
      300: '#c2dcc8',
      400: '#a6ccaf',
      500: '#8abd96',
      600: '#6ead7c',
      700: '#529d63',
      800: '#3a8f4e',
      900: '#28853d',
      1000: '#157a2c',
    },
    laranja: {
      50: '#fbfaf7',
      100: '#f7f3ed',
      200: '#ede5d9',
      300: '#e1d2bd',
      400: '#d3be9e',
      500: '#c5a980',
      600: '#b69461',
      700: '#a88042',
      800: '#9d6f29',
      900: '#936114',
      1000: '#8a5300',
    },
    vermelho: {
      50: '#fdf8f8',
      100: '#faf0ef',
      200: '#f4dedc',
      300: '#ecc6c3',
      400: '#e3aba7',
      500: '#da918c',
      600: '#d17770',
      700: '#c85c54',
      800: '#c0463d',
      900: '#ba352a',
      1000: '#b42318',
    },
  },
  spacing: {
    2: '2px',
    4: '4px',
    8: '8px',
    10: '10px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    36: '36px',
    40: '40px',
    48: '48px',
    64: '64px',
    80: '80px',
    96: '96px',
    128: '128px',
  },
  radius: {
    0: '0px',
    2: '2px',
    4: '4px',
    8: '8px',
    12: '12px',
    16: '16px',
    24: '24px',
    full: '9999px',
  },
} as const;

export const semantic = {
  color: {
    bg: {
      card: primitives.color.branco[1000],
      hover: primitives.color.cinza[200],
      page: primitives.color.cinza[100],
      subtle: primitives.color.cinza[50],
    },
    border: {
      brand: primitives.color.marca[1000],
      default: primitives.color.cinza[500],
      strong: primitives.color.cinza[600],
      subtle: primitives.color.cinza[200],
    },
    brand: {
      active: primitives.color.marca[800],
      default: primitives.color.marca[1000],
      hover: primitives.color.marca[900],
      muted: primitives.color.marca[100],
      subtle: primitives.color.marca[200],
    },
    feedback: {
      error: { default: primitives.color.vermelho[1000], subtle: primitives.color.vermelho[100] },
      info: { default: primitives.color.marca[1000], subtle: primitives.color.marca[100] },
      success: { default: primitives.color.verde[1000], subtle: primitives.color.verde[100] },
      warning: { default: primitives.color.laranja[1000], subtle: primitives.color.laranja[100] },
    },
    icon: {
      brand: primitives.color.marca[1000],
      default: primitives.color.cinza[1000],
      disabled: primitives.color.cinza[600],
      error: primitives.color.vermelho[1000],
      info: primitives.color.marca[1000],
      inverse: primitives.color.branco[1000],
      secondary: primitives.color.cinza[800],
      success: primitives.color.verde[1000],
      warning: primitives.color.laranja[1000],
    },
    text: {
      body: primitives.color.cinza[1000],
      brand: primitives.color.marca[1000],
      disabled: primitives.color.cinza[600],
      inverse: primitives.color.branco[1000],
      secondary: primitives.color.cinza[800],
      title: primitives.color.preto[1000],
    },
  },
} as const;

export const theme = { primitives, semantic } as const;
export default theme;

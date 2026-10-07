// Paleta central do app. Nunca usar cor "solta" nas telas — sempre importar daqui.
// Assim, se você quiser mudar o azul principal um dia, muda em um lugar só.

export const colors = {
  // Azul principal — header do dashboard, botões primários
  primary: "#1D4ED8",
  primaryDark: "#1E3A8A",
  primaryLight: "#3B82F6",

  // Neutros
  background: "#F3F4F6",
  surface: "#FFFFFF",
  border: "#E5E7EB",

  // Textos
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textInverse: "#FFFFFF",

  // Status (usados nos badges de ordem de serviço)
  success: "#16A34A",
  successBg: "#DCFCE7",
  warning: "#D97706",
  warningBg: "#FEF3C7",
  danger: "#DC2626",
  dangerBg: "#FEE2E2",
  info: "#2563EB",
  infoBg: "#DBEAFE",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
};
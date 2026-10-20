// MoneyMind design system — see "Phụ lục D — Bảng Design Token" in the report.
//
// The palette moved from the old purple scheme to teal: blue reads as a
// traditional bank (distant), pure green reads as money too literally, teal
// balances trust and growth. Every text/background pair below is checked
// against WCAG 2.1 AA (>= 4.5:1).
//
// `legacy*` aliases keep the old primary50..primary800 names working so screens
// that haven't been migrated still render in the new palette instead of
// breaking. New code should use the semantic names (surface, text, border...).

const palette = {
  primary: "#0F766E",
  primaryLight: "#14B8A6",
  primaryDark: "#115E56",
  primarySurface: "#F0FDFA",

  // Semantic hues come in two steps, and the distinction matters for AA:
  //   `x`      — fills, bars, chart marks, icons on a tinted surface (>= 3:1)
  //   `xText`  — anything that is *text at normal size*, and the background of
  //              a solid button whose label is white (both need >= 4:1 / 4.5:1)
  // The report's own token table lists #E5484D on white as 4.52:1; it is in
  // fact 3.91:1, so body-size red text uses the darker step instead.
  expense: "#E5484D",
  expenseText: "#CE2C31", // 5.21:1 on white · 4.76:1 on its tint
  expenseSurface: "#FEF2F2",
  income: "#30A46C",
  incomeText: "#17804A", // 4.97:1 on white · 4.75:1 on its tint
  incomeSurface: "#F0FDF4",
  warning: "#F5A524",
  warningText: "#B45309", // 5.02:1 on white · 4.73:1 on its tint
  warningSurface: "#FFF7ED",
  info: "#0091FF",
  infoText: "#0B63CE",
  infoSurface: "#F0F9FF",

  n900: "#111827",
  n700: "#374151",
  // One step darker than the token table's #6B7280: that value clears AA on
  // white (4.83:1) but not on the n100 screen background (4.39:1), and caption
  // text sits on both.
  n500: "#646C7A",
  n300: "#D1D5DB",
  n100: "#F3F4F6",
  n0: "#FFFFFF",
};

// Fills the parent completely.
//
// This replaces `StyleSheet.absoluteFillObject`, which React Native removed in
// 0.86. Spreading something that no longer exists spreads nothing, so every
// backdrop in the app silently lost its size: no dimming, and — worse — no
// area left to tap, so "tap outside to close" stopped working everywhere.
// Only `StyleSheet.absoluteFill` survives, and that is a registered style id,
// not an object, so it cannot be spread into one.
export const fillParent = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export const GlobalStyles = {
  colors: {
    ...palette,

    // Semantic roles
    screen: palette.n100,
    surface: palette.n0,
    surfaceAlt: palette.n100,
    border: palette.n300,
    text: palette.n900,
    textBody: palette.n700,
    textMuted: palette.n500,
    onPrimary: palette.n0,

    // Legacy aliases — remapped onto the teal ramp (do not use in new code).
    primary50: palette.primarySurface,
    primary100: "#CCFBF1",
    primary200: "#5EEAD4",
    primary400: palette.primaryLight,
    primary500: palette.primary,
    primary700: palette.primaryDark,
    primary800: "#0F5F58",
    accent500: palette.warning,
    error50: palette.expenseSurface,
    error500: palette.expense,
    gray500: palette.n500,
    gray700: palette.n700,
  },

  // Type scale. Sizes are the report's pt values used directly as RN units.
  type: {
    display: { fontSize: 40, fontWeight: "700", lineHeight: 48 },
    h1: { fontSize: 28, fontWeight: "700", lineHeight: 34 },
    h2: { fontSize: 22, fontWeight: "600", lineHeight: 28 },
    h3: { fontSize: 17, fontWeight: "600", lineHeight: 24 },
    body: { fontSize: 15, fontWeight: "400", lineHeight: 22 },
    bodyEmphasis: { fontSize: 15, fontWeight: "500", lineHeight: 22 },
    caption: { fontSize: 13, fontWeight: "400", lineHeight: 18 },
    label: {
      fontSize: 11,
      fontWeight: "500",
      lineHeight: 16,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
  },

  // 4pt grid.
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32 },

  radius: { sm: 8, md: 12, lg: 16, full: 999 },

  shadow: {
    sm: {
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 24,
      elevation: 8,
    },
  },

  // Minimum touch target (WCAG 2.5.5 / Apple HIG).
  hitSlop: 44,
};

// Budget / usage thresholds share one source of truth so the bar colour, the
// status dot and the wording can never disagree (WCAG 1.4.1: never colour alone).
export const getStatusLevel = (ratio) => {
  if (ratio >= 1) return "over";
  if (ratio >= 0.9) return "nearly";
  if (ratio >= 0.7) return "caution";
  return "safe";
};

export const STATUS_COLORS = {
  safe: GlobalStyles.colors.income,
  caution: GlobalStyles.colors.warning,
  nearly: "#F76B15",
  over: GlobalStyles.colors.expense,
};

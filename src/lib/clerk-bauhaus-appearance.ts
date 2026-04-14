/**
 * Clerk styling aligned with Stitch Etheric Kanban (light, purple primary).
 */
export const clerkBauhausAppearance = {
  variables: {
    colorPrimary: "#6750a4",
    colorDanger: "#ba1a1a",
    colorSuccess: "#15803d",
    colorWarning: "#b45309",
    colorBackground: "rgba(255, 255, 255, 0.96)",
    colorInputBackground: "#e8e8e8",
    colorInputText: "#1a1c1c",
    colorText: "#1a1c1c",
    colorTextSecondary: "#494551",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full max-w-md",
    card: "rounded-2xl border border-[color-mix(in_srgb,#cbc4d2_35%,transparent)] bg-white/95 shadow-[0_16px_48px_rgba(26,28,28,0.1)] backdrop-blur-md",
    headerTitle: "tracking-tight font-bold text-[#1a1c1c]",
    headerSubtitle: "uppercase tracking-widest text-xs text-[#494551]",
    socialButtonsBlockButton:
      "rounded-xl border border-[color-mix(in_srgb,#cbc4d2_40%,transparent)] bg-[#f3f3f3] font-semibold text-sm text-[#1a1c1c] hover:bg-[#eaddff] hover:border-[#6750a4]/35",
    formButtonPrimary:
      "rounded-xl border-0 bg-gradient-to-br from-[#4f378a] to-[#6750a4] font-bold uppercase tracking-wider text-sm text-white shadow-[0_8px_24px_rgba(103,80,164,0.25)] hover:opacity-95",
    formFieldInput:
      "rounded-xl border-0 bg-[#e8e8e8] text-[#1a1c1c] focus:ring-2 focus:ring-[#6750a4]/30",
    footerActionLink: "font-semibold text-[#4f378a] hover:text-[#6750a4]",
    identityPreviewText: "font-medium text-[#1a1c1c]",
    formFieldLabel:
      "uppercase tracking-widest text-[0.65rem] font-bold text-[#494551]",
    dividerLine: "bg-gradient-to-r from-transparent via-[#cbc4d2] to-transparent",
    dividerText: "uppercase tracking-widest text-[0.65rem] text-[#494551]",
    formResendCodeLink: "font-semibold text-[#4f378a]",
  },
} as const;

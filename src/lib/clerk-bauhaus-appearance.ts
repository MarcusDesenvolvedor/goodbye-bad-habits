/**
 * Clerk styling to match Stitch “Kanban Bauhaus” dark glass + neon reference.
 */
export const clerkBauhausAppearance = {
  variables: {
    colorPrimary: "#3b82f6",
    colorDanger: "#f43f5e",
    colorSuccess: "#22c55e",
    colorWarning: "#eab308",
    colorBackground: "rgba(12, 12, 18, 0.95)",
    colorInputBackground: "rgba(9, 9, 14, 0.9)",
    colorInputText: "#fafafa",
    colorText: "#fafafa",
    colorTextSecondary: "#a1a1aa",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-bauhaus-sans), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full max-w-md",
    card: "rounded-2xl border border-blue-400/30 bg-zinc-950/80 shadow-[0_0_40px_rgba(59,130,246,0.15)] backdrop-blur-md",
    headerTitle: "tracking-wide font-bold text-zinc-50",
    headerSubtitle: "uppercase tracking-widest text-xs text-zinc-500",
    socialButtonsBlockButton:
      "rounded-lg border border-white/15 bg-zinc-900/80 font-semibold text-sm text-zinc-200 hover:bg-zinc-800 hover:border-blue-400/30",
    formButtonPrimary:
      "rounded-lg border border-blue-400/50 bg-blue-600 font-bold uppercase tracking-wider text-sm text-white shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:bg-blue-500",
    formFieldInput:
      "rounded-lg border border-white/15 bg-zinc-950/90 text-zinc-100 focus:ring-2 focus:ring-blue-500/40",
    footerActionLink: "font-semibold text-blue-400 hover:text-cyan-300",
    identityPreviewText: "font-medium text-zinc-200",
    formFieldLabel:
      "uppercase tracking-widest text-[0.65rem] font-bold text-zinc-400",
    dividerLine: "bg-gradient-to-r from-transparent via-zinc-600 to-transparent",
    dividerText: "uppercase tracking-widest text-[0.65rem] text-zinc-500",
    formResendCodeLink: "font-semibold text-blue-400",
  },
} as const;

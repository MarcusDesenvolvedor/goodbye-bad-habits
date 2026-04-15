import { AtelierAppShell } from "@/components/board/atelier-app-shell";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AtelierAppShell>{children}</AtelierAppShell>;
}

import { bauhausSans } from "@/lib/bauhaus-font";

export default function BoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${bauhausSans.className} min-h-full bg-[#f4f1ea] text-neutral-900 antialiased`}
    >
      {children}
    </div>
  );
}

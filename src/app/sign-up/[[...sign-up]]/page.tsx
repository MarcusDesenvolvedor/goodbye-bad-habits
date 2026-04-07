import { SignUp } from "@clerk/nextjs";

import { clerkBauhausAppearance } from "@/lib/clerk-bauhaus-appearance";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--stitch-bg)] p-6">
      <p className="text-center text-xs font-bold uppercase tracking-[0.35em] text-blue-400/80">
        Goodbye Bad Habits
      </p>
      <SignUp appearance={clerkBauhausAppearance} />
    </div>
  );
}

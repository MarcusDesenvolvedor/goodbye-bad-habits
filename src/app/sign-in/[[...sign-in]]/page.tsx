import { SignIn } from "@clerk/nextjs";

import { clerkBauhausAppearance } from "@/lib/clerk-bauhaus-appearance";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ds-surface-container-low p-6">
      <p className="text-center text-xs font-bold uppercase tracking-[0.35em] text-ds-primary">
        Goodbye Bad Habits
      </p>
      <SignIn appearance={clerkBauhausAppearance} />
    </div>
  );
}

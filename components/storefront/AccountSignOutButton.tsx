"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export default function AccountSignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-4 py-2 border border-beige/60 text-charcoal hover:border-navy hover:text-navy transition-colors"
      style={{
        fontFamily: "var(--font-inter)",
        fontSize: "0.6875rem",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      <LogOut size={13} />
      Sign Out
    </button>
  );
}

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("aurelin_admin_session")?.value;

  if (session !== "authenticated") {
    redirect("/admin/login");
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@aurelinco.com";

  return <AdminShell adminName={adminEmail.split("@")[0].toUpperCase()}>{children}</AdminShell>;
}

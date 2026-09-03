import { createAdminClient } from "@/utils/supabase/admin";
import AdminOrdersManager from "@/components/admin/AdminOrdersManager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return <AdminOrdersManager initialOrders={orders || []} />;
}

import ProductFormClient from "@/components/admin/ProductFormClient";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.75rem", fontWeight: 400, color: "#172744" }}>
          Add New Product
        </h1>
        <p className="mt-0.5 opacity-50" style={{ fontFamily: "var(--font-inter)", fontSize: "0.8125rem" }}>
          Fill in the details below to add a new product to your catalogue.
        </p>
      </div>
      <ProductFormClient />
    </div>
  );
}

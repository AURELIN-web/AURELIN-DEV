import Link from "next/link";
import { adminGetAllProducts } from "@/lib/queries";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { Plus, Edit2, Eye, Package, Image as ImageIcon } from "lucide-react";
import ProductDeleteButton from "@/components/admin/ProductDeleteButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminProductsPage() {
  const { products, total } = await adminGetAllProducts(1, 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#D8C8AF40]">
        <div>
          <h1
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "2rem",
              fontWeight: 400,
              color: "#172744",
              letterSpacing: "-0.01em",
            }}
          >
            Product Catalog
          </h1>
          <p className="text-xs text-charcoal/60 mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
            Manage {total} luxury garments, variant matrices, Cloudinary imagery and pricing.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#172744] text-[#F8F6F0] hover:bg-[#101C32] transition-colors text-xs font-medium uppercase tracking-widest rounded-sm shadow-sm flex-shrink-0"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <Plus size={14} /> Add New Product
        </Link>
      </div>

      {/* Products Container Card */}
      <div className="bg-white border border-[#D8C8AF] rounded-sm shadow-sm overflow-hidden">
        {products.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Package size={36} className="mx-auto text-charcoal/30" />
            <p className="text-sm font-medium text-[#172744]">No garments in catalog yet</p>
            <p className="text-xs text-charcoal/50 max-w-sm mx-auto">
              Create your first product piece with size and colour variants.
            </p>
            <Link
              href="/admin/products/new"
              className="inline-block mt-2 px-6 py-2.5 bg-[#172744] text-[#F8F6F0] text-xs uppercase tracking-wider font-medium rounded-sm"
            >
              Add Product
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#D8C8AF40] bg-[#F8F6F0]/50 text-[10px] uppercase tracking-wider text-[#172744]/70 font-semibold">
                    <th className="px-5 py-3.5">Garment</th>
                    <th className="px-4 py-3.5">SKU</th>
                    <th className="px-4 py-3.5">Price</th>
                    <th className="px-4 py-3.5">Inventory</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Updated</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8C8AF20] text-sm" style={{ fontFamily: "var(--font-inter)" }}>
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-[#F8F6F0]/60 transition-colors">
                      {/* Image & Title */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-12 h-14 bg-[#101C32]/5 rounded-sm overflow-hidden flex-shrink-0 border border-[#D8C8AF]/60">
                            {product.primary_image_url ? (
                              <img
                                src={product.primary_image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-charcoal/30">
                                <ImageIcon size={16} />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="font-medium text-[#172744] hover:text-[#B9A77A] transition-colors leading-snug block"
                            >
                              {product.name}
                            </Link>
                            <span className="text-[11px] text-charcoal/40 font-mono">
                              /{product.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-4 text-xs font-mono text-charcoal/70">
                        {product.sku || "—"}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4 font-medium text-[#172744] text-xs">
                        {formatPrice(product.price)}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-4 text-xs">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            product.stock_quantity > 0
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            product.status === "published"
                              ? "bg-[#172744] text-[#F8F6F0]"
                              : product.status === "draft"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-charcoal/10 text-charcoal/60"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      {/* Updated */}
                      <td className="px-4 py-4 text-xs text-charcoal/50">
                        {formatDate(product.updated_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            title="Preview in Store"
                            className="p-1.5 text-charcoal/50 hover:text-[#172744] hover:bg-beige/20 rounded transition-colors"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}`}
                            title="Edit Product"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#172744] text-[#F8F6F0] hover:bg-[#101C32] text-xs rounded transition-colors"
                          >
                            <Edit2 size={12} /> Edit
                          </Link>
                          <ProductDeleteButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Garment Cards (Visible on mobile screens) */}
            <div className="md:hidden divide-y divide-[#D8C8AF30]">
              {products.map((product) => (
                <div key={product.id} className="p-4 flex gap-3.5 items-start">
                  <div className="relative w-16 h-20 bg-[#101C32]/5 rounded-sm overflow-hidden flex-shrink-0 border border-[#D8C8AF]/60">
                    {product.primary_image_url ? (
                      <img
                        src={product.primary_image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-charcoal/30">
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium text-[#172744] text-sm hover:text-[#B9A77A] truncate block"
                      >
                        {product.name}
                      </Link>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex-shrink-0 ${
                          product.status === "published"
                            ? "bg-[#172744] text-[#F8F6F0]"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-[#172744]">{formatPrice(product.price)}</span>
                      <span className="text-charcoal/40">•</span>
                      <span
                        className={`text-[11px] font-semibold ${
                          product.stock_quantity > 0
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }`}
                      >
                        {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="flex-1 py-1.5 bg-[#172744] text-[#F8F6F0] text-center text-xs font-semibold uppercase tracking-wider rounded-sm shadow-xs"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/product/${product.slug}`}
                        target="_blank"
                        className="p-1.5 border border-[#D8C8AF] text-charcoal/70 rounded-sm hover:bg-[#F8F6F0]"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </Link>
                      <ProductDeleteButton
                        productId={product.id}
                        productName={product.name}
                        className="p-1.5 border border-red-200 text-red-600 rounded-sm hover:bg-red-50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface ProductDeleteButtonProps {
  productId: string;
  productName: string;
  variant?: "icon" | "button";
  className?: string;
  onDeleted?: () => void;
}

export default function ProductDeleteButton({
  productId,
  productName,
  variant = "icon",
  className,
  onDeleted,
}: ProductDeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete product");
      }
      toast.success("Garment removed from catalog");
      setIsOpen(false);
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title="Delete Garment"
          className={
            className ||
            "p-1.5 text-charcoal/40 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          }
        >
          <Trash2 size={15} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={
            className ||
            "px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-1.5"
          }
        >
          <Trash2 size={13} />
          <span>Delete</span>
        </button>
      )}

      <DeleteConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete Garment"
        description="Are you sure you want to delete this garment from your catalog? All associated variant inventory and image linkages will be removed."
        itemName={productName}
        isDeleting={isDeleting}
      />
    </>
  );
}

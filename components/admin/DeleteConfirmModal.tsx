"use client";

import React, { useEffect } from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  description = "Are you sure you want to delete this item? This action is permanent and cannot be undone.",
  itemName,
  confirmText = "Delete Permanently",
  cancelText = "Cancel",
  isDeleting = false,
}: DeleteConfirmModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#101C32]/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-md bg-[#F8F6F0] border border-[#D8C8AF] shadow-2xl rounded-sm p-6 sm:p-7 text-left overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-[#172744] to-[#B9A77A]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1.5 text-charcoal/40 hover:text-[#172744] hover:bg-black/5 rounded-sm transition-colors disabled:opacity-40"
        >
          <X size={16} />
        </button>

        {/* Modal Content */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-100/70 border border-red-200 text-red-700 flex items-center justify-center">
            <Trash2 size={20} className="stroke-[1.75]" />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              id="delete-dialog-title"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "1.4rem",
                lineHeight: "1.2",
                fontWeight: 600,
                color: "#172744",
              }}
            >
              {title}
            </h3>

            <p className="mt-2 text-xs text-charcoal/70 leading-relaxed">
              {description}
            </p>

            {itemName && (
              <div className="mt-3 px-3 py-2 bg-white/80 border border-[#D8C8AF]/80 rounded-sm">
                <span className="block text-[10px] uppercase tracking-wider font-semibold text-[#172744]/60 mb-0.5">
                  Target Item
                </span>
                <p className="text-xs font-medium text-[#172744] font-mono break-all line-clamp-2">
                  {itemName}
                </p>
              </div>
            )}

            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-amber-700">
              <AlertTriangle size={13} className="flex-shrink-0" />
              <span>Warning: This action cannot be undone.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-[#D8C8AF40] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto px-4 py-2.5 border border-[#D8C8AF] bg-white text-xs font-semibold uppercase tracking-wider text-[#172744] hover:bg-[#F8F6F0] transition-colors rounded-sm text-center disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-[#F8F6F0] text-xs font-semibold uppercase tracking-wider transition-colors rounded-sm shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

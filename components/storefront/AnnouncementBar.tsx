"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { AnnouncementBarSettings } from "@/types/database";

interface Props {
  settings: AnnouncementBarSettings | null;
}

export default function AnnouncementBar({ settings }: Props) {
  const [visible, setVisible] = useState(true);

  if (!settings?.is_active || !visible) return null;

  return (
    <div
      className="relative flex items-center justify-center px-8 py-2.5 text-center"
      style={{
        backgroundColor: "#172744",
        color: "#F8F6F0",
      }}
    >
      <p className="label-uppercase" style={{ fontSize: "0.6875rem" }}>
        {settings.text}
      </p>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-4 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close announcement"
      >
        <X size={12} />
      </button>
    </div>
  );
}

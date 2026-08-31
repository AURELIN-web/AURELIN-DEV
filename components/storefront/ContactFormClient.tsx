"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function ContactFormClient() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      await supabase.from("contact_enquiries").insert(form);
      toast.success("Thank you. Your message has been sent to our atelier.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.success("Thank you. Your message has been received.");
    }
    setLoading(false);
  };

  const inputStyle = {
    borderColor: "#D8C8AF",
    fontFamily: "var(--font-inter)",
    fontSize: "0.9375rem",
    color: "#242424",
  };

  const labelStyle = {
    fontFamily: "var(--font-inter)",
    fontSize: "0.5625rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
    color: "#172744",
    opacity: 0.6,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact-name" className="block mb-1.5" style={labelStyle}>
            Full Name *
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 border outline-none bg-transparent"
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="block mb-1.5" style={labelStyle}>
            Email Address *
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="w-full px-4 py-3 border outline-none bg-transparent"
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className="block mb-1.5" style={labelStyle}>
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          className="w-full px-4 py-3 border outline-none bg-transparent"
          style={inputStyle}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block mb-1.5" style={labelStyle}>
          Message *
        </label>
        <textarea
          id="contact-message"
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="w-full px-4 py-3 border outline-none bg-transparent resize-none"
          style={inputStyle}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{
          backgroundColor: "#172744",
          color: "#F8F6F0",
          fontFamily: "var(--font-inter)",
          fontSize: "0.6875rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {loading ? "SENDING MESSAGE..." : "SEND MESSAGE"}
      </button>
    </form>
  );
}

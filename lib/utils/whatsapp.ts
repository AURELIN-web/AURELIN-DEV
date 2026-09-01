import { SITE_URL, DEFAULT_WHATSAPP_NUMBER } from "@/config/site";
import { formatPrice } from "./format";

export interface WhatsAppMessageParams {
  whatsappNumber?: string;
  productName: string;
  price?: number;
  colour?: string;
  size?: string;
  quantity?: number;
  productSlug: string;
}

export interface WhatsAppOrderParams {
  whatsappNumber?: string;
  orderNumber: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country?: string;
    notes?: string;
  };
  items: {
    name: string;
    colour?: string | null;
    size?: string | null;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  total: number;
}

/**
 * Builds direct WhatsApp URL for product concierge enquiries
 */
export function buildWhatsAppUrl(params: WhatsAppMessageParams): string {
  const {
    whatsappNumber = DEFAULT_WHATSAPP_NUMBER,
    productName,
    price,
    colour,
    size,
    quantity = 1,
    productSlug,
  } = params;

  const productUrl = `${SITE_URL}/product/${productSlug}`;

  const message = [
    "✨ *AURELIN & CO. — Private Concierge Enquiry* ✨",
    "━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Garment: *${productName}*`,
    price ? `Price: *${formatPrice(price)}*` : null,
    colour ? `Colour: *${colour}*` : null,
    size ? `Size: *${size}*` : null,
    `Quantity: *${quantity}*`,
    "",
    `Direct Link:`,
    productUrl,
    "",
    "━━━━━━━━━━━━━━━━━━━━━",
    "Hello AURELIN Concierge, I would like to enquire about availability and placing an order for this piece.",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const cleanNumber = (whatsappNumber || DEFAULT_WHATSAPP_NUMBER).replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds direct WhatsApp URL with full customer details, delivery address, and ordered garments
 */
export function buildWhatsAppOrderUrl(params: WhatsAppOrderParams): string {
  const {
    whatsappNumber = DEFAULT_WHATSAPP_NUMBER,
    orderNumber,
    customer,
    items,
    subtotal,
    total,
  } = params;

  const itemsList = items
    .map((item, index) => {
      const details = [
        item.size ? `Size: ${item.size}` : null,
        item.colour ? `Colour: ${item.colour}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      return `${index + 1}. *${item.name}*\n   ${details ? `(${details})\n   ` : ""}Qty: ${item.quantity} × ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}`;
    })
    .join("\n\n");

  const address = [
    customer.addressLine1,
    customer.addressLine2,
    `${customer.city}${customer.state ? `, ${customer.state}` : ""} - ${customer.postalCode}`,
    customer.country || "India",
  ]
    .filter(Boolean)
    .join("\n• ");

  const message = [
    "🏛️ *AURELIN & CO. — NEW BESPOKE ORDER*",
    `Order Reference: *${orderNumber}*`,
    "━━━━━━━━━━━━━━━━━━━━━",
    "",
    "👤 *CLIENT DETAILS*",
    `• Name: *${customer.fullName}*`,
    `• Phone: *${customer.phone}*`,
    `• Email: *${customer.email}*`,
    "",
    "📍 *DELIVERY ADDRESS*",
    `• ${address}`,
    "",
    "🛍️ *GARMENTS ORDERED*",
    itemsList,
    "",
    "━━━━━━━━━━━━━━━━━━━━━",
    "💳 *ORDER SUMMARY*",
    `• Subtotal: ${formatPrice(subtotal)}`,
    "• Shipping: Complimentary Express Delivery",
    `• *TOTAL PAYABLE: ${formatPrice(total)}*`,
    "",
    customer.notes ? `📝 *Special Notes / Tailoring:* ${customer.notes}\n` : null,
    "━━━━━━━━━━━━━━━━━━━━━",
    "Hello AURELIN Concierge, I have placed this order on your website. Please confirm my order and share payment details.",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const cleanNumber = (whatsappNumber || DEFAULT_WHATSAPP_NUMBER).replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

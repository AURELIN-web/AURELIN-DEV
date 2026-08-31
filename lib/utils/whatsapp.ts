import { SITE_URL } from "@/config/site";

export interface WhatsAppMessageParams {
  whatsappNumber: string;
  productName: string;
  colour?: string;
  size?: string;
  quantity?: number;
  productSlug: string;
}

export function buildWhatsAppUrl(params: WhatsAppMessageParams): string {
  const {
    whatsappNumber,
    productName,
    colour,
    size,
    quantity = 1,
    productSlug,
  } = params;

  const productUrl = `${SITE_URL}/product/${productSlug}`;

  const message = [
    "Hello AURELIN & CO.,",
    "",
    "I would like to enquire about:",
    "",
    `Product: ${productName}`,
    colour ? `Colour: ${colour}` : null,
    size ? `Size: ${size}` : null,
    `Quantity: ${quantity}`,
    "",
    `Product link:`,
    productUrl,
    "",
    "Please assist me with availability and ordering.",
  ]
    .filter((line) => line !== null)
    .join("\n");

  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

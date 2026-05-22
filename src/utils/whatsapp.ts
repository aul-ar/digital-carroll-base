export function getWhatsAppLink(message?: string): string {
  const baseNumber = "6285179690688";
  if (!message) return `https://wa.me/${baseNumber}`;
  return `https://wa.me/${baseNumber}?text=${encodeURIComponent(message)}`;
}

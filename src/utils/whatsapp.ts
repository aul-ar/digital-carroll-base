export const DEFAULT_WHATSAPP_MESSAGE = `Halo Digital Carroll Base, saya ingin konsultasi pembuatan website.

Nama bisnis:
Jenis website:
Kebutuhan utama:
Referensi website:
Budget estimasi:`;

export function getWhatsAppLink(message?: string): string {
  void message;
  const baseNumber = "6285179690688";
  return `https://wa.me/${baseNumber}?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`;
}

export interface CheckoutPackage {
  id: string;
  name: string;
  price: string;
  description: string;
}

export const checkoutPackages: CheckoutPackage[] = [
  {
    id: "landing-page",
    name: "Landing Page Basic",
    price: "Rp499.000",
    description: "Website landing page profesional untuk promosi jasa, produk, atau personal brand.",
  },
  {
    id: "company-profile",
    name: "Company Profile Website",
    price: "Rp999.000",
    description: "Website profil bisnis dengan halaman informasi layanan, kontak, dan identitas brand.",
  },
  {
    id: "online-store",
    name: "Online Store Starter",
    price: "Rp1.999.000",
    description: "Website katalog/online store sederhana untuk menampilkan produk dan menerima pesanan.",
  },
  {
    id: "custom-website",
    name: "Custom Website",
    price: "Mulai dari Rp2.499.000",
    description: "Website custom sesuai kebutuhan bisnis, fitur, dan integrasi tambahan.",
  },
];

export function getCheckoutPackage(packageId?: string | null) {
  return checkoutPackages.find((item) => item.id === packageId) ?? checkoutPackages[0];
}

export function getPackageIdFromPricingPlan(planId: string, serviceSlug?: string) {
  const normalizedId = planId.replace(/^plan-/, "");
  const slug = serviceSlug ?? normalizedId;

  if (slug === "landing-page") {
    return "landing-page";
  }

  if (slug === "company-profile") {
    return "company-profile";
  }

  if (slug === "online-store-sederhana" || slug === "katalog-produk") {
    return "online-store";
  }

  return "custom-website";
}

export interface CheckoutPlan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
}

export const checkoutPlans: CheckoutPlan[] = [
  {
    id: "plan-landing-page",
    name: "Landing Page Basic",
    price: 499000,
    priceLabel: "Rp499.000",
    description: "Website landing page profesional untuk promosi jasa, produk, atau personal brand.",
  },
  {
    id: "plan-company-profile",
    name: "Company Profile Website",
    price: 999000,
    priceLabel: "Rp999.000",
    description: "Website profil bisnis dengan halaman informasi layanan, kontak, dan identitas brand.",
  },
  {
    id: "plan-online-store",
    name: "Online Store Starter",
    price: 1999000,
    priceLabel: "Rp1.999.000",
    description: "Website katalog atau toko online sederhana untuk menampilkan produk dan menerima pesanan.",
  },
  {
    id: "plan-custom-website",
    name: "Custom Website",
    price: 2499000,
    priceLabel: "Mulai dari Rp2.499.000",
    description: "Website custom sesuai kebutuhan bisnis, fitur, dan integrasi tambahan.",
  },
];

export function getCheckoutPlan(planId?: string | null) {
  return checkoutPlans.find((plan) => plan.id === planId) ?? checkoutPlans[0];
}

export function getPlanIdFromPricingPlan(planId: string, serviceSlug?: string) {
  if (planId === "plan-landing-page" || serviceSlug === "landing-page") {
    return "plan-landing-page";
  }

  if (planId === "plan-company-profile" || serviceSlug === "company-profile") {
    return "plan-company-profile";
  }

  if (planId === "plan-online-store-sederhana" || serviceSlug === "online-store-sederhana" || serviceSlug === "katalog-produk") {
    return "plan-online-store";
  }

  return "plan-custom-website";
}

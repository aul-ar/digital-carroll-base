import { pricingPlans } from "@/data/pricing";
import { parsePackagePrice } from "@/lib/invoice";

export interface CheckoutPlan {
  id: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
}

export const checkoutPlans: CheckoutPlan[] = pricingPlans.map((plan) => ({
  id: plan.id,
  name: plan.name,
  price: parsePackagePrice(plan.price),
  priceLabel: plan.price,
  description: plan.description,
}));

export function getCheckoutPlan(planId?: string | null) {
  return checkoutPlans.find((plan) => plan.id === planId) ?? null;
}

export function getPlanIdFromPricingPlan(planId: string) {
  return planId;
}

import {
  Sparkles,
  UtensilsCrossed,
  PartyPopper,
  Truck,
  ShoppingBag,
  Briefcase,
  Globe,
  Tag,
  Laptop,
  Hammer,
  Car,
  Home,
  PackageSearch,
  Store,
  HeartPulse,
  GraduationCap,
  PawPrint,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  beauty: Sparkles,
  food: UtensilsCrossed,
  events: PartyPopper,
  "transport-and-hire": Truck,
  shopping: ShoppingBag,
  "professional-services": Briefcase,
  "online-services": Globe,
  "tech-and-repairs": Laptop,
  "skilled-trades-and-construction": Hammer,
  automotive: Car,
  "home-services": Home,
  "rentals-and-equipment-hire": PackageSearch,
  "street-and-township-traders": Store,
  "health-and-wellness": HeartPulse,
  "education-and-training": GraduationCap,
  "pets-and-animals": PawPrint,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? Tag;
}

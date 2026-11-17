import {
  Banknote,
  Sprout,
  Activity,
  Bot,
  Boxes,
  Building2,
  Link2,
  Map as MapIcon,
  MapPin,
  Package,
  Route,
  ShoppingCart,
  TreePine,
  BadgeCheck,
  BarChart3,
  Compass,
  Globe,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Layers,
  Rocket,
  Scale,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  Store,
  Users,
  type LucideProps,
} from "lucide-react";

const icons = {
  Banknote,
  Sprout,
  Activity,
  Bot,
  Boxes,
  Building2,
  Link2,
  Map: MapIcon,
  MapPin,
  Package,
  Route,
  ShoppingCart,
  TreePine,
  BadgeCheck,
  BarChart3,
  Compass,
  Globe,
  GraduationCap,
  HeartHandshake,
  Landmark,
  Layers,
  Rocket,
  Scale,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
  Store,
  Users,
};

export default function Icon({ name, ...props }: { name: string } & LucideProps) {
  const C = icons[name as keyof typeof icons] ?? Sparkles;
  return <C {...props} />;
}

type SvgProps = React.SVGProps<SVGSVGElement>;

export const LinkedInIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);
export const XIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64z" />
  </svg>
);
export const FacebookIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
  </svg>
);
export const InstagramIcon = (p: SvgProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
);

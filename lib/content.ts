// Central place for copy that changes often — edit this file instead of
// digging through component JSX. Components import from here and fall back
// to these defaults if no override prop is passed.

export interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export const heroContent: HeroContent = {
  eyebrow: "Est. street wear — no. 001 collection",
  title: "Rule The Streets. Wear The Power.",
  subtitle:
    "Heavyweight hoodies, denim and outerwear cut for the city after midnight. Limited runs. No restocks.",
  primaryCta: { label: "Shop the drop", href: "/shop" },
  secondaryCta: { label: "New arrivals", href: "/new-arrivals" },
};

import Link from "next/link";
import {
  Flower,
  Instagram,
  Facebook,
  Twitter,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const shopLinks = [
  { label: "Shop All", href: "/products" },
  { label: "Roses", href: "/products?category=roses" },
  { label: "Mixed Bouquets", href: "/products?category=mixed-bouquets" },
  { label: "Luxury", href: "/products?category=luxury" },
  { label: "Plants", href: "/products?category=plants" },
  { label: "Hampers", href: "/products?category=hampers" },
  { label: "Letterbox", href: "/products?category=letterbox" },
];

const occasionLinks = [
  { label: "Birthday", href: "/occasions/birthday" },
  { label: "Anniversary", href: "/occasions/anniversary" },
  { label: "Sympathy", href: "/occasions/sympathy" },
  { label: "Wedding", href: "/occasions/wedding" },
  { label: "Romance", href: "/occasions/romance" },
  { label: "Thank You", href: "/occasions/thank-you" },
  { label: "Get Well", href: "/occasions/get-well" },
];

const helpLinks = [
  { label: "Delivery Info", href: "/delivery-info" },
  { label: "FAQ", href: "/faq" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Track Order", href: "/account/orders" },
];

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="17" x2="12" y2="8" />
      <path d="M8 21c1.5-1 2.5-3 3-5" />
      <path d="M16 21c-1.5-1-2.5-3-3-5" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/lovebloomsflorist",
    icon: Instagram,
  },
  {
    label: "Facebook",
    href: "https://facebook.com/lovebloomsflorist",
    icon: Facebook,
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/lovebloomsflorist",
    icon: Twitter,
  },
  {
    label: "Pinterest",
    href: "https://pinterest.com/lovebloomsflorist",
    icon: PinterestIcon,
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a472a] text-white">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Flower className="h-8 w-8 text-white/90 transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-serif text-2xl font-bold tracking-tight">
                Love Blooms
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/70 max-w-xs">
              Hand-crafted bouquets delivered with love. We source the freshest
              seasonal blooms to create stunning arrangements for every occasion.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:hello@lovebloomsflorist.co.uk"
                className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors duration-200"
              >
                <Mail className="h-4 w-4 shrink-0" />
                hello@lovebloomsflorist.co.uk
              </a>
              <a
                href="tel:08001234567"
                className="flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors duration-200"
              >
                <Phone className="h-4 w-4 shrink-0" />
                0800 123 4567
              </a>
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <MapPin className="h-4 w-4 shrink-0" />
                London, United Kingdom
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all duration-200 hover:bg-white/20 hover:text-white hover:scale-105"
                >
                  <social.icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 tracking-wide">
              Shop
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors duration-200 hover:pl-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Occasions Column */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 tracking-wide">
              Occasions
            </h3>
            <ul className="space-y-3">
              {occasionLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors duration-200 hover:pl-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-5 tracking-wide">
              Help & Support
            </h3>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors duration-200 hover:pl-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Newsletter hint */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs font-medium uppercase tracking-widest text-white/50 mb-2">
                Free Delivery
              </p>
              <p className="text-sm text-white/70">
                On all orders over &pound;50
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-t border-white/10" />
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
          {/* Copyright */}
          <p className="text-xs text-white/50 text-center sm:text-left">
            &copy; {currentYear} Love Blooms Florist. All rights reserved.
          </p>

          {/* Payment Methods & Trust Badges */}
          <div className="flex items-center gap-6">
            {/* Payment Icons */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-white/40 mr-1">
                We accept
              </span>
              {/* Visa */}
              <span className="inline-flex h-7 items-center rounded bg-white/10 px-2 text-[10px] font-bold tracking-wide text-white/80">
                VISA
              </span>
              {/* Mastercard */}
              <span className="inline-flex h-7 items-center rounded bg-white/10 px-2 text-[10px] font-bold tracking-wide text-white/80">
                MC
              </span>
              {/* Amex */}
              <span className="inline-flex h-7 items-center rounded bg-white/10 px-2 text-[10px] font-bold tracking-wide text-white/80">
                AMEX
              </span>
              {/* Apple Pay */}
              <span className="inline-flex h-7 items-center rounded bg-white/10 px-2 text-[10px] font-bold tracking-wide text-white/80">
                <svg
                  className="h-3 w-3 mr-0.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                Pay
              </span>
            </div>

            {/* Trust Badges */}
            <div className="hidden sm:flex items-center gap-3 border-l border-white/10 pl-6">
              <div className="flex items-center gap-1.5 text-white/50">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-[10px] uppercase tracking-wider">
                  Secure Checkout
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-white/50">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <path d="M16 8h4l3 3v5h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span className="text-[10px] uppercase tracking-wider">
                  Next Day Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with Love Blooms Florist. Visit our London shop, call us, or send a message. We\'d love to hear from you.',
}

const contactDetails = [
  {
    icon: MapPin,
    label: 'Address',
    value: '123 Bloom Street, London, SW1A 1AA',
    href: 'https://maps.google.com/?q=123+Bloom+Street+London+SW1A+1AA',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '0800 123 4567',
    href: 'tel:08001234567',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@lovebloomsflorist.co.uk',
    href: 'mailto:hello@lovebloomsflorist.co.uk',
  },
  {
    icon: Clock,
    label: 'Opening Hours',
    value: 'Mon-Fri 8am-6pm, Sat 9am-5pm',
    href: null,
  },
]

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
      {/* Heading */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 font-serif text-4xl font-bold text-foreground md:text-5xl">
          Get in Touch
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Whether you have a question about an order, need help choosing the perfect
          bouquet, or want to discuss a bespoke arrangement, we&apos;re here to help.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Contact Form */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-border/50">
          <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">
            Send us a message
          </h2>
          <ContactForm />
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            Contact Information
          </h2>
          <p className="text-muted-foreground">
            Pop into our London shop, give us a ring, or drop us an email. We aim to
            respond to all enquiries within 24 hours.
          </p>

          <div className="space-y-4">
            {contactDetails.map((detail) => (
              <div
                key={detail.label}
                className="flex items-start gap-4 rounded-xl bg-muted/50 p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <detail.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{detail.label}</p>
                  {detail.href ? (
                    <a
                      href={detail.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      target={detail.href.startsWith('http') ? '_blank' : undefined}
                      rel={
                        detail.href.startsWith('http')
                          ? 'noopener noreferrer'
                          : undefined
                      }
                    >
                      {detail.value}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{detail.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Map Placeholder */}
          <div className="overflow-hidden rounded-2xl bg-muted/50 p-1">
            <div className="flex aspect-video items-center justify-center rounded-xl bg-muted">
              <div className="text-center">
                <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  123 Bloom Street, London, SW1A 1AA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

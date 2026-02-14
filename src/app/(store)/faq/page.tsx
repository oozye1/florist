import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ | Delivery, Orders, Returns & Flower Care Questions Answered',
  description:
    'Got a question? Find answers about flower delivery times, same-day ordering, returns policy, subscription plans, and flower care tips at Love Blooms Florist.',
}

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  name: string
  items: FAQItem[]
}

const faqCategories: FAQCategory[] = [
  {
    name: 'Ordering',
    items: [
      {
        question: 'How do I place an order?',
        answer:
          'Simply browse our collection, select the arrangement you love, choose your preferred delivery date, and proceed to checkout. You can pay securely with credit/debit card or PayPal.',
      },
      {
        question: 'Can I add a personalised message to my order?',
        answer:
          'Absolutely! During checkout you can add a complimentary handwritten card with your personal message. We take great care to present your words beautifully.',
      },
      {
        question: 'Can I order by phone?',
        answer:
          'Yes, you can call us on 0800 123 4567 during our opening hours (Mon-Fri 8am-6pm, Sat 9am-5pm) and one of our friendly team members will be happy to help you place an order.',
      },
      {
        question: 'Do you offer bespoke arrangements?',
        answer:
          'We do! If you have a specific colour palette, flower type, or style in mind, get in touch and our florists will create a one-of-a-kind arrangement tailored to your vision. Bespoke orders require at least 48 hours notice.',
      },
    ],
  },
  {
    name: 'Delivery',
    items: [
      {
        question: 'Do you offer same-day delivery?',
        answer:
          'Yes! We offer same-day delivery on selected arrangements when you order before 2pm. Same-day delivery is available for London postcodes. Check the product page to see if same-day delivery is available for your chosen bouquet.',
      },
      {
        question: 'What are your delivery charges?',
        answer:
          'Standard delivery is £4.99. Orders over £50 qualify for free standard delivery. Same-day delivery is £7.99, and next-day delivery is £5.99. Weekend delivery is available at no extra charge for scheduled orders.',
      },
      {
        question: 'Can I change my delivery date?',
        answer:
          'You can change your delivery date up to 24 hours before the scheduled delivery. Simply contact us by phone or email with your order number and we will do our best to accommodate your request.',
      },
      {
        question: 'What happens if no one is home?',
        answer:
          'Our delivery driver will look for a safe place to leave your flowers, such as a porch or with a neighbour. You will receive a notification with a photo of where the flowers were left. For our letterbox range, the flowers fit through a standard letterbox.',
      },
      {
        question: 'Do you deliver nationwide?',
        answer:
          'We deliver to most UK mainland addresses. Same-day delivery is limited to Greater London, while next-day and scheduled deliveries are available across England, Scotland, and Wales. Northern Ireland and the Scottish Highlands may require an additional day.',
      },
    ],
  },
  {
    name: 'Returns & Care',
    items: [
      {
        question: 'What if my flowers arrive damaged?',
        answer:
          'We take great care in packaging and delivering your flowers, but if they arrive damaged, please contact us within 24 hours with a photo and we will arrange a replacement or full refund — no questions asked.',
      },
      {
        question: 'How long will my flowers last?',
        answer:
          'With proper care, our bouquets typically last 7-10 days. We include flower food and a care card with every delivery. Key tips: trim stems at an angle, change water every 2-3 days, keep away from direct sunlight and fruit bowls.',
      },
      {
        question: 'Can I return my order?',
        answer:
          'Due to the perishable nature of fresh flowers, we are unable to accept returns. However, if you are not completely satisfied with your order, please contact us within 24 hours and we will make it right with a replacement or refund.',
      },
      {
        question: 'Do you offer a freshness guarantee?',
        answer:
          'Yes! We offer a 7-day freshness guarantee on all our bouquets. If your flowers do not last at least 7 days with proper care, we will send a replacement free of charge.',
      },
    ],
  },
  {
    name: 'Subscriptions',
    items: [
      {
        question: 'How do flower subscriptions work?',
        answer:
          'Our subscription service delivers a fresh, seasonal bouquet to your door on a schedule that suits you — weekly, fortnightly, or monthly. Each delivery is a new design curated by our florists, so every bouquet is a surprise.',
      },
      {
        question: 'Can I pause or cancel my subscription?',
        answer:
          'You can pause or cancel your subscription at any time with no penalty. Simply log into your account or contact us at least 3 days before your next scheduled delivery to make changes.',
      },
      {
        question: 'Can I gift a subscription?',
        answer:
          'Yes! Flower subscriptions make a wonderful gift. You can choose the duration (3, 6, or 12 months) and we will include a gift card with your personal message on the first delivery.',
      },
      {
        question: 'Do subscription bouquets come with free delivery?',
        answer:
          'All subscription deliveries include free standard delivery. This is one of the many perks of being a subscriber, along with exclusive seasonal arrangements and priority access to new collections.',
      },
    ],
  },
]

// Flatten FAQ items for JSON-LD structured data
const allFaqItems = faqCategories.flatMap((category) => category.items)

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold text-foreground md:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Everything you need to know about ordering, delivery, and caring for your
            flowers. Can&apos;t find what you&apos;re looking for?{' '}
            <a href="/contact" className="font-medium text-primary hover:underline">
              Get in touch
            </a>
            .
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqCategories.map((category) => (
            <section key={category.name}>
              <h2 className="mb-6 font-serif text-2xl font-semibold text-foreground">
                {category.name}
              </h2>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-xl border border-border bg-white transition-shadow hover:shadow-sm"
                  >
                    <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-left text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                      <span className="pr-4">{item.question}</span>
                      <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <line x1="8" y1="3" x2="8" y2="13" />
                          <line x1="3" y1="8" x2="13" y2="8" />
                        </svg>
                      </span>
                    </summary>
                    <div className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 rounded-2xl bg-primary/5 p-8 text-center md:p-12">
          <h2 className="mb-3 font-serif text-2xl font-bold text-foreground">
            Still have questions?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Our friendly team is always happy to help. Reach out to us and we&apos;ll get
            back to you as soon as possible.
          </p>
          <a
            href="/contact"
            className="inline-block rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary-dark"
          >
            Contact Us
          </a>
        </div>
      </div>
    </>
  )
}

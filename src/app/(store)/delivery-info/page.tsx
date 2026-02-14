import type { Metadata } from 'next'
import { Truck, Clock, MapPin, Package, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'UK Flower Delivery | Same-Day, Next-Day & Free Delivery Over £50',
  description:
    'Love Blooms delivers across the UK. Same-day delivery when ordered before 2pm, next-day guaranteed by midnight. Free standard delivery over £50. Hand-delivered with care to London, Manchester, Birmingham & more.',
}

const deliveryOptions = [
  {
    icon: Clock,
    title: 'Same-Day Delivery',
    description:
      'Need flowers fast? Order before 2pm and we will hand-deliver your arrangement the very same day. Available for selected products and London postcodes.',
    price: '£7.99',
    highlight: true,
  },
  {
    icon: Truck,
    title: 'Next-Day Delivery',
    description:
      'Order by 8pm for guaranteed delivery by 6pm the following day. Available across mainland UK.',
    price: '£5.99',
    highlight: false,
  },
  {
    icon: Package,
    title: 'Scheduled Delivery',
    description:
      'Choose your preferred delivery date up to 30 days in advance. Perfect for birthdays, anniversaries, and special occasions.',
    price: '£4.99',
    highlight: false,
  },
]

const deliveryAreas = [
  { area: 'Greater London', sameDay: true, nextDay: true, scheduled: true },
  { area: 'South East England', sameDay: false, nextDay: true, scheduled: true },
  { area: 'Midlands', sameDay: false, nextDay: true, scheduled: true },
  { area: 'North West England', sameDay: false, nextDay: true, scheduled: true },
  { area: 'North East England', sameDay: false, nextDay: true, scheduled: true },
  { area: 'South West England', sameDay: false, nextDay: true, scheduled: true },
  { area: 'Wales', sameDay: false, nextDay: true, scheduled: true },
  { area: 'Scotland (Lowlands)', sameDay: false, nextDay: true, scheduled: true },
  { area: 'Scottish Highlands & Islands', sameDay: false, nextDay: false, scheduled: true },
  { area: 'Northern Ireland', sameDay: false, nextDay: false, scheduled: true },
]

const cutoffTimes = [
  { day: 'Monday - Friday', sameDay: '2:00 PM', nextDay: '8:00 PM' },
  { day: 'Saturday', sameDay: '11:00 AM', nextDay: '5:00 PM' },
  { day: 'Sunday', sameDay: 'Not available', nextDay: '5:00 PM' },
]

export default function DeliveryInfoPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      {/* Heading */}
      <div className="mb-16 text-center">
        <h1 className="mb-4 font-serif text-4xl font-bold text-foreground md:text-5xl">
          Delivery Information
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          We take as much care delivering your flowers as we do arranging them. Here is
          everything you need to know about our delivery service.
        </p>
      </div>

      {/* Delivery Options */}
      <section className="mb-16">
        <h2 className="mb-8 font-serif text-2xl font-bold text-foreground">
          Delivery Options
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {deliveryOptions.map((option) => (
            <div
              key={option.title}
              className={`relative rounded-2xl border p-6 transition-shadow hover:shadow-md ${
                option.highlight
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-white'
              }`}
            >
              {option.highlight && (
                <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Fastest
                </span>
              )}
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <option.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">
                {option.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {option.description}
              </p>
              <p className="text-lg font-bold text-primary">{option.price}</p>
            </div>
          ))}
        </div>

        {/* Free delivery callout */}
        <div className="mt-6 flex items-center gap-3 rounded-xl bg-primary/5 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
            <Check className="h-5 w-5 text-primary-foreground" />
          </div>
          <p className="text-sm text-foreground">
            <span className="font-semibold">Free standard delivery</span> on all orders
            over{' '}
            <span className="font-semibold">£50</span>. Standard delivery fee is{' '}
            <span className="font-semibold">£4.99</span> for orders under £50.
          </p>
        </div>
      </section>

      {/* Delivery Areas */}
      <section className="mb-16">
        <div className="mb-6 flex items-center gap-3">
          <MapPin className="h-6 w-6 text-primary" />
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Delivery Areas
          </h2>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left font-medium text-foreground">
                    Area
                  </th>
                  <th className="px-5 py-3 text-center font-medium text-foreground">
                    Same Day
                  </th>
                  <th className="px-5 py-3 text-center font-medium text-foreground">
                    Next Day
                  </th>
                  <th className="px-5 py-3 text-center font-medium text-foreground">
                    Scheduled
                  </th>
                </tr>
              </thead>
              <tbody>
                {deliveryAreas.map((area, idx) => (
                  <tr
                    key={area.area}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/20'}
                  >
                    <td className="px-5 py-3 text-foreground">{area.area}</td>
                    <td className="px-5 py-3 text-center">
                      {area.sameDay ? (
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {area.nextDay ? (
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {area.scheduled ? (
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-muted-foreground">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Cutoff Times */}
      <section className="mb-16">
        <div className="mb-6 flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary" />
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Same-Day Cutoff Times
          </h2>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3 text-left font-medium text-foreground">Day</th>
                <th className="px-5 py-3 text-center font-medium text-foreground">
                  Same-Day Cutoff
                </th>
                <th className="px-5 py-3 text-center font-medium text-foreground">
                  Next-Day Cutoff
                </th>
              </tr>
            </thead>
            <tbody>
              {cutoffTimes.map((time, idx) => (
                <tr
                  key={time.day}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-muted/20'}
                >
                  <td className="px-5 py-3 text-foreground">{time.day}</td>
                  <td className="px-5 py-3 text-center text-muted-foreground">
                    {time.sameDay}
                  </td>
                  <td className="px-5 py-3 text-center text-muted-foreground">
                    {time.nextDay}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* What to Expect */}
      <section className="mb-16">
        <div className="mb-6 flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="font-serif text-2xl font-bold text-foreground">
            What to Expect
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: 'Careful Packaging',
              text: 'Every bouquet is packaged in our signature eco-friendly gift box with water tubes to keep stems hydrated during transit.',
            },
            {
              title: 'Delivery Notifications',
              text: 'You will receive an email and SMS notification when your flowers are out for delivery, along with a one-hour delivery window.',
            },
            {
              title: 'Safe Place Delivery',
              text: 'If no one is home, our driver will leave your flowers in a safe, sheltered spot and send you a photo confirmation.',
            },
            {
              title: 'Photo on Delivery',
              text: 'For gift orders, we can send you a photo of the delivered arrangement so you can see the smile you created.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl bg-muted/50 p-6"
            >
              <h3 className="mb-2 font-serif text-base font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Delivery FAQs */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <Truck className="h-6 w-6 text-primary" />
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Delivery FAQs
          </h2>
        </div>
        <div className="space-y-3">
          {[
            {
              q: 'Can I track my delivery?',
              a: 'Yes! Once your order is dispatched, you will receive a tracking link via email and SMS so you can follow your delivery in real time.',
            },
            {
              q: 'Do you deliver on weekends and bank holidays?',
              a: 'We deliver on Saturdays and most bank holidays. Sunday deliveries are available for scheduled orders placed before Friday 5pm. Please note that some bank holiday dates may have adjusted cutoff times.',
            },
            {
              q: 'What if I need to change my delivery address?',
              a: 'You can update your delivery address up to 12 hours before the scheduled delivery. Please contact us by phone or email with your order number and the new address.',
            },
            {
              q: 'Do you deliver to offices and hospitals?',
              a: 'Absolutely! We deliver to offices, hospitals, hotels, and other commercial addresses. For hospital deliveries, please check visiting policies as some wards may not accept flowers.',
            },
          ].map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-border bg-white transition-shadow hover:shadow-sm"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-left text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                <span className="pr-4">{faq.q}</span>
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
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

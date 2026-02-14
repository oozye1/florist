export const ADMIN_EMAILS = [
  'jamesfairfoul@gmail.com',
  'amandahardwick68@yahoo.co.uk',
]

export const SITE_NAME = 'Love Blooms Florist'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lovebloomsflorist.co.uk'
export const SITE_DESCRIPTION =
  'Hand-crafted luxury floral arrangements delivered across the UK. Same-day delivery available. Premium roses, bouquets & plants for every occasion.'

export const OCCASIONS = [
  { name: 'Birthday', slug: 'birthday', image: '/images/occasions/birthday.jpg', description: 'Make their birthday unforgettable with a stunning bouquet crafted with love.' },
  { name: 'Anniversary', slug: 'anniversary', image: '/images/occasions/anniversary.jpg', description: 'Celebrate your love story with romantic floral arrangements.' },
  { name: 'Sympathy', slug: 'sympathy', image: '/images/occasions/sympathy.jpg', description: 'Express your heartfelt condolences with graceful, respectful arrangements.' },
  { name: 'Wedding', slug: 'wedding', image: '/images/occasions/wedding.jpg', description: 'Create the wedding of your dreams with bespoke floral designs.' },
  { name: 'New Baby', slug: 'new-baby', image: '/images/occasions/new-baby.jpg', description: 'Welcome the newest arrival with joyful, colourful blooms.' },
  { name: 'Thank You', slug: 'thank-you', image: '/images/occasions/thank-you.jpg', description: 'Show your gratitude with a beautiful bouquet that speaks volumes.' },
  { name: 'Congratulations', slug: 'congratulations', image: '/images/occasions/congratulations.jpg', description: 'Celebrate their achievement with vibrant, celebratory flowers.' },
  { name: 'Romance', slug: 'romance', image: '/images/occasions/romance.jpg', description: 'Sweep them off their feet with luxurious romantic arrangements.' },
  { name: 'Get Well', slug: 'get-well', image: '/images/occasions/get-well.jpg', description: 'Brighten their day and lift their spirits with cheerful blooms.' },
] as const

export const CATEGORIES = [
  { name: 'Roses', slug: 'roses', description: 'Classic elegance in every petal' },
  { name: 'Mixed Bouquets', slug: 'mixed-bouquets', description: 'A beautiful medley of seasonal flowers' },
  { name: 'Luxury', slug: 'luxury', description: 'Premium arrangements for special moments' },
  { name: 'Plants', slug: 'plants', description: 'Long-lasting greenery for any space' },
  { name: 'Hampers', slug: 'hampers', description: 'Flowers paired with gourmet treats' },
  { name: 'Letterbox', slug: 'letterbox', description: 'Freshly cut flowers that fit through the letterbox' },
] as const

export const DELIVERY_TYPES = {
  same_day: {
    label: 'Same Day Delivery',
    description: 'Order by 2pm for delivery today',
    icon: 'Zap',
  },
  next_day: {
    label: 'Next Day Delivery',
    description: 'Guaranteed by 6pm tomorrow',
    icon: 'Truck',
  },
  scheduled: {
    label: 'Choose a Date',
    description: 'Select your preferred delivery date',
    icon: 'Calendar',
  },
} as const

export const UK_LOCATIONS = [
  { name: 'London', slug: 'london' },
  { name: 'Manchester', slug: 'manchester' },
  { name: 'Birmingham', slug: 'birmingham' },
  { name: 'Edinburgh', slug: 'edinburgh' },
  { name: 'Bristol', slug: 'bristol' },
  { name: 'Leeds', slug: 'leeds' },
  { name: 'Liverpool', slug: 'liverpool' },
  { name: 'Glasgow', slug: 'glasgow' },
  { name: 'Cardiff', slug: 'cardiff' },
  { name: 'Belfast', slug: 'belfast' },
] as const

export const ORDER_STATUSES: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-800' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}

export const PAYMENT_STATUSES: Record<string, { label: string; color: string }> = {
  unpaid: { label: 'Unpaid', color: 'bg-gray-100 text-gray-800' },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800' },
  refunded: { label: 'Refunded', color: 'bg-orange-100 text-orange-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
}

import type { Timestamp } from 'firebase/firestore'

// ============================================
// Products
// ============================================

export interface ProductImage {
  url: string
  alt: string
  isPrimary: boolean
}

export interface ProductVariant {
  id: string
  name: string
  priceModifier: number
  inStock: boolean
}

export type ProductSize = 'small' | 'medium' | 'large' | 'luxury'

export type CategorySlug =
  | 'roses'
  | 'mixed-bouquets'
  | 'luxury'
  | 'plants'
  | 'hampers'
  | 'letterbox'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  longDescription: string
  price: number
  compareAtPrice?: number
  category: CategorySlug
  categoryName: string
  occasions: string[]
  flowerTypes: string[]
  tags: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  size: ProductSize
  inStock: boolean
  stockQuantity?: number
  allowsSameDay: boolean
  allowsNextDay: boolean
  isFeatured: boolean
  isActive: boolean
  averageRating: number
  reviewCount: number
  seoTitle?: string
  seoDescription?: string
  searchTerms: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ============================================
// Orders
// ============================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed'

export type DeliveryType = 'same_day' | 'next_day' | 'scheduled'

export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  variantName?: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Address {
  line1: string
  line2?: string
  city: string
  county?: string
  postcode: string
  country: string
}

export interface Order {
  id: string
  orderNumber: string
  userId?: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  stripeSessionId: string
  stripePaymentIntentId: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  discountAmount: number
  total: number
  deliveryType: DeliveryType
  deliveryDate: string
  billingName: string
  billingEmail: string
  billingPhone?: string
  billingAddress: Address
  recipientName: string
  recipientPhone?: string
  deliveryAddress: Address
  giftMessage?: string
  deliveryInstructions?: string
  couponCode?: string
  loyaltyPointsUsed: number
  loyaltyPointsEarned: number
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ============================================
// Users
// ============================================

export type UserRole = 'customer' | 'admin'

export interface UserProfile {
  uid: string
  email: string
  fullName: string
  phone?: string
  role: UserRole
  loyaltyPoints: number
  createdAt: Timestamp
}

export interface SavedAddress {
  id: string
  label: string
  fullName: string
  line1: string
  line2?: string
  city: string
  county?: string
  postcode: string
  phone?: string
  isDefault: boolean
  createdAt: Timestamp
}

// ============================================
// Reviews
// ============================================

export interface Review {
  id: string
  productId: string
  productName: string
  userId: string
  userName: string
  orderId?: string
  rating: number
  title?: string
  body?: string
  isVerifiedPurchase: boolean
  isApproved: boolean
  adminResponse?: string
  createdAt: Timestamp
}

// ============================================
// Categories & Occasions
// ============================================

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string
  sortOrder: number
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
}

export interface Occasion {
  id: string
  name: string
  slug: string
  description: string
  imageUrl: string
  sortOrder: number
  isActive: boolean
  seoTitle?: string
  seoDescription?: string
}

// ============================================
// Delivery
// ============================================

export interface DeliveryZone {
  id: string
  name: string
  postcodes: string[]
  sameDayAvailable: boolean
  nextDayAvailable: boolean
  sameDayCutoff?: string
  deliveryFee: number
  freeDeliveryThreshold?: number
  isActive: boolean
}

// ============================================
// Coupons
// ============================================

export type DiscountType = 'percentage' | 'fixed_amount' | 'free_delivery'

export interface Coupon {
  id: string
  code: string
  description?: string
  discountType: DiscountType
  discountValue: number
  minimumOrder?: number
  maxUses?: number
  timesUsed: number
  startsAt?: Timestamp
  expiresAt?: Timestamp
  isActive: boolean
  createdAt: Timestamp
}

// ============================================
// Subscriptions
// ============================================

export type SubscriptionFrequency = 'weekly' | 'fortnightly' | 'monthly'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled'

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string
  frequency: SubscriptionFrequency
  price: number
  imageUrl: string
  isActive: boolean
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  deliveryAddressId?: string
  stripeSubscriptionId?: string
  nextDeliveryDate?: string
  startedAt: Timestamp
  cancelledAt?: Timestamp
  createdAt: Timestamp
}

// ============================================
// Gift Cards
// ============================================

export interface GiftCard {
  id: string
  code: string
  initialBalance: number
  currentBalance: number
  purchaserId?: string
  recipientEmail?: string
  recipientName?: string
  message?: string
  isActive: boolean
  expiresAt?: Timestamp
  createdAt: Timestamp
}

// ============================================
// Loyalty
// ============================================

export interface LoyaltyTransaction {
  id: string
  userId: string
  points: number
  reason: string
  orderId?: string
  createdAt: Timestamp
}

// ============================================
// Blog
// ============================================

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  coverImageUrl?: string
  authorId?: string
  authorName?: string
  isPublished: boolean
  publishedAt?: Timestamp
  tags: string[]
  seoTitle?: string
  seoDescription?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ============================================
// Banners & Settings
// ============================================

export type BannerPosition = 'hero' | 'homepage_mid' | 'category_top' | 'announcement'

export interface Banner {
  id: string
  title: string
  subtitle?: string
  imageUrl?: string
  linkUrl?: string
  position: BannerPosition
  startsAt?: Timestamp
  endsAt?: Timestamp
  isActive: boolean
  sortOrder: number
}

export interface LocationPage {
  id: string
  locationName: string
  slug: string
  heading: string
  content: string
  metaTitle?: string
  metaDescription?: string
  isActive: boolean
}

// ============================================
// Homepage Content
// ============================================

export interface HeroContent {
  imageUrl: string
  imageAlt: string
  heading: string
  subheading: string
  primaryButton: { text: string; href: string }
  secondaryButton: { text: string; href: string }
}

export interface USPItem {
  icon: string
  text: string
}

export interface OccasionItem {
  name: string
  slug: string
  image: string
  description: string
}

export interface TestimonialItem {
  quote: string
  name: string
  location: string
  rating: number
}

export interface NewsletterContent {
  heading: string
  description: string
}

export interface HomepageContent {
  id: string
  hero: HeroContent
  uspItems: USPItem[]
  occasions: OccasionItem[]
  testimonials: TestimonialItem[]
  newsletter: NewsletterContent
  updatedAt?: Timestamp
}

// ============================================
// Store Settings
// ============================================

export interface StoreSettings {
  id: string
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: {
    street: string
    city: string
    postcode: string
    country: string
  }
  freeDeliveryThreshold: number
  sameDayCutoff: string
  nextDayCutoff: string
  stripePublishableKey: string
  stripeSecretKey: string
  emailProvider: 'none' | 'smtp' | 'sendgrid' | 'resend'
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  sendgridApiKey: string
  resendApiKey: string
  fromEmail: string
  fromName: string
  adminEmails: string[]
  updatedAt?: Timestamp
}

// ============================================
// Cart (Client-side)
// ============================================

export interface CartItem {
  productId: string
  variantId?: string
  name: string
  variantName?: string
  price: number
  imageUrl: string
  quantity: number
  giftMessage?: string
  slug: string
}

// ============================================
// Chat
// ============================================

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

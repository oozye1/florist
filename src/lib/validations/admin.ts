import { z } from 'zod'

// ============================================
// Product Schema
// ============================================

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required').max(500),
  longDescription: z.string(),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive().optional(),
  category: z.enum(['roses', 'mixed-bouquets', 'luxury', 'plants', 'hampers', 'letterbox']),
  categoryName: z.string().min(1),
  size: z.enum(['small', 'medium', 'large', 'luxury']),
  inStock: z.boolean(),
  stockQuantity: z.number().int().min(0),
  allowsSameDay: z.boolean(),
  allowsNextDay: z.boolean(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  occasions: z.array(z.string()),
  flowerTypes: z.string(),
  tags: z.string(),
  images: z.array(z.object({
    url: z.string().url('Valid URL required'),
    alt: z.string(),
    isPrimary: z.boolean(),
  })).min(1, 'At least one image required'),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Variant name required'),
    priceModifier: z.number(),
    inStock: z.boolean(),
  })),
  seoTitle: z.string(),
  seoDescription: z.string(),
  searchTerms: z.string(),
})

export type ProductFormData = z.infer<typeof productSchema>

// ============================================
// Coupon Schema
// ============================================

export const couponSchema = z.object({
  code: z.string().min(1, 'Code is required').max(30),
  description: z.string(),
  discountType: z.enum(['percentage', 'fixed_amount', 'free_delivery']),
  discountValue: z.number().min(0),
  minimumOrder: z.number().min(0).optional(),
  maxUses: z.number().int().min(0).optional(),
  isActive: z.boolean(),
  expiresAt: z.string().optional(),
})

export type CouponFormData = z.infer<typeof couponSchema>

// ============================================
// Blog Post Schema
// ============================================

export const blogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string(),
  content: z.string().min(1, 'Content is required'),
  coverImageUrl: z.string(),
  authorName: z.string(),
  tags: z.string(),
  isPublished: z.boolean(),
  seoTitle: z.string(),
  seoDescription: z.string(),
})

export type BlogPostFormData = z.infer<typeof blogPostSchema>

// ============================================
// Subscription Plan Schema
// ============================================

export const subscriptionPlanSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  frequency: z.enum(['weekly', 'fortnightly', 'monthly']),
  price: z.number().positive('Price must be greater than 0'),
  imageUrl: z.string(),
  isActive: z.boolean(),
})

export type SubscriptionPlanFormData = z.infer<typeof subscriptionPlanSchema>

// ============================================
// Delivery Zone Schema
// ============================================

export const deliveryZoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required'),
  postcodes: z.string().min(1, 'At least one postcode prefix required'),
  sameDayAvailable: z.boolean(),
  nextDayAvailable: z.boolean(),
  sameDayCutoff: z.string(),
  deliveryFee: z.number().min(0),
  freeDeliveryThreshold: z.number().min(0).optional(),
  isActive: z.boolean(),
})

export type DeliveryZoneFormData = z.infer<typeof deliveryZoneSchema>

// ============================================
// Settings Schema
// ============================================

export const settingsSchema = z.object({
  storeName: z.string().min(1, 'Store name is required'),
  storeEmail: z.string().email('Valid email required'),
  storePhone: z.string(),
  storeAddress: z.object({
    street: z.string(),
    city: z.string(),
    postcode: z.string(),
    country: z.string(),
  }),
  freeDeliveryThreshold: z.number().min(0),
  sameDayCutoff: z.string(),
  nextDayCutoff: z.string(),
  stripePublishableKey: z.string(),
  stripeSecretKey: z.string(),
  emailProvider: z.enum(['none', 'smtp', 'sendgrid', 'resend']),
  smtpHost: z.string(),
  smtpPort: z.number(),
  smtpUser: z.string(),
  smtpPass: z.string(),
  sendgridApiKey: z.string(),
  resendApiKey: z.string(),
  fromEmail: z.string(),
  fromName: z.string(),
  adminEmails: z.array(z.string().email()),
})

export type SettingsFormData = z.infer<typeof settingsSchema>

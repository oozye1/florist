/**
 * Seed script for Firestore
 * Run with: npx tsx scripts/seed.ts
 *
 * Requires FIREBASE_ADMIN_* env vars in .env.local
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load env vars from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}

if (!serviceAccount.projectId) {
  console.error('Missing FIREBASE_ADMIN_PROJECT_ID in .env.local')
  process.exit(1)
}

const app = initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore(app)

// ---- Product data (matches SEED_PRODUCTS from src/lib/seed-data.ts) ----

const products = [
  {
    name: 'Velvet Red Romance',
    slug: 'velvet-red-romance',
    description: 'A breathtaking dozen of premium long-stem red roses, symbolising deep love and passion.',
    longDescription: 'Our signature arrangement of twelve exquisite long-stem red roses, each carefully selected for their velvety petals and intoxicating fragrance. Presented in our luxury gift box with hand-tied ribbon and complementary flower food. The ultimate expression of love.',
    price: 89.99,
    compareAtPrice: 109.99,
    category: 'roses',
    categoryName: 'Roses',
    occasions: ['romance', 'anniversary', 'birthday'],
    flowerTypes: ['roses'],
    tags: ['red roses', 'romance', 'luxury', 'bestseller'],
    images: [
      { url: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&q=80', alt: 'Velvet Red Romance bouquet', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=800&q=80', alt: 'Red roses close-up', isPrimary: false },
    ],
    variants: [
      { id: 'v1', name: 'Standard (12 stems)', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Deluxe (24 stems)', priceModifier: 45, inStock: true },
      { id: 'v3', name: 'Luxury (50 stems)', priceModifier: 110, inStock: true },
    ],
    size: 'medium',
    inStock: true,
    stockQuantity: 50,
    allowsSameDay: true,
    allowsNextDay: true,
    isFeatured: true,
    isActive: true,
    averageRating: 4.9,
    reviewCount: 127,
    searchTerms: 'velvet red romance roses dozen long stem love passion luxury',
  },
  {
    name: 'Blush Pink Elegance',
    slug: 'blush-pink-elegance',
    description: 'Delicate pink roses in graduating shades, a vision of grace and femininity.',
    longDescription: 'An enchanting collection of pink roses in soft blush tones, artfully arranged to create a stunning gradient effect. Perfect for celebrating the women in your life or adding a touch of elegance to any space.',
    price: 74.99,
    category: 'roses',
    categoryName: 'Roses',
    occasions: ['birthday', 'thank-you', 'romance'],
    flowerTypes: ['roses'],
    tags: ['pink roses', 'elegant', 'feminine'],
    images: [
      { url: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&q=80', alt: 'Blush Pink Elegance', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Standard (12 stems)', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Deluxe (24 stems)', priceModifier: 40, inStock: true },
    ],
    size: 'medium',
    inStock: true,
    stockQuantity: 35,
    allowsSameDay: true,
    allowsNextDay: true,
    isFeatured: true,
    isActive: true,
    averageRating: 4.8,
    reviewCount: 89,
    searchTerms: 'blush pink elegance roses feminine grace',
  },
  {
    name: 'Ivory White Serenity',
    slug: 'ivory-white-serenity',
    description: 'Pure white roses representing peace, sympathy and new beginnings.',
    longDescription: 'A serene arrangement of pristine white roses, symbolising purity and remembrance. Ideal for sympathy, weddings, or as an elegant gift that transcends any occasion.',
    price: 79.99,
    category: 'roses',
    categoryName: 'Roses',
    occasions: ['sympathy', 'wedding', 'congratulations'],
    flowerTypes: ['roses'],
    tags: ['white roses', 'sympathy', 'wedding', 'pure'],
    images: [
      { url: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80', alt: 'Ivory White Serenity', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Standard (12 stems)', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Deluxe (24 stems)', priceModifier: 40, inStock: true },
    ],
    size: 'medium',
    inStock: true,
    stockQuantity: 40,
    allowsSameDay: true,
    allowsNextDay: true,
    isFeatured: false,
    isActive: true,
    averageRating: 4.7,
    reviewCount: 56,
    searchTerms: 'ivory white serenity roses sympathy wedding pure peace',
  },
  {
    name: 'Spring Awakening',
    slug: 'spring-awakening',
    description: 'A vibrant mix of seasonal spring flowers bursting with colour and fragrance.',
    longDescription: 'Celebrate the season with this joyful medley of tulips, daffodils, hyacinths, and ranunculus in a riot of spring colours. Each bouquet is uniquely crafted using the freshest seasonal blooms available.',
    price: 54.99,
    category: 'mixed-bouquets',
    categoryName: 'Mixed Bouquets',
    occasions: ['birthday', 'thank-you', 'congratulations', 'get-well'],
    flowerTypes: ['tulips', 'daffodils', 'hyacinths', 'ranunculus'],
    tags: ['spring', 'seasonal', 'colourful', 'cheerful'],
    images: [
      { url: 'https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=800&q=80', alt: 'Spring Awakening bouquet', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Standard', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Large', priceModifier: 20, inStock: true },
    ],
    size: 'medium',
    inStock: true,
    stockQuantity: 60,
    allowsSameDay: true,
    allowsNextDay: true,
    isFeatured: true,
    isActive: true,
    averageRating: 4.8,
    reviewCount: 203,
    searchTerms: 'spring awakening mixed bouquet seasonal tulips colourful',
  },
  {
    name: 'Wildflower Meadow',
    slug: 'wildflower-meadow',
    description: 'A rustic, hand-gathered bouquet inspired by English countryside meadows.',
    longDescription: 'Inspired by the natural beauty of the English countryside, this relaxed arrangement features a carefully curated mix of wildflowers, grasses, and foliage for an effortlessly beautiful look.',
    price: 49.99,
    category: 'mixed-bouquets',
    categoryName: 'Mixed Bouquets',
    occasions: ['birthday', 'thank-you', 'get-well'],
    flowerTypes: ['wildflowers', 'daisies', 'cornflowers'],
    tags: ['wildflower', 'rustic', 'countryside', 'natural'],
    images: [
      { url: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80', alt: 'Wildflower Meadow', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Standard', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Large', priceModifier: 15, inStock: true },
    ],
    size: 'medium',
    inStock: true,
    stockQuantity: 45,
    allowsSameDay: false,
    allowsNextDay: true,
    isFeatured: true,
    isActive: true,
    averageRating: 4.6,
    reviewCount: 142,
    searchTerms: 'wildflower meadow rustic countryside natural english',
  },
  {
    name: 'Sunset Glow',
    slug: 'sunset-glow',
    description: 'Warm orange, coral and peach tones captured in a stunning autumnal arrangement.',
    longDescription: 'A captivating arrangement featuring warm-toned blooms in shades of burnt orange, coral, and peach. Includes roses, gerberas, chrysanthemums, and seasonal foliage for a rich, inviting display.',
    price: 59.99,
    category: 'mixed-bouquets',
    categoryName: 'Mixed Bouquets',
    occasions: ['birthday', 'thank-you', 'congratulations'],
    flowerTypes: ['roses', 'gerberas', 'chrysanthemums'],
    tags: ['autumn', 'warm tones', 'orange', 'coral'],
    images: [
      { url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80', alt: 'Sunset Glow bouquet', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Standard', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Large', priceModifier: 20, inStock: true },
    ],
    size: 'medium',
    inStock: true,
    stockQuantity: 30,
    allowsSameDay: true,
    allowsNextDay: true,
    isFeatured: false,
    isActive: true,
    averageRating: 4.7,
    reviewCount: 78,
    searchTerms: 'sunset glow autumn warm orange coral peach',
  },
  {
    name: 'Pastel Dreams',
    slug: 'pastel-dreams',
    description: 'Soft pastel flowers in lavender, baby pink and cream for a dreamy, romantic feel.',
    longDescription: 'A delicate, romantic arrangement featuring soft pastel blooms in lavender, baby pink, and cream. Includes roses, lisianthus, stock, and delicate filler flowers for a truly dreamlike display.',
    price: 64.99,
    category: 'mixed-bouquets',
    categoryName: 'Mixed Bouquets',
    occasions: ['romance', 'birthday', 'new-baby', 'wedding'],
    flowerTypes: ['roses', 'lisianthus', 'stock'],
    tags: ['pastel', 'romantic', 'dreamy', 'soft'],
    images: [
      { url: 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=800&q=80', alt: 'Pastel Dreams', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Standard', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Large', priceModifier: 20, inStock: true },
    ],
    size: 'medium',
    inStock: true,
    stockQuantity: 40,
    allowsSameDay: true,
    allowsNextDay: true,
    isFeatured: true,
    isActive: true,
    averageRating: 4.9,
    reviewCount: 165,
    searchTerms: 'pastel dreams romantic lavender pink cream soft',
  },
  {
    name: 'English Garden',
    slug: 'english-garden',
    description: 'A quintessentially British bouquet of garden roses, peonies and sweet peas.',
    longDescription: 'Transport yourself to a quintessential English garden with this luxurious arrangement of garden roses, peonies, sweet peas, and fragrant herbs. A celebration of British floristry at its finest.',
    price: 69.99,
    category: 'mixed-bouquets',
    categoryName: 'Mixed Bouquets',
    occasions: ['birthday', 'anniversary', 'thank-you'],
    flowerTypes: ['garden roses', 'peonies', 'sweet peas'],
    tags: ['english garden', 'peonies', 'fragrant', 'classic'],
    images: [
      { url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80', alt: 'English Garden', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Standard', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Grand', priceModifier: 30, inStock: true },
    ],
    size: 'medium',
    inStock: true,
    stockQuantity: 25,
    allowsSameDay: false,
    allowsNextDay: true,
    isFeatured: true,
    isActive: true,
    averageRating: 4.8,
    reviewCount: 94,
    searchTerms: 'english garden peonies roses sweet peas british classic',
  },
  {
    name: 'The Grand Gesture',
    slug: 'the-grand-gesture',
    description: '100 premium red roses in a luxury hat box — the ultimate romantic statement.',
    longDescription: 'Make a statement that words cannot express. One hundred premium long-stem red roses, expertly arranged in our signature luxury hat box. This extraordinary arrangement is the pinnacle of romantic gestures.',
    price: 249.99,
    compareAtPrice: 299.99,
    category: 'luxury',
    categoryName: 'Luxury',
    occasions: ['romance', 'anniversary'],
    flowerTypes: ['roses'],
    tags: ['luxury', '100 roses', 'hat box', 'ultimate', 'premium'],
    images: [
      { url: 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=800&q=80', alt: 'The Grand Gesture', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Classic Red', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Mixed Pinks', priceModifier: 0, inStock: true },
    ],
    size: 'luxury',
    inStock: true,
    stockQuantity: 10,
    allowsSameDay: false,
    allowsNextDay: true,
    isFeatured: true,
    isActive: true,
    averageRating: 5.0,
    reviewCount: 42,
    searchTerms: 'grand gesture 100 roses luxury hat box premium romantic statement',
  },
  {
    name: 'Orchid Elegance Collection',
    slug: 'orchid-elegance-collection',
    description: 'Exotic orchid arrangement in a contemporary glass vase — pure sophistication.',
    longDescription: 'A stunning display of exotic phalaenopsis orchids in pristine white and deep purple, artistically arranged in a contemporary glass vase. This sophisticated arrangement brings modern elegance to any room.',
    price: 129.99,
    category: 'luxury',
    categoryName: 'Luxury',
    occasions: ['congratulations', 'anniversary', 'thank-you'],
    flowerTypes: ['orchids'],
    tags: ['orchid', 'exotic', 'contemporary', 'sophisticated'],
    images: [
      { url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800&q=80', alt: 'Orchid Elegance', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Single Stem', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Double Stem', priceModifier: 40, inStock: true },
      { id: 'v3', name: 'Triple Stem', priceModifier: 80, inStock: true },
    ],
    size: 'large',
    inStock: true,
    stockQuantity: 15,
    allowsSameDay: false,
    allowsNextDay: true,
    isFeatured: false,
    isActive: true,
    averageRating: 4.8,
    reviewCount: 31,
    searchTerms: 'orchid elegance collection exotic contemporary vase',
  },
  {
    name: 'Peony Paradise',
    slug: 'peony-paradise',
    description: 'Sumptuous seasonal peonies in soft pinks and corals — available May to July.',
    longDescription: 'A breathtaking arrangement of the most sought-after flower: the peony. Available during their short but glorious season (May–July), these sumptuous blooms in soft pinks and corals are the epitome of luxury.',
    price: 99.99,
    category: 'luxury',
    categoryName: 'Luxury',
    occasions: ['romance', 'birthday', 'anniversary', 'wedding'],
    flowerTypes: ['peonies'],
    tags: ['peony', 'seasonal', 'luxury', 'pink'],
    images: [
      { url: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&q=80', alt: 'Peony Paradise', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Petite (5 stems)', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Classic (10 stems)', priceModifier: 50, inStock: true },
    ],
    size: 'medium',
    inStock: true,
    stockQuantity: 20,
    allowsSameDay: false,
    allowsNextDay: true,
    isFeatured: true,
    isActive: true,
    averageRating: 4.9,
    reviewCount: 67,
    searchTerms: 'peony paradise seasonal luxury pink coral',
  },
  {
    name: 'Peace Lily',
    slug: 'peace-lily',
    description: 'A graceful peace lily in a ceramic planter — perfect for home or office.',
    longDescription: 'The classic peace lily (Spathiphyllum) is beloved for its elegant white flowers and air-purifying qualities. Presented in a handmade ceramic planter, it makes a thoughtful and long-lasting gift.',
    price: 39.99,
    category: 'plants',
    categoryName: 'Plants',
    occasions: ['sympathy', 'thank-you', 'new-baby', 'get-well'],
    flowerTypes: ['peace lily'],
    tags: ['plant', 'indoor', 'air purifying', 'easy care'],
    images: [
      { url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80', alt: 'Peace Lily', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Small', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Large', priceModifier: 20, inStock: true },
    ],
    size: 'medium',
    inStock: true,
    stockQuantity: 30,
    allowsSameDay: false,
    allowsNextDay: true,
    isFeatured: false,
    isActive: true,
    averageRating: 4.6,
    reviewCount: 88,
    searchTerms: 'peace lily plant indoor air purifying easy care ceramic',
  },
  {
    name: 'Monstera Deliciosa',
    slug: 'monstera-deliciosa',
    description: 'The iconic Swiss cheese plant — a statement piece for any modern interior.',
    longDescription: 'The Monstera Deliciosa, with its distinctive split leaves, has become the must-have houseplant. This mature specimen comes in a stylish woven basket and is ready to make a bold statement in your home.',
    price: 49.99,
    category: 'plants',
    categoryName: 'Plants',
    occasions: ['birthday', 'congratulations', 'thank-you'],
    flowerTypes: ['monstera'],
    tags: ['plant', 'indoor', 'trendy', 'statement'],
    images: [
      { url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&q=80', alt: 'Monstera', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Medium', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Large', priceModifier: 25, inStock: true },
    ],
    size: 'large',
    inStock: true,
    stockQuantity: 20,
    allowsSameDay: false,
    allowsNextDay: true,
    isFeatured: false,
    isActive: true,
    averageRating: 4.7,
    reviewCount: 53,
    searchTerms: 'monstera deliciosa swiss cheese plant indoor trendy modern',
  },
  {
    name: 'Flowers & Fizz Hamper',
    slug: 'flowers-and-fizz-hamper',
    description: 'A seasonal bouquet paired with a bottle of premium Prosecco.',
    longDescription: 'The perfect celebration combo: a hand-crafted seasonal bouquet paired with a bottle of premium Italian Prosecco. Beautifully presented in our signature gift box. Available for recipients aged 18+.',
    price: 79.99,
    category: 'hampers',
    categoryName: 'Hampers',
    occasions: ['birthday', 'congratulations', 'anniversary', 'romance'],
    flowerTypes: ['mixed'],
    tags: ['hamper', 'prosecco', 'celebration', 'gift set'],
    images: [
      { url: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=800&q=80', alt: 'Flowers & Fizz', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Prosecco', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Champagne Upgrade', priceModifier: 25, inStock: true },
    ],
    size: 'large',
    inStock: true,
    stockQuantity: 25,
    allowsSameDay: false,
    allowsNextDay: true,
    isFeatured: true,
    isActive: true,
    averageRating: 4.8,
    reviewCount: 112,
    searchTerms: 'flowers fizz hamper prosecco celebration gift set champagne',
  },
  {
    name: 'Chocolate & Blooms',
    slug: 'chocolate-and-blooms',
    description: 'Beautiful blooms paired with a luxury box of Belgian chocolates.',
    longDescription: 'Treat someone special to the best of both worlds: a stunning hand-tied bouquet paired with a box of handmade Belgian chocolates. A winning combination for birthdays, anniversaries, or just because.',
    price: 69.99,
    category: 'hampers',
    categoryName: 'Hampers',
    occasions: ['birthday', 'romance', 'thank-you', 'get-well'],
    flowerTypes: ['mixed'],
    tags: ['hamper', 'chocolate', 'belgian', 'gift set'],
    images: [
      { url: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80', alt: 'Chocolate & Blooms', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Classic', priceModifier: 0, inStock: true },
      { id: 'v2', name: 'Deluxe', priceModifier: 15, inStock: true },
    ],
    size: 'large',
    inStock: true,
    stockQuantity: 30,
    allowsSameDay: false,
    allowsNextDay: true,
    isFeatured: false,
    isActive: true,
    averageRating: 4.7,
    reviewCount: 76,
    searchTerms: 'chocolate blooms hamper belgian gift set treat',
  },
  {
    name: 'Sunshine Letterbox',
    slug: 'sunshine-letterbox',
    description: 'Bright, cheerful stems designed to fit through a standard UK letterbox.',
    longDescription: 'Our Sunshine Letterbox bouquet features carefully selected stems in vibrant yellows and oranges, arranged in a slim, protective package that fits through a standard letterbox. Perfect when you know the recipient may be out.',
    price: 29.99,
    category: 'letterbox',
    categoryName: 'Letterbox',
    occasions: ['birthday', 'thank-you', 'get-well', 'congratulations'],
    flowerTypes: ['sunflowers', 'roses', 'chrysanthemums'],
    tags: ['letterbox', 'convenient', 'cheerful', 'yellow'],
    images: [
      { url: 'https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=800&q=80', alt: 'Sunshine Letterbox', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Standard', priceModifier: 0, inStock: true },
    ],
    size: 'small',
    inStock: true,
    stockQuantity: 80,
    allowsSameDay: false,
    allowsNextDay: true,
    isFeatured: false,
    isActive: true,
    averageRating: 4.5,
    reviewCount: 234,
    searchTerms: 'sunshine letterbox yellow cheerful convenient fits through door',
  },
  {
    name: 'Lavender Bliss Letterbox',
    slug: 'lavender-bliss-letterbox',
    description: 'Soothing lavender and purple stems in a letterbox-friendly format.',
    longDescription: 'A soothing selection of lavender-toned blooms arranged in our clever letterbox-friendly packaging. Each stem arrives in water-filled tubes to ensure maximum freshness on arrival.',
    price: 32.99,
    category: 'letterbox',
    categoryName: 'Letterbox',
    occasions: ['birthday', 'thank-you', 'get-well'],
    flowerTypes: ['lavender', 'roses', 'lisianthus'],
    tags: ['letterbox', 'lavender', 'purple', 'calming'],
    images: [
      { url: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&q=80', alt: 'Lavender Bliss Letterbox', isPrimary: true },
    ],
    variants: [
      { id: 'v1', name: 'Standard', priceModifier: 0, inStock: true },
    ],
    size: 'small',
    inStock: true,
    stockQuantity: 70,
    allowsSameDay: false,
    allowsNextDay: true,
    isFeatured: false,
    isActive: true,
    averageRating: 4.6,
    reviewCount: 156,
    searchTerms: 'lavender bliss letterbox purple calming soothing',
  },
]

// ---- Blog posts ----

const blogPosts = [
  {
    title: "Valentine's Day 2026: The Ultimate Flower Guide",
    slug: 'valentines-day-flowers-guide',
    excerpt: "From classic red roses to unexpected blooms, discover the perfect flowers to express your love this Valentine's Day.",
    content: "## The Language of Love Through Flowers\n\nValentine's Day is the perfect occasion to let flowers speak for you. Whether you're celebrating a new romance or decades of love, the right blooms can say it all.\n\n### Classic Red Roses — The Timeless Choice\n\nNothing says \"I love you\" quite like a bouquet of velvety red roses. Our **Velvet Red Romance** arrangement features twelve premium long-stem Ecuadorian roses, each chosen for their rich colour and intoxicating fragrance.\n\n### Beyond Roses\n\nDon't limit yourself! Here are some stunning alternatives:\n\n- **Peonies** — Represent romance, prosperity, and happy marriage\n- **Tulips** — Red tulips declare \"perfect love\"\n- **Orchids** — Symbolise luxury, strength, and rare beauty\n- **Ranunculus** — Their layered petals whisper \"I am dazzled by your charms\"",
    coverImageUrl: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1200&q=80',
    authorName: 'Love Blooms Team',
    isPublished: true,
    tags: ['Valentines', 'Gift Guide'],
  },
  {
    title: '10 Expert Tips to Keep Your Flowers Fresh Longer',
    slug: 'how-to-keep-flowers-fresh',
    excerpt: 'Our florists share their top secrets for extending the life of your cut flowers by up to two weeks.',
    content: "## Expert Flower Care Tips\n\n### 1. Cut the stems at an angle\nThis increases the surface area for water absorption.\n\n### 2. Change the water every two days\nFresh water prevents bacteria buildup.\n\n### 3. Remove leaves below the waterline\nSubmerged leaves rot and contaminate the water.\n\n### 4. Use flower food\nThe sachet included with your bouquet contains essential nutrients.\n\n### 5. Keep flowers cool\nAvoid direct sunlight and heat sources.",
    coverImageUrl: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1200&q=80',
    authorName: 'Love Blooms Team',
    isPublished: true,
    tags: ['Care Tips', 'How To'],
  },
  {
    title: 'Spring 2026 Flower Trends: What to Expect',
    slug: 'spring-flower-trends-2026',
    excerpt: 'From bold colour palettes to sustainable floristry, here are the trends shaping spring arrangements this year.',
    content: "## Spring Flower Trends\n\n### Bold Colour Palettes\nThis spring is all about vibrant, unexpected colour combinations.\n\n### Sustainable Floristry\nLocally grown, seasonal blooms are more popular than ever.\n\n### Dried Flower Accents\nMixing dried elements with fresh flowers creates textural interest.",
    coverImageUrl: 'https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=1200&q=80',
    authorName: 'Love Blooms Team',
    isPublished: true,
    tags: ['Trends', 'Seasonal'],
  },
  {
    title: 'Wedding Flowers: A Complete Planning Guide',
    slug: 'wedding-flower-ideas',
    excerpt: 'Everything you need to know about choosing the perfect flowers for your big day, from bouquets to centrepieces.',
    content: "## Wedding Flower Planning\n\n### Choosing Your Bouquet\nConsider the season, your dress style, and your colour palette.\n\n### Centrepieces\nLow arrangements encourage conversation; tall ones add drama.\n\n### Seasonal Considerations\nSpring: peonies, ranunculus. Summer: roses, dahlias. Autumn: chrysanthemums. Winter: amaryllis, hellebores.",
    coverImageUrl: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1200&q=80',
    authorName: 'Love Blooms Team',
    isPublished: true,
    tags: ['Wedding', 'Planning'],
  },
  {
    title: 'Best Indoor Plants for Beginners: A No-Fuss Guide',
    slug: 'best-indoor-plants-beginners',
    excerpt: "New to plant parenthood? These five houseplants are virtually indestructible and will thrive in any home.",
    content: "## Best Indoor Plants for Beginners\n\n### 1. Peace Lily\nThrives in low light and tells you when it needs water (the leaves droop).\n\n### 2. Snake Plant\nVirtually indestructible. Tolerates neglect and low light.\n\n### 3. Pothos\nFast-growing vine that purifies the air.\n\n### 4. Spider Plant\nEasy to propagate and great for hanging baskets.\n\n### 5. ZZ Plant\nThrives on neglect — water once a month.",
    coverImageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=1200&q=80',
    authorName: 'Love Blooms Team',
    isPublished: true,
    tags: ['Plants', 'Beginners'],
  },
  {
    title: 'The Language of Flowers: What Each Bloom Means',
    slug: 'language-of-flowers',
    excerpt: 'Roses for love, lilies for sympathy — discover the hidden meanings behind the most popular flowers.',
    content: "## Floriography: The Language of Flowers\n\n### Roses\n- Red: Deep love and passion\n- Pink: Admiration and gratitude\n- White: Purity and innocence\n- Yellow: Friendship and joy\n\n### Lilies\n- White: Sympathy and purity\n- Stargazer: Ambition and prosperity\n\n### Tulips\n- Red: Perfect love\n- Purple: Royalty\n- Yellow: Cheerful thoughts",
    coverImageUrl: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=1200&q=80',
    authorName: 'Love Blooms Team',
    isPublished: true,
    tags: ['Education', 'History'],
  },
]

// ---- Sample coupons ----

const coupons = [
  {
    code: 'WELCOME15',
    description: '15% off your first order',
    discountType: 'percentage',
    discountValue: 15,
    minimumOrder: 30,
    maxUses: 1000,
    timesUsed: 42,
    isActive: true,
  },
  {
    code: 'SPRING10',
    description: '£10 off orders over £60',
    discountType: 'fixed_amount',
    discountValue: 10,
    minimumOrder: 60,
    maxUses: 500,
    timesUsed: 18,
    isActive: true,
  },
  {
    code: 'FREEDEL',
    description: 'Free delivery on any order',
    discountType: 'free_delivery',
    discountValue: 0,
    isActive: true,
    timesUsed: 5,
  },
]

// ---- Delivery zones ----

const deliveryZones = [
  { name: 'Greater London', postcodes: ['E', 'EC', 'N', 'NW', 'SE', 'SW', 'W', 'WC'], sameDayAvailable: true, nextDayAvailable: true, deliveryFee: 5.99, freeDeliveryThreshold: 50, isActive: true },
  { name: 'South East England', postcodes: ['BN', 'CT', 'GU', 'ME', 'OX', 'RG', 'SL', 'TN'], sameDayAvailable: false, nextDayAvailable: true, deliveryFee: 5.99, freeDeliveryThreshold: 50, isActive: true },
  { name: 'Midlands', postcodes: ['B', 'CV', 'DE', 'LE', 'NG', 'NN', 'ST', 'WS', 'WV'], sameDayAvailable: false, nextDayAvailable: true, deliveryFee: 5.99, freeDeliveryThreshold: 50, isActive: true },
  { name: 'North West', postcodes: ['L', 'M', 'WA', 'WN', 'BL', 'OL', 'SK', 'CW'], sameDayAvailable: false, nextDayAvailable: true, deliveryFee: 5.99, freeDeliveryThreshold: 50, isActive: true },
  { name: 'Scotland', postcodes: ['EH', 'G', 'FK', 'KY', 'DD'], sameDayAvailable: false, nextDayAvailable: true, deliveryFee: 7.99, freeDeliveryThreshold: 75, isActive: true },
]

// ---- Subscription plans ----

const subscriptionPlans = [
  { name: 'Weekly Blooms', slug: 'weekly-blooms', description: 'A fresh bouquet every week.', frequency: 'weekly', price: 29.99, imageUrl: '', isActive: true },
  { name: 'Fortnightly Delight', slug: 'fortnightly-delight', description: 'Beautiful blooms every two weeks.', frequency: 'fortnightly', price: 34.99, imageUrl: '', isActive: true },
  { name: 'Monthly Surprise', slug: 'monthly-surprise', description: 'A luxury arrangement every month.', frequency: 'monthly', price: 39.99, imageUrl: '', isActive: true },
]

// ---- Seed function ----

async function seed() {
  console.log('🌸 Starting Firestore seed...\n')

  // Seed products
  console.log(`Seeding ${products.length} products...`)
  for (const product of products) {
    const ref = db.collection('products').doc()
    await ref.set({
      ...product,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }
  console.log('✓ Products seeded\n')

  // Seed blog posts
  console.log(`Seeding ${blogPosts.length} blog posts...`)
  for (const post of blogPosts) {
    const ref = db.collection('blog_posts').doc()
    await ref.set({
      ...post,
      publishedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }
  console.log('✓ Blog posts seeded\n')

  // Seed coupons
  console.log(`Seeding ${coupons.length} coupons...`)
  for (const coupon of coupons) {
    const ref = db.collection('coupons').doc()
    await ref.set({
      ...coupon,
      createdAt: FieldValue.serverTimestamp(),
    })
  }
  console.log('✓ Coupons seeded\n')

  // Seed delivery zones
  console.log(`Seeding ${deliveryZones.length} delivery zones...`)
  for (const zone of deliveryZones) {
    const ref = db.collection('delivery_zones').doc()
    await ref.set(zone)
  }
  console.log('✓ Delivery zones seeded\n')

  // Seed subscription plans
  console.log(`Seeding ${subscriptionPlans.length} subscription plans...`)
  for (const plan of subscriptionPlans) {
    const ref = db.collection('subscription_plans').doc()
    await ref.set(plan)
  }
  console.log('✓ Subscription plans seeded\n')

  console.log('🎉 Seeding complete!')
}

seed().catch(console.error)

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, ImagePlus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label } from '@/components/ui/input'
import { createProduct } from '@/lib/firebase/services/products'
import { generateSlug } from '@/lib/utils'
import { CATEGORIES, OCCASIONS } from '@/lib/constants'
import type { CategorySlug, ProductSize, ProductImage, ProductVariant } from '@/types'

// ============================================
// Constants
// ============================================

const PRODUCT_SIZES: { value: ProductSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'luxury', label: 'Luxury' },
]

// ============================================
// Component
// ============================================

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ---- Basic fields ----
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [price, setPrice] = useState('')
  const [compareAtPrice, setCompareAtPrice] = useState('')
  const [category, setCategory] = useState<CategorySlug>('roses')
  const [size, setSize] = useState<ProductSize>('medium')

  // ---- Availability ----
  const [inStock, setInStock] = useState(true)
  const [stockQuantity, setStockQuantity] = useState('50')
  const [allowsSameDay, setAllowsSameDay] = useState(true)
  const [allowsNextDay, setAllowsNextDay] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isActive, setIsActive] = useState(true)

  // ---- Occasions ----
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([])

  // ---- Tags & flower types ----
  const [flowerTypes, setFlowerTypes] = useState('')
  const [tags, setTags] = useState('')

  // ---- Images ----
  const [images, setImages] = useState<ProductImage[]>([
    { url: '', alt: '', isPrimary: true },
  ])

  // ---- Variants ----
  const [variants, setVariants] = useState<ProductVariant[]>([])

  // ---- SEO ----
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [searchTerms, setSearchTerms] = useState('')

  // ---- Validation errors ----
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ============================================
  // Handlers
  // ============================================

  const handleNameChange = useCallback((value: string) => {
    setName(value)
    setSlug(generateSlug(value))
  }, [])

  const toggleOccasion = useCallback((occasionSlug: string) => {
    setSelectedOccasions((prev) =>
      prev.includes(occasionSlug)
        ? prev.filter((o) => o !== occasionSlug)
        : [...prev, occasionSlug]
    )
  }, [])

  // ---- Image management ----
  const addImage = useCallback(() => {
    setImages((prev) => [...prev, { url: '', alt: '', isPrimary: false }])
  }, [])

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index)
      // Ensure at least one primary if the removed image was primary
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true
      }
      return updated
    })
  }, [])

  const updateImage = useCallback((index: number, field: keyof ProductImage, value: string | boolean) => {
    setImages((prev) =>
      prev.map((img, i) => {
        if (i === index) {
          return { ...img, [field]: value }
        }
        // If setting a new primary, unset others
        if (field === 'isPrimary' && value === true) {
          return { ...img, isPrimary: false }
        }
        return img
      })
    )
  }, [])

  // ---- Variant management ----
  const addVariant = useCallback(() => {
    setVariants((prev) => [
      ...prev,
      {
        id: `variant-${Date.now()}`,
        name: '',
        priceModifier: 0,
        inStock: true,
      },
    ])
  }, [])

  const removeVariant = useCallback((index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateVariant = useCallback((index: number, field: keyof ProductVariant, value: string | number | boolean) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    )
  }, [])

  // ============================================
  // Form validation
  // ============================================

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = 'Product name is required'
    if (!price || parseFloat(price) <= 0) newErrors.price = 'A valid price is required'
    if (!description.trim()) newErrors.description = 'Description is required'

    // Validate images have URLs
    const validImages = images.filter((img) => img.url.trim())
    if (validImages.length === 0) newErrors.images = 'At least one image URL is required'

    // Validate variants have names
    const invalidVariants = variants.some((v) => !v.name.trim())
    if (invalidVariants) newErrors.variants = 'All variants must have a name'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ============================================
  // Submit
  // ============================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Please fix the errors before submitting')
      return
    }

    setIsSubmitting(true)

    try {
      const categoryName = CATEGORIES.find((c) => c.slug === category)?.name || category

      const productData = {
        name: name.trim(),
        slug,
        description: description.trim(),
        longDescription: longDescription.trim(),
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        category,
        categoryName,
        occasions: selectedOccasions,
        flowerTypes: flowerTypes
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        images: images.filter((img) => img.url.trim()),
        variants,
        size,
        inStock,
        stockQuantity: parseInt(stockQuantity) || 0,
        allowsSameDay,
        allowsNextDay,
        isFeatured,
        isActive,
        averageRating: 0,
        reviewCount: 0,
        seoTitle: seoTitle.trim() || undefined,
        seoDescription: seoDescription.trim() || undefined,
        searchTerms: searchTerms.trim(),
      }

      await createProduct(productData as Parameters<typeof createProduct>[0])
      toast.success('Product created successfully!')
      router.push('/admin/products')
    } catch (error) {
      console.error('Failed to create product:', error)
      toast.error('Failed to create product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================
  // Render
  // ============================================

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new product to your catalogue
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ================================================================ */}
        {/* Basic Information */}
        {/* ================================================================ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Velvet Red Romance"
                error={errors.name}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated-from-name"
                className="bg-gray-50"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated from name. Edit manually if needed.
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">
                Short Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief product description shown on product cards"
                rows={3}
                error={errors.description}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Long Description */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="Detailed product description shown on the product detail page"
                rows={5}
              />
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Pricing & Category */}
        {/* ================================================================ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Category</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">
                Price (GBP) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  &pound;
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                  error={errors.price}
                />
              </div>
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price}</p>
              )}
            </div>

            {/* Compare at price */}
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">Compare at Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  &pound;
                </span>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Original price for showing a discount
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategorySlug)}
                className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Size */}
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <select
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value as ProductSize)}
                className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                {PRODUCT_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Images */}
        {/* ================================================================ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Images</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Add image URLs for this product. Mark one as the primary image.
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addImage}>
              <ImagePlus className="h-4 w-4" />
              Add Image
            </Button>
          </div>

          {errors.images && (
            <p className="text-xs text-destructive mb-4">{errors.images}</p>
          )}

          <div className="space-y-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end p-4 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div className="space-y-2">
                  <Label htmlFor={`image-url-${index}`}>Image URL</Label>
                  <Input
                    id={`image-url-${index}`}
                    value={image.url}
                    onChange={(e) => updateImage(index, 'url', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`image-alt-${index}`}>Alt Text</Label>
                  <Input
                    id={`image-alt-${index}`}
                    value={image.alt}
                    onChange={(e) => updateImage(index, 'alt', e.target.value)}
                    placeholder="Descriptive alt text"
                  />
                </div>

                <div className="flex items-center gap-2 h-10">
                  <input
                    type="radio"
                    name="primaryImage"
                    id={`image-primary-${index}`}
                    checked={image.isPrimary}
                    onChange={() => updateImage(index, 'isPrimary', true)}
                    className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <Label htmlFor={`image-primary-${index}`} className="text-xs whitespace-nowrap">
                    Primary
                  </Label>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage(index)}
                  disabled={images.length <= 1}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================================ */}
        {/* Variants */}
        {/* ================================================================ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Add size or style variants with price modifiers
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="h-4 w-4" />
              Add Variant
            </Button>
          </div>

          {errors.variants && (
            <p className="text-xs text-destructive mb-4">{errors.variants}</p>
          )}

          {variants.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-gray-200 rounded-lg">
              No variants added. Click &ldquo;Add Variant&rdquo; to create size or style options.
            </div>
          ) : (
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div
                  key={variant.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="space-y-2">
                    <Label htmlFor={`variant-name-${index}`}>Variant Name</Label>
                    <Input
                      id={`variant-name-${index}`}
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      placeholder="e.g. Deluxe (24 stems)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`variant-price-${index}`}>Price Modifier</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        &pound;
                      </span>
                      <Input
                        id={`variant-price-${index}`}
                        type="number"
                        step="0.01"
                        value={variant.priceModifier}
                        onChange={(e) =>
                          updateVariant(index, 'priceModifier', parseFloat(e.target.value) || 0)
                        }
                        className="pl-7 w-32"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      id={`variant-stock-${index}`}
                      checked={variant.inStock}
                      onChange={(e) => updateVariant(index, 'inStock', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor={`variant-stock-${index}`} className="text-xs whitespace-nowrap">
                      In Stock
                    </Label>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* Occasions */}
        {/* ================================================================ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Occasions</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Select which occasions this product is suitable for
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {OCCASIONS.map((occasion) => (
              <label
                key={occasion.slug}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedOccasions.includes(occasion.slug)
                    ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedOccasions.includes(occasion.slug)}
                  onChange={() => toggleOccasion(occasion.slug)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  {occasion.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ================================================================ */}
        {/* Tags & Flower Types */}
        {/* ================================================================ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Tags & Flower Types</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="flowerTypes">Flower Types</Label>
              <Input
                id="flowerTypes"
                value={flowerTypes}
                onChange={(e) => setFlowerTypes(e.target.value)}
                placeholder="e.g. roses, lilies, peonies"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of flower types
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. romantic, premium, best-seller"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of tags
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Availability & Stock */}
        {/* ================================================================ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Availability & Stock</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stock Quantity */}
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>

            {/* Toggle switches */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">In Stock</span>
                    <p className="text-xs text-muted-foreground">Available for purchase</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={allowsSameDay}
                    onChange={(e) => setAllowsSameDay(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Same Day</span>
                    <p className="text-xs text-muted-foreground">Same-day delivery</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={allowsNextDay}
                    onChange={(e) => setAllowsNextDay(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Next Day</span>
                    <p className="text-xs text-muted-foreground">Next-day delivery</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                    <p className="text-xs text-muted-foreground">Show on homepage</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Active</span>
                    <p className="text-xs text-muted-foreground">Visible in store</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* SEO */}
        {/* ================================================================ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">SEO</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input
                id="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Custom page title for search engines"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="searchTerms">Search Terms</Label>
              <Input
                id="searchTerms"
                value={searchTerms}
                onChange={(e) => setSearchTerms(e.target.value)}
                placeholder="Internal search keywords"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Meta description for search engine results"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Submit */}
        {/* ================================================================ */}
        <div className="flex items-center justify-end gap-4 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </Link>
          <Button type="submit" isLoading={isSubmitting}>
            <Save className="h-4 w-4" />
            Create Product
          </Button>
        </div>
      </form>
    </div>
  )
}

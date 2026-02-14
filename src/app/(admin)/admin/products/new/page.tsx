'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Plus, Trash2, ImagePlus, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label } from '@/components/ui/input'
import ImageUpload from '@/components/ui/image-upload'
import { createProduct } from '@/lib/firebase/services/products'
import { productSchema, type ProductFormData } from '@/lib/validations/admin'
import { generateSlug } from '@/lib/utils'
import { CATEGORIES, OCCASIONS } from '@/lib/constants'
import type { CategorySlug, ProductSize } from '@/types'

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

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      longDescription: '',
      price: undefined as unknown as number,
      compareAtPrice: undefined,
      category: 'roses',
      categoryName: 'Roses',
      size: 'medium',
      inStock: true,
      stockQuantity: 0,
      allowsSameDay: true,
      allowsNextDay: true,
      isFeatured: false,
      isActive: true,
      occasions: [],
      flowerTypes: '',
      tags: '',
      images: [{ url: '', alt: '', isPrimary: true }],
      variants: [],
      seoTitle: '',
      seoDescription: '',
      searchTerms: '',
    },
  })

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({ control, name: 'images' })

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: 'variants' })

  // ============================================
  // Auto-generate slug from name
  // ============================================

  const watchedName = watch('name')
  const watchedCategory = watch('category')
  const watchedOccasions = watch('occasions')

  useEffect(() => {
    if (watchedName) {
      setValue('slug', generateSlug(watchedName))
    }
  }, [watchedName, setValue])

  useEffect(() => {
    const cat = CATEGORIES.find((c) => c.slug === watchedCategory)
    if (cat) {
      setValue('categoryName', cat.name)
    }
  }, [watchedCategory, setValue])

  // ============================================
  // Occasion toggle
  // ============================================

  const toggleOccasion = (slug: string) => {
    const current = watchedOccasions || []
    if (current.includes(slug)) {
      setValue(
        'occasions',
        current.filter((o) => o !== slug)
      )
    } else {
      setValue('occasions', [...current, slug])
    }
  }

  // ============================================
  // Primary image toggle
  // ============================================

  const setPrimaryImage = (index: number) => {
    imageFields.forEach((_, i) => {
      setValue(`images.${i}.isPrimary`, i === index)
    })
  }

  // ============================================
  // Submit
  // ============================================

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)

    try {
      const productData = {
        name: data.name.trim(),
        slug: data.slug,
        description: data.description.trim(),
        longDescription: data.longDescription || '',
        price: data.price,
        compareAtPrice: data.compareAtPrice || undefined,
        category: data.category,
        categoryName: data.categoryName,
        occasions: data.occasions,
        flowerTypes: data.flowerTypes
          ? data.flowerTypes
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        tags: data.tags
          ? data.tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
        images: data.images.filter((img) => img.url.trim()),
        variants: data.variants,
        size: data.size,
        inStock: data.inStock,
        stockQuantity: data.stockQuantity,
        allowsSameDay: data.allowsSameDay,
        allowsNextDay: data.allowsNextDay,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        averageRating: 0,
        reviewCount: 0,
        seoTitle: data.seoTitle || undefined,
        seoDescription: data.seoDescription || undefined,
        searchTerms: data.searchTerms || '',
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                {...register('name')}
                placeholder="e.g. Velvet Red Romance"
                error={errors.name?.message}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="auto-generated-from-name"
                className="bg-gray-50"
              />
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
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
                {...register('description')}
                placeholder="Brief product description shown on product cards"
                rows={3}
                error={errors.description?.message}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Long Description */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                {...register('longDescription')}
                placeholder="Detailed product description shown on the product detail page"
                rows={5}
              />
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Pricing */}
        {/* ================================================================ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing</h2>

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
                  {...register('price')}
                  placeholder="0.00"
                  className="pl-7"
                  error={errors.price?.message}
                />
              </div>
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
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
                  {...register('compareAtPrice')}
                  placeholder="0.00"
                  className="pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Original price for showing a discount
              </p>
            </div>

            {/* Size */}
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <select
                id="size"
                {...register('size')}
                className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                {PRODUCT_SIZES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Quantity */}
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                {...register('stockQuantity')}
              />
              {errors.stockQuantity && (
                <p className="text-xs text-destructive">{errors.stockQuantity.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* Category & Tags */}
        {/* ================================================================ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Category & Tags</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                {...register('category')}
                className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category.message}</p>
              )}
            </div>

            {/* Category Name (hidden, auto-set) */}
            <input type="hidden" {...register('categoryName')} />

            {/* Flower Types */}
            <div className="space-y-2">
              <Label htmlFor="flowerTypes">Flower Types</Label>
              <Input
                id="flowerTypes"
                {...register('flowerTypes')}
                placeholder="e.g. roses, lilies, peonies"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of flower types
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="e.g. romantic, premium, best-seller"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of tags
              </p>
            </div>
          </div>

          {/* Occasions */}
          <div className="mt-6">
            <Label className="mb-3 block">Occasions</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Select which occasions this product is suitable for
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {OCCASIONS.map((occasion) => (
                <label
                  key={occasion.slug}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    (watchedOccasions || []).includes(occasion.slug)
                      ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(watchedOccasions || []).includes(occasion.slug)}
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendImage({ url: '', alt: '', isPrimary: false })}
            >
              <ImagePlus className="h-4 w-4" />
              Add Image
            </Button>
          </div>

          {errors.images?.message && (
            <p className="text-xs text-destructive mb-4">{errors.images.message}</p>
          )}
          {errors.images?.root?.message && (
            <p className="text-xs text-destructive mb-4">{errors.images.root.message}</p>
          )}

          <div className="space-y-4">
            {imageFields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Controller
                      control={control}
                      name={`images.${index}.isPrimary`}
                      render={({ field: radioField }) => (
                        <input
                          type="radio"
                          name="primaryImage"
                          id={`image-primary-${index}`}
                          checked={radioField.value}
                          onChange={() => setPrimaryImage(index)}
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                        />
                      )}
                    />
                    <Label htmlFor={`image-primary-${index}`} className="text-sm">
                      {watch(`images.${index}.isPrimary`) ? 'Primary Image' : 'Image'}
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeImage(index)}
                    disabled={imageFields.length <= 1}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <Controller
                  control={control}
                  name={`images.${index}.url`}
                  render={({ field: urlField }) => (
                    <ImageUpload
                      value={urlField.value}
                      onChange={urlField.onChange}
                      folder="products"
                    />
                  )}
                />
                {errors.images?.[index]?.url && (
                  <p className="text-xs text-destructive">
                    {errors.images[index].url.message}
                  </p>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor={`images.${index}.alt`}>Alt Text</Label>
                  <Input
                    id={`images.${index}.alt`}
                    {...register(`images.${index}.alt`)}
                    placeholder="Descriptive alt text"
                  />
                </div>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendVariant({
                  id: `variant-${Date.now()}`,
                  name: '',
                  priceModifier: 0,
                  inStock: true,
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add Variant
            </Button>
          </div>

          {variantFields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-gray-200 rounded-lg">
              No variants added. Click &ldquo;Add Variant&rdquo; to create size or style options.
            </div>
          ) : (
            <div className="space-y-4">
              {variantFields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 items-end p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="space-y-2">
                    <Label htmlFor={`variants.${index}.name`}>Variant Name</Label>
                    <Input
                      id={`variants.${index}.name`}
                      {...register(`variants.${index}.name`)}
                      placeholder="e.g. Deluxe (24 stems)"
                      error={errors.variants?.[index]?.name?.message}
                    />
                    {errors.variants?.[index]?.name && (
                      <p className="text-xs text-destructive">
                        {errors.variants[index].name.message}
                      </p>
                    )}
                  </div>

                  <input type="hidden" {...register(`variants.${index}.id`)} />

                  <div className="space-y-2">
                    <Label htmlFor={`variants.${index}.priceModifier`}>Price Modifier</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        &pound;
                      </span>
                      <Input
                        id={`variants.${index}.priceModifier`}
                        type="number"
                        step="0.01"
                        {...register(`variants.${index}.priceModifier`)}
                        className="pl-7 w-32"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 h-10">
                    <Controller
                      control={control}
                      name={`variants.${index}.inStock`}
                      render={({ field: checkField }) => (
                        <input
                          type="checkbox"
                          id={`variant-stock-${index}`}
                          checked={checkField.value}
                          onChange={(e) => checkField.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      )}
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
        {/* Delivery Options */}
        {/* ================================================================ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Delivery Options</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Controller
              control={control}
              name="inStock"
              render={({ field }) => (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">In Stock</span>
                    <p className="text-xs text-muted-foreground">Available for purchase</p>
                  </div>
                </label>
              )}
            />

            <Controller
              control={control}
              name="allowsSameDay"
              render={({ field }) => (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Same Day</span>
                    <p className="text-xs text-muted-foreground">Same-day delivery</p>
                  </div>
                </label>
              )}
            />

            <Controller
              control={control}
              name="allowsNextDay"
              render={({ field }) => (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Next Day</span>
                    <p className="text-xs text-muted-foreground">Next-day delivery</p>
                  </div>
                </label>
              )}
            />

            <Controller
              control={control}
              name="isFeatured"
              render={({ field }) => (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                    <p className="text-xs text-muted-foreground">Show on homepage</p>
                  </div>
                </label>
              )}
            />

            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Active</span>
                    <p className="text-xs text-muted-foreground">Visible in store</p>
                  </div>
                </label>
              )}
            />
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
                {...register('seoTitle')}
                placeholder="Custom page title for search engines"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="searchTerms">Search Terms</Label>
              <Input
                id="searchTerms"
                {...register('searchTerms')}
                placeholder="Internal search keywords"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="seoDescription">SEO Description</Label>
              <Textarea
                id="seoDescription"
                {...register('seoDescription')}
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

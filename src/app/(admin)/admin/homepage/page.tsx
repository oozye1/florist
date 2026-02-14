'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Image as ImageIcon, Award, Calendar, MessageSquareQuote, Mail, Plus, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label } from '@/components/ui/input'
import ImageUpload from '@/components/ui/image-upload'
import { getHomepageContent, updateHomepageContent } from '@/lib/firebase/services/homepage'
import { OCCASIONS } from '@/lib/constants'
import type { HeroContent, USPItem, OccasionItem, TestimonialItem, NewsletterContent } from '@/types'

const ICON_OPTIONS = [
  'Truck', 'Clock', 'ShieldCheck', 'Heart', 'Gift', 'Star', 'Zap', 'Shield', 'MapPin', 'CreditCard', 'Package', 'Flower2',
]

const DEFAULT_HERO: HeroContent = {
  imageUrl: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=1920&q=80',
  imageAlt: 'Beautiful floral arrangement',
  heading: 'Where Every Petal Tells a Story',
  subheading: 'Hand-crafted luxury floral arrangements, delivered with love across the UK',
  primaryButton: { text: 'Shop Collection', href: '/products' },
  secondaryButton: { text: 'Send Flowers Today', href: '/products?delivery=same_day' },
}

const DEFAULT_USPS: USPItem[] = [
  { icon: 'Truck', text: 'Free UK Delivery Over £50' },
  { icon: 'Clock', text: 'Same Day Delivery' },
  { icon: 'ShieldCheck', text: '7-Day Freshness Guarantee' },
  { icon: 'Heart', text: 'Handcrafted With Love' },
]

const DEFAULT_OCCASIONS: OccasionItem[] = OCCASIONS.map((o) => ({
  name: o.name,
  slug: o.slug,
  image: o.image,
  description: o.description,
}))

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  { quote: 'The roses were absolutely stunning. My wife was over the moon!', name: 'James T.', location: 'London', rating: 5 },
  { quote: 'Beautiful sympathy arrangement. Delivered on time with such care.', name: 'Sarah M.', location: 'Manchester', rating: 5 },
  { quote: 'I use Love Blooms for every occasion. Never disappointed!', name: 'Emily R.', location: 'Bristol', rating: 5 },
  { quote: 'The subscription service is brilliant. Fresh flowers every month!', name: 'Charlotte W.', location: 'Edinburgh', rating: 5 },
  { quote: 'Wedding flowers were beyond our dreams. Thank you!', name: 'David & Anna K.', location: 'Leeds', rating: 5 },
]

const DEFAULT_NEWSLETTER: NewsletterContent = {
  heading: 'Stay in Bloom',
  description: 'Join our mailing list for exclusive offers, seasonal inspiration, and 15% off your first order.',
}

export default function AdminHomepagePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hero, setHero] = useState<HeroContent>(DEFAULT_HERO)
  const [uspItems, setUspItems] = useState<USPItem[]>(DEFAULT_USPS)
  const [occasions, setOccasions] = useState<OccasionItem[]>(DEFAULT_OCCASIONS)
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS)
  const [newsletter, setNewsletter] = useState<NewsletterContent>(DEFAULT_NEWSLETTER)

  useEffect(() => {
    async function load() {
      try {
        const data = await getHomepageContent()
        if (data) {
          if (data.hero) setHero(data.hero)
          if (data.uspItems?.length) setUspItems(data.uspItems)
          if (data.occasions?.length) setOccasions(data.occasions)
          if (data.testimonials?.length) setTestimonials(data.testimonials)
          if (data.newsletter) setNewsletter(data.newsletter)
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await updateHomepageContent({ hero, uspItems, occasions, testimonials, newsletter })
      toast.success('Homepage content saved')
    } catch {
      toast.error('Failed to save homepage content')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage</h1>
          <p className="text-sm text-muted-foreground mt-1">Loading...</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 shadow-sm animate-pulse">
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage</h1>
          <p className="text-sm text-muted-foreground mt-1">Edit the content displayed on your homepage</p>
        </div>
        <Button onClick={handleSave} isLoading={saving}>
          <Save className="h-4 w-4" />
          Save All Changes
        </Button>
      </div>

      {/* Hero Section */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-gray-500" />
          Hero Section
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Background Image</Label>
              <ImageUpload
                value={hero.imageUrl}
                onChange={(url) => setHero((h) => ({ ...h, imageUrl: url }))}
                folder="homepage"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Image Alt Text</Label>
              <Input value={hero.imageAlt} onChange={(e) => setHero((h) => ({ ...h, imageAlt: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input value={hero.heading} onChange={(e) => setHero((h) => ({ ...h, heading: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Subheading</Label>
            <Textarea value={hero.subheading} onChange={(e) => setHero((h) => ({ ...h, subheading: e.target.value }))} rows={2} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Primary Button</p>
              <div className="space-y-1.5">
                <Label>Text</Label>
                <Input value={hero.primaryButton.text} onChange={(e) => setHero((h) => ({ ...h, primaryButton: { ...h.primaryButton, text: e.target.value } }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Link</Label>
                <Input value={hero.primaryButton.href} onChange={(e) => setHero((h) => ({ ...h, primaryButton: { ...h.primaryButton, href: e.target.value } }))} />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Secondary Button</p>
              <div className="space-y-1.5">
                <Label>Text</Label>
                <Input value={hero.secondaryButton.text} onChange={(e) => setHero((h) => ({ ...h, secondaryButton: { ...h.secondaryButton, text: e.target.value } }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Link</Label>
                <Input value={hero.secondaryButton.href} onChange={(e) => setHero((h) => ({ ...h, secondaryButton: { ...h.secondaryButton, href: e.target.value } }))} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USP Strip */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-gray-500" />
            USP Strip
          </h2>
          {uspItems.length < 6 && (
            <Button variant="outline" size="sm" onClick={() => setUspItems((u) => [...u, { icon: 'Heart', text: '' }])}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          )}
        </div>
        <div className="space-y-3">
          {uspItems.map((usp, i) => (
            <div key={i} className="flex items-center gap-3">
              <select
                value={usp.icon}
                onChange={(e) => setUspItems((items) => items.map((item, idx) => idx === i ? { ...item, icon: e.target.value } : item))}
                className="h-10 rounded-lg border border-input bg-white px-3 py-2 text-sm"
              >
                {ICON_OPTIONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <Input
                className="flex-1"
                value={usp.text}
                onChange={(e) => setUspItems((items) => items.map((item, idx) => idx === i ? { ...item, text: e.target.value } : item))}
                placeholder="USP text"
              />
              {uspItems.length > 1 && (
                <button onClick={() => setUspItems((items) => items.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Occasions */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            Occasions
          </h2>
          <Button variant="outline" size="sm" onClick={() => setOccasions((o) => [...o, { name: '', slug: '', image: '', description: '' }])}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="space-y-4">
          {occasions.map((occ, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Occasion {i + 1}</span>
                {occasions.length > 1 && (
                  <button onClick={() => setOccasions((items) => items.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={occ.name}
                    onChange={(e) => {
                      const name = e.target.value
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      setOccasions((items) => items.map((item, idx) => idx === i ? { ...item, name, slug } : item))
                    }}
                    placeholder="e.g. Birthday"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input
                    value={occ.slug}
                    onChange={(e) => setOccasions((items) => items.map((item, idx) => idx === i ? { ...item, slug: e.target.value } : item))}
                    placeholder="e.g. birthday"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Image</Label>
                <ImageUpload
                  value={occ.image}
                  onChange={(url) => setOccasions((items) => items.map((item, idx) => idx === i ? { ...item, image: url } : item))}
                  folder="occasions"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input
                  value={occ.description}
                  onChange={(e) => setOccasions((items) => items.map((item, idx) => idx === i ? { ...item, description: e.target.value } : item))}
                  placeholder="Short description"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-gray-500" />
            Testimonials
          </h2>
          <Button variant="outline" size="sm" onClick={() => setTestimonials((t) => [...t, { quote: '', name: '', location: '', rating: 5 }])}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="space-y-4">
          {testimonials.map((t, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Testimonial {i + 1}</span>
                {testimonials.length > 1 && (
                  <button onClick={() => setTestimonials((items) => items.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Quote</Label>
                <Textarea
                  value={t.quote}
                  onChange={(e) => setTestimonials((items) => items.map((item, idx) => idx === i ? { ...item, quote: e.target.value } : item))}
                  rows={2}
                  placeholder="Customer quote"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input
                    value={t.name}
                    onChange={(e) => setTestimonials((items) => items.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item))}
                    placeholder="James T."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input
                    value={t.location}
                    onChange={(e) => setTestimonials((items) => items.map((item, idx) => idx === i ? { ...item, location: e.target.value } : item))}
                    placeholder="London"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Rating (1-5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={t.rating}
                    onChange={(e) => setTestimonials((items) => items.map((item, idx) => idx === i ? { ...item, rating: parseInt(e.target.value) || 5 } : item))}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="h-5 w-5 text-gray-500" />
          Newsletter Section
        </h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Heading</Label>
            <Input value={newsletter.heading} onChange={(e) => setNewsletter((n) => ({ ...n, heading: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={newsletter.description} onChange={(e) => setNewsletter((n) => ({ ...n, description: e.target.value }))} rows={2} />
          </div>
        </div>
      </section>

      {/* Bottom Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={saving}>
          <Save className="h-4 w-4" />
          Save All Changes
        </Button>
      </div>
    </div>
  )
}

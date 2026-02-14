'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Flower,
  ShoppingBag,
  Menu,
  X,
  Search,
  User,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/hooks/use-auth'
import SearchDialog from './SearchDialog'

const occasions = [
  { name: 'Birthday', href: '/occasions/birthday' },
  { name: 'Anniversary', href: '/occasions/anniversary' },
  { name: 'Sympathy', href: '/occasions/sympathy' },
  { name: 'Get Well', href: '/occasions/get-well' },
  { name: 'New Baby', href: '/occasions/new-baby' },
  { name: 'Thank You', href: '/occasions/thank-you' },
  { name: 'Romance', href: '/occasions/romance' },
  { name: 'Congratulations', href: '/occasions/congratulations' },
]

const navLinks = [
  { name: 'Shop All', href: '/shop' },
  { name: 'Subscriptions', href: '/subscriptions' },
  { name: 'Gift Cards', href: '/gift-cards' },
  { name: 'Blog', href: '/blog' },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [occasionsOpen, setOccasionsOpen] = useState(false)
  const [mobileOccasionsOpen, setMobileOccasionsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const itemCount = useCart((state) => state.getItemCount())
  const { user, isAdmin } = useAuth()

  // Track scroll for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  return (
    <>
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        'bg-white/95 backdrop-blur-md',
        scrolled
          ? 'shadow-md border-b border-[#d4a373]/20'
          : 'border-b border-transparent'
      )}
    >
      {/* Promotional banner */}
      <div className="bg-[#1a472a] text-white text-center text-xs sm:text-sm py-2 px-4 font-sans tracking-wide">
        Free delivery on orders over &pound;50 &mdash;{' '}
        <Link href="/shop" className="underline underline-offset-2 hover:text-[#d4a373] transition-colors">
          Shop Now
        </Link>
      </div>

      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-[#1a472a] hover:bg-[#1a472a]/5 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" strokeWidth={1.5} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            )}
          </button>

          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <Flower
              className="h-7 w-7 sm:h-8 sm:w-8 text-[#d4a373] transition-transform duration-300 group-hover:rotate-12"
              strokeWidth={1.5}
            />
            <div className="flex flex-col leading-none">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1a472a]">
                Love Blooms
              </span>
              <span className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#1a472a]/60">
                Florist
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Shop All */}
            <Link
              href="/shop"
              className="px-4 py-2 text-sm font-sans font-medium text-[#1a472a] hover:text-[#d4a373] transition-colors relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-0 after:bg-[#d4a373] after:transition-all hover:after:w-3/4"
            >
              Shop All
            </Link>

            {/* Occasions dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setOccasionsOpen(true)}
              onMouseLeave={() => setOccasionsOpen(false)}
            >
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1 px-4 py-2 text-sm font-sans font-medium transition-colors relative',
                  'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-0 after:bg-[#d4a373] after:transition-all',
                  occasionsOpen
                    ? 'text-[#d4a373] after:w-3/4'
                    : 'text-[#1a472a] hover:text-[#d4a373] hover:after:w-3/4'
                )}
                onClick={() => setOccasionsOpen(!occasionsOpen)}
                aria-expanded={occasionsOpen}
              >
                Occasions
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    occasionsOpen && 'rotate-180'
                  )}
                  strokeWidth={1.5}
                />
              </button>

              {/* Dropdown menu */}
              <div
                className={cn(
                  'absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200',
                  occasionsOpen
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-2'
                )}
              >
                <div className="w-56 rounded-lg bg-white shadow-xl ring-1 ring-[#1a472a]/5 py-2 border border-[#d4a373]/10">
                  {occasions.map((occasion) => (
                    <Link
                      key={occasion.href}
                      href={occasion.href}
                      className="block px-5 py-2.5 text-sm font-sans text-[#1a472a] hover:bg-[#1a472a]/5 hover:text-[#d4a373] transition-colors"
                      onClick={() => setOccasionsOpen(false)}
                    >
                      {occasion.name}
                    </Link>
                  ))}
                  <div className="border-t border-[#d4a373]/10 mt-2 pt-2">
                    <Link
                      href="/occasions"
                      className="block px-5 py-2.5 text-sm font-sans font-medium text-[#d4a373] hover:bg-[#1a472a]/5 transition-colors"
                      onClick={() => setOccasionsOpen(false)}
                    >
                      View All Occasions
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscriptions */}
            <Link
              href="/subscriptions"
              className="px-4 py-2 text-sm font-sans font-medium text-[#1a472a] hover:text-[#d4a373] transition-colors relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-0 after:bg-[#d4a373] after:transition-all hover:after:w-3/4"
            >
              Subscriptions
            </Link>

            {/* Gift Cards */}
            <Link
              href="/gift-cards"
              className="px-4 py-2 text-sm font-sans font-medium text-[#1a472a] hover:text-[#d4a373] transition-colors relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-0 after:bg-[#d4a373] after:transition-all hover:after:w-3/4"
            >
              Gift Cards
            </Link>

            {/* Blog */}
            <Link
              href="/blog"
              className="px-4 py-2 text-sm font-sans font-medium text-[#1a472a] hover:text-[#d4a373] transition-colors relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-0 after:bg-[#d4a373] after:transition-all hover:after:w-3/4"
            >
              Blog
            </Link>
          </div>

          {/* Right actions: Search, Account, Cart */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full p-2 text-[#1a472a] hover:bg-[#1a472a]/5 hover:text-[#d4a373] transition-colors"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {/* Admin Dashboard link */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#1a472a] px-3.5 py-1.5 text-xs font-sans font-medium text-white hover:bg-[#1a472a]/90 transition-colors"
              >
                Admin
              </Link>
            )}

            {/* Account */}
            <Link
              href={user ? '/account' : '/login'}
              className="hidden sm:inline-flex items-center justify-center rounded-full p-2 text-[#1a472a] hover:bg-[#1a472a]/5 hover:text-[#d4a373] transition-colors"
              aria-label={user ? 'My Account' : 'Sign in'}
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative inline-flex items-center justify-center rounded-full p-2 text-[#1a472a] hover:bg-[#1a472a]/5 hover:text-[#d4a373] transition-colors"
              aria-label={`Shopping bag with ${itemCount} items`}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4a373] text-[10px] font-sans font-bold text-white shadow-sm animate-in zoom-in duration-200">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          mobileMenuOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none'
        )}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile slide-out menu */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile menu header */}
        <div className="flex items-center justify-between border-b border-[#d4a373]/20 px-6 py-5">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Flower className="h-7 w-7 text-[#d4a373]" strokeWidth={1.5} />
            <span className="font-serif text-lg font-bold text-[#1a472a]">
              Love Blooms
            </span>
          </Link>
          <button
            type="button"
            className="rounded-full p-2 text-[#1a472a] hover:bg-[#1a472a]/5 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Mobile menu body */}
        <div className="flex flex-col overflow-y-auto h-[calc(100%-80px)]">
          <div className="flex flex-col py-4">
            {/* Shop All */}
            <Link
              href="/shop"
              className="px-6 py-3.5 text-base font-sans font-medium text-[#1a472a] hover:bg-[#1a472a]/5 hover:text-[#d4a373] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop All
            </Link>

            {/* Occasions - expandable */}
            <div>
              <button
                type="button"
                className="flex w-full items-center justify-between px-6 py-3.5 text-base font-sans font-medium text-[#1a472a] hover:bg-[#1a472a]/5 hover:text-[#d4a373] transition-colors"
                onClick={() => setMobileOccasionsOpen(!mobileOccasionsOpen)}
                aria-expanded={mobileOccasionsOpen}
              >
                Occasions
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    mobileOccasionsOpen && 'rotate-180'
                  )}
                  strokeWidth={1.5}
                />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  mobileOccasionsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <div className="bg-[#1a472a]/[0.02] py-1">
                  {occasions.map((occasion) => (
                    <Link
                      key={occasion.href}
                      href={occasion.href}
                      className="block px-10 py-2.5 text-sm font-sans text-[#1a472a]/80 hover:text-[#d4a373] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {occasion.name}
                    </Link>
                  ))}
                  <Link
                    href="/occasions"
                    className="block px-10 py-2.5 text-sm font-sans font-medium text-[#d4a373] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    View All Occasions
                  </Link>
                </div>
              </div>
            </div>

            {/* Subscriptions */}
            <Link
              href="/subscriptions"
              className="px-6 py-3.5 text-base font-sans font-medium text-[#1a472a] hover:bg-[#1a472a]/5 hover:text-[#d4a373] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Subscriptions
            </Link>

            {/* Gift Cards */}
            <Link
              href="/gift-cards"
              className="px-6 py-3.5 text-base font-sans font-medium text-[#1a472a] hover:bg-[#1a472a]/5 hover:text-[#d4a373] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gift Cards
            </Link>

            {/* Blog */}
            <Link
              href="/blog"
              className="px-6 py-3.5 text-base font-sans font-medium text-[#1a472a] hover:bg-[#1a472a]/5 hover:text-[#d4a373] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-[#d4a373]/20 mx-6" />

          {/* Secondary links */}
          <div className="flex flex-col py-4">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-6 py-3.5 text-base font-sans font-medium text-[#1a472a] hover:text-[#d4a373] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                Admin Dashboard
              </Link>
            )}
            <Link
              href={user ? '/account' : '/login'}
              className="flex items-center gap-3 px-6 py-3.5 text-base font-sans text-[#1a472a]/70 hover:text-[#d4a373] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
              {user ? 'My Account' : 'Sign In'}
            </Link>
          </div>

          {/* Mobile CTA */}
          <div className="mt-auto border-t border-[#d4a373]/20 p-6">
            <Link
              href="/shop"
              className="flex items-center justify-center gap-2 w-full rounded-full bg-[#1a472a] px-6 py-3 text-sm font-sans font-medium text-white hover:bg-[#1a472a]/90 transition-colors shadow-lg shadow-[#1a472a]/20"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Flower className="h-4 w-4" strokeWidth={1.5} />
              Browse Our Collection
            </Link>
          </div>
        </div>
      </div>
    </header>

    <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

'use client'

interface SortSelectProps {
  defaultValue: string
}

export default function SortSelect({ defaultValue }: SortSelectProps) {
  return (
    <select
      defaultValue={defaultValue}
      className="border border-input rounded-lg px-4 py-2 text-sm bg-white"
      onChange={(e) => {
        const url = new URL(window.location.href)
        if (e.target.value) {
          url.searchParams.set('sort', e.target.value)
        } else {
          url.searchParams.delete('sort')
        }
        window.location.href = url.toString()
      }}
    >
      <option value="">Featured</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
      <option value="rating">Highest Rated</option>
      <option value="newest">Newest</option>
    </select>
  )
}

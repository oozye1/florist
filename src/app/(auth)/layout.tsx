import Link from 'next/link'
import { Flower } from 'lucide-react'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-12">
      <Link href="/" className="mb-10 flex items-center gap-2">
        <Flower className="h-8 w-8 text-primary" />
        <span className="font-serif text-2xl font-bold text-primary">
          Love Blooms Florist
        </span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}

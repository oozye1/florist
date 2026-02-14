import Link from 'next/link'
import { Flower, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <Flower className="w-16 h-16 text-secondary mx-auto mb-6" />
        <h1 className="font-serif text-6xl text-primary mb-4">404</h1>
        <h2 className="font-serif text-2xl mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. Perhaps
          you&apos;d like to browse our beautiful collection instead?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Shop Our Collection</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

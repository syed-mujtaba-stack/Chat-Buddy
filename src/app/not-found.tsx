
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Frown } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <Frown className="w-24 h-24 text-primary mb-4" />
      <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-6">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link href="/" passHref>
        <Button>Go back to Home</Button>
      </Link>
    </div>
  )
}

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <h1 className="font-headline text-8xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold tracking-tight">
          Page Not Found
        </h2>
        <p className="max-w-md text-muted-foreground">
          Oops! The page you are looking for does not exist. It might have been
          moved or deleted.
        </p>
      </div>
      <Button asChild>
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Go to Dashboard
        </Link>
      </Button>
    </div>
  );
}

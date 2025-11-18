import Link from "next/link";

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
    <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M17.5 14.5L12 17L6.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22V17" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7.5 8.5C7.5 8.5 9.5 10 12 10C14.5 10 16.5 8.5 16.5 8.5" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);


export function Header() {
  return (
    <header className="py-4 px-6 bg-card/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Logo />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold font-headline text-primary group-hover:text-primary/80 transition-colors">
              TraceIt
            </h1>
            <p className="text-xs text-muted-foreground -mt-1">a subset of Talkeasy</p>
          </div>
        </Link>
      </div>
    </header>
  );
}

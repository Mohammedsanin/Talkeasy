import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export default function PageHeader({
  title,
  description,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="text-lg text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

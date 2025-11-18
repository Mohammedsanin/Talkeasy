import Link from 'next/link';
import Image from 'next/image';
import { ALPHABET_DATA } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export function LanguageSelector() {
  const languages = Object.keys(ALPHABET_DATA);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {languages.map((langKey) => {
        const langData = ALPHABET_DATA[langKey];
        const placeholder = PlaceHolderImages.find(p => p.id === langData.iconId);
        
        return (
          <Link href={`/learn/${langKey}`} key={langKey} className="group">
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-accent hover:-translate-y-1">
              <div className="relative h-40 w-full">
                {placeholder && (
                  <Image
                    src={placeholder.imageUrl}
                    alt={langData.name}
                    fill
                    sizes="50vw"
                    className="object-cover"
                    data-ai-hint={placeholder.imageHint}
                  />
                )}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <CardContent className="p-4 bg-card">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold font-headline text-foreground">{langData.name}</h3>
                    <ArrowRight className="h-5 w-5 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                 </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

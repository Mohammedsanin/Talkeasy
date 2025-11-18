import { notFound } from "next/navigation";
import Link from "next/link";
import { ALPHABET_DATA } from "@/lib/data";
import { Header } from "@/components/Header";
import { AlphabetGrid } from "@/components/AlphabetGrid";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type LanguagePageProps = {
  params: {
    lang: string;
  };
};

export function generateStaticParams() {
  return Object.keys(ALPHABET_DATA).map((lang) => ({
    lang,
  }));
}

export default function LanguagePage({ params }: LanguagePageProps) {
  const { lang } = params;
  const langData = ALPHABET_DATA[lang];

  if (!langData) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button asChild variant="ghost">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Languages
            </Link>
          </Button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">
            {langData.name} Alphabet
          </h1>
          <p className="text-lg text-foreground/80">
            Click on a character to start tracing.
          </p>
        </div>

        <AlphabetGrid lang={lang} />
      </main>
    </div>
  );
}

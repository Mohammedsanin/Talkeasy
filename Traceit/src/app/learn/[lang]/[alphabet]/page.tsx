import { notFound } from "next/navigation";
import Link from "next/link";
import { ALPHABET_DATA } from "@/lib/data";
import { Header } from "@/components/Header";
import { TracingCanvas } from "@/components/TracingCanvas";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type TracingPageProps = {
  params: {
    lang: string;
    alphabet: string;
  };
};

export function generateStaticParams() {
    const params: { lang: string; alphabet: string }[] = [];
    for (const lang in ALPHABET_DATA) {
        for (const alphabet of ALPHABET_DATA[lang].alphabets) {
            params.push({ lang, alphabet: alphabet.char });
        }
    }
    return params;
}


export default function TracingPage({ params }: TracingPageProps) {
  const { lang, alphabet: alphabetChar } = params;
  
  // URL encoding can affect special characters
  const decodedAlphabetChar = decodeURIComponent(alphabetChar);

  const langData = ALPHABET_DATA[lang];
  const alphabetData = langData?.alphabets.find((a) => a.char === decodedAlphabetChar);

  if (!langData || !alphabetData) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
         <div className="mb-4">
          <Button asChild variant="ghost">
            <Link href={`/learn/${lang}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {langData.name} Alphabet
            </Link>
          </Button>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center">
            <TracingCanvas lang={lang} alphabet={alphabetData} />
        </div>
      </main>
    </div>
  );
}

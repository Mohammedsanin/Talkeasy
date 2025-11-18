import { Header } from "@/components/Header";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SuggestedLanguages } from "@/components/SuggestedLanguages";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">
            Welcome to TraceIt!
          </h1>
          <p className="text-lg md:text-xl text-foreground/80">
            A subset of Talkeasy, your fun-filled journey to mastering new alphabets begins here.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="h-full shadow-lg border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="font-headline text-2xl text-primary">Choose a Language to Start</CardTitle>
                <CardDescription>Select a language and start tracing the alphabets.</CardDescription>
              </CardHeader>
              <CardContent>
                <LanguageSelector />
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
             <SuggestedLanguages />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-muted-foreground text-sm">
        <p>Made with ❤️ for the love of languages.</p>
      </footer>
    </div>
  );
}

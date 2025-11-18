'use client';
import { useState, useEffect, useRef } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Map as MapIcon, Mic, Loader2, Bot, ArrowRight, BookOpen, MessageSquare, GraduationCap, Building2, MoveRight } from 'lucide-react';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateLocationLessonAction, getPronunciationFeedbackAction } from '../actions';
import type { LocationLessonOutput } from '@/ai/flows/location-lesson-flow';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const placesOfInterest = [
  // Karnataka (Kannada)
  { name: 'KR Market, Bengaluru', position: { lat: 12.9657, lng: 77.5794 }, language: 'Kannada', langCode: 'kn-IN' },
  { name: 'Mysore Palace, Mysuru', position: { lat: 12.3051, lng: 76.6552 }, language: 'Kannada', langCode: 'kn-IN' },
  
  // Maharashtra (Marathi)
  { name: 'Gateway of India, Mumbai', position: { lat: 18.9220, lng: 72.8347 }, language: 'Marathi', langCode: 'mr-IN' },
  { name: 'Shaniwar Wada, Pune', position: { lat: 18.5196, lng: 73.8554 }, language: 'Marathi', langCode: 'mr-IN' },

  // West Bengal (Bengali)
  { name: 'Howrah Bridge, Kolkata', position: { lat: 22.5852, lng: 88.3639 }, language: 'Bengali', langCode: 'bn-IN' },
  { name: 'Victoria Memorial, Kolkata', position: { lat: 22.5448, lng: 88.3426 }, language: 'Bengali', langCode: 'bn-IN' },
  
  // Delhi (Hindi)
  { name: 'India Gate, New Delhi', position: { lat: 28.6129, lng: 77.2295 }, language: 'Hindi', langCode: 'hi-IN' },
  { name: 'Chandni Chowk, New Delhi', position: { lat: 28.6562, lng: 77.2307 }, language: 'Hindi', langCode: 'hi-IN' },

  // Tamil Nadu (Tamil)
  { name: 'Marina Beach, Chennai', position: { lat: 13.0500, lng: 80.2825 }, language: 'Tamil', langCode: 'ta-IN' },
  { name: 'Meenakshi Amman Temple, Madurai', position: { lat: 9.9195, lng: 78.1196 }, language: 'Tamil', langCode: 'ta-IN' },

  // Gujarat (Gujarati)
  { name: 'Sabarmati Ashram, Ahmedabad', position: { lat: 23.0610, lng: 72.5807 }, language: 'Gujarati', langCode: 'gu-IN' },
  { name: 'Rani ki Vav, Patan', position: { lat: 23.8590, lng: 72.1014 }, language: 'Gujarati', langCode: 'gu-IN' },
  
  // Rajasthan (Hindi)
  { name: 'Hawa Mahal, Jaipur', position: { lat: 26.9239, lng: 75.8267 }, language: 'Hindi', langCode: 'hi-IN' },
  { name: 'City Palace, Udaipur', position: { lat: 24.5762, lng: 73.6834 }, language: 'Hindi', langCode: 'hi-IN' },

  // Kerala (Malayalam)
  { name: 'Fort Kochi, Kochi', position: { lat: 9.9656, lng: 76.2422 }, language: 'Malayalam', langCode: 'ml-IN' },
  { name: 'Kerala Backwaters, Alappuzha', position: { lat: 9.4981, lng: 76.3388 }, language: 'Malayalam', langCode: 'ml-IN' },

  // Punjab (Punjabi)
  { name: 'Golden Temple, Amritsar', position: { lat: 31.6200, lng: 74.8765 }, language: 'Punjabi', langCode: 'pa-IN' },
  { name: 'Wagah Border, Amritsar', position: { lat: 31.6050, lng: 74.5765 }, language: 'Punjabi', langCode: 'pa-IN' },

  // Telangana (Telugu)
  { name: 'Charminar, Hyderabad', position: { lat: 17.3616, lng: 78.4747 }, language: 'Telugu', langCode: 'te-IN' },
  { name: 'Golkonda Fort, Hyderabad', position: { lat: 17.3833, lng: 78.4011 }, language: 'Telugu', langCode: 'te-IN' },

  // Uttar Pradesh (Hindi)
  { name: 'Taj Mahal, Agra', position: { lat: 27.1751, lng: 78.0421 }, language: 'Hindi', langCode: 'hi-IN' },
  { name: 'Dashashwamedh Ghat, Varanasi', position: { lat: 25.3076, lng: 83.0113 }, language: 'Hindi', langCode: 'hi-IN' },

  // Bihar (Hindi)
  { name: 'Mahabodhi Temple, Bodh Gaya', position: { lat: 24.6958, lng: 84.9912 }, language: 'Hindi', langCode: 'hi-IN' },

  // Goa (Konkani)
  { name: 'Baga Beach, Goa', position: { lat: 15.5562, lng: 73.7517 }, language: 'Konkani', langCode: 'kok-IN' },

  // Madhya Pradesh (Hindi)
  { name: 'Khajuraho Group of Monuments', position: { lat: 24.8525, lng: 79.9234 }, language: 'Hindi', langCode: 'hi-IN' },

  // Odisha (Odia)
  { name: 'Konark Sun Temple', position: { lat: 19.8876, lng: 86.0945 }, language: 'Odia', langCode: 'or-IN' },
  { name: 'Puri Beach, Puri', position: { lat: 19.8038, lng: 85.8318 }, language: 'Odia', langCode: 'or-IN' },

  // Assam (Assamese)
  { name: 'Kamakhya Temple, Guwahati', position: { lat: 26.1664, lng: 91.7058 }, language: 'Assamese', langCode: 'as-IN' },
  
  // Andhra Pradesh (Telugu)
  { name: 'Tirumala Venkateswara Temple, Tirupati', position: { lat: 13.6823, lng: 79.3496 }, language: 'Telugu', langCode: 'te-IN' },

  // Uttarakhand (Hindi)
  { name: 'Har Ki Pauri, Haridwar', position: { lat: 29.9573, lng: 78.1706 }, language: 'Hindi', langCode: 'hi-IN' },

  // Himachal Pradesh (Hindi)
  { name: 'The Ridge, Shimla', position: { lat: 31.1070, lng: 77.1734 }, language: 'Hindi', langCode: 'hi-IN' },
];

const stateToLanguageMap: Record<string, { language: string; langCode: string }> = {
    'Andhra Pradesh': { language: 'Telugu', langCode: 'te-IN' },
    'Arunachal Pradesh': { language: 'English', langCode: 'en-IN' },
    'Assam': { language: 'Assamese', langCode: 'as-IN' },
    'Bihar': { language: 'Hindi', langCode: 'hi-IN' },
    'Chhattisgarh': { language: 'Hindi', langCode: 'hi-IN' },
    'Goa': { language: 'Konkani', langCode: 'kok-IN' },
    'Gujarat': { language: 'Gujarati', langCode: 'gu-IN' },
    'Haryana': { language: 'Hindi', langCode: 'hi-IN' },
    'Himachal Pradesh': { language: 'Hindi', langCode: 'hi-IN' },
    'Jharkhand': { language: 'Hindi', langCode: 'hi-IN' },
    'Karnataka': { language: 'Kannada', langCode: 'kn-IN' },
    'Kerala': { language: 'Malayalam', langCode: 'ml-IN' },
    'Madhya Pradesh': { language: 'Hindi', langCode: 'hi-IN' },
    'Maharashtra': { language: 'Marathi', langCode: 'mr-IN' },
    'Manipur': { language: 'Manipuri', langCode: 'mni-IN' },
    'Meghalaya': { language: 'English', langCode: 'en-IN' },
    'Mizoram': { language: 'Mizo', langCode: 'lus-IN' },
    'Nagaland': { language: 'English', langCode: 'en-IN' },
    'Odisha': { language: 'Odia', langCode: 'or-IN' },
    'Punjab': { language: 'Punjabi', langCode: 'pa-IN' },
    'Rajasthan': { language: 'Hindi', langCode: 'hi-IN' },
    'Sikkim': { language: 'Nepali', langCode: 'ne-IN' },
    'Tamil Nadu': { language: 'Tamil', langCode: 'ta-IN' },
    'Telangana': { language: 'Telugu', langCode: 'te-IN' },
    'Tripura': { language: 'Bengali', langCode: 'bn-IN' },
    'Uttar Pradesh': { language: 'Hindi', langCode: 'hi-IN' },
    'Uttarakhand': { language: 'Hindi', langCode: 'hi-IN' },
    'West Bengal': { language: 'Bengali', langCode: 'bn-IN' },
    // Union Territories
    'Delhi': { language: 'Hindi', langCode: 'hi-IN' },
};


const MapComponent = ({ onClick }: { onClick: (place: { name: string; language: string; langCode: string }) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const { toast } = useToast();

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5,
        disableDefaultUI: true,
        zoomControl: true,
      });
      setMap(newMap);
    }
  }, [ref, map]);
  
  useEffect(() => {
    if (map) {
      placesOfInterest.forEach(place => {
        const marker = new google.maps.Marker({
          position: place.position,
          map: map,
          title: place.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: 'hsl(var(--primary))',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: 'hsl(var(--primary-foreground))',
          }
        });
        marker.addListener('click', () => {
          onClick(place);
          map.panTo(place.position);
          map.setZoom(15);
        });
      });

      // Add a click listener to the map itself
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: e.latLng }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const place = results[0];
                const stateComponent = place.address_components.find(c => c.types.includes('administrative_area_level_1'));
                const stateName = stateComponent?.long_name;
                
                if (stateName && stateToLanguageMap[stateName]) {
                    const placeName = place.formatted_address.split(',').slice(0, 2).join(', ');
                    const { language, langCode } = stateToLanguageMap[stateName];
                    
                    onClick({ name: placeName, language, langCode });
                    map.panTo(e.latLng!);
                    map.setZoom(15);
                } else {
                     toast({
                        variant: 'destructive',
                        title: 'Language Not Supported',
                        description: 'Sorry, we don\'t have lessons for this region yet.',
                    });
                }

            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Location not found',
                    description: 'Could not identify a place at the clicked location.',
                });
            }
        });
      });

    }
  }, [map, onClick, toast]);


  return <div ref={ref} className="h-full w-full rounded-lg" />;
};


export default function ExplorePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [lesson, setLesson] = useState<LocationLessonOutput | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<{ name: string; language: string; langCode: string } | null>(null);
    const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isCheckingPronunciation, setIsCheckingPronunciation] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const { toast } = useToast();

    const handleMapClick = async (place: { name: string; language: string; langCode: string }) => {
        setSelectedPlace(place);
        setIsLoading(true);
        setLesson(null);
        setPronunciationScore(null);
        try {
            const result = await generateLocationLessonAction({
                locationName: place.name,
                language: place.language,
            });
            setLesson(result);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to generate a lesson for this location.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
     const startRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            return;
        }

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = handleStopRecording;
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                toast({
                    variant: 'destructive',
                    title: 'Microphone Error',
                    description: 'Could not access microphone.',
                });
            }
        }
    };

    const handleStopRecording = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const audioDataUri = reader.result as string;
            const targetPhrase = lesson?.conversation.find(c => c.person !== 'Vendor')?.phrase;
            
            if (!targetPhrase || !selectedPlace) return;
            
            setIsCheckingPronunciation(true);
            setPronunciationScore(null);
            try {
                const result = await getPronunciationFeedbackAction({
                    userAudio: audioDataUri,
                    targetText: targetPhrase,
                    language: selectedPlace.langCode,
                });
                setPronunciationScore(result.score ?? 0);
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error', description: 'Failed to check pronunciation.' });
            } finally {
                setIsCheckingPronunciation(false);
            }
        };
    };
    
    const handleNextStop = () => {
        if (lesson?.nextStopSuggestion) {
            const nextPlace = placesOfInterest.find(p => lesson.nextStopSuggestion.includes(p.name.split(',')[0]));
            if (nextPlace) {
                handleMapClick(nextPlace);
            } else {
                 toast({ title: "Let's go!", description: lesson.nextStopSuggestion });
            }
        }
    };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Learn by Exploring"
        description="Click on a location on the map to start a real-world language mini-lesson."
      />
      <div className="grid h-[calc(100vh-16rem)] grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Wrapper apiKey={API_KEY} libraries={['maps', 'marker', 'geocoding']}>
              <MapComponent onClick={handleMapClick} />
            </Wrapper>
        </div>
        <div className="flex flex-col">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapIcon className="text-primary"/> Mini-Lesson</CardTitle>
              <CardDescription>{selectedPlace?.name || 'Select a location to begin.'}</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && (
                    <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground h-64">
                        <Loader2 className="h-10 w-10 animate-spin"/>
                        <p>Generating lesson for {selectedPlace?.name}...</p>
                    </div>
                )}
                {lesson && !isLoading && selectedPlace && (
                    <div className="space-y-6">
                         <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-2"><BookOpen size={18}/> Vocabulary in {selectedPlace.language}</h3>
                            <div className="flex flex-wrap gap-2">
                            {lesson.vocabulary.map(v => (
                                <Badge variant="secondary" key={v.word} className="text-base">{v.word} ({v.translation})</Badge>
                            ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-2"><MessageSquare size={18}/> Conversation</h3>
                            <div className="space-y-2 text-sm">
                                {lesson.conversation.map(c => (
                                    <p key={c.person}><b>{c.person}:</b> {c.phrase}</p>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-2"><GraduationCap size={18}/> Pronunciation Practice</h3>
                            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                <Button size="icon" variant={isRecording ? "destructive" : "outline"} onClick={startRecording} disabled={isCheckingPronunciation}>
                                    {isCheckingPronunciation ? <Loader2 className="animate-spin" /> : <Mic/>}
                                </Button>
                                <p className="flex-1 text-sm italic text-muted-foreground">
                                    Try saying: "{lesson.conversation.find(c => c.person !== 'Vendor')?.phrase}"
                                </p>
                            </div>
                             {pronunciationScore !== null && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-center">Your Score: {pronunciationScore}/100</p>
                                    <Progress value={pronunciationScore} className="h-2 mt-1" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold flex items-center gap-2 mb-2"><Building2 size={18}/> Cultural Tip</h3>
                            <p className="text-sm text-muted-foreground italic">{lesson.culturalContext}</p>
                        </div>
                        <div className="pt-4 text-center">
                            <p className="text-sm font-medium mb-2">Ready for the next stop?</p>
                             <Button onClick={handleNextStop}>
                                <Bot className="mr-2"/>{lesson.nextStopSuggestion}
                                <MoveRight className="ml-2"/>
                            </Button>
                        </div>
                    </div>
                )}
                 {!lesson && !isLoading && (
                     <div className="flex flex-col items-center justify-center gap-4 text-center text-muted-foreground h-64">
                        <MapIcon className="h-12 w-12"/>
                        <p>Your lesson will appear here.</p>
                    </div>
                 )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    
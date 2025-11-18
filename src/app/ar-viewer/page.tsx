
'use client';

import { useState } from 'react';
import PageHeader from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function ARViewerPage() {
  const [url, setUrl] = useState('http://localhost:5173/');
  const [iframeSrc, setIframeSrc] = useState('http://localhost:5173/');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleLoadUrl = () => {
    setIframeSrc(url);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="AR Viewer"
        description="Load and interact with web-based Augmented Reality content."
      />
      <Card>
        <CardHeader>
          <CardTitle>Content Loader</CardTitle>
          <CardDescription>
            Enter a URL to an AR experience (e.g., a page with a Model-Viewer component).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://example.com/ar-scene"
              value={url}
              onChange={handleUrlChange}
            />
            <Button onClick={handleLoadUrl}>Load</Button>
          </div>
          <div className="aspect-video w-full">
            <iframe
              title="AR Content"
              src={iframeSrc}
              className="h-full w-full rounded-md border"
              allow="camera; microphone; autoplay; encrypted-media; xr-spatial-tracking; fullscreen"
            ></iframe>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

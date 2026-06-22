import { useEffect, useState } from "react";
import { Maximize2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import type { SetupOption } from "@/lib/reservation-options";
import { formatCapacity, getLayoutPreview } from "@/lib/layout-previews";

export function SetupStylePreview({ setup }: { setup: SetupOption | undefined }) {
  if (!setup) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-sm text-muted-foreground text-center">
          Choose a setup style to preview the room layout.
        </CardContent>
      </Card>
    );
  }

  const preview = getLayoutPreview(setup.id);

  return (
    <Card className="overflow-hidden">
      <PreviewImage src={preview.src} alt={`${setup.label} — ${preview.alt}`} label={setup.label} />
      <CardContent className="p-4 space-y-2">
        <div className="space-y-0.5">
          <h3 className="text-sm font-semibold leading-tight">{setup.label}</h3>
          <p className="text-xs text-muted-foreground">{setup.room}</p>
        </div>
        <Badge variant="secondary">{formatCapacity(setup.capacity)}</Badge>
        <p className="text-xs text-muted-foreground">Click the image to enlarge</p>
      </CardContent>
    </Card>
  );
}

function PreviewImage({ src, alt, label }: { src: string; alt: string; label: string }) {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="p-3 pb-0 space-y-2">
        <DialogTrigger asChild>
          <button
            type="button"
            aria-label="Enlarge layout preview"
            className="relative block w-full overflow-hidden rounded-md border border-border bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="relative w-full h-48 sm:h-64 md:h-72">
              {!loaded && <Skeleton className="absolute inset-0" />}
              <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </div>
          </button>
        </DialogTrigger>
        <div className="flex justify-end">
          <DialogTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground">
              <Maximize2 className="h-3.5 w-3.5 mr-1" />
              Expand preview
            </Button>
          </DialogTrigger>
        </div>
      </div>

      <DialogContent className="max-w-4xl">
        <DialogTitle className="text-sm font-medium">{label}</DialogTitle>
        <div className="w-full max-h-[80vh] flex items-center justify-center">
          <img src={src} alt={alt} className="max-h-[75vh] w-auto object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

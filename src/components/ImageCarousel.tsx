import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
  // Controlled mode props
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  alt = "Image",
  autoPlay = false,
  autoPlayInterval = 4000,
  className,
  currentIndex: controlledIndex,
  onIndexChange,
}) => {
  const [internalIndex, setInternalIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Use controlled or internal index
  const isControlled = controlledIndex !== undefined;
  const currentIndex = isControlled ? controlledIndex : internalIndex;

  const setCurrentIndex = useCallback(
    (indexOrFn: number | ((prev: number) => number)) => {
      const newIndex =
        typeof indexOrFn === "function" ? indexOrFn(currentIndex) : indexOrFn;
      if (isControlled && onIndexChange) {
        onIndexChange(newIndex);
      } else {
        setInternalIndex(newIndex);
      }
    },
    [isControlled, onIndexChange, currentIndex]
  );

  const goToNext = useCallback(() => {
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(newIndex);
  }, [images.length, currentIndex, setCurrentIndex]);

  const goToPrevious = useCallback(() => {
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(newIndex);
  }, [images.length, currentIndex, setCurrentIndex]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageClick = () => {
    setZoomModalOpen(true);
    setZoomLevel(1);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));
  };

  const handleCloseZoomModal = () => {
    setZoomModalOpen(false);
    setZoomLevel(1);
  };

  // Auto-play functionality (disabled by default now)
  useEffect(() => {
    if (!autoPlay || isHovered || images.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goToNext, isHovered, images.length]);

  if (images.length === 0) {
    return (
      <div
        id="image-carousel-empty"
        className={cn(
          "bg-muted rounded-lg flex items-center justify-center h-[768px]",
          className
        )}
      >
        <span className="text-muted-foreground text-sm">
          No images available
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        id="image-carousel-container"
        className={cn("relative group", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Image */}
        <div
          id="image-carousel-main"
          className="relative overflow-hidden rounded-lg border border-border shadow-sm cursor-pointer"
          onClick={handleImageClick}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <img
                key={index}
                id={`carousel-image-${index}`}
                src={image}
                alt={`${alt} ${index + 1}`}
                className="w-full h-[768px] object-contain bg-muted/50 flex-shrink-0"
              />
            ))}
          </div>

          {/* Click hint overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white px-3 py-2 rounded-lg flex items-center gap-2">
              <ZoomIn className="h-4 w-4" />
              <span className="text-sm">Klik untuk zoom</span>
            </div>
          </div>

          {/* Navigation Arrows - Only show when multiple images */}
          {images.length > 1 && (
            <>
              <Button
                id="carousel-prev-btn"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                id="carousel-next-btn"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/40 hover:bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div
              id="carousel-counter"
              className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full"
            >
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Dot Indicators - Only show when multiple images */}
        {images.length > 1 && (
          <div
            id="carousel-indicators"
            className="flex justify-center gap-1.5 mt-3"
          >
            {images.map((_, index) => (
              <button
                key={index}
                id={`carousel-dot-${index}`}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  currentIndex === index
                    ? "bg-primary w-4"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <Dialog open={zoomModalOpen} onOpenChange={handleCloseZoomModal}>
        <DialogContent
          id="screenshot-zoom-modal"
          className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] p-0 gap-0 overflow-hidden [&>button]:hidden"
        >
          <DialogHeader className="p-4 border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle
                id="zoom-modal-title"
                className="text-lg font-semibold"
              >
                Screenshot Zoom
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  id="zoom-out-btn"
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="gap-1"
                >
                  <ZoomOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Zoom Out</span>
                </Button>
                <span
                  id="zoom-level-indicator"
                  className="text-sm text-muted-foreground min-w-[60px] text-center"
                >
                  {Math.round(zoomLevel * 100)}%
                </span>
                <Button
                  id="zoom-in-btn"
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 4}
                  className="gap-1"
                >
                  <ZoomIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Zoom In</span>
                </Button>
                <Button
                  id="zoom-close-btn"
                  variant="destructive"
                  size="sm"
                  onClick={handleCloseZoomModal}
                  className="gap-1 ml-2"
                >
                  <X className="h-4 w-4" />
                  <span className="hidden sm:inline">Close</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div
            id="zoom-image-container"
            className="flex-1 overflow-auto bg-muted/30 flex items-center justify-center p-4"
          >
            <div
              className="transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "center center",
              }}
            >
              <img
                id="zoom-image"
                src={images[currentIndex]}
                alt={`${alt} ${currentIndex + 1}`}
                className="max-w-full max-h-[calc(95vh-80px)] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Navigation in zoom modal when multiple images */}
          {images.length > 1 && (
            <div
              id="zoom-navigation"
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 px-4 py-2 rounded-full"
            >
              <Button
                id="zoom-prev-btn"
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span id="zoom-counter" className="text-white text-sm">
                {currentIndex + 1} / {images.length}
              </span>
              <Button
                id="zoom-next-btn"
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageCarousel;

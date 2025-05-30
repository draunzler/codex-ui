'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface FarmingRoute {
  materials: string[];
  route: string;
  estimated_time: string;
  efficiency_rating: number;
}

interface InteractiveMapProps {
  selectedMaterials: string[];
  showRoute: boolean;
  farmingRoute: FarmingRoute | null;
}

export default function InteractiveMap({ selectedMaterials, showRoute, farmingRoute }: InteractiveMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mapReady, setMapReady] = useState(false);

  // HoYoLAB Interactive Map URL
  const hoyolabMapUrl = "https://act.hoyolab.com/ys/app/interactive-map/index.html?lang=en-us";

  // Initialize the map
  useEffect(() => {
    const iframe = iframeRef.current;
    
    if (!iframe) return;

    // Set up iframe load handler
    const handleIframeLoad = () => {
      setMapReady(true);
      console.log('HoYoLAB map loaded successfully');
    };

    iframe.addEventListener('load', handleIframeLoad);

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, []);

  const openInNewTab = () => {
    window.open(hoyolabMapUrl, '_blank');
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-cream-white to-light-gray rounded-xl border-2 border-lime-accent/30 overflow-hidden">
      {/* HoYoLAB Map Iframe */}
      <iframe
        ref={iframeRef}
        src={hoyolabMapUrl}
        className="w-full h-full border-0"
        title="HoYoLAB Interactive Map"
        allow="fullscreen"
        loading="lazy"
      />

      {/* Loading Overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-gradient-to-br from-cream-white to-light-gray flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-lime rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-dark-charcoal border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-dark-charcoal font-medium">Loading HoYoLAB Interactive Map...</p>
            <p className="text-dark-charcoal/70 text-sm mt-2">This may take a few moments</p>
          </div>
        </div>
      )}

      {/* Open in New Tab Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={openInNewTab}
          className="flex items-center gap-2 px-3 py-2 bg-cream-white/90 backdrop-blur-sm text-dark-charcoal text-sm rounded-lg border border-lime-accent/30 hover:bg-soft-lime transition-colors shadow-lg"
          title="Open in new tab for full experience"
        >
          <ExternalLink className="h-4 w-4" />
          Open Full Map
        </button>
      </div>

      {/* Selected Materials Info */}
      {selectedMaterials.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-[#EFE9E1]/95 backdrop-blur-sm border border-[#D1C7BD] rounded-lg p-3 shadow-lg">
            <div className="text-sm font-medium text-[#322D29] mb-2">
              Selected Materials ({selectedMaterials.length}):
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedMaterials.slice(0, 5).map((material, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-gradient-to-r from-[#72383D] to-[#AC9C8D] text-[#EFE9E1] text-xs rounded"
                >
                  {material}
                </span>
              ))}
              {selectedMaterials.length > 5 && (
                <span className="inline-block px-2 py-1 bg-[#D1C7BD] text-[#322D29] text-xs rounded">
                  +{selectedMaterials.length - 5} more
                </span>
              )}
            </div>
            <div className="text-xs text-[#72383D] mt-2">
              Use the map's search function to find these materials
            </div>
          </div>
        </div>
      )}

      {/* Farming Route Info */}
      {showRoute && farmingRoute && (
        <div className="absolute top-16 left-4 right-4 z-10">
          <div className="bg-[#EFE9E1]/95 backdrop-blur-sm border border-[#D1C7BD] rounded-lg p-3 shadow-lg">
            <div className="text-sm font-medium text-[#322D29] mb-2">
              Farming Route Generated
            </div>
            <div className="text-xs text-[#72383D]">
              Estimated time: {farmingRoute.estimated_time} | 
              Efficiency: {farmingRoute.efficiency_rating}/10
            </div>
            <div className="text-xs text-[#AC9C8D] mt-1">
              Check the route details below the map for instructions
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { genshinAPI } from '@/lib/api';
import dynamic from 'next/dynamic';
import { 
  Map, 
  Route,
  Clock,
  Star,
  Gem,
  Flower,
  X,
  Navigation
} from 'lucide-react';

// Dynamically import the map component to avoid SSR issues
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] bg-gradient-to-br from-cream-white to-light-gray rounded-xl border-2 border-lime-accent/30 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-lime rounded-full flex items-center justify-center mx-auto mb-4">
          <Map className="h-8 w-8 text-dark-charcoal animate-pulse" />
        </div>
        <p className="text-dark-charcoal font-medium">Loading Interactive Map...</p>
      </div>
    </div>
  )
});

interface ExplorationMapSectionProps {
  userUID: number;
}

interface FarmingRoute {
  materials: string[];
  route: string;
  estimated_time: string;
  efficiency_rating: number;
}

export default function ExplorationMapSection({ userUID }: ExplorationMapSectionProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [customMaterial, setCustomMaterial] = useState('');
  const [farmingRoute, setFarmingRoute] = useState<FarmingRoute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRouteOnMap, setShowRouteOnMap] = useState(false);

  // Common materials for quick selection
  const commonMaterials = [
    'Crystal Chunk', 'White Iron Chunk', 'Electro Crystal', 'Cor Lapis',
    'Noctilucous Jade', 'Glaze Lily', 'Silk Flower', 'Violetgrass',
    'Cecilia', 'Windwheel Aster', 'Philanemo Mushroom', 'Small Lamp Grass',
    'Valberry', 'Wolfhook', 'Dandelion Seed', 'Calla Lily'
  ];

  const materialCategories = [
    { name: 'Ores', icon: Gem, color: 'bg-gradient-blue', materials: ['Crystal Chunk', 'White Iron Chunk', 'Electro Crystal'] },
    { name: 'Local Specialties', icon: Flower, color: 'bg-gradient-green', materials: ['Cor Lapis', 'Noctilucous Jade', 'Glaze Lily'] },
    { name: 'Common Materials', icon: Star, color: 'bg-gradient-purple', materials: ['Silk Flower', 'Violetgrass', 'Cecilia'] },
  ];

  const generateFarmingRoute = async () => {
    if (selectedMaterials.length === 0) {
      setError('Please select at least one material');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await genshinAPI.getFarmingRoute({
        materials: selectedMaterials,
        uid: userUID
      });
      setFarmingRoute(response as FarmingRoute);
      setShowRouteOnMap(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate farming route';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addCustomMaterial = () => {
    if (customMaterial.trim() && !selectedMaterials.includes(customMaterial.trim())) {
      setSelectedMaterials([...selectedMaterials, customMaterial.trim()]);
      setCustomMaterial('');
    }
  };

  const removeMaterial = (material: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m !== material));
  };

  const toggleMaterial = (material: string) => {
    if (selectedMaterials.includes(material)) {
      removeMaterial(material);
    } else {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Leaflet Map */}
      <Card className="bg-gradient-to-br from-cream-white to-light-gray border-lime-accent/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-dark-charcoal via-lime-accent to-dark-charcoal bg-clip-text text-transparent">
                <Map className="h-5 w-5 text-lime-accent" />
                HoYoLAB Interactive Map
              </CardTitle>
              <CardDescription>
                Official HoYoLAB interactive map for Genshin Impact exploration and material locations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Leaflet Map Container */}
          <div className="relative">
            <InteractiveMap 
              selectedMaterials={selectedMaterials}
              showRoute={showRouteOnMap}
              farmingRoute={farmingRoute}
            />
          </div>
        </CardContent>
      </Card>

      {/* Material Selection by Category */}
      <Card className="bg-gradient-to-br from-white via-cream-white to-light-gray border-lime-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-dark-charcoal via-lime-accent to-dark-charcoal bg-clip-text text-transparent">
            <Route className="h-5 w-5 text-lime-accent" />
            Smart Farming Routes
          </CardTitle>
          <CardDescription>
            Select materials to generate optimized farming routes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Material Categories */}
            <div>
              <label className="block text-sm font-medium text-dark-charcoal mb-3">
                Material Categories
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {materialCategories.map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <div key={category.name} className="p-4 bg-cream-white/60 backdrop-blur-sm rounded-xl border border-lime-accent/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="font-bold text-dark-charcoal">{category.name}</h4>
                      </div>
                      <div className="space-y-2">
                        {category.materials.map((material) => (
                          <button
                            key={material}
                            onClick={() => toggleMaterial(material)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg border transition-all duration-200 ${
                              selectedMaterials.includes(material)
                                ? 'bg-gradient-lime text-dark-charcoal border-lime-accent shadow-md'
                                : 'bg-white text-dark-charcoal border-lime-accent/30 hover:bg-soft-lime hover:border-lime-accent'
                            }`}
                          >
                            {material}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All Materials Grid */}
            <div>
              <label className="block text-sm font-medium text-dark-charcoal mb-3">
                All Available Materials
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {commonMaterials.map((material) => (
                  <button
                    key={material}
                    onClick={() => toggleMaterial(material)}
                    className={`p-3 text-sm rounded-lg border transition-all duration-200 hover:shadow-md ${
                      selectedMaterials.includes(material)
                        ? 'bg-gradient-lime text-dark-charcoal border-lime-accent shadow-lg'
                        : 'bg-white/80 text-dark-charcoal border-lime-accent/30 hover:bg-soft-lime hover:border-lime-accent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Gem className="h-4 w-4" />
                      {material}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Material Input */}
            <div className="flex gap-3">
              <Input
                placeholder="Add custom material..."
                value={customMaterial}
                onChange={(e) => setCustomMaterial(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomMaterial()}
                className="flex-1 border-lime-accent/30 focus:border-lime-accent focus:ring-lime-accent"
              />
              <Button 
                onClick={addCustomMaterial}
                variant="outline"
                className="border-lime-accent/30 text-lime-accent hover:bg-soft-lime hover:border-lime-accent"
              >
                <Flower className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>

            {/* Selected Materials */}
            {selectedMaterials.length > 0 && (
              <div className="p-4 bg-soft-lime backdrop-blur-sm rounded-xl border border-lime-accent/30">
                <label className="block text-sm font-medium text-dark-charcoal mb-3">
                  Selected Materials ({selectedMaterials.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedMaterials.map((material) => (
                    <span
                      key={material}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-lime text-dark-charcoal text-sm rounded-lg shadow-sm"
                    >
                      <Gem className="h-3 w-3" />
                      {material}
                      <button
                        onClick={() => removeMaterial(material)}
                        className="text-dark-charcoal hover:text-dark-charcoal/70 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Route Button */}
            <Button
              onClick={generateFarmingRoute}
              disabled={loading || selectedMaterials.length === 0}
              className="w-full bg-gradient-lime hover:bg-lime-accent text-dark-charcoal py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Route className="h-5 w-5 mr-2" />
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-dark-charcoal border-t-transparent rounded-full animate-spin" />
                  Generating Route...
                </div>
              ) : (
                'Generate Farming Route'
              )}
            </Button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-soft-orange border border-warning-orange rounded-lg backdrop-blur-sm">
              <p className="text-dark-charcoal text-sm">{error}</p>
            </div>
          )}

          {/* Farming Route Results */}
          {farmingRoute && (
            <div className="mt-6 space-y-4">
              <div className="border-t border-lime-accent/30 pt-6">
                <h4 className="font-bold text-dark-charcoal mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-lime-accent" />
                  Optimized Route
                </h4>
                
                {/* Route Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-blue rounded-xl border border-info-blue/30">
                    <Clock className="h-6 w-6 text-white mx-auto mb-2" />
                    <div className="text-sm text-white font-medium">Estimated Time</div>
                    <div className="font-bold text-white text-lg">{farmingRoute.estimated_time}</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-green rounded-xl border border-success-green/30">
                    <Star className="h-6 w-6 text-white mx-auto mb-2" />
                    <div className="text-sm text-white font-medium">Efficiency</div>
                    <div className="font-bold text-white text-lg">{farmingRoute.efficiency_rating}/10</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-purple rounded-xl border border-purple-accent/30">
                    <Gem className="h-6 w-6 text-white mx-auto mb-2" />
                    <div className="text-sm text-white font-medium">Materials</div>
                    <div className="font-bold text-white text-lg">{farmingRoute.materials.length}</div>
                  </div>
                </div>

                {/* Route Description */}
                <div className="p-6 bg-cream-white/80 backdrop-blur-sm border border-lime-accent/30 rounded-xl">
                  <h5 className="font-bold text-dark-charcoal mb-3 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-lime-accent" />
                    Route Instructions
                  </h5>
                  <p className="text-dark-charcoal whitespace-pre-line leading-relaxed">{farmingRoute.route}</p>
                </div>

                {/* Materials List */}
                <div className="p-6 bg-gradient-to-r from-soft-lime to-cream-white rounded-xl border border-lime-accent/30">
                  <h5 className="font-bold text-dark-charcoal mb-3 flex items-center gap-2">
                    <Flower className="h-5 w-5 text-lime-accent" />
                    Materials in Route
                  </h5>
                  <div className="flex flex-wrap gap-3">
                    {farmingRoute.materials.map((material, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white text-dark-charcoal text-sm rounded-lg border border-lime-accent/30 shadow-sm"
                      >
                        <Gem className="h-4 w-4 text-lime-accent" />
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CharacterResponse, genshinAPI } from '@/lib/api';
import { 
  Route, 
  MapPin, 
  Clock, 
  Star,
  Calendar,
  Target,
  Sparkles,
  CheckCircle,
  Plus,
  X,
  Zap
} from 'lucide-react';

interface FarmingRouteSectionProps {
  characters: CharacterResponse[];
  userUID: number;
}

interface FarmingResult {
  materials: string[];
  route: string;
  sources: string[];
}

interface CharacterMaterials {
  character: string;
  ascension_materials: string[];
  talent_materials: string[];
  weekly_boss_materials: string[];
  local_specialties: string[];
}

export default function FarmingRouteSection({ characters, userUID }: FarmingRouteSectionProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [customMaterial, setCustomMaterial] = useState('');
  const [farmingResult, setFarmingResult] = useState<FarmingResult | null>(null);
  const [characterMaterials, setCharacterMaterials] = useState<CharacterMaterials | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Common materials for quick selection
  const commonMaterials = [
    'Mora',
    'Hero&apos;s Wit',
    'Mystic Enhancement Ore',
    'Talent Books',
    'Weapon Ascension Materials',
    'Character Ascension Gems',
    'Local Specialties',
    'Common Ascension Materials',
    'Elite Boss Materials',
    'Weekly Boss Materials'
  ];

  // Daily domains schedule
  const dailySchedule = {
    Monday: ['Forsaken Rift', 'Taishan Mansion', 'Violet Court'],
    Tuesday: ['Cecilia Garden', 'Hidden Palace of Lianshan Formula', 'Narukami Island: Tenshukaku'],
    Wednesday: ['Forsaken Rift', 'Taishan Mansion', 'Violet Court'],
    Thursday: ['Cecilia Garden', 'Hidden Palace of Lianshan Formula', 'Narukami Island: Tenshukaku'],
    Friday: ['Forsaken Rift', 'Taishan Mansion', 'Violet Court'],
    Saturday: ['Cecilia Garden', 'Hidden Palace of Lianshan Formula', 'Narukami Island: Tenshukaku'],
    Sunday: ['All Domains Available']
  };

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const addMaterial = (material: string) => {
    if (!selectedMaterials.includes(material)) {
      setSelectedMaterials([...selectedMaterials, material]);
    }
  };

  const removeMaterial = (material: string) => {
    setSelectedMaterials(selectedMaterials.filter(m => m !== material));
  };

  const addCustomMaterial = () => {
    if (customMaterial.trim() && !selectedMaterials.includes(customMaterial.trim())) {
      setSelectedMaterials([...selectedMaterials, customMaterial.trim()]);
      setCustomMaterial('');
    }
  };

  const loadCharacterMaterials = async (characterName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/materials/character/${characterName}`);
      if (!response.ok) {
        throw new Error('Failed to load character materials');
      }
      const materials = await response.json();
      setCharacterMaterials(materials);
      
      // Auto-add character materials to selection
      const allMaterials = [
        ...(materials.ascension_materials || []),
        ...(materials.talent_materials || []),
        ...(materials.weekly_boss_materials || []),
        ...(materials.local_specialties || [])
      ];
      
      setSelectedMaterials(prev => {
        const newMaterials = allMaterials.filter(m => !prev.includes(m));
        return [...prev, ...newMaterials];
      });
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load character materials';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateFarmingRoute = async () => {
    if (selectedMaterials.length === 0) {
      setError('Please select at least one material to farm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await genshinAPI.getFarmingRoute({
        materials: selectedMaterials,
        uid: userUID
      });

      setFarmingResult(result as FarmingResult);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate farming route';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Domains */}
      <Card className="bg-gradient-to-br from-[#EFE9E1] to-[#D9D9D9] border-[#D1C7BD]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#72383D] to-[#AC9C8D] bg-clip-text text-transparent">
            <div className="w-8 h-8 bg-gradient-to-r from-[#AC9C8D] to-[#D1C7BD] rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-[#322D29]" />
            </div>
            Today&apos;s Available Domains
          </CardTitle>
          <CardDescription className="text-[#72383D]">
            {getCurrentDay()} - Plan your daily farming efficiently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dailySchedule[getCurrentDay() as keyof typeof dailySchedule].map((domain, index) => (
              <div key={index} className="p-4 bg-gradient-to-br from-[#EFE9E1] to-[#D9D9D9] rounded-lg border border-[#D1C7BD]">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-[#72383D]" />
                  <span className="font-semibold text-[#72383D]">{domain}</span>
                </div>
                <div className="text-sm text-[#AC9C8D]">
                  Available today for talent materials
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Character Material Loader */}
      <Card className="bg-gradient-to-br from-[#D9D9D9] to-[#D1C7BD] border-[#AC9C8D]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#72383D] to-[#AC9C8D] bg-clip-text text-transparent">
            <div className="w-8 h-8 bg-gradient-to-r from-[#AC9C8D] to-[#D1C7BD] rounded-full flex items-center justify-center">
              <Target className="h-4 w-4 text-[#322D29]" />
            </div>
            Character Materials
          </CardTitle>
          <CardDescription className="text-[#72383D]">
            Load materials needed for a specific character
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {characters.map((character) => (
                <Button
                  key={character.id}
                  variant={selectedCharacter === character.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCharacter(character.name);
                    loadCharacterMaterials(character.name);
                  }}
                  disabled={loading}
                  className="text-xs"
                >
                  {character.name}
                </Button>
              ))}
            </div>

            {characterMaterials && (
              <div className="p-4 bg-[#EFE9E1]/80 rounded-lg border border-[#D1C7BD]">
                <h4 className="font-semibold mb-3 text-[#72383D]">Materials for {characterMaterials.character}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2 text-[#72383D]">Ascension Materials</h5>
                    <div className="space-y-1">
                      {characterMaterials.ascension_materials?.map((material, index) => (
                        <div key={index} className="text-sm text-[#AC9C8D]">
                          • {material}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2 text-[#AC9C8D]">Talent Materials</h5>
                    <div className="space-y-1">
                      {characterMaterials.talent_materials?.map((material, index) => (
                        <div key={index} className="text-sm text-[#AC9C8D]">
                          • {material}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2 text-[#D1C7BD]">Weekly Boss</h5>
                    <div className="space-y-1">
                      {characterMaterials.weekly_boss_materials?.map((material, index) => (
                        <div key={index} className="text-sm text-[#AC9C8D]">
                          • {material}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-sm mb-2 text-[#72383D]">Local Specialties</h5>
                    <div className="space-y-1">
                      {characterMaterials.local_specialties?.map((material, index) => (
                        <div key={index} className="text-sm text-[#AC9C8D]">
                          • {material}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Material Selection */}
      <Card className="bg-gradient-to-br from-[#EFE9E1] to-[#D9D9D9] border-[#D1C7BD]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-[#72383D] to-[#AC9C8D] bg-clip-text text-transparent">
            <div className="w-8 h-8 bg-gradient-to-r from-[#AC9C8D] to-[#D1C7BD] rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-[#322D29]" />
            </div>
            Select Materials to Farm
          </CardTitle>
          <CardDescription className="text-[#72383D]">
            Choose materials for optimized farming route generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Common Materials */}
            <div>
              <h4 className="font-medium mb-3 text-[#72383D]">Common Materials</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {commonMaterials.map((material) => (
                  <Button
                    key={material}
                    variant={selectedMaterials.includes(material) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (selectedMaterials.includes(material)) {
                        removeMaterial(material);
                      } else {
                        addMaterial(material);
                      }
                    }}
                    className="text-xs"
                  >
                    {material}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Material Input */}
            <div>
              <h4 className="font-medium mb-3 text-[#72383D]">Add Custom Material</h4>
              <div className="flex gap-2">
                <Input
                  value={customMaterial}
                  onChange={(e) => setCustomMaterial(e.target.value)}
                  placeholder="Enter material name..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCustomMaterial();
                    }
                  }}
                />
                <Button onClick={addCustomMaterial} disabled={!customMaterial.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Selected Materials */}
            {selectedMaterials.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 text-[#72383D]">Selected Materials ({selectedMaterials.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedMaterials.map((material) => (
                    <div
                      key={material}
                      className="flex items-center gap-2 px-3 py-1 bg-[#D9D9D9] text-[#72383D] rounded-full text-sm border border-[#D1C7BD]"
                    >
                      <span>{material}</span>
                      <button
                        onClick={() => removeMaterial(material)}
                        className="text-[#AC9C8D] hover:text-[#72383D]"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generate Route */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={generateFarmingRoute}
              disabled={loading || selectedMaterials.length === 0}
              size="lg"
              className="flex items-center gap-2"
            >
              <Route className="h-5 w-5" />
              {loading ? 'Generating Route...' : 'Generate Optimized Farming Route'}
            </Button>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg w-full">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Farming Route Results */}
      {farmingResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Optimized Farming Route
            </CardTitle>
            <CardDescription>
              AI-generated efficient farming path for your selected materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Materials Summary */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Materials to Farm
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {farmingResult.materials.map((material, index) => (
                    <div key={index} className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm text-green-700 dark:text-green-300">
                      {material}
                    </div>
                  ))}
                </div>
              </div>

              {/* Farming Route */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Route className="h-4 w-4 text-blue-500" />
                  Optimized Route
                </h4>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="whitespace-pre-wrap text-sm">
                    {farmingResult.route}
                  </div>
                </div>
              </div>

              {/* Sources */}
              {farmingResult.sources.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    Additional Sources
                  </h4>
                  <div className="space-y-2">
                    {farmingResult.sources.map((source, index) => (
                      <div key={index} className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm">
                        {source}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Boss Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Boss Schedule
          </CardTitle>
          <CardDescription>
            Plan your weekly boss runs for maximum efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-[#D1C7BD] to-[#AC9C8D] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[#72383D]" />
                <span className="font-semibold text-[#322D29]">Stormterror</span>
              </div>
              <div className="text-sm text-[#72383D]">
                Dvalin&apos;s Plume, Dvalin&apos;s Claw, Dvalin&apos;s Sigh
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#AC9C8D] to-[#72383D] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[#EFE9E1]" />
                <span className="font-semibold text-[#EFE9E1]">Childe</span>
              </div>
              <div className="text-sm text-[#D1C7BD]">
                Tusk of Monoceros Caeli, Shard of a Foul Legacy, Shadow of the Warrior
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#D9D9D9] to-[#D1C7BD] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[#72383D]" />
                <span className="font-semibold text-[#322D29]">Azhdaha</span>
              </div>
              <div className="text-sm text-[#72383D]">
                Dragon Lord&apos;s Crown, Bloodjade Branch, Gilded Scale
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#72383D] to-[#322D29] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[#EFE9E1]" />
                <span className="font-semibold text-[#EFE9E1]">Signora</span>
              </div>
              <div className="text-sm text-[#D1C7BD]">
                Molten Moment, Hellfire Butterfly, Ashen Heart
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#AC9C8D] to-[#D1C7BD] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[#322D29]" />
                <span className="font-semibold text-[#322D29]">Raiden Shogun</span>
              </div>
              <div className="text-sm text-[#72383D]">
                Mudra of the Malefic General, Tears of the Calamitous God, The Meaning of Aeons
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#EFE9E1] to-[#D9D9D9] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[#72383D]" />
                <span className="font-semibold text-[#322D29]">Scaramouche</span>
              </div>
              <div className="text-sm text-[#72383D]">
                Daka&apos;s Bell, Mirror of Mushin, Puppet Strings
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#D1C7BD] rounded-lg">
            <div className="text-sm text-[#322D29]">
              💡 <strong>Tip:</strong> You can fight each weekly boss once per week for rewards. Plan your runs based on which characters you&apos;re building!
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
} 
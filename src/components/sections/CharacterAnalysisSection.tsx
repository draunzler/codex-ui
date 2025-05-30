'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CharacterResponse, genshinAPI } from '@/lib/api';
import { 
  Sword, 
  Star,
  Zap,
  Shield,
  Target,
  BarChart3,
  Users,
  Crown,
  Gem,
  User
} from 'lucide-react';

interface CharacterAnalysisSectionProps {
  characters: CharacterResponse[];
  userUID: number;
}

interface AnalysisResult {
  character: string;
  element: string;
  damage_breakdown: any;
  build_analysis: any;
  recommendations: any[];
  summary: any;
}

export default function CharacterAnalysisSection({ characters, userUID }: CharacterAnalysisSectionProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterResponse | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [hybridCharacters, setHybridCharacters] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);

  const getElementColor = (element: string) => {
    switch (element?.toLowerCase()) {
      case 'pyro':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'hydro':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'anemo':
        return 'text-teal-700 bg-teal-50 border-teal-200';
      case 'electro':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'dendro':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'cryo':
        return 'text-cyan-700 bg-cyan-50 border-cyan-200';
      case 'geo':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getElementGradient = (element: string) => {
    switch (element?.toLowerCase()) {
      case 'pyro':
        return 'from-red-500 to-orange-500';
      case 'hydro':
        return 'from-blue-500 to-cyan-500';
      case 'anemo':
        return 'from-teal-400 to-cyan-400';
      case 'electro':
        return 'from-purple-500 to-violet-500';
      case 'dendro':
        return 'from-green-500 to-emerald-500';
      case 'cryo':
        return 'from-cyan-400 to-blue-400';
      case 'geo':
        return 'from-yellow-600 to-amber-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityStars = (rarity: number) => {
    return Array.from({ length: rarity }, (_, i) => (
      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    ));
  };

  const getCharacterPortraitUrl = (characterId: number) => {
    // Generate character portrait URL based on character ID
    return `https://enka.network/ui/UI_AvatarIcon_${characterId.toString().replace('10000', '')}.png`;
  };

  const loadHybridCharacters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/users/${userUID}/characters/hybrid`);
      if (!response.ok) {
        throw new Error('Failed to load hybrid characters');
      }
      const data = await response.json();
      setHybridCharacters(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load hybrid characters');
    } finally {
      setLoading(false);
    }
  };

  const analyzeCharacter = async (character: CharacterResponse) => {
    setLoading(true);
    setError(null);
    
    const requestData = {
      uid: userUID,
      character_name: character.name,
      team_composition: [],
      enemy_type: 'Standard'
    };
    
    try {
      let result;
      
      // Try the calculateDamage endpoint first (more stable)
      try {
        result = await genshinAPI.calculateDamage(requestData);
      } catch (firstError: any) {
        console.log('calculateDamage failed, trying analyzeCharacterAdvanced...', firstError.message);
        
        // Fallback to analyzeCharacterAdvanced if calculateDamage fails
        try {
          result = await genshinAPI.analyzeCharacterAdvanced(requestData);
        } catch (secondError: any) {
          console.log('Both backend endpoints failed, using client-side analysis...', secondError.message);
          
          // Final fallback: client-side analysis
          analyzeCharacterStats(character);
          setError('Backend analysis unavailable. Showing basic client-side analysis instead.');
          return;
        }
      }
      
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Character analysis error:', err);
      
      // Provide more specific error messages
      if (err.message?.includes('takes 4 positional arguments but 5 were given')) {
        setError('Backend method signature mismatch. Using client-side analysis instead.');
        analyzeCharacterStats(character);
      } else if (err.response?.status === 500) {
        setError('Server error during analysis. Using client-side analysis instead.');
        analyzeCharacterStats(character);
      } else if (err.response?.status === 422) {
        setError('Invalid request format. Using client-side analysis instead.');
        analyzeCharacterStats(character);
      } else {
        setError('Backend analysis failed. Using client-side analysis instead.');
        analyzeCharacterStats(character);
      }
    } finally {
      setLoading(false);
    }
  };

  const analyzeCharacterStats = (character: CharacterResponse) => {
    // Simple client-side analysis without backend calls
    const weaponAttack = character.weapon?.baseAttack || 0;
    
    // Calculate basic crit value from artifacts
    let critRate = 5; // Base crit rate
    let critDamage = 50; // Base crit damage
    let totalAttackPercent = 0;
    let elementalMastery = 0;
    
    character.artifacts.forEach(artifact => {
      artifact.subStats.forEach(subStat => {
        if (subStat.name.includes('Crit RATE')) {
          critRate += subStat.value;
        } else if (subStat.name.includes('Crit DMG')) {
          critDamage += subStat.value;
        } else if (subStat.name.includes('ATK%')) {
          totalAttackPercent += subStat.value;
        } else if (subStat.name.includes('Elemental Mastery')) {
          elementalMastery += subStat.value;
        }
      });
      
      // Add main stats
      if (artifact.mainStat.name.includes('Crit RATE')) {
        critRate += artifact.mainStat.value;
      } else if (artifact.mainStat.name.includes('Crit DMG')) {
        critDamage += artifact.mainStat.value;
      } else if (artifact.mainStat.name.includes('ATK%')) {
        totalAttackPercent += artifact.mainStat.value;
      } else if (artifact.mainStat.name.includes('Elemental Mastery')) {
        elementalMastery += artifact.mainStat.value;
      }
    });
    
    const critValue = (critRate * 2) + critDamage;
    const buildEfficiency = Math.min(100, (critValue / 200) * 100); // Rough efficiency calculation
    
    const basicAnalysis = {
      character: character.name,
      element: character.element,
      summary: {
        overall_rating: `${Math.round(buildEfficiency)}%`,
        crit_value: Math.round(critValue),
        total_attack: `${weaponAttack} + ${Math.round(totalAttackPercent)}%`,
        build_efficiency: `${Math.round(buildEfficiency)}%`
      },
      build_analysis: {
        crit_value: critValue,
        atk_rating: Math.min(100, totalAttackPercent * 2),
        crit_ratio: critDamage / critRate,
        overall_score: buildEfficiency
      },
      damage_breakdown: {
        normal_attack: {
          average: Math.round(weaponAttack * (1 + totalAttackPercent/100) * 1.5),
          crit: Math.round(weaponAttack * (1 + totalAttackPercent/100) * (1 + critDamage/100) * 1.5),
          non_crit: Math.round(weaponAttack * (1 + totalAttackPercent/100) * 1.5)
        }
      },
      recommendations: [
        {
          priority: critValue < 120 ? 'HIGH' : critValue < 160 ? 'MEDIUM' : 'LOW',
          category: 'Artifacts',
          action: critValue < 120 ? 'Focus on improving crit rate and crit damage substats' : 
                  critValue < 160 ? 'Fine-tune artifact substats for better crit value' :
                  'Consider optimizing other stats like ATK% or Elemental Mastery',
          expected_improvement: critValue < 120 ? '+20-40% damage' : '+10-20% damage',
          current_value: `${Math.round(critValue)} CV`
        }
      ]
    };
    
    setAnalysisResult(basicAnalysis);
  };

  const loadSetupInstructions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/characters/setup-instructions`);
      if (response.ok) {
        const instructions = await response.json();
        setShowSetupInstructions(true);
        // You could show instructions in a modal or expand section
      }
    } catch (err) {
      console.error('Failed to load setup instructions:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hybrid Character System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Complete Character Coverage
          </CardTitle>
          <CardDescription>
            Get ALL your characters with our hybrid approach: automated + manual input
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                🚀 Automated (Showcase)
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Up to 12 characters automatically fetched from your in-game Character Showcase
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                📝 Manual Input
              </h4>
              <p className="text-sm text-green-600 dark:text-green-400">
                Add remaining characters manually for complete roster coverage
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={loadHybridCharacters} disabled={loading}>
              <Users className="h-4 w-4 mr-2" />
              Load All Characters
            </Button>
            <Button variant="outline" onClick={loadSetupInstructions}>
              Setup Instructions
            </Button>
          </div>

          {hybridCharacters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{hybridCharacters.total_characters}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Characters</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{hybridCharacters.automated_count}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Automated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{hybridCharacters.manual_count}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Manual</div>
                </div>
              </div>
              {hybridCharacters.showcase_limit_reached && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-yellow-700 dark:text-yellow-300">
                  💡 Showcase limit reached. Add remaining characters manually for complete coverage.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Character Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="h-5 w-5" />
            Your Characters ({characters.length})
          </CardTitle>
          <CardDescription>
            Select a character to analyze with the Universal Damage Calculator
          </CardDescription>
        </CardHeader>
        <CardContent>
          {characters.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">No characters found in basic load.</div>
              <Button onClick={loadHybridCharacters} disabled={loading}>
                <Users className="h-4 w-4 mr-2" />
                Load All Characters (Hybrid)
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {(hybridCharacters?.characters || characters).map((character: any) => (
                <Card key={character.id} className="bg-white/90 backdrop-blur-sm border border-lime-accent/30 shadow-xl">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {/* Character Header */}
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 bg-gradient-to-r ${getElementGradient(character.element)} rounded-xl flex items-center justify-center shadow-lg`}>
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-dark-charcoal">{character.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getElementColor(character.element)}`}>
                              {character.element}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getRarityStars(character.rarity)}
                          </div>
                        </div>
                        <Button
                          onClick={() => analyzeCharacter(character)}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                          className="border-lime-accent/30 text-lime-accent hover:bg-soft-lime"
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analyze
                        </Button>
                      </div>

                      {/* Character Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gradient-lime rounded-lg shadow-lg">
                          <div className="text-2xl font-bold text-dark-charcoal mb-1">{character.level}</div>
                          <div className="text-sm text-dark-charcoal/80">Level</div>
                        </div>
                        
                        <div className="text-center p-4 bg-dark-charcoal rounded-lg shadow-lg">
                          <div className="text-2xl font-bold text-lime-accent mb-1">C{character.constellation}</div>
                          <div className="text-sm text-lime-accent/90">Constellation</div>
                        </div>
                        
                        <div className="text-center p-4 bg-gradient-lime rounded-lg shadow-lg">
                          <div className="text-2xl font-bold text-dark-charcoal mb-1">{character.friendship_level || character.friendship || 0}</div>
                          <div className="text-sm text-dark-charcoal/80">Friendship</div>
                        </div>
                        
                        <div className="text-center p-4 bg-dark-charcoal rounded-lg shadow-lg">
                          <div className="text-2xl font-bold text-lime-accent mb-1">{character.ascension || 0}</div>
                          <div className="text-sm text-lime-accent/90">Ascension</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Character Details Panel */}
          {selectedCharacter && (
            <div className="mt-6 border rounded-xl overflow-hidden">
              {/* Header with Character Info */}
              <div className={`bg-gradient-to-r ${getElementGradient(selectedCharacter.element)} p-6 text-white`}>
                <div className="flex items-center gap-4">
                  <img
                    src={getCharacterPortraitUrl(selectedCharacter.id)}
                    alt={selectedCharacter.name}
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <h4 className="text-2xl font-bold">{selectedCharacter.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        {getRarityStars(selectedCharacter.rarity)}
                      </div>
                      <span className="text-white/80">•</span>
                      <span className="text-white/90">Level {selectedCharacter.level}</span>
                      <span className="text-white/80">•</span>
                      <span className="text-white/90">C{selectedCharacter.constellation}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-gray-800">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weapon Details */}
                  {selectedCharacter.weapon && (
                    <div className="space-y-4">
                      <h5 className="font-semibold text-lg flex items-center gap-2">
                        <Sword className="h-5 w-5" />
                        Weapon Details
                      </h5>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <img
                            src={selectedCharacter.weapon.icon}
                            alt={selectedCharacter.weapon.name}
                            className="w-12 h-12 rounded border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div>
                            <div className="font-medium">{selectedCharacter.weapon.name || 'Unknown Weapon'}</div>
                            <div className="flex items-center gap-1">
                              {getRarityStars(selectedCharacter.weapon.rarity).slice(0, selectedCharacter.weapon.rarity)}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Level:</span>
                            <span className="font-medium">{selectedCharacter.weapon.level}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Refinement:</span>
                            <span className="font-medium">R{selectedCharacter.weapon.refinement || 1}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Base ATK:</span>
                            <span className="font-medium">{selectedCharacter.weapon.baseAttack}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Ascension:</span>
                            <span className="font-medium">{selectedCharacter.weapon.ascension || 0}</span>
                          </div>
                        </div>
                        {selectedCharacter.weapon.subStat && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Sub Stat:</span>
                              <span className="font-medium">
                                {selectedCharacter.weapon.subStat.name}: {selectedCharacter.weapon.subStat.value}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Artifact Details */}
                  {selectedCharacter.artifacts && selectedCharacter.artifacts.length > 0 && (
                    <div className="space-y-4">
                      <h5 className="font-semibold text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Artifacts ({selectedCharacter.artifacts.length})
                      </h5>
                      <div className="space-y-3">
                        {selectedCharacter.artifacts.map((artifact: any, index: number) => (
                          <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={artifact.icon}
                                alt={artifact.type}
                                className="w-10 h-10 rounded border"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium capitalize">{artifact.type}</span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm font-bold text-purple-600">+{artifact.level}</span>
                                    {getRarityStars(artifact.rarity).slice(0, artifact.rarity)}
                                  </div>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {artifact.setName}
                                </div>
                                <div className="text-sm font-medium mt-1">
                                  {artifact.mainStat?.name}: {artifact.mainStat?.value}
                                </div>
                                {artifact.subStats && artifact.subStats.length > 0 && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {artifact.subStats.map((sub: any, subIndex: number) => (
                                      <span key={subIndex} className="mr-2">
                                        {sub.name}: {sub.value}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Talents */}
                {selectedCharacter.talents && selectedCharacter.talents.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h5 className="font-semibold text-lg flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      Talents & Constellations
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h6 className="font-medium mb-2">Skills</h6>
                        <div className="space-y-2">
                          {selectedCharacter.talents.filter((t: any) => t.type === 'skill').map((talent: any, index: number) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">Skill {index + 1}:</span>
                              <span className="font-bold text-blue-600">Level {talent.level}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h6 className="font-medium mb-2">Constellations</h6>
                        <div className="flex items-center gap-2">
                          <Gem className="h-4 w-4 text-yellow-500" />
                          <span className="font-bold text-yellow-600">
                            C{selectedCharacter.constellation} Unlocked
                          </span>
                        </div>
                        {selectedCharacter.talents.filter((t: any) => t.type === 'constellation').length > 0 && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {selectedCharacter.talents.filter((t: any) => t.type === 'constellation').length} constellations active
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Analysis Button */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => analyzeCharacter(selectedCharacter)}
                      disabled={loading}
                      className="flex-1"
                      size="lg"
                    >
                      <BarChart3 className="h-5 w-5 mr-2" />
                      {loading ? 'Analyzing...' : 'AI Analysis (Backend)'}
                    </Button>
                    <Button 
                      onClick={() => analyzeCharacterStats(selectedCharacter)}
                      disabled={loading}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      <Target className="h-5 w-5 mr-2" />
                      Quick Stats Analysis
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Try AI Analysis first. If it fails, Quick Stats provides a reliable client-side alternative.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {selectedCharacter && analysisResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analysis Results for {analysisResult.character}
            </CardTitle>
            <CardDescription>
              Universal Damage Calculator results with mathematical precision
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Summary */}
              {analysisResult.summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.summary.overall_rating || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Overall Rating</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResult.summary.crit_value || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Crit Value</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResult.summary.total_attack || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Total ATK</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {analysisResult.summary.build_efficiency || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Build Efficiency</div>
                  </div>
                </div>
              )}

              {/* Damage Breakdown */}
              {analysisResult.damage_breakdown && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Damage Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(analysisResult.damage_breakdown).map(([ability, damage]: [string, any]) => (
                        <div key={ability} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 capitalize">
                            {ability.replace(/_/g, ' ')}
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm">Average:</span>
                              <span className="font-bold text-blue-600">
                                {Math.round(damage.average || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Crit:</span>
                              <span className="font-bold text-green-600">
                                {Math.round(damage.crit || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Non-Crit:</span>
                              <span className="font-bold text-gray-600">
                                {Math.round(damage.non_crit || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Build Analysis */}
              {analysisResult.build_analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Build Efficiency Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-300">Crit Value</div>
                        <div className="text-xl font-bold text-blue-600">
                          {Math.round(analysisResult.build_analysis.crit_value || 0)}
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-300">ATK Rating</div>
                        <div className="text-xl font-bold text-green-600">
                          {Math.round(analysisResult.build_analysis.atk_rating || 0)}%
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-300">Crit Ratio</div>
                        <div className="text-xl font-bold text-purple-600">
                          1:{Math.round((analysisResult.build_analysis.crit_ratio || 2) * 10) / 10}
                        </div>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-300">Overall Score</div>
                        <div className="text-xl font-bold text-yellow-600">
                          {Math.round(analysisResult.build_analysis.overall_score || 0)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Optimization Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.recommendations.map((rec: any, index: number) => (
                        <div key={index} className={`p-4 rounded-lg border-l-4 ${
                          rec.priority === 'HIGH' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                          rec.priority === 'MEDIUM' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                          'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rec.priority === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200' :
                              rec.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                            }`}>
                              {rec.priority}
                            </span>
                            <span className="font-semibold">{rec.category}</span>
                          </div>
                          <div className="font-medium mb-2">
                            {rec.action}
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400 mb-1">
                            Expected improvement: {rec.expected_improvement}
                          </div>
                          {rec.current_value && (
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              Current: {rec.current_value}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Universal Calculator Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Universal Damage Calculator
          </CardTitle>
          <CardDescription>
            Mathematical precision for ANY Genshin Impact character
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Universal Formula
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Works for ANY character using actual Genshin Impact damage formulas. 
                No character-specific limitations.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Real damage calculations</li>
                <li>• Team synergy analysis</li>
                <li>• Optimal rotation planning</li>
                <li>• Build efficiency scoring</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                Analysis Features
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get detailed insights into your character builds and optimization opportunities.
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <li>• Crit value optimization</li>
                <li>• Artifact efficiency rating</li>
                <li>• Weapon recommendations</li>
                <li>• Priority improvements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
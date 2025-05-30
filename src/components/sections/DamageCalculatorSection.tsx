'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CharacterResponse, 
  genshinAPI, 
  MechanicalDamageRequest,
  AdvancedDamageRequest,
  CharacterAnalysisRequest,
  ComprehensiveTeamAnalysisRequest,
  SimpleDamageRequest,
  TeamDamageRequest
} from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Calculator, 
  Target, 
  Users, 
  TrendingUp,
  BarChart3,
  Sparkles,
  Shield,
  Sword,
  Crown,
  Star,
  Flame,
  User,
  X,
  Settings,
  Activity,
  Gauge,
  Brain,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  Globe,
  Lightbulb
} from 'lucide-react';

interface DamageCalculatorSectionProps {
  userUID: number;
  characters: CharacterResponse[];
}

interface DamageScenario {
  name: string;
  damage_type: string;
  element: string;
  hit_count: number;
  scaling_stat: string;
  enabled: boolean;
}

interface TeamBuff {
  source: string;
  buff_type: string;
  value: number;
  element?: string;
  enabled: boolean;
}

export default function DamageCalculatorSection({ userUID, characters }: DamageCalculatorSectionProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterResponse | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<CharacterResponse[]>([]);
  const [calculationMode, setCalculationMode] = useState<'single' | 'team'>('single');
  const [calculationType, setCalculationType] = useState<'simple' | 'team' | 'mechanical' | 'advanced' | 'dynamic' | 'analysis' | 'meta_team' | 'comprehensive_team'>('simple');
  
  // Enemy Configuration
  const [enemyLevel, setEnemyLevel] = useState(90);
  const [enemyType, setEnemyType] = useState('Standard');
  const [enemyResistances, setEnemyResistances] = useState({
    pyro: 10,
    hydro: 10,
    electro: 10,
    cryo: 10,
    anemo: 10,
    geo: 10,
    dendro: 10,
    physical: 10
  });
  
  // Comprehensive Analysis Configuration
  const [analysisDepth, setAnalysisDepth] = useState<'basic' | 'detailed' | 'comprehensive'>('detailed');
  const [contentFocus, setContentFocus] = useState<'spiral_abyss' | 'overworld' | 'domains' | 'general'>('spiral_abyss');
  const [playstylePreference, setPlaystylePreference] = useState<'aggressive' | 'balanced' | 'defensive'>('balanced');
  const [investmentLevel, setInvestmentLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [budgetConstraints, setBudgetConstraints] = useState(false);
  const [includeRotations, setIncludeRotations] = useState(true);
  const [includeArtifacts, setIncludeArtifacts] = useState(true);
  const [includeWeapons, setIncludeWeapons] = useState(true);
  const [includeConstellations, setIncludeConstellations] = useState(true);
  const [includeAlternatives, setIncludeAlternatives] = useState(true);
  
  // Damage Scenarios
  const [damageScenarios, setDamageScenarios] = useState<DamageScenario[]>([
    { name: 'Normal Attack', damage_type: 'normal_attack', element: 'pyro', hit_count: 1, scaling_stat: 'atk', enabled: true },
    { name: 'Elemental Skill', damage_type: 'elemental_skill', element: 'pyro', hit_count: 1, scaling_stat: 'atk', enabled: true },
    { name: 'Elemental Burst', damage_type: 'elemental_burst', element: 'pyro', hit_count: 1, scaling_stat: 'atk', enabled: true }
  ]);
  
  // Team Buffs
  const [teamBuffs, setTeamBuffs] = useState<TeamBuff[]>([
    { source: 'Bennett', buff_type: 'atk_percent', value: 50, enabled: false },
    { source: 'Kazuha', buff_type: 'dmg_bonus', value: 40, element: 'pyro', enabled: false },
    { source: 'Zhongli', buff_type: 'res_shred', value: 20, enabled: false }
  ]);
  
  // Results
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showTeamBuffs, setShowTeamBuffs] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const availableCharacters = characters || [];
  
  const elements = ['pyro', 'hydro', 'electro', 'cryo', 'anemo', 'geo', 'dendro', 'physical'];
  const damageTypes = ['normal_attack', 'charged_attack', 'plunge_attack', 'elemental_skill', 'elemental_burst'];
  const scalingStats = ['atk', 'hp', 'def', 'em'];

  // Update damage scenarios when character changes
  useEffect(() => {
    if (selectedCharacter) {
      const characterElement = selectedCharacter.element.toLowerCase();
      setDamageScenarios(prev => prev.map(scenario => ({
        ...scenario,
        element: characterElement
      })));
    }
  }, [selectedCharacter]);

  // Auto-redirect to calculator tab if conditions are not met
  useEffect(() => {
    if (activeTab === 'analysis' && !selectedCharacter) {
      setActiveTab('calculator');
    }
    if (activeTab === 'results' && (!selectedCharacter || !results)) {
      setActiveTab('calculator');
    }
  }, [activeTab, selectedCharacter, results]);

  // Update calculation type when mode changes
  useEffect(() => {
    if (calculationMode === 'single') {
      setCalculationType('simple');
    } else {
      setCalculationType('team');
    }
  }, [calculationMode]);

  const calculateDamage = async () => {
    if (!selectedCharacter) {
      setError('Please select a character');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      
      console.log('Calculation type:', calculationType);
      console.log('Selected character:', selectedCharacter.name);
      console.log('User UID:', userUID);
      
      switch (calculationType) {
        case 'simple':
          const simpleRequest: SimpleDamageRequest = {
            uid: userUID,
            character_name: selectedCharacter.name,
            enemy_level: enemyLevel,
            enemy_resistances: enemyResistances
          };
          console.log('Simple damage request:', simpleRequest);
          result = await genshinAPI.calculateSimpleDamage(simpleRequest);
          console.log('Simple damage response:', result);
          break;
          
        case 'team':
          if (selectedTeam.length === 0) {
            throw new Error('Please select at least one team member for team damage calculation');
          }
          
          const teamRequest: TeamDamageRequest = {
            uid: userUID,
            main_dps: selectedCharacter.name,
            team_composition: [selectedCharacter.name, ...selectedTeam.map(c => c.name)],
            enemy_level: enemyLevel,
            enemy_resistances: enemyResistances
          };
          result = await genshinAPI.calculateTeamDamage(teamRequest);
          break;
          
        case 'mechanical':
          const mechanicalRequest: MechanicalDamageRequest = {
            uid: userUID,
            character_name: selectedCharacter.name,
            team_composition: selectedTeam.map(c => c.name),
            enemy_level: enemyLevel,
            enemy_resistances: enemyResistances,
            reactions: []
          };
          result = await genshinAPI.calculateMechanicalDamage(mechanicalRequest);
          break;
          
        case 'advanced':
          if (!selectedCharacter.stats) {
            throw new Error('Character stats not available for advanced calculation');
          }
          
          const advancedRequest: AdvancedDamageRequest = {
            uid: userUID,
            character_data: {
              name: selectedCharacter.name,
              base_atk: selectedCharacter.stats.base_atk || 800,
              base_hp: selectedCharacter.stats.base_hp || 15000,
              base_def: selectedCharacter.stats.base_def || 800,
              level: selectedCharacter.level,
              flat_atk: selectedCharacter.stats.atk || 311,
              atk_percent: selectedCharacter.stats.atk_percent || 50,
              crit_rate: selectedCharacter.stats.crit_rate || 60,
              crit_dmg: selectedCharacter.stats.crit_dmg || 120,
              elemental_mastery: selectedCharacter.stats.elemental_mastery || 100,
              pyro_dmg_bonus: selectedCharacter.stats.pyro_dmg_bonus || 0,
              hydro_dmg_bonus: selectedCharacter.stats.hydro_dmg_bonus || 0,
              electro_dmg_bonus: selectedCharacter.stats.electro_dmg_bonus || 0,
              cryo_dmg_bonus: selectedCharacter.stats.cryo_dmg_bonus || 0,
              anemo_dmg_bonus: selectedCharacter.stats.anemo_dmg_bonus || 0,
              geo_dmg_bonus: selectedCharacter.stats.geo_dmg_bonus || 0,
              dendro_dmg_bonus: selectedCharacter.stats.dendro_dmg_bonus || 0,
              physical_dmg_bonus: selectedCharacter.stats.physical_dmg_bonus || 0
            },
            team_composition: selectedTeam.map(c => c.name),
            enemy_data: {
              level: enemyLevel,
              pyro_res: enemyResistances.pyro,
              hydro_res: enemyResistances.hydro,
              electro_res: enemyResistances.electro,
              cryo_res: enemyResistances.cryo,
              anemo_res: enemyResistances.anemo,
              geo_res: enemyResistances.geo,
              dendro_res: enemyResistances.dendro,
              physical_res: enemyResistances.physical,
              def_reduction: 0
            },
            damage_scenarios: damageScenarios.filter(s => s.enabled).map(scenario => ({
              name: scenario.name,
              damage_type: scenario.damage_type,
              element: scenario.element,
              hit_count: scenario.hit_count,
              scaling_stat: scenario.scaling_stat
            })),
            team_buffs: teamBuffs.filter(b => b.enabled).map(buff => ({
              source: buff.source,
              buff_type: buff.buff_type,
              value: buff.value,
              element: buff.element
            }))
          };
          result = await genshinAPI.calculateAdvancedDamage(advancedRequest);
          break;
          
        case 'dynamic':
          const dynamicRequest: MechanicalDamageRequest = {
            uid: userUID,
        character_name: selectedCharacter.name,
        team_composition: selectedTeam.map(c => c.name),
            enemy_level: enemyLevel,
            enemy_resistances: enemyResistances,
            reactions: []
          };
          result = await genshinAPI.calculateDynamicDamage(dynamicRequest);
          break;
          
        case 'analysis':
          const analysisRequest: CharacterAnalysisRequest = {
            uid: userUID,
            character_name: selectedCharacter.name
          };
          result = await genshinAPI.analyzeCharacterWithWebData(analysisRequest);
          break;
          
        case 'meta_team':
          result = await genshinAPI.buildMetaTeam(
            selectedCharacter.name,
            availableCharacters.map(c => c.name)
          );
          break;
          
        case 'comprehensive_team':
          if (selectedTeam.length === 0) {
            throw new Error('Please select team members for comprehensive analysis');
          }
          
          const comprehensiveRequest: ComprehensiveTeamAnalysisRequest = {
            uid: userUID,
            main_character: selectedCharacter.name,
            team_composition: [selectedCharacter.name, ...selectedTeam.map(c => c.name)],
            analysis_depth: analysisDepth,
            content_focus: contentFocus,
            enemy_level: enemyLevel,
            enemy_type: enemyType,
            reaction_priority: [],
            playstyle_preference: playstylePreference,
            investment_level: investmentLevel,
            budget_constraints: budgetConstraints,
            include_rotations: includeRotations,
            include_artifacts: includeArtifacts,
            include_weapons: includeWeapons,
            include_constellations: includeConstellations,
            include_alternatives: includeAlternatives
          };
          result = await genshinAPI.analyzeComprehensiveTeam(comprehensiveRequest);
          break;
          
        default:
          throw new Error('Invalid calculation type');
      }
      
      setResults(result);
      // Automatically switch to results tab after successful calculation
      setActiveTab('results');
    } catch (err: any) {
      setError(err.message || 'Calculation failed');
      console.error('Damage calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToTeam = (character: CharacterResponse) => {
    if (selectedTeam.length < 4 && !selectedTeam.find(c => c.id === character.id)) {
      setSelectedTeam([...selectedTeam, character]);
    }
  };

  const removeFromTeam = (characterName: string) => {
    setSelectedTeam(prev => prev.filter(c => c.name !== characterName));
  };

  const updateDamageScenario = (index: number, field: keyof DamageScenario, value: unknown) => {
    setDamageScenarios(prev => prev.map((scenario, i) => 
      i === index ? { ...scenario, [field]: value } : scenario
    ));
  };

  const updateTeamBuff = (index: number, field: keyof TeamBuff, value: unknown) => {
    setTeamBuffs(prev => prev.map((buff, i) => 
      i === index ? { ...buff, [field]: value } : buff
    ));
  };

  const getElementColor = (element: string) => {
    const colors: Record<string, string> = {
      pyro: 'text-red-500',
      hydro: 'text-blue-500',
      electro: 'text-purple-500',
      cryo: 'text-cyan-500',
      anemo: 'text-green-500',
      geo: 'text-yellow-500',
      dendro: 'text-lime-500',
      physical: 'text-gray-500'
    };
    return colors[element] || 'text-gray-500';
  };

  const getCalculationTypeIcon = (type: string) => {
    switch (type) {
      case 'simple': return <Calculator className="w-4 h-4" />;
      case 'team': return <Users className="w-4 h-4" />;
      case 'mechanical': return <Calculator className="w-4 h-4" />;
      case 'advanced': return <BarChart3 className="w-4 h-4" />;
      case 'dynamic': return <Globe className="w-4 h-4" />;
      case 'analysis': return <Brain className="w-4 h-4" />;
      case 'meta_team': return <Users className="w-4 h-4" />;
      case 'comprehensive_team': return <Sparkles className="w-4 h-4" />;
      default: return <Calculator className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Advanced Damage Calculator
          </CardTitle>
          <CardDescription>
            Calculate theoretical damage with mathematical precision and AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Calculator
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                className={`flex items-center gap-2 ${!selectedCharacter ? 'cursor-not-allowed' : ''}`}
                disabled={!selectedCharacter}
              >
                <Brain className="w-4 h-4" />
                Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                className={`flex items-center gap-2 ${!selectedCharacter || !results ? 'cursor-not-allowed' : ''}`}
                disabled={!selectedCharacter || !results}
              >
                <BarChart3 className="w-4 h-4" />
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6">
              {/* Character Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Character Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="character-select">Main Character</Label>
                    <Select value={selectedCharacter?.name || ''} onValueChange={(value) => {
                      const character = availableCharacters.find(c => c.name === value);
                      setSelectedCharacter(character || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a character" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCharacters.map((character) => (
                          <SelectItem key={character.id} value={character.name}>
                            <div className="flex items-center gap-2">
                              <span className={getElementColor(character.element)}>
                                <Flame className="w-4 h-4" />
                              </span>
                              {character.name}
                              <Badge variant="outline">Lv.{character.level}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCharacter && (
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className={getElementColor(selectedCharacter.element)}>
                            <Flame className="w-5 h-5" />
                          </span>
                          <span className="font-semibold">{selectedCharacter.name}</span>
                          <Badge variant="outline">Lv.{selectedCharacter.level}</Badge>
                          <Badge variant="outline">C{selectedCharacter.constellation}</Badge>
              </div>
                      </div>
                      {selectedCharacter.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-sm">
                          <div>ATK: {Math.round(selectedCharacter.stats.atk || 0)}</div>
                          <div>HP: {Math.round(selectedCharacter.stats.hp || 0)}</div>
                          <div>CRIT Rate: {(selectedCharacter.stats.crit_rate || 0).toFixed(1)}%</div>
                          <div>CRIT DMG: {(selectedCharacter.stats.crit_dmg || 0).toFixed(1)}%</div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Calculation Mode Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Damage Calculator Mode
                  </CardTitle>
                  <CardDescription>
                    Choose between single character analysis or team composition analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card 
                      className={`cursor-pointer transition-all ${
                        calculationMode === 'single' 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setCalculationMode('single')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-5 h-5" />
                          <span className="font-medium">Single Character</span>
                          <Badge variant="default" className="text-xs ml-auto">
                            Recommended
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Get raw damage numbers for a single character using the /damage/character endpoint. 
                          Perfect for comparing builds and understanding base performance.
                        </p>
                        <div className="mt-3 text-xs text-muted-foreground">
                          ✓ Clean damage calculations • ✓ Build analysis • ✓ Character stats
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className={`cursor-pointer transition-all ${
                        calculationMode === 'team' 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setCalculationMode('team')}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5" />
                          <span className="font-medium">Team Analysis</span>
                          <Badge variant="outline" className="text-xs ml-auto">
                            Advanced
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Analyze team compositions with buffs, synergies, and rotations using the /damage/team endpoint. 
                          See how team members boost your main DPS damage.
                        </p>
                        <div className="mt-3 text-xs text-muted-foreground">
                          ✓ Team buffs • ✓ Synergy analysis • ✓ Rotation guides
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Advanced Options Toggle */}
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="w-full"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Calculation Types
                      {showAdvancedOptions ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                    </Button>
                  </div>

                  {/* Advanced Calculation Types */}
                  {showAdvancedOptions && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <h4 className="font-medium mb-3">Advanced Calculation Types</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { type: 'dynamic', label: 'Dynamic AI', icon: Globe, category: 'AI-Powered', description: 'AI-powered with web data' },
                          { type: 'analysis', label: 'Build Analysis', icon: Brain, category: 'AI-Powered', description: 'Comprehensive build analysis' },
                          { type: 'mechanical', label: 'Mechanical', icon: Gauge, category: 'Mathematical', description: 'Pure mathematical formulas' },
                          { type: 'advanced', label: 'Advanced', icon: BarChart3, category: 'Mathematical', description: 'Complex calculations' },
                          { type: 'meta_team', label: 'Meta Team', icon: Crown, category: 'Team Building', description: 'Meta team builder' },
                          { type: 'comprehensive_team', label: 'Comprehensive', icon: Sparkles, category: 'Team Building', description: 'In-depth team analysis' }
                        ].map(({ type, label, icon: Icon, category, description }) => (
                          <Card 
                            key={type}
                            className={`cursor-pointer transition-all ${
                              calculationType === type 
                                ? 'ring-2 ring-primary bg-primary/5' 
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setCalculationType(type as 'simple' | 'team' | 'mechanical' | 'advanced' | 'dynamic' | 'analysis' | 'meta_team' | 'comprehensive_team')}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="w-4 h-4" />
                                <span className="font-medium text-sm">{label}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {description}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Selection - Enhanced for Team Mode */}
              {calculationMode === 'team' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Team Composition Builder
                    </CardTitle>
                    <CardDescription>
                      Build your team composition. Select your main DPS first, then add support characters.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Main DPS Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Main DPS Character {selectedCharacter && <span className="text-green-600">✓</span>}
                      </Label>
                      <Select 
                        value={selectedCharacter?.name || ""} 
                        onValueChange={(value) => {
                          const character = availableCharacters.find(c => c.name === value);
                          setSelectedCharacter(character || null);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Choose your main DPS character" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCharacters.map((character) => (
                            <SelectItem key={character.id} value={character.name}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getElementColor(character.element)}`} />
                                <span>{character.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  Lv.{character.level}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Team Members Selection */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Support Characters ({selectedTeam.length}/3)
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                        {availableCharacters
                          .filter(char => char.name !== selectedCharacter?.name)
                          .map((character) => {
                            const isSelected = selectedTeam.some(t => t.name === character.name);
                            return (
                              <Card 
                                key={character.id}
                                className={`cursor-pointer transition-all ${
                                  isSelected 
                                    ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' 
                                    : 'hover:bg-muted/50'
                                } ${selectedTeam.length >= 3 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                                onClick={() => {
                                  if (isSelected) {
                                    removeFromTeam(character.name);
                                  } else if (selectedTeam.length < 3) {
                                    addToTeam(character);
                                  }
                                }}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-3 h-3 rounded-full ${getElementColor(character.element)}`} />
                                      <span className="font-medium text-sm">{character.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline" className="text-xs">
                                        Lv.{character.level}
                                      </Badge>
                                      {isSelected && <span className="text-green-600 text-sm">✓</span>}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>

                      {/* Current Team Display */}
                      {selectedTeam.length > 0 && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Current Team Composition:</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCharacter && (
                              <Badge variant="default" className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${getElementColor(selectedCharacter.element)}`} />
                                {selectedCharacter.name} (Main DPS)
                              </Badge>
                            )}
                            {selectedTeam.map((member, index) => (
                              <Badge key={index} variant="outline" className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${getElementColor(member.element)}`} />
                                {member.name}
                                <X 
                                  className="w-3 h-3 cursor-pointer hover:text-red-500" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromTeam(member.name);
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Single Character Selection - Simplified for Single Mode */}
              {calculationMode === 'single' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Character Selection
                    </CardTitle>
                    <CardDescription>
                      Select a character to analyze their raw damage potential
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select 
                      value={selectedCharacter?.name || ""} 
                      onValueChange={(value) => {
                        const character = availableCharacters.find(c => c.name === value);
                        setSelectedCharacter(character || null);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a character to analyze" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCharacters.map((character) => (
                          <SelectItem key={character.id} value={character.name}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getElementColor(character.element)}`} />
                              <span>{character.name}</span>
                              <Badge variant="outline" className="text-xs">
                                Lv.{character.level} • {character.element}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Team Composition */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Team Composition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Main Character Selection */}
                  <div>
                    <Label htmlFor="main-character">Main Character</Label>
                    <Select 
                      value={selectedCharacter?.name || ""} 
                      onValueChange={(value) => {
                        const character = availableCharacters.find(c => c.name === value);
                        setSelectedCharacter(character || null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select main character" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCharacters.map((character) => (
                          <SelectItem key={character.id} value={character.name}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getElementColor(character.element)}`} />
                              <span>{character.name}</span>
                              <Badge variant="outline" className="text-xs">
                                Lv.{character.level}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Team Members */}
                  <div>
                    <Label>Team Members ({selectedTeam.length}/3)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                      {availableCharacters
                        .filter(char => char.name !== selectedCharacter?.name)
                        .map((character) => {
                          const isSelected = selectedTeam.some(t => t.name === character.name);
                          return (
                            <Card 
                              key={character.id}
                              className={`cursor-pointer transition-all ${
                                isSelected 
                                  ? 'ring-2 ring-primary bg-primary/5' 
                                  : 'hover:bg-muted/50'
                              } ${selectedTeam.length >= 3 && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                              onClick={() => {
                                if (isSelected) {
                                  removeFromTeam(character.name);
                                } else if (selectedTeam.length < 3) {
                                  addToTeam(character);
                                }
                              }}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getElementColor(character.element)}`} />
                                    <span className="text-sm font-medium">{character.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs">
                                      Lv.{character.level}
                                    </Badge>
                                    {isSelected && <span className="text-green-600">✓</span>}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>

                    {/* Selected Team Display */}
                    {selectedTeam.length > 0 && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Selected Team:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCharacter && (
                            <Badge variant="default">
                              {selectedCharacter.name} (Main)
                            </Badge>
                          )}
                          {selectedTeam.map((member, index) => (
                            <Badge key={index} variant="outline" className="flex items-center gap-1">
                              {member.name}
                              <X 
                                className="w-3 h-3 cursor-pointer hover:text-red-500" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromTeam(member.name);
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enemy Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Enemy Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="enemy-level">Enemy Level</Label>
                      <Input
                        id="enemy-level"
                        type="number"
                        value={enemyLevel}
                        onChange={(e) => setEnemyLevel(parseInt(e.target.value) || 90)}
                        min="1"
                        max="100"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="enemy-type">Enemy Type</Label>
                      <Select value={enemyType} onValueChange={setEnemyType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select enemy type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Elite">Elite</SelectItem>
                          <SelectItem value="Boss">Boss</SelectItem>
                          <SelectItem value="Abyss">Spiral Abyss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Elemental Resistances (%)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      {elements.map((element) => (
                        <div key={element} className="flex items-center gap-2">
                          <span className={`${getElementColor(element)} capitalize`}>
                            {element}:
                          </span>
                          <Input
                            type="number"
                            value={enemyResistances[element as keyof typeof enemyResistances]}
                            onChange={(e) => setEnemyResistances(prev => ({
                              ...prev,
                              [element]: parseInt(e.target.value) || 0
                            }))}
                            className="w-16"
                            min="-100"
                            max="100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comprehensive Analysis Configuration */}
              {calculationType === 'comprehensive_team' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Comprehensive Analysis Settings
                    </CardTitle>
                    <CardDescription>
                      Configure detailed analysis parameters for comprehensive team evaluation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="analysis-depth">Analysis Depth</Label>
                        <Select value={analysisDepth} onValueChange={(value) => setAnalysisDepth(value as 'basic' | 'detailed' | 'comprehensive')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                            <SelectItem value="comprehensive">Comprehensive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="content-focus">Content Focus</Label>
                        <Select value={contentFocus} onValueChange={(value) => setContentFocus(value as 'spiral_abyss' | 'overworld' | 'domains' | 'general')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="spiral_abyss">Spiral Abyss</SelectItem>
                            <SelectItem value="overworld">Overworld</SelectItem>
                            <SelectItem value="domains">Domains</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="playstyle">Playstyle Preference</Label>
                        <Select value={playstylePreference} onValueChange={(value) => setPlaystylePreference(value as 'aggressive' | 'balanced' | 'defensive')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aggressive">Aggressive</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="defensive">Defensive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="investment-level">Investment Level</Label>
                        <Select value={investmentLevel} onValueChange={(value: any) => setInvestmentLevel(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Budget</SelectItem>
                            <SelectItem value="medium">Medium Investment</SelectItem>
                            <SelectItem value="high">High Investment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="budget-constraints"
                          checked={budgetConstraints}
                          onChange={(e) => setBudgetConstraints(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="budget-constraints">Budget Constraints</Label>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="include-rotations"
                            checked={includeRotations}
                            onChange={(e) => setIncludeRotations(e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="include-rotations">Rotations</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="include-artifacts"
                            checked={includeArtifacts}
                            onChange={(e) => setIncludeArtifacts(e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="include-artifacts">Artifacts</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="include-weapons"
                            checked={includeWeapons}
                            onChange={(e) => setIncludeWeapons(e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="include-weapons">Weapons</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="include-constellations"
                            checked={includeConstellations}
                            onChange={(e) => setIncludeConstellations(e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="include-constellations">Constellations</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="include-alternatives"
                            checked={includeAlternatives}
                            onChange={(e) => setIncludeAlternatives(e.target.checked)}
                            className="rounded"
                          />
                          <Label htmlFor="include-alternatives">Alternatives</Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Note: Reactions Removed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Elemental reactions are not part of the current API request model and have been removed from this interface.
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              {(calculationType === 'advanced' || calculationType === 'comprehensive_team') && (
                <>
                  {/* Damage Scenarios */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sword className="w-4 h-4" />
                        Damage Scenarios
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                        >
                          {showAdvancedSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    {showAdvancedSettings && (
                      <CardContent className="space-y-4">
                        {damageScenarios.map((scenario, index) => (
                          <div key={index} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={scenario.enabled}
                                onChange={(e) => updateDamageScenario(index, 'enabled', e.target.checked)}
                                className="rounded"
                              />
                              <Input
                                value={scenario.name}
                                onChange={(e) => updateDamageScenario(index, 'name', e.target.value)}
                                placeholder="Scenario name"
                                className="flex-1"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <Select
                                value={scenario.damage_type}
                                onValueChange={(value) => updateDamageScenario(index, 'damage_type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {damageTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type.replace('_', ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select
                                value={scenario.element}
                                onValueChange={(value) => updateDamageScenario(index, 'element', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {elements.map((element) => (
                                    <SelectItem key={element} value={element}>
                                      {element}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Input
                                type="number"
                                value={scenario.hit_count}
                                onChange={(e) => updateDamageScenario(index, 'hit_count', parseInt(e.target.value) || 1)}
                                placeholder="Hits"
                                min="1"
                              />

                              <Select
                                value={scenario.scaling_stat}
                                onValueChange={(value) => updateDamageScenario(index, 'scaling_stat', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {scalingStats.map((stat) => (
                                    <SelectItem key={stat} value={stat}>
                                      {stat.toUpperCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>

                  {/* Team Buffs */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Team Buffs
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowTeamBuffs(!showTeamBuffs)}
                        >
                          {showTeamBuffs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    {showTeamBuffs && (
                      <CardContent className="space-y-4">
                        {teamBuffs.map((buff, index) => (
                          <div key={index} className="p-4 border rounded-lg space-y-3">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={buff.enabled}
                                onChange={(e) => updateTeamBuff(index, 'enabled', e.target.checked)}
                                className="rounded"
                              />
                              <Input
                                value={buff.source}
                                onChange={(e) => updateTeamBuff(index, 'source', e.target.value)}
                                placeholder="Buff source"
                                className="flex-1"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              <Select
                                value={buff.buff_type}
                                onValueChange={(value) => updateTeamBuff(index, 'buff_type', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="atk_percent">ATK%</SelectItem>
                                  <SelectItem value="dmg_bonus">DMG Bonus</SelectItem>
                                  <SelectItem value="res_shred">RES Shred</SelectItem>
                                  <SelectItem value="crit_rate">CRIT Rate</SelectItem>
                                  <SelectItem value="crit_dmg">CRIT DMG</SelectItem>
                                  <SelectItem value="elemental_mastery">EM</SelectItem>
                                </SelectContent>
                              </Select>

                              <Input
                                type="number"
                                value={buff.value}
                                onChange={(e) => updateTeamBuff(index, 'value', parseFloat(e.target.value) || 0)}
                                placeholder="Value"
                              />

                              {buff.buff_type === 'dmg_bonus' && (
                                <Select
                                  value={buff.element || ''}
                                  onValueChange={(value) => updateTeamBuff(index, 'element', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Element" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {elements.map((element) => (
                                      <SelectItem key={element} value={element}>
                                        {element}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                </>
              )}

              {/* Calculate Button */}
              <Button 
                onClick={calculateDamage} 
                disabled={!selectedCharacter || loading || (calculationMode === 'team' && selectedTeam.length === 0)}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Calculating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {getCalculationTypeIcon(calculationType)}
                    {calculationMode === 'single' ? 'Calculate Character Damage' : 'Analyze Team Composition'}
                  </div>
                )}
              </Button>

              {/* Validation Messages */}
              {!selectedCharacter && (
                <div className="text-center text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                  Please select a character to continue
                </div>
              )}
              
              {calculationMode === 'team' && selectedCharacter && selectedTeam.length === 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mx-auto mb-1" />
                  Add at least one support character for team analysis
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Character Analysis
                  </CardTitle>
                  <CardDescription>
                    Get AI-powered build recommendations and optimization tips
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedCharacter ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-semibold mb-2">Analysis Features</h3>
                        <ul className="space-y-1 text-sm">
                          <li className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            Web-sourced meta builds and guides
                          </li>
                          <li className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            AI-powered optimization recommendations
                          </li>
                          <li className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Team synergy analysis
                          </li>
                          <li className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Current meta insights
                          </li>
                        </ul>
                      </div>
                      
                      <Button
                        onClick={() => {
                          setCalculationType('analysis');
                          calculateDamage();
                        }}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Analyzing...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            Analyze Character Build
                          </div>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a character to begin analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {error && (
                <Card className="border-destructive">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="mt-2 text-sm">{error}</p>
                  </CardContent>
                </Card>
              )}

              {results ? (
                <div className="space-y-6">
                  {/* Results Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Calculation Results
                      </CardTitle>
                      <CardDescription>
                        {calculationType === 'analysis' ? 'Character Analysis Results' : 'Damage Calculation Results'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {calculationType === 'analysis' ? (
                        <div className="space-y-6">
                          {/* Character Base Data */}
                          {results.character_base_data && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  Character Information
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className={getElementColor(results.character_base_data.element.toLowerCase())}>
                                        <Flame className="w-4 h-4" />
                                      </span>
                                      <span className="font-semibold">{results.character_base_data.name}</span>
                                      <Badge variant="outline">{results.character_base_data.element}</Badge>
                                      <Badge variant="outline">{results.character_base_data.rarity}★</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      <div>Weapon Type: {results.character_base_data.weapon_type}</div>
                                      <div>Scaling Stat: {results.character_base_data.scaling_stat}</div>
                                      <div>Ascension Stat: {results.character_base_data.ascension_stat} (+{results.character_base_data.ascension_value}%)</div>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <h4 className="font-medium">Base Stats (Level 90)</h4>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                      <div>HP: {Math.round(results.character_base_data.base_stats.base_hp)}</div>
                                      <div>ATK: {Math.round(results.character_base_data.base_stats.base_atk)}</div>
                                      <div>DEF: {Math.round(results.character_base_data.base_stats.base_def)}</div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Current Build Analysis */}
                          {results.current_build_analysis && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4" />
                                  Current Build Analysis
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {results.current_build_analysis.current_stats && (
                                    <div>
                                      <h4 className="font-medium mb-2">Current Stats</h4>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                        <div className="p-2 bg-muted rounded">
                                          <div className="font-medium">Total HP</div>
                                          <div>{Math.round(results.current_build_analysis.current_stats.total_hp).toLocaleString()}</div>
                                        </div>
                                        <div className="p-2 bg-muted rounded">
                                          <div className="font-medium">Total ATK</div>
                                          <div>{Math.round(results.current_build_analysis.current_stats.total_atk).toLocaleString()}</div>
                                        </div>
                                        <div className="p-2 bg-muted rounded">
                                          <div className="font-medium">CRIT Rate</div>
                                          <div>{results.current_build_analysis.current_stats.crit_rate.toFixed(1)}%</div>
                                        </div>
                                        <div className="p-2 bg-muted rounded">
                                          <div className="font-medium">CRIT DMG</div>
                                          <div>{results.current_build_analysis.current_stats.crit_dmg.toFixed(1)}%</div>
                                        </div>
                                        <div className="p-2 bg-muted rounded">
                                          <div className="font-medium">Energy Recharge</div>
                                          <div>{results.current_build_analysis.current_stats.energy_recharge.toFixed(1)}%</div>
                                        </div>
                                        <div className="p-2 bg-muted rounded">
                                          <div className="font-medium">Elemental Mastery</div>
                                          <div>{Math.round(results.current_build_analysis.current_stats.elemental_mastery)}</div>
                                        </div>
                                        <div className="p-2 bg-muted rounded">
                                          <div className="font-medium">Data Source</div>
                                          <div className="text-xs">{results.current_build_analysis.current_stats.data_source}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                          
                          {/* Build Recommendations */}
                          {results.build_recommendations && results.build_recommendations.recommendations && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4" />
                                  Build Recommendations
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-6">
                                  {/* Optimal Build */}
                                  {results.build_recommendations.recommendations.optimal_build && (
                                    <div className="space-y-4">
                                      {/* Artifacts */}
                                      {results.build_recommendations.recommendations.optimal_build.artifacts && (
                                        <div>
                                          <h4 className="font-medium mb-2 flex items-center gap-2">
                                            <Crown className="w-4 h-4" />
                                            Artifacts
                                          </h4>
                                          <div className="p-4 bg-muted rounded-lg space-y-3">
                                            <div>
                                              <span className="font-medium">Set: </span>
                                              <Badge variant="outline">{results.build_recommendations.recommendations.optimal_build.artifacts.set}</Badge>
                                            </div>
                                            
                                            <div>
                                              <span className="font-medium">Main Stats:</span>
                                              <div className="grid grid-cols-3 gap-2 mt-2">
                                                <div className="p-2 bg-background rounded text-sm">
                                                  <div className="font-medium">Sands</div>
                                                  <div>{results.build_recommendations.recommendations.optimal_build.artifacts.main_stats.sands}</div>
                                                </div>
                                                <div className="p-2 bg-background rounded text-sm">
                                                  <div className="font-medium">Goblet</div>
                                                  <div>{results.build_recommendations.recommendations.optimal_build.artifacts.main_stats.goblet}</div>
                                                </div>
                                                <div className="p-2 bg-background rounded text-sm">
                                                  <div className="font-medium">Circlet</div>
                                                  <div>{results.build_recommendations.recommendations.optimal_build.artifacts.main_stats.circlet}</div>
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div>
                                              <span className="font-medium">Substat Priority:</span>
                                              <div className="flex flex-wrap gap-1 mt-2">
                                                {results.build_recommendations.recommendations.optimal_build.artifacts.sub_stats.map((stat: string, index: number) => (
                                                  <Badge key={index} variant="secondary" className="text-xs">
                                                    {index + 1}. {stat}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Weapons */}
                                      {results.build_recommendations.recommendations.optimal_build.weapons && (
                                        <div>
                                          <h4 className="font-medium mb-2 flex items-center gap-2">
                                            <Sword className="w-4 h-4" />
                                            Weapons
                                          </h4>
                                          <div className="p-4 bg-muted rounded-lg space-y-3">
                                            <div>
                                              <span className="font-medium">Best: </span>
                                              <Badge variant="default">{results.build_recommendations.recommendations.optimal_build.weapons.best}</Badge>
                                            </div>
                                            
                                            <div>
                                              <span className="font-medium">Alternatives:</span>
                                              <div className="flex flex-wrap gap-1 mt-2">
                                                {results.build_recommendations.recommendations.optimal_build.weapons.alternatives.map((weapon: string, index: number) => (
                                                  <Badge key={index} variant="outline" className="text-xs">
                                                    {weapon}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Talent Priority */}
                                      {results.build_recommendations.recommendations.optimal_build.talent_priority && (
                                        <div>
                                          <h4 className="font-medium mb-2 flex items-center gap-2">
                                            <Star className="w-4 h-4" />
                                            Talent Priority
                                          </h4>
                                          <div className="flex flex-wrap gap-1">
                                            {results.build_recommendations.recommendations.optimal_build.talent_priority.map((talent: string, index: number) => (
                                              <Badge key={index} variant="secondary">
                                                {index + 1}. {talent}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {/* Team Compositions */}
                                  {results.build_recommendations.recommendations.team_compositions && (
                                    <div>
                                      <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Team Compositions
                                      </h4>
                                      <div className="space-y-3">
                                        {results.build_recommendations.recommendations.team_compositions.map((team: { team_name: string; members: string[]; synergy: string }, index: number) => (
                                          <div key={index} className="p-4 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                              <Badge variant="default">{team.team_name}</Badge>
                                            </div>
                                            <div className="space-y-2">
                                              <div>
                                                <span className="font-medium">Members: </span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                  {team.members.map((member: string, memberIndex: number) => (
                                                    <Badge key={memberIndex} variant="outline" className="text-xs">
                                                      {member}
                                                    </Badge>
                                                  ))}
                                                </div>
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                {team.synergy}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Skill Rotation */}
                                  {results.build_recommendations.recommendations.skill_rotation && (
                                    <div>
                                      <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        Skill Rotation
                                      </h4>
                                      <div className="p-4 bg-muted rounded-lg text-sm">
                                        {results.build_recommendations.recommendations.skill_rotation}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Notes */}
                                  {results.build_recommendations.recommendations.notes && (
                                    <div>
                                      <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Info className="w-4 h-4" />
                                        Additional Notes
                                      </h4>
                                      <div className="p-4 bg-muted rounded-lg text-sm">
                                        {results.build_recommendations.recommendations.notes}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Sources */}
                          {results.build_recommendations && results.build_recommendations.sources && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  Sources
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {results.build_recommendations.sources.map((source: string, index: number) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                                      <a 
                                        href={source} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 underline truncate"
                                      >
                                        {source}
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ) : calculationType === 'simple' || calculationType === 'team' ? (
                        <div className="space-y-6">
                          <h3 className="font-semibold mb-4">
                            {calculationType === 'simple' ? 'Simple Damage Calculator Results' : 'Team Damage Calculator Results'}
                          </h3>
                          
                          {/* Character Stats Summary */}
                            {results.character_stats && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  Character Stats - {results.character_name}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                      {Math.round(results.character_stats.total_atk).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total ATK</div>
                                  </div>
                                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                      {results.character_stats.crit_rate.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">CRIT Rate</div>
                                  </div>
                                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                      {results.character_stats.crit_dmg.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">CRIT DMG</div>
                                  </div>
                                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">
                                      {Math.round(results.character_stats.crit_value || results.character_stats.crit_ratio || 0)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Crit Value</div>
                                  </div>
                                </div>
                                
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                  <div className="flex justify-between">
                                    <span>Elemental Mastery:</span>
                                    <span className="font-medium">{Math.round(results.character_stats.elemental_mastery || 0)}</span>
                                  </div>
                                  {results.character_stats.energy_recharge && (
                                    <div className="flex justify-between">
                                      <span>Energy Recharge:</span>
                                      <span className="font-medium">{results.character_stats.energy_recharge.toFixed(1)}%</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span>Build Quality:</span>
                                    <span className="font-medium">{results.character_stats.build_efficiency || results.character_stats.build_quality || 'N/A'}</span>
                                  </div>
                                  {results.character_stats.elemental_dmg_bonus && (
                                    <div className="flex justify-between">
                                      <span>Elemental DMG Bonus:</span>
                                      <span className="font-medium">{results.character_stats.elemental_dmg_bonus.toFixed(1)}%</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Damage Breakdown */}
                          {results.damage_breakdown && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Sword className="w-4 h-4" />
                                  Damage Breakdown
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {Object.entries(results.damage_breakdown).map(([ability, damage]: [string, unknown]) => {
                                    const damageData = damage as {
                                      total_average?: number;
                                      average?: number;
                                      crit: number;
                                      non_crit: number;
                                      transformative_damage?: number;
                                      talent_multiplier?: number;
                                      scaling_attribute?: string;
                                      resistance_multiplier?: number;
                                      res_multiplier?: number;
                                      defense_multiplier?: number;
                                      def_multiplier?: number;
                                    };
                                    return (
                                      <div key={ability} className="p-4 bg-muted rounded-lg">
                                        <h4 className="font-medium mb-3 capitalize">
                                          {ability.replace('_', ' ')}
                                        </h4>
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span className="text-sm">Average:</span>
                                            <span className="font-bold text-blue-600">
                                              {Math.round(damageData.total_average || damageData.average || 0).toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-sm">Crit:</span>
                                            <span className="font-bold text-green-600">
                                              {Math.round(damageData.crit).toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-sm">Non-Crit:</span>
                                            <span className="font-bold text-gray-600">
                                              {Math.round(damageData.non_crit).toLocaleString()}
                                            </span>
                                          </div>
                                          {damageData.transformative_damage && damageData.transformative_damage > 0 && (
                                            <div className="flex justify-between">
                                              <span className="text-sm">Transformative:</span>
                                              <span className="font-bold text-purple-600">
                                                {Math.round(damageData.transformative_damage).toLocaleString()}
                                              </span>
                                            </div>
                                          )}
                                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                                            <div>
                                              Talent: {damageData.talent_multiplier ? damageData.talent_multiplier.toFixed(1) : 'N/A'}% | 
                                              {damageData.scaling_attribute && (
                                                <span> Scaling: {damageData.scaling_attribute.toUpperCase()}</span>
                                              )}
                                            </div>
                                            {(damageData.resistance_multiplier || damageData.res_multiplier) && (
                                              <div>
                                                Resistance: {(((damageData.resistance_multiplier || damageData.res_multiplier) || 0) * 100).toFixed(1)}%
                                              </div>
                                            )}
                                            {(damageData.defense_multiplier || damageData.def_multiplier) && (
                                              <div>
                                                Defense: {(((damageData.defense_multiplier || damageData.def_multiplier) || 0) * 100).toFixed(1)}%
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Team Damage Specific Results */}
                          {calculationType === 'team' && results.team_buffs && (
                            <>
                              {/* Team Buffs */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Team Buffs & Synergies
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                      <div className="text-2xl font-bold text-blue-600">
                                        {results.team_synergy_score}%
                                      </div>
                                      <div className="text-sm text-muted-foreground">Synergy Score</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                      <div className="text-2xl font-bold text-green-600">
                                        {Object.values(results.elemental_coverage).filter(Boolean).length}
                                      </div>
                                      <div className="text-sm text-muted-foreground">Elements Covered</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                      <div className="text-2xl font-bold text-purple-600">
                                        {results.team_composition.length}
                                      </div>
                                      <div className="text-sm text-muted-foreground">Team Members</div>
                                    </div>
                                  </div>

                                  {/* Team Composition */}
                                  <div className="mb-4">
                                    <h4 className="font-medium mb-2">Team Composition</h4>
                                    <div className="flex flex-wrap gap-2">
                                      {results.team_composition.map((member: string, index: number) => (
                                        <Badge key={index} variant={index === 0 ? "default" : "outline"}>
                                          {member} {index === 0 && "(Main DPS)"}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Rotation Guide */}
                                  {results.rotation_guide && (
                                    <div>
                                      <h4 className="font-medium mb-2">Recommended Rotation</h4>
                                      <div className="p-3 bg-background rounded border text-sm">
                                        {results.rotation_guide}
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Damage Increase */}
                              {results.buffed_damage?.damage_increase && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <TrendingUp className="w-4 h-4" />
                                      Team Buff Impact
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {Object.entries(results.buffed_damage.damage_increase).map(([ability, increase]: [string, any]) => (
                                        <div key={ability} className="p-4 bg-muted rounded-lg">
                                          <h4 className="font-medium mb-3 capitalize">
                                            {ability.replace('_', ' ')}
                                          </h4>
                                          <div className="space-y-2">
                                            <div className="flex justify-between">
                                              <span className="text-sm">Base Damage:</span>
                                              <span className="font-medium">
                                                {Math.round(increase.base_average).toLocaleString()}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm">Buffed Damage:</span>
                                              <span className="font-medium text-green-600">
                                                {Math.round(increase.buffed_average).toLocaleString()}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-sm">Increase:</span>
                                              <span className="font-bold text-blue-600">
                                                +{increase.increase_percent.toFixed(1)}%
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </>
                          )}

                          {/* Enemy Information */}
                          {results.enemy_info && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  Enemy Configuration
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                    <div className="flex justify-between">
                                      <span>Level:</span>
                                      <span className="font-medium">{results.enemy_info.level}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Physical RES:</span>
                                      <span className="font-medium">{results.enemy_info.physical_resistance}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>DEF Multiplier:</span>
                                      <span className="font-medium">{(results.enemy_info.defense_multiplier * 100).toFixed(1)}%</span>
                                    </div>
                                  </div>
                                  
                                  {/* Elemental Resistances */}
                                  {results.enemy_info.elemental_resistance && (
                                    <div>
                                      <h4 className="font-medium mb-2">Elemental Resistances</h4>
                                      {typeof results.enemy_info.elemental_resistance === 'object' ? (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                          {Object.keys(results.enemy_info.elemental_resistance).map((element) => (
                                            <div key={element} className="flex justify-between p-2 bg-background rounded">
                                              <span className={`capitalize ${getElementColor(element)}`}>{element}:</span>
                                              <span className="font-medium">{(results.enemy_info.elemental_resistance as Record<string, number>)[element]}%</span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-sm">
                                          <span>All Elements: {results.enemy_info.elemental_resistance}%</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ) : calculationType === 'meta_team' ? (
                        <div className="space-y-4">
                          <h3 className="font-semibold mb-2">Meta Team Recommendations</h3>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {typeof results.team_recommendations === 'string' 
                                ? results.team_recommendations 
                                : JSON.stringify(results, null, 2)}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ) : calculationType === 'comprehensive_team' ? (
                        <div className="space-y-6">
                          <h3 className="font-semibold mb-4">Comprehensive Team Analysis</h3>
                          
                          {/* Team Overview */}
                          {results.team_composition && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Team Overview
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                      {results.team_synergy_score || 'N/A'}%
                                    </div>
                                    <div className="text-sm text-muted-foreground">Synergy Score</div>
                                  </div>
                                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                      {results.role_distribution ? Object.keys(results.role_distribution).length : 'N/A'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Roles Covered</div>
                                  </div>
                                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                      {results.elemental_coverage ? Object.values(results.elemental_coverage).filter(Boolean).length : 'N/A'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Elements</div>
                                  </div>
                                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600">
                                      {results.meta_relevance?.tier || 'N/A'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Meta Tier</div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  {results.team_composition.map((member: string, index: number) => (
                                    <Badge key={index} variant={index === 0 ? "default" : "outline"}>
                                      {member} {index === 0 && "(Main)"}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Strengths and Weaknesses */}
                          {(results.strengths || results.weaknesses) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {results.strengths && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-600">
                                      <TrendingUp className="w-4 h-4" />
                                      Strengths
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <ul className="space-y-2">
                                      {results.strengths.map((strength: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                          <span className="text-sm">{strength}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </CardContent>
                                </Card>
                              )}

                              {results.weaknesses && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-600">
                                      <AlertCircle className="w-4 h-4" />
                                      Weaknesses
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <ul className="space-y-2">
                                      {results.weaknesses.map((weakness: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                          <span className="text-sm">{weakness}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}

                          {/* Rotation Guide */}
                          {results.rotation_guide && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Activity className="w-4 h-4" />
                                  Rotation Guide
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="prose prose-sm max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {typeof results.rotation_guide === 'string' 
                                      ? results.rotation_guide 
                                      : JSON.stringify(results.rotation_guide, null, 2)}
                                  </ReactMarkdown>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Investment Priority */}
                          {results.investment_priority && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Star className="w-4 h-4" />
                                  Investment Priority
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="prose prose-sm max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {typeof results.investment_priority === 'string' 
                                      ? results.investment_priority 
                                      : JSON.stringify(results.investment_priority, null, 2)}
                                  </ReactMarkdown>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Alternative Characters */}
                          {results.alternative_characters && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Alternative Characters
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="prose prose-sm max-w-none">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {typeof results.alternative_characters === 'string' 
                                      ? results.alternative_characters 
                                      : JSON.stringify(results.alternative_characters, null, 2)}
                                  </ReactMarkdown>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Damage Summary */}
                          {results.total_damage && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card>
                                <CardContent className="pt-6">
                                  <div className="text-2xl font-bold text-primary">
                                    {typeof results.total_damage === 'number' 
                                      ? Math.round(results.total_damage).toLocaleString()
                                      : 'N/A'}
                                  </div>
                                  <p className="text-sm text-muted-foreground">Total Damage</p>
                                </CardContent>
                              </Card>
                              
                              {results.character_stats && (
                                <>
                                  <Card>
                                    <CardContent className="pt-6">
                                      <div className="text-2xl font-bold">
                                        {results.character_stats.crit_rate?.toFixed(1) || 'N/A'}%
                                      </div>
                                      <p className="text-sm text-muted-foreground">CRIT Rate</p>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardContent className="pt-6">
                                      <div className="text-2xl font-bold">
                                        {results.character_stats.crit_dmg?.toFixed(1) || 'N/A'}%
                                      </div>
                                      <p className="text-sm text-muted-foreground">CRIT DMG</p>
                                    </CardContent>
                                  </Card>
                                </>
                              )}
                            </div>
                          )}
                          
                          {/* Damage Breakdown */}
                          {results.damage_scenarios && (
                            <div>
                              <h3 className="font-semibold mb-2">Damage Breakdown</h3>
                              <div className="space-y-2">
                                {results.damage_scenarios.map((scenario: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                    <span className="font-medium">
                                      {scenario.scenario_name || scenario.name || `Scenario ${index + 1}`}
                                    </span>
                                    <span className="font-bold">
                                      {Math.round(scenario.total_damage || scenario.damage_per_hit || 0).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Character Stats */}
                          {results.character_stats && (
                            <div>
                              <h3 className="font-semibold mb-2">Character Stats</h3>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                <div>ATK: {Math.round(results.character_stats.total_atk || 0)}</div>
                                <div>HP: {Math.round(results.character_stats.total_hp || 0)}</div>
                                <div>DEF: {Math.round(results.character_stats.total_def || 0)}</div>
                                <div>EM: {Math.round(results.character_stats.elemental_mastery || 0)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Metadata */}
                  {(results.metadata || results.analysis_metadata || results.calculation_method) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Calculation Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm space-y-1">
                          {/* Analysis metadata */}
                          {results.analysis_metadata && (
                            <>
                              <div>UID: {results.analysis_metadata.uid}</div>
                              <div>Analysis Method: {results.analysis_metadata.analysis_method}</div>
                              <div>AI Model: {results.analysis_metadata.llm_model}</div>
                              <div>Data Sources: {results.analysis_metadata.data_sources}</div>
                              <div>Analyzed: {new Date(results.analysis_metadata.analyzed_at).toLocaleString()}</div>
                              {results.web_sources_used && (
                                <div className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  Web sources used: Yes
                              </div>
                              )}
                            </>
                          )}
                          
                          {/* Regular metadata */}
                          {results.metadata && !results.analysis_metadata && (
                            <>
                              {results.metadata.calculation_method && (
                                <div>Method: {results.metadata.calculation_method}</div>
                              )}
                              {results.metadata.llm_model && (
                                <div>AI Model: {results.metadata.llm_model}</div>
                              )}
                              {results.metadata.data_sources && (
                                <div>Sources: {results.metadata.data_sources.length} web sources</div>
                              )}
                              {results.metadata.calculation_timestamp && (
                                <div>Calculated: {new Date(results.metadata.calculation_timestamp).toLocaleString()}</div>
                              )}
                            </>
                          )}
                          
                          {/* Simple calculation metadata */}
                          {results.calculation_method && !results.metadata && !results.analysis_metadata && (
                            <div>Method: {results.calculation_method}</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8 text-muted-foreground">
                      <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Run a calculation to see results</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 
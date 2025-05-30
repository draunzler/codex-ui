import axios from 'axios';

// API Base URL - adjust this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types based on the backend models
export interface UserCreateRequest {
  uid: number;
}

export interface ShowcaseCharacter {
  avatarId: number;
  level: number;
  talentLevel?: number;
  energyType: number;
  costumeId?: number;
}

export interface ProfilePicture {
  id: number;
  iconPath?: string;
  icon?: string;
}

export interface UserStats {
  world_level: number;
  name_card_id: number;
  profile_picture: ProfilePicture;
  show_avatar_info_list: ShowcaseCharacter[];
}

export interface SpiralAbyss {
  floor: number;
  chamber: number;
}

export interface Exploration {
  name?: string;
  level?: number;
  exploration_percentage?: number;
}

export interface ProfileData {
  uid: number;
  nickname: string;
  level: number;
  signature?: string;
  worldLevel?: number;
  nameCardId?: number;
  finishAchievementNum?: number;
  towerFloorIndex?: number;
  towerLevelIndex?: number;
  showAvatarInfoList?: ShowcaseCharacter[];
  profilePicture?: ProfilePicture;
  fetched_at?: string;
}

export interface UserResponse {
  uid?: number;
  nickname?: string;
  level?: number;
  signature?: string;
  achievements?: number;
  days_active?: number;
  characters_count?: number;
  spiral_abyss?: SpiralAbyss;
  explorations?: Exploration[];
  stats?: UserStats;
  created_at?: string;
  updated_at?: string;
  last_fetch?: string;
  profile_data?: ProfileData;
  character_count?: number;
}

export interface WeaponSubStat {
  name: string;
  value: number;
}

export interface WeaponDetails {
  itemId: number;
  level: number;
  ascension: number;
  refinement: number;
  baseAttack: number;
  subStat?: WeaponSubStat;
  name: string;
  icon: string;
  rarity: number;
  weaponType: string;
}

export interface ArtifactMainStat {
  name: string;
  value: number;
}

export interface ArtifactSubStat {
  name: string;
  value: number;
}

export interface ArtifactDetails {
  itemId: number;
  type: string;
  level: number;
  rarity: number;
  setId: number;
  setName: string;
  icon: string;
  mainStat: ArtifactMainStat;
  subStats: ArtifactSubStat[];
}

export interface TalentDetails {
  skillId?: string;
  talentId?: number;
  level: number;
  type: string;
}

export interface CharacterResponse {
  id: number;
  name: string;
  element: string;
  rarity: number;
  level: number;
  friendship: number;
  constellation: number;
  weapon?: WeaponDetails;
  artifacts: ArtifactDetails[];
  talents: TalentDetails[];
  data_source?: string;
  stats?: {
    base_hp?: number;
    hp?: number;
    hp_percent?: number;
    base_atk?: number;
    atk?: number;
    atk_percent?: number;
    base_def?: number;
    def?: number;
    def_percent?: number;
    crit_rate?: number;
    crit_dmg?: number;
    energy_recharge?: number;
    healing_bonus?: number;
    incoming_healing_bonus?: number;
    elemental_mastery?: number;
    physical_res?: number;
    physical_dmg_bonus?: number;
    pyro_dmg_bonus?: number;
    electro_dmg_bonus?: number;
    hydro_dmg_bonus?: number;
    dendro_dmg_bonus?: number;
    anemo_dmg_bonus?: number;
    geo_dmg_bonus?: number;
    cryo_dmg_bonus?: number;
    pyro_res?: number;
    electro_res?: number;
    hydro_res?: number;
    dendro_res?: number;
    anemo_res?: number;
    geo_res?: number;
    cryo_res?: number;
    max_hp?: number;
    spd?: number;
    [key: string]: unknown; // For additional dynamic stats
  };
  icon_url?: string;
  local_icon_available?: boolean;
}

export interface DamageCalculationRequest {
  uid: number;
  character_name: string;
  team_composition: string[];
  enemy_type?: string;
}

export interface BuildRecommendationRequest {
  character_name: string;
  uid?: number;
  include_current_build?: boolean;
}

export interface QuestionRequest {
  question: string;
  uid?: number;
  include_context?: boolean;
}

export interface FarmingRouteRequest {
  materials: string[];
  uid?: number;
}

export interface ExplorationResponse {
  regions: Record<string, {
    name: string;
    level?: number;
    exploration_percentage?: number;
  }>;
  average_exploration: number;
  total_regions: number;
}

export interface SuccessResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface ErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
}

// Advanced Damage Calculation Interfaces
export interface MechanicalDamageRequest {
  uid: number;
  character_name: string;
  team_composition: string[];
  enemy_level: number;
  enemy_resistances?: Record<string, number>;
  reactions: string[];
}

export interface MechanicalDamageResponse {
  character: string;
  team: string[];
  enemy_level: number;
  total_damage: number;
  damage_breakdown: Array<{
    ability: string;
    damage: number;
    crit_damage: number;
    non_crit_damage: number;
  }>;
  character_stats: {
    total_atk: number;
    crit_rate: number;
    crit_dmg: number;
    elemental_mastery: number;
  };
  enemy_stats: {
    level: number;
    resistances: Record<string, number>;
  };
  reactions: string[];
  calculation_metadata: {
    calculation_method: string;
    timestamp: string;
  };
}

export interface AdvancedDamageRequest {
  uid: number;
  character_data: {
    name: string;
    base_atk: number;
    base_hp: number;
    base_def: number;
    level: number;
    flat_atk: number;
    atk_percent: number;
    crit_rate: number;
    crit_dmg: number;
    elemental_mastery: number;
    pyro_dmg_bonus?: number;
    hydro_dmg_bonus?: number;
    electro_dmg_bonus?: number;
    cryo_dmg_bonus?: number;
    anemo_dmg_bonus?: number;
    geo_dmg_bonus?: number;
    dendro_dmg_bonus?: number;
    physical_dmg_bonus?: number;
    normal_attack_multipliers?: number[];
    skill_multipliers?: number[];
    burst_multipliers?: number[];
    normal_level?: number;
    skill_level?: number;
    burst_level?: number;
  };
  team_composition: string[];
  enemy_data: {
    level: number;
    pyro_res?: number;
    hydro_res?: number;
    electro_res?: number;
    cryo_res?: number;
    anemo_res?: number;
    geo_res?: number;
    dendro_res?: number;
    physical_res?: number;
    def_reduction?: number;
  };
  damage_scenarios: Array<{
    name: string;
    damage_type: string;
    element: string;
    hit_count: number;
    scaling_stat: string;
    hit_index?: number;
    additional_bonuses?: number[];
    additive_bonus?: number;
    reaction?: {
      type: string;
      trigger_element: string;
      aura_element: string;
      bonus: number;
    };
  }>;
  team_buffs?: Array<{
    source: string;
    buff_type: string;
    value: number;
    element?: string;
    duration?: number;
    conditions?: string[];
  }>;
}

export interface AdvancedDamageResponse {
  character_name: string;
  team_composition: string[];
  total_damage: number;
  damage_scenarios: Array<{
    name: string;
    damage: number;
    crit_damage: number;
    average_damage: number;
  }>;
  character_stats: {
    total_atk: number;
    crit_rate: number;
    crit_dmg: number;
  };
  enemy_stats: {
    level: number;
    resistances: Record<string, number>;
  };
  calculation_metadata: {
    method: string;
    timestamp: string;
  };
}

export interface CharacterAnalysisRequest {
  uid: number;
  character_name: string;
  team_composition?: string[];
}

// Comprehensive Team Analysis Interfaces
export interface ComprehensiveTeamAnalysisRequest {
  uid: number;
  main_character: string;
  team_composition: string[];
  analysis_depth: 'basic' | 'detailed' | 'comprehensive';
  content_focus: 'spiral_abyss' | 'overworld' | 'domains' | 'general';
  enemy_level: number;
  enemy_type: string;
  reaction_priority: string[];
  playstyle_preference: 'aggressive' | 'balanced' | 'defensive';
  investment_level: 'low' | 'medium' | 'high';
  budget_constraints: boolean;
  include_rotations: boolean;
  include_artifacts: boolean;
  include_weapons: boolean;
  include_constellations: boolean;
  include_alternatives: boolean;
}

export interface ComprehensiveTeamAnalysisResponse {
  main_character: string;
  team_composition: string[];
  team_synergy_score: number;
  elemental_coverage: Record<string, boolean>;
  role_distribution: Record<string, string>;
  damage_analysis: {
    total_damage: number;
    damage_per_rotation: number;
    dps: number;
  };
  rotation_guide: {
    rotation_steps: string[];
    duration: number;
    notes: string;
  };
  artifact_recommendations: {
    main_stats: Record<string, string>;
    sub_stats: string[];
    set_bonuses: string[];
  };
  weapon_recommendations: {
    recommended_weapons: string[];
    alternatives: string[];
  };
  constellation_impact: {
    recommended_constellations: number[];
    impact_analysis: string;
  };
  team_buffs: Array<{
    source: string;
    buff_type: string;
    value: number;
  }>;
  weaknesses: string[];
  strengths: string[];
  investment_priority: {
    priority_order: string[];
    reasoning: string;
  };
  alternative_characters: {
    replacements: Record<string, string[]>;
    reasoning: string;
  };
  content_performance: {
    spiral_abyss: string;
    overworld: string;
    domains: string;
  };
  budget_analysis?: {
    low_investment: string;
    high_investment: string;
  };
  advanced_tips: {
    tips: string[];
    common_mistakes: string[];
  };
  meta_relevance: {
    current_tier: string;
    meta_score: number;
  };
}

// Simple Damage Calculator Interfaces
export interface SimpleDamageRequest {
  uid: number;
  character_name: string;
  enemy_level: number;
  enemy_resistances?: Record<string, number>;
}

export interface SimpleDamageResponse {
  character_name: string;
  element: string;
  character_stats: {
    total_atk: number;
    crit_rate: number;
    crit_dmg: number;
    elemental_mastery?: number;
    elemental_dmg_bonus?: number;
    energy_recharge?: number;
    crit_value?: number;
    crit_ratio?: number;
    build_efficiency?: string;
    build_quality?: string;
  };
  damage_breakdown: Record<string, {
    average?: number;
    crit: number;
    non_crit: number;
    transformative_damage?: number;
    total_average?: number;
    base_dmg?: number;
    base_dmg_multiplier?: number;
    additive_base_dmg_bonus?: number;
    dmg_bonus?: number;
    def_multiplier?: number;
    res_multiplier?: number;
    scaling_value?: number;
    scaling_attribute?: string;
    talent_multiplier: number;
    total_atk?: number;
    damage_bonus?: number;
    crit_rate: number;
    crit_dmg: number;
    resistance_multiplier?: number;
    defense_multiplier?: number;
    reaction_multiplier?: number;
  }>;
  enemy_info: {
    level: number;
    elemental_resistance?: Record<string, number> | number;
    physical_resistance: number;
    defense_multiplier: number;
  };
  calculation_method?: string;
}

export interface TeamDamageRequest {
  uid: number;
  main_dps: string;
  team_composition: string[];
  enemy_level: number;
  enemy_resistances?: Record<string, number>;
}

export interface TeamDamageResponse {
  main_dps: string;
  team_composition: string[];
  main_dps_damage: SimpleDamageResponse;
  team_buffs: {
    total_multipliers: Record<string, number>;
    categorized_buffs: Record<string, Array<{
      source: string;
      type: string;
      value: number;
    }>>;
    synergy_score: number;
    elemental_coverage: Record<string, boolean>;
    recommended_rotation: string;
  };
  buffed_damage: SimpleDamageResponse & {
    damage_increase: Record<string, {
      base_average: number;
      buffed_average: number;
      increase_percent: number;
    }>;
  };
  team_synergy_score: number;
  elemental_coverage: Record<string, boolean>;
  rotation_guide: string;
}

// API Functions
export const genshinAPI = {
  // User Management
  async createUser(request: UserCreateRequest): Promise<SuccessResponse> {
    const response = await api.post('/users', request);
    return response.data;
  },

  async getUserProfile(uid: number): Promise<UserResponse> {
    const response = await api.get(`/users/${uid}`);
    return response.data;
  },

  async refreshUserData(uid: number): Promise<SuccessResponse> {
    const response = await api.put(`/users/${uid}/refresh`);
    return response.data;
  },

  // Characters
  async getUserCharacters(uid: number): Promise<CharacterResponse[]> {
    const response = await api.get(`/users/${uid}/characters`);
    return response.data;
  },

  async getCharacterDetails(uid: number, characterName: string): Promise<CharacterResponse> {
    const response = await api.get(`/users/${uid}/characters/${characterName}`);
    return response.data;
  },

  // Exploration
  async getExplorationProgress(uid: number): Promise<ExplorationResponse> {
    const response = await api.get(`/users/${uid}/exploration`);
    return response.data;
  },

  // AI Assistant
  async analyzeCharacterAdvanced(request: DamageCalculationRequest): Promise<AdvancedDamageResponse> {
    const response = await api.post('/damage/advanced', request);
    return response.data;
  },

  async calculateDamage(request: DamageCalculationRequest): Promise<SimpleDamageResponse> {
    const response = await api.post('/damage/calculate', request);
    return response.data;
  },

  async getBuildRecommendation(request: BuildRecommendationRequest): Promise<unknown> {
    const response = await api.post('/builds/recommend', request);
    return response.data;
  },

  async askQuestion(request: QuestionRequest): Promise<{ answer: string; response: string }> {
    const response = await api.post('/ai/question', request);
    return response.data;
  },

  async getFarmingRoute(request: FarmingRouteRequest): Promise<unknown> {
    const response = await api.post('/farming/route', request);
    return response.data;
  },

  // Materials
  async getCharacterMaterials(characterName: string): Promise<unknown> {
    const response = await api.get(`/characters/${characterName}/materials`);
    return response.data;
  },

  async getCharacterFarmingRoute(characterName: string): Promise<unknown> {
    const response = await api.get(`/characters/${characterName}/farming-route`);
    return response.data;
  },

  async getMaterialsByRegion(region: string): Promise<unknown> {
    const response = await api.get(`/materials/region/${region}`);
    return response.data;
  },

  // System
  async getSchedulerStatus(): Promise<unknown> {
    const response = await api.get('/system/scheduler/status');
    return response.data;
  },

  async healthCheck(): Promise<unknown> {
    const response = await api.get('/health');
    return response.data;
  },

  // Hybrid Character System
  async getHybridCharacters(uid: number): Promise<unknown> {
    const response = await api.get(`/users/${uid}/characters/hybrid`);
    return response.data;
  },

  async getSetupInstructions(): Promise<unknown> {
    const response = await api.get('/characters/setup-instructions');
    return response.data;
  },

  async getCharacterTemplate(): Promise<unknown> {
    const response = await api.get('/characters/template');
    return response.data;
  },

  async addCharacterManually(characterData: unknown): Promise<SuccessResponse> {
    const response = await api.post('/characters/manual', characterData);
    return response.data;
  },

  // Advanced Damage Calculations
  async calculateMechanicalDamage(request: MechanicalDamageRequest): Promise<MechanicalDamageResponse> {
    const response = await api.post('/damage/mechanical', request);
    return response.data;
  },

  async calculateAdvancedDamage(request: AdvancedDamageRequest): Promise<AdvancedDamageResponse> {
    const response = await api.post('/damage/advanced-calculation', request);
    return response.data;
  },

  async analyzeCharacter(request: CharacterAnalysisRequest): Promise<unknown> {
    const response = await api.post('/analysis/character', request);
    return response.data;
  },

  // Dynamic Damage Calculation with Web Data
  async calculateDynamicDamage(request: MechanicalDamageRequest): Promise<unknown> {
    const response = await api.post('/damage/dynamic', request);
    return response.data;
  },

  async analyzeCharacterWithWebData(request: CharacterAnalysisRequest): Promise<unknown> {
    const response = await api.post('/analysis/character-web', request);
    return response.data;
  },

  async buildMetaTeam(characterName: string, availableCharacters?: string[]): Promise<unknown> {
    const response = await api.post('/teams/meta-build', {
      character_name: characterName,
      available_characters: availableCharacters || []
    });
    return response.data;
  },

  // Comprehensive Team Analysis
  async analyzeComprehensiveTeam(request: ComprehensiveTeamAnalysisRequest): Promise<ComprehensiveTeamAnalysisResponse> {
    const response = await api.post('/ai/comprehensive-team-analysis', request);
    return response.data;
  },

  // Simple Damage Calculator
  async calculateSimpleDamage(request: SimpleDamageRequest): Promise<SimpleDamageResponse> {
    const response = await api.post('/damage/character', request);
    return response.data;
  },

  async calculateTeamDamage(request: TeamDamageRequest): Promise<TeamDamageResponse> {
    const response = await api.post('/damage/team', request);
    return response.data;
  },
};

// Error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);
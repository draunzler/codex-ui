'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserResponse } from '@/lib/api';
import { 
  User, 
  Calendar, 
  Star, 
  Clock,
  Shield,
  Zap,
  Map,
  RefreshCw,
  Award,
  Activity,
  Timer,
  Users
} from 'lucide-react';
import { format } from 'date-fns';

interface UserProfileSectionProps {
  userData: UserResponse;
}

export default function UserProfileSection({ userData }: UserProfileSectionProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Handle both old and new API structures
  const profileData = userData.profile_data || userData;
  const explorations = userData.explorations || [];
  const nickname = profileData.nickname || userData.nickname || 'Unknown';
  const uid = profileData.uid || userData.uid || 0;
  const level = profileData.level || userData.level || 0;
  const signature = profileData.signature || userData.signature;
  const achievements = userData.achievements || (userData.profile_data?.finishAchievementNum) || 0;
  const daysActive = userData.days_active || 0;
  const worldLevel = userData.stats?.world_level || (userData.profile_data?.worldLevel) || 0;
  const showcaseCharacters = userData.profile_data?.showAvatarInfoList || [];
  const towerFloor = userData.profile_data?.towerFloorIndex || userData.spiral_abyss?.floor || 0;
  const towerLevel = userData.profile_data?.towerLevelIndex || userData.spiral_abyss?.chamber || 0;
  const nameCardId = userData.profile_data?.nameCardId || userData.stats?.name_card_id || 0;
  const fetchedAt = userData.profile_data?.fetched_at;

  // Character avatar mapping for showcase characters
  const getCharacterName = (avatarId: number) => {
    const characterMap: Record<number, string> = {
      10000047: "Raiden Shogun",
      10000089: "Mika", 
      10000087: "Tighnari",
      10000096: "Nilou",
      10000103: "Wanderer",
      10000032: "Bennett",
      10000104: "Xianyun",
      10000102: "Alhaitham",
      10000052: "Raiden Shogun", // Alternative ID
      10000090: "Collei",
      10000098: "Nahida",
      10000086: "Yae Miko"
    };
    return characterMap[avatarId] || `Character ${avatarId}`;
  };

  const getElementColor = (energyType: number) => {
    const elementMap: Record<number, { name: string; color: string; bg: string }> = {
      1: { name: "Anemo", color: "text-cyan-600", bg: "bg-cyan-100" },
      2: { name: "Geo", color: "text-yellow-600", bg: "bg-yellow-100" },
      3: { name: "Electro", color: "text-purple-600", bg: "bg-purple-100" },
      4: { name: "Dendro", color: "text-green-600", bg: "bg-green-100" },
      5: { name: "Anemo", color: "text-cyan-600", bg: "bg-cyan-100" },
      6: { name: "Cryo", color: "text-blue-600", bg: "bg-blue-100" },
      7: { name: "Hydro", color: "text-blue-500", bg: "bg-blue-100" },
      8: { name: "Pyro", color: "text-red-600", bg: "bg-red-100" }
    };
    return elementMap[energyType] || { name: "Unknown", color: "text-gray-600", bg: "bg-gray-100" };
  };

  return (
    <div className="space-y-6">
      {/* Player Signature */}
      {signature && (
        <Card className="bg-gradient-to-r from-lime-accent/10 via-success-green/10 to-lime-accent/10 border-2 border-lime-accent/30 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-lime-accent rounded-full flex items-center justify-center shadow-md">
                <Activity className="w-5 h-5 text-dark-charcoal" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-dark-charcoal/80 mb-1">Player Signature</div>
                <div className="italic text-dark-charcoal font-medium text-lg">"{signature}"</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Showcase Characters */}
      {showcaseCharacters.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-accent/5 to-lime-accent/5 border-2 border-purple-accent/30 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-accent to-lime-accent rounded-lg flex items-center justify-center shadow-md">
                <Users className="h-4 w-4 text-white" />
              </div>
              Showcase Characters
            </CardTitle>
            <CardDescription>Characters displayed on your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {showcaseCharacters.map((character, index) => {
                const elementInfo = getElementColor(character.energyType);
                return (
                  <div key={index} className={`p-4 rounded-xl border-2 shadow-md ${elementInfo.bg} border-gray-200`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${elementInfo.bg} border-2 border-white`}>
                        <Star className={`h-6 w-6 ${elementInfo.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-dark-charcoal">
                          {getCharacterName(character.avatarId)}
                        </div>
                        <div className="text-sm text-dark-charcoal/70">
                          Level {character.level}
                        </div>
                        {character.talentLevel && (
                          <div className="text-xs text-dark-charcoal/60">
                            Talent Level {character.talentLevel}
                          </div>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${elementInfo.color} ${elementInfo.bg}`}>
                        {elementInfo.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spiral Abyss Progress */}
      {(towerFloor > 0 || userData.spiral_abyss) && (
        <Card className="bg-gradient-to-br from-error-red/5 to-warning-orange/5 border-2 border-error-red/30 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="w-8 h-8 bg-gradient-to-r from-error-red to-warning-orange rounded-lg flex items-center justify-center shadow-md">
                <Zap className="h-4 w-4 text-white" />
              </div>
              Spiral Abyss Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-error-red to-warning-orange rounded-xl shadow-md">
                <div className="text-3xl font-bold text-white mb-1">{towerFloor}</div>
                <div className="text-white/90 text-sm">Current Floor</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-warning-orange to-success-green rounded-xl shadow-md">
                <div className="text-3xl font-bold text-white mb-1">{towerLevel}</div>
                <div className="text-white/90 text-sm">Current Chamber</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exploration Progress */}
      <Card className="bg-gradient-to-br from-info-blue/5 to-purple-accent/5 border-2 border-info-blue/30 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-info-blue to-purple-accent rounded-lg flex items-center justify-center shadow-md">
              <Map className="h-4 w-4 text-white" />
            </div>
            Exploration Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {explorations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {explorations.slice(0, 6).map((exploration, index) => {
                const percentage = exploration.exploration_percentage || 0;
                const isComplete = percentage >= 100;
                
                return (
                  <div key={index} className="p-3 bg-white/50 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-success-green' : 'bg-warning-orange'}`}></div>
                        <span className="font-medium text-sm text-dark-charcoal">
                          {exploration.name || 'Unknown Region'}
                        </span>
                      </div>
                      <span className={`font-bold text-sm ${isComplete ? 'text-success-green' : 'text-warning-orange'}`}>
                        {percentage}%
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${isComplete ? 'bg-success-green' : 'bg-warning-orange'}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              {explorations.length > 6 && (
                <div className="col-span-full text-center p-3 bg-gray-100 rounded-lg">
                  <span className="text-sm text-dark-charcoal/70">
                    +{explorations.length - 6} more regions
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-r from-lime-accent to-success-green rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <Map className="h-6 w-6 text-dark-charcoal" />
              </div>
              <h3 className="font-semibold text-dark-charcoal mb-1">No Exploration Data</h3>
              <p className="text-dark-charcoal/70 text-sm">Exploration progress information is not available.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Timeline */}
      <Card className="bg-gradient-to-br from-success-green/5 to-lime-accent/5 border-2 border-success-green/30 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-success-green to-lime-accent rounded-lg flex items-center justify-center shadow-md">
              <Calendar className="h-4 w-4 text-dark-charcoal" />
            </div>
            Account Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-success-green rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-dark-charcoal">Account Created</div>
                  <div className="text-sm text-dark-charcoal/70">{formatDate(userData.created_at)}</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-info-blue rounded-full flex items-center justify-center">
                  <RefreshCw className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-dark-charcoal">Last Updated</div>
                  <div className="text-sm text-dark-charcoal/70">{formatDate(userData.updated_at)}</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-warning-orange rounded-full flex items-center justify-center">
                  <Timer className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-dark-charcoal">Last Data Fetch</div>
                  <div className="text-sm text-dark-charcoal/70">{formatDate(userData.last_fetch)}</div>
                </div>
              </div>
            </div>

            {fetchedAt && (
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-accent rounded-full flex items-center justify-center">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-dark-charcoal">Profile Data Fetched</div>
                    <div className="text-sm text-dark-charcoal/70">{formatDate(fetchedAt)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Display Settings */}
      <Card className="bg-gradient-to-br from-purple-accent/5 to-lime-accent/5 border-2 border-purple-accent/30 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-accent to-lime-accent rounded-lg flex items-center justify-center shadow-md">
              <Shield className="h-4 w-4 text-white" />
            </div>
            Profile Display
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userData.profile_data?.profilePicture && (
              <div className="p-4 bg-white/50 rounded-lg border border-gray-200 text-center">
                <div className="w-16 h-16 bg-purple-accent rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
                  {userData.profile_data.profilePicture.icon ? (
                    <img
                      src={userData.profile_data.profilePicture.icon}
                      alt="Profile Picture"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('.fallback-icon') as HTMLElement;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <User className={`fallback-icon w-8 h-8 text-white ${userData.profile_data.profilePicture.icon ? 'hidden' : ''}`} />
                </div>
                <div className="font-medium text-dark-charcoal mb-1">Profile Picture</div>
                <div className="text-sm text-dark-charcoal/70">ID: {userData.profile_data.profilePicture.id}</div>
                {userData.profile_data.profilePicture.iconPath && (
                  <div className="text-xs text-dark-charcoal/50 mt-1">{userData.profile_data.profilePicture.iconPath}</div>
                )}
              </div>
            )}
            
            {nameCardId > 0 && (
              <div className="p-4 bg-white/50 rounded-lg border border-gray-200 text-center">
                <div className="w-16 h-16 bg-warning-orange rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div className="font-medium text-dark-charcoal mb-1">Name Card</div>
                <div className="text-sm text-dark-charcoal/70">ID: {nameCardId}</div>
              </div>
            )}

            {userData.stats?.profile_picture && !userData.profile_data?.profilePicture && (
              <div className="p-4 bg-white/50 rounded-lg border border-gray-200 text-center">
                <div className="w-16 h-16 bg-purple-accent rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="font-medium text-dark-charcoal mb-1">Profile Picture (Legacy)</div>
                <div className="text-sm text-dark-charcoal/70">ID: {userData.stats.profile_picture.id}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
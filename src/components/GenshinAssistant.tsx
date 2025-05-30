'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserResponse, CharacterResponse, genshinAPI } from '@/lib/api';
import AIAssistantSection from './sections/AIAssistantSection';
import DamageCalculatorSection from './sections/DamageCalculatorSection';
import ExplorationMapSection from './sections/ExplorationMapSection';
import CharacterAnalysisSection from './sections/CharacterAnalysisSection';
import UserProfileSection from './sections/UserProfileSection';
import { 
  MessageCircle, 
  Calculator, 
  Map, 
  User, 
  Users,
  RefreshCw,
  X,
  ChevronRight,
  Sparkles,
  Trophy,
  Star,
  MessageSquare,
  Shield,
  Sprout,
  Menu,
  Search,
  Home,
  BarChart3,
  Sword,
  Crown,
  ArrowLeft,
  Heart
} from 'lucide-react';

export default function GenshinAssistant() {
  const [userUID, setUserUID] = useState<string>('');
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [characters, setCharacters] = useState<CharacterResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCharacterDrawer, setShowCharacterDrawer] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [uidInput, setUidInput] = useState('');
  const [selectedCharacterDetails, setSelectedCharacterDetails] = useState<CharacterResponse | null>(null);
  const [showCharacterDetailsInDrawer, setShowCharacterDetailsInDrawer] = useState(false);
  
  // Ref for the Start Your Journey section
  const startJourneyRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to Start Your Journey section when welcome screen loads
  useEffect(() => {
    if (!userData && startJourneyRef.current) {
      const timer = setTimeout(() => {
        startJourneyRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 1000); // Delay to allow page to fully render
      
      return () => clearTimeout(timer);
    }
  }, [userData]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProfileDropdown && !target.closest('.profile-dropdown-container')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const loadUserData = async (uid: string) => {
    if (!uid.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [userResponse, charactersResponse] = await Promise.all([
        genshinAPI.getUserProfile(parseInt(uid)),
        genshinAPI.getUserCharacters(parseInt(uid))
      ]);
      
      setUserData(userResponse);
      setCharacters(charactersResponse);
      setUserUID(uid);
    } catch (err: any) {
      console.error('Error loading user data:', err);
      if (err.message?.includes('not found') || err.response?.status === 404) {
        setError(`User profile not found for UID ${uid}. This UID doesn't exist in our database yet.`);
      } else {
        setError(err.message || 'Failed to load user data');
      }
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async () => {
    if (!uidInput.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const newUser = await genshinAPI.createUser({
        uid: parseInt(uidInput)
      });
      
      setUserUID(uidInput);
      await loadUserData(uidInput);
    } catch (err: any) {
      setError(err.message || 'Failed to create user profile');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    if (userUID) {
      loadUserData(userUID);
    }
  };

  const goToHomePage = () => {
    setUserData(null);
    setCharacters([]);
    setUserUID('');
    setUidInput('');
    setError(null);
    setLoading(false);
    setShowCharacterDrawer(false);
    setShowProfileDropdown(false);
  };

  const handleUIDSubmit = () => {
    if (uidInput) {
      loadUserData(uidInput);
    }
  };

  // Element color utilities
  const getElementColors = (element: string) => {
    switch (element?.toLowerCase()) {
      case 'pyro':
        return {
          gradient: 'from-red-500 to-orange-500',
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          accent: 'bg-red-500/20',
          hover: 'hover:bg-red-100'
        };
      case 'hydro':
        return {
          gradient: 'from-blue-500 to-cyan-500',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          accent: 'bg-blue-500/20',
          hover: 'hover:bg-blue-100'
        };
      case 'anemo':
        return {
          gradient: 'from-teal-400 to-cyan-400',
          bg: 'bg-teal-50',
          border: 'border-teal-200',
          text: 'text-teal-700',
          accent: 'bg-teal-500/20',
          hover: 'hover:bg-teal-100'
        };
      case 'electro':
        return {
          gradient: 'from-purple-500 to-violet-500',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          accent: 'bg-purple-500/20',
          hover: 'hover:bg-purple-100'
        };
      case 'dendro':
        return {
          gradient: 'from-green-500 to-emerald-500',
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          accent: 'bg-green-500/20',
          hover: 'hover:bg-green-100'
        };
      case 'cryo':
        return {
          gradient: 'from-cyan-400 to-blue-400',
          bg: 'bg-cyan-50',
          border: 'border-cyan-200',
          text: 'text-cyan-700',
          accent: 'bg-cyan-500/20',
          hover: 'hover:bg-cyan-100'
        };
      case 'geo':
        return {
          gradient: 'from-yellow-600 to-amber-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-700',
          accent: 'bg-yellow-500/20',
          hover: 'hover:bg-yellow-100'
        };
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          accent: 'bg-gray-500/20',
          hover: 'hover:bg-gray-100'
        };
    }
  };

  const handleCharacterDetailsClick = (character: CharacterResponse) => {
    setSelectedCharacterDetails(character);
    setShowCharacterDetailsInDrawer(true);
  };

  const handleBackToCharacterList = () => {
    setShowCharacterDetailsInDrawer(false);
    setSelectedCharacterDetails(null);
  };

  const handleCloseCharacterDrawer = () => {
    setShowCharacterDrawer(false);
    setShowCharacterDetailsInDrawer(false);
    setSelectedCharacterDetails(null);
  };

  // Welcome screen when no user is loaded
  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pure-white via-cream-white to-light-gray relative overflow-hidden">
        {/* Animated Background Blob */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-[800px] h-[800px] rounded-full opacity-20 blur-3xl animate-blob-move bg-gradient-to-r from-lime-accent via-info-blue to-success-green"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-3xl animate-blob-move-delayed bg-gradient-to-r from-purple-accent via-soft-orange to-lime-accent" style={{ animationDelay: '2s' }}></div>
          <div className="absolute w-[700px] h-[700px] rounded-full opacity-10 blur-3xl animate-blob-move-slow bg-gradient-to-r from-success-green via-info-blue to-purple-accent" style={{ animationDelay: '4s' }}></div>
        </div>
        
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-soft-lime rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-soft-blue rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-soft-green rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-lime rounded-3xl mb-10 border-4 border-white/50 backdrop-blur-sm">
              <img 
                src="/CodexLogo.png" 
                alt="Codex Logo" 
                className="w-26 h-26 object-contain"
              />
            </div>
            
            <h1 className="text-7xl font-black mb-8 leading-tight">
              <span className="block text-dark-charcoal">Codex - Genshin Impact</span>
              <span className="block bg-gradient-to-r from-lime-accent via-info-blue to-success-green bg-clip-text text-transparent">
                AI Assistant
              </span>
            </h1>
            
            <p className="text-2xl text-dark-charcoal/80 max-w-4xl mx-auto leading-relaxed font-medium">
              Your ultimate companion for character optimization, team building, and exploration mastery in Teyvat
            </p>
            
            <div className="flex justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-soft-lime rounded-full">
                <div className="w-2 h-2 bg-lime-accent rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-dark-charcoal">AI-Powered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-soft-blue rounded-full">
                <div className="w-2 h-2 bg-info-blue rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-dark-charcoal">Real-time Data</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-soft-green rounded-full">
                <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-dark-charcoal">Free to Use</span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid lg:grid-cols-3 gap-10 mb-20">
            {/* AI Assistant Card */}
            <Card className="group relative bg-gradient-lime border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:rotate-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-accent/20 to-transparent"></div>
              <CardContent className="relative p-12 text-center">
                <div className="w-24 h-24 bg-dark-charcoal rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <MessageSquare className="h-12 w-12 text-lime-accent" />
                </div>
                <h3 className="text-3xl font-bold text-dark-charcoal mb-6">AI Assistant</h3>
                <p className="text-dark-charcoal/90 leading-relaxed text-lg font-medium">
                  Advanced AI-powered recommendations for character builds, team synergies, and strategic gameplay optimization
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="px-6 py-2 bg-dark-charcoal/10 rounded-full">
                    <span className="text-sm font-bold text-dark-charcoal">Most Popular</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Damage Calculator Card */}
            <Card className="group relative bg-gradient-to-br from-dark-charcoal to-dark-charcoal/90 border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:-rotate-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-accent/10 to-transparent"></div>
              <CardContent className="relative p-12 text-center">
                <div className="w-24 h-24 bg-lime-accent rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Calculator className="h-12 w-12 text-dark-charcoal" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">Damage Calculator</h3>
                <p className="text-white/95 leading-relaxed text-lg font-medium">
                  Precise damage calculations with artifact optimization, weapon comparisons, and build performance analysis
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="px-6 py-2 bg-lime-accent/20 rounded-full">
                    <span className="text-sm font-bold text-white">Advanced Tools</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Map Card */}
            <Card className="group relative bg-gradient-to-br from-cream-white to-light-gray shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 hover:rotate-1 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-accent/5 to-transparent"></div>
              <CardContent className="relative p-12 text-center">
                <div className="w-24 h-24 bg-gradient-lime rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <Map className="h-12 w-12 text-dark-charcoal" />
                </div>
                <h3 className="text-3xl font-bold text-dark-charcoal mb-6">Interactive Map</h3>
                <p className="text-dark-charcoal/90 leading-relaxed text-lg font-medium">
                  Comprehensive exploration tools with resource tracking, route optimization, and achievement guides
                </p>
                <div className="mt-8 flex justify-center">
                  <div className="px-6 py-2 bg-lime-accent/20 rounded-full">
                    <span className="text-sm font-bold text-dark-charcoal">Exploration</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          
          {/* Setup Guide Section */}
          <div className="max-w-6xl mx-auto mb-20">
            <Card className="relative bg-gradient-to-br from-white via-cream-white to-light-gray border-2 border-info-blue/30 shadow-3xl backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-info-blue via-lime-accent via-success-green to-purple-accent"></div>
              
              <CardHeader className="text-center pb-8 pt-12">
                <div className="w-20 h-20 bg-gradient-to-br from-info-blue to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <User className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-4xl font-bold text-dark-charcoal mb-6">Setup Guide</CardTitle>
                <CardDescription className="text-xl text-dark-charcoal/80 leading-relaxed max-w-3xl mx-auto">
                  Follow these steps to showcase your characters and enable data fetching from the Enka API
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-12 pb-12">
                <div className="grid lg:grid-cols-2 gap-12">
                  {/* In-Game Setup */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-lime-accent to-success-green rounded-xl flex items-center justify-center shadow-lg">
                        <Sword className="h-6 w-6 text-dark-charcoal" />
                      </div>
                      <h3 className="text-2xl font-bold text-dark-charcoal">In-Game Character Showcase</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-lime rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-dark-charcoal font-bold text-sm">1</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-dark-charcoal mb-2">Open Genshin Impact</h4>
                          <p className="text-dark-charcoal/80 text-sm leading-relaxed">
                            Launch the game and log into your account
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-lime rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-dark-charcoal font-bold text-sm">2</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-dark-charcoal mb-2">Access Character Showcase</h4>
                          <p className="text-dark-charcoal/80 text-sm leading-relaxed">
                            Go to <strong>Profile → Character Showcase</strong> or press <strong>F2</strong> then click on "Character Showcase"
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-lime rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-dark-charcoal font-bold text-sm">3</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-dark-charcoal mb-2">Add Your Characters</h4>
                          <p className="text-dark-charcoal/80 text-sm leading-relaxed">
                            Click the <strong>"+"</strong> button to add characters you want to showcase. You can add up to <strong>12 characters</strong>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-lime rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-dark-charcoal font-bold text-sm">4</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-dark-charcoal mb-2">Make Profile Public</h4>
                          <p className="text-dark-charcoal/80 text-sm leading-relaxed">
                            Ensure your profile is set to <strong>"Show Character Details"</strong> so the API can access your character data
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-lime rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-dark-charcoal font-bold text-sm">5</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-dark-charcoal mb-2">Save Changes</h4>
                          <p className="text-dark-charcoal/80 text-sm leading-relaxed">
                            Click <strong>"Save"</strong> to apply your character showcase settings
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enka Network Setup */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-dark-charcoal">Enka Network Account</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white font-bold text-sm">1</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-dark-charcoal mb-2">Visit Enka Network</h4>
                          <p className="text-dark-charcoal/80 text-sm leading-relaxed">
                            Go to <a href="https://enka.network" target="_blank" rel="noopener noreferrer" className="text-info-blue hover:text-info-blue/80 underline font-medium">enka.network</a> in your web browser
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white font-bold text-sm">2</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-dark-charcoal mb-2">Enter Your UID</h4>
                          <p className="text-dark-charcoal/80 text-sm leading-relaxed">
                            Input your 9-digit Genshin Impact UID in the search box and press Enter
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white font-bold text-sm">3</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-dark-charcoal mb-2">Verify Data Sync</h4>
                          <p className="text-dark-charcoal/80 text-sm leading-relaxed">
                            Check that your showcased characters appear correctly on Enka Network
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white font-bold text-sm">4</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-dark-charcoal mb-2">Wait for Updates</h4>
                          <p className="text-dark-charcoal/80 text-sm leading-relaxed">
                            Data updates when you log out of Genshin Impact. Allow a few minutes for changes to reflect
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Important Notes */}
                <div className="mt-12 space-y-6">
                  <div className="bg-gradient-to-r from-soft-blue/20 via-soft-blue/10 to-soft-blue/20 border-2 border-info-blue/40 rounded-2xl p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-info-blue to-cyan-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-dark-charcoal mb-3 text-lg">Important Notes</h4>
                        <ul className="text-dark-charcoal/80 text-sm space-y-2">
                          <li className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-info-blue rounded-full mt-2 flex-shrink-0"></div>
                            <span><strong>Data Privacy:</strong> Only characters in your showcase are visible to the API - your private data remains secure</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-info-blue rounded-full mt-2 flex-shrink-0"></div>
                            <span><strong>Update Frequency:</strong> Character data refreshes when you log out of Genshin Impact</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-info-blue rounded-full mt-2 flex-shrink-0"></div>
                            <span><strong>Character Limit:</strong> You can showcase up to 12 characters at a time in-game</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-info-blue rounded-full mt-2 flex-shrink-0"></div>
                            <span><strong>Manual Addition:</strong> Use our hybrid system to add characters not in your showcase</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-soft-green/20 via-soft-green/10 to-soft-green/20 border-2 border-success-green/40 rounded-2xl p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-success-green to-emerald-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-dark-charcoal mb-3 text-lg">Why This Setup?</h4>
                        <p className="text-dark-charcoal/80 text-sm leading-relaxed">
                          We use the Enka Network API to fetch your character data automatically. This ensures you get accurate, 
                          real-time information about your builds, artifacts, and stats without manual input. The character showcase 
                          feature allows you to control which characters are visible while keeping your account secure.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-3xl mx-auto" ref={startJourneyRef}>
            <Card className="relative bg-gradient-to-br from-cream-white via-white to-light-gray border-2 border-lime-accent/30 shadow-3xl backdrop-blur-sm overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-accent via-info-blue via-success-green to-purple-accent"></div>
              
              <CardHeader className="text-center pb-8 pt-12">
                <div className="w-20 h-20 bg-gradient-lime rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <Search className="h-10 w-10 text-dark-charcoal" />
                </div>
                <CardTitle className="text-4xl font-bold text-dark-charcoal mb-6">Start Your Journey</CardTitle>
                <CardDescription className="text-xl text-dark-charcoal/80 leading-relaxed">
                  Enter your Genshin Impact UID to unlock personalized features and begin optimizing your gameplay
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-12 pb-12">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Input
                    type="number"
                    placeholder="Enter your UID (e.g., 123456789)"
                    value={uidInput}
                    onChange={(e) => setUidInput(e.target.value)}
                    className="flex-1 h-16 text-xl border-3 border-lime-accent/40 focus:border-lime-accent focus:ring-lime-accent focus:ring-4 bg-white text-dark-charcoal placeholder:text-dark-charcoal/50 rounded-2xl shadow-lg font-medium"
                  />
                  <Button 
                    onClick={handleUIDSubmit}
                    disabled={loading}
                    className="h-16 px-10 bg-gradient-lime hover:bg-gradient-to-r hover:from-lime-accent/90 hover:to-lime-accent text-dark-charcoal font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 rounded-2xl border-2 border-lime-accent/20"
                  >
                    {loading ? (
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 border-3 border-dark-charcoal border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </div>
                    ) : (
                      <>
                        <Search className="h-6 w-6 mr-4" />
                        Begin Adventure
                      </>
                    )}
                  </Button>
                </div>
                
                {error && (
                  <div className="mt-8 p-8 bg-gradient-to-r from-soft-orange/20 via-soft-orange/10 to-soft-orange/20 border-2 border-soft-orange/40 rounded-2xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-soft-orange to-warning-orange rounded-full flex items-center justify-center shadow-lg">
                        <X className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-dark-charcoal font-bold text-xl mb-2">
                          {error}
                        </p>
                        {error.includes('not found') && (
                          <p className="text-dark-charcoal/70 text-sm">
                            Don't worry! We can create a new profile for your UID and start tracking your Genshin Impact data.
                          </p>
                        )}
                      </div>
                    </div>
                    {error.includes('not found') && (
                      <div className="space-y-4">
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-lime-accent/20">
                          <h4 className="font-bold text-dark-charcoal mb-3 flex items-center gap-2">
                            <img 
                              src="/CodexLogo.png" 
                              alt="Codex Logo" 
                              className="w-5 h-5 object-contain"
                            />
                            What happens when you create a profile?
                          </h4>
                          <ul className="text-dark-charcoal/80 text-sm space-y-2">
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-lime-accent rounded-full"></div>
                              Your UID will be registered in our system
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-lime-accent rounded-full"></div>
                              We'll fetch your public profile data from Genshin Impact
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-lime-accent rounded-full"></div>
                              You'll get access to all AI assistant features
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-lime-accent rounded-full"></div>
                              Character analysis and optimization tools will be available
                            </li>
                          </ul>
                        </div>
                        <Button 
                          onClick={createUserProfile}
                          disabled={loading}
                          className="w-full h-16 bg-gradient-lime hover:bg-gradient-to-r hover:from-lime-accent/90 hover:to-lime-accent text-dark-charcoal font-bold text-xl shadow-xl rounded-xl border-2 border-lime-accent/20 transition-all duration-300 transform hover:scale-105"
                        >
                          {loading ? (
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 border-3 border-dark-charcoal border-t-transparent rounded-full animate-spin" />
                              Creating Profile...
                            </div>
                          ) : (
                            <>
                              <User className="h-6 w-6 mr-4" />
                              Create New Profile for UID {uidInput}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-lime rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-dark-charcoal" />
              </div>
              <h4 className="text-4xl font-black text-dark-charcoal mb-3">50K+</h4>
              <p className="text-dark-charcoal/70 font-semibold text-lg">Active Users</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-dark-charcoal rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Trophy className="h-10 w-10 text-lime-accent" />
              </div>
              <h4 className="text-4xl font-black text-dark-charcoal mb-3">1M+</h4>
              <p className="text-dark-charcoal/70 font-semibold text-lg">Builds Created</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-lime rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Star className="h-10 w-10 text-dark-charcoal" />
              </div>
              <h4 className="text-4xl font-black text-dark-charcoal mb-3">4.9/5</h4>
              <p className="text-dark-charcoal/70 font-semibold text-lg">User Rating</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-dark-charcoal rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10 text-lime-accent" />
              </div>
              <h4 className="text-4xl font-black text-dark-charcoal mb-3">24/7</h4>
              <p className="text-dark-charcoal/70 font-semibold text-lg">Support</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-cream-white to-light-gray">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={goToHomePage}
                title="Go to Home"
              >
                <img 
                  src="/CodexLogo.png" 
                  alt="Codex Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-dark-charcoal via-lime-accent to-dark-charcoal bg-clip-text text-transparent">
                  Codex
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-dark-charcoal">UID: {userData.profile_data?.uid || userData.uid}</p>
                  <button
                    onClick={goToHomePage}
                    className="text-xs text-lime-accent hover:text-lime-accent/80 underline transition-colors"
                    title="Change UID"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <Button
                onClick={refreshData}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 border-lime-accent/30 text-dark-charcoal hover:bg-lime-accent/10 hover:border-lime-accent"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              {/* Character Button */}
              <Button
                onClick={() => setShowCharacterDrawer(true)}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 border-lime-accent/30 text-dark-charcoal hover:bg-lime-accent/10 hover:border-lime-accent"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Characters</span>
              </Button>

              {/* User Info */}
              <div className="flex items-center gap-3 relative profile-dropdown-container">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium text-dark-charcoal">
                    {userData.profile_data?.nickname || userData.nickname}
                  </p>
                  <p className="text-xs text-dark-charcoal">
                    AR {userData.profile_data?.level || userData.level}
                  </p>
                </div>
                <div 
                  className="w-12 h-12 bg-dark-charcoal rounded-full flex items-center justify-center shadow-lg overflow-hidden border-2 border-lime-accent/20 cursor-pointer hover:border-lime-accent/40 transition-colors"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  {userData.profile_data?.profilePicture?.icon ? (
                    <img
                      src={userData.profile_data.profilePicture.icon}
                      alt={`${userData.profile_data?.nickname || userData.nickname || 'User'}'s profile`}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        // Fallback to User icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <User className={`fallback-icon h-6 w-6 text-white ${userData.profile_data?.profilePicture?.icon ? 'hidden' : ''}`} />
                </div>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-dark-charcoal to-dark-charcoal/90 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-lime-accent to-success-green rounded-xl flex items-center justify-center shadow-lg overflow-hidden border-2 border-lime-accent/30">
                          {userData.profile_data?.profilePicture?.icon ? (
                            <img
                              src={userData.profile_data.profilePicture.icon}
                              alt={`${userData.profile_data?.nickname || userData.nickname || 'User'}'s profile`}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                                if (fallback) fallback.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <User className={`fallback-icon h-6 w-6 text-dark-charcoal ${userData.profile_data?.profilePicture?.icon ? 'hidden' : ''}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-lime-accent">
                            {userData.profile_data?.nickname || userData.nickname || 'Unknown Player'}
                          </h3>
                          <div className="flex items-center gap-2 text-lime-accent/80 text-sm">
                            <span>UID: {userData.profile_data?.uid || userData.uid}</span>
                            <span>•</span>
                            <span>AR {userData.profile_data?.level || userData.level}</span>
                            <span>•</span>
                            <span>WL {userData.stats?.world_level || userData.profile_data?.worldLevel || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-3 bg-lime-accent/10 rounded-lg border border-lime-accent/20">
                          <div className="text-lg font-bold text-dark-charcoal">
                            {userData.achievements || userData.profile_data?.finishAchievementNum || 0}
                          </div>
                          <div className="text-xs text-dark-charcoal/70">Achievements</div>
                        </div>
                        <div className="text-center p-3 bg-lime-accent/10 rounded-lg border border-lime-accent/20">
                          <div className="text-lg font-bold text-dark-charcoal">
                            {userData.character_count || characters.length}
                          </div>
                          <div className="text-xs text-dark-charcoal/70">Characters</div>
                        </div>
                        <div className="text-center p-3 bg-lime-accent/10 rounded-lg border border-lime-accent/20">
                          <div className="text-lg font-bold text-dark-charcoal">
                            {userData.profile_data?.towerFloorIndex || userData.spiral_abyss?.floor || 0}-{userData.profile_data?.towerLevelIndex || userData.spiral_abyss?.chamber || 0}
                          </div>
                          <div className="text-xs text-dark-charcoal/70">Abyss</div>
                        </div>
                        <div className="text-center p-3 bg-lime-accent/10 rounded-lg border border-lime-accent/20">
                          <div className="text-lg font-bold text-dark-charcoal">
                            {userData.profile_data?.nameCardId || userData.stats?.name_card_id || 0}
                          </div>
                          <div className="text-xs text-dark-charcoal/70">Name Card</div>
                        </div>
                      </div>

                      {/* Player Signature */}
                      {(userData.profile_data?.signature || userData.signature) && (
                        <div className="p-3 bg-gradient-to-r from-lime-accent/10 via-success-green/10 to-lime-accent/10 rounded-lg border border-lime-accent/20">
                          <div className="text-xs font-medium text-dark-charcoal/70 mb-1">Player Signature</div>
                          <div className="italic text-dark-charcoal font-medium">
                            "{userData.profile_data?.signature || userData.signature}"
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="ai-assistant" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-cream-white/90 backdrop-blur-sm p-1 rounded-xl border border-gray-200 shadow-lg">
            <TabsTrigger 
              value="ai-assistant" 
              className="flex items-center gap-2 text-dark-charcoal rounded-lg transition-all duration-200"
            >
              <MessageCircle className="h-4 w-4" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger 
              value="damage-calculator" 
              className="flex items-center gap-2 text-dark-charcoal rounded-lg transition-all duration-200"
            >
              <Calculator className="h-4 w-4" />
              Damage Calculator
            </TabsTrigger>
            <TabsTrigger 
              value="interactive-map" 
              className="flex items-center gap-2 text-dark-charcoal rounded-lg transition-all duration-200"
            >
              <Map className="h-4 w-4" />
              Interactive Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-assistant" className="space-y-6">
            <AIAssistantSection userUID={userData.profile_data?.uid || userData.uid || 0} userData={userData} />
          </TabsContent>

          <TabsContent value="damage-calculator" className="space-y-6">
            <DamageCalculatorSection userUID={userData.profile_data?.uid || userData.uid || 0} characters={characters} />
          </TabsContent>

          <TabsContent value="interactive-map" className="space-y-6">
            <ExplorationMapSection userUID={userData.profile_data?.uid || userData.uid || 0} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Character Drawer */}
      {showCharacterDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-[80%] bg-cream-white/98 backdrop-blur-md shadow-2xl overflow-y-auto border-r border-gray-200">
            <div className="sticky top-0 bg-cream-white/95 backdrop-blur-md border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {selectedCharacterDetails && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBackToCharacterList}
                    className="border-gray-300 text-dark-charcoal hover:bg-gray-100"
                    >
                    <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                <h2 className="text-lg font-semibold bg-gradient-to-r from-dark-charcoal via-lime-accent to-dark-charcoal bg-clip-text text-transparent">
                  {selectedCharacterDetails ? `${selectedCharacterDetails.name} Details` : `Your Characters (${characters.length})`}
                    </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseCharacterDrawer}
                className="border-gray-300 text-dark-charcoal hover:bg-gray-100"
                >
                <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="p-6">
              {selectedCharacterDetails ? (
                // Character Details View
                <>
                    {/* Character Header */}
                    <div className="mb-8">
                    <div className="flex items-center gap-6 mb-6">
                      {selectedCharacterDetails.icon_url && (
                            <img 
                              src={selectedCharacterDetails.icon_url} 
                              alt={selectedCharacterDetails.name}
                          className="w-24 h-24 rounded-xl border-2 border-lime-accent shadow-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                      )}
                        <div className="flex-1">
                        <h3 className="text-3xl font-bold text-dark-charcoal mb-2">{selectedCharacterDetails.name}</h3>
                        <div className="flex items-center gap-4 mb-3">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getElementColors(selectedCharacterDetails.element).bg} border border-gray-200`}>
                            <div className={`w-3 h-3 rounded-full ${getElementColors(selectedCharacterDetails.element).bg}`}></div>
                            <span className={`text-sm font-medium ${getElementColors(selectedCharacterDetails.element).text}`}>
                              {selectedCharacterDetails.element}
                            </span>
                          </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: selectedCharacterDetails.rarity }, (_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center p-3 bg-lime-accent/10 rounded-lg border border-lime-accent/30">
                            <div className="font-bold text-dark-charcoal">Level {selectedCharacterDetails.level}</div>
                            <div className="text-dark-charcoal/70">Character</div>
                        </div>
                          <div className="text-center p-3 bg-lime-accent/10 rounded-lg border border-lime-accent/30">
                            <div className="font-bold text-dark-charcoal">C{selectedCharacterDetails.constellation}</div>
                            <div className="text-dark-charcoal/70">Constellation</div>
                          </div>
                          <div className="text-center p-3 bg-lime-accent/10 rounded-lg border border-lime-accent/30">
                            <div className="font-bold text-dark-charcoal">{selectedCharacterDetails.friendship}</div>
                            <div className="text-dark-charcoal/70">Friendship</div>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>

                    {/* Character Stats */}
                    {selectedCharacterDetails.stats && (
                      <div className="mb-8">
                        <h4 className="text-xl font-bold text-dark-charcoal mb-4 flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-lime-accent" />
                        Character Statistics
                        </h4>
                        
                      {/* Combined Main Stats and Critical Stats */}
                        <div className="mb-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                            {/* HP */}
                          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="text-xl font-black text-emerald-700 mb-1">
                                {Math.round(selectedCharacterDetails.stats.max_hp || selectedCharacterDetails.stats.hp || 0).toLocaleString()}
                              </div>
                              <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-full">Max HP</div>
                          </div>
                            
                            {/* ATK */}
                          <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="text-xl font-black text-red-700 mb-1">
                                {Math.round(selectedCharacterDetails.stats.atk || 0).toLocaleString()}
                              </div>
                              <div className="text-xs font-bold text-red-800 bg-red-100 px-2 py-1 rounded-full">ATK</div>
                          </div>
                            
                            {/* DEF */}
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="text-xl font-black text-blue-700 mb-1">
                                {Math.round(selectedCharacterDetails.stats.def || 0).toLocaleString()}
                              </div>
                              <div className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded-full">Max DEF</div>
                          </div>
                            
                            {/* Elemental Mastery */}
                          <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200 shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="text-xl font-black text-violet-700 mb-1">
                                {Math.round(selectedCharacterDetails.stats.elemental_mastery || 0)}
                              </div>
                              <div className="text-xs font-bold text-violet-800 bg-violet-100 px-2 py-1 rounded-full">Elemental Mastery</div>
                          </div>

                            {/* Crit Rate */}
                          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="text-xl font-black text-orange-700 mb-1">
                                  {(selectedCharacterDetails.stats.crit_rate || 0).toFixed(1)}%
                                </div>
                                <div className="text-xs font-bold text-orange-800 bg-orange-100 px-2 py-1 rounded-full">Crit Rate</div>
                          </div>
                            
                            {/* Crit DMG */}
                          <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200 shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="text-xl font-black text-pink-700 mb-1">
                                  {(selectedCharacterDetails.stats.crit_dmg || 0).toFixed(1)}%
                                </div>
                                <div className="text-xs font-bold text-pink-800 bg-pink-100 px-2 py-1 rounded-full">Crit DMG</div>
                          </div>
                            
                            {/* Energy Recharge */}
                          <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl border border-cyan-200 shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="text-xl font-black text-cyan-700 mb-1">
                                {(selectedCharacterDetails.stats.energy_recharge || 0).toFixed(1)}%
                                </div>
                              <div className="text-xs font-bold text-cyan-800 bg-cyan-100 px-2 py-1 rounded-full">Energy Recharge</div>
                          </div>
                            
                            {/* Crit Ratio */}
                          <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
                                <div className="text-xl font-black text-slate-700 mb-1">
                                  1:{((selectedCharacterDetails.stats.crit_dmg || 0) / (selectedCharacterDetails.stats.crit_rate || 1)).toFixed(1)}
                                </div>
                                <div className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-full">Crit Ratio</div>
                          </div>
                          </div>
                        </div>

                        {/* Artifacts - Moved here after Critical Stats */}
                        {selectedCharacterDetails.artifacts && selectedCharacterDetails.artifacts.length > 0 && (
                          <div className="mb-6">
                            <h5 className="text-lg font-semibold text-dark-charcoal mb-3 flex items-center gap-2">
                              <Shield className="h-5 w-5" />
                              Artifacts ({selectedCharacterDetails.artifacts.length})
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {selectedCharacterDetails.artifacts.map((artifact, index) => (
                                <Card key={index} className="bg-gradient-to-br from-white to-cream-white border-2 border-lime-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                      <img
                                        src={artifact.icon}
                                        alt={artifact.type}
                                        className="w-12 h-12 rounded-lg border-2 border-lime-accent/30 shadow-md"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <span className="font-bold text-dark-charcoal capitalize text-sm">{artifact.type}</span>
                                          <div className="flex items-center gap-1">
                                            <span className="text-sm font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">+{Math.min(artifact.level || 0, 20)}</span>
                                            <div className="flex">
                                              {Array.from({ length: artifact.rarity }, (_, i) => (
                                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-xs text-dark-charcoal/70 font-medium mt-1">
                                          {artifact.setName}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      <div className="p-3 bg-gradient-to-r from-lime-accent/10 to-success-green/10 rounded-lg border border-lime-accent/20">
                                        <div className="text-xs font-semibold text-dark-charcoal/70 mb-1">Main Stat</div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-sm font-medium text-dark-charcoal">{artifact.mainStat?.name}</span>
                                          <span className="text-sm font-bold text-success-green">+{artifact.mainStat?.value}</span>
                                        </div>
                                      </div>
                                      
                                      {artifact.subStats && artifact.subStats.length > 0 && (
                                        <div>
                                          <div className="text-xs font-semibold text-dark-charcoal/70 mb-2">Sub Stats</div>
                                          <div className="space-y-2">
                                            {artifact.subStats.map((subStat, subIndex) => (
                                              <div key={subIndex} className="flex justify-between items-center p-2 bg-white/80 rounded-lg border border-lime-accent/10 shadow-sm">
                                                <span className="text-xs font-medium text-dark-charcoal">{subStat.name}</span>
                                                <span className="text-xs font-bold text-success-green">+{subStat.value}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Damage Bonuses */}
                        <div className="mb-6">
                          <h5 className="text-lg font-semibold text-dark-charcoal mb-3">Damage Bonuses</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Element DMG Bonus */}
                            {selectedCharacterDetails.stats && ['pyro', 'hydro', 'anemo', 'electro', 'dendro', 'cryo', 'geo', 'physical'].map((element) => {
                              const dmgBonus = selectedCharacterDetails.stats![`${element}_dmg_bonus`] || 0;
                              if (dmgBonus > 0) {
                                const elementColors = getElementColors(element);
                                return (
                                <Card key={element} className="bg-white/90 border border-gray-200 shadow-sm">
                                    <CardContent className="p-4 text-center">
                                      <div className={`text-lg font-bold ${elementColors.text}`}>
                                        {dmgBonus.toFixed(1)}%
                                      </div>
                                      <div className="text-sm text-gray-600 capitalize">{element} DMG</div>
                                    </CardContent>
                                  </Card>
                                );
                              }
                              return null;
                            })}
                            
                            {/* Healing Bonus */}
                            {selectedCharacterDetails.stats && (selectedCharacterDetails.stats.healing_bonus || 0) > 0 && (
                            <Card className="bg-white/90 border border-gray-200 shadow-sm">
                                <CardContent className="p-4 text-center">
                                  <div className="text-lg font-bold text-emerald-600">
                                    {(selectedCharacterDetails.stats.healing_bonus || 0).toFixed(1)}%
                                  </div>
                                  <div className="text-sm text-gray-600">Healing Bonus</div>
                                </CardContent>
                              </Card>
                            )}
                            
                            {/* Incoming Healing Bonus */}
                            {selectedCharacterDetails.stats && (selectedCharacterDetails.stats.incoming_healing_bonus || 0) > 0 && (
                            <Card className="bg-white/90 border border-gray-200 shadow-sm">
                                <CardContent className="p-4 text-center">
                                  <div className="text-lg font-bold text-green-600">
                                    {(selectedCharacterDetails.stats.incoming_healing_bonus || 0).toFixed(1)}%
                                  </div>
                                  <div className="text-sm text-gray-600">Incoming Healing</div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        </div>

                        {/* Weapon Details */}
                        {selectedCharacterDetails.weapon && (
                          <div className="mb-8">
                            <h4 className="text-xl font-bold text-dark-charcoal mb-4 flex items-center gap-2">
                              <Sword className="h-5 w-5 text-lime-accent" />
                              Weapon
                            </h4>
                          <Card className="bg-white/90 border border-gray-200 shadow-sm">
                              <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                  {selectedCharacterDetails.weapon.icon && (
                                    <img 
                                      src={selectedCharacterDetails.weapon.icon} 
                                      alt={selectedCharacterDetails.weapon.name}
                                      className="w-16 h-16 rounded-lg border border-gray-200"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h5 className="text-lg font-bold text-dark-charcoal">{selectedCharacterDetails.weapon.name}</h5>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center gap-1">
                                        {Array.from({ length: selectedCharacterDetails.weapon.rarity }, (_, i) => (
                                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-600">{selectedCharacterDetails.weapon.weaponType}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-lg font-bold text-dark-charcoal">{selectedCharacterDetails.weapon.level}</div>
                                    <div className="text-sm text-gray-600">Level</div>
                                  </div>
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-lg font-bold text-dark-charcoal">R{selectedCharacterDetails.weapon.refinement}</div>
                                    <div className="text-sm text-gray-600">Refinement</div>
                                  </div>
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-lg font-bold text-dark-charcoal">{selectedCharacterDetails.weapon.baseAttack}</div>
                                    <div className="text-sm text-gray-600">Base ATK</div>
                                  </div>
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-lg font-bold text-dark-charcoal">{selectedCharacterDetails.weapon.ascension}</div>
                                    <div className="text-sm text-gray-600">Ascension</div>
                                  </div>
                                </div>
                                
                                {selectedCharacterDetails.weapon.subStat && (
                                  <div className="mt-4 p-3 bg-lime-accent/10 rounded-lg border border-lime-accent/30">
                                    <div className="text-sm font-medium text-dark-charcoal">
                                      {selectedCharacterDetails.weapon.subStat.name}: {selectedCharacterDetails.weapon.subStat.value}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Talents */}
                        {selectedCharacterDetails.talents && selectedCharacterDetails.talents.length > 0 && (
                          <div className="mb-8">
                            <h4 className="text-xl font-bold text-dark-charcoal mb-4 flex items-center gap-2">
                              <Crown className="h-5 w-5 text-lime-accent" />
                              Talents & Constellations
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Skills */}
                            <Card className="bg-gradient-to-br from-white to-cream-white border-2 border-lime-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                              <CardHeader className="bg-gradient-to-r from-lime-accent/10 to-success-green/10 border-b border-lime-accent/20">
                                <CardTitle className="text-lg font-bold text-dark-charcoal">Skills</CardTitle>
                                </CardHeader>
                              <CardContent className="p-6">
                                  <div className="space-y-3">
                                    {selectedCharacterDetails.talents
                                      .filter(talent => talent.type === 'skill')
                                      .map((talent, index) => (
                                      <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-lime-accent/10 to-success-green/10 rounded-xl border border-lime-accent/20 shadow-sm">
                                        <span className="text-sm font-semibold text-dark-charcoal">
                                            {index === 0 ? 'Normal Attack' : index === 1 ? 'Elemental Skill' : 'Elemental Burst'}
                                          </span>
                                        <span className="font-bold text-info-blue text-lg bg-white px-3 py-1 rounded-full shadow-sm">Level {talent.level}</span>
                                        </div>
                                      ))}
                                  </div>
                                </CardContent>
                              </Card>
                              
                              {/* Constellations */}
                            <Card className="bg-gradient-to-br from-white to-cream-white border-2 border-lime-accent/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                              <CardHeader className="bg-gradient-to-r from-lime-accent/10 to-success-green/10 border-b border-lime-accent/20">
                                <CardTitle className="text-lg font-bold text-dark-charcoal">Constellations</CardTitle>
                                </CardHeader>
                              <CardContent className="p-6">
                                <div className="text-center p-6 bg-gradient-to-br from-lime-accent/5 to-success-green/5 rounded-xl border border-lime-accent/20">
                                  <div className={`text-5xl font-black ${getElementColors(selectedCharacterDetails.element).text} mb-3 drop-shadow-lg`}>
                                      C{selectedCharacterDetails.constellation}
                                    </div>
                                  <div className="text-sm font-semibold text-dark-charcoal bg-white px-4 py-2 rounded-full shadow-sm">
                                      {selectedCharacterDetails.constellation === 0 ? 'No Constellations' :
                                       selectedCharacterDetails.constellation === 6 ? 'Max Constellations' :
                                       `${selectedCharacterDetails.constellation} Constellation${selectedCharacterDetails.constellation > 1 ? 's' : ''}`}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  // Character List View
                  <>
                    {characters.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {characters.map((character, index) => {
                          const elementColors = getElementColors(character.element);
                          return (
                            <Card 
                              key={character.id || index} 
                              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl ${elementColors.bg} ${elementColors.border} border-2 ${elementColors.hover}`}
                              onClick={() => handleCharacterDetailsClick(character)}
                            >
                              <CardContent className="p-6">
                                <div className="text-center">
                                  {/* Character Icon */}
                                  <div className="relative mb-4">
                                    {character.icon_url && (
                                      <img
                                        src={character.icon_url}
                                        alt={character.name}
                                        className="w-20 h-20 mx-auto rounded-xl border-2 border-white shadow-lg"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    )}
                                    {/* Element Badge */}
                                    <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full ${elementColors.gradient} bg-gradient-to-br flex items-center justify-center shadow-lg border-2 border-white`}>
                                      <span className="text-xs font-bold text-white">
                                        {character.element}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Character Name */}
                                  <h3 className={`text-lg font-bold mb-2 ${elementColors.text}`}>
                                    {character.name}
                                  </h3>

                                  {/* Rarity Stars */}
                                  <div className="flex items-center justify-center gap-1 mb-3">
                                    {Array.from({ length: character.rarity }, (_, i) => (
                                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <span className="text-xs text-gray-600 ml-1">
                                      ({character.rarity}★)
                                    </span>
                                  </div>

                                  {/* Character Stats Grid */}
                                  <div className="grid grid-cols-2 gap-3 mb-4">
                                    {/* Level & Constellation */}
                                    <div className={`p-3 rounded-lg ${elementColors.accent} border border-white/20`}>
                                      <div className={`text-lg font-bold ${elementColors.text}`}>
                                        Lv.{character.level}
                                      </div>
                                      <div className="text-xs opacity-70">Level</div>
                                    </div>
                                    <div className={`p-3 rounded-lg ${elementColors.accent} border border-white/20`}>
                                      <div className={`text-lg font-bold ${elementColors.text}`}>
                                        C{character.constellation}
                                      </div>
                                      <div className="text-xs opacity-70">Constellation</div>
                                    </div>
                                  </div>

                                  {/* Element & Weapon Info */}
                                  <div className="space-y-2 mb-4">
                                    <div className={`flex items-center justify-center gap-2 p-2 rounded-lg ${elementColors.accent} border border-white/20`}>
                                      <Shield className="h-4 w-4" />
                                      <span className={`text-sm font-medium ${elementColors.text}`}>
                                        {character.element}
                                      </span>
                                    </div>
                                    {character.weapon && (
                                      <div className={`flex items-center justify-center gap-2 p-2 rounded-lg ${elementColors.accent} border border-white/20`}>
                                        <Sword className="h-4 w-4" />
                                        <span className={`text-xs font-medium ${elementColors.text} truncate`}>
                                          {character.weapon.name}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* View Details Button */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`w-full ${elementColors.bg} ${elementColors.border} ${elementColors.text} hover:bg-white/20 border-2 font-semibold transition-all duration-200`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCharacterDetailsClick(character);
                                    }}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-lime-accent to-success-green rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                          <Users className="h-12 w-12 text-dark-charcoal" />
                        </div>
                        <h3 className="text-xl font-bold text-dark-charcoal mb-3">No Characters Found</h3>
                        <p className="text-dark-charcoal/70 max-w-md mx-auto">
                          We couldn't find any characters for your account. Make sure your profile is public and try refreshing your data.
                        </p>
                        <Button 
                          onClick={refreshData}
                          className="mt-6 bg-lime-accent hover:bg-lime-accent/90 text-dark-charcoal"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh Data
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div 
              className="flex-1 bg-dark-charcoal/30 backdrop-blur-sm"
              onClick={handleCloseCharacterDrawer}
            />
          </div>
        )}
      </div>
    );
  }

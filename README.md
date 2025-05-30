# Genshin Impact AI Assistant

A comprehensive AI-powered assistant for Genshin Impact players featuring character analysis, damage calculations, farming routes, and interactive exploration mapping.

## Features

### 🎯 Universal Character Analysis
- **Universal Damage Calculator**: Mathematical precision using actual Genshin Impact formulas that work for ANY character
- **Hybrid Character System**: Automated data for showcased characters + manual input for complete roster coverage
- **Build Efficiency Analysis**: 0-100 scale ratings with crit value calculations and optimization recommendations
- **Advanced Mathematical Analysis**: Real damage calculations with team synergy, enemy resistances, and elemental reactions

### 🗺️ Interactive Exploration Map
- **Canvas-Based Mapping**: Interactive maps with clickable regions
- **Material Locations**: Visual representation of farming spots
- **Exploration Progress**: Real-time tracking of your exploration percentage
- **Region Details**: Detailed information for each area

### 🤖 AI Chat Assistant
- **Natural Language Processing**: Ask questions in plain English
- **Contextual Responses**: Personalized advice based on your account data
- **Quick Questions**: Pre-built common questions for instant help
- **Build Recommendations**: Get specific advice for character optimization

### 📊 Universal Damage Calculator
- **Universal Formula**: Damage = Talent% × ATK × (1 + DMG%) × Crit × (1 - RES) × DEF × Reaction - works for ANY character
- **Mathematical Precision**: Uses actual Genshin Impact damage formulas with complete accuracy
- **Team Synergy Analysis**: Advanced team composition calculations with elemental reaction multipliers
- **Enemy Resistance System**: Comprehensive enemy type considerations with resistance calculations
- **Build Optimization**: Specific mathematical recommendations for damage improvement

### 🗺️ Farming Route Optimizer
- **Efficient Routes**: AI-generated optimal farming paths
- **Daily Planning**: Today's available domains and materials
- **Character Materials**: Auto-load materials needed for specific characters
- **Weekly Boss Schedule**: Plan your weekly runs effectively

### 👤 Hybrid Profile Management
- **Complete Character Coverage**: Automated data for showcased characters + manual input for full roster
- **Universal Character Support**: Works with ANY Genshin Impact character through hybrid approach
- **Comprehensive Stats**: Detailed player information, achievements, and progress tracking
- **No Character Limits**: Add ALL your characters using the hybrid automated + manual system

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Canvas Rendering**: HTML5 Canvas for interactive maps
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Genshin Impact AI Assistant Backend API (see backend setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd genshin-lm-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start the development server**
```bash
npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Backend Setup

This frontend requires the Genshin Impact AI Assistant backend API. Make sure you have the backend running on the configured URL (default: `http://localhost:8000`).

The backend provides:
- **Universal Damage Calculator**: Mathematical precision for ANY character
- **Hybrid Character System**: Automated + manual character data management
- **AI-Powered Analysis**: Advanced build optimization and recommendations
- **Complete Character Coverage**: No limits on character roster size
- **Farming Route Optimization**: Efficient material collection strategies
- **Mathematical Accuracy**: Uses actual Genshin Impact damage formulas

## Usage Guide

### Getting Started

1. **Enter your UID**: Input your 9-digit Genshin Impact UID
2. **Create/Load Profile**: The app will either load your existing profile or offer to create a new one
3. **Explore Features**: Use the tab navigation to access different features

### Universal Character Analysis

1. Navigate to the "Characters" tab
2. Use "Load All Characters (Hybrid)" for complete roster coverage
3. Select any character for universal damage calculator analysis
4. Get mathematical build analysis with 0-100 efficiency ratings
5. Review optimization recommendations with expected damage improvements

### Interactive Map

1. Go to the "Exploration" tab
2. Click on regions to view detailed information
3. Explore material locations and farming spots
4. Track your exploration progress

### AI Assistant

1. Visit the "AI Chat" tab
2. Ask questions about builds, teams, or game mechanics
3. Use quick questions for common inquiries
4. Get personalized recommendations based on your account

### Universal Damage Calculator

1. Access the "Damage Calc" tab
2. Select your main DPS character (works with ANY character)
3. Build your team composition for synergy calculations
4. Choose enemy type for resistance calculations
5. Get mathematical damage analysis using actual game formulas

### Farming Routes

1. Open the "Farming" tab
2. Load character materials automatically or select custom materials
3. Generate AI-optimized farming routes
4. View daily domain availability and weekly boss schedules

### Hybrid Character System

1. **Automated Data**: Set up Character Showcase in-game for up to 8 characters
2. **Manual Input**: Add remaining characters using the character template
3. **Complete Coverage**: Get ALL your characters with no limits
4. **Universal Analysis**: Same mathematical accuracy for all characters

## API Integration

The application integrates with the Genshin Impact AI Assistant backend through a comprehensive API client (`src/lib/api.ts`). Key endpoints include:

- **User Management**: Profile creation, data fetching, and updates
- **Character Analysis**: Advanced build analysis and recommendations
- **AI Assistant**: Natural language question processing
- **Damage Calculation**: Mathematical damage computations
- **Farming Routes**: Optimized material collection paths
- **Exploration Data**: Region progress and material locations

## Development

### Project Structure

```
src/
├── app/                    # Next.js app directory
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── sections/          # Feature-specific sections
│   └── GenshinAssistant.tsx  # Main component
├── lib/
│   ├── api.ts            # API client and types
│   └── utils.ts          # Utility functions
└── ...
```

### Key Components

- **GenshinAssistant**: Main application component with tab navigation
- **UserProfileSection**: Displays comprehensive user information
- **CharacterAnalysisSection**: Character build analysis and recommendations
- **ExplorationMapSection**: Interactive canvas-based mapping
- **AIAssistantSection**: Chat interface with the AI assistant
- **DamageCalculatorSection**: Advanced damage calculations
- **FarmingRouteSection**: Material farming optimization

### Adding New Features

1. Create new section components in `src/components/sections/`
2. Add API endpoints to `src/lib/api.ts`
3. Integrate with the main `GenshinAssistant` component
4. Update navigation tabs as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- **Genshin Impact**: Game data and mechanics by miHoYo/HoYoverse
- **shadcn/ui**: Beautiful and accessible UI components
- **Radix UI**: Primitive components for building design systems
- **Tailwind CSS**: Utility-first CSS framework

## Support

For support, please open an issue on GitHub or contact the development team.

---

**Note**: This application is not affiliated with miHoYo/HoYoverse. Genshin Impact is a trademark of miHoYo/HoYoverse.

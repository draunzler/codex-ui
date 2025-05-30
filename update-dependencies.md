# Dependency Update Instructions

## Overview
The interactive map has been updated to use the official HoYoLAB interactive map instead of Leaflet.js. This provides a more authentic and feature-rich mapping experience.

## Changes Made

### Removed Dependencies
- `leaflet` - No longer needed as we use HoYoLAB's official map
- `react-leaflet` - React wrapper for Leaflet, no longer needed
- `@types/leaflet` - TypeScript definitions for Leaflet, no longer needed

### Updated Components
- `InteractiveMap.tsx` - Completely rewritten to use HoYoLAB iframe with custom marker overlay
- `ExplorationMapSection.tsx` - Updated descriptions and tips for new map system
- `globals.css` - Removed Leaflet styles, added HoYoLAB map styles

## Installation Steps

1. **Clean install dependencies:**
   ```bash
   npm install
   ```

2. **If you encounter any issues, try:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## New Features

### HoYoLAB Integration
- Official HoYoLAB interactive map embedded via iframe
- Full access to official map features and data
- Authentic Genshin Impact map experience

### Custom Marker System
- Canvas overlay for custom markers
- Click interaction with custom markers
- Toggle visibility of custom markers
- Material highlighting based on selection

### Enhanced Functionality
- Cross-origin safe implementation
- Fallback to overlay canvas when iframe injection isn't possible
- Custom marker popups with material information
- Farming route visualization on overlay

## Usage Notes

- The map loads the official HoYoLAB interactive map
- Custom markers are overlaid using HTML5 Canvas
- Click on custom markers to see material details
- Use the layer toggle to show/hide custom markers
- Open in new tab for full HoYoLAB experience

## Coordinate System

The new implementation uses HoYoLAB's coordinate system:
- Coordinates are typically in the range 0-100
- Origin may be at center or top-left depending on HoYoLAB's implementation
- Coordinates are converted to canvas pixels for overlay rendering

## Troubleshooting

If the map doesn't load:
1. Check internet connection (requires access to act.hoyolab.com)
2. Verify no ad blockers are interfering
3. Check browser console for any CORS or loading errors
4. Try opening the map URL directly in a new tab

## Development Notes

- Custom markers are rendered on a canvas overlay
- Cross-origin restrictions prevent direct iframe manipulation
- PostMessage API is used for communication when possible
- Fallback to overlay-only approach when needed 
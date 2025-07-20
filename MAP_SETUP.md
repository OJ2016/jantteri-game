# Map Route Setup

This document describes the setup for the new `/map` route that displays MML (National Land Survey of Finland) maps.

## Features

- Interactive map centered on Tampere, Finland
- Uses OpenLayers for map rendering
- Proxies MML map tiles through the Flask API
- Responsive design with mobile support

## Setup Instructions

### 1. Install Python Dependencies

Navigate to the `api` folder and install the new dependencies:

```bash
cd api
pip install python-dotenv requests
```

### 2. Configure MML API Key

1. Get your MML API key from: https://www.maanmittauslaitos.fi/rajapinnat/api-avaimen-ohje
2. Edit the `api/.env` file and replace `your_mml_api_key_here` with your actual API key:

```env
MML_API_KEY=your_actual_api_key_here
```

### 3. Start the Services

Start the Flask API server:
```bash
cd api
python app.py
```

Start the React development server:
```bash
cd web
npm run dev
```

### 4. Access the Map

Visit `http://localhost:5173/map` to view the map.

## API Endpoints

The Flask API now includes these new endpoints:

- `/mml-tiles/<z>/<x>/<y>.png` - Proxies MML map tiles
- `/mml-wms` - Proxies MML WMS requests (for future use)

## Map Features

- **Center**: Tampere, Finland (61.4978°N, 23.7610°E)
- **Zoom levels**: 5-18
- **Tile source**: Kapsi tile service (fallback for MML tiles)
- **Marker**: Red circle marker at Tampere location

## Technical Details

- **Frontend**: React with TypeScript
- **Map library**: OpenLayers 7.5.2 (loaded via CDN)
- **Styling**: Tailwind CSS
- **Backend**: Flask with proxy endpoints
- **Coordinate system**: WGS84 (EPSG:4326) converted to Web Mercator (EPSG:3857)

## Future Enhancements

- Add support for official MML WMS/WMTS services
- Implement map controls (zoom, pan, layer selection)
- Add additional markers and overlays
- Support for different map layers (satellite, terrain, etc.)

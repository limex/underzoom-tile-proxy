const express = require('express');
const fetch = require('node-fetch');
const sharp = require('sharp');
const { ACCESS_TOKEN } = require('./config');

const app = express();
const PORT = 3000;

const BASE_URL = 'https://api.mapbox.com/styles/v1/limex67/ckchx6lz72i9u1iphwz9zam0i/tiles/256';

const LOG_LEVEL = 'WARN'; // Set to 'ERROR' or 'WARN'

function logger(level, message) {
  const levels = { 'ERROR': 0, 'WARN': 1 };
  if (levels[level] <= levels[LOG_LEVEL]) {
    console[level.toLowerCase()](message);
  }
}

// Calculate tile coordinates for higher zoom level
function getChildTiles(x, y, zoomDiff) {
  const factor = Math.pow(2, zoomDiff);
  const tiles = [];
  const baseX = x * factor;
  const baseY = y * factor;

  for (let i = 0; i < factor; i++) {
    for (let j = 0; j < factor; j++) {
      tiles.push({
        x: baseX + i,
        y: baseY + j
      });
    }
  }

  logger('WARN', `Generated tiles: ${JSON.stringify(tiles)}`);
  return tiles;
}

// Fetch and merge tiles
async function fetchAndMergeTiles(childTiles, targetZ, scale) {
  const tileSize = 256;
  const finalSize = Math.sqrt(childTiles.length) * tileSize;
  
  // Fetch all child tiles
  const tilePromises = childTiles.map(async ({ x, y }) => {
    const url = `${BASE_URL}/${targetZ}/${x}/${y}?access_token=${ACCESS_TOKEN}`;
    const response = await fetch(url);
    const buffer = await response.buffer();
    return { buffer, x, y };
  });

  const tiles = await Promise.all(tilePromises);

  // Create a composite image
  const composite = sharp({
    create: {
      width: finalSize,
      height: finalSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  });

  // Prepare composite operations
  const compositeOps = tiles.map(({ buffer, x, y }) => ({
    input: buffer,
    top: (y % Math.sqrt(childTiles.length)) * tileSize,
    left: (x % Math.sqrt(childTiles.length)) * tileSize
  }));

  // Merge tiles and resize
  return composite
    .composite(compositeOps)
    .resize(256, 256)
    .png()
    .toBuffer();
}

app.get('/tiles/:z/:x/:y', async (req, res) => {
  try {
    const { z, x, y } = req.params;
    const zoom = parseInt(z);
    
    // Handle special zoom levels
    if (zoom === 13) {
      // Use zoom 14 tiles and resize to 50%
      const childTiles = getChildTiles(parseInt(x), parseInt(y), 1);
      const mergedTile = await fetchAndMergeTiles(childTiles, 14, 0.5);
      res.type('png').send(mergedTile);
    } 
    else if (zoom === 12) {
      // Use zoom 14 tiles and resize to 25%
      const childTiles = getChildTiles(parseInt(x), parseInt(y), 2);
      const mergedTile = await fetchAndMergeTiles(childTiles, 14, 0.25);
      res.type('png').send(mergedTile);
    }
    else {
      // Direct proxy for other zoom levels
      const url = `${BASE_URL}/${z}/${x}/${y}?access_token=${ACCESS_TOKEN}`;
      const response = await fetch(url);
      const buffer = await response.buffer();
      res.type('png').send(buffer);
    }
  } catch (error) {
    console.error('Error processing tile:', error);
    res.status(500).send('Error processing tile');
  }
});

app.listen(PORT, () => {
  console.log(`Tile proxy server running on port ${PORT}`);
});
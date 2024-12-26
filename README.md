# ATTENTION: WORK IN PROGRESS!!!

# Underzoom Tile Proxy

Underzoom Tile Proxy is a project designed to provide a proxy service for tile-based maps. This service allows for efficient retrieval and caching of map tiles, improving the performance and reliability of map-based applications.

## Features

- **Tile Caching**: Efficiently caches map tiles to reduce load times and bandwidth usage.
- **Proxy Service**: Acts as a proxy between the map client and the tile server.
- **Configurable**: Easily configurable to support different tile servers and caching strategies.

## Installation

To install the Underzoom Tile Proxy, clone the repository and install the dependencies:


## Details

I've created a tile proxy server that:

Handles zoom level 13 by:

Fetching 4 tiles from zoom level 14
Merging them into a single image
Resizing to 50% (256x256)
Handles zoom level 12 by:

Fetching 16 tiles from zoom level 14
Merging them into a single image
Resizing to 25% (256x256)
All other zoom levels are proxied directly without modification

The server is now running on port 3000. You can access tiles using the URL pattern:


http://localhost:3000/tiles/{z}/{x}/{y}
The server uses:

Express for handling HTTP requests
node-fetch for fetching original tiles
Sharp for image processing and merging
The implementation includes error handling and efficient tile processing. All image operations are performed in memory for better performance.

## Example Tiles for testing 

http://localhost:3000/tiles/11/1112/707
http://localhost:3000/tiles/15/17767/11307

# typical URL to a TMS source
http://localhost:3000/tiles/{z}/{x}/{y}


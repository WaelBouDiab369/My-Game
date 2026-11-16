# GeoQuest

A geography game on a real satellite globe. 218 countries and territories.

- **Find the country**: tap the named country on the globe.
- **Write the capital**: type the capital of the highlighted country.
- **Name the country**: type the name of the highlighted country.

Play: https://waelboudiab369.github.io/My-Game/

## Files
- `index.html`: the whole game (HTML, CSS, JavaScript).
- `countries.json`: names, capitals, regions and coordinates for the 218 places.
- `borders.json`: country borders (Natural Earth 1:50m, TopoJSON).
- `earth-blue-marble.jpg`, `earth-topology.png`, `night-sky.png`: globe imagery (NASA Blue Marble).
- `tools/build-data.js`: rebuilds the two JSON files from the `world-countries` and `world-atlas` npm packages.

Data: world-countries (ODbL), Natural Earth via world-atlas (public domain), NASA Blue Marble imagery (public domain). Globe: globe.gl.

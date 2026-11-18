# GeoQuest

A geography game on a real satellite globe. 218 countries and territories, in English, Arabic and French.

- **Study the map**: tap or search any country to see its flag, capital, region, area and status, and hear it pronounced.
- **Find the country**: tap the named country on the globe.
- **Flags**: tap the country that a flag belongs to.
- **Write the capital**: type the capital of the highlighted country (Arabic, English or French spelling).
- **Name the country**: type the name of the highlighted country.

Options: region, number of questions, Easy level (larger countries, a free first letter, an extra try), a 20-second timer, and 3 lives.
After each answer the capital city is marked on the globe.

Play: https://waelboudiab369.github.io/My-Game/

## Files
- `index.html`: the page layout.
- `css/style.css`: the look.
- `js/strings.js`: every piece of interface text in English, Arabic and French. Edit here to change wording.
- `js/game.js`: the globe views and all game logic.
- `data/countries.json`: names, capitals (3 languages), capital coordinates, regions for the 218 places.
- `data/borders.json`: country borders (Natural Earth 1:50m, TopoJSON).
- `flags/`: flag images (flag-icons, MIT).
- `img/`: globe imagery (NASA Blue Marble).
- `vendor/`: the libraries the game uses (globe.gl, topojson-client, d3-geo, d3-array), stored here so the game never depends on an outside download site. Their licenses are next to them.
- `tools/build-data.js`: rebuilds `data/` and `flags/` from npm packages; the tables at its top control which places are included, capitals and translations.

Data: world-countries (ODbL), Natural Earth via world-atlas (public domain), country-state-city (capital coordinates), Unicode CLDR (Arabic and French city names), flag-icons (MIT), NASA Blue Marble imagery (public domain). Globe: globe.gl.

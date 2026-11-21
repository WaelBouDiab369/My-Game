# MindQuest

Science games for curious kids and adults, in English, Arabic and French.

- Home page: `index.html` (category cards, fact of the day, animated background). `img/earth-mini.jpg` is the spinning Earth on the Geography card.
- Geography hub: `geography/index.html`, with 17 playable topics and 6 coming soon.
  - `geography/world/`: countries, capitals and flags (the GeoQuest game below).
  - `geography/explore/`: one engine for 14 map topics (continents, oceans, seas, straits, rivers, lakes, islands, archipelagos, deserts, mountain ranges, mountains, regions, cities, latitude and longitude), opened as `explore/?t=<topic>`. Data in `explore/data/`, built by `tools/build-topics.js` from Natural Earth.
- Chemistry, Physics, Math, Biology: 10 games each, every game teaching one lesson.
  - Each subject folder has `index.html` (the subject page), `play.html` (opens a game with `play.html?g=<game>`), `subject.js` (colour, hero animation, game list and shared data) and `games/<game>.js` (one file per game, with its English, Arabic and French text).
  - `shared/shell.js` is the engine they all use (intro, learn mode, rounds, scoring, stars, best scores, sound, languages); `shared/game.css` is the shared look.
  - Chemistry: atom builder, periodic table, states of matter, element symbols, molecule builder, balancing equations, pH lab, separating mixtures, metals and non-metals, physical vs chemical changes.
  - Physics: circuits, gravity on other worlds, projectiles, pendulum, float or sink, force and motion, mirrors and light, sound waves, magnets, energy on a ramp.
  - Math: times tables, fractions, number line, balance-scale equations, angles, area and perimeter, coordinates, prime numbers, percentages, number sequences.
  - Biology: cell explorer, body organs, skeleton, food chains, animal classes, photosynthesis lab, DNA builder, heart and blood, digestion, life cycles.

Play: https://waelboudiab369.github.io/My-Game/

## GeoQuest (geography/world/)

A geography game on a real satellite globe: the 197 countries of the world (193 UN members + Vatican City, Palestine, Kosovo and Taiwan), plus 21 territories players can add, in English, Arabic and French.

- **Study the map**: tap or search any country to see its flag, capital, region, area and status, and hear it pronounced.
- **Find the country**: tap the named country on the globe.
- **Flags**: tap the country that a flag belongs to.
- **Write the capital**: type the capital of the highlighted country (Arabic, English or French spelling).
- **Name the country**: type the name of the highlighted country.

Options: region, number of questions, Easy level (larger countries, a free first letter, an extra try), a 20-second timer, and 3 lives.
After each answer the capital city is marked on the globe.

Play: https://waelboudiab369.github.io/My-Game/geography/world/

## Files (inside geography/world/)
- `index.html`: the page layout.
- `css/style.css`: the look.
- `js/strings.js`: every piece of interface text in English, Arabic and French. Edit here to change wording.
- `js/game.js`: the globe views and all game logic.
- `data/countries.json`: names, capitals (3 languages), capital coordinates, regions and notes for the 197 countries and 21 territories.
- `data/borders-small.json`: sharper 1:10m outlines for the 78 small countries and islands.
- `data/borders.json`: country borders (Natural Earth 1:50m, TopoJSON).
- `flags/`: flag images (flag-icons, MIT).
- `img/`: globe imagery (NASA Blue Marble).
- `vendor/`: the libraries the game uses (globe.gl, topojson-client, d3-geo, d3-array), stored here so the game never depends on an outside download site. Their licenses are next to them.
- `tools/check-data.js` (at the top level): cross-checks the data against five independent sources and lists anything to review.
- `tools/build-data.js` (at the top level): rebuilds `geography/data/` and `geography/flags/` from npm packages; the tables at its top control which places are included, capitals and translations.

Data: Natural Earth (public domain) for the map topics, world-countries (ODbL), Natural Earth via world-atlas (public domain), country-state-city (capital coordinates), Unicode CLDR (Arabic and French city names), flag-icons (MIT), NASA Blue Marble imagery (public domain). Globe: globe.gl.

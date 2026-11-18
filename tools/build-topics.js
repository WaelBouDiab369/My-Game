// Builds geography/explore/data/<topic>.json for the map topics, from Natural Earth (public domain).
//
//   git clone --depth 1 --filter=blob:none --sparse https://github.com/nvkelso/natural-earth-vector pkgs/natural-earth-vector
//   (cd pkgs/natural-earth-vector && git sparse-checkout set --no-cone /geojson/ne_10m_geography_marine_polys.geojson \
//      /geojson/ne_10m_geography_regions_polys.geojson /geojson/ne_10m_geography_regions_elevation_points.geojson \
//      /geojson/ne_50m_geography_regions_points.geojson /geojson/ne_10m_rivers_lake_centerlines.geojson \
//      /geojson/ne_10m_lakes.geojson /geojson/ne_10m_populated_places.geojson)
//   node tools/build-topics.js pkgs
//
// Each topic is a curated list of names, so the games stay focused on places worth learning.
// Names come from Natural Earth in English, Arabic and French. Where Natural Earth has no Arabic or
// French name (mostly rivers), the name is written in TR below and marked "hand": true for review.
const fs = require("fs");
const path = require("path");
const PK = process.argv[2];
const OUT = path.join(__dirname, "../geography/explore/data");
const NE = (f) => JSON.parse(fs.readFileSync(path.join(PK, "natural-earth-vector/geojson", f + ".geojson"), "utf8"));

const marine = NE("ne_10m_geography_marine_polys").features;
const regions = NE("ne_10m_geography_regions_polys").features;
const peaks = NE("ne_10m_geography_regions_elevation_points").features;
const points = NE("ne_50m_geography_regions_points").features;
const rivers = NE("ne_10m_rivers_lake_centerlines").features;
const lakes = NE("ne_10m_lakes").features;
const places = NE("ne_10m_populated_places").features;

// ---------- geometry helpers ----------
function dp(pts, tol) {                       // Douglas–Peucker line simplification
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop(); let idx = -1, max = tol * tol;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
      const ex = ax + t * dx - px, ey = ay + t * dy - py, d = ex * ex + ey * ey;
      if (d > max) { max = d; idx = i; }
    }
    if (idx >= 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const r3 = (p) => [Math.round(p[0] * 1000) / 1000, Math.round(p[1] * 1000) / 1000];
function simplifyRing(ring, tol) { const s = dp(ring, tol).map(r3); return s.length >= 4 ? s : null; }
function simplifyGeom(g, tol) {
  if (g.type === "Polygon") { const rings = g.coordinates.map((r) => simplifyRing(r, tol)).filter(Boolean); return rings.length ? { type: "Polygon", coordinates: rings } : null; }
  if (g.type === "MultiPolygon") { const polys = g.coordinates.map((p) => p.map((r) => simplifyRing(r, tol)).filter(Boolean)).filter((p) => p.length); return polys.length ? { type: "MultiPolygon", coordinates: polys } : null; }
  if (g.type === "LineString") return { type: "LineString", coordinates: dp(g.coordinates, tol).map(r3) };
  if (g.type === "MultiLineString") return { type: "MultiLineString", coordinates: g.coordinates.map((l) => dp(l, tol).map(r3)).filter((l) => l.length > 1) };
  return g;
}
function merge(geoms) {                        // combine several shapes into one MultiPolygon / MultiLineString
  const polys = [], lines = [];
  for (const g of geoms) {
    if (!g) continue;
    if (g.type === "Polygon") polys.push(g.coordinates); else if (g.type === "MultiPolygon") polys.push(...g.coordinates);
    if (g.type === "LineString") lines.push(g.coordinates); else if (g.type === "MultiLineString") lines.push(...g.coordinates);
  }
  if (polys.length) return polys.length === 1 ? { type: "Polygon", coordinates: polys[0] } : { type: "MultiPolygon", coordinates: polys };
  return lines.length === 1 ? { type: "LineString", coordinates: lines[0] } : { type: "MultiLineString", coordinates: lines };
}
function allPts(g) { const out = []; (function walk(a) { if (typeof a[0] === "number") out.push(a); else a.forEach(walk); })(g.coordinates); return out; }
// A label point and a rough size (km across) so the game can fly to the right height.
function anchor(g) {
  const pts = allPts(g);
  let minX = 999, maxX = -999, minY = 999, maxY = -999, sx = 0, sy = 0, cx = 0, cy = 0;
  // average on the sphere so shapes crossing the date line work
  for (const [x, y] of pts) { const a = (x * Math.PI) / 180; sx += Math.cos(a); sy += Math.sin(a); cy += y; minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  cx = (Math.atan2(sy, sx) * 180) / Math.PI; cy /= pts.length;
  for (const [x] of pts) { const d = ((x - cx + 540) % 360) - 180; minX = Math.min(minX, d); maxX = Math.max(maxX, d); }
  const km = Math.max((maxY - minY) * 111, (maxX - minX) * 111 * Math.cos((cy * Math.PI) / 180));
  return { ll: [+cy.toFixed(3), +cx.toFixed(3)], km: Math.max(20, Math.round(km)) };
}

// ---------- names ----------
const title = (s) => s.toLowerCase().replace(/(^|[\s\-(’'])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
let useFullName = false;
function namesOf(p) {
  const g = (k) => p[k] || p[k.toUpperCase()];
  let en = (useFullName && g("name")) || g("name_en") || g("name"); if (en === en.toUpperCase()) en = title(en);
  return { en, ar: g("name_ar") || "", fr: g("name_fr") || "" };
}
// Our own wording for names that read oddly, plus Arabic/French where Natural Earth has none.
const TR = {
  // oceans (merged North + South parts)
  "Atlantic Ocean": ["المحيط الأطلسي", "océan Atlantique"], "Pacific Ocean": ["المحيط الهادئ", "océan Pacifique"],
  "Indian Ocean": ["المحيط الهندي", "océan Indien"], "Southern Ocean": ["المحيط الجنوبي", "océan Austral"], "Arctic Ocean": ["المحيط المتجمد الشمالي", "océan Arctique"],
  // rivers
  Nile: ["النيل", "Nil"], Amazon: ["الأمازون", "Amazone"], Yangtze: ["يانغتسي", "Yangzi Jiang"], Mississippi: ["المسيسيبي", "Mississippi"],
  Missouri: ["ميزوري", "Missouri"], Yenisey: ["ينيسي", "Ienisseï"], "Yellow River": ["النهر الأصفر", "fleuve Jaune"], Ob: ["أوب", "Ob"],
  "Paraná": ["بارانا", "Paraná"], Congo: ["نهر الكونغو", "Congo"], Amur: ["آمور", "Amour"], Lena: ["لينا", "Léna"], Mekong: ["ميكونغ", "Mékong"],
  Mackenzie: ["ماكنزي", "Mackenzie"], Niger: ["نهر النيجر", "Niger"], Murray: ["موراي", "Murray"], Volga: ["الفولغا", "Volga"],
  Danube: ["الدانوب", "Danube"], Ganges: ["الغانج", "Gange"], Indus: ["السند", "Indus"], Brahmaputra: ["براهمابوترا", "Brahmapoutre"],
  Euphrates: ["الفرات", "Euphrate"], Tigris: ["دجلة", "Tigre"], Rhine: ["الراين", "Rhin"], Zambezi: ["الزمبيزي", "Zambèze"],
  Orinoco: ["أورينوكو", "Orénoque"], Colorado: ["كولورادو", "Colorado"], "Rio Grande": ["ريو غراندي", "Rio Grande"],
  "St. Lawrence": ["سانت لورانس", "Saint-Laurent"], Irrawaddy: ["إيراوادي", "Irrawaddy"], Dnieper: ["الدنيبر", "Dniepr"],
  Don: ["الدون", "Don"], Thames: ["التايمز", "Tamise"], Seine: ["السين", "Seine"], Loire: ["اللوار", "Loire"], Elbe: ["الإلبه", "Elbe"],
  Jordan: ["نهر الأردن", "Jourdain"], Limpopo: ["ليمبوبو", "Limpopo"], Orange: ["نهر أورانج", "Orange"], Yukon: ["يوكون", "Yukon"],
  Columbia: ["كولومبيا", "Columbia"], "São Francisco": ["ساو فرانسيسكو", "São Francisco"], Tagus: ["تاجة", "Tage"], Senegal: ["نهر السنغال", "Sénégal"],
  "Amu Darya": ["آمو داريا (جيحون)", "Amou-Daria"], "Syr Darya": ["سير داريا (سيحون)", "Syr-Daria"], Salween: ["سالوين", "Salouen"],
  "Blue Nile": ["النيل الأزرق", "Nil Bleu"], "White Nile": ["النيل الأبيض", "Nil Blanc"], Vistula: ["فيستولا", "Vistule"], Ural: ["الأورال", "Oural"],
  Kolyma: ["كوليما", "Kolyma"], Ohio: ["أوهايو", "Ohio"], Rhône: ["الرون", "Rhône"], Volta: ["الفولتا", "Volta"], Okavango: ["أوكافانغو", "Okavango"],
  "Shatt al-Arab": ["شط العرب", "Chatt-el-Arab"], Madeira: ["ماديرا", "Madeira"], Tocantins: ["توكانتينس", "Tocantins"], Magdalena: ["ماغدالينا", "Magdalena"],
  // straits added by hand (no Natural Earth shape)
  "Strait of Hormuz": ["مضيق هرمز", "détroit d'Ormuz"], "Bering Strait": ["مضيق بيرينغ", "détroit de Béring"],
  "Strait of Dover": ["مضيق دوفر", "pas de Calais"], "Strait of Messina": ["مضيق ميسينا", "détroit de Messine"],
  // latitude / longitude lines
  Equator: ["خط الاستواء", "équateur"], "Tropic of Cancer": ["مدار السرطان", "tropique du Cancer"], "Tropic of Capricorn": ["مدار الجدي", "tropique du Capricorne"],
  "Arctic Circle": ["الدائرة القطبية الشمالية", "cercle arctique"], "Antarctic Circle": ["الدائرة القطبية الجنوبية", "cercle antarctique"],
  "Prime Meridian": ["خط غرينتش (خط الطول الرئيسي)", "méridien de Greenwich"], "180th Meridian": ["خط الطول 180", "180e méridien"],
};
// Corrections where the Natural Earth translation is wrong, partial or ambiguous.
Object.assign(TR, {
  "Korea Strait": ["مضيق كوريا", "détroit de Corée"], "Bass Strait": ["مضيق باس", "détroit de Bass"], "Florida Strait": ["مضيق فلوريدا", "détroit de Floride"],
  "Cook Strait": ["مضيق كوك", "détroit de Cook"], "Apennines": ["جبال الأبينيني", "Apennins"], "Ahaggar Mountains": ["جبال الهقار", "massif du Hoggar"],
  "Southern Alps": ["جبال الألب الجنوبية", "Alpes du Sud"], "Hejaz Mountains": ["جبال الحجاز", "monts du Hedjaz"], "Sierra Nevada": ["سييرا نيفادا", "Sierra Nevada"],
  "Western Ghats": ["جبال الغات الغربية", "Ghâts occidentaux"], "Alborz Mountains": ["جبال البرز", "monts Alborz"], "Pamir Mountains": ["جبال بامير", "Pamir"],
  "Popocatépetl": ["بوبوكاتبيتل", "Popocatépetl"], "Mont Blanc": ["مون بلان", "mont Blanc"], "Mount Etna": ["جبل إتنا", "Etna"],
  "Horn of Africa": ["القرن الأفريقي", "Corne de l'Afrique"], "Sahel": ["الساحل الأفريقي", "Sahel"], "Levant": ["بلاد الشام (المشرق)", "Levant"],
  "Indochina Peninsula": ["شبه جزيرة الهند الصينية", "péninsule indochinoise"], "Lapland": ["لابلاند", "Laponie"],
  "Thar Desert": ["صحراء ثار", "désert du Thar"], "Gibson Desert": ["صحراء جيبسون", "désert de Gibson"], "Betpak-Dala": ["صحراء بتباك دالا", "Betpak-Dala"],
  "Atacama Desert": ["صحراء أتاكاما", "désert d'Atacama"], "Australia (Oceania)": ["أستراليا (أوقيانوسيا)", "Australie (Océanie)"],
  "Lake Volta": ["بحيرة فولتا", "lac Volta"], "Lake Balaton": ["بحيرة بالاتون", "lac Balaton"], "Great Salt Lake": ["البحيرة المالحة الكبرى", "Grand Lac Salé"],
  "Lake Eyre": ["بحيرة آير", "lac Eyre"], "Great Bear Lake": ["بحيرة الدب العظيم", "Grand lac de l'Ours"], "Great Slave Lake": ["بحيرة العبيد الكبرى", "Grand lac des Esclaves"], "Tonlé Sap": ["بحيرة تونلي ساب", "Tonlé Sap"], "Great Dividing Range": ["سلسلة الجبال الأسترالية الكبرى", "Cordillère australienne"],
});
const RENAME = {   // Natural Earth name -> name used in the game
  "Desierto De Atacama": "Atacama Desert", "Mainland Tasmania": "Tasmania", "Lake Eyre North": "Lake Eyre", "Gora Elbrus": "Mount Elbrus", "Cerro Aconcagua": "Aconcagua", "Fuji": "Mount Fuji",
  "Monte Etna": "Mount Etna", "Volcán Popocatépetl": "Popocatépetl", "Jebel Toubkal": "Mount Toubkal", "Aoraki (Mount Cook)": "Aoraki / Mount Cook",
  "Pik Imeni Ismail Samani": "Ismoil Somoni Peak", "Gunung Kinabalu": "Mount Kinabalu", "Lago Titicaca": "Lake Titicaca", "Bodensee": "Lake Constance",
  "Lago di Garda": "Lake Garda", "Lago Di Garda": "Lake Garda", "Lago de Nicaragua": "Lake Nicaragua", "Estrecho de Magellanes": "Strait of Magellan", "Caucasus Mts.": "Caucasus Mountains",
  "Karakoram Ra.": "Karakoram", "Appennini": "Apennines", "Kjølen Mountains": "Scandinavian Mountains", "Elburz Mts.": "Alborz Mountains",
  "Tibesti Mts.": "Tibesti Mountains", "Ahaggar Mts.": "Ahaggar Mountains", "Appalachian Mts.": "Appalachian Mountains", "Plateau Of Tibet": "Tibetan Plateau",
  "Península Ibérica": "Iberian Peninsula", "India": "Indian subcontinent", "Somali Peninsula": "Horn of Africa", "Pen. De Yucatán": "Yucatán Peninsula",
  "Balkan Pen.": "Balkan Peninsula", "Honshü": "Honshu", "Hokkaidö": "Hokkaido", "Kyüshü": "Kyushu", "Island Of Newfoundland": "Newfoundland",
  "Sicilia": "Sicily", "Sardegna": "Sardinia", "Corse": "Corsica", "Ellesmere  Island": "Ellesmere Island", "Ryükyü Islands": "Ryukyu Islands",
  "Islas Canarias": "Canary Islands", "Açores": "Azores", "Ilhas De Cabo Verde": "Cape Verde Islands", "Archipel Des Tuamotu": "Tuamotu Islands",
  "Archipel Des Comores": "Comoro Islands", "Solomon Isands": "Solomon Islands", "Falkland Is.": "Falkland Islands", "Rub’ Al Khali": "Rub' al Khali (Empty Quarter)",
  "Golfo De California": "Gulf of California", "Bahía De Campeche": "Bay of Campeche", "Gulf Of Mexico": "Gulf of Mexico",
};
function nm(p, override) {
  const n = namesOf(p); let en = override || RENAME[n.en] || n.en;
  const t = TR[en]; let hand = false;
  const ar = (t && t[0]) || n.ar, fr = (t && t[1]) || n.fr;
  if (t) hand = true;
  if (!ar || !fr) hand = true;
  return { name: { en, ar: ar || en, fr: fr || en }, hand, alt: [n.en, p.name, p.NAME, p.namealt, p.NAMEALT, p.name_alt].filter((x) => x && x !== en) };
}
const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------- topic builders ----------
const missing = [];
function find(list, key, wanted, filter = () => true) {
  const hits = list.filter((f) => filter(f) && [f.properties[key], f.properties[key.toUpperCase()], f.properties.name_en, f.properties.NAME_EN].some((v) => v && v.toLowerCase() === wanted.toLowerCase()));
  if (!hits.length) missing.push(wanted);
  return hits;
}
function polyTopic(list, wanted, tol, opts = {}) {
  const out = [];
  for (const w of wanted) {
    const [src, as] = Array.isArray(w) ? w : [w];
    const hits = [].concat(...[].concat(src).map((s) => find(list, "name", s, opts.filter)));
    if (!hits.length) continue;
    const raw = merge(hits.map((h) => h.geometry));
    const g = simplifyGeom(raw, tol) || simplifyGeom(raw, 0);
    if (!g) { missing.push(src + " (no usable shape)"); continue; }
    const n = nm(hits[0].properties, as);
    out.push({ id: slug(n.name.en), ...n, type: "poly", geometry: g, ...anchor(g), mark: opts.mark || anchor(g).km < 250 });
  }
  return out;
}
function write(id, features, extra = {}) {
  const seen = new Set();
  features = features.filter((f) => !seen.has(f.id) && seen.add(f.id));
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, id + ".json"), JSON.stringify({ id, features, ...extra }));
  console.log(`${id}: ${features.length} (${features.filter((f) => f.hand).length} with hand-written names)`);
  return features;
}

// Continents
write("continents", polyTopic(regions, ["Africa", "Antarctica", "Asia", ["Australia", "Australia (Oceania)"], "Europe", "North America", "South America"], 0.12, { filter: (f) => f.properties.FEATURECLA === "Continent" }));

// Oceans: Natural Earth splits the Atlantic and Pacific into north and south.
write("oceans", polyTopic(marine, [[["North Atlantic Ocean", "South Atlantic Ocean"], "Atlantic Ocean"], [["North Pacific Ocean", "South Pacific Ocean"], "Pacific Ocean"], "Indian Ocean", ["Southern Ocean", "Southern Ocean"], "Arctic Ocean"], 0.15, { filter: (f) => f.properties.featurecla === "ocean" }));

// Seas, gulfs and bays
write("seas", polyTopic(marine, ["Mediterranean Sea", "Caribbean Sea", "South China Sea", "Bering Sea", "Gulf of Mexico", "Sea of Okhotsk", "East China Sea", "Hudson Bay", "Sea of Japan",
  "Andaman Sea", "North Sea", "Red Sea", "Baltic Sea", "Black Sea", "Caspian Sea", "Arabian Sea", "Persian Gulf", "Bay of Bengal", "Coral Sea", "Tasman Sea", "Philippine Sea",
  "Barents Sea", "Kara Sea", "Laptev Sea", "Norwegian Sea", "Greenland Sea", "Labrador Sea", "Beaufort Sea", "Weddell Sea", "Ross Sea", "Yellow Sea", "Java Sea", "Arafura Sea",
  "Timor Sea", "Gulf of Guinea", "Gulf of Aden", "Gulf of Oman", "Adriatic Sea", "Aegean Sea", "Ionian Sea", "Tyrrhenian Sea", "Irish Sea", "Bay of Biscay", "Gulf of Alaska",
  "Baffin Bay", "Gulf of Thailand", "Celebes Sea", "Sargasso Sea", "Gulf of Bothnia", "White Sea", "Golfo de California", "Great Australian Bight"], 0.08));

// Straits and channels (small, so each also gets a ring marker)
const straits = polyTopic(marine, ["Strait of Gibraltar", "Bosporus", "Dardanelles", "Bab el Mandeb", "Strait of Malacca", "Strait of Singapore", "Estrecho de Magellanes", "English Channel",
  "Mozambique Channel", "Drake Passage", "Taiwan Strait", "Korea Strait", "Bass Strait", "Torres Strait", "Davis Strait", "Hudson Strait", "Luzon Strait", "Makassar Strait",
  "Straits of Florida", "Cook Strait", "Palk Strait", "Øresund", "La Pérouse Strait"], 0.02, { mark: true });
for (const [en, ll, km] of [["Strait of Hormuz", [26.57, 56.25], 60], ["Bering Strait", [65.75, -168.75], 85], ["Strait of Dover", [51.0, 1.45], 35], ["Strait of Messina", [38.22, 15.63], 15]]) {
  straits.push({ id: slug(en), name: { en, ar: TR[en][0], fr: TR[en][1] }, alt: [], hand: true, type: "point", geometry: { type: "Point", coordinates: [ll[1], ll[0]] }, ll, km, mark: true });
}
write("straits", straits);

// Rivers: Natural Earth splits rivers into named sections; join the sections that form each river.
const RIVERS = {
  Nile: ["Nile", "El Bahr el Abyad", "Bahr el Jebel", "Albert Nile", "Victoria Nile", "Rosetta Branch", "Damietta Branch"], Amazon: ["Amazonas", "Ucayali"],
  Yangtze: ["Yangtze", "Chang Jiang", "Jinsha", "Tongtian", "Tuotuo"], Mississippi: ["Mississippi"], Missouri: ["Missouri"], Yenisey: ["Yenisey"], "Yellow River": ["Huang"],
  Ob: ["Ob"], "Paraná": ["Paraná"], Congo: ["Congo", "Lualaba"], Amur: ["Amur"], Lena: ["Lena"], Mekong: ["Mekong", "Lancang"], Mackenzie: ["Mackenzie"], Niger: ["Niger"],
  Murray: ["Murray"], Volga: ["Volga"], Danube: ["Danube", "Donau"], Ganges: ["Ganges"], Indus: ["Indus"], Brahmaputra: ["Brahmaputra", "Yarlung", "Dihang"],
  Euphrates: ["Euphrates"], Tigris: ["Tigris"], Rhine: ["Rhine", "Rhein"], Zambezi: ["Zambezi"], Orinoco: ["Orinoco"], Colorado: ["Colorado"], "Rio Grande": ["Rio Grande"],
  "St. Lawrence": ["St. Lawrence"], Dnieper: ["Dnipro", "Dnepre"], Don: ["Don"], Thames: ["Thames"], Seine: ["Seine"], Loire: ["Loire"], Elbe: ["Elbe"], Jordan: ["Jordan"],
  Limpopo: ["Limpopo"], Orange: ["Orange"], Yukon: ["Yukon"], Columbia: ["Columbia"], "São Francisco": ["São  Francisco"], Tagus: ["Tajo", "Tejo"], Senegal: ["Sénégal"],
  "Amu Darya": ["Amu  Darya"], "Syr Darya": ["Syr  Darya"], "Blue Nile": ["El Bahr el Azraq", "Abay"], Vistula: ["Vistula"], Rhône: ["Rhône"], Volta: ["Volta"], Okavango: ["Okavango"],
  "Shatt al-Arab": ["Shatt al Arab"], Salween: ["Salween", "Nu"],
};
const segOfGeom = (g) => (g.type === "LineString" ? [g.coordinates] : g.coordinates);
const riverFeats = [];
for (const [en, parts] of Object.entries(RIVERS)) {
  const hits = rivers.filter((f) => f.properties.featurecla !== "Lake Centerline" && parts.includes(f.properties.name));
  if (!hits.length) { missing.push("river " + en); continue; }
  // Where a river flows through a lake or reservoir, Natural Earth stores that stretch as a "Lake Centerline".
  // Add every such stretch that touches the river, so the river is drawn without gaps.
  const ends = (f) => segOfGeom(f.geometry).flatMap((l) => [l[0], l[l.length - 1]]);
  const near = (a, b) => Math.abs(a[0] - b[0]) < 0.3 && Math.abs(a[1] - b[1]) < 0.3;
  let grew = true;
  while (grew) {
    grew = false;
    const pts = hits.flatMap(ends);
    for (const f of rivers) {
      if (f.properties.featurecla !== "Lake Centerline" || hits.includes(f)) continue;
      if (ends(f).some((e) => pts.some((q) => near(e, q)))) { hits.push(f); grew = true; }
    }
  }
  const g = simplifyGeom(merge(hits.map((h) => h.geometry)), 0.03);
  riverFeats.push({ id: slug(en), name: { en, ar: TR[en][0], fr: TR[en][1] }, alt: parts.filter((p) => p !== en), hand: true, type: "line", geometry: g, ...anchor(g) });
}
write("rivers", riverFeats);

// Lakes
useFullName = true;
const lakeFeats = polyTopic(lakes, ["Lake Superior", "Lake Michigan", "Lake Huron", "Lake Erie", "Lake Ontario", "Lake Victoria", "Lake Tanganyika", "Lake Malawi", "Lake Baikal",
  "Great Bear Lake", "Great Slave Lake", "Lake Winnipeg", "Lake Ladoga", "Lake Onega", "Lake Balkhash", "Lago Titicaca", "Lake Chad", "Lake Turkana", "Lake Van", "Lake Urmia",
  "Dead Sea", "Sea of Galilee", "Issyk-Kul", "Lake Geneva", "Bodensee", "Lago di Garda", "Lake Nasser", "Lake Volta", "Lake Kariba", ["North Aral Sea", "Aral Sea"], "Lake Tana", "Lake Albert",
  "Lake Kivu", "Vänern", "Lago de Nicaragua", "Great Salt Lake", "Tonlé Sap", "Qinghai Hu", "Lake Balaton", "Lake Athabasca", "Lake Eyre North"], 0.01);
useFullName = false;
for (const f of lakeFeats) {
  if (f.name.en === "Vänern") f.name.en = "Lake Vänern";
  if (f.name.en === "Qinghai Hu") f.name.en = "Qinghai Lake";
  if (!/^(lac|mer|grand|petite)/i.test(f.name.fr)) f.name.fr = "lac " + f.name.fr;
  if (!/^(بحيرة|البحر|بحر|البحيرة)/.test(f.name.ar)) f.name.ar = "بحيرة " + f.name.ar;
}
write("lakes", lakeFeats);

// Islands
write("islands", polyTopic(regions, ["Greenland", "New Guinea", "Borneo", "Madagascar", "Baffin Island", "Sumatra", "Honshü", "Great Britain", "Victoria Island", "Ellesmere  Island",
  "Sulawesi", "South Island", "Java", "North Island", "Luzon", "Island of Newfoundland", "Cuba", "Iceland", "Mindanao", "Ireland", "Hokkaidö", "Hispaniola", "Sakhalin",
  "Tasmania", "Sri Lanka", "Taiwan", "Sicilia", "Sardegna", "Corse", "Cyprus", "Jamaica", "Hainan", "Tierra del Fuego", "Puerto Rico", "Trinidad", "Vancouver Island",
  "Kyüshü", "Shikoku", "Timor", "Banks Island", "Palawan"], 0.04, { filter: (f) => f.properties.FEATURECLA === "Island" }));

// Archipelagos
write("archipelagos", polyTopic(regions, ["Malay Archipelago", "Philippines", "Japan", "British Isles", "Hawaiian Islands", "Greater Antilles", "Lesser Antilles", "Bahama Islands",
  "Islas Canarias", "Açores", "Ilhas de Cabo Verde", "Balearic Islands", "Svalbard", "Franz Josef Land", "Novaya Zemlya", "Severnaya Zemlya", "New Siberian Islands",
  "Arctic Archipelago", "Andaman Islands", "Nicobar Islands", "Moluccas", "Aleutian Islands", "Kuril Islands", "Ryükyü Islands", "Falkland Is.", "Seychelles",
  "Archipel des Comores", "Mascarene Islands", "Archipel des Tuamotu", "Solomon Isands", "Marshall Islands", "Fiji", "Tonga Islands", "Bismarck Archipelago",
  "Greater Sunda Islands", "Lesser Sunda Islands", "Melanesia", "Micronesia", "Polynesia", "New Zealand"], 0.04, { filter: (f) => f.properties.FEATURECLA === "Island group" }));

// Deserts
write("deserts", polyTopic(regions, ["Sahara", "Gobi Desert", "Kalahari Desert", "Namib Desert", "Rub’ al Khali", "Syrian Desert", ["Thar Desert", "Thar Desert"], "Taklimakan Desert",
  "Great Victoria Desert", "Great Sandy Desert", ["Gibson Desert", "Gibson Desert"], ["Desierto de Atacama", "Atacama Desert"], "Sonoran Desert", "Chihuahuan Desert", "Nubian Desert", "Libyan Desert", "Western Desert",
  "Garagum Desert", "Qizilqum Desert", "Lut Desert", "Ténéré", ["Betpaqdala Desert", "Betpak-Dala"]], 0.04, { filter: (f) => f.properties.FEATURECLA === "Desert" }));

// Mountain ranges
write("ranges", polyTopic(regions, ["Himalayas", "Andes", "Rocky Mountains", "Alps", "Ural Mountains", "Caucasus Mts.", "Atlas Mountains", "Appalachian Mts.", "Great Dividing Range",
  "Tian Shan", "Hindu Kush", "Karakoram Ra.", ["Pamirs", "Pamir Mountains"], "Zagros Mountains", "Altay Mountains", "Ethiopian Highlands", "Pyrenees", "Carpathian Mountains", ["Appennini", "Apennines"],
  "Kjølen Mountains", "Drakensberg", "Sierra Madre Occidental", "Sierra Madre Oriental", ["Southern Alps", "Southern Alps"], ["Sierra Nevada", "Sierra Nevada"], ["Western Ghats", "Western Ghats"], "Eastern Ghats", "Tibesti Mts.",
  ["Ahaggar Mts.", "Ahaggar Mountains"], ["Elburz Mts.", "Alborz Mountains"], "Dinaric Alps", "Kunlun Mountains", "Brooks Range", "Alaska Range", "Cascade Range", "Transantarctic Mountains", ["Hejaz Mts.", "Hejaz Mountains"]], 0.04, { filter: (f) => f.properties.FEATURECLA === "Range/mtn" }));

// Mountains (peaks), with height
const PEAKS = ["Mount Everest", "K2", "Nanga Parbat", "Aconcagua", "Denali", "Mount Kilimanjaro", "Mount Elbrus", "Mount Logan", "Mont Blanc", "Matterhorn", "Mount Fuji", "Mount Kenya",
  "Mount Ararat", "Mount Damavand", "Mount Toubkal", "Puncak Jaya", "Mount Kosciuszko", "Vinson Massif", "Chimborazo", "Mount Etna", "Popocatépetl", "Mount Whitney", "Mount Rainier",
  "Aoraki / Mount Cook", "Mount Kinabalu", "Mount Olympus", "Ras Dejen", "Mount Stanley", "Gongga Shan", "Dhaulagiri", "Nanda Devi", "Ismoil Somoni Peak", "Pico Bolívar", "Mount Elbert"];
const peakFeats = [];
for (const want of PEAKS) {
  const hit = peaks.filter((f) => f.properties.featurecla === "mountain" && (RENAME[f.properties.name] || f.properties.name) === want).sort((a, b) => b.properties.elevation - a.properties.elevation)[0];
  if (!hit) { missing.push("peak " + want); continue; }
  const n = nm(hit.properties, want);
  peakFeats.push({ id: slug(want), ...n, hand: n.hand || !hit.properties.name_ar, type: "point", geometry: hit.geometry, ll: [hit.geometry.coordinates[1], hit.geometry.coordinates[0]], km: 60, mark: true, info: { elev: hit.properties.elevation } });
}
write("mountains", peakFeats);

// Regions: well-known named areas (peninsulas, plains, plateaus, basins, historic regions)
write("regions", polyTopic(regions, ["Siberia", "Anatolia", "Patagonia", "Mesopotamia", ["Lapland", "Lapland"], "Jutland", "Baluchistan", ["Sahel", "Sahel"], "Pampas", "Great Plains", "Gran Chaco", "Llanos",
  "Amazon Basin", "Congo Basin", "Plateau of Tibet", "Deccan Plateau", "Península Ibérica", "Scandinavia", "Arabian Peninsula", "India", ["Indochina Peninsula", "Indochina Peninsula"], "Malay Peninsula",
  "Balkans", ["Somali Peninsula", "Horn of Africa"], "Kamchatka Peninsula", "Crimean Peninsula", "Korea", "Baja California", "Pen. de Yucatán", "Florida", "Brazilian Highlands", "Mongolian Plateau",
  "Canadian Shield", "Kazakh Steppe", "Altiplano", "Northern European Plain", "Great Basin", "Central Siberian Plateau", ["Levant", "Levant"], "Antarctic Peninsula"], 0.05,
  { filter: (f) => !["Range/mtn", "Desert", "Island", "Island group", "Continent"].includes(f.properties.FEATURECLA) }));

// Cities: the biggest cities by population, plus a few famous ones
const famous = new Set(["Paris", "London", "Rome", "Istanbul", "Sydney", "Toronto", "Berlin", "Madrid", "Dubai", "Singapore", "Nairobi", "Lagos", "Kinshasa", "Johannesburg",
  "Lima", "Bogotá", "Santiago", "Jakarta", "Riyadh", "Tehran", "Baghdad", "Bangkok", "Seoul", "Beijing", "Hong Kong", "Moscow", "Cape Town", "Casablanca", "Athens", "Vancouver"]);
const cityList = places.map((f) => f.properties).filter((p) => p.POP_MAX > 0)
  .sort((a, b) => b.POP_MAX - a.POP_MAX);
const picked = []; const pickedNames = new Set();
for (const p of cityList) {
  const en = p.NAME_EN || p.NAME;
  if (pickedNames.has(en) || ["Amaravati", "Howrah"].includes(en)) continue;
  if (picked.length < 70 || (famous.has(en) && picked.length < 110)) { picked.push(p); pickedNames.add(en); }
}
write("cities", picked.map((p) => {
  const en = p.NAME_EN || p.NAME;
  return { id: slug(en + "-" + p.ADM0_A3), name: { en, ar: p.NAME_AR || en, fr: p.NAME_FR || en }, alt: [p.NAME, p.NAMEASCII, p.NAMEALT].filter((x) => x && x !== en), hand: !p.NAME_AR,
    type: "point", geometry: { type: "Point", coordinates: [p.LONGITUDE, p.LATITUDE] }, ll: [p.LATITUDE, p.LONGITUDE], km: 60, mark: true,
    info: { pop: p.POP_MAX, country: p.ADM0_A3, capital: p.ADM0CAP === 1 } };
}));

// Latitude and longitude: special lines
const lat = (y) => ({ type: "LineString", coordinates: Array.from({ length: 73 }, (_, i) => [-180 + i * 5, y]) });
const lon = (x) => ({ type: "LineString", coordinates: Array.from({ length: 35 }, (_, i) => [x, -85 + i * 5]) });
write("latlong", [["Equator", lat(0), [0, 20]], ["Tropic of Cancer", lat(23.44), [23.44, 20]], ["Tropic of Capricorn", lat(-23.44), [-23.44, 20]],
  ["Arctic Circle", lat(66.56), [66.56, 20]], ["Antarctic Circle", lat(-66.56), [-66.56, 20]], ["Prime Meridian", lon(0), [20, 0]], ["180th Meridian", lon(180), [20, 180]]]
  .map(([en, g, ll]) => ({ id: slug(en), name: { en, ar: TR[en][0], fr: TR[en][1] }, alt: [], hand: true, type: "line", geometry: g, ll, km: 6000,
    info: { deg: en.includes("Meridian") ? (en.startsWith("180") ? "180°" : "0°") : `${Math.abs(ll[0])}°${ll[0] > 0 ? "N" : ll[0] < 0 ? "S" : ""}` } })));

if (missing.length) console.log("NOT FOUND:", missing.join("; "));

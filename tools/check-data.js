// Cross-checks geography/data/countries.json against independent datasets and writes a review file.
//
//   (in pkgs) npm pack countries-list@3.4.1 country-list-js@4.0.0 @countrystatecity/countries@3.0.1 cldr-localenames-full@47.0.0
//   node tools/check-data.js pkgs review.json
//
// Checks, for every place:
//   1. English capital: agrees with countries-list, country-list-js, world-countries and the dr5hn database?
//   2. Arabic and French country names: agree with the Unicode CLDR names or the dr5hn translations?
//   3. Arabic and French capital names: agree with dr5hn city translations when it has them?
//   4. Capital location: inside the country's own borders, and close to the dr5hn capital location?
// Anything that disagrees, or that was written by hand in build-data.js, is flagged for a person to review.
const fs = require("fs");
const path = require("path");
const [, , PK, OUT] = process.argv;
const pkg = (p) => path.join(PK, p);
const ROOT = path.join(__dirname, "..");

const ours = require(path.join(ROOT, "geography/data/countries.json"));
const borders = require(path.join(ROOT, "geography/data/borders.json"));
const small = require(path.join(ROOT, "geography/data/borders-small.json"));
const buildSrc = fs.readFileSync(path.join(__dirname, "build-data.js"), "utf8");
const topojson = require(pkg("topojson-client-3.1.0/package/dist/topojson-client.js"));
const wc = require(pkg("world-countries-5.1.0/package/countries.json"));
const cl = require(pkg("countries-list-3.4.1/package/countries.min.json"));
const cljs = require(pkg("country-list-js-4.0.0/package/data/countries.json"));
const loc = (l) => require(pkg(`cldr-localenames-full-47.0.0/package/main/${l}/territories.json`)).main[l].localeDisplayNames.territories;
const cldrAr = loc("ar"), cldrFr = loc("fr");
const DR = pkg("countrystatecity-countries-3.0.1/package/dist/data");

// dr5hn: country record and its capital city record
const dr = {};
for (const dir of fs.readdirSync(DR)) {
  const iso2 = dir.slice(-2);
  const metaFile = path.join(DR, dir, "meta.json");
  if (!fs.existsSync(metaFile)) continue;
  const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
  let capCity = null;
  for (const st of fs.readdirSync(path.join(DR, dir))) {
    const f = path.join(DR, dir, st, "cities.json");
    if (!fs.existsSync(f)) continue;
    for (const c of JSON.parse(fs.readFileSync(f, "utf8"))) if (c.type === "capital") capCity = capCity || c;
  }
  dr[iso2] = { meta, capCity };
}

// Point-in-country test using the game's own borders (sharp outlines for small places).
function inside(poly, pt) {
  let hit = false;
  for (const ring of poly) for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}
const shapes = {};
for (const f of [...topojson.feature(borders, borders.objects.countries).features, ...small.features]) (shapes[f.id] || (shapes[f.id] = [])).push(f.geometry);
function contains(id, lat, lng) {
  for (const g of shapes[id] || []) {
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    for (const p of polys) if (inside(p, [lng, lat])) return true;
  }
  return false;
}
// Coastlines are simplified, so a seaside capital can fall just offshore. Accept points within 20 km of the country.
function nearOrInside(id, lat, lng) {
  if (contains(id, lat, lng)) return true;
  let close = false;   // tiny places (Vatican, atolls): accept a dot within 20 km of the outline itself
  for (const g of shapes[id] || []) (function walk(a) { if (close) return; if (typeof a[0] === "number") { if (km([lat, lng], [a[1], a[0]]) < 20) close = true; } else a.forEach(walk); })(g.coordinates);
  if (close) return true;
  for (let k = 0; k < 16; k++) for (const d of [5, 10, 20]) {
    const a = (k / 16) * 2 * Math.PI, dLat = (d / 111) * Math.cos(a), dLng = (d / (111 * Math.cos(lat * Math.PI / 180))) * Math.sin(a);
    if (contains(id, lat + dLat, lng + dLng)) return true;
  }
  return false;
}
const km = (a, b) => {
  const r = Math.PI / 180, dl = (b[0] - a[0]) * r, dn = (b[1] - a[1]) * r;
  return 12742 * Math.asin(Math.sqrt(Math.sin(dl / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dn / 2) ** 2));
};
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[ً-ٰٟـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
  .replace(/\bst\.?\s/g, "saint ").replace(/[^\p{L}\p{N}]+/gu, "").replace(/^(the|city of)/, "").replace(/^ال/, "");
const same = (a, b) => norm(a) && norm(a) === norm(b);
const handWritten = (table, id) => new RegExp(`const ${table} = \\{[\\s\\S]*?\\b${id}:`).test(buildSrc.split(/\nconst /).map((x, i) => (i ? "const " + x : x)).find((x) => x.startsWith(`const ${table} =`)) || "");

// Capitals that are changing or often taught differently. Shown to the reviewer.
const WATCH = {
  IDN: "Indonesia is moving its capital from Jakarta to Nusantara (on Borneo). Jakarta is used until the move is official.",
  EGY: "Egypt is building a New Administrative Capital east of Cairo. Cairo is still the capital.",
  GNQ: "Equatorial Guinea plans to move its capital from Malabo to Ciudad de la Paz. Malabo is used for now.",
  BDI: "Burundi made Gitega its political capital in 2019; Bujumbura was the capital before. Some books still say Bujumbura.",
  KAZ: "Kazakhstan's capital was named Nur-Sultan from 2019 to 2022 and is now Astana again.",
  NLD: "Amsterdam is the capital, but the government sits in The Hague.",
  BOL: "Bolivia has two capitals: Sucre (constitutional) and La Paz (seat of government). Both are accepted.",
  ZAF: "South Africa has three capitals: Pretoria, Cape Town and Bloemfontein. All are accepted.",
  CIV: "The capital is Yamoussoukro, but the largest city, Abidjan, is often mistaken for it.",
  LKA: "The official capital is Sri Jayawardenepura Kotte; Colombo is the largest city and is also accepted.",
  MYS: "Kuala Lumpur is the capital; the government sits in Putrajaya, which is also accepted.",
  NGA: "Abuja replaced Lagos as the capital in 1991.",
  ESH: "Disputed: the border data draws Western Sahara as only the eastern strip and puts Laayoune inside Morocco (the area Morocco controls). Decide how the game should show it.",
};
const wcBy = Object.fromEntries(wc.map((x) => [x.cca3, x]));
const rows = ours.map((o) => {
  const iso2 = o.cc.toUpperCase(), d = dr[iso2] || {}, flags = [];
  const capList = o.capital ? [o.capital.en, ...o.capAlt] : [];
  const okCap = (v) => !v || !o.capital || capList.some((c) => same(c, v) || norm(v).includes(norm(c)) || norm(c).includes(norm(v)));
  const others = {
    "countries-list": cl[iso2] && cl[iso2].capital, "country-list-js": cljs[iso2] && cljs[iso2].capital,
    "world-countries": wcBy[o.id] && wcBy[o.id].capital.join(" / "), dr5hn: d.meta && d.meta.capital,
  };
  const disagree = Object.entries(others).filter(([, v]) => v && !String(v).split(" / ").some(okCap));
  if (disagree.length) flags.push("Capital differs in: " + disagree.map(([k, v]) => `${k} says “${v}”`).join("; "));
  if (o.capital && !Object.values(others).some(Boolean)) flags.push("No other source lists a capital");

  // country names
  const drT = (d.meta && d.meta.translations) || {};
  const okAr = same(o.name.ar, cldrAr[iso2]) || same(o.name.ar, drT.ar) || o.alt.some((a) => same(a, cldrAr[iso2]));
  const okFr = same(o.name.fr, cldrFr[iso2]) || same(o.name.fr, drT.fr) || o.alt.some((a) => same(a, cldrFr[iso2]));
  const info = [];
  if (!okAr) info.push(`Arabic country name: we use “${o.name.ar}”; Unicode CLDR uses “${cldrAr[iso2] || "-"}”${drT.ar && !same(drT.ar, cldrAr[iso2]) ? `, dr5hn “${drT.ar}”` : ""}. Both may be correct; choose one.`);
  if (!okFr) info.push(`French country name: we use “${o.name.fr}”; Unicode CLDR uses “${cldrFr[iso2] || "-"}”. Both may be correct; choose one.`);

  // capital names in Arabic/French, and location
  let capSource = "";
  if (o.capital) {
    const handAr = handWritten("CAP_I18N", o.id);
    capSource = handAr ? "written by hand" : "Unicode CLDR";
    const ct = (d.capCity && d.capCity.translations) || {};
    if (ct.ar && !same(ct.ar, o.capital.ar) && ![...o.capAlt].some((a) => same(a, ct.ar))) flags.push(`Arabic capital: dr5hn says “${ct.ar}”`);
    if (ct.fr && !same(ct.fr, o.capital.fr) && ![...o.capAlt].some((a) => same(a, ct.fr))) flags.push(`French capital: dr5hn says “${ct.fr}”`);
    if (handAr && !ct.ar) info.push("Arabic and French capital names written by hand; please confirm.");
    if (o.capLL && !nearOrInside(o.id, o.capLL[0], o.capLL[1])) flags.push("Capital dot is outside the country's borders");
    if (o.capLL && d.capCity && same(d.capCity.name, o.capital.en)) {
      const dist = km(o.capLL, [+d.capCity.latitude, +d.capCity.longitude]);
      if (dist > 25) flags.push(`Capital dot is ${Math.round(dist)} km from the dr5hn location`);
    }
  }
  if (WATCH[o.id]) info.push(WATCH[o.id]);
  return {
    info, id: o.id, cc: o.cc, kind: o.sov ? "territory" : "country", region: o.region,
    name: o.name, capital: o.capital, capAlt: o.capAlt, note: o.note, capSource, flags,
  };
});
fs.writeFileSync(OUT, JSON.stringify(rows, null, 1));
const flagged = rows.filter((r) => r.flags.length), noted = rows.filter((r) => r.info.length);
console.log(`${rows.length} places checked: ${flagged.length} disagreements, ${noted.length} with notes to confirm.`);
for (const r of flagged) console.log(`${r.id} ${r.name.en}: ${r.flags.join(" | ")}`);

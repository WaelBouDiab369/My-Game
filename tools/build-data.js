// Builds geography/data/countries.json, geography/data/borders.json and geography/flags/*.svg from npm packages.
//
//   mkdir pkgs && cd pkgs
//   npm pack world-countries@5.1.0 world-atlas@2.0.2 country-state-city@3.2.1 cldr-dates-full@47.0.0 flag-icons@7.6.0
//   for f in *.tgz; do mkdir -p "${f%.tgz}" && tar xzf "$f" -C "${f%.tgz}"; done
//   cd .. && node tools/build-data.js pkgs geography
//
// Edit the tables below to change which places are in the game, their capitals or translations.
const fs = require("fs");
const path = require("path");
const [, , PK, OUT] = process.argv;
const pkg = (p) => path.join(PK, p);

const wc = require(pkg("world-countries-5.1.0/package/countries.json"));
const topo = require(pkg("world-atlas-2.0.2/package/countries-50m.json"));
const topo10 = require(pkg("world-atlas-2.0.2/package/countries-10m.json"));
const topojson = require(pkg("topojson-client-3.1.0/package/dist/topojson-client.js"));
const cities = require(pkg("country-state-city-3.2.1/package/lib/assets/city.json"));
const tz = (l) => require(pkg(`cldr-dates-full-47.0.0/package/main/${l}/timeZoneNames.json`)).main[l].dates.timeZoneNames.zone;
const tzAr = tz("ar"), tzFr = tz("fr");

// The game teaches 197 countries: the 193 UN members + Vatican City, Palestine, Kosovo and Taiwan.
// The other 21 places below are territories, shown only when a player turns on "Include territories".
const EXTRA = ["VAT", "PSE", "UNK", "TWN", "GRL", "PRI", "HKG", "MAC", "ESH", "NCL", "PYF", "GUM", "BMU", "CYM", "ABW", "CUW", "FRO", "ASM", "VIR", "VGB", "MNP", "GIB", "IMN", "TCA", "SXM"];
const SOVEREIGN = { GRL: "DNK", PRI: "USA", HKG: "CHN", MAC: "CHN", ESH: "disputed", NCL: "FRA", PYF: "FRA", GUM: "USA", BMU: "GBR", CYM: "GBR", ABW: "NLD", CUW: "NLD", FRO: "DNK", ASM: "USA", VIR: "USA", VGB: "GBR", MNP: "USA", GIB: "GBR", IMN: "GBR", TCA: "GBR", SXM: "NLD" };

// English capitals: first is shown, the rest are also accepted.
const CAP = {
  BOL: ["Sucre", "La Paz"], SWZ: ["Mbabane", "Lobamba"], ZAF: ["Pretoria", "Cape Town", "Bloemfontein"], LKA: ["Sri Jayawardenepura Kotte", "Colombo", "Kotte"],
  MYS: ["Kuala Lumpur", "Putrajaya"], HKG: [], MAC: [], MNG: ["Ulaanbaatar", "Ulan Bator"], PYF: ["Papeete"], ISL: ["Reykjavík", "Reykjavik"],
  KIR: ["South Tarawa", "Tarawa"], USA: ["Washington, D.C.", "Washington", "Washington DC"], MMR: ["Naypyidaw", "Nay Pyi Taw", "Naypyitaw"],
  UKR: ["Kyiv", "Kiev"], GUM: ["Hagåtña", "Agana", "Hagatna"], ATG: ["Saint John's", "St John's"], GRD: ["St. George's", "Saint George's"],
  PSE: ["East Jerusalem", "Ramallah", "Jerusalem"], ISR: ["Jerusalem", "Tel Aviv"], KAZ: ["Astana"], YEM: ["Sana'a", "Sanaa"], VAT: ["Vatican City", "Vatican"],
  SMR: ["San Marino", "City of San Marino"], ESH: ["Laayoune", "El Aaiún", "El Aaiun"], MDA: ["Chișinău", "Chisinau"], PLW: ["Ngerulmud", "Melekeok"],
  CIV: ["Yamoussoukro"], BDI: ["Gitega"], NRU: ["Yaren"],
};
// Arabic and French capital names where the Unicode CLDR has none or a wrong one. [arabic, french]
const CAP_I18N = {
  ALB: ["تيرانا", "Tirana"], AND: ["أندورا لا فيلا", "Andorre-la-Vieille"], ABW: ["أورانيستاد", "Oranjestad"], AUS: ["كانبرا", "Canberra"],
  BHR: ["المنامة", "Manama"], BRB: ["بريدجتاون", "Bridgetown"], BLZ: ["بلموبان", "Belmopan"], BMU: ["هاميلتون", "Hamilton"], BRA: ["برازيليا", "Brasilia"],
  VGB: ["رود تاون", "Road Town"], BRN: ["بندر سري بكاوان", "Bandar Seri Begawan"], BDI: ["جيتيغا", "Gitega"], CPV: ["برايا", "Praia"],
  CMR: ["ياوندي", "Yaoundé"], CAN: ["أوتاوا", "Ottawa"], CYM: ["جورج تاون", "George Town"], CHN: ["بكين", "Pékin"], COM: ["موروني", "Moroni"],
  CRI: ["سان خوسيه", "San José"], CIV: ["ياموسوكرو", "Yamoussoukro"], CUW: ["فيلمستاد", "Willemstad"], DMA: ["روزو", "Roseau"], ECU: ["كيتو", "Quito"],
  SLV: ["سان سلفادور", "San Salvador"], ERI: ["أسمرة", "Asmara"], FRO: ["تورشافن", "Tórshavn"], FJI: ["سوفا", "Suva"], PYF: ["بابيتي", "Papeete"],
  GRL: ["نوك", "Nuuk"], GRD: ["سانت جورجز", "Saint-Georges"], GUM: ["هاغاتنا", "Hagåtña"], GTM: ["مدينة غواتيمالا", "Guatemala"], GUY: ["جورج تاون", "Georgetown"],
  IND: ["نيودلهي", "New Delhi"], IMN: ["دوغلاس", "Douglas"], JAM: ["كينغستون", "Kingston"], KAZ: ["أستانا", "Astana"], UNK: ["بريشتينا", "Pristina"],
  KWT: ["مدينة الكويت", "Koweït"], MWI: ["ليلونغوي", "Lilongwe"], MDV: ["ماليه", "Malé"], MLT: ["فاليتا", "La Valette"], MUS: ["بور لويس", "Port-Louis"],
  FSM: ["باليكير", "Palikir"], MAR: ["الرباط", "Rabat"], MMR: ["نايبيداو", "Naypyidaw"], NRU: ["يارين", "Yaren"], NPL: ["كاتماندو", "Katmandou"],
  NZL: ["ويلينغتون", "Wellington"], NGA: ["أبوجا", "Abuja"], PAK: ["إسلام آباد", "Islamabad"], PLW: ["نغيرولمود", "Ngerulmud"], PAN: ["مدينة بنما", "Panama"],
  QAT: ["الدوحة", "Doha"], KNA: ["باستير", "Basseterre"], LCA: ["كاستريز", "Castries"], VCT: ["كينغستاون", "Kingstown"], SYC: ["فيكتوريا", "Victoria"],
  SXM: ["فيليبسبورغ", "Philipsburg"], SLB: ["هونيارا", "Honiara"], ZAF: ["بريتوريا", "Pretoria"], CHE: ["برن", "Berne"], TZA: ["دودوما", "Dodoma"],
  TON: ["نوكو ألوفا", "Nuku'alofa"], TUR: ["أنقرة", "Ankara"], TCA: ["كوكبيرن تاون", "Cockburn Town"], VIR: ["شارلوت أمالي", "Charlotte-Amélie"],
  ARE: ["أبوظبي", "Abou Dabi"], USA: ["واشنطن العاصمة", "Washington"], VUT: ["بورت فيلا", "Port-Vila"], VNM: ["هانوي", "Hanoï"], YEM: ["صنعاء", "Sanaa"],
  // corrections to CLDR matches
  ATG: ["سانت جونز", "Saint John's"], BOL: ["سوكري", "Sucre"], PSE: ["القدس الشرقية", "Jérusalem-Est"], LKA: ["سري جاياواردنابورا كوتي", "Sri Jayawardenepura Kotte"],
  LBY: ["طرابلس", "Tripoli"], MNG: ["أولان باتور", "Oulan-Bator"], KOR: ["سيول", "Séoul"], UKR: ["كييف", "Kyiv"], KIR: ["تاراوا الجنوبية", "Tarawa-Sud"],
  VAT: ["الفاتيكان", "Cité du Vatican"], MEX: ["مكسيكو سيتي", "Mexico"], ISR: ["القدس", "Jérusalem"],
};
// Extra answers accepted in any language (other capitals of multi-capital countries, common spellings).
const CAP_ALSO = {
  BOL: ["لا باز"], PSE: ["رام الله", "القدس"], ISR: ["تل أبيب", "Tel-Aviv", "Tel Aviv-Yafo"], ZAF: ["كيب تاون", "بلومفونتين", "Le Cap"], KOR: ["سول"], UKR: ["Kiev"], LKA: ["كولومبو"], MYS: ["بوتراجايا"], SWZ: ["لوبامبا"],
};
// Capital coordinates the city database does not cover (or gets wrong). [lat, lng]
const CAP_LL = {
  ASM: [-14.2756, -170.702], ABW: [12.524, -70.027], BMU: [32.2949, -64.783], VGB: [18.4286, -64.6185], CYM: [19.2866, -81.3744], TCD: [12.1348, 15.0557],
  CUW: [12.1091, -68.9316], FRO: [62.0079, -6.79], PYF: [-17.535, -149.5696], GIB: [36.1408, -5.3536], GRL: [64.1814, -51.6941], GUM: [13.4757, 144.7489],
  GNB: [11.8636, -15.5977], IMN: [54.1523, -4.4861], KAZ: [51.1694, 71.4491], UNK: [42.6629, 21.1655], MDG: [-18.8792, 47.5079], MHL: [7.0897, 171.3803],
  MRT: [18.0735, -15.9582], MEX: [19.4326, -99.1332], MCO: [43.7384, 7.4246], MNG: [47.8864, 106.9057], NCL: [-22.2758, 166.458], NER: [13.5116, 2.1254],
  MNP: [15.185, 145.7467], PSE: [31.7834, 35.2339], PRY: [-25.2637, -57.5759], PRI: [18.4655, -66.1057], KNA: [17.3026, -62.7177], SXM: [18.026, -63.0458],
  SSD: [4.8594, 31.5713], TJK: [38.5598, 68.787], TCA: [21.4612, -71.1419], VIR: [18.3419, -64.9307], VAT: [41.9029, 12.4534], ESH: [27.1253, -13.1625],
  CRI: [9.9333, -84.0833], ARE: [24.4539, 54.3773], COL: [4.711, -74.0721], FSM: [6.9248, 158.1611], PAN: [8.9824, -79.5199], PLW: [7.5006, 134.6242],
};
// Short notes shown after answering and in Study mode, for capitals that are disputed or shared.
const NOTE = {
  ISR: {
    en: "Israel declares Jerusalem its capital, but most countries keep their embassies in Tel Aviv. Both answers are accepted.",
    ar: "تعلن إسرائيل القدس عاصمة لها، لكن معظم الدول تُبقي سفاراتها في تل أبيب. تُقبل الإجابتان.",
    fr: "Israël déclare Jérusalem capitale, mais la plupart des pays gardent leur ambassade à Tel-Aviv. Les deux réponses sont acceptées.",
  },
  PSE: {
    en: "Palestine declares East Jerusalem its capital; its government works from Ramallah. Both answers are accepted.",
    ar: "تعلن فلسطين القدس الشرقية عاصمة لها، وتعمل حكومتها من رام الله. تُقبل الإجابتان.",
    fr: "La Palestine déclare Jérusalem-Est capitale ; son gouvernement siège à Ramallah. Les deux réponses sont acceptées.",
  },
};
const NAME_EN = { CIV: "Côte d'Ivoire", TUR: "Türkiye", CZE: "Czechia", COD: "DR Congo", VIR: "U.S. Virgin Islands", MKD: "North Macedonia", SWZ: "Eswatini", CPV: "Cabo Verde", TLS: "Timor-Leste" };
const NAME_ALT = {
  CIV: ["Ivory Coast"], TUR: ["Turkey", "Turquie", "تركيا"], CZE: ["Czech Republic"], COD: ["Democratic Republic of the Congo", "Congo Kinshasa", "DRC", "RDC"],
  COG: ["Congo", "Congo Brazzaville", "Republic of Congo"], USA: ["USA", "United States of America", "America", "US", "أمريكا"],
  GBR: ["UK", "Britain", "Great Britain", "England", "بريطانيا", "Angleterre"], ARE: ["UAE", "Emirates", "الإمارات"], SWZ: ["Swaziland"], CPV: ["Cape Verde"],
  MKD: ["Macedonia"], MMR: ["Burma"], TLS: ["East Timor"], KOR: ["Korea", "Republic of Korea"], PRK: ["DPRK"], VAT: ["Vatican", "Holy See"],
  FSM: ["Federated States of Micronesia"], NLD: ["Holland", "هولندا"], BHS: ["The Bahamas"], GMB: ["The Gambia"], VCT: ["Saint Vincent"], KNA: ["Saint Kitts"],
  STP: ["Sao Tome"], BIH: ["Bosnia"], TTO: ["Trinidad"], ATG: ["Antigua"], LAO: ["Lao"], RUS: ["Russian Federation"], SYR: ["Syrian Arab Republic"],
  UNK: ["Kosova"], VIR: ["US Virgin Islands", "Virgin Islands"], PSE: ["State of Palestine"], HKG: ["Hong Kong SAR"], MAC: ["Macao"],
};

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
const sel = wc.filter((x) => x.unMember || EXTRA.includes(x.cca3));
const byCC = {};
for (const c of cities) (byCC[c[1]] || (byCC[c[1]] = [])).push(c);
const zoneByCity = {};
(function walk(o, p) {
  for (const k in o) {
    if (o[k] && typeof o[k] === "object" && !("exemplarCity" in o[k]) && !("long" in o[k])) walk(o[k], p.concat(k));
    else zoneByCity[norm(k.replace(/_/g, " "))] = p.concat(k);
  }
})(tzAr, []);
const zoneCity = (tree, z) => { const n = z && z.reduce((a, k) => a && a[k], tree); return n && n.exemplarCity; };

// Borders: keep our places, tag each shape with its 3-letter code.
const byNum = Object.fromEntries(sel.map((x) => [x.ccn3, x.cca3]));
const REDIRECT = { Kosovo: "UNK", Somaliland: "SOM", "N. Cyprus": "CYP" };
topo.objects.countries.geometries = topo.objects.countries.geometries
  .map((g) => { const id = byNum[g.id] || REDIRECT[g.properties.name]; return id ? { type: g.type, arcs: g.arcs, id } : null; })
  .filter(Boolean);
const hasShape = new Set(topo.objects.countries.geometries.map((g) => g.id));

const missing = [];
const out = sel.map((x) => {
  const id = x.cca3, cc = x.cca2.toLowerCase();
  const capEn = CAP[id] !== undefined ? CAP[id] : x.capital;
  let capAr = "", capFr = "", capLL = null;
  if (capEn.length) {
    const z = capEn.map((c) => zoneByCity[norm(c)]).find(Boolean);
    capAr = (CAP_I18N[id] && CAP_I18N[id][0]) || zoneCity(tzAr, z) || "";
    capFr = (CAP_I18N[id] && CAP_I18N[id][1]) || zoneCity(tzFr, z) || capEn[0];
    if (!capAr) missing.push(id + " arabic capital");
    capLL = CAP_LL[id] || null;
    if (!capLL) for (const c of capEn) { const hit = (byCC[x.cca2] || []).find((r) => norm(r[0]) === norm(c)); if (hit) { capLL = [+(+hit[3]).toFixed(4), +(+hit[4]).toFixed(4)]; break; } }
    if (!capLL) missing.push(id + " capital coordinates");
  }
  const en = NAME_EN[id] || x.name.common;
  return {
    id, cc, region: x.region, sub: x.subregion || "", ll: x.latlng, area: x.area, sov: SOVEREIGN[id] || null, poly: hasShape.has(id),
    name: { en, ar: x.translations.ara.common, fr: x.translations.fra.common },
    alt: [...new Set([x.name.common, x.name.official, x.translations.ara.official, x.translations.fra.official, ...(NAME_ALT[id] || [])])].filter((n) => n && n !== en),
    capital: capEn.length ? { en: capEn[0], ar: capAr, fr: capFr } : null,
    capAlt: capEn.length ? [...new Set([...capEn.slice(1), ...(CAP_ALSO[id] || [])])] : [],
    capLL, note: NOTE[id] || null,
  };
});
out.sort((a, b) => a.name.en.localeCompare(b.name.en));
if (missing.length) { console.error("Missing:", missing.join(", ")); process.exit(1); }

fs.writeFileSync(path.join(OUT, "data/countries.json"), JSON.stringify(out));
fs.writeFileSync(path.join(OUT, "data/borders.json"), JSON.stringify(topo));

// Sharper outlines (1:10 million) for small countries and islands, which the 1:50 million borders draw too roughly.
const SMALL = new Set(out.filter((o) => o.area < 30000).map((o) => o.id));
const round = (c) => (typeof c[0] === "number" ? [+c[0].toFixed(4), +c[1].toFixed(4)] : c.map(round));
const small = topojson.feature(topo10, topo10.objects.countries).features
  .map((f) => ({ id: byNum[f.id] || REDIRECT[f.properties.name], geometry: f.geometry }))
  .filter((f) => f.id && SMALL.has(f.id) && f.geometry)
  .map((f) => ({ type: "Feature", id: f.id, properties: {}, geometry: { type: f.geometry.type, coordinates: round(f.geometry.coordinates) } }));
fs.writeFileSync(path.join(OUT, "data/borders-small.json"), JSON.stringify({ type: "FeatureCollection", features: small }));
const covered = new Set(small.map((f) => f.id));
console.log(`Sharper outlines for ${covered.size} of ${SMALL.size} small places; still without a shape: ${out.filter((o) => !o.poly && !covered.has(o.id)).map((o) => o.id).join(", ") || "none"}.`);
fs.mkdirSync(path.join(OUT, "flags"), { recursive: true });
for (const o of out) fs.copyFileSync(pkg(`flag-icons-7.6.0/package/flags/4x3/${o.cc}.svg`), path.join(OUT, `flags/${o.cc}.svg`));
console.log(`${out.filter((o) => !o.sov).length} countries + ${out.filter((o) => o.sov).length} territories, ${out.filter((o) => o.capital).length} with capitals, ${out.length} flags.`);

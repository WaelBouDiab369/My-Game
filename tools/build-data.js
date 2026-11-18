// Builds data/countries.json, data/borders.json and flags/*.svg from npm packages.
//
//   mkdir pkgs && cd pkgs
//   npm pack world-countries@5.1.0 world-atlas@2.0.2 country-state-city@3.2.1 cldr-dates-full@47.0.0 flag-icons@7.6.0
//   for f in *.tgz; do mkdir -p "${f%.tgz}" && tar xzf "$f" -C "${f%.tgz}"; done
//   cd .. && node tools/build-data.js pkgs .
//
// Edit the tables below to change which places are in the game, their capitals or translations.
const fs = require("fs");
const path = require("path");
const [, , PK, OUT] = process.argv;
const pkg = (p) => path.join(PK, p);

const wc = require(pkg("world-countries-5.1.0/package/countries.json"));
const topo = require(pkg("world-atlas-2.0.2/package/countries-50m.json"));
const cities = require(pkg("country-state-city-3.2.1/package/lib/assets/city.json"));
const tz = (l) => require(pkg(`cldr-dates-full-47.0.0/package/main/${l}/timeZoneNames.json`)).main[l].dates.timeZoneNames.zone;
const tzAr = tz("ar"), tzFr = tz("fr");

// 193 UN members + these 25 = 218 places.
const EXTRA = ["VAT", "PSE", "UNK", "TWN", "GRL", "PRI", "HKG", "MAC", "ESH", "NCL", "PYF", "GUM", "BMU", "CYM", "ABW", "CUW", "FRO", "ASM", "VIR", "VGB", "MNP", "GIB", "IMN", "TCA", "SXM"];
const SOVEREIGN = { GRL: "DNK", PRI: "USA", HKG: "CHN", MAC: "CHN", ESH: "disputed", NCL: "FRA", PYF: "FRA", GUM: "USA", BMU: "GBR", CYM: "GBR", ABW: "NLD", CUW: "NLD", FRO: "DNK", ASM: "USA", VIR: "USA", VGB: "GBR", MNP: "USA", GIB: "GBR", IMN: "GBR", TCA: "GBR", SXM: "NLD" };

// English capitals: first is shown, the rest are also accepted.
const CAP = {
  BOL: ["Sucre", "La Paz"], SWZ: ["Mbabane", "Lobamba"], ZAF: ["Pretoria", "Cape Town", "Bloemfontein"], LKA: ["Sri Jayawardenepura Kotte", "Colombo", "Kotte"],
  MYS: ["Kuala Lumpur", "Putrajaya"], HKG: [], MAC: [], MNG: ["Ulaanbaatar", "Ulan Bator"], PYF: ["Papeete"], ISL: ["Reykjavík", "Reykjavik"],
  KIR: ["South Tarawa", "Tarawa"], USA: ["Washington, D.C.", "Washington", "Washington DC"], MMR: ["Naypyidaw", "Nay Pyi Taw", "Naypyitaw"],
  UKR: ["Kyiv", "Kiev"], GUM: ["Hagåtña", "Agana", "Hagatna"], ATG: ["Saint John's", "St John's"], GRD: ["St. George's", "Saint George's"],
  PSE: ["Ramallah", "East Jerusalem", "Jerusalem"], KAZ: ["Astana"], YEM: ["Sana'a", "Sanaa"], VAT: ["Vatican City", "Vatican"],
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
  ATG: ["سانت جونز", "Saint John's"], BOL: ["سوكري", "Sucre"], PSE: ["رام الله", "Ramallah"], LKA: ["سري جاياواردنابورا كوتي", "Sri Jayawardenepura Kotte"],
  LBY: ["طرابلس", "Tripoli"], MNG: ["أولان باتور", "Oulan-Bator"], KOR: ["سيول", "Séoul"], UKR: ["كييف", "Kyiv"], KIR: ["تاراوا الجنوبية", "Tarawa-Sud"],
  VAT: ["الفاتيكان", "Cité du Vatican"], MEX: ["مكسيكو سيتي", "Mexico"], ISR: ["القدس", "Jérusalem"],
};
// Extra answers accepted in any language (other capitals of multi-capital countries, common spellings).
const CAP_ALSO = {
  BOL: ["لا باز"], ZAF: ["كيب تاون", "بلومفونتين", "Le Cap"], KOR: ["سول"], UKR: ["Kiev"], LKA: ["كولومبو"], MYS: ["بوتراجايا"], SWZ: ["لوبامبا"],
};
// Capital coordinates the city database does not cover (or gets wrong). [lat, lng]
const CAP_LL = {
  ASM: [-14.2756, -170.702], ABW: [12.524, -70.027], BMU: [32.2949, -64.783], VGB: [18.4286, -64.6185], CYM: [19.2866, -81.3744], TCD: [12.1348, 15.0557],
  CUW: [12.1091, -68.9316], FRO: [62.0079, -6.79], PYF: [-17.535, -149.5696], GIB: [36.1408, -5.3536], GRL: [64.1814, -51.6941], GUM: [13.4757, 144.7489],
  GNB: [11.8636, -15.5977], IMN: [54.1523, -4.4861], KAZ: [51.1694, 71.4491], UNK: [42.6629, 21.1655], MDG: [-18.8792, 47.5079], MHL: [7.0897, 171.3803],
  MRT: [18.0735, -15.9582], MEX: [19.4326, -99.1332], MCO: [43.7384, 7.4246], MNG: [47.8864, 106.9057], NCL: [-22.2758, 166.458], NER: [13.5116, 2.1254],
  MNP: [15.185, 145.7467], PSE: [31.9038, 35.2034], PRY: [-25.2637, -57.5759], PRI: [18.4655, -66.1057], KNA: [17.3026, -62.7177], SXM: [18.026, -63.0458],
  SSD: [4.8594, 31.5713], TJK: [38.5598, 68.787], TCA: [21.4612, -71.1419], VIR: [18.3419, -64.9307], VAT: [41.9029, 12.4534], ESH: [27.1253, -13.1625],
  CRI: [9.9333, -84.0833], ARE: [24.4539, 54.3773], COL: [4.711, -74.0721], FSM: [6.9248, 158.1611], PAN: [8.9824, -79.5199], PLW: [7.5006, 134.6242],
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
    capLL,
  };
});
out.sort((a, b) => a.name.en.localeCompare(b.name.en));
if (missing.length) { console.error("Missing:", missing.join(", ")); process.exit(1); }

fs.writeFileSync(path.join(OUT, "data/countries.json"), JSON.stringify(out));
fs.writeFileSync(path.join(OUT, "data/borders.json"), JSON.stringify(topo));
fs.mkdirSync(path.join(OUT, "flags"), { recursive: true });
for (const o of out) fs.copyFileSync(pkg(`flag-icons-7.6.0/package/flags/4x3/${o.cc}.svg`), path.join(OUT, `flags/${o.cc}.svg`));
console.log(`${out.length} places, ${out.filter((o) => o.capital).length} with capitals, ${out.length} flags.`);

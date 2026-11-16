const P=process.argv[2];
const c=require(P+"/world-countries-5.1.0/package/countries.json");
const topo=require(P+"/world-atlas-2.0.2/package/countries-50m.json");
const extra=["VAT","PSE","UNK","TWN","GRL","PRI","HKG","MAC","ESH","NCL","PYF","GUM","BMU","CYM","ABW","CUW","FRO","ASM","VIR","VGB","MNP","GIB","IMN","TCA","SXM"];
const sovereign={GRL:"Denmark",PRI:"United States",HKG:"China",MAC:"China",ESH:"disputed",NCL:"France",PYF:"France",GUM:"United States",BMU:"United Kingdom",CYM:"United Kingdom",ABW:"Netherlands",CUW:"Netherlands",FRO:"Denmark",ASM:"United States",VIR:"United States",VGB:"United Kingdom",MNP:"United States",GIB:"United Kingdom",IMN:"United Kingdom",TCA:"United Kingdom",SXM:"Netherlands"};
// capital overrides: first = displayed spelling; rest also accepted
const cap={BOL:["Sucre","La Paz"],SWZ:["Mbabane","Lobamba"],ZAF:["Pretoria","Cape Town","Bloemfontein"],LKA:["Sri Jayawardenepura Kotte","Colombo","Kotte"],MYS:["Kuala Lumpur","Putrajaya"],HKG:[],MAC:[],
 MNG:["Ulaanbaatar","Ulan Bator"],PYF:["Papeete"],ISL:["Reykjavík","Reykjavik"],KIR:["South Tarawa","Tarawa"],USA:["Washington, D.C.","Washington","Washington DC"],
 MMR:["Naypyidaw","Nay Pyi Taw","Naypyitaw"],UKR:["Kyiv","Kiev"],GUM:["Hagåtña","Agana"],ATG:["Saint John's","St John's"],GRD:["St. George's","Saint George's"],
 PSE:["Ramallah","East Jerusalem","Jerusalem"],CIV:["Yamoussoukro"],KAZ:["Astana"],YEM:["Sana'a","Sanaa"],BRN:["Bandar Seri Begawan"],VAT:["Vatican City","Vatican"],
 SMR:["San Marino","City of San Marino"],TWN:["Taipei"],TCA:["Cockburn Town"],ESH:["Laayoune","El Aaiún","El Aaiun"],NRU:["Yaren"],MDA:["Chișinău","Chisinau"],
 BDI:["Gitega"],PLW:["Ngerulmud","Melekeok"],KOR:["Seoul"],PRK:["Pyongyang"],VNM:["Hanoi"],TLS:["Dili"],CZE:["Prague"],ROU:["Bucharest"],MAC:[]};
const names={CIV:"Côte d'Ivoire",TUR:"Türkiye",CZE:"Czechia",COD:"DR Congo",VIR:"U.S. Virgin Islands",MKD:"North Macedonia",SWZ:"Eswatini",CPV:"Cabo Verde",TLS:"Timor-Leste"};
const nameAlt={CIV:["Ivory Coast"],TUR:["Turkey"],CZE:["Czech Republic"],COD:["Democratic Republic of the Congo","Congo Kinshasa","DRC"],COG:["Congo","Congo Brazzaville","Republic of Congo"],
 USA:["USA","United States of America","America","US"],GBR:["UK","Britain","Great Britain","England"],ARE:["UAE","Emirates"],SWZ:["Swaziland"],CPV:["Cape Verde"],MKD:["Macedonia"],
 MMR:["Burma"],TLS:["East Timor"],KOR:["Korea","Republic of Korea"],PRK:["DPRK"],VAT:["Vatican","Holy See"],FSM:["Federated States of Micronesia"],NLD:["Holland"],
 BHS:["The Bahamas"],GMB:["The Gambia"],VCT:["Saint Vincent"],KNA:["Saint Kitts"],STP:["Sao Tome"],BIH:["Bosnia"],TTO:["Trinidad"],ATG:["Antigua"],PNG:["Papua"],
 LAO:["Lao"],RUS:["Russian Federation"],SYR:["Syrian Arab Republic"],UNK:["Kosova"],VIR:["US Virgin Islands","Virgin Islands"],PSE:["State of Palestine"],HKG:["Hong Kong SAR"],MAC:["Macao"]};
const sel=c.filter(x=>x.unMember||extra.includes(x.cca3));
const byNum={};sel.forEach(x=>byNum[x.ccn3]=x.cca3);
const redirect={"Kosovo":"UNK","Somaliland":"SOM","N. Cyprus":"CYP"};
topo.objects.countries.geometries=topo.objects.countries.geometries.map(g=>{const id=byNum[g.id]||redirect[g.properties.name];if(!id)return null;return {type:g.type,arcs:g.arcs,id};}).filter(Boolean);
const polyIds=new Set(topo.objects.countries.geometries.map(g=>g.id));
const out=sel.map(x=>{const id=x.cca3;const caps=cap[id]!==undefined?cap[id]:x.capital;
 return {id,name:names[id]||x.name.common,alt:[...new Set([x.name.common,x.name.official,...(nameAlt[id]||[])])].filter(n=>n!==(names[id]||x.name.common)),
 capital:caps,region:x.region,sub:x.subregion||"",ll:x.latlng,area:x.area,flag:x.flag,sov:sovereign[id]||null,poly:polyIds.has(id)}});
out.sort((a,b)=>a.name.localeCompare(b.name));
require("fs").writeFileSync(process.argv[3]+"/countries.json",JSON.stringify(out));
require("fs").writeFileSync(process.argv[3]+"/borders.json",JSON.stringify(topo));
console.log(out.length,"countries;",out.filter(o=>o.capital.length).length,"with capitals; no poly:",out.filter(o=>!o.poly).map(o=>o.id));

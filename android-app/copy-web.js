// Copies the website files into www/ so Capacitor can package them inside the Android app.
const fs = require("fs"), path = require("path");
const SRC = path.join(__dirname, ".."), OUT = path.join(__dirname, "www");
const ITEMS = ["index.html", "about.html", "privacy.html", "img", "shared", "geography", "chemistry", "physics", "math", "biology"];
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT);
for (const it of ITEMS) fs.cpSync(path.join(SRC, it), path.join(OUT, it), { recursive: true });
console.log("Copied website into www/");

import fs from "node:fs";
import path from "node:path";

fs.mkdirSync("dist/patterns", { recursive: true });

for (const file of ["foundations.css", "components.css", "assessment.css", "skins.css"]) {
  fs.copyFileSync(path.join("src/styles", file), path.join("dist", file));
}

for (const file of fs.readdirSync("patterns")) {
  if (file.endsWith(".html")) {
    fs.copyFileSync(path.join("patterns", file), path.join("dist/patterns", file));
  }
}

const tokens = fs.readFileSync("dist/tokens.css", "utf8");
const foundations = fs.readFileSync("dist/foundations.css", "utf8");
const components = fs.readFileSync("dist/components.css", "utf8");
const assessment = fs.readFileSync("dist/assessment.css", "utf8");
fs.writeFileSync("dist/all.css", [tokens, foundations, components, assessment].join("\n"));

const outputFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else outputFiles.push(path.relative("dist", full));
  }
}
walk("dist");

if (outputFiles.some(file => file.endsWith(".js") || file.endsWith(".mjs"))) {
  throw new Error("Runtime JavaScript artifact detected in dist/");
}

const bytes = Object.fromEntries(outputFiles.map(file => [file, fs.statSync(path.join("dist", file)).size]));
fs.writeFileSync("dist/build-metrics.json", JSON.stringify({ files: outputFiles.sort(), bytes }, null, 2) + "\n");
console.log(JSON.stringify({ files: outputFiles.sort(), bytes }));

import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";

fs.mkdirSync("dist", { recursive: true });
fs.mkdirSync("build/entries", { recursive: true });

const entries = {
  index: `import "../../build/fable/Index.fs.js";`,
  switch: `import { register } from "../../build/fable/Switch.fs.js";\nregister();`,
  slider: `import { register } from "../../build/fable/Slider.fs.js";\nregister();`
};

for (const [name, source] of Object.entries(entries)) {
  const entry = path.resolve("build/entries", `${name}.mjs`);
  fs.writeFileSync(entry, source + "\n");
  await build({
    entryPoints: [entry],
    outfile: path.resolve("dist", `${name}.js`),
    bundle: true,
    minify: true,
    sourcemap: true,
    format: "esm",
    platform: "browser",
    target: ["es2022"],
    legalComments: "none"
  });
}

fs.copyFileSync("src/styles/foundations.css", "dist/foundations.css");

const sizes = Object.fromEntries(
  ["index.js", "switch.js", "slider.js", "tokens.css", "foundations.css"].map(file => [
    file,
    fs.statSync(path.join("dist", file)).size
  ])
);

fs.writeFileSync("dist/build-metrics.json", JSON.stringify({ bytes: sizes }, null, 2) + "\n");
console.log(JSON.stringify({ built: Object.keys(entries), bytes: sizes }));

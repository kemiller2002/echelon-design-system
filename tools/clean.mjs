import fs from "node:fs";

for (const path of ["build", "dist"]) {
  fs.rmSync(path, { recursive: true, force: true });
}

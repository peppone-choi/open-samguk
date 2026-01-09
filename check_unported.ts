import fs from "fs";
import path from "path";

const legacyDir = "legacy/hwe/sammo/ActionItem";
const packagesDir = "packages/logic/src/domain/items";

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith(".ts")) {
      results.push(fullPath);
    }
  }
  return results;
}

const portedFiles = walk(packagesDir);
const legacyFiles = fs.readdirSync(legacyDir).filter((f) => f.endsWith(".php"));
const portedCodes = new Set<string>();

for (const f of portedFiles) {
  const content = fs.readFileSync(f, "utf-8");
  // Match both code = "..." and readonly code = "..."
  const matches = content.match(/code\s*[:=]\s*["']([^"']+)["']/g);
  if (matches) {
    for (const m of matches) {
      const code = m.match(/["']([^"']+)["']/)![1];
      portedCodes.add(code);
    }
  }
}

const unported = legacyFiles.filter((f) => {
  const fileName = f.replace(".php", "");
  return !portedCodes.has(fileName);
});

console.log(`Unported items (${unported.length}):`);
console.log(unported.join("\n"));

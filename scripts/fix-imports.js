import fs from "fs";
import path from "path";

function fixDir(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      fixDir(fullPath);
      continue;
    }

    if (!file.endsWith(".js")) continue;

    let content = fs.readFileSync(fullPath, "utf8");

    content = content.replace(
      /from\s+["'](\.\/[^"']+)["']/g,
      (match, importPath) => {
        if (importPath.endsWith(".js")) {
          return match;
        }

        return `from "${importPath}.js"`;
      }
    );

    fs.writeFileSync(fullPath, content);
  }
}

fixDir("./dist");

console.log("Import paths fixed!");
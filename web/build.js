const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "public");
const out = path.join(__dirname, "dist");

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const stamp = new Date().toISOString();

for (const file of fs.readdirSync(src)) {
  const content = fs.readFileSync(path.join(src, file), "utf8");
  const stamped = content.replace(/__BUILD_TIME__/g, stamp);
  fs.writeFileSync(path.join(out, file), stamped);
}

console.log("build complete", stamp);

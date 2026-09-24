import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(process.argv[2] || ".");
const repository = process.argv[3] || process.env.GITHUB_REPOSITORY || "";
const standardsRoot = path.resolve(process.env.README_STANDARDS_ROOT || path.join(__dirname, ".."));
const metadataPath = path.join(standardsRoot, "docs", "repository-metadata.json");

const errors = [];
const warnings = [];

function read(rel) {
  const p = path.join(root, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

function addError(msg) { errors.push(msg); }
function addWarning(msg) { warnings.push(msg); }

const en = read("README.md");
const zh = read("README.zh-CN.md");

if (!en) addError("README.md is missing.");
if (!zh) addError("README.zh-CN.md is missing.");

if (en && !en.includes("README.zh-CN.md")) {
  addError("README.md is missing the Simplified Chinese language switch.");
}
if (zh && !zh.includes("README.md")) {
  addError("README.zh-CN.md is missing the English language switch.");
}

const isProfile = repository.toLowerCase() === "dream22180971/dream22180971";

for (const pair of [["README.md", en], ["README.zh-CN.md", zh]]) {
  const name = pair[0];
  const content = pair[1];
  if (!content) continue;

  if (!isProfile && content.includes("readme-typing-svg")) {
    addError(name + ": typing animation is reserved for the profile README.");
  }

  for (const marker of ["README-V2-BILINGUAL", "ORIGINAL-DOCS", "TODO: screenshot"]) {
    if (content.includes(marker)) {
      addError(name + ": stale legacy marker found: " + marker);
    }
  }

  const badgeCount = (content.match(/img\.shields\.io\/badge/g) || []).length;
  if (badgeCount > 6) {
    addWarning(name + ": " + badgeCount + " badges found; recommended maximum is 6 prominent badges.");
  }
}

function hasQuickStart(content, lang) {
  if (!content) return false;
  const patterns = lang === "en"
    ? [/Quick Start/i, /Get it/i, /Download/i, /Live Site/i]
    : [/快速开始/, /5 分钟快速开始/, /直接使用/, /下载/, /在线地址/];
  return patterns.some((r) => r.test(content));
}

if (en && !hasQuickStart(en, "en")) {
  addWarning("README.md: no obvious Quick Start / Download / Get it section.");
}
if (zh && !hasQuickStart(zh, "zh")) {
  addWarning("README.zh-CN.md: no obvious 快速开始 / 下载 / 直接使用 section.");
}

const pkgText = read("package.json");
if (pkgText && en) {
  try {
    const pkg = JSON.parse(pkgText);
    const scripts = pkg.scripts || {};
    const combinedReadme = [en, zh || ""].join("\n");
    const npmRun = /npm run ([A-Za-z0-9:_-]+)/g;
    let match;
    const seen = new Set();

    while ((match = npmRun.exec(combinedReadme))) {
      const script = match[1];
      if (seen.has(script)) continue;
      seen.add(script);
      if (!Object.prototype.hasOwnProperty.call(scripts, script)) {
        addError('README references "npm run ' + script + '" but package.json has no such script.');
      }
    }
  } catch {
    addWarning("package.json could not be parsed; npm command validation skipped.");
  }
}

const combined = [en || "", zh || ""].join("\n");
const scriptRef = /(?:^|[\s`])((?:\.\/|\.\\)?[A-Za-z0-9_./\\-]+\.(?:ps1|sh|bat))(?:[\s`]|$)/gm;
let scriptMatch;
const checkedScripts = new Set();

while ((scriptMatch = scriptRef.exec(combined))) {
  let ref = scriptMatch[1]
    .replace(/^\.\//, "")
    .replace(/^\.\\/, "")
    .replaceAll("\\", path.sep);

  if (/^(https?:|~\/|%|<)/.test(ref)) continue;
  if (checkedScripts.has(ref)) continue;
  checkedScripts.add(ref);

  const full = path.join(root, ref);
  if (!fs.existsSync(full)) {
    addError('README references local script "' + scriptMatch[1] + '" but it does not exist.');
  }
}

if (fs.existsSync(metadataPath) && repository) {
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  const expected = metadata.repositories && metadata.repositories[repository];

  if (!expected) {
    addWarning("No canonical repository metadata entry found for " + repository + ".");
  } else {
    console.log("Expected description: " + expected.description);
    console.log("Expected topics: " + expected.topics.join(", "));

    const actualDescription = process.env.REPO_DESCRIPTION || "";
    const actualTopics = (process.env.REPO_TOPICS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (actualDescription && actualDescription !== expected.description) {
      addWarning("Repository Description differs from docs/repository-metadata.json.");
    }

    if (actualTopics.length) {
      const missing = expected.topics.filter((t) => !actualTopics.includes(t));
      if (missing.length) {
        addWarning("Repository Topics missing canonical topics: " + missing.join(", "));
      }
    }
  }
}

for (const msg of warnings) console.log("::warning::" + msg);
for (const msg of errors) console.log("::error::" + msg);

console.log("");
console.log("README quality result: " + errors.length + " error(s), " + warnings.length + " warning(s).");

if (errors.length) process.exit(1);

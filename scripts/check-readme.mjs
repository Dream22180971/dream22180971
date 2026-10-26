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

const metadata = fs.existsSync(metadataPath) ? JSON.parse(fs.readFileSync(metadataPath, "utf8")) : null;
const expected = metadata && repository && metadata.repositories ? metadata.repositories[repository] : null;

// README layout per primary language. "en" (default): README.md English + README.zh-CN.md Chinese.
// "zh-CN": README.md Chinese + README.en.md English; README.zh-CN.md may remain as a redirect.
const layouts = {
  "en": [
    { file: "README.md", lang: "en", switchTo: "README.zh-CN.md", switchName: "Simplified Chinese" },
    { file: "README.zh-CN.md", lang: "zh", switchTo: "README.md", switchName: "English" }
  ],
  "zh-CN": [
    { file: "README.md", lang: "zh", switchTo: "README.en.md", switchName: "English" },
    { file: "README.en.md", lang: "en", switchTo: "README.md", switchName: "Simplified Chinese" }
  ]
};

const primaryLanguage = (expected && expected.readmePrimaryLanguage) || "en";
if (!layouts[primaryLanguage]) {
  addError("Unsupported readmePrimaryLanguage \"" + primaryLanguage + "\"; use one of: " + Object.keys(layouts).join(", ") + ".");
}
if (primaryLanguage !== "en") console.log("README primary language: " + primaryLanguage);

const readmes = (layouts[primaryLanguage] || layouts.en).map((doc) => ({ ...doc, content: read(doc.file) }));

for (const doc of readmes) {
  if (!doc.content) {
    addError(doc.file + " is missing.");
  } else if (!doc.content.includes(doc.switchTo)) {
    addError(doc.file + " is missing the " + doc.switchName + " language switch.");
  }
}

const zhRedirect = primaryLanguage === "zh-CN" ? read("README.zh-CN.md") : null;
if (zhRedirect && !zhRedirect.includes("README.md")) {
  addError("README.zh-CN.md exists but does not link to the primary README.md.");
}

const isProfile = repository.toLowerCase() === "dream22180971/dream22180971";

for (const { file: name, content } of readmes) {
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

for (const { file, lang, content } of readmes) {
  if (content && !hasQuickStart(content, lang)) {
    addWarning(lang === "en"
      ? file + ": no obvious Quick Start / Download / Get it section."
      : file + ": no obvious 快速开始 / 下载 / 直接使用 section.");
  }
}

const combined = readmes.map((doc) => doc.content || "").concat(zhRedirect || "").join("\n");

function findPackageJsons(dir, depth = 0) {
  if (depth > 3) return [];
  const ignored = new Set(["node_modules", ".git", ".next", "dist", "build", ".venv", "venv"]);
  const out = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const full = path.join(dir, entry.name);

    if (entry.isFile() && entry.name === "package.json") {
      out.push(full);
    } else if (entry.isDirectory()) {
      out.push(...findPackageJsons(full, depth + 1));
    }
  }
  return out;
}

if (readmes[0].content) {
  const availableNpmScripts = new Set();
  for (const pkgPath of findPackageJsons(root)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      for (const script of Object.keys(pkg.scripts || {})) availableNpmScripts.add(script);
    } catch {
      addWarning("Could not parse " + path.relative(root, pkgPath) + "; npm command validation is partial.");
    }
  }

  if (availableNpmScripts.size) {
    const npmRun = /npm run ([A-Za-z0-9:_-]+)/g;
    let match;
    const seen = new Set();

    while ((match = npmRun.exec(combined))) {
      const script = match[1];
      if (seen.has(script)) continue;
      seen.add(script);
      if (!availableNpmScripts.has(script)) {
        addError('README references "npm run ' + script + '" but no package.json defines that script.');
      }
    }
  }
}

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

if (metadata && repository) {
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

    const descriptionMode = (metadata.enforcement && metadata.enforcement.description) || "warn";
    const topicsMode = (metadata.enforcement && metadata.enforcement.topics) || "warn";
    const reportByMode = (mode, message) => mode === "error" ? addError(message) : addWarning(message);

    if (actualDescription !== expected.description) {
      reportByMode(descriptionMode, "Repository Description differs from docs/repository-metadata.json.");
    }

    const missing = expected.topics.filter((t) => !actualTopics.includes(t));
    if (missing.length) {
      reportByMode(topicsMode, "Repository Topics missing canonical topics: " + missing.join(", "));
    }
  }
}

for (const msg of warnings) console.log("::warning::" + msg);
for (const msg of errors) console.log("::error::" + msg);

console.log("");
console.log("README quality result: " + errors.length + " error(s), " + warnings.length + " warning(s).");

if (errors.length) process.exit(1);

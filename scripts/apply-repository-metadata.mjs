import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const metadataPath = path.join(__dirname, "..", "docs", "repository-metadata.json");

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const onlyArg = process.argv.find((v, i) => i > 1 && v.startsWith("--repo="));
const onlyRepo = onlyArg ? onlyArg.slice("--repo=".length) : null;

const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
let entries = Object.entries(metadata.repositories || {});

if (onlyRepo) {
  entries = entries.filter(([repo]) => repo.toLowerCase() === onlyRepo.toLowerCase());
  if (!entries.length) {
    console.error("Repository not found in metadata registry: " + onlyRepo);
    process.exit(1);
  }
}

function gh(args, options = {}) {
  return execFileSync("gh", args, {
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "inherit"] : "inherit"
  });
}

try {
  gh(["auth", "status"]);
} catch {
  console.error("GitHub CLI is not authenticated. Run: gh auth login");
  process.exit(1);
}

for (const [repository, expected] of entries) {
  console.log("\n=== " + repository + " ===");
  console.log("Description: " + expected.description);
  console.log("Topics: " + expected.topics.join(", "));

  if (!apply) {
    console.log("[dry-run] No changes applied.");
    continue;
  }

  gh(["repo", "edit", repository, "--description", expected.description]);

  let currentTopics = [];
  try {
    const raw = gh([
      "repo", "view", repository,
      "--json", "repositoryTopics",
      "--jq", ".repositoryTopics[].name"
    ], { capture: true });
    currentTopics = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  } catch {
    console.warn("Could not read current topics for " + repository + "; adding canonical topics anyway.");
  }

  const missing = expected.topics.filter((topic) => !currentTopics.includes(topic));
  for (const topic of missing) {
    gh(["repo", "edit", repository, "--add-topic", topic]);
  }

  console.log("Applied.");
}

console.log("\nDone.");
if (!apply) {
  console.log("Dry run only. Re-run with --apply to write changes.");
}

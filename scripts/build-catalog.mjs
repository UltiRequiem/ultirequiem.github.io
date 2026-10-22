// Builds src/data/catalog.json from GitHub + npm. Runs before every dev/build.
//
// A repo shows up on the site when it is public, not archived, not a fork and has the `showcase`
// topic, so adding the topic is all it takes to publish something here:
//   gh repo edit UltiRequiem/<repo> --add-topic showcase
//
// GITHUB_TOKEN / GH_TOKEN is optional but avoids the 60 requests/hour anonymous limit.
// If the network fails and an older catalog.json exists, that one is kept so the build still works.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OWNER = "UltiRequiem";
const TOPIC = "showcase";
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "catalog.json");
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const headers = { "User-Agent": `${OWNER}-portfolio`, Accept: "application/vnd.github+json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) };

// GitHub gets the token; npm and raw.githubusercontent.com must never see it
async function json(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function publicJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": headers["User-Agent"] } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function text(url) {
  const res = await fetch(url, { headers: { "User-Agent": headers["User-Agent"] } });
  return res.ok ? res.text() : null;
}

async function listRepos() {
  const repos = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await json(`https://api.github.com/users/${OWNER}/repos?per_page=100&type=owner&sort=pushed&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos.filter((r) => !r.fork && !r.archived && !r.private && r.topics?.includes(TOPIC));
}

// the first code block under "## Usage" (or the first block at all), trimmed to something card-sized
function usageSnippet(readme) {
  if (!readme) return null;
  const afterUsage = readme.split(/^##\s*Usage[^\n]*\n/im)[1] ?? readme;
  const match = afterUsage.match(/```(\w+)?\n([\s\S]*?)```/);
  if (!match) return null;
  const code = match[2].trim().split("\n").slice(0, 14).join("\n");
  if (/^npm (i|install)\b/.test(code) && !code.includes("\n")) return null;
  return { lang: ["js", "javascript", "ts", "typescript", "tsx", "jsx", "sh", "bash", "json", "lisp"].includes(match[1]) ? match[1] : "ts", code };
}

const clean = (s = "") => s.replace(/^[^\w[]+/u, "").replace(/:[a-z_]+:/g, "").trim();

async function describe(repo) {
  const base = `https://raw.githubusercontent.com/${OWNER}/${repo.name}/${repo.default_branch}`;
  const pkgText = await text(`${base}/package.json`);
  const pkg = pkgText ? JSON.parse(pkgText) : null;
  const readme = (await text(`${base}/readme.md`)) ?? (await text(`${base}/README.md`));

  let npm = null;
  if (pkg?.name && !pkg.private) {
    try {
      const latest = await publicJson(`https://registry.npmjs.org/${pkg.name.replace("/", "%2f")}/latest`);
      const { downloads = 0 } = await publicJson(`https://api.npmjs.org/downloads/point/last-month/${pkg.name}`).catch(() => ({}));
      npm = { name: pkg.name, version: latest.version, downloads, provenance: Boolean(latest.dist?.attestations) };
    } catch {
      /* not published (yet) */
    }
  }

  const keywords = pkg?.keywords ?? [];
  const kind = keywords.includes("coc.nvim") ? "plugin" : npm ? "library" : "app";
  const description = clean(pkg?.description || repo.description || "");
  return {
    name: npm?.name ?? repo.name,
    repo: repo.name,
    kind,
    description,
    stars: repo.stargazers_count,
    language: repo.language,
    homepage: repo.homepage || null,
    url: repo.html_url,
    pushedAt: repo.pushed_at,
    npm,
    install: kind === "plugin" && npm ? `:CocInstall ${npm.name}` : npm ? `npm install ${npm.name}` : null,
    usage: usageSnippet(readme),
    score: (npm?.downloads ?? 0) + repo.stargazers_count * 25,
  };
}

async function main() {
  const [profile, repos] = await Promise.all([json(`https://api.github.com/users/${OWNER}`), listRepos()]);
  const items = [];
  const queue = [...repos];
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      for (let repo = queue.shift(); repo; repo = queue.shift()) {
        try {
          items.push(await describe(repo));
        } catch (error) {
          console.warn(`skipping ${repo.name}: ${error.message}`);
        }
      }
    }),
  );
  items.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const sum = (key) => items.reduce((total, item) => total + (key(item) ?? 0), 0);
  const catalog = {
    generatedAt: new Date().toISOString(),
    owner: { login: profile.login, name: profile.name, bio: profile.bio, location: profile.location, blog: profile.blog, followers: profile.followers, avatar: profile.avatar_url },
    totals: { packages: items.filter((i) => i.npm).length, downloads: sum((i) => i.npm?.downloads), stars: sum((i) => i.stars) },
    libraries: items.filter((i) => i.kind === "library"),
    plugins: items.filter((i) => i.kind === "plugin"),
    apps: items.filter((i) => i.kind === "app"),
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(catalog, null, 2));
  console.log(`catalog: ${catalog.libraries.length} libraries, ${catalog.plugins.length} plugins, ${catalog.apps.length} apps`);
}

main().catch((error) => {
  if (fs.existsSync(OUT)) {
    console.warn(`catalog refresh failed (${error.message}), keeping the previous one`);
    return;
  }
  console.error(error);
  process.exit(1);
});

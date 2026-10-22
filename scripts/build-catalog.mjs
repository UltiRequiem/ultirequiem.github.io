// Builds src/data/catalog.json (and public/catalog.json) from GitHub + npm. Runs before every dev/build.
//
// A repo shows up on the site when it is public, not archived, not a fork and has the `showcase`
// topic, so adding the topic is all it takes to publish something here:
//   gh repo edit UltiRequiem/<repo> --add-topic showcase
//
// ulti.js.org is about open source JS modules, so apps are never listed.
//
// GITHUB_TOKEN / GH_TOKEN is optional but avoids the 60 requests/hour anonymous limit.
// npm's download API rate-limits CI runners, so every call retries with backoff and, if it still
// fails, falls back to the numbers from the previous deploy (https://ulti.js.org/catalog.json)
// instead of silently showing zero.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OWNER = "UltiRequiem";
const TOPIC = "showcase";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "src", "data", "catalog.json");
const PUBLIC_OUT = path.join(ROOT, "public", "catalog.json");
const PREVIOUS_URL = "https://ulti.js.org/catalog.json";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

const UA = { "User-Agent": `${OWNER}-portfolio` };
// GitHub gets the token; npm and raw.githubusercontent.com must never see it
const ghHeaders = { ...UA, Accept: "application/vnd.github+json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function github(url) {
  const res = await fetch(url, { headers: ghHeaders });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function publicJson(url, tries = 7) {
  let lastError;
  for (let attempt = 0; attempt < tries; attempt++) {
    try {
      const res = await fetch(url, { headers: UA });
      if (res.ok) return await res.json();
      if (res.status === 404) throw Object.assign(new Error(`404 ${url}`), { notFound: true });
      lastError = new Error(`${res.status} ${url}`);
    } catch (error) {
      if (error.notFound) throw error;
      lastError = error;
    }
    await sleep(Math.min(600 * 2 ** attempt, 15000));
  }
  throw lastError;
}

async function text(url) {
  const res = await fetch(url, { headers: UA });
  return res.ok ? res.text() : null;
}

async function previousCatalog() {
  try {
    return await publicJson(PREVIOUS_URL, 2);
  } catch {
    return fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : null;
  }
}

async function listRepos() {
  const repos = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await github(`https://api.github.com/users/${OWNER}/repos?per_page=100&type=owner&sort=pushed&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos.filter((r) => !r.fork && !r.archived && !r.private && r.topics?.includes(TOPIC));
}

const clean = (s = "") => s.replace(/^[^\w[]+/u, "").replace(/:[a-z_]+:/g, "").trim();
const DAYS = 30;

async function npmInfo(name, previous) {
  const info = { name, version: null, downloads: 0, daily: [], provenance: false, stale: false };
  try {
    const latest = await publicJson(`https://registry.npmjs.org/${name.replace("/", "%2f")}/latest`);
    info.version = latest.version;
    info.provenance = Boolean(latest.dist?.attestations);
  } catch (error) {
    if (error.notFound) return null; // not published (yet)
    if (!previous) throw error;
    Object.assign(info, { version: previous.version, provenance: previous.provenance });
  }
  try {
    const range = await publicJson(`https://api.npmjs.org/downloads/range/last-month/${name}`);
    info.daily = range.downloads.map((d) => d.downloads).slice(-DAYS);
    info.downloads = info.daily.reduce((a, b) => a + b, 0);
  } catch (error) {
    if (error.notFound) return info; // brand-new package, npm has no download stats for it yet
    if (!previous?.downloads) throw error;
    // keep the last good numbers rather than showing a package as unused
    Object.assign(info, { downloads: previous.downloads, daily: previous.daily ?? [], stale: true });
    console.warn(`downloads for ${name} unavailable (${error.message}), using the previous deploy`);
  }
  return info;
}

async function describe(repo, previousByName) {
  const base = `https://raw.githubusercontent.com/${OWNER}/${repo.name}/${repo.default_branch}`;
  const pkgText = await text(`${base}/package.json`);
  const pkg = pkgText ? JSON.parse(pkgText) : null;

  let npm = null;
  if (pkg?.name && !pkg.private) npm = await npmInfo(pkg.name, previousByName.get(pkg.name));

  // a library is a public package that exposes an entry point, published to npm yet or not
  const keywords = pkg?.keywords ?? [];
  const isLibrary = Boolean(pkg?.name && !pkg.private && (npm || pkg.exports));
  const kind = keywords.includes("coc.nvim") ? "plugin" : isLibrary ? "library" : "app";
  return {
    name: kind === "app" ? repo.name : (npm?.name ?? pkg?.name ?? repo.name),
    repo: repo.name,
    kind,
    description: clean(pkg?.description || repo.description || ""),
    stars: repo.stargazers_count,
    language: repo.language,
    homepage: repo.homepage || null,
    url: repo.html_url,
    pushedAt: repo.pushed_at,
    npm,
    score: (npm?.downloads ?? 0) + repo.stargazers_count * 25,
  };
}

async function main() {
  const [profile, repos, previous] = await Promise.all([github(`https://api.github.com/users/${OWNER}`), listRepos(), previousCatalog()]);
  const previousByName = new Map(
    [...(previous?.libraries ?? []), ...(previous?.plugins ?? [])].filter((i) => i.npm).map((i) => [i.npm.name, i.npm]),
  );

  // npm is polite-but-strict, so a few workers and a small gap between requests
  const found = [];
  const queue = [...repos];
  await Promise.all(
    Array.from({ length: 2 }, async () => {
      for (let repo = queue.shift(); repo; repo = queue.shift()) {
        try {
          found.push(await describe(repo, previousByName));
        } catch (error) {
          console.warn(`skipping ${repo.name}: ${error.message}`);
        }
        await sleep(400);
      }
    }),
  );
  // ulti.js.org is about open source JS modules: apps never get listed, whatever their topics say
  const items = found.filter((item) => item.kind !== "app");
  items.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const dailyTotal = Array.from({ length: DAYS }, (_, i) =>
    items.reduce((sum, item) => sum + (item.npm?.daily.at(i - DAYS) ?? 0), 0),
  );
  const sum = (key) => items.reduce((total, item) => total + (key(item) ?? 0), 0);
  const catalog = {
    generatedAt: new Date().toISOString(),
    owner: { login: profile.login, name: profile.name, bio: profile.bio, location: profile.location, blog: profile.blog, followers: profile.followers },
    totals: { packages: items.filter((i) => i.npm).length, downloads: sum((i) => i.npm?.downloads), stars: sum((i) => i.stars), dailyTotal },
    libraries: items.filter((i) => i.kind === "library"),
    plugins: items.filter((i) => i.kind === "plugin"),
  };

  // a refresh that lost most of its data must not replace a good deploy
  if (previous && catalog.totals.downloads < previous.totals.downloads * 0.5) {
    throw new Error(`downloads dropped from ${previous.totals.downloads} to ${catalog.totals.downloads}, refusing to publish that`);
  }

  for (const file of [OUT, PUBLIC_OUT]) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(catalog));
  }
  console.log(`catalog: ${catalog.libraries.length} libraries, ${catalog.plugins.length} plugins, ${catalog.totals.downloads} downloads/month`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

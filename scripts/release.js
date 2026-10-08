#!/usr/bin/env node
/*
  Versioned release upload for the CTPG design system (11-media-rules.md section 3.1).

  Uploads the built CSS, JS, fonts and icons into  v/<version>/...  on the ctpg-media R2 bucket,
  where <version> is "version" in package.json. A release folder is never overwritten:
  if any file for this version already exists, nothing is uploaded.

  Also uploads:
    - public images (images/...) that are NOT already in the bucket (never overwrites an image)
    - the catalogue pages (system.html, home-sample.html) with a short cache,
      only with --catalogue (they live at the bucket root, outside the release)

  Usage:
    npm run build && npm run release            (fails if the version already exists)
    node scripts/release.js --if-new            (CI: does nothing, exit 0, if the version exists)
    node scripts/release.js --dry-run           (lists what would be uploaded)

  After a successful release every uploaded file is fetched from
  https://media.cruiseandthemeparkguide.com to confirm it answers 200 with the right size.
*/
const fs = require("fs");
const path = require("path");
const https = require("https");
const mime = require("mime-types");
const { S3Client, PutObjectCommand, HeadObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf-8").split(/\r?\n/).forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return;
    const i = t.indexOf("=");
    if (i === -1) return;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (k && !(k in process.env)) process.env[k] = v;
  });
}

const args = new Set(process.argv.slice(2));
const DRY = args.has("--dry-run");
const IF_NEW = args.has("--if-new");
const PUBLIC_BASE = process.env.MEDIA_PUBLIC_URL || "https://media.cruiseandthemeparkguide.com";

for (const key of ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"]) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const version = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf-8")).version;
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error(`package.json version "${version}" is not x.y.z`);
  process.exit(1);
}
const distDir = path.join(process.cwd(), "dist");
if (!fs.existsSync(distDir)) {
  console.error("Missing dist folder. Run npm run build first.");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const Bucket = process.env.R2_BUCKET;

const IMMUTABLE = "public, max-age=31536000, immutable";
const SHORT = "public, max-age=300, must-revalidate";

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}
const rel = (p) => path.relative(distDir, p).replace(/\\/g, "/");

async function exists(Key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket, Key }));
    return true;
  } catch (e) {
    if (e.$metadata && e.$metadata.httpStatusCode === 404) return false;
    if (e.name === "NotFound") return false;
    throw e;
  }
}

function fetchStatus(url) {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        let n = 0;
        res.on("data", (c) => (n += c.length));
        res.on("end", () => resolve({ status: res.statusCode, bytes: n, cache: res.headers["cache-control"] }));
      })
      .on("error", (e) => resolve({ status: 0, error: e.message }));
  });
}

async function main() {
  const prefix = `v/${version}/`;
  const existing = await s3.send(new ListObjectsV2Command({ Bucket, Prefix: prefix, MaxKeys: 1 }));
  if (existing.KeyCount > 0) {
    if (IF_NEW) {
      console.log(`Release ${version} already exists. Nothing uploaded (bump "version" in package.json for a new release).`);
      return;
    }
    console.error(`Release ${version} already exists in R2. Releases are never overwritten. Bump "version" in package.json.`);
    process.exit(1);
  }

  const plan = [];
  // Versioned design system files
  for (const sub of ["css", "js", "fonts", "icons"]) {
    for (const f of walk(path.join(distDir, sub))) {
      if (f.endsWith(".map")) continue;
      plan.push({ file: f, key: prefix + rel(f), cache: IMMUTABLE, kind: "release" });
    }
  }
  // Images: upload only new ones, never overwrite
  for (const f of walk(path.join(distDir, "images"))) {
    const key = rel(f);
    if (await exists(key)) continue;
    plan.push({ file: f, key, cache: IMMUTABLE, kind: "new image" });
  }
  // Catalogue pages: short cache, replaced only when asked (--catalogue),
  // because they sit at the bucket root outside the release folder.
  for (const page of args.has("--catalogue") ? ["system.html", "home-sample.html"] : []) {
    const f = path.join(distDir, page);
    if (fs.existsSync(f)) plan.push({ file: f, key: page, cache: SHORT, kind: "catalogue" });
  }

  console.log(`Release ${version}: ${plan.length} files${DRY ? " (dry run)" : ""}`);
  for (const p of plan) console.log(`  ${p.kind.padEnd(10)} ${p.key}  (${fs.statSync(p.file).size} bytes)`);
  if (DRY) return;

  for (const p of plan) {
    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key: p.key,
        Body: fs.readFileSync(p.file),
        ContentType: mime.lookup(p.file) || "application/octet-stream",
        CacheControl: p.cache,
      })
    );
  }
  console.log("Uploaded. Checking each file on the public address...");
  let bad = 0;
  for (const p of plan) {
    const r = await fetchStatus(`${PUBLIC_BASE}/${encodeURI(p.key)}`);
    const size = fs.statSync(p.file).size;
    const ok = r.status === 200 && (r.bytes === size || p.kind === "catalogue");
    if (!ok) bad++;
    console.log(`  ${ok ? "OK  " : "FAIL"} ${r.status} ${p.key} ${r.bytes || 0}/${size} bytes  ${r.cache || ""}`);
  }
  if (bad) {
    console.error(`${bad} file(s) failed the public check.`);
    process.exit(1);
  }
  console.log(`Release ${version} is live at ${PUBLIC_BASE}/${prefix}`);
}

main().catch((e) => {
  console.error("Release failed:", e);
  process.exit(1);
});

#!/usr/bin/env node
/*
  One-off D10 cleanup approved by Cierra on Oct 8, 2026 (open-items 29).
  Deletes ONLY the exact keys matched below, after listing them.
    node scripts/r2-cleanup-d10.js            lists what would be deleted
    node scripts/r2-cleanup-d10.js --delete   deletes them, then confirms each is gone
*/
const fs = require("fs");
const path = require("path");
const { S3Client, ListObjectsV2Command, DeleteObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    const k = t.slice(0, i).trim();
    if (!(k in process.env)) process.env[k] = t.slice(i + 1).trim();
  }
}
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});
const Bucket = process.env.R2_BUCKET;

// The approved list: the old Hub copy, the unused AI banner, and the old source maps at the root css/ folder.
const approved = (key) =>
  key === "hub/index.html" ||
  key === "hub/login.html" ||
  /^images\/Firefly_Gemini[^/]*$/.test(key) ||
  /^css\/[^/]+\.css\.map$/.test(key);

(async () => {
  let token, all = [];
  do {
    const r = await s3.send(new ListObjectsV2Command({ Bucket, ContinuationToken: token }));
    all = all.concat(r.Contents || []);
    token = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (token);
  const hits = all.filter((o) => approved(o.Key));
  console.log(`Bucket has ${all.length} files. Matching the approved list: ${hits.length}`);
  for (const o of hits) console.log(`  ${o.Key}  (${o.Size} bytes)`);
  if (!process.argv.includes("--delete")) return;
  if (hits.length > 6) { console.error("More than the 6 approved files matched. Stopping."); process.exit(1); }
  for (const o of hits) {
    await s3.send(new DeleteObjectCommand({ Bucket, Key: o.Key }));
    let gone = false;
    try { await s3.send(new HeadObjectCommand({ Bucket, Key: o.Key })); } catch (e) { gone = true; }
    console.log(`  ${gone ? "deleted" : "STILL THERE"}  ${o.Key}`);
  }
})().catch((e) => { console.error(e); process.exit(1); });

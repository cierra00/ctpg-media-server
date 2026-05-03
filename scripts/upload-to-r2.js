const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const requiredEnvVars = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET"
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const distDir = path.join(process.cwd(), "dist");

if (!fs.existsSync(distDir)) {
  console.error("Missing dist directory. Run npm run build first.");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

function getFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? getFiles(fullPath) : fullPath;
  });
}

async function uploadFile(filePath) {
  const key = path.relative(distDir, filePath).replace(/\\/g, "/");
  const contentType = mime.lookup(filePath) || "application/octet-stream";

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: fs.readFileSync(filePath),
      ContentType: contentType,
      CacheControl: "public, max-age=300"
    })
  );

  console.log(`Uploaded: ${key}`);
}

async function main() {
  const files = getFiles(distDir);

  if (!files.length) {
    console.error("No files found in dist directory.");
    process.exit(1);
  }

  for (const file of files) {
    await uploadFile(file);
  }

  console.log("Upload to Cloudflare R2 complete.");
}

main().catch((error) => {
  console.error("R2 upload failed:");
  console.error(error);
  process.exit(1);
});
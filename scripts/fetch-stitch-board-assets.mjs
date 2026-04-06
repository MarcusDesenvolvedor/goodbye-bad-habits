/**
 * Fetches Stitch screen HTML + screenshot URLs and writes them under docs/design/stitch-kanban-bauhaus/.
 * Requires STITCH_API_KEY (see docs/design/stitch-kanban-bauhaus/README.md).
 */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { stitch } from "@google/stitch-sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "../docs/design/stitch-kanban-bauhaus");
const PROJECT_ID = "12323884550944750041";
const SCREEN_ID = "17188e23de0b4a50af64efc4150443c4";

async function downloadToFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GET ${url} failed: ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
}

async function main() {
  if (!process.env.STITCH_API_KEY) {
    console.error(
      "STITCH_API_KEY is not set. See docs/design/stitch-kanban-bauhaus/README.md",
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const project = stitch.project(PROJECT_ID);
  const screen = await project.getScreen(SCREEN_ID);
  const htmlUrl = await screen.getHtml();
  const imageUrl = await screen.getImage();

  console.log("HTML URL:", htmlUrl);
  console.log("Image URL:", imageUrl);

  await downloadToFile(htmlUrl, join(OUT_DIR, "reference.html"));
  await downloadToFile(imageUrl, join(OUT_DIR, "preview.png"));

  console.log(`Wrote reference.html and preview.png to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

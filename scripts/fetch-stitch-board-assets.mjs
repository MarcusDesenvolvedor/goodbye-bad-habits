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
const SCREEN_ID = "f1a2073415904a26b0abd7b8527ddf93";

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

  console.log("HTML URL:", htmlUrl || "(none)");
  console.log("Image URL:", imageUrl || "(none)");

  if (htmlUrl) {
    await downloadToFile(htmlUrl, join(OUT_DIR, "reference.html"));
  } else {
    console.warn(
      "Stitch returned no HTML download URL for this screen; skipped reference.html",
    );
  }
  if (imageUrl) {
    await downloadToFile(imageUrl, join(OUT_DIR, "preview.png"));
  } else {
    console.warn("Stitch returned no image URL; skipped preview.png");
  }

  console.log(`Wrote assets to ${OUT_DIR} (HTML only if URL was present)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

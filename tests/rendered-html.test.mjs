import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("keeps the project focused on the finished diagnostic", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /sheetsWebhookUrl:\s*""/);
  assert.match(page, /roi_diagnostico_leads/);
  assert.match(page, /principal p.+blico que compra da sua empresa\?/);
  assert.match(page, /Autorizo a ROI Contabilidade/);
  assert.match(layout, /lang="pt-BR"/);
  assert.match(packageJson, /"next":/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton|vinext|wrangler|@cloudflare\/vite-plugin/);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await access(new URL("../public/logo-roi.jpg", import.meta.url));
  await access(projectRoot);
});

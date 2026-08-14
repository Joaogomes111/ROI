import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

test("keeps the project focused on the finished diagnostic", async () => {
  const [page, layout, packageJson, leadRoute, envExample] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/api/leads/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
  ]);

  assert.match(page, /\/api\/leads/);
  await access(new URL("../app/api/leads/route.ts", import.meta.url));
  assert.match(page, /roi_diagnostico_leads/);
  assert.match(page, /principal p.+blico que compra da sua empresa\?/);
  assert.match(page, /Autorizo a ROI Contabilidade/);
  assert.match(layout, /lang="pt-BR"/);
  assert.match(layout, /G-72KFD3RXMX/);
  assert.match(layout, /googletagmanager\.com\/gtag\/js/);
  assert.match(packageJson, /"next":/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton|vinext|wrangler|@cloudflare\/vite-plugin/);
  assert.match(leadRoute, /GOOGLE_SHEETS_WEBHOOK_URL/);
  assert.match(leadRoute, /RD_STATION_API_KEY/);
  assert.match(leadRoute, /api\.rd\.services\/platform\/conversions/);
  assert.match(envExample, /^GOOGLE_SHEETS_WEBHOOK_URL=/m);
  assert.match(envExample, /^RD_STATION_API_KEY=/m);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await access(new URL("../public/logo-roi.jpg", import.meta.url));
  await access(projectRoot);
});

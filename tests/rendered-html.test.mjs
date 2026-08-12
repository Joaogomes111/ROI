import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the ROI diagnostic landing experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();

  assert.match(html, /<title>Diagnóstico Simples Nacional Híbrido \| ROI Contabilidade<\/title>/i);
  assert.match(html, /ROI Contabilidade em Itajaí - SC/);
  assert.match(html, /Diagnóstico: sua empresa precisa aderir ao/);
  assert.match(html, /Simples Nacional Híbrido/);
  assert.match(html, /Iniciar diagnóstico/);
  assert.match(html, /comercial@roicontabilidade\.com\.br/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("keeps the project focused on the finished diagnostic", async () => {
  const [page, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /sheetsWebhookUrl:\s*""/);
  assert.match(page, /roi_diagnostico_leads/);
  assert.match(page, /Qual é o principal público que compra da sua empresa\?/);
  assert.match(page, /Autorizo a ROI Contabilidade/);
  assert.match(layout, /lang="pt-BR"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
  await access(new URL("../public/logo-roi.jpg", import.meta.url));
  await access(new URL("../.openai/hosting.json", import.meta.url));
  await access(projectRoot);
});

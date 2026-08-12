export async function POST(request: Request) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    return Response.json(
      { ok: false, error: "GOOGLE_SHEETS_WEBHOOK_URL is not configured." },
      { status: 500 },
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return Response.json({ ok: false, error: "Invalid lead payload." }, { status: 400 });
  }

  const sheetsResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (!sheetsResponse.ok) {
    return Response.json(
      { ok: false, error: "Google Sheets webhook rejected the request." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}

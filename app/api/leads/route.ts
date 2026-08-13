type LeadPayload = {
  created_at?: string;
  lead?: {
    nome?: string;
    empresa?: string;
    email?: string;
    whatsapp?: string;
    cnpj?: string;
    cargo?: string;
  };
  diagnostic?: {
    percentage?: number;
    band?: string;
  };
  tracking?: {
    page_url?: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
};

type DestinationResult = {
  destination: "google_sheets" | "rd_station";
  configured: boolean;
  ok: boolean;
  status?: number;
  error?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function splitTags(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function uniqueTags(tags: string[]) {
  return Array.from(new Set(tags.filter(Boolean)));
}

function cleanPhone(value: unknown) {
  return clean(value).replace(/\D/g, "");
}

function safeTag(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function sendToGoogleSheets(payload: LeadPayload): Promise<DestinationResult> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  if (!webhookUrl) {
    return { destination: "google_sheets", configured: false, ok: true };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    return {
      destination: "google_sheets",
      configured: true,
      ok: response.ok,
      status: response.status,
      error: response.ok ? undefined : "Google Sheets webhook rejected the request.",
    };
  } catch (error) {
    return {
      destination: "google_sheets",
      configured: true,
      ok: false,
      error: error instanceof Error ? error.message : "Google Sheets request failed.",
    };
  }
}

async function sendToRdStation(payload: LeadPayload): Promise<DestinationResult> {
  const apiKey = process.env.RD_STATION_API_KEY;

  if (!apiKey) {
    return { destination: "rd_station", configured: false, ok: true };
  }

  const lead = payload.lead || {};
  const diagnostic = payload.diagnostic || {};
  const tracking = payload.tracking || {};
  const email = clean(lead.email);

  if (!email) {
    return {
      destination: "rd_station",
      configured: true,
      ok: false,
      error: "Lead email is required for RD Station.",
    };
  }

  const conversionIdentifier =
    process.env.RD_STATION_CONVERSION_IDENTIFIER || "Diagnostico Simples Nacional Hibrido";
  const tags = uniqueTags([
    "diagnostico-simples-hibrido",
    "roi-contabilidade",
    diagnostic.band ? `faixa-${safeTag(diagnostic.band)}` : "",
    ...splitTags(process.env.RD_STATION_TAGS),
  ]);

  const rdPayload: Record<string, unknown> = {
    conversion_identifier: conversionIdentifier,
    name: clean(lead.nome),
    email,
    company: clean(lead.empresa),
    job_title: clean(lead.cargo),
    mobile_phone: cleanPhone(lead.whatsapp),
    traffic_source: clean(tracking.utm_source) || clean(tracking.referrer) || "site",
    tags,
    legal_bases: [
      {
        category: "communications",
        type: "consent",
        status: "granted",
      },
    ],
  };

  const cnpjField = process.env.RD_FIELD_CNPJ;
  const percentageField = process.env.RD_FIELD_RESULT_PERCENTAGE;
  const bandField = process.env.RD_FIELD_RESULT_BAND;

  if (cnpjField && clean(lead.cnpj)) rdPayload[cnpjField] = clean(lead.cnpj);
  if (percentageField) rdPayload[percentageField] = diagnostic.percentage ?? "";
  if (bandField) rdPayload[bandField] = diagnostic.band || "";

  const rdUrl = new URL("https://api.rd.services/platform/conversions");
  rdUrl.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(rdUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: "CONVERSION",
        event_family: "CDP",
        payload: rdPayload,
      }),
    });

    return {
      destination: "rd_station",
      configured: true,
      ok: response.ok,
      status: response.status,
      error: response.ok ? undefined : await response.text(),
    };
  } catch (error) {
    return {
      destination: "rd_station",
      configured: true,
      ok: false,
      error: error instanceof Error ? error.message : "RD Station request failed.",
    };
  }
}

export async function POST(request: Request) {
  let payload: LeadPayload;

  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return Response.json({ ok: false, error: "Invalid lead payload." }, { status: 400 });
  }

  const results = await Promise.all([sendToRdStation(payload), sendToGoogleSheets(payload)]);
  const hasConfiguredDestination = results.some((result) => result.configured);
  const failedResults = results.filter((result) => result.configured && !result.ok);

  if (!hasConfiguredDestination) {
    return Response.json(
      { ok: false, error: "No lead destination is configured.", results },
      { status: 500 },
    );
  }

  if (failedResults.length === results.filter((result) => result.configured).length) {
    return Response.json(
      { ok: false, error: "All configured lead destinations failed.", results },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, results });
}

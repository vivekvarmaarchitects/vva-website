import { NextResponse } from "next/server";
import { Resend } from "resend";

const PURPOSE_OPTIONS = [
  "Residential project",
  "Commercial project",
  "Collaboration",
  "Other inquiry",
] as const;

const PURPOSE_TO_PB: Record<(typeof PURPOSE_OPTIONS)[number], string> = {
  "Residential project": "Residential",
  "Commercial project": "Commercial",
  Collaboration: "Collaboration",
  "Other inquiry": "Other inquiry",
};

const PURPOSE_SET = new Set<string>(PURPOSE_OPTIONS);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_LENGTHS = {
  name: 160,
  purpose: 80,
  email: 254,
  phone_number: 40,
  message: 4000,
  pageUrl: 2000,
  company: 200,
};

const resendApiKey = process.env.RESEND_API_KEY || "";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

console.log("Resend configured:", Boolean(resendApiKey));

const getString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const isTooLong = (value: string, max: number) => value.length > max;

export async function POST(req: Request) {
  let body: Record<string, unknown>;

  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch (error) {
    console.error("Lead API: invalid JSON payload.", error);
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const company = getString(body.company);
  if (company) {
    return NextResponse.json({ ok: true });
  }

  const name = getString(body.name);
  const purpose = getString(body.purpose);
  const email = getString(body.email);
  const phone_number = getString(body.phone_number);
  const message = getString(body.message);
  const pageUrl = getString(body.pageUrl);

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (isTooLong(name, MAX_LENGTHS.name)) {
    return NextResponse.json({ error: "Name is too long" }, { status: 400 });
  }
  if (!purpose) {
    return NextResponse.json({ error: "Purpose is required" }, { status: 400 });
  }
  if (!PURPOSE_SET.has(purpose)) {
    return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
  }
  if (isTooLong(purpose, MAX_LENGTHS.purpose)) {
    return NextResponse.json({ error: "Purpose is too long" }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (isTooLong(email, MAX_LENGTHS.email)) {
    return NextResponse.json({ error: "Email is too long" }, { status: 400 });
  }
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (!phone_number) {
    return NextResponse.json(
      { error: "Phone number is required" },
      { status: 400 }
    );
  }
  if (isTooLong(phone_number, MAX_LENGTHS.phone_number)) {
    return NextResponse.json(
      { error: "Phone number is too long" },
      { status: 400 }
    );
  }
  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (isTooLong(message, MAX_LENGTHS.message)) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  }
  if (pageUrl && isTooLong(pageUrl, MAX_LENGTHS.pageUrl)) {
    return NextResponse.json({ error: "Page URL is too long" }, { status: 400 });
  }

  const pocketbaseUrl = process.env.POCKETBASE_URL || "";
  if (!pocketbaseUrl) {
    console.error("Lead API: POCKETBASE_URL is not configured.");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const leadsFromEmail = (process.env.LEADS_FROM_EMAIL || "").trim();
  if (!resend || !leadsFromEmail) {
    console.error("Lead API: Resend configuration is missing.");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const normalizedPocketbaseUrl = pocketbaseUrl.replace(/\/+$/, "");
  const pocketbasePurpose = PURPOSE_TO_PB[purpose as (typeof PURPOSE_OPTIONS)[number]] ?? purpose;

  const pbPayload: Record<string, string> = {
    name,
    purpose: pocketbasePurpose,
    email,
    phone_number,
    message,
  };

  if (pageUrl) {
    pbPayload.page_url = pageUrl;
  }

  try {
    const pbResponse = await fetch(
      `${normalizedPocketbaseUrl}/api/collections/leads/records`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pbPayload),
      }
    );

    if (!pbResponse.ok) {
      const errorText = await pbResponse.text().catch(() => "");
      console.error("PocketBase lead create failed.", {
        status: pbResponse.status,
        body: errorText,
      });
      return NextResponse.json(
        { error: "Failed to save lead" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("PocketBase lead create failed.", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 502 });
  }

  const emailText = [
    `New lead form submission by ${name}`,
    "",
    `Name: ${name}`,
    `Purpose: ${purpose}`,
    `Email: ${email}`,
    `Phone number: ${phone_number}`,
    `Message: ${message}`,
    pageUrl ? `Page URL: ${pageUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { error } = await resend.emails.send({
      from: leadsFromEmail,
      to: "vivekvarmaarchitects.web@gmail.com",
      subject: `New lead form submission by ${name}`,
      text: emailText,
    });

    if (error) {
      console.error("Resend email send failed.", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Resend email send failed.", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

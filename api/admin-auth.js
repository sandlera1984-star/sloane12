import crypto from "crypto";

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export default function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ ok: false });
    return;
  }

  const { code } = request.body || {};
  if (!code) {
    response.status(400).json({ ok: false });
    return;
  }

  const envHash = process.env.ADMIN_CODE_HASH;
  const envCode = process.env.ADMIN_CODE;

  const expected = envHash || (envCode ? hashCode(envCode) : null);
  if (!expected) {
    response.status(500).json({ ok: false });
    return;
  }

  const incoming = hashCode(code);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(incoming),
    Buffer.from(expected)
  );

  response.status(200).json({ ok: isValid });
}

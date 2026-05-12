interface GeneratePdfOptions {
  html: string;
  headerTitle?: string;
  showBrand?: boolean;
}

export function isServerOverloaded(): boolean {
  return false;
}

export async function generatePdfBuffer({
  html,
  showBrand = false,
  headerTitle = "Imob Gestão",
}: GeneratePdfOptions): Promise<Buffer> {
  const GOTENBERG_URL =
    process.env.GOTENBERG_URL || "http://localhost:3000";

  const now = new Date();
  const dataAtual = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(now);
  const year = now.getFullYear();

  const headerHtml = `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-size: 9px; font-family: Arial, sans-serif; color: #444; width: 100%; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 0 20mm 5px; width: 100%; }
</style></head>
<body>
  <div class="row">
    <strong style="font-size: 10pt; color: #000;">${headerTitle}</strong>
    <span>${dataAtual}</span>
  </div>
</body></html>`;

  const footerHtml = `<!DOCTYPE html>
<html><head><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 100%; font-size: 9px; font-family: Arial, sans-serif; color: #444; }
  .row { display: flex; justify-content: space-between; align-items: center; padding: 5px 20mm 0; width: 100%; }
</style></head>
<body>
  <div class="row">
    <span>${showBrand ? `Imob Gestão © ${year}` : ""}</span>
    <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
  </div>
</body></html>`;

  const form = new FormData();
  form.append("files", new Blob([html], { type: "text/html" }), "index.html");
  form.append(
    "files",
    new Blob([headerHtml], { type: "text/html" }),
    "header.html"
  );
  form.append(
    "files",
    new Blob([footerHtml], { type: "text/html" }),
    "footer.html"
  );
  form.append("paperWidth", "8.27");
  form.append("paperHeight", "11.69");
  form.append("marginTop", "0.984");
  form.append("marginBottom", "0.984");
  form.append("marginLeft", "0.787");
  form.append("marginRight", "0.787");
  form.append("printBackground", "true");

  const response = await fetch(
    `${GOTENBERG_URL}/forms/chromium/convert/html`,
    { method: "POST", body: form }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gotenberg error ${response.status}: ${body}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
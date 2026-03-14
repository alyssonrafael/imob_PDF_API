import puppeteer from "puppeteer";

interface GeneratePdfOptions {
  html: string;
  headerTitle?: string;
  showBrand?: boolean; 
}

let activeGenerations = 0;
const MAX_CONCURRENT = 3;

export function isServerOverloaded(): boolean {
  return activeGenerations >= MAX_CONCURRENT;
}

export async function generatePdfBuffer({ html, showBrand = false , headerTitle = "Imob Gestão" }: GeneratePdfOptions): Promise<Buffer> {
  let browser;

  activeGenerations++;

  try {
     browser = await puppeteer.launch({
          headless: "shell",
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const dataAtual = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());

      const year = new Date().getFullYear();


    // Utilizando o Uint8Array gerado pelo Puppeteer e convertendo para Buffer do Node
    const pdfUint8Array = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 8pt; font-family: Arial, sans-serif; width: 100%; text-align: right; padding-right: 20mm; color: #666;">
            <strong style="color: #000; font-size: 10pt;">${headerTitle}</strong><br/>
            ${dataAtual}
        </div>
      `,
      footerTemplate: `
      <div style="
        width: 100%;
        font-size: 9px;
        padding: 5px 20mm 0;
        border-top: 1px solid #ccc;
        box-sizing: border-box;
        font-family: Arial, sans-serif;
        color: #444;
      ">
        ${
          showBrand
            ? `
            <div style="float: left;">
              Imob Gestão © ${year}
            </div>
          `
            : ""
        }

        <div style="float: right;">
          Página <span class="pageNumber"></span> de 
          <span class="totalPages"></span>
        </div>
      </div>
    `,
      margin: { top: "25mm", bottom: "25mm", right: "20mm", left: "20mm" },
    });

    return Buffer.from(pdfUint8Array);
  } finally {
    activeGenerations--;
    if (browser) await browser.close();
  }
}
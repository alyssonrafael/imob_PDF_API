export function getImobDocumentHtml(htmlContent: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          @page {
            size: A4;
            margin: 25mm 20mm 25mm 20mm;
          }

          body { 
            font-family: "Segoe UI", Arial, Helvetica, sans-serif; 
            color: #1f2937;
            margin: 0; 
            padding: 0; 
            line-height: 1.6;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body > *:first-child { 
            margin-top: 0 !important; 
          }

          h1 { font-size: 20pt; font-weight: 700; margin-top: 24pt; margin-bottom: 12pt; }
          h2 { font-size: 16pt; font-weight: 600; margin-top: 18pt; margin-bottom: 9pt; }
          h3 { font-size: 14pt; font-weight: 600; margin-top: 14pt; margin-bottom: 7pt; }

          p { font-size: 11pt; margin-top: 0; margin-bottom: 11pt; text-align: justify; }
          ul, ol { margin-top: 0; margin-bottom: 11pt; padding-left: 24pt; }
          li { margin-bottom: 6pt; text-align: justify; }
          li > p { margin-bottom: 0; }

          strong { font-weight: 600; }
          em { font-style: italic; }
          u { text-decoration: underline; }

          h1, h2, h3 { 
            page-break-after: avoid; 
            break-after: avoid; 
          }

          body > p:first-child:empty {
            display: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .break-after-page { 
            display: block;
            page-break-after: always; 
            break-after: page; 
            width: 100%;
            height: 1px;
            margin: 0; 
            padding: 0; 
            visibility: hidden;
          }

          .break-after-page * { display: none; }
        </style>
      </head>

      <body>
        ${htmlContent}
      </body>
    </html>
  `;
}
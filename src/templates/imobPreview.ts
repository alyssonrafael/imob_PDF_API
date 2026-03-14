export function getImobPreviewHtml(htmlContent: string): string {
  return `
    <!DOCTYPE html>
    <html>
        <head>
            <style>
                body { 
                    font-family: Arial, Helvetica, sans-serif; 
                    color: #000;
                    margin: 0; 
                    padding: 0; 
                    line-height: 1.5;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                /* 2. MARCA D'ÁGUA "MODELO" REPETIDA E APAGADINHA */
                body::before {
                    content: "";
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    z-index: -1;
                    pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 210 297'%3E%3Ctext x='105' y='148.5' fill='black' opacity='0.05' font-size='35' font-family='sans-serif' font-weight='900' text-anchor='middle' dominant-baseline='middle' transform='rotate(-45 105 148.5)'%3EPREVIEW%3C/text%3E%3C/svg%3E");
                    background-size: 120mm 120mm;
                    background-repeat: repeat;
                    background-position: center;
                }
                body > *:first-child { 
                    margin-top: 0 !important; 
                }

                /* 3. TIPOGRAFIA (Espelhando o seu Tailwind) */
                h1 { font-size: 24pt; font-weight: bold; margin-top: 24pt; margin-bottom: 12pt; }
                h2 { font-size: 18pt; font-weight: bold; margin-top: 18pt; margin-bottom: 9pt; }
                h3 { font-size: 14pt; font-weight: bold; margin-top: 14pt; margin-bottom: 7pt; }
                p { font-size: 11pt; margin-top: 0; margin-bottom: 11pt; text-align: justify; }
                ul, ol { margin-top: 0; margin-bottom: 11pt; padding-left: 24pt; }
                li { margin-bottom: 6pt; text-align: justify; }
                li > p { margin-bottom: 0; }
                strong { font-weight: bold; }
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
                    height: 1px; /* Evita que o texto suma sugado pela margem invisível */
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
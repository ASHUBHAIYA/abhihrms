/**
 * Production-grade Print and Export Utilities for NexusHR Cloud
 * Solves iframe sandbox printing issues by constructing isolated, styled print documents
 * and provides client-side PDF/CSV downloads.
 */

/**
 * Cleanly prints a DOM element by id or HTML string in an isolated printable window/iframe.
 */
export const printElement = (elementId: string, documentTitle: string = 'Document'): void => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found for printing.`);
    window.print();
    return;
  }

  // Create an isolated iframe to guarantee styling and prevent iframe sandbox blocking
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.title = 'Print Frame';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback directly to window print
    window.print();
    return;
  }

  // Pull all current styles from the parent document
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(style => style.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${documentTitle}</title>
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
            margin: 0 !important;
            padding: 10px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          .print-break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Wait for stylesheets and images to load before triggering print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Iframe print intercepted, attempting fallback window.print()', e);
      window.print();
    } finally {
      // Clean up the iframe after a short delay
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  }, 400);
};

/**
 * Generates an instant downloadable standalone HTML/PDF document file.
 */
export const downloadDocumentAsHtml = (elementId: string, filename: string = 'document.html'): void => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID "${elementId}" not found for download.`);
    return;
  }

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(style => style.outerHTML)
    .join('\n');

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  ${styles}
  <style>
    body {
      background-color: #f8fafc;
      padding: 30px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }
  </style>
</head>
<body>
  <div class="container">
    ${element.innerHTML}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename.endsWith('.html') ? filename : `${filename}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

/**
 * Exports JSON data to a downloadable CSV file with Excel UTF-8 BOM compatibility.
 */
export const exportToCsv = (
  data: Record<string, any>[], 
  filename: string = 'export.csv',
  headers?: { key: string; label: string }[]
): void => {
  if (!data || data.length === 0) {
    console.warn('No data provided to exportToCsv.');
    return;
  }

  const columns = headers || Object.keys(data[0]).map(k => ({ key: k, label: k }));
  
  // Header row
  const headerRow = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');
  
  // Data rows
  const rows = data.map(item => {
    return columns.map(c => {
      let val = item[c.key];
      if (val === undefined || val === null) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    }).join(',');
  });

  // UTF-8 BOM for Microsoft Excel compatibility
  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

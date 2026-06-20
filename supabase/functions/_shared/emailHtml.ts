export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function wrapEmailCard(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body
    style="
      margin:0;
      padding:24px 12px;
      background-color:#f5f7f8;
      font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      line-height:1.5;
      color:#111827;
    "
  >
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      border="0"
      width="100%"
      style="border-collapse:collapse;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            border="0"
            width="100%"
            style="
              border-collapse:collapse;
              max-width:420px;
              background-color:#ffffff;
              border:1px solid rgba(17,24,39,0.08);
              border-radius:16px;
              box-shadow:0 14px 26px rgba(0,0,0,0.08);
            "
          >
            <tr>
              <td style="padding:22px 20px 18px 20px;">
                <h1
                  style="
                    margin:0 0 8px 0;
                    font-size:20px;
                    line-height:1.3;
                    font-weight:600;
                    color:#111827;
                  "
                >
                  ${escapeHtml(title)}
                </h1>
                ${bodyHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function emailParagraph(html: string, marginBottom = '12px'): string {
  return `<p
    style="
      margin:0 0 ${marginBottom} 0;
      font-size:14px;
      line-height:1.6;
      color:#4b5563;
    "
  >${html}</p>`
}

export function emailDetailBlock(label: string, value: string): string {
  return `<p
    style="
      margin:0 0 10px 0;
      font-size:13px;
      line-height:1.6;
      color:#374151;
    "
  ><strong style="color:#111827;">${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`
}

export function emailMutedNote(text: string): string {
  return `<p
    style="
      margin:0;
      font-size:12px;
      line-height:1.6;
      color:#6b7280;
    "
  >${escapeHtml(text)}</p>`
}

import "server-only";

// Spreadsheet apps execute cells that start with = + - @ (CSV injection), and
// customers control fields like name and address. Prefix those with an
// apostrophe so they're always treated as plain text.
function cell(value) {
  let s = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers, rows) {
  const lines = [headers.map(cell).join(",")];
  for (const row of rows) lines.push(row.map(cell).join(","));
  // BOM so Excel opens UTF-8 (₹, é) correctly.
  return `﻿${lines.join("\r\n")}\r\n`;
}

export function csvResponse(filename, body) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

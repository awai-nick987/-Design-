// Check if input is a Google Forms URL (viewform, edit, etc.)
export function isGoogleFormsUrl(rawUrl: string): boolean {
  const u = rawUrl.trim();
  return u.includes("docs.google.com/forms") || u.includes("forms.gle");
}

// Extract clean human title from HTML (Google Form or Google Spreadsheet)
export function extractTitleFromHtml(html: string): string {
  if (!html) return "";

  // 1. Check og:title meta tag
  const ogMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                  html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  if (ogMatch && ogMatch[1]) {
    let title = cleanExtractedTitle(ogMatch[1]);
    if (title) return title;
  }

  // 2. Check Google Forms title elements
  const formTitleMatch = html.match(/<div[^>]*class=["'][^"']*(?:freebirdFormviewerViewHeaderTitle|F9N12e)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (formTitleMatch && formTitleMatch[1]) {
    let title = cleanExtractedTitle(formTitleMatch[1].replace(/<[^>]+>/g, ""));
    if (title) return title;
  }

  // 3. Check HTML <title> tag
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    let title = cleanExtractedTitle(titleMatch[1]);
    if (title) return title;
  }

  return "";
}

function cleanExtractedTitle(raw: string): string {
  let cleaned = raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();

  // Strip common Google suffixes
  cleaned = cleaned
    .replace(/\s*-\s*Google\s*(?:スプレッドシート|スプレッド シート|Sheets|Forms|フォーム|ドライブ|Drive).*$/i, "")
    .replace(/\s*-\s*(?:Google\s*Docs|Google).*$/i, "")
    .replace(/^無題の(?:スプレッドシート|フォーム)/, "")
    .replace(/\s*\(回答\)\s*$/, "")
    .replace(/\s*\(Responses\)\s*$/i, "")
    .trim();

  return cleaned;
}


// Google Sheets URL resolving and HTML parsing
export function normalizeSheetUrls(rawUrl: string): string[] {
  let u = rawUrl.trim();
  const candidates: string[] = [];

  // Check if it is a published url (/pubhtml or /pub)
  if (u.includes("/pubhtml") || u.includes("/pub")) {
    let csvUrl = u.replace(/\/pubhtml\b/, "/pub");
    if (!csvUrl.includes("output=csv")) {
      const sep = csvUrl.includes("?") ? "&" : "?";
      csvUrl = `${csvUrl}${sep}output=csv`;
    }
    candidates.push(csvUrl);

    // Keep original pubhtml as fallback in case we need to parse HTML
    if (u.includes("/pubhtml")) {
      candidates.push(u);
    } else {
      candidates.push(u.replace(/\/pub\b/, "/pubhtml"));
    }
    return candidates;
  }

  // Standard Google Sheets edit/view url: https://docs.google.com/spreadsheets/d/{ID}/...
  const matchId = u.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (matchId) {
    const id = matchId[1];
    const gidMatch = u.match(/[#&?]gid=([0-9]+)/);
    const gid = gidMatch ? gidMatch[1] : "0";

    // Candidate 1: Google Visualization API CSV export (very reliable for shared sheets)
    candidates.push(`https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`);
    // Candidate 2: Standard export format=csv
    candidates.push(`https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`);
    return candidates;
  }

  candidates.push(u);
  return candidates;
}

export function parseGoogleSheetHtml(html: string): string {
  // Extract rows from table
  const trMatches = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
  if (!trMatches || trMatches.length === 0) return "";

  const rows: string[][] = [];

  for (const trHtml of trMatches) {
    const cellMatches = trHtml.match(/<(?:td|th)[^>]*>[\s\S]*?<\/(?:td|th)>/gi);
    if (!cellMatches) continue;

    const cells: string[] = [];
    for (const cellHtml of cellMatches) {
      // Ignore row header background cells if identifiable
      if (/class=["'][^"']*\brow-header/i.test(cellHtml)) {
        continue;
      }

      // Extract inner text
      let text = cellHtml.replace(/<[^>]+>/g, "").trim();
      // Decode HTML entities
      text = text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ");

      cells.push(text);
    }

    // If first column is purely numeric row counter (1, 2, 3...) and subsequent columns contain text, check if it is an artifact
    // Google Sheets pubhtml sometimes has the first cell as row number
    if (cells.length > 1 && /^\d+$/.test(cells[0]) && isNaN(Number(cells[1]))) {
      cells.shift();
    }

    // Filter out completely empty rows
    if (cells.some((c) => c.length > 0)) {
      rows.push(cells);
    }
  }

  // Find max columns count
  const maxCols = rows.reduce((max, r) => Math.max(max, r.length), 0);
  
  // If first few rows have only 1 cell but later rows have multiple columns (like title row), skip title rows
  let startIndex = 0;
  if (maxCols >= 3) {
    while (startIndex < rows.length && rows[startIndex].length < 3) {
      startIndex++;
    }
  }

  const validRows = rows.slice(startIndex);
  if (validRows.length === 0) return "";

  // Normalize column count to match maxCols if needed
  const normalizedRows = validRows.map((r) => {
    if (r.length < maxCols) {
      return [...r, ...Array(maxCols - r.length).fill("")];
    }
    return r;
  });

  // Convert to CSV
  return normalizedRows
    .map((row) =>
      row
        .map((cell) => {
          if (cell.includes(",") || cell.includes('"') || cell.includes("\n") || cell.includes("\r")) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(",")
    )
    .join("\n");
}

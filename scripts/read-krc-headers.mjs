import * as XLSX from "xlsx";
import { readFileSync } from "fs";

const buf = readFileSync("c:/Users/aman/Downloads/MASTER DATA - KRC CINEVISTA- KANJUR (1).xlsx");
const wb = XLSX.read(buf);
console.log("Sheets:", wb.SheetNames.join(", "));
for (const name of wb.SheetNames) {
  const sh = wb.Sheets[name];
  const rows = XLSX.utils.sheet_to_json(sh, { header: 1, defval: "" });
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;
    if (row.some((c) => String(c).toUpperCase().includes("NAME OF EMPLOYEE"))) {
      console.log("\n===", name, "header row", i + 1, "===");
      row.forEach((c, idx) => {
        const t = String(c).replace(/\r\n/g, " ").trim();
        if (t) console.log(`${idx}: ${t}`);
      });
      break;
    }
  }
}

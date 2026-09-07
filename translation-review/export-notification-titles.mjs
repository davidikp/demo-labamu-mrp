// Exports every notification item NAME (the bold title shown in Company
// Notification Settings / Notification Preferences) for translation. These
// are plain English-only strings today — the "Bahasa Indonesia" column here
// is left blank for you to fill in.
// Run with: node translation-review/export-notification-titles.mjs
import { DEFAULT_NOTIFICATION_SETTINGS } from "../src/data/notification/notificationDefaults.js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const rows = [];
DEFAULT_NOTIFICATION_SETTINGS.forEach((section) => {
  const moduleTitle = section.title?.en || section.id;
  section.items.forEach((item) => {
    rows.push([moduleTitle, item.id, item.name, ""]);
  });
});

const escapeCsv = (value) => {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const header = ["Module", "Item ID", "English", "Bahasa Indonesia"];
const csv = [header, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\n");

const outPath = join(__dirname, "notification-titles.csv");
writeFileSync(outPath, csv, "utf8");
console.log(`Wrote ${rows.length} rows to ${outPath}`);

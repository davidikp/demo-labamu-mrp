// One-off export: dumps every bilingual (en/id) string in the Notification
// Settings/Preferences catalog to a CSV for translation review.
// Run with: node translation-review/export-notification-translations.mjs
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  NOTIFICATION_GROUPS,
} from "../src/data/notification/notificationDefaults.js";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const rows = [];
// [Module, Item, Field, English, Bahasa Indonesia]
const push = (moduleTitle, itemName, field, en, id) => {
  rows.push([moduleTitle, itemName, field, en ?? "", id ?? ""]);
};

DEFAULT_NOTIFICATION_SETTINGS.forEach((section) => {
  const moduleTitle = section.title?.en || section.id;

  push(moduleTitle, "(module)", "Title", section.title?.en, section.title?.id);
  push(moduleTitle, "(module)", "Description", section.description?.en, section.description?.id);

  section.items.forEach((item) => {
    const itemName = item.name;

    push(moduleTitle, itemName, "Description", item.description?.en, item.description?.id);

    if (item.content?.inApp) {
      push(moduleTitle, itemName, "In-app content", item.content.inApp.en, item.content.inApp.id);
    }
    if (item.content?.email?.subject) {
      push(
        moduleTitle,
        itemName,
        "Email subject",
        item.content.email.subject.en,
        item.content.email.subject.id
      );
    }
    if (item.content?.email?.body) {
      push(moduleTitle, itemName, "Email body", item.content.email.body.en, item.content.email.body.id);
    }
    if (item.content?.email?.cta) {
      push(moduleTitle, itemName, "Email CTA", item.content.email.cta.en, item.content.email.cta.id);
    }
  });
});

// Grouped admin toggles (e.g. "Receipt Status Updates") render their own
// label/description in place of the underlying items' — export those too.
Object.values(NOTIFICATION_GROUPS).forEach((group) => {
  push("(grouped toggle)", group.id, "Label", group.label?.en, group.label?.id);
  push("(grouped toggle)", group.id, "Description", group.description?.en, group.description?.id);
});

const escapeCsv = (value) => {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const header = ["Module", "Item", "Field", "English", "Bahasa Indonesia"];
const csv = [header, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\n");

const outPath = join(__dirname, "notification-translations.csv");
writeFileSync(outPath, csv, "utf8");
console.log(`Wrote ${rows.length} rows to ${outPath}`);

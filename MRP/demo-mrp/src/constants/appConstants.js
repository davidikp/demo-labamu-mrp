export const COUNTRY_CODE_OPTIONS = [
  { code: "+62", label: "Indonesia", flag: "🇮🇩" },
  { code: "+1", label: "United States", flag: "🇺🇸" },
  { code: "+65", label: "Singapore", flag: "🇸🇬" },
  { code: "+60", label: "Malaysia", flag: "🇲🇾" },
  { code: "+61", label: "Australia", flag: "🇦🇺" },
  { code: "+44", label: "United Kingdom", flag: "🇬🇧" },
  { code: "+81", label: "Japan", flag: "🇯🇵" },
  { code: "+82", label: "South Korea", flag: "🇰🇷" },
  { code: "+86", label: "China", flag: "🇨🇳" },
  { code: "+91", label: "India", flag: "🇮🇳" },
  { code: "+66", label: "Thailand", flag: "🇹🇭" },
  { code: "+84", label: "Vietnam", flag: "🇻🇳" },
  { code: "+63", label: "Philippines", flag: "🇵🇭" },
];

// Full country list for the Customer "Country" field (distinct from
// COUNTRY_CODE_OPTIONS above, which is a short phone-prefix list).
export const COUNTRY_OPTIONS = [
  { value: "Indonesia", label: "Indonesia", flag: "🇮🇩" },
  { value: "United States", label: "United States", flag: "🇺🇸" },
  { value: "Singapore", label: "Singapore", flag: "🇸🇬" },
  { value: "Malaysia", label: "Malaysia", flag: "🇲🇾" },
  { value: "Australia", label: "Australia", flag: "🇦🇺" },
  { value: "United Kingdom", label: "United Kingdom", flag: "🇬🇧" },
  { value: "Japan", label: "Japan", flag: "🇯🇵" },
  { value: "South Korea", label: "South Korea", flag: "🇰🇷" },
  { value: "China", label: "China", flag: "🇨🇳" },
  { value: "India", label: "India", flag: "🇮🇳" },
  { value: "Thailand", label: "Thailand", flag: "🇹🇭" },
  { value: "Vietnam", label: "Vietnam", flag: "🇻🇳" },
  { value: "Philippines", label: "Philippines", flag: "🇵🇭" },
  { value: "Germany", label: "Germany", flag: "🇩🇪" },
  { value: "France", label: "France", flag: "🇫🇷" },
  { value: "Netherlands", label: "Netherlands", flag: "🇳🇱" },
  { value: "United Arab Emirates", label: "United Arab Emirates", flag: "🇦🇪" },
  { value: "Canada", label: "Canada", flag: "🇨🇦" },
  { value: "New Zealand", label: "New Zealand", flag: "🇳🇿" },
  { value: "Hong Kong", label: "Hong Kong", flag: "🇭🇰" },
];

export const LANGUAGE_OPTIONS = [
  { id: "en", shortLabel: "EN", label: "English", flag: "🇺🇸" },
  { id: "id", shortLabel: "ID", label: "Bahasa Indonesia", flag: "🇮🇩" },
];

export const DATE_PICKER_MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

export const DATE_PICKER_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DATE_PICKER_POPOVER_WIDTH = 360;

export const UPLOAD_MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const ALLOWED_DOCUMENT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "webp"];
export const ALLOWED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
export const MAX_PROOF_UPLOAD_FILES = 3;
export const FILE_DESCRIPTION_MAX_LENGTH = 40;
export const MAX_PURCHASE_ORDER_DOCUMENTS = 10;

# "Need To Do" Widget — English vs Bahasa Indonesia Wording

Extracted from the live source so you can compare and update translations:
- `src/components/notification/TodoPanel.jsx` (widget chrome — title, filters, search, empty state, button)
- `src/data/notification/notificationConfig.js` (`NOTIFICATION_MODULES` — module labels shown in the Module filter)
- `src/data/notification/notificationCatalog.js` (`NOTIFICATION_CATALOG` — the `todo` descriptor + `inApp()` title/body for every trigger that produces a Need To Do card)
- `src/context/NotificationContext.jsx` (`t()` — picks `obj[language]`, falling back to `obj.en`)

Every entry below already has a complete EN/ID pair in code — the widget has no untranslated strings today. This doc is a reference/QA sheet, not a gap list.

---

## 1. Widget chrome

| Element | English | Bahasa Indonesia |
|---|---|---|
| Panel title | Need To Do | Perlu Dikerjakan |
| Filter pill label | Module | Modul |
| Filter pill label | Status | Status |
| Filter pill label | Sort | Urutkan |
| Filter "all" placeholder (Module) | All Modules | Semua Modul |
| Filter "all" placeholder (Status) | All Status | Semua Status |
| Sort option | Oldest | Terlama |
| Sort option | Newest | Terbaru |
| Search placeholder | Search to-do | Cari tugas |
| Empty state | You are all caught up — no actions needed right now. | Anda sudah selesai — tidak ada tindakan yang diperlukan saat ini. |
| Card button | See Detail | Lihat Detail |

---

## 2. Module filter labels

Only modules whose catalog entries can produce a `todo` card appear in the Need To Do list — that's the 7 rows below (out of the full `NOTIFICATION_MODULES` set, which also includes Inventory, Work Order, Product Catalog, Materials, and Compliance for the bell/email-only notifications).

| Module key | English | Bahasa Indonesia |
|---|---|---|
| rfq | RFQ | RFQ |
| quote | Quote | Penawaran |
| order | Order | Order |
| purchase_order | Purchase Order | Purchase Order |
| custom_product_request | Custom Product Request | Custom Product Request |
| invoice | Invoice | Invoice |
| material_request | Material Request | Permintaan Material |

---

## 3. Status tag (badge) labels

Each card's status tag comes from `todo.tag` on the catalog entry, colored via `STATUS_COLOR` in `TodoPanel.jsx` (`approval`→orange, `revision`→yellow, `proof`→blue, `receipt`→green).

| Todo type | English | Bahasa Indonesia |
|---|---|---|
| approval | Needs your approval | Perlu persetujuan Anda |
| revision | Needs revision | Perlu revisi |
| proof | Review proof | Tinjau bukti |
| receipt | Confirm receipt | Konfirmasi penerimaan |

---

## 4. Card title & body, per module / trigger

`{placeholder}` = a dynamic value substituted from the notification's context (`ctx`) at send time — e.g. `{number}` is the entity's document number, `{note}` is the reviewer's free-text note.

### RFQ

| Trigger | Tag | Title (EN) | Title (ID) |
|---|---|---|---|
| submitted | Needs your approval | `Request for Quote {number} needs your approval` | `Request for Quote {number} memerlukan persetujuan Anda` |
| need_revision | Needs revision | `Request for Quote {number} needs revision` | `Request for Quote {number} memerlukan revisi` |

| Trigger | Body (EN) | Body (ID) |
|---|---|---|
| submitted | Submitted by {submitterName} is waiting for your review. | Diajukan oleh {submitterName} dan sedang menunggu peninjauan Anda. |
| need_revision | {approverName} requested changes. Note: "{note}" | {approverName} meminta perubahan. Catatan: "{note}" |

### Quote

| Trigger | Tag | Title (EN) | Title (ID) |
|---|---|---|---|
| submitted | Needs your approval | `Quote {number} needs your approval` | `Quote {number} memerlukan persetujuan Anda` |
| need_revision | Needs revision | `Quote {number} needs revision` | `Quote {number} memerlukan revisi` |
| customer_revision | Needs revision | `Quote {number} needs revision` | `Quote {number} perlu revisi` |

| Trigger | Body (EN) | Body (ID) |
|---|---|---|
| submitted | Submitted by {submitterName} is waiting for your review. | Diajukan oleh {submitterName} dan sedang menunggu peninjauan Anda. |
| need_revision | {approverName} requested changes. Note: "{note}" | {approverName} meminta perubahan. Catatan: "{note}" |
| customer_revision | {customerPicName} from {customerCompany} requested changes. Note: "{note}" | {customerPicName} dari {customerCompany} meminta perubahan. Catatan: "{note}" |

### Order

| Trigger | Tag | Title (EN) | Title (ID) |
|---|---|---|---|
| submitted | Needs your approval | `Order {number} needs your approval` | `Order {number} memerlukan persetujuan Anda` |
| need_revision | Needs revision | `Order {number} needs revision` | `Order {number} memerlukan revisi` |

| Trigger | Body (EN) | Body (ID) |
|---|---|---|
| submitted | Submitted by {submitterName} is waiting for your review. | Diajukan oleh {submitterName} dan sedang menunggu peninjauan Anda. |
| need_revision | {approverName} requested changes. Note: "{note}" | {approverName} meminta perubahan. Catatan: "{note}" |

### Purchase Order

| Trigger | Tag | Title (EN) | Title (ID) |
|---|---|---|---|
| submitted | Needs your approval | `Purchase Order {number} needs your approval` | `Purchase Order {number} memerlukan persetujuan Anda` |
| need_revision | Needs revision | `Purchase Order {number} needs revision` | `Purchase Order {number} memerlukan revisi` |

| Trigger | Body (EN) | Body (ID) |
|---|---|---|
| submitted | Submitted by {submitterName} is waiting for your review. | Diajukan oleh {submitterName} dan sedang menunggu peninjauan Anda. |
| need_revision | {approverName} requested changes. Note: "{note}" | {approverName} meminta perubahan. Catatan: "{note}" |

### Custom Product Request

| Trigger | Tag | Title (EN) | Title (ID) |
|---|---|---|---|
| submitted | Needs your approval | `Custom Product Request {number} needs your approval` | `Custom Product Request {number} memerlukan persetujuan Anda` |
| need_revision | Needs revision | `Custom Product Request {number} needs revision` | `Custom Product Request {number} memerlukan revisi` |

| Trigger | Body (EN) | Body (ID) |
|---|---|---|
| submitted | Submitted by {submitterName} is waiting for your review. | Diajukan oleh {submitterName} dan sedang menunggu peninjauan Anda. |
| need_revision | {approverName} requested changes. Note: "{note}" | {approverName} meminta perubahan. Catatan: "{note}" |

### Invoice

| Trigger | Tag | Title (EN) | Title (ID) |
|---|---|---|---|
| customer_revision | Needs revision | `Invoice {number} needs revision` | `Invoice {number} perlu revisi` |
| proof_uploaded | Review proof | `Invoice {number} needs payment proof review` | `Invoice {number} perlu peninjauan bukti pembayaran` |

| Trigger | Body (EN) | Body (ID) |
|---|---|---|
| customer_revision | {customerPicName} from {customerCompany} requested changes. Note: "{note}" | {customerPicName} dari {customerCompany} meminta perubahan. Catatan: "{note}" |
| proof_uploaded | {customerPicName} from {customerCompany} uploaded a payment proof. Please review and confirm. | {customerPicName} dari {customerCompany} telah mengunggah bukti pembayaran. Mohon tinjau dan konfirmasi. |

### Material Request

| Trigger | Tag | Title (EN) | Title (ID) |
|---|---|---|---|
| transfer_started | Confirm receipt | `Material Request {requestId} needs receipt confirmation` | `Permintaan Material {requestId} perlu konfirmasi penerimaan` |

| Trigger | Body (EN) | Body (ID) |
|---|---|---|
| transfer_started | {preparerName} has transferred materials for your request from {workOrderNo}. Please confirm you have received the items. | {preparerName} telah mentransfer material untuk permintaan Anda dari {workOrderNo}. Mohon konfirmasi bahwa Anda telah menerima barang tersebut. |

---

## Notes

- EN revision notes are wrapped in straight quotes (`"…"`); ID revision notes use curly quotes (`"…"` / `"…"`) via a separate `quoteId()` helper — this is intentional, not a typo, in `notificationCatalog.js`.
- The 14 rows in section 4 are exactly the (module, trigger) pairs where `todo` is non-null in `NOTIFICATION_CATALOG` — every other trigger (approved, rejected, deadlines, etc.) is bell/email-only and never appears as a Need To Do card.
- Card entity-id / module icon (`MODULE_ICON` in `TodoPanel.jsx`) is a visual lookup only, not translatable text.

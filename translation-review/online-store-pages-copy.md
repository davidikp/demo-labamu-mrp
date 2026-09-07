# Online Store Pages — Full Copy Export (EN vs ID)

Covers every screen in the Pages feature: the Page List, the Page Detail/Create-Edit screen, and its Generate Text (AI) modal.

Source repo: `merchant-backoffice`
- `src/pages/online-store/PagesManagement.jsx`
- `src/pages/online-store/PageEditor.jsx`
- `src/pages/online-store/GenerateTextModal.jsx`

Locale files: `src/locales/en/sectionBuilder.json`, `src/locales/id/sectionBuilder.json`

Legend: ⚠️ = key missing from id/sectionBuilder.json (currently falls back to English at runtime)

**91 of 110 keys have no Bahasa Indonesia translation yet.**

## Page List (Online Store > Pages)

`PagesManagement.jsx` — 47 strings

| Key | English | Bahasa Indonesia | Status |
|---|---|---|---|
| `onlineStore.pages.scheduled` | Scheduled | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.hidden` | Hidden | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.visible` | Visible | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.bulkVisibilitySuccess` | Visibility for {{count}} pages successfully updated | Visibilitas untuk {{count}} halaman berhasil diperbarui | OK |
| `onlineStore.pages.bulkVisibilityFailed` | Failed to update page visibility | Gagal memperbarui visibilitas halaman | OK |
| `onlineStore.pages.bulkVisibilityPartialSuccess` | Visibility updated for {{successCount}} of {{totalCount}} pages. Please try again for the rest | Visibilitas telah diperbarui untuk {{successCount}} dari {{totalCount}} halaman. Silakan coba lagi untuk sisanya | OK |
| `onlineStore.pages.scheduleRequired` | Select a publish date and time. | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.scheduleMustBeFuture` | Choose a date and time in the future. | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.bulkDeleteSuccess` | {{count}} pages successfully deleted | {{count}} halaman berhasil dihapus | OK |
| `onlineStore.pages.bulkDeleteFailed` | Failed to delete pages | Gagal menghapus halaman | OK |
| `onlineStore.pages.bulkDeletePartialSuccess` | {{successCount}} of {{totalCount}} pages deleted. Some pages couldn’t be deleted. Please try again | {{successCount}} dari {{totalCount}} halaman berhasil dihapus. Beberapa halaman tidak dapat dihapus. Silakan coba lagi | OK |
| `onlineStore.pages.columnTitle` | Title | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.columnVisibility` | Visibility | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.columnUrl` | URL | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.columnContent` | Content | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.columnUpdated` | Updated | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.simulateLoadError` | Simulate load error | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.simulateNotFound` | Simulate page not found | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.simulateBulkDelete` | Bulk delete | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.simulateNone` | None | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.simulatePartialFailure` | Partial failure | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.simulateTotalFailure` | Total failure | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.simulateBulkVisibility` | Change visibility | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.notFoundTitle` | Page not found | Halaman Tidak Ditemukan | OK |
| `onlineStore.pageEditor.notFoundDescription` | This page may have been deleted or is no longer available. | Halaman ini mungkin telah dihapus atau tidak lagi tersedia. | OK |
| `onlineStore.pageEditor.notFoundGoToList` | Go to Page List | Buka Daftar Halaman | OK |
| `onlineStore.pageEditor.loadErrorTitle` | Couldn’t load this page | Halaman ini tidak dapat dimuat | OK |
| `onlineStore.pageEditor.loadErrorDescription` | Something went wrong while loading the page. Please try again. | Terjadi kesalahan saat memuat halaman. Silakan coba lagi. | OK |
| `onlineStore.pageEditor.loadErrorReload` | Reload Page | Muat Ulang Halaman | OK |
| `editor.pagesPanel.heading` | Pages | Halaman | OK |
| `onlineStore.pages.addPage` | New Page | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.bulkSelectedCount` | {{count}} selected | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.setVisible` | Set as visible | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.setHidden` | Set as hidden | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.setSchedule` | Set schedule visibility | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.bulkMoreActions` | More actions | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.deletePages` | Delete pages | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.searchPlaceholder` | Search by page title | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.filterVisibility` | Visibility | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.noPages` | No pages yet | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.bulkDeleteConfirmTitle` | Delete {{count}} pages? | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.bulkDeleteConfirmDescription` | This can’t be undone. | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.scheduleModalTitle` | Set schedule visibility | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.scheduleModalDescription` | {{count}} pages will become visible at this date and time. | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.scheduleConfirm` | Schedule | *(missing — shows English)* | ⚠️ MISSING |
| `editor.common.cancel` | Cancel | Batal | OK |
| `onlineStore.pages.scheduleDateLabel` | Publish date and time | *(missing — shows English)* | ⚠️ MISSING |

## Page Detail / Create & Edit Page

`PageEditor.jsx` — 49 strings

| Key | English | Bahasa Indonesia | Status |
|---|---|---|---|
| `onlineStore.pageEditor.titleRequired` | Field cannot be empty | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.saveFailedBanner` | Failed to save page | Gagal menyimpan halaman | OK |
| `onlineStore.pageEditor.scheduleRequired` | Select a publish date and time in the future. | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.urlHandleTaken` | This URL handle is already in use by another page. | Handle URL ini sudah digunakan oleh halaman lain. | OK |
| `onlineStore.pageEditor.savedSnackbar` | Page successfully saved | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.duplicatedSnackbar` | Page successfully duplicated | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.addNewPageTitle` | Add New Page | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.editPageTitle` | Edit Page | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.simulateSaveError` | Simulate save error | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.simulateLoadError` | Simulate load error | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.simulateNotFound` | Simulate page not found | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.simulateGenerateFailed` | Simulate generation failed | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.simulateAiUnavailable` | Simulate AI unavailable | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pages.heading` | Pages | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.titleLabel` | Title | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.generateText` | Generate text | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.titlePlaceholder` | e.g. About us | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.contentLabel` | Content | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.seoHeading` | Search engine listing | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.storeName` | Your store | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.untitled` | Untitled page | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.noDescription` | Add a description to see how this page might appear in search results. | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.metaTitle` | Page title | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.metaDescription` | Meta description | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.urlHandle` | URL handle | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.redirectOldHandle` | Create a redirect from the old URL ({{old}}) | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.visibilityHeading` | Visibility | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.visibleImmediately` | Visible | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.scheduleLabel` | Schedule | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.visibleAsOf` | Publish date and time | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.templateHeading` | Template | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.delete` | Delete | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.duplicate` | Duplicate | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.preview` | Preview | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.editInEditor` | Edit in Editor | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.saveChanges` | Save changes | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.save` | Save | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.deleteConfirmTitle` | Delete this page? | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.deleteConfirmDescription` | This page and its content will be permanently deleted. | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.duplicateConfirmTitle` | Duplicate page? | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.cancel` | Cancel | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.duplicatePageTitleLabel` | Page title | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.unsavedEditorTitle` | You have unsaved changes | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.unsavedEditorDescription` | Save your changes before opening the section editor, or keep editing here. | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.saveAndContinue` | Save changes | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.keepEditing` | Keep editing | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.discardChangesTitle` | Discard changes? | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.discardChangesDescription` | You have unsaved changes that will be lost if you leave this page. | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.discardChangesConfirm` | Yes, Discard | *(missing — shows English)* | ⚠️ MISSING |

## Generate Text Modal (AI, used inside Page Detail)

`GenerateTextModal.jsx` — 14 strings

| Key | English | Bahasa Indonesia | Status |
|---|---|---|---|
| `onlineStore.pageEditor.generateError` | Failed to generate content | Gagal menghasilkan konten | OK |
| `onlineStore.pageEditor.generateUnavailable` | AI generation is currently unavailable | Pembuatan konten AI saat ini tidak tersedia. | OK |
| `onlineStore.pageEditor.generateTitleHeading` | Generate a title with Labamu AI | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.generateContentHeading` | Generate content with Labamu AI | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.generateReplace` | Replace content | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.generateUse` | Use this text | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.generating` | Generating… | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.generate` | Generate | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.generateInsert` | Insert alongside | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.generatePromptLabel` | Describe what you want | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.generateRegenerate` | Regenerate | Buat ulang | OK |
| `onlineStore.pageEditor.generateTitlePlaceholder` | e.g. A warm about-us page for a family bakery | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.generateContentPlaceholder` | e.g. Explain our shipping and return policy | *(missing — shows English)* | ⚠️ MISSING |
| `onlineStore.pageEditor.generateResultLabel` | Labamu AI generated | *(missing — shows English)* | ⚠️ MISSING |

## All Missing Translations (fill in this column)

| Screen | Key | English | Proposed Bahasa Indonesia |
|---|---|---|---|
| Page List (Online Store > Pages) | `onlineStore.pages.scheduled` | Scheduled | |
| Page List (Online Store > Pages) | `onlineStore.pages.hidden` | Hidden | |
| Page List (Online Store > Pages) | `onlineStore.pages.visible` | Visible | |
| Page List (Online Store > Pages) | `onlineStore.pages.scheduleRequired` | Select a publish date and time. | |
| Page List (Online Store > Pages) | `onlineStore.pages.scheduleMustBeFuture` | Choose a date and time in the future. | |
| Page List (Online Store > Pages) | `onlineStore.pages.columnTitle` | Title | |
| Page List (Online Store > Pages) | `onlineStore.pages.columnVisibility` | Visibility | |
| Page List (Online Store > Pages) | `onlineStore.pages.columnUrl` | URL | |
| Page List (Online Store > Pages) | `onlineStore.pages.columnContent` | Content | |
| Page List (Online Store > Pages) | `onlineStore.pages.columnUpdated` | Updated | |
| Page List (Online Store > Pages) | `onlineStore.pages.simulateLoadError` | Simulate load error | |
| Page List (Online Store > Pages) | `onlineStore.pages.simulateNotFound` | Simulate page not found | |
| Page List (Online Store > Pages) | `onlineStore.pages.simulateBulkDelete` | Bulk delete | |
| Page List (Online Store > Pages) | `onlineStore.pages.simulateNone` | None | |
| Page List (Online Store > Pages) | `onlineStore.pages.simulatePartialFailure` | Partial failure | |
| Page List (Online Store > Pages) | `onlineStore.pages.simulateTotalFailure` | Total failure | |
| Page List (Online Store > Pages) | `onlineStore.pages.simulateBulkVisibility` | Change visibility | |
| Page List (Online Store > Pages) | `onlineStore.pages.addPage` | New Page | |
| Page List (Online Store > Pages) | `onlineStore.pages.bulkSelectedCount` | {{count}} selected | |
| Page List (Online Store > Pages) | `onlineStore.pages.setVisible` | Set as visible | |
| Page List (Online Store > Pages) | `onlineStore.pages.setHidden` | Set as hidden | |
| Page List (Online Store > Pages) | `onlineStore.pages.setSchedule` | Set schedule visibility | |
| Page List (Online Store > Pages) | `onlineStore.pages.bulkMoreActions` | More actions | |
| Page List (Online Store > Pages) | `onlineStore.pages.deletePages` | Delete pages | |
| Page List (Online Store > Pages) | `onlineStore.pages.searchPlaceholder` | Search by page title | |
| Page List (Online Store > Pages) | `onlineStore.pages.filterVisibility` | Visibility | |
| Page List (Online Store > Pages) | `onlineStore.pages.noPages` | No pages yet | |
| Page List (Online Store > Pages) | `onlineStore.pages.bulkDeleteConfirmTitle` | Delete {{count}} pages? | |
| Page List (Online Store > Pages) | `onlineStore.pages.bulkDeleteConfirmDescription` | This can’t be undone. | |
| Page List (Online Store > Pages) | `onlineStore.pages.scheduleModalTitle` | Set schedule visibility | |
| Page List (Online Store > Pages) | `onlineStore.pages.scheduleModalDescription` | {{count}} pages will become visible at this date and time. | |
| Page List (Online Store > Pages) | `onlineStore.pages.scheduleConfirm` | Schedule | |
| Page List (Online Store > Pages) | `onlineStore.pages.scheduleDateLabel` | Publish date and time | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.titleRequired` | Field cannot be empty | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.scheduleRequired` | Select a publish date and time in the future. | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.savedSnackbar` | Page successfully saved | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.duplicatedSnackbar` | Page successfully duplicated | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.addNewPageTitle` | Add New Page | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.editPageTitle` | Edit Page | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.simulateSaveError` | Simulate save error | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.simulateLoadError` | Simulate load error | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.simulateNotFound` | Simulate page not found | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.simulateGenerateFailed` | Simulate generation failed | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.simulateAiUnavailable` | Simulate AI unavailable | |
| Page Detail / Create & Edit Page | `onlineStore.pages.heading` | Pages | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.titleLabel` | Title | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.generateText` | Generate text | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.titlePlaceholder` | e.g. About us | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.contentLabel` | Content | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.seoHeading` | Search engine listing | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.storeName` | Your store | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.untitled` | Untitled page | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.noDescription` | Add a description to see how this page might appear in search results. | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.metaTitle` | Page title | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.metaDescription` | Meta description | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.urlHandle` | URL handle | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.redirectOldHandle` | Create a redirect from the old URL ({{old}}) | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.visibilityHeading` | Visibility | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.visibleImmediately` | Visible | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.scheduleLabel` | Schedule | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.visibleAsOf` | Publish date and time | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.templateHeading` | Template | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.delete` | Delete | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.duplicate` | Duplicate | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.preview` | Preview | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.editInEditor` | Edit in Editor | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.saveChanges` | Save changes | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.save` | Save | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.deleteConfirmTitle` | Delete this page? | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.deleteConfirmDescription` | This page and its content will be permanently deleted. | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.duplicateConfirmTitle` | Duplicate page? | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.cancel` | Cancel | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.duplicatePageTitleLabel` | Page title | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.unsavedEditorTitle` | You have unsaved changes | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.unsavedEditorDescription` | Save your changes before opening the section editor, or keep editing here. | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.saveAndContinue` | Save changes | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.keepEditing` | Keep editing | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.discardChangesTitle` | Discard changes? | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.discardChangesDescription` | You have unsaved changes that will be lost if you leave this page. | |
| Page Detail / Create & Edit Page | `onlineStore.pageEditor.discardChangesConfirm` | Yes, Discard | |
| Generate Text Modal (AI, used inside Page Detail) | `onlineStore.pageEditor.generateTitleHeading` | Generate a title with Labamu AI | |
| Generate Text Modal (AI, used inside Page Detail) | `onlineStore.pageEditor.generateContentHeading` | Generate content with Labamu AI | |
| Generate Text Modal (AI, used inside Page Detail) | `onlineStore.pageEditor.generateReplace` | Replace content | |
| Generate Text Modal (AI, used inside Page Detail) | `onlineStore.pageEditor.generateUse` | Use this text | |
| Generate Text Modal (AI, used inside Page Detail) | `onlineStore.pageEditor.generating` | Generating… | |
| Generate Text Modal (AI, used inside Page Detail) | `onlineStore.pageEditor.generate` | Generate | |
| Generate Text Modal (AI, used inside Page Detail) | `onlineStore.pageEditor.generateInsert` | Insert alongside | |
| Generate Text Modal (AI, used inside Page Detail) | `onlineStore.pageEditor.generatePromptLabel` | Describe what you want | |
| Generate Text Modal (AI, used inside Page Detail) | `onlineStore.pageEditor.generateTitlePlaceholder` | e.g. A warm about-us page for a family bakery | |
| Generate Text Modal (AI, used inside Page Detail) | `onlineStore.pageEditor.generateContentPlaceholder` | e.g. Explain our shipping and return policy | |
| Generate Text Modal (AI, used inside Page Detail) | `onlineStore.pageEditor.generateResultLabel` | Labamu AI generated | |

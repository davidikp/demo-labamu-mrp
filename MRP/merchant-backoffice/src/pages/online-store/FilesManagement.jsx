import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Table, MainBtn, MediaUploadField } from '../../ce-ui';
import { loadDraft } from '../section-builder/state/storage';
import { createFreshState } from '../section-builder/state/useSectionBuilder';
import { runDraftAction } from '../section-builder/state/runDraftAction';
import { ACTIONS } from '../section-builder/state/builderReducer';
import ConfirmDialog from '../section-builder/ui/ConfirmDialog';
import { matchesSearch } from '../section-builder/sections/mediaHelpers';
import { formatRelativeTime } from './timeUtils';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry and
// PagesManagement.jsx.
const STORE_ID = 'demo';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024;

function probeDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: null, height: null });
    img.src = dataUrl;
  });
}

// `uploadedAt` is persisted as an ISO string (see MediaLibraryPanel.jsx's
// UploadZone / SelectImageModal.jsx's handleFile) but formatRelativeTime
// (timeUtils.js) expects an epoch-ms number — matching how
// ThemeGalleryCards.jsx's `lastSavedAt` is stored/consumed there.
function uploadedAtMs(item) {
  const ms = Date.parse(item.uploadedAt);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * @module pages/online-store/FilesManagement
 * @description Content > Files — Shopify-style table list of every image in
 * the site's shared `mediaLibrary` (the same array Section Builder's Media
 * panel and the Rich Text Editor's image picker read/write, see
 * mediaHelpers.js). Uploading or deleting here goes through the same
 * ADD_MEDIA_ITEM/DELETE_MEDIA_ITEM/BULK_DELETE_MEDIA_ITEMS reducer actions
 * those surfaces use, via runDraftAction, so all three stay in sync.
 */
export default function FilesManagement() {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(() => loadDraft(STORE_ID) ?? createFreshState(STORE_ID));
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [selectedIds, setSelectedIds] = useState([]);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const mediaLibrary = useMemo(() => draft.mediaLibrary ?? [], [draft.mediaLibrary]);

  const filtered = useMemo(() => {
    if (!search.trim()) return mediaLibrary;
    return mediaLibrary.filter((item) => matchesSearch(item, search));
  }, [mediaLibrary, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  const handleUpload = async (payload) => {
    if (!ACCEPTED_TYPES.includes(payload.file.type)) {
      setUploadError(t('sectionBuilder:onlineStore.files.unsupportedFileType', 'That file type isn’t supported. Please upload an image.'));
      return;
    }
    if (payload.file.size > MAX_BYTES) {
      setUploadError(t('sectionBuilder:onlineStore.files.fileTooLarge', 'That image is too large (max 10MB).'));
      return;
    }
    setUploadError(null);
    const { width, height } = await probeDimensions(payload.src);
    const item = {
      id: crypto.randomUUID(),
      filename: payload.name,
      url: payload.src,
      width,
      height,
      uploadedAt: new Date().toISOString(),
    };
    const next = runDraftAction(STORE_ID, { type: ACTIONS.ADD_MEDIA_ITEM, item });
    setDraft(next);
  };

  const handleDeleteConfirm = () => {
    if (!pendingDeleteId) return;
    const next = runDraftAction(STORE_ID, { type: ACTIONS.DELETE_MEDIA_ITEM, id: pendingDeleteId });
    setDraft(next);
    setSelectedIds((ids) => ids.filter((id) => id !== pendingDeleteId));
    setPendingDeleteId(null);
  };

  const handleBulkDeleteConfirm = () => {
    const next = runDraftAction(STORE_ID, { type: ACTIONS.BULK_DELETE_MEDIA_ITEMS, ids: selectedIds });
    setDraft(next);
    setSelectedIds([]);
    setConfirmBulkDelete(false);
  };

  const columns = [
    {
      key: 'url',
      header: t('sectionBuilder:onlineStore.files.columnPreview', 'Preview'),
      render: (_value, row) => (
        <img
          src={row.url}
          alt={row.filename}
          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, border: '1px solid #E9E9E9' }}
        />
      ),
    },
    {
      key: 'filename',
      header: t('sectionBuilder:onlineStore.files.columnFilename', 'Filename'),
      render: (value) => <span style={{ fontWeight: 700, color: '#282828' }}>{value}</span>,
    },
    {
      key: 'dimensions',
      header: t('sectionBuilder:onlineStore.files.columnDimensions', 'Dimensions'),
      render: (_value, row) => (row.width && row.height ? `${row.width}×${row.height}` : '—'),
    },
    {
      key: 'uploadedAt',
      header: t('sectionBuilder:onlineStore.files.columnUploaded', 'Uploaded'),
      render: (_value, row) => {
        const ms = uploadedAtMs(row);
        return ms ? formatRelativeTime(ms) : '—';
      },
    },
    {
      key: 'actions',
      header: '',
      render: (_value, row) => (
        <button
          type="button"
          aria-label={t('sectionBuilder:onlineStore.files.deleteFile', 'Delete file')}
          onClick={() => setPendingDeleteId(row.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DA1E28', display: 'flex', alignItems: 'center' }}
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828' }}>
            {t('sectionBuilder:onlineStore.files.heading', 'Files')}
          </h1>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '16px', marginBottom: '16px' }}>
          {/* `items={[]}` keeps this permanently a dropzone rather than
              switching into MediaUploadField's own thumbnail grid — this
              screen's own Table below is that grid, same convention as
              MediaLibraryPanel.jsx's UploadZone. */}
          <MediaUploadField items={[]} maxItems={1} maxSizeMB={10} onAdd={handleUpload} onReplace={() => {}} onRemove={() => {}} />
          {uploadError && <p style={{ marginTop: 8, fontSize: 12, color: '#DA1E28' }}>{uploadError}</p>}
        </div>

        <div className="files-table-wrapper" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', position: 'relative' }}>
          <Table
            columns={columns}
            data={paged}
            totalRows={filtered.length}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            hidePaginationOnSinglePage
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            toolbar={
              selectedIds.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#282828' }}>
                    {t('sectionBuilder:onlineStore.files.bulkSelectedCount', '{{count}} selected', { count: selectedIds.length })}
                  </span>
                  <MainBtn
                    variant="secondary"
                    size="sm"
                    label={t('sectionBuilder:onlineStore.files.deleteFiles', 'Delete files')}
                    onClick={() => setConfirmBulkDelete(true)}
                  />
                </div>
              ) : undefined
            }
            filters={{
              search: {
                value: search,
                onChange: (value) => {
                  setSearch(value);
                  setPage(1);
                },
                placeholder: t('sectionBuilder:onlineStore.files.searchPlaceholder', 'Search by filename'),
              },
              rowsPerPage: {
                onChange: (nextPerPage) => {
                  setPerPage(nextPerPage);
                  setPage(1);
                },
              },
            }}
            emptyStateTitle={t('sectionBuilder:onlineStore.files.noFiles', 'No files yet')}
          />
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteId)}
        danger
        title={t('sectionBuilder:onlineStore.files.deleteConfirmTitle', 'Delete this file?')}
        description={t('sectionBuilder:onlineStore.files.deleteConfirmDescription', 'This can’t be undone.')}
        confirmLabel={t('sectionBuilder:onlineStore.files.deleteFile', 'Delete file')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDeleteId(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        danger
        title={t('sectionBuilder:onlineStore.files.bulkDeleteConfirmTitle', 'Delete {{count}} files?', { count: selectedIds.length })}
        description={t('sectionBuilder:onlineStore.files.deleteConfirmDescription', 'This can’t be undone.')}
        confirmLabel={t('sectionBuilder:onlineStore.files.deleteFiles', 'Delete files')}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setConfirmBulkDelete(false)}
      />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { Table, Popup, MainBtn } from '../../ce-ui';
import { loadDraft } from '../section-builder/state/storage';
import { createFreshState } from '../section-builder/state/useSectionBuilder';
import { runDraftAction } from '../section-builder/state/runDraftAction';
import { ACTIONS } from '../section-builder/state/builderReducer';
import { slugify } from '../section-builder/sections/pageHelpers';

// TODO: replace with the real active store id once multi-store routing
// exists — matches the hardcoded id used by Layout.jsx's builder entry and
// PagesManagement.jsx/FilesManagement.jsx.
const STORE_ID = 'demo';

/**
 * Menu editor — opened as a Popup (ce-ui) rather than a nested
 * `/content/menus/:menuId` route, matching how this codebase already
 * prefers a modal for "edit a sub-entity" elsewhere (e.g. PagesManagement's
 * schedule-visibility Popup) when the sub-entity has no deep-linkable
 * content of its own worth a dedicated URL. Mirrors the label+url
 * add/reorder/remove UX of RepeaterField.jsx's nav-link items, but commits
 * the whole array in one UPDATE_MENU_ITEMS action on Save rather than
 * dispatching per-edit — there's no live undo/redo history to coalesce
 * into outside the Section Builder itself (see runDraftAction.js).
 */
function MenuEditorPopup({ menu, onSave, onClose }) {
  const { t } = useTranslation();
  const [items, setItems] = useState(() => menu.items.map((item) => ({ ...item })));

  const addItem = () => {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), label: '', url: '/' }]);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const moveItem = (id, direction) => {
    setItems((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      const target = idx + direction;
      if (idx === -1 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const updateItem = (id, patch) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  return (
    <Popup
      open
      onClose={onClose}
      platform="tablet"
      align="left"
      className="!w-[640px] !max-w-[95vw]"
      title={t('sectionBuilder:onlineStore.menus.editMenuTitle', 'Edit {{name}}', { name: menu.name })}
      primaryAction={{
        label: t('sectionBuilder:onlineStore.menus.save', 'Save'),
        onClick: () => onSave(items),
      }}
      secondaryAction={{
        label: t('sectionBuilder:editor.common.cancel', 'Cancel'),
        onClick: onClose,
      }}
    >
      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <p className="text-sm text-gray-500">{t('sectionBuilder:onlineStore.menus.noItems', 'No menu items yet.')}</p>
        )}
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 rounded-lg border border-gray-200 p-2">
            <input
              type="text"
              value={item.label}
              onChange={(e) => updateItem(item.id, { label: e.target.value })}
              placeholder={t('sectionBuilder:onlineStore.menus.labelPlaceholder', 'Label')}
              className="w-1/2 rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <input
              type="text"
              value={item.url}
              onChange={(e) => updateItem(item.id, { url: e.target.value })}
              placeholder={t('sectionBuilder:onlineStore.menus.urlPlaceholder', 'URL')}
              className="w-1/2 rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <button type="button" onClick={() => moveItem(item.id, -1)} disabled={index === 0} className="text-gray-500 disabled:opacity-30">
              <ChevronUp size={16} />
            </button>
            <button type="button" onClick={() => moveItem(item.id, 1)} disabled={index === items.length - 1} className="text-gray-500 disabled:opacity-30">
              <ChevronDown size={16} />
            </button>
            <button type="button" onClick={() => removeItem(item.id)} aria-label={t('sectionBuilder:editor.common.delete', 'Delete')} className="text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="mt-1 flex w-fit items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <Plus size={14} />
          {t('sectionBuilder:onlineStore.menus.addItem', 'Add menu item')}
        </button>
      </div>
    </Popup>
  );
}

// Same "slug + short unique suffix on collision" convention as
// pageHelpers.js's createPageId, applied to menu ids instead of page ids —
// menu ids are used as `state.menus` object keys (and as the
// `nav_menu_ref.menuId` a header/footer section stores), so they must be
// unique and stable, not merely human-readable.
function createMenuId(name, existingMenus) {
  const base = slugify(name) || 'menu';
  if (!existingMenus[base]) return base;
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

/**
 * "Create menu" naming popup — a single text input, mirroring the simple
 * inline-name-prompt pattern PageEditor.jsx/PagesManagement.jsx use for
 * page renames, just scoped to this screen's Popup usage instead of a
 * dedicated route.
 */
function CreateMenuPopup({ onCreate, onClose }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');

  return (
    <Popup
      open
      onClose={onClose}
      platform="tablet"
      align="left"
      title={t('sectionBuilder:onlineStore.menus.createMenuTitle', 'Create menu')}
      primaryAction={{
        label: t('sectionBuilder:onlineStore.menus.create', 'Create menu'),
        onClick: () => onCreate(name.trim()),
        disabled: !name.trim(),
      }}
      secondaryAction={{
        label: t('sectionBuilder:editor.common.cancel', 'Cancel'),
        onClick: onClose,
      }}
    >
      <input
        type="text"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('sectionBuilder:onlineStore.menus.namePlaceholder', 'e.g. Main menu')}
        className="w-full rounded-md border border-gray-200 px-2 py-1.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />
    </Popup>
  );
}

/**
 * @module pages/online-store/MenusManagement
 * @description Content > Menus — Shopify-style list of the site's navigation
 * menus (`state.menus`, see builderReducer.js createInitialState/
 * ACTIONS.UPDATE_MENU_ITEMS), each opening into MenuEditorPopup above to
 * add/edit/reorder/remove its `{label, url}` items. Header/footer sections
 * reference one of these menus by id via their `nav_menu_ref` field.
 */
export default function MenusManagement() {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(() => loadDraft(STORE_ID) ?? createFreshState(STORE_ID));
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [creatingMenu, setCreatingMenu] = useState(false);

  const menus = useMemo(() => Object.values(draft.menus ?? {}), [draft.menus]);
  const editingMenu = editingMenuId ? draft.menus?.[editingMenuId] : null;

  const handleSave = (items) => {
    const next = runDraftAction(STORE_ID, { type: ACTIONS.UPDATE_MENU_ITEMS, menuId: editingMenuId, items });
    setDraft(next);
    setEditingMenuId(null);
  };

  const handleCreate = (name) => {
    const id = createMenuId(name, draft.menus ?? {});
    const next = runDraftAction(STORE_ID, { type: ACTIONS.CREATE_MENU, id, name });
    setDraft(next);
    setCreatingMenu(false);
  };

  const columns = [
    {
      key: 'name',
      header: t('sectionBuilder:onlineStore.menus.columnName', 'Title'),
      render: (value) => <span style={{ fontWeight: 700, color: '#282828' }}>{value}</span>,
    },
    {
      key: 'items',
      header: t('sectionBuilder:onlineStore.menus.columnItems', 'Items'),
      render: (value) => t('sectionBuilder:onlineStore.menus.itemCount', '{{count}} items', { count: value.length }),
    },
  ];

  return (
    <div style={{ background: '#F4F4F4', minHeight: 'calc(100vh - 56px)', fontFamily: "'Lato', sans-serif" }}>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828' }}>
            {t('sectionBuilder:onlineStore.menus.heading', 'Menus')}
          </h1>
          <MainBtn
            variant="primary"
            size="sm"
            label={t('sectionBuilder:onlineStore.menus.create', 'Create menu')}
            onClick={() => setCreatingMenu(true)}
          />
        </div>

        <div className="menus-table-wrapper" style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', position: 'relative' }}>
          <Table
            columns={columns}
            data={menus}
            onRowClick={(row) => setEditingMenuId(row.id)}
            totalRows={menus.length}
            hidePaginationOnSinglePage
            emptyStateTitle={t('sectionBuilder:onlineStore.menus.noMenus', 'No menus yet')}
          />
        </div>
      </div>

      {editingMenu && (
        <MenuEditorPopup menu={editingMenu} onSave={handleSave} onClose={() => setEditingMenuId(null)} />
      )}
      {creatingMenu && (
        <CreateMenuPopup onCreate={handleCreate} onClose={() => setCreatingMenu(false)} />
      )}
    </div>
  );
}

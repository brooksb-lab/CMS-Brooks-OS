import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, ChevronDown, Eye, EyeOff, Trash2, Plus,
  Folder, GripVertical, FileText, UploadCloud, Check, Lock, Shield, Loader2,
  MoveUpRight, RotateCcw, Palette, Layers, ArrowUp, ArrowDown, X, Sparkles, AlertCircle
} from 'lucide-react';
import { WindowData, Block, CloudinaryUploadField, SiteSettings, WallpaperFrame, DEFAULT_WALLPAPER_FRAMES } from './SystemSettingsAppView';

interface MobileSystemSettingsAppViewProps {
  windowsList: WindowData[];
  setWindowsList: React.Dispatch<React.SetStateAction<WindowData[]>>;
  dockOrder: string[];
  setDockOrder: React.Dispatch<React.SetStateAction<string[]>>;
  desktopOrder: string[];
  setDesktopOrder: React.Dispatch<React.SetStateAction<string[]>>;
  site: SiteSettings;
  setSite: React.Dispatch<React.SetStateAction<SiteSettings>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  collapsedGroups: Record<string, boolean>;
  setCollapsedGroups: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  collapsedFolders: Record<string, boolean>;
  setCollapsedFolders: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (val: boolean) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string | null;
  handleSave: () => void;
  handleAddNewChoice: (type: 'window' | 'folder') => void;
  handleDeleteWindow: (id: string) => void;
  handleToggleVisibility: (id: string, e: React.MouseEvent) => void;
  updateSelectedField: (field: string, value: any) => void;
  updateBlocks: (newBlocks: Block[]) => void;
  handleAddBlock: () => void;
  newBlockType: string;
  setNewBlockType: (val: string) => void;
  confirmDeleteId: string | null;
  setConfirmDeleteId: (id: string | null) => void;
  handleDropAction: (target: any, dragId: string) => void;
  handleReorderInGroup: (
    dragId: string,
    targetId: string,
    position: 'above' | 'below',
    groupId: string
  ) => void;
}

export const MobileSystemSettingsAppView: React.FC<MobileSystemSettingsAppViewProps> = ({
  windowsList,
  setWindowsList,
  dockOrder,
  setDockOrder,
  desktopOrder,
  setDesktopOrder,
  site,
  setSite,
  selectedId,
  setSelectedId,
  collapsedGroups,
  setCollapsedGroups,
  collapsedFolders,
  setCollapsedFolders,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  saveStatus,
  saveError,
  handleSave,
  handleAddNewChoice,
  handleDeleteWindow,
  handleToggleVisibility,
  updateSelectedField,
  updateBlocks,
  handleAddBlock,
  newBlockType,
  setNewBlockType,
  confirmDeleteId,
  setConfirmDeleteId,
  handleDropAction,
  handleReorderInGroup,
}) => {
  // Mobile View Branch: 'list' or 'editor'
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');
  const [showNewMenu, setShowNewMenu] = useState(false);

  // Touch Drag State
  const [activeTouchDrag, setActiveTouchDrag] = useState<{
    entry: WindowData;
    groupId: string;
    isFolder: boolean;
    startY: number;
    currentY: number;
    currentX: number;
  } | null>(null);

  const [dropTargetState, setDropTargetState] = useState<{
    type: 'folder_nest' | 'reorder' | 'group_root' | 'trash';
    targetId?: string;
    groupId?: string;
    position?: 'above' | 'below';
  } | null>(null);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const touchLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter out system_settings
  const visibleWindowsList = useMemo(() => {
    return windowsList.filter((w) => w.id !== 'system_settings');
  }, [windowsList]);

  const selectedEntry = useMemo(() => {
    return windowsList.find((w) => w.id === selectedId) || null;
  }, [windowsList, selectedId]);

  // Helper getters for groups
  const getOrderedDockEntries = (): WindowData[] => {
    const dockWindows = visibleWindowsList.filter(
      (w) => (w.dockBreakpoints?.length ?? 0) > 0 && !w.trashed
    );
    const map = new Map<string, WindowData>(dockWindows.map((w) => [w.id, w]));
    const result: WindowData[] = [];
    for (const id of dockOrder) {
      if (map.has(id)) {
        result.push(map.get(id)!);
        map.delete(id);
      }
    }
    for (const w of map.values()) {
      result.push(w);
    }
    return result;
  };

  const getOrderedDesktopEntries = (): WindowData[] => {
    const desktopWindows = visibleWindowsList.filter((w) => w.folder === 'desktop' && !w.trashed);
    const map = new Map<string, WindowData>(desktopWindows.map((w) => [w.id, w]));
    const result: WindowData[] = [];
    for (const id of desktopOrder) {
      if (map.has(id)) {
        result.push(map.get(id)!);
        map.delete(id);
      }
    }
    for (const w of map.values()) {
      result.push(w);
    }
    return result;
  };

  const getOrderedProjectsEntries = (): WindowData[] => {
    return visibleWindowsList
      .filter((w) => w.content?.type === 'blocks' && !w.trashed)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  };

  const getOrderedSystemEntries = (): WindowData[] => {
    return visibleWindowsList.filter(
      (w) =>
        (!w.dockBreakpoints || w.dockBreakpoints.length === 0) &&
        w.folder === null &&
        w.content?.type !== 'blocks' &&
        !w.trashed
    );
  };

  const trashedEntries = visibleWindowsList.filter((w) => w.trashed === true);

  const folderOptions = visibleWindowsList.filter(
    (w) => (w.variant === 'folder' || w.content === null) && w.id !== selectedId
  );

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const toggleFolderCollapse = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const handleSelectEntryMobile = (id: string) => {
    setSelectedId(id);
    setMobileView('editor');
  };

  // Touch Drag Logic
  const handleTouchStartHandle = (
    e: React.TouchEvent,
    entry: WindowData,
    groupId: string,
    isFolder: boolean
  ) => {
    const touch = e.touches[0];
    setActiveTouchDrag({
      entry,
      groupId,
      isFolder,
      startY: touch.clientY,
      currentY: touch.clientY,
      currentX: touch.clientX,
    });
  };

  const handleTouchStartRow = (
    e: React.TouchEvent,
    entry: WindowData,
    groupId: string,
    isFolder: boolean
  ) => {
    const touch = e.touches[0];
    if (touchLongPressTimerRef.current) clearTimeout(touchLongPressTimerRef.current);

    touchLongPressTimerRef.current = setTimeout(() => {
      setActiveTouchDrag({
        entry,
        groupId,
        isFolder,
        startY: touch.clientY,
        currentY: touch.clientY,
        currentX: touch.clientX,
      });
      if (navigator.vibrate) navigator.vibrate(40);
    }, 280);
  };

  const handleTouchMoveRow = (e: React.TouchEvent) => {
    if (!activeTouchDrag) {
      // Cancel long press if finger moved significantly
      if (touchLongPressTimerRef.current) {
        clearTimeout(touchLongPressTimerRef.current);
        touchLongPressTimerRef.current = null;
      }
      return;
    }

    e.preventDefault();
    const touch = e.touches[0];
    setActiveTouchDrag((prev) =>
      prev ? { ...prev, currentY: touch.clientY, currentX: touch.clientX } : null
    );

    // Auto scroll list container if near top/bottom
    if (listContainerRef.current) {
      const rect = listContainerRef.current.getBoundingClientRect();
      const topDist = touch.clientY - rect.top;
      const bottomDist = rect.bottom - touch.clientY;

      if (topDist < 60) {
        listContainerRef.current.scrollTop -= 10;
      } else if (bottomDist < 60) {
        listContainerRef.current.scrollTop += 10;
      }
    }

    // Find element under touch point
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) {
      setDropTargetState(null);
      return;
    }

    const rowEl = el.closest('[data-row-id]') as HTMLElement | null;
    const groupEl = el.closest('[data-group-id]') as HTMLElement | null;
    const trashEl = el.closest('[data-trash-area]') as HTMLElement | null;

    if (trashEl) {
      setDropTargetState({ type: 'trash' });
      return;
    }

    if (rowEl) {
      const targetId = rowEl.getAttribute('data-row-id') || '';
      const targetGroupId = rowEl.getAttribute('data-row-group') || '';
      const isTargetFolder = rowEl.getAttribute('data-is-folder') === 'true';

      if (targetId === activeTouchDrag.entry.id) {
        setDropTargetState(null);
        return;
      }

      const rect = rowEl.getBoundingClientRect();
      const offsetY = touch.clientY - rect.top;
      const height = rect.height;

      if (isTargetFolder) {
        if (offsetY < height * 0.25) {
          setDropTargetState({
            type: 'reorder',
            groupId: targetGroupId,
            targetId,
            position: 'above',
          });
        } else if (offsetY > height * 0.75) {
          setDropTargetState({
            type: 'reorder',
            groupId: targetGroupId,
            targetId,
            position: 'below',
          });
        } else {
          setDropTargetState({
            type: 'folder_nest',
            groupId: targetGroupId,
            targetId,
          });
        }
      } else {
        if (offsetY < height * 0.5) {
          setDropTargetState({
            type: 'reorder',
            groupId: targetGroupId,
            targetId,
            position: 'above',
          });
        } else {
          setDropTargetState({
            type: 'reorder',
            groupId: targetGroupId,
            targetId,
            position: 'below',
          });
        }
      }
      return;
    }

    if (groupEl) {
      const gId = groupEl.getAttribute('data-group-id') || '';
      setDropTargetState({ type: 'group_root', groupId: gId });
      return;
    }

    setDropTargetState(null);
  };

  const handleTouchEndRow = () => {
    if (touchLongPressTimerRef.current) {
      clearTimeout(touchLongPressTimerRef.current);
      touchLongPressTimerRef.current = null;
    }

    if (!activeTouchDrag) return;

    if (dropTargetState?.type === 'trash') {
      handleDropAction({ type: 'trash' }, activeTouchDrag.entry.id);
    } else if (dropTargetState?.type === 'folder_nest' && dropTargetState.targetId) {
      handleDropAction({ type: 'folder', id: dropTargetState.targetId }, activeTouchDrag.entry.id);
    } else if (dropTargetState?.type === 'reorder' && dropTargetState.targetId && dropTargetState.groupId) {
      handleReorderInGroup(
        activeTouchDrag.entry.id,
        dropTargetState.targetId,
        dropTargetState.position || 'above',
        dropTargetState.groupId
      );
    } else if (dropTargetState?.type === 'group_root' && dropTargetState.groupId) {
      handleDropAction({ type: 'group_root', groupId: dropTargetState.groupId }, activeTouchDrag.entry.id);
    }

    setActiveTouchDrag(null);
    setDropTargetState(null);
  };

  // Render a row item in the list
  const renderItemRowMobile = (entry: WindowData, groupId: string, depth = 0) => {
    const isFolder = entry.variant === 'folder' || entry.content === null;
    const isCollapsed = collapsedFolders[entry.id];
    const childWindows = visibleWindowsList.filter(
      (w) => w.folder === entry.id && !w.trashed && w.id !== entry.id
    );

    const isSelected = selectedId === entry.id;
    const isBeingDragged = activeTouchDrag?.entry.id === entry.id;

    const isAboveTarget =
      dropTargetState?.type === 'reorder' &&
      dropTargetState.groupId === groupId &&
      dropTargetState.targetId === entry.id &&
      dropTargetState.position === 'above';

    const isBelowTarget =
      dropTargetState?.type === 'reorder' &&
      dropTargetState.groupId === groupId &&
      dropTargetState.targetId === entry.id &&
      dropTargetState.position === 'below';

    const isFolderNestTarget =
      dropTargetState?.type === 'folder_nest' &&
      dropTargetState.targetId === entry.id;

    return (
      <div key={entry.id} className="relative select-none">
        {/* Insertion Line Above */}
        {isAboveTarget && (
          <div className="h-1 bg-blue-500 rounded-full my-0.5 mx-2 shadow-sm animate-pulse" />
        )}

        {/* Row Container */}
        <div
          data-row-id={entry.id}
          data-row-group={groupId}
          data-is-folder={isFolder}
          onClick={() => handleSelectEntryMobile(entry.id)}
          onTouchStart={(e) => handleTouchStartRow(e, entry, groupId, isFolder)}
          onTouchMove={handleTouchMoveRow}
          onTouchEnd={handleTouchEndRow}
          className={`group flex items-center justify-between px-3.5 py-3 rounded-xl border transition-all min-h-[52px] cursor-pointer ${
            isBeingDragged
              ? 'opacity-40 border-blue-500/50 bg-blue-500/10'
              : isFolderNestTarget
              ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500/50'
              : isSelected && mobileView === 'editor'
              ? 'bg-blue-600/20 border-blue-500/60 text-white'
              : 'bg-[#1e1e24] border-white/10 hover:bg-white/10 text-white/90'
          }`}
          style={{ marginLeft: `${depth * 16}px` }}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Folder Expand/Collapse Chevron */}
            {isFolder ? (
              <button
                type="button"
                onClick={(e) => toggleFolderCollapse(entry.id, e)}
                className="p-1 rounded text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-6 flex justify-center">
                {entry.content?.type === 'blocks' ? (
                  <Layers className="w-4 h-4 text-purple-400" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-400" />
                )}
              </div>
            )}

            {/* Icon */}
            <div className="w-8 h-8 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={entry.icon}
                alt={entry.title}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* Title & Slug */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate leading-snug">
                {entry.title}
              </div>
              <div className="text-[11px] font-mono text-white/40 truncate">
                {entry.id}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {/* Visibility Eye Toggle */}
            <button
              type="button"
              onClick={(e) => handleToggleVisibility(entry.id, e)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                entry.visible
                  ? 'text-blue-400 hover:bg-blue-500/20'
                  : 'text-white/30 hover:bg-white/10'
              }`}
              title={entry.visible ? 'Visible' : 'Hidden'}
            >
              {entry.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDeleteId(entry.id);
              }}
              className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
              title="Delete Entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Drag Handle */}
            <div
              onTouchStart={(e) => handleTouchStartHandle(e, entry, groupId, isFolder)}
              className="p-2 text-white/30 hover:text-white cursor-grab active:cursor-grabbing touch-none"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Insertion Line Below */}
        {isBelowTarget && (
          <div className="h-1 bg-blue-500 rounded-full my-0.5 mx-2 shadow-sm animate-pulse" />
        )}

        {/* Folder Children Nested */}
        {isFolder && !isCollapsed && childWindows.length > 0 && (
          <div className="mt-1 space-y-1">
            {childWindows.map((child) => renderItemRowMobile(child, groupId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render a Group Section
  const renderGroupSectionMobile = (
    groupKey: string,
    title: string,
    entries: WindowData[],
    icon?: React.ReactNode
  ) => {
    const isCollapsed = collapsedGroups[groupKey];
    const isGroupRootTarget =
      dropTargetState?.type === 'group_root' && dropTargetState.groupId === groupKey;

    return (
      <div
        key={groupKey}
        data-group-id={groupKey}
        className={`bg-[#18181c] border rounded-2xl p-3.5 space-y-2.5 transition-all ${
          isGroupRootTarget
            ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/40'
            : 'border-white/10'
        }`}
      >
        {/* Group Header */}
        <div
          onClick={() => toggleGroupCollapse(groupKey)}
          className="flex items-center justify-between py-1 px-1 cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            {icon || <Folder className="w-4 h-4 text-blue-400" />}
            <span className="text-xs font-bold tracking-wider uppercase text-white/80">
              {title}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/60">
              {entries.length}
            </span>
          </div>

          <button
            type="button"
            className="p-1 rounded text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Group Content */}
        {!isCollapsed && (
          <div className="space-y-1.5 pt-1">
            {entries.length === 0 ? (
              <div className="text-xs text-white/30 italic py-3 px-3 text-center bg-black/20 rounded-xl border border-dashed border-white/10">
                No entries in {title.toLowerCase()}
              </div>
            ) : (
              entries.map((entry) => renderItemRowMobile(entry, groupKey))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#121214] text-white/90 flex flex-col overflow-hidden select-none">
      {/* FIXED HEADER (Always visible & reachable) */}
      <header className="sticky top-0 z-30 bg-[#1a1a1e] border-b border-white/10 px-4 py-3 flex items-center justify-between shadow-lg shrink-0 min-h-[56px]">
        {/* Left Control */}
        <div className="flex items-center gap-2 min-w-[80px]">
          {mobileView === 'editor' ? (
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 active:opacity-70 transition-colors py-1 px-2 rounded-lg bg-blue-500/10 border border-blue-500/20 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-blue-400">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">Admin</span>
            </div>
          )}
        </div>

        {/* Center Title */}
        <div className="text-center min-w-0 flex-1 px-2">
          <h1 className="text-sm font-bold text-white truncate">
            {mobileView === 'editor'
              ? selectedId === 'site_appearance'
                ? 'Appearance Settings'
                : selectedEntry?.title || 'Edit Entry'
              : 'System Settings'}
          </h1>
          <p className="text-[10px] text-white/50 truncate">
            {mobileView === 'editor' ? selectedId || '' : 'Master Directory'}
          </p>
        </div>

        {/* Right Control: Save Button */}
        <div className="flex items-center justify-end min-w-[80px]">
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saveStatus === 'saving'}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
              saveStatus === 'saved'
                ? 'bg-emerald-600 text-white'
                : hasUnsavedChanges
                ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white animate-pulse'
                : 'bg-white/10 text-white/30 cursor-not-allowed shadow-none'
            }`}
          >
            {saveStatus === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saveStatus === 'saved' && <Check className="w-3.5 h-3.5" />}
            <span>
              {saveStatus === 'saving'
                ? 'Saving...'
                : saveStatus === 'saved'
                ? 'Saved!'
                : 'Save'}
            </span>
          </button>
        </div>
      </header>

      {/* BODY CONTENT AREA */}
      <div
        ref={listContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 touch-pan-y"
        style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* DELETE CONFIRMATION DIALOG / BANNER */}
        {confirmDeleteId && (
          <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-2xl space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <Trash2 className="w-5 h-5" />
              <span>Confirm Deletion</span>
            </div>
            <p className="text-xs text-white/80">
              Are you sure you want to delete &quot;
              {windowsList.find((w) => w.id === confirmDeleteId)?.title}&quot;? This action will remove the entry from System Settings.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleDeleteWindow(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Delete Entry
              </button>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* LIST VIEW BRANCH */}
        {mobileView === 'list' && (
          <div className="space-y-4 pb-12">
            {/* Action Bar: Create New */}
            <div className="flex items-center justify-between bg-[#1a1a1e] border border-white/10 rounded-2xl p-3 shadow-md">
              <div className="text-xs font-medium text-white/70">
                Directory Items
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNewMenu((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Entry</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showNewMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#25252c] border border-white/15 rounded-xl shadow-2xl z-40 overflow-hidden py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewMenu(false);
                        handleAddNewChoice('window');
                        setMobileView('editor');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs text-white hover:bg-blue-600/30 flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>New Window</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewMenu(false);
                        handleAddNewChoice('folder');
                        setMobileView('editor');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs text-white hover:bg-blue-600/30 flex items-center gap-2 cursor-pointer border-t border-white/10"
                    >
                      <Folder className="w-4 h-4 text-amber-400" />
                      <span>New Folder</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SITE APPEARANCE ENTRY */}
            <div
              onClick={() => handleSelectEntryMobile('site_appearance')}
              className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                selectedId === 'site_appearance'
                  ? 'bg-purple-600/20 border-purple-500/60 text-white'
                  : 'bg-[#18181c] border-white/10 hover:bg-white/10 text-white/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Appearance Settings</div>
                  <div className="text-[11px] text-white/40 font-mono">Global Wallpaper & Title</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/40" />
            </div>

            {/* GROUPS LIST */}
            {renderGroupSectionMobile(
              'DOCK',
              'Dock Items',
              getOrderedDockEntries(),
              <Layers className="w-4 h-4 text-blue-400" />
            )}

            {renderGroupSectionMobile(
              'DESKTOP',
              'Desktop Items',
              getOrderedDesktopEntries(),
              <Folder className="w-4 h-4 text-amber-400" />
            )}

            {renderGroupSectionMobile(
              'PROJECTS',
              'Projects (Blocks)',
              getOrderedProjectsEntries(),
              <Sparkles className="w-4 h-4 text-purple-400" />
            )}

            {renderGroupSectionMobile(
              'SYSTEM',
              'System Items',
              getOrderedSystemEntries(),
              <Shield className="w-4 h-4 text-emerald-400" />
            )}

            {/* TRASH GROUP */}
            <div data-trash-area="true">
              {renderGroupSectionMobile(
                'TRASH',
                'Trash Subgroup',
                trashedEntries,
                <Trash2 className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
        )}

        {/* EDITOR VIEW BRANCH */}
        {mobileView === 'editor' && (
          <div className="space-y-5 pb-12">
            {selectedId === 'site_appearance' ? (
              <div className="space-y-5">
                {site.wallpaperTestMode && (
                  <div className="bg-red-600/90 text-white font-bold p-3.5 rounded-2xl flex items-center justify-center gap-2 text-xs tracking-wider uppercase shadow-lg border border-red-500">
                    <AlertCircle className="w-4 h-4 shrink-0 text-white" />
                    <span>WALLPAPER TEST MODE IS LIVE FOR ALL VISITORS</span>
                  </div>
                )}

                <div className="bg-[#18181c] border border-white/10 rounded-2xl p-4 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Global System Appearance
                  </h3>

                  <CloudinaryUploadField
                    label="Wallpaper Image URL / File Upload"
                    value={site.wallpaper}
                    onChange={(url) => {
                      setSite((prev) => ({ ...prev, wallpaper: url }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Paste wallpaper URL or drag file..."
                    accept="image/*"
                    resourceType="image"
                  />

                  <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                    <label className="block text-white/70 font-semibold">
                      Menu Bar Title
                    </label>
                    <input
                      type="text"
                      value={site.menuBarTitle}
                      onChange={(e) => {
                        setSite((prev) => ({ ...prev, menuBarTitle: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Brooks"
                      className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  {/* Wallpaper System Section */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Wallpaper
                    </h4>

                    {/* Mode Toggle */}
                    <div className="space-y-1.5 text-xs">
                      <label className="block text-white/70 font-semibold">Mode</label>
                      <div className="inline-flex rounded-xl bg-black/40 p-1 border border-white/15">
                        <button
                          type="button"
                          onClick={() => {
                            setSite((prev) => ({ ...prev, wallpaperMode: 'static' }));
                            setHasUnsavedChanges(true);
                          }}
                          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                            (site.wallpaperMode || 'static') === 'static'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          Static
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSite((prev) => ({ ...prev, wallpaperMode: 'dynamic' }));
                            setHasUnsavedChanges(true);
                          }}
                          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                            site.wallpaperMode === 'dynamic'
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          Dynamic
                        </button>
                      </div>
                    </div>

                    {/* Override Field */}
                    <div className="space-y-1.5 text-xs pt-2">
                      <label className="block text-white/70 font-semibold">Override</label>
                      <select
                        value={site.wallpaperOverride || ''}
                        onChange={(e) => {
                          setSite((prev) => ({ ...prev, wallpaperOverride: e.target.value }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 font-medium"
                      >
                        <option value="">Live</option>
                        {(site.wallpaperFrames || DEFAULT_WALLPAPER_FRAMES).map((frame) => (
                          <option key={frame.id} value={frame.id}>
                            {frame.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Test Mode Toggle & Interval */}
                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={!!site.wallpaperTestMode}
                          onChange={(e) => {
                            setSite((prev) => ({ ...prev, wallpaperTestMode: e.target.checked }));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-4 h-4 rounded bg-black/40 border-white/20 text-red-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-white/90 font-medium">Test mode</span>
                      </label>

                      <div className="space-y-1 text-xs pl-6">
                        <label className="block text-white/70 font-semibold mb-1">Seconds per frame</label>
                        <input
                          type="number"
                          step="0.25"
                          min="0.25"
                          value={site.wallpaperTestInterval ?? 1}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            const intervalVal = isNaN(val) ? 1 : Math.max(0.25, val);
                            setSite((prev) => ({ ...prev, wallpaperTestInterval: intervalVal }));
                            setHasUnsavedChanges(true);
                          }}
                          className="w-32 px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Dynamic Frames Vertical List */}
                    {site.wallpaperMode === 'dynamic' && (
                      <div className="space-y-4 pt-4 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-semibold uppercase tracking-wider text-white/70">
                            Wallpaper Frames
                          </h5>
                          <span className="text-[10px] text-white/40 italic">Fixed set (12)</span>
                        </div>

                        <div className="space-y-3">
                          {(site.wallpaperFrames || DEFAULT_WALLPAPER_FRAMES).map((frame) => (
                            <div
                              key={frame.id}
                              className="p-3 bg-black/30 border border-white/10 rounded-xl space-y-2"
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-white">{frame.label}</span>
                                <span className="font-mono text-[11px] text-white/50 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                                  {frame.elevation}° • phase: {frame.phase}
                                </span>
                              </div>

                              <CloudinaryUploadField
                                label="Frame Image URL / Upload"
                                value={frame.url}
                                onChange={(newUrl) => {
                                  setSite((prev) => ({
                                    ...prev,
                                    wallpaperFrames: (prev.wallpaperFrames || DEFAULT_WALLPAPER_FRAMES).map((f) =>
                                      f.id === frame.id ? { ...f, url: newUrl } : f
                                    ),
                                  }));
                                  setHasUnsavedChanges(true);
                                }}
                                placeholder="Paste frame image URL or drag file..."
                                accept="image/*"
                                resourceType="image"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : selectedEntry ? (
              <div className="space-y-5">
                {/* Header Actions */}
                <div className="flex items-center justify-between bg-[#18181c] border border-white/10 rounded-2xl p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                      <img
                        src={selectedEntry.icon}
                        alt={selectedEntry.title}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{selectedEntry.title}</div>
                      <div className="text-[11px] font-mono text-white/40">{selectedEntry.id}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(selectedEntry.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                {/* Form Parameters */}
                <div className="bg-[#18181c] border border-white/10 rounded-2xl p-4 space-y-4 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                    Window Parameters
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-white/70 mb-1 font-medium">Title</label>
                      <input
                        type="text"
                        value={selectedEntry.title}
                        onChange={(e) => updateSelectedField('title', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 mb-1 font-medium">ID (Slug)</label>
                      <input
                        type="text"
                        value={selectedEntry.id}
                        onChange={(e) => updateSelectedField('id', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 mb-1 font-medium">
                        Folder (Nesting Destination)
                      </label>
                      <select
                        value={selectedEntry.folder || ''}
                        onChange={(e) => updateSelectedField('folder', e.target.value || null)}
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="">None (Root Desktop)</option>
                        {folderOptions.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.title} ({f.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/70 mb-1 font-medium">Variant</label>
                      <select
                        value={selectedEntry.variant || ''}
                        onChange={(e) => updateSelectedField('variant', e.target.value || null)}
                        className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Default Window</option>
                        <option value="folder">Folder Window</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/70 mb-1 font-medium">Width (px)</label>
                        <input
                          type="number"
                          value={selectedEntry.width ?? ''}
                          onChange={(e) =>
                            updateSelectedField(
                              'width',
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          placeholder="Auto"
                          className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-white/70 mb-1 font-medium">Height (px)</label>
                        <input
                          type="number"
                          value={selectedEntry.height ?? ''}
                          onChange={(e) =>
                            updateSelectedField(
                              'height',
                              e.target.value ? parseInt(e.target.value) : null
                            )
                          }
                          placeholder="Auto"
                          className="w-full px-3.5 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Icon Upload Field */}
                  <CloudinaryUploadField
                    label="Icon Image URL / File Upload"
                    value={selectedEntry.icon || ''}
                    onChange={(url) => updateSelectedField('icon', url)}
                    placeholder="Paste image URL or drag file..."
                    accept="image/*"
                    resourceType="image"
                  />

                  {/* Dock Breakpoints 3-Segment Toggle */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-white/10">
                    <span className="text-xs text-white/70 font-semibold">Show in Dock</span>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/40 border border-white/15 rounded-xl">
                      {(['desktop', 'tablet', 'mobile'] as const).map((bp) => {
                        const bps: string[] = selectedEntry.dockBreakpoints || [];
                        const isActive = bps.includes(bp);
                        const label = bp.charAt(0).toUpperCase() + bp.slice(1);
                        return (
                          <button
                            key={bp}
                            type="button"
                            onClick={() => {
                              const newBps = isActive
                                ? bps.filter((b) => b !== bp)
                                : [...bps, bp];
                              updateSelectedField('dockBreakpoints', newBps);
                              if (newBps.length > 0 && !dockOrder.includes(selectedEntry.id)) {
                                setDockOrder((prev) => [...prev, selectedEntry.id]);
                              }
                            }}
                            className={`py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-white/50 hover:text-white'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={!!selectedEntry.showInSidebar}
                        onChange={(e) => updateSelectedField('showInSidebar', e.target.checked)}
                        className="w-4 h-4 rounded bg-black/40 border-white/20 text-blue-600 focus:ring-0"
                      />
                      <span className="text-white/80 font-medium text-xs">Show in Sidebar</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={selectedEntry.isFullScreen}
                        onChange={(e) => updateSelectedField('isFullScreen', e.target.checked)}
                        className="w-4 h-4 rounded bg-black/40 border-white/20 text-blue-600 focus:ring-0"
                      />
                      <span className="text-white/80 font-medium text-xs">Fullscreen Window</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={!!selectedEntry.trashed}
                        onChange={(e) => updateSelectedField('trashed', e.target.checked)}
                        className="w-4 h-4 rounded bg-black/40 border-white/20 text-red-600 focus:ring-0"
                      />
                      <span
                        className={
                          selectedEntry.trashed
                            ? 'text-red-400 font-bold text-xs'
                            : 'text-white/80 font-medium text-xs'
                        }
                      >
                        Trashed
                      </span>
                    </label>
                  </div>
                </div>

                {/* Content Configuration for Non-Folders */}
                {selectedEntry.variant !== 'folder' && selectedEntry.content !== null && (
                  <div className="bg-[#18181c] border border-white/10 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                        Content Configuration
                      </h3>

                      {selectedEntry.content?.type === 'blocks' && (
                        <div className="flex items-center gap-2">
                          <select
                            value={newBlockType}
                            onChange={(e) => setNewBlockType(e.target.value)}
                            className="px-2 py-1.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white"
                          >
                            <option value="text">Text Block</option>
                            <option value="image">Image Block</option>
                            <option value="imagePair">Image Pair Block</option>
                            <option value="video">Video Block</option>
                            <option value="caption">Caption Block</option>
                            <option value="spacer">Spacer Block</option>
                            <option value="meta">Meta Table Block</option>
                          </select>
                          <button
                            type="button"
                            onClick={handleAddBlock}
                            className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Component Type View */}
                    {selectedEntry.content?.type === 'component' && (
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-amber-400 font-bold">
                          <FileText className="w-4 h-4" />
                          <span>Custom Component View</span>
                        </div>
                        <p className="text-white/60">
                          Name:{' '}
                          <span className="font-mono text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
                            {selectedEntry.content.name || 'Unspecified'}
                          </span>
                        </p>
                      </div>
                    )}

                    {/* Blocks Type Editor */}
                    {selectedEntry.content?.type === 'blocks' && (
                      <div className="space-y-3">
                        {(!selectedEntry.content.blocks ||
                          selectedEntry.content.blocks.length === 0) ? (
                          <div className="text-xs text-white/30 italic py-4 text-center bg-black/20 rounded-xl border border-dashed border-white/10">
                            No content blocks added yet. Use &quot;Add Block&quot; above.
                          </div>
                        ) : (
                          selectedEntry.content.blocks.map((block: Block, index: number) => (
                            <div
                              key={index}
                              className="p-3 bg-black/30 border border-white/10 rounded-xl space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <span className="font-bold text-blue-400 uppercase tracking-wide">
                                  Block {index + 1}: {block.type}
                                </span>

                                <div className="flex items-center gap-1">
                                  {/* Move Up */}
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => {
                                      const newBlocks = [...(selectedEntry.content?.blocks || [])];
                                      const temp = newBlocks[index - 1];
                                      newBlocks[index - 1] = newBlocks[index];
                                      newBlocks[index] = temp;
                                      updateBlocks(newBlocks);
                                    }}
                                    className="p-1 rounded text-white/50 hover:text-white disabled:opacity-20 cursor-pointer"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Move Down */}
                                  <button
                                    type="button"
                                    disabled={
                                      index ===
                                      (selectedEntry.content?.blocks?.length || 1) - 1
                                    }
                                    onClick={() => {
                                      const newBlocks = [...(selectedEntry.content?.blocks || [])];
                                      const temp = newBlocks[index + 1];
                                      newBlocks[index + 1] = newBlocks[index];
                                      newBlocks[index] = temp;
                                      updateBlocks(newBlocks);
                                    }}
                                    className="p-1 rounded text-white/50 hover:text-white disabled:opacity-20 cursor-pointer"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Remove Block */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newBlocks = (
                                        selectedEntry.content?.blocks || []
                                      ).filter((_, i) => i !== index);
                                      updateBlocks(newBlocks);
                                    }}
                                    className="p-1 rounded text-red-400 hover:bg-red-500/20 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Text Block Fields */}
                              {block.type === 'text' && (
                                <div>
                                  <label className="block text-white/50 mb-1">Text Content</label>
                                  <textarea
                                    value={block.value || ''}
                                    onChange={(e) => {
                                      const newBlocks = [...(selectedEntry.content?.blocks || [])];
                                      newBlocks[index] = { ...newBlocks[index], value: e.target.value };
                                      updateBlocks(newBlocks);
                                    }}
                                    rows={3}
                                    className="w-full p-2 bg-black/40 border border-white/15 rounded-lg text-white"
                                  />
                                </div>
                              )}

                              {/* Image Block Fields */}
                              {block.type === 'image' && (
                                <CloudinaryUploadField
                                  label="Image URL / Upload"
                                  value={block.url || ''}
                                  onChange={(url) => {
                                    const newBlocks = [...(selectedEntry.content?.blocks || [])];
                                    newBlocks[index] = { ...newBlocks[index], url };
                                    updateBlocks(newBlocks);
                                  }}
                                  placeholder="Paste image URL..."
                                  accept="image/*"
                                  resourceType="image"
                                />
                              )}

                              {/* Image Pair Block Fields */}
                              {block.type === 'imagePair' && (
                                <div className="space-y-2">
                                  <CloudinaryUploadField
                                    label="First Image URL / Upload"
                                    value={block.url1 || ''}
                                    onChange={(url) => {
                                      const newBlocks = [...(selectedEntry.content?.blocks || [])];
                                      newBlocks[index] = { ...newBlocks[index], url1: url };
                                      updateBlocks(newBlocks);
                                    }}
                                    placeholder="First image URL..."
                                    accept="image/*"
                                    resourceType="image"
                                  />
                                  <CloudinaryUploadField
                                    label="Second Image URL / Upload"
                                    value={block.url2 || ''}
                                    onChange={(url) => {
                                      const newBlocks = [...(selectedEntry.content?.blocks || [])];
                                      newBlocks[index] = { ...newBlocks[index], url2: url };
                                      updateBlocks(newBlocks);
                                    }}
                                    placeholder="Second image URL..."
                                    accept="image/*"
                                    resourceType="image"
                                  />
                                </div>
                              )}

                              {/* Video Block Fields */}
                              {block.type === 'video' && (
                                <CloudinaryUploadField
                                  label="Video URL / Upload"
                                  value={block.url || ''}
                                  onChange={(url) => {
                                    const newBlocks = [...(selectedEntry.content?.blocks || [])];
                                    newBlocks[index] = { ...newBlocks[index], url };
                                    updateBlocks(newBlocks);
                                  }}
                                  placeholder="Paste video URL..."
                                  accept="video/*"
                                  resourceType="video"
                                />
                              )}

                              {/* Caption Block Fields */}
                              {block.type === 'caption' && (
                                <div>
                                  <label className="block text-white/50 mb-1">Caption Text</label>
                                  <input
                                    type="text"
                                    value={block.value || ''}
                                    onChange={(e) => {
                                      const newBlocks = [...(selectedEntry.content?.blocks || [])];
                                      newBlocks[index] = { ...newBlocks[index], value: e.target.value };
                                      updateBlocks(newBlocks);
                                    }}
                                    className="w-full p-2 bg-black/40 border border-white/15 rounded-lg text-white"
                                  />
                                </div>
                              )}

                              {/* Spacer Block Fields */}
                              {block.type === 'spacer' && (
                                <div>
                                  <label className="block text-white/50 mb-1">Spacer Height (px)</label>
                                  <input
                                    type="number"
                                    value={block.height || 24}
                                    onChange={(e) => {
                                      const newBlocks = [...(selectedEntry.content?.blocks || [])];
                                      newBlocks[index] = {
                                        ...newBlocks[index],
                                        height: parseInt(e.target.value) || 24,
                                      };
                                      updateBlocks(newBlocks);
                                    }}
                                    className="w-full p-2 bg-black/40 border border-white/15 rounded-lg text-white"
                                  />
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-white/40 text-xs">
                Select an entry from the list to begin editing.
              </div>
            )}
          </div>
        )}
      </div>

      {/* FLOATING PREVIEW FOR TOUCH DRAG */}
      {activeTouchDrag && (
        <div
          className="fixed z-50 pointer-events-none px-4 py-2.5 bg-[#25252c] border border-blue-500 text-white rounded-2xl shadow-2xl flex items-center gap-3 transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${activeTouchDrag.currentX}px`,
            top: `${activeTouchDrag.currentY}px`,
          }}
        >
          <GripVertical className="w-4 h-4 text-blue-400" />
          <div className="text-xs font-bold truncate max-w-[160px]">
            {activeTouchDrag.entry.title}
          </div>
        </div>
      )}
    </div>
  );
};

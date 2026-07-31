import React, { useState, useEffect, useRef } from 'react';
import windowsConfig from '../data/windows.json';
import {
  Lock, Eye, EyeOff, Trash2, Plus, ChevronDown,
  Folder, Layers, Shield, GripVertical, FileText, UploadCloud,
  Check, AlertCircle, Loader2, RefreshCw, MoveUpRight, RotateCcw
} from 'lucide-react';

interface Block {
  type: 'image' | 'imagePair' | 'video' | 'text' | 'caption' | 'spacer' | 'meta' | string;
  [key: string]: any;
}

interface WindowData {
  id: string;
  title: string;
  icon: string;
  folder: string | null;
  width: number | null;
  height: number | null;
  showOnDesktop: boolean;
  showInDock: boolean;
  trashed?: boolean;
  isFullScreen: boolean;
  variant: string | null;
  order: number;
  visible: boolean;
  content: {
    type: 'blocks' | 'component' | string;
    name?: string;
    text?: string;
    blocks?: Block[];
    props?: Record<string, any>;
  } | null;
  [key: string]: any;
}

interface CloudinaryUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  accept?: string;
  resourceType?: 'image' | 'video' | 'auto';
}

const CloudinaryUploadField: React.FC<CloudinaryUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Paste URL or drag file below...',
  accept = 'image/*,video/*',
  resourceType = 'auto',
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleUploadFile = (file: File) => {
    if (!cloudName || !uploadPreset) {
      setUploadError(
        'Cloudinary credentials missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env'
      );
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setUploadError(null);

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            onChange(response.secure_url);
            setUploadError(null);
          } else {
            setUploadError('Upload succeeded but no secure URL returned');
          }
        } catch (e) {
          setUploadError('Invalid response from Cloudinary');
        }
      } else {
        let errText = 'Upload failed';
        try {
          const errJson = JSON.parse(xhr.responseText);
          errText = errJson.error?.message || errText;
        } catch (e) {}
        setUploadError(`Upload failed (${xhr.status}): ${errText}`);
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      setUploadError('Network error during file upload');
    };

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`);
    xhr.send(formData);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  return (
    <div className="space-y-2 text-xs">
      <label className="block text-white/60">{label}</label>

      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-black/40 border border-white/15 rounded-md text-white font-mono text-xs focus:outline-none focus:border-blue-500"
        />
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border border-dashed rounded-lg p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
          isDraggingOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-white/15 hover:border-white/30 bg-black/20 hover:bg-black/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleUploadFile(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        {isUploading ? (
          <div className="w-full space-y-2 py-1">
            <div className="flex items-center justify-center gap-2 text-blue-400 font-medium text-xs">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading to Cloudinary ({progress}%)</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors">
            <UploadCloud className="w-4 h-4 text-blue-400" />
            <span className="text-[11px]">
              Drag & drop media file here, or <span className="text-blue-400 underline">browse</span>
            </span>
          </div>
        )}
      </div>

      {uploadError && (
        <div className="flex items-start gap-1.5 text-red-400 text-[11px] bg-red-500/10 border border-red-500/20 p-2 rounded">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
};

// Helper: check if parentId is an ancestor of childId
const isDescendant = (parentId: string, childId: string, list: WindowData[]): boolean => {
  let curr = list.find((w) => w.id === childId);
  while (curr && curr.folder) {
    if (curr.folder === parentId) return true;
    curr = list.find((w) => w.id === curr.folder);
  }
  return false;
};

// Helper: set trashed recursively on item and all its descendants
const setTrashedRecursive = (id: string, trashedValue: boolean, list: WindowData[]): WindowData[] => {
  const idsToChange = new Set<string>([id]);
  let addedNew = true;
  while (addedNew) {
    addedNew = false;
    for (const item of list) {
      if (item.folder && idsToChange.has(item.folder) && !idsToChange.has(item.id)) {
        idsToChange.add(item.id);
        addedNew = true;
      }
    }
  }
  return list.map((item) => {
    if (idsToChange.has(item.id)) {
      return { ...item, trashed: trashedValue };
    }
    return item;
  });
};

export const SystemSettingsAppView: React.FC = () => {
  // Password Authentication State
  const [passwordInput, setPasswordInput] = useState('');
  const [verifiedPassword, setVerifiedPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');

  // Desktop check state
  const [isDesktop, setIsDesktop] = useState(true);

  // Admin Data State (holds ALL windows including hidden system_settings)
  const [windowsList, setWindowsList] = useState<WindowData[]>(() => {
    return JSON.parse(JSON.stringify(windowsConfig.windows)) as WindowData[];
  });

  // Selected Window ID
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    const visible = windowsConfig.windows.filter((w) => w.id !== 'system_settings');
    return visible.length > 0 ? visible[0].id : null;
  });

  // Group collapse state
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    DOCK: false,
    DESKTOP: false,
    PROJECTS: false,
    SYSTEM: false,
    TRASH: false,
  });

  // Folder collapse state in sidebar
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  // New button popover state
  const [showNewMenu, setShowNewMenu] = useState(false);

  // Drag and drop state
  const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    type: 'folder' | 'trash' | 'group_root';
    id?: string;
    groupId?: string;
  } | null>(null);

  // New Block Type Selection State
  const [newBlockType, setNewBlockType] = useState<string>('text');

  // Confirmation state for deleting window
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Unsaved Changes Tracking State
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  // Unsaved Warning Switch Dialog State
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null);
  const [pendingCreateType, setPendingCreateType] = useState<'window' | 'folder' | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;
    setIsAuthenticating(true);
    setAuthError('');

    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passwordInput,
          verifyOnly: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setVerifiedPassword(passwordInput);
        setIsAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError(data.error || 'Incorrect password');
      }
    } catch (err: any) {
      setAuthError('Failed to connect to authentication server route');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges || saveStatus === 'saving') return;
    setSaveStatus('saving');
    setSaveError(null);

    const activeItem = windowsList.find((w) => w.id === selectedId);

    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: verifiedPassword,
          windowsData: windowsList,
          changedEntryTitle: activeItem?.title || 'System Settings',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus('saved');
        setHasUnsavedChanges(false);
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2500);
      } else {
        setSaveStatus('error');
        setSaveError(data.error || 'Failed to save changes');
      }
    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(err.message || 'Network error while saving changes');
    }
  };

  const requestSelectEntry = (id: string | null) => {
    if (hasUnsavedChanges) {
      setPendingSelectId(id);
      setPendingCreateType(null);
      setShowUnsavedWarning(true);
    } else {
      setSelectedId(id);
    }
  };

  const confirmSwitchEntry = () => {
    setShowUnsavedWarning(false);
    setHasUnsavedChanges(false);
    setSaveError(null);
    if (pendingCreateType) {
      createNewWindowInternal(pendingCreateType);
      setPendingCreateType(null);
    } else {
      setSelectedId(pendingSelectId);
    }
    setPendingSelectId(null);
  };

  const createNewWindowInternal = (type: 'window' | 'folder' = 'window') => {
    const newId =
      type === 'folder'
        ? `folder_${Date.now().toString().slice(-5)}`
        : `window_${Date.now().toString().slice(-5)}`;

    const newEntry: WindowData = {
      id: newId,
      title: type === 'folder' ? 'New Folder' : 'New Window',
      icon:
        type === 'folder'
          ? 'https://res.cloudinary.com/dezas8twg/image/upload/v1777921908/BrooksOS_0003_Folder_tptbpo.png'
          : 'https://res.cloudinary.com/dezas8twg/image/upload/v1777921910/BrooksOS_0006_Project_mjqqc4.png',
      folder: null,
      width: type === 'folder' ? 500 : 800,
      height: type === 'folder' ? 350 : 600,
      showOnDesktop: true,
      showInDock: false,
      isFullScreen: false,
      variant: type === 'folder' ? 'folder' : null,
      order: windowsList.length + 1,
      visible: true,
      trashed: false,
      content:
        type === 'folder'
          ? null
          : {
              type: 'blocks',
              blocks: [],
            },
    };

    setWindowsList((prev) => [...prev, newEntry]);
    setSelectedId(newId);
    setHasUnsavedChanges(true);
    setShowNewMenu(false);
  };

  const handleAddNewChoice = (type: 'window' | 'folder') => {
    if (hasUnsavedChanges) {
      setPendingCreateType(type);
      setShowUnsavedWarning(true);
    } else {
      createNewWindowInternal(type);
    }
  };

  const handleDeleteWindow = (id: string) => {
    const filtered = windowsList.filter((w) => w.id !== id);
    setWindowsList(filtered);
    const visibleRemaining = filtered.filter((w) => w.id !== 'system_settings');
    if (selectedId === id) {
      setSelectedId(visibleRemaining.length > 0 ? visibleRemaining[0].id : null);
    }
    setConfirmDeleteId(null);
    setHasUnsavedChanges(true);
  };

  const handleToggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWindowsList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
    setHasUnsavedChanges(true);
  };

  // Selected Entry Field Updates
  const updateSelectedField = (field: string, value: any) => {
    if (!selectedId) return;
    setWindowsList((prev) =>
      prev.map((w) => {
        if (w.id !== selectedId) return w;
        return { ...w, [field]: value };
      })
    );
    setHasUnsavedChanges(true);
  };

  // Selected Entry Content Block Updates
  const updateBlocks = (newBlocks: Block[]) => {
    if (!selectedId || !selectedEntry) return;
    setWindowsList((prev) =>
      prev.map((w) => {
        if (w.id !== selectedId) return w;
        return {
          ...w,
          content: {
            ...(w.content || { type: 'blocks' }),
            type: 'blocks',
            blocks: newBlocks,
          },
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const updateComponentText = (textValue: string) => {
    if (!selectedId || !selectedEntry || selectedEntry.content?.type !== 'component') return;
    setWindowsList((prev) =>
      prev.map((w) => {
        if (w.id !== selectedId) return w;
        return {
          ...w,
          content: {
            ...(w.content || { type: 'component' }),
            text: textValue,
          },
        };
      })
    );
    setHasUnsavedChanges(true);
  };

  const handleAddBlock = () => {
    if (!selectedEntry || selectedEntry.content?.type !== 'blocks') return;
    const currentBlocks = selectedEntry.content?.blocks || [];

    let defaultBlock: Block = { type: newBlockType };
    switch (newBlockType) {
      case 'image':
        defaultBlock = { type: 'image', src: '', alt: '', caption: '', width: 'full' };
        break;
      case 'imagePair':
        defaultBlock = { type: 'imagePair', srcA: '', captionA: '', srcB: '', captionB: '' };
        break;
      case 'video':
        defaultBlock = { type: 'video', src: '', poster: '', autoplay: false, loop: false };
        break;
      case 'text':
        defaultBlock = { type: 'text', heading: 'New Heading', body: 'Add your text here...' };
        break;
      case 'caption':
        defaultBlock = { type: 'caption', text: 'Caption text...' };
        break;
      case 'spacer':
        defaultBlock = { type: 'spacer', size: 'md' };
        break;
      case 'meta':
        defaultBlock = {
          type: 'meta',
          rows: [
            { label: 'Label 1', value: 'Value 1' },
            { label: 'Label 2', value: 'Value 2' },
          ],
        };
        break;
    }

    updateBlocks([...currentBlocks, defaultBlock]);
  };

  const handleDropAction = (target: { type: 'folder' | 'trash' | 'group_root'; id?: string }, dragId: string) => {
    if (!dragId) return;

    if (target.type === 'trash') {
      setWindowsList((prev) => setTrashedRecursive(dragId, true, prev));
      setHasUnsavedChanges(true);
      return;
    }

    if (target.type === 'folder' && target.id) {
      if (dragId === target.id || isDescendant(dragId, target.id, windowsList)) return;
      setWindowsList((prev) => {
        const unTrashed = setTrashedRecursive(dragId, false, prev);
        return unTrashed.map((w) => (w.id === dragId ? { ...w, folder: target.id } : w));
      });
      setHasUnsavedChanges(true);
      return;
    }

    if (target.type === 'group_root') {
      setWindowsList((prev) => {
        const unTrashed = setTrashedRecursive(dragId, false, prev);
        return unTrashed.map((w) => (w.id === dragId ? { ...w, folder: null } : w));
      });
      setHasUnsavedChanges(true);
      return;
    }
  };

  // Guard: Mobile / Tablet
  if (!isDesktop) {
    return (
      <div className="w-full h-full min-h-[400px] bg-[#141416] text-white/80 flex flex-col items-center justify-center p-6 text-center select-none">
        <Shield className="w-12 h-12 text-white/30 mb-4" />
        <h2 className="text-xl font-bold mb-2 text-white">System Settings</h2>
        <p className="text-sm text-white/50 max-w-sm">
          System Settings is available on desktop displays only. Please switch to desktop view to access admin controls.
        </p>
      </div>
    );
  }

  // Guard: Password Screen
  if (!isAuthenticated) {
    return (
      <div className="w-full h-full min-h-[500px] bg-[#121214] text-white/90 flex flex-col items-center justify-center p-6 select-none">
        <div className="w-full max-w-md bg-[#1e1e24] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center mb-5 text-white/80 shadow-inner">
            <Lock className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">System Settings</h1>
          <p className="text-xs text-white/50 mb-6">Enter admin password to modify system parameters</p>

          <form onSubmit={handlePasswordSubmit} className="w-full space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                autoFocus
              />
            </div>
            {authError && (
              <p className="text-xs text-red-400 font-medium text-center">{authError}</p>
            )}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-lg shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isAuthenticating && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isAuthenticating ? 'Verifying...' : 'Unlock Admin Portal'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  const visibleWindowsList = windowsList.filter((w) => w.id !== 'system_settings');
  const selectedEntry = windowsList.find((w) => w.id === selectedId) || null;

  // Derive groups from current windows list
  const dockEntries = visibleWindowsList.filter((w) => w.showInDock === true);
  const desktopEntries = visibleWindowsList.filter((w) => w.showOnDesktop === true);
  const projectsEntries = visibleWindowsList.filter((w) => w.content?.type === 'blocks');
  const systemEntries = visibleWindowsList.filter(
    (w) => !(w.showInDock || w.showOnDesktop || w.content?.type === 'blocks')
  );
  const trashedEntries = visibleWindowsList.filter((w) => w.trashed === true);

  const folderOptions = visibleWindowsList.filter(
    (w) => (w.variant === 'folder' || w.content === null) && w.id !== selectedId
  );

  const toggleGroupCollapse = (groupKey: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const renderItemRow = (
    entry: WindowData,
    groupId: string,
    entriesInGroup: WindowData[],
    depth: number = 0
  ) => {
    const isSelected = selectedId === entry.id;
    const isFolder = entry.variant === 'folder' || entry.content === null;
    const isTrashed = entry.trashed === true;
    const isCollapsed = collapsedFolders[entry.id];

    const childrenInGroup = entriesInGroup.filter((e) => e.folder === entry.id);
    const hasChildren = childrenInGroup.length > 0;
    const isTargetFolder = dropTarget?.type === 'folder' && dropTarget?.id === entry.id;

    return (
      <div key={`${groupId}-${entry.id}`} className="flex flex-col">
        <div
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            setDraggedEntryId(entry.id);
            e.dataTransfer.setData('text/plain', entry.id);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (
              isFolder &&
              draggedEntryId &&
              draggedEntryId !== entry.id &&
              !isDescendant(draggedEntryId, entry.id, windowsList)
            ) {
              setDropTarget({ type: 'folder', id: entry.id });
            }
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            if (dropTarget?.type === 'folder' && dropTarget?.id === entry.id) {
              setDropTarget(null);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (
              draggedEntryId &&
              isFolder &&
              draggedEntryId !== entry.id &&
              !isDescendant(draggedEntryId, entry.id, windowsList)
            ) {
              handleDropAction({ type: 'folder', id: entry.id }, draggedEntryId);
              setDraggedEntryId(null);
              setDropTarget(null);
            }
          }}
          onClick={() => requestSelectEntry(entry.id)}
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          className={`group relative flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-all border ${
            isTargetFolder
              ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500 text-white'
              : isSelected
              ? 'bg-blue-600/20 border-blue-500/40 text-white'
              : 'bg-white/5 hover:bg-white/10 border-transparent text-white/80'
          } ${isTrashed ? 'opacity-50 hover:opacity-80' : ''}`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {isFolder ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsedFolders((prev) => ({ ...prev, [entry.id]: !prev[entry.id] }));
                }}
                className="p-0.5 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors shrink-0"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                />
              </button>
            ) : (
              <span className="w-3.5 h-3.5 shrink-0" />
            )}

            <GripVertical className="w-3 h-3 text-white/30 group-hover:text-white/60 cursor-grab shrink-0" />

            {isFolder ? (
              <Folder className="w-4 h-4 text-amber-400 shrink-0" />
            ) : (
              <img
                src={entry.icon}
                alt=""
                className="w-4 h-4 object-contain rounded shrink-0 bg-black/20"
              />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium truncate">{entry.title}</span>
                {isTrashed && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-red-400 bg-red-500/10 px-1 py-0.2 rounded border border-red-500/20 shrink-0">
                    <Trash2 className="w-2.5 h-2.5" />
                    trashed
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono text-white/40 truncate">{entry.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0 ml-1">
            <button
              type="button"
              onClick={(e) => handleToggleVisibility(entry.id, e)}
              className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors cursor-pointer"
              title={entry.visible ? 'Hide Window' : 'Show Window'}
            >
              {entry.visible ? (
                <Eye className="w-3.5 h-3.5 text-blue-400" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-white/30" />
              )}
            </button>
          </div>
        </div>

        {isFolder && !isCollapsed && hasChildren && (
          <div className="space-y-1 mt-1">
            {childrenInGroup.map((child) =>
              renderItemRow(child, groupId, entriesInGroup, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderGroupSection = (
    groupKey: string,
    label: string,
    entries: WindowData[],
    isProjectsGroup: boolean = false
  ) => {
    const isGroupCollapsed = collapsedGroups[groupKey];
    const topLevelInGroup = entries.filter(
      (e) => !e.folder || !entries.some((other) => other.id === e.folder)
    );

    return (
      <div className="space-y-1">
        {/* Group Header */}
        <div
          onClick={() => toggleGroupCollapse(groupKey)}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDropTarget({ type: 'group_root', groupId: groupKey });
          }}
          onDragLeave={() => {
            if (dropTarget?.type === 'group_root' && dropTarget?.groupId === groupKey) {
              setDropTarget(null);
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (draggedEntryId) {
              handleDropAction({ type: 'group_root' }, draggedEntryId);
              setDraggedEntryId(null);
              setDropTarget(null);
            }
          }}
          className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-[11px] font-semibold tracking-wider uppercase transition-colors select-none ${
            dropTarget?.type === 'group_root' && dropTarget?.groupId === groupKey
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isGroupCollapsed ? '-rotate-90' : ''}`}
            />
            <span>
              {label} ({entries.length})
            </span>
          </div>
        </div>

        {/* Group Items */}
        {!isGroupCollapsed && (
          <div className="pl-1 space-y-1">
            {topLevelInGroup.length === 0 && !isProjectsGroup ? (
              <div className="px-2 py-1 text-[11px] text-white/30 italic">No entries</div>
            ) : (
              topLevelInGroup.map((entry) => renderItemRow(entry, groupKey, entries))
            )}

            {/* TRASH subgroup inside PROJECTS */}
            {isProjectsGroup && (
              <div className="mt-3 pt-2 border-t border-white/10 space-y-1">
                <div
                  onClick={() => toggleGroupCollapse('TRASH')}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDropTarget({ type: 'trash' });
                  }}
                  onDragLeave={() => {
                    if (dropTarget?.type === 'trash') setDropTarget(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggedEntryId) {
                      handleDropAction({ type: 'trash' }, draggedEntryId);
                      setDraggedEntryId(null);
                      setDropTarget(null);
                    }
                  }}
                  className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-[11px] font-semibold tracking-wider uppercase transition-colors ${
                    dropTarget?.type === 'trash'
                      ? 'bg-red-500/30 text-red-200 border border-red-500/50 ring-2 ring-red-400'
                      : 'text-red-400/80 hover:text-red-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        collapsedGroups['TRASH'] ? '-rotate-90' : ''
                      }`}
                    />
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    <span>TRASH ({trashedEntries.length})</span>
                  </div>
                  <span className="text-[10px] text-white/40 lowercase font-normal italic">
                    drop here
                  </span>
                </div>

                {!collapsedGroups['TRASH'] && (
                  <div className="pl-2 space-y-1 pt-1">
                    {trashedEntries.length === 0 ? (
                      <div className="px-2 py-1.5 text-[11px] text-white/30 italic">
                        Trash is empty
                      </div>
                    ) : (
                      trashedEntries.map((entry) => (
                        <div
                          key={`trash-${entry.id}`}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            setDraggedEntryId(entry.id);
                            e.dataTransfer.setData('text/plain', entry.id);
                          }}
                          onClick={() => requestSelectEntry(entry.id)}
                          className={`group relative flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                            selectedId === entry.id
                              ? 'bg-blue-600/20 border-blue-500/40 text-white'
                              : 'bg-white/5 hover:bg-white/10 border-transparent text-white/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <GripVertical className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 cursor-grab shrink-0" />
                            {entry.variant === 'folder' || entry.content === null ? (
                              <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : (
                              <img
                                src={entry.icon}
                                alt=""
                                className="w-4 h-4 object-contain rounded shrink-0 bg-black/20"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium truncate">{entry.title}</p>
                              <p className="text-[10px] font-mono text-white/40 truncate">
                                {entry.id}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWindowsList((prev) => setTrashedRecursive(entry.id, false, prev));
                              setHasUnsavedChanges(true);
                            }}
                            className="text-[10px] bg-white/10 hover:bg-white/20 text-white/80 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            title="Restore item"
                          >
                            Restore
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full min-h-[600px] bg-[#141416] text-white/90 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header Bar */}
      <div className="h-12 bg-[#1c1c20] border-b border-white/10 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-blue-400" />
          <h1 className="text-sm font-semibold tracking-wide text-white">System Settings Admin</h1>
          {hasUnsavedChanges && (
            <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Unsaved Changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {saveError && (
            <span className="text-xs text-red-400 max-w-xs truncate" title={saveError}>
              {saveError}
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saveStatus === 'saving'}
            className={`px-4 py-1.5 font-medium text-xs rounded-md transition-all flex items-center gap-1.5 ${
              saveStatus === 'saved'
                ? 'bg-emerald-600 text-white cursor-default'
                : saveStatus === 'error'
                ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                : hasUnsavedChanges
                ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white cursor-pointer shadow-md'
                : 'bg-white/10 text-white/40 border border-white/5 cursor-not-allowed opacity-60'
            }`}
          >
            {saveStatus === 'saving' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saveStatus === 'saved' && <Check className="w-3.5 h-3.5" />}
            {saveStatus === 'error' && <RefreshCw className="w-3.5 h-3.5" />}
            <span>
              {saveStatus === 'saving'
                ? 'Saving...'
                : saveStatus === 'saved'
                ? 'Saved!'
                : saveStatus === 'error'
                ? 'Retry Save'
                : 'Save Changes'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Grouped Entries Sidebar */}
        <div className="w-80 bg-[#18181c] border-r border-white/10 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10 flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-white/60" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Entries ({visibleWindowsList.length})
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNewMenu((prev) => !prev)}
                className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-2.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showNewMenu && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-[#222228] border border-white/15 rounded-lg shadow-xl z-50 overflow-hidden py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleAddNewChoice('window')}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-white flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Window</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddNewChoice('folder')}
                    className="w-full text-left px-3 py-1.5 hover:bg-white/10 text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Folder className="w-3.5 h-3.5 text-amber-400" />
                    <span>Folder</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {renderGroupSection('DOCK', 'DOCK', dockEntries)}
            {renderGroupSection('DESKTOP', 'DESKTOP', desktopEntries)}
            {renderGroupSection('PROJECTS', 'PROJECTS', projectsEntries, true)}
            {renderGroupSection('SYSTEM', 'SYSTEM', systemEntries)}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Entry Editor */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#141416]">
          {/* Modal: Unsaved Changes Warning before switching entry */}
          {showUnsavedWarning && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>You have unsaved changes on the current entry. Switching will discard changes.</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  onClick={confirmSwitchEntry}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium cursor-pointer"
                >
                  Discard & Switch
                </button>
                <button
                  onClick={() => setShowUnsavedWarning(false)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {confirmDeleteId && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between text-xs text-red-200">
              <span>
                Are you sure you want to permanently delete window &quot;
                {windowsList.find((w) => w.id === confirmDeleteId)?.title}&quot;?
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteWindow(confirmDeleteId)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-medium cursor-pointer"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {selectedEntry ? (
            <>
              {/* Header Info */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedEntry.title}
                    <span className="text-xs font-mono text-white/40">({selectedEntry.id})</span>
                  </h2>
                  <p className="text-xs text-white/50">Edit metadata, display parameters, and content</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(selectedEntry.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-md text-xs font-medium cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Entry</span>
                </button>
              </div>

              {/* General Parameters Form */}
              <div className="bg-[#1c1c20] border border-white/10 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Window Parameters
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-white/60 mb-1">Title</label>
                    <input
                      type="text"
                      value={selectedEntry.title}
                      onChange={(e) => updateSelectedField('title', e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-md text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1">ID (Slug)</label>
                    <input
                      type="text"
                      value={selectedEntry.id}
                      onChange={(e) => updateSelectedField('id', e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-md text-white font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1">Folder</label>
                    <select
                      value={selectedEntry.folder || ''}
                      onChange={(e) => updateSelectedField('folder', e.target.value || null)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-md text-white focus:outline-none focus:border-blue-500"
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
                    <label className="block text-white/60 mb-1">Variant</label>
                    <select
                      value={selectedEntry.variant || ''}
                      onChange={(e) => updateSelectedField('variant', e.target.value || null)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-md text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Default Window</option>
                      <option value="folder">Folder Window</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={selectedEntry.width ?? ''}
                      onChange={(e) =>
                        updateSelectedField('width', e.target.value ? parseInt(e.target.value) : null)
                      }
                      placeholder="Auto"
                      className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-md text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={selectedEntry.height ?? ''}
                      onChange={(e) =>
                        updateSelectedField('height', e.target.value ? parseInt(e.target.value) : null)
                      }
                      placeholder="Auto"
                      className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-md text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Icon Field + Drag and Drop Upload */}
                <CloudinaryUploadField
                  label="Icon Image URL / File Upload"
                  value={selectedEntry.icon || ''}
                  onChange={(url) => updateSelectedField('icon', url)}
                  placeholder="Paste image URL or drag file..."
                  accept="image/*"
                  resourceType="image"
                />

                {/* Checkbox Display Flags */}
                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs border-t border-white/10 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEntry.showOnDesktop}
                      onChange={(e) => updateSelectedField('showOnDesktop', e.target.checked)}
                      className="rounded bg-black/40 border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-white/80">Show on Desktop</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEntry.showInDock}
                      onChange={(e) => updateSelectedField('showInDock', e.target.checked)}
                      className="rounded bg-black/40 border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-white/80">Show in Dock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEntry.isFullScreen}
                      onChange={(e) => updateSelectedField('isFullScreen', e.target.checked)}
                      className="rounded bg-black/40 border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-white/80">Fullscreen Window</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!selectedEntry.trashed}
                      onChange={(e) => {
                        const isTrashed = e.target.checked;
                        setWindowsList((prev) => setTrashedRecursive(selectedEntry.id, isTrashed, prev));
                        setHasUnsavedChanges(true);
                      }}
                      className="rounded bg-black/40 border-white/20 text-red-600 focus:ring-0 cursor-pointer"
                    />
                    <span className={selectedEntry.trashed ? 'text-red-400 font-semibold' : 'text-white/80'}>
                      Trashed
                    </span>
                  </label>
                </div>
              </div>

              {/* Content / Block Editor Section (Hidden for Folders) */}
              {selectedEntry.variant !== 'folder' && selectedEntry.content !== null && (
                <div className="bg-[#1c1c20] border border-white/10 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Content Configuration
                    </h3>
                    {selectedEntry.content?.type === 'blocks' && (
                      <div className="flex items-center gap-2">
                        <select
                          value={newBlockType}
                          onChange={(e) => setNewBlockType(e.target.value)}
                          className="px-2 py-1 bg-black/40 border border-white/15 rounded text-xs text-white"
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
                          onClick={handleAddBlock}
                          className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Block</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Case 1: Custom Component View */}
                  {selectedEntry.content?.type === 'component' && (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3 text-xs">
                      <div className="flex items-center gap-2 text-amber-400 font-medium">
                        <FileText className="w-4 h-4" />
                        <span>Custom Component View</span>
                      </div>
                      <p className="text-white/60">
                        Component Name:{' '}
                        <span className="font-mono text-white/90 bg-black/30 px-2 py-0.5 rounded border border-white/10">
                          {selectedEntry.content.name || 'Unspecified'}
                        </span>
                      </p>
                      {selectedEntry.content.text !== undefined ? (
                        <div className="space-y-1.5 pt-1">
                          <label className="block text-white/60 font-medium">Text Content</label>
                          <textarea
                            rows={6}
                            value={selectedEntry.content.text || ''}
                            onChange={(e) => updateComponentText(e.target.value)}
                            className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-md text-white font-mono text-xs focus:outline-none focus:border-blue-500 whitespace-pre"
                            placeholder="Enter text..."
                            spellCheck={false}
                          />
                        </div>
                      ) : (
                        <p className="text-white/40 italic">
                          This entry renders a custom React component and does not use the Block Editor.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Case 2: Block Editor */}
                  {selectedEntry.content?.type === 'blocks' && (
                    <div className="space-y-4">
                      {(!selectedEntry.content.blocks || selectedEntry.content.blocks.length === 0) && (
                        <div className="p-6 text-center text-xs text-white/40 bg-black/20 rounded-lg border border-dashed border-white/10">
                          No content blocks. Use the picker above to add text, images, videos, or metadata.
                        </div>
                      )}

                      {selectedEntry.content.blocks?.map((block, bIdx) => (
                        <div
                          key={bIdx}
                          className="bg-black/30 border border-white/10 rounded-lg p-4 space-y-3 text-xs"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-white/10">
                            <span className="font-mono font-bold uppercase text-blue-400">
                              Block #{bIdx + 1}: {block.type}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  if (!selectedEntry?.content?.blocks) return;
                                  const blocks = [...selectedEntry.content.blocks];
                                  if (bIdx > 0) {
                                    const temp = blocks[bIdx];
                                    blocks[bIdx] = blocks[bIdx - 1];
                                    blocks[bIdx - 1] = temp;
                                    updateBlocks(blocks);
                                  }
                                }}
                                disabled={bIdx === 0}
                                className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => {
                                  if (!selectedEntry?.content?.blocks) return;
                                  const blocks = [...selectedEntry.content.blocks];
                                  if (bIdx < blocks.length - 1) {
                                    const temp = blocks[bIdx];
                                    blocks[bIdx] = blocks[bIdx + 1];
                                    blocks[bIdx + 1] = temp;
                                    updateBlocks(blocks);
                                  }
                                }}
                                disabled={bIdx === (selectedEntry.content.blocks?.length || 0) - 1}
                                className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white disabled:opacity-20 cursor-pointer"
                              >
                                ▼
                              </button>
                              <button
                                onClick={() => {
                                  if (!selectedEntry?.content?.blocks) return;
                                  const blocks = selectedEntry.content.blocks.filter((_, i) => i !== bIdx);
                                  updateBlocks(blocks);
                                }}
                                className="p-1 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded transition-colors cursor-pointer ml-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Block fields */}
                          {block.type === 'text' && (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-white/60 mb-1">Heading</label>
                                <input
                                  type="text"
                                  value={block.heading || ''}
                                  onChange={(e) => {
                                    const blocks = [...(selectedEntry.content?.blocks || [])];
                                    blocks[bIdx] = { ...blocks[bIdx], heading: e.target.value };
                                    updateBlocks(blocks);
                                  }}
                                  className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-white/60 mb-1">Body Text</label>
                                <textarea
                                  rows={4}
                                  value={block.body || ''}
                                  onChange={(e) => {
                                    const blocks = [...(selectedEntry.content?.blocks || [])];
                                    blocks[bIdx] = { ...blocks[bIdx], body: e.target.value };
                                    updateBlocks(blocks);
                                  }}
                                  className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded text-white font-sans"
                                />
                              </div>
                            </div>
                          )}

                          {block.type === 'image' && (
                            <div className="space-y-3">
                              <CloudinaryUploadField
                                label="Image URL / Media Upload"
                                value={block.src || ''}
                                onChange={(url) => {
                                  const blocks = [...(selectedEntry.content?.blocks || [])];
                                  blocks[bIdx] = { ...blocks[bIdx], src: url };
                                  updateBlocks(blocks);
                                }}
                                accept="image/*"
                                resourceType="image"
                              />
                              <div>
                                <label className="block text-white/60 mb-1">Caption</label>
                                <input
                                  type="text"
                                  value={block.caption || ''}
                                  onChange={(e) => {
                                    const blocks = [...(selectedEntry.content?.blocks || [])];
                                    blocks[bIdx] = { ...blocks[bIdx], caption: e.target.value };
                                    updateBlocks(blocks);
                                  }}
                                  className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded text-white"
                                />
                              </div>
                            </div>
                          )}

                          {block.type === 'imagePair' && (
                            <div className="space-y-3">
                              <CloudinaryUploadField
                                label="First Image URL"
                                value={block.srcA || ''}
                                onChange={(url) => {
                                  const blocks = [...(selectedEntry.content?.blocks || [])];
                                  blocks[bIdx] = { ...blocks[bIdx], srcA: url };
                                  updateBlocks(blocks);
                                }}
                                accept="image/*"
                                resourceType="image"
                              />
                              <CloudinaryUploadField
                                label="Second Image URL"
                                value={block.srcB || ''}
                                onChange={(url) => {
                                  const blocks = [...(selectedEntry.content?.blocks || [])];
                                  blocks[bIdx] = { ...blocks[bIdx], srcB: url };
                                  updateBlocks(blocks);
                                }}
                                accept="image/*"
                                resourceType="image"
                              />
                            </div>
                          )}

                          {block.type === 'video' && (
                            <div className="space-y-3">
                              <CloudinaryUploadField
                                label="Video Source URL"
                                value={block.src || ''}
                                onChange={(url) => {
                                  const blocks = [...(selectedEntry.content?.blocks || [])];
                                  blocks[bIdx] = { ...blocks[bIdx], src: url };
                                  updateBlocks(blocks);
                                }}
                                accept="video/*"
                                resourceType="video"
                              />
                              <CloudinaryUploadField
                                label="Poster Image URL"
                                value={block.poster || ''}
                                onChange={(url) => {
                                  const blocks = [...(selectedEntry.content?.blocks || [])];
                                  blocks[bIdx] = { ...blocks[bIdx], poster: url };
                                  updateBlocks(blocks);
                                }}
                                accept="image/*"
                                resourceType="image"
                              />
                            </div>
                          )}

                          {block.type === 'caption' && (
                            <div>
                              <label className="block text-white/60 mb-1">Caption Text</label>
                              <input
                                type="text"
                                value={block.text || ''}
                                onChange={(e) => {
                                  const blocks = [...(selectedEntry.content?.blocks || [])];
                                  blocks[bIdx] = { ...blocks[bIdx], text: e.target.value };
                                  updateBlocks(blocks);
                                }}
                                className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded text-white"
                              />
                            </div>
                          )}

                          {block.type === 'spacer' && (
                            <div>
                              <label className="block text-white/60 mb-1">Size</label>
                              <select
                                value={block.size || 'md'}
                                onChange={(e) => {
                                  const blocks = [...(selectedEntry.content?.blocks || [])];
                                  blocks[bIdx] = { ...blocks[bIdx], size: e.target.value };
                                  updateBlocks(blocks);
                                }}
                                className="px-3 py-1.5 bg-black/40 border border-white/15 rounded text-white"
                              >
                                <option value="sm">Small</option>
                                <option value="md">Medium</option>
                                <option value="lg">Large</option>
                              </select>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Folder Info Box for Folder entries */}
              {(selectedEntry.variant === 'folder' || selectedEntry.content === null) && (
                <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-amber-400">
                    <Folder className="w-4 h-4" />
                    <span>Folder Entry</span>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    This entry functions as a folder container. Items with their parent folder set to{' '}
                    <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-white">
                      {selectedEntry.id}
                    </code>{' '}
                    will automatically render inside this folder when opened.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-white/40 text-sm">
              Select an entry from the sidebar to edit parameters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

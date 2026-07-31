import React, { useState, useEffect, useRef } from 'react';
import windowsConfig from '../data/windows.json';
import {
  Lock, Eye, EyeOff, Trash2, Plus, ChevronUp, ChevronDown,
  Folder, Layers, Shield, GripVertical, FileText, UploadCloud,
  Check, AlertCircle, Loader2, RefreshCw
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

      {/* Drag and Drop Zone */}
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

  // Reordering Drag State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter out system_settings from the visible admin project list
  const visibleWindowsList = windowsList.filter((w) => w.id !== 'system_settings');

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
          windowsData: windowsList, // full list including system_settings!
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
      setShowUnsavedWarning(true);
    } else {
      setSelectedId(id);
    }
  };

  const confirmSwitchEntry = () => {
    setShowUnsavedWarning(false);
    setHasUnsavedChanges(false);
    setSaveError(null);
    if (pendingSelectId === 'NEW') {
      createNewWindowInternal();
    } else {
      setSelectedId(pendingSelectId);
    }
    setPendingSelectId(null);
  };

  const createNewWindowInternal = () => {
    const newId = `window_${Date.now().toString().slice(-5)}`;
    const newWindow: WindowData = {
      id: newId,
      title: 'New Window',
      icon: 'https://res.cloudinary.com/dezas8twg/image/upload/v1777921910/BrooksOS_0006_Project_mjqqc4.png',
      folder: null,
      width: 800,
      height: 600,
      showOnDesktop: true,
      showInDock: false,
      isFullScreen: false,
      variant: null,
      order: windowsList.length + 1,
      visible: true,
      content: {
        type: 'blocks',
        blocks: [],
      },
    };
    setWindowsList((prev) => [...prev, newWindow]);
    setSelectedId(newId);
    setHasUnsavedChanges(true);
  };

  const handleAddNewWindow = () => {
    if (hasUnsavedChanges) {
      setPendingSelectId('NEW');
      setShowUnsavedWarning(true);
    } else {
      createNewWindowInternal();
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

  const selectedEntry = windowsList.find((w) => w.id === selectedId) || null;

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

  const handleMoveWindow = (visibleIndex: number, direction: 'up' | 'down') => {
    const targetVisibleIndex = direction === 'up' ? visibleIndex - 1 : visibleIndex + 1;
    if (targetVisibleIndex < 0 || targetVisibleIndex >= visibleWindowsList.length) return;

    const itemA = visibleWindowsList[visibleIndex];
    const itemB = visibleWindowsList[targetVisibleIndex];

    const idxA = windowsList.findIndex((w) => w.id === itemA.id);
    const idxB = windowsList.findIndex((w) => w.id === itemB.id);

    if (idxA !== -1 && idxB !== -1) {
      const list = [...windowsList];
      const temp = list[idxA];
      list[idxA] = list[idxB];
      list[idxB] = temp;
      setWindowsList(list);
      setHasUnsavedChanges(true);
    }
  };

  const handleDragStart = (visibleIndex: number) => {
    setDraggedIndex(visibleIndex);
  };

  const handleDragOver = (e: React.DragEvent, visibleIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === visibleIndex) return;

    const itemDragged = visibleWindowsList[draggedIndex];
    const itemTarget = visibleWindowsList[visibleIndex];

    const idxDragged = windowsList.findIndex((w) => w.id === itemDragged.id);
    const idxTarget = windowsList.findIndex((w) => w.id === itemTarget.id);

    if (idxDragged !== -1 && idxTarget !== -1) {
      const list = [...windowsList];
      const item = list[idxDragged];
      list.splice(idxDragged, 1);
      list.splice(idxTarget, 0, item);
      setDraggedIndex(visibleIndex);
      setWindowsList(list);
      setHasUnsavedChanges(true);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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

  const handleUpdateBlockField = (index: number, field: string, value: any) => {
    if (!selectedEntry?.content?.blocks) return;
    const blocks = [...selectedEntry.content.blocks];
    blocks[index] = { ...blocks[index], [field]: value };
    updateBlocks(blocks);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (!selectedEntry?.content?.blocks) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const blocks = [...selectedEntry.content.blocks];
    if (newIndex < 0 || newIndex >= blocks.length) return;
    const temp = blocks[index];
    blocks[index] = blocks[newIndex];
    blocks[newIndex] = temp;
    updateBlocks(blocks);
  };

  const handleDeleteBlock = (index: number) => {
    if (!selectedEntry?.content?.blocks) return;
    const blocks = selectedEntry.content.blocks.filter((_, i) => i !== index);
    updateBlocks(blocks);
  };

  // Folder options for dropdown (excluding system_settings)
  const folderOptions = visibleWindowsList.filter(
    (w) => w.variant === 'folder' || w.content === null
  );

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
        {/* LEFT COLUMN: Entries List */}
        <div className="w-80 bg-[#18181c] border-r border-white/10 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-white/60" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                Windows ({visibleWindowsList.length})
              </span>
            </div>
            <button
              onClick={handleAddNewWindow}
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {visibleWindowsList.map((entry, vIndex) => {
              const isSelected = selectedId === entry.id;
              return (
                <div
                  key={entry.id}
                  draggable
                  onDragStart={() => handleDragStart(vIndex)}
                  onDragOver={(e) => handleDragOver(e, vIndex)}
                  onDragEnd={handleDragEnd}
                  onClick={() => requestSelectEntry(entry.id)}
                  className={`group relative flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                    isSelected
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
                      <p className="text-[10px] font-mono text-white/40 truncate">{entry.id}</p>
                    </div>
                  </div>

                  {/* Actions per row */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0 ml-1">
                    <button
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

                    <div className="flex flex-col">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveWindow(vIndex, 'up');
                        }}
                        disabled={vIndex === 0}
                        className="text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveWindow(vIndex, 'down');
                        }}
                        disabled={vIndex === visibleWindowsList.length - 1}
                        className="text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(entry.id);
                      }}
                      className="p-1 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
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
                Are you sure you want to delete window &quot;
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
                  <p className="text-xs text-white/50">Edit metadata, display flags, and content blocks</p>
                </div>
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
                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs">
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
                </div>
              </div>

              {/* Content / Block Editor Section */}
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

                {/* Case 2: Folder / Null Content */}
                {selectedEntry.content === null && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-xs text-white/50 italic">
                    Folder entries contain sub-items and do not have page blocks.
                  </div>
                )}

                {/* Case 3: Block Editor */}
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
                        {/* Block Header */}
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                            {block.type}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveBlock(bIdx, 'up')}
                              disabled={bIdx === 0}
                              className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveBlock(bIdx, 'down')}
                              disabled={bIdx === (selectedEntry.content?.blocks?.length || 0) - 1}
                              className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white disabled:opacity-20 cursor-pointer"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlock(bIdx)}
                              className="p-1 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400 cursor-pointer ml-2"
                              title="Delete Block"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Block Type Fields */}
                        {block.type === 'text' && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-white/60 mb-1">Heading</label>
                              <input
                                type="text"
                                value={block.heading || ''}
                                onChange={(e) =>
                                  handleUpdateBlockField(bIdx, 'heading', e.target.value)
                                }
                                className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-white/60 mb-1">Body Text</label>
                              <textarea
                                rows={3}
                                value={block.body || ''}
                                onChange={(e) => handleUpdateBlockField(bIdx, 'body', e.target.value)}
                                className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded text-white font-sans"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'image' && (
                          <div className="space-y-3">
                            <CloudinaryUploadField
                              label="Image Source"
                              value={block.src || ''}
                              onChange={(url) => handleUpdateBlockField(bIdx, 'src', url)}
                              placeholder="Image URL or drag file..."
                              accept="image/*"
                              resourceType="image"
                            />
                            {block.src && (
                              <div className="mt-2">
                                <img
                                  src={block.src}
                                  alt="Preview"
                                  className="max-h-32 object-cover rounded border border-white/10"
                                />
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-white/60 mb-1">Alt Text</label>
                                <input
                                  type="text"
                                  value={block.alt || ''}
                                  onChange={(e) =>
                                    handleUpdateBlockField(bIdx, 'alt', e.target.value)
                                  }
                                  className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-white/60 mb-1">Width</label>
                                <select
                                  value={block.width || 'full'}
                                  onChange={(e) =>
                                    handleUpdateBlockField(bIdx, 'width', e.target.value)
                                  }
                                  className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded text-white"
                                >
                                  <option value="full">Full Width</option>
                                  <option value="half">Half Width</option>
                                  <option value="inset">Inset Width</option>
                                </select>
                              </div>
                            </div>
                            <div>
                              <label className="block text-white/60 mb-1">Caption</label>
                              <input
                                type="text"
                                value={block.caption || ''}
                                onChange={(e) =>
                                  handleUpdateBlockField(bIdx, 'caption', e.target.value)
                                }
                                className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded text-white"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'imagePair' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 border-r border-white/10 pr-3">
                              <span className="text-[10px] uppercase font-semibold text-white/40">
                                Image A
                              </span>
                              <CloudinaryUploadField
                                label="Image A Source"
                                value={block.srcA || ''}
                                onChange={(url) => handleUpdateBlockField(bIdx, 'srcA', url)}
                                placeholder="Image A URL or drag file..."
                                accept="image/*"
                                resourceType="image"
                              />
                              {block.srcA && (
                                <img
                                  src={block.srcA}
                                  alt=""
                                  className="max-h-24 object-cover rounded border border-white/10"
                                />
                              )}
                              <input
                                type="text"
                                placeholder="Caption A"
                                value={block.captionA || ''}
                                onChange={(e) =>
                                  handleUpdateBlockField(bIdx, 'captionA', e.target.value)
                                }
                                className="w-full px-2.5 py-1 bg-black/40 border border-white/15 rounded text-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-semibold text-white/40">
                                Image B
                              </span>
                              <CloudinaryUploadField
                                label="Image B Source"
                                value={block.srcB || ''}
                                onChange={(url) => handleUpdateBlockField(bIdx, 'srcB', url)}
                                placeholder="Image B URL or drag file..."
                                accept="image/*"
                                resourceType="image"
                              />
                              {block.srcB && (
                                <img
                                  src={block.srcB}
                                  alt=""
                                  className="max-h-24 object-cover rounded border border-white/10"
                                />
                              )}
                              <input
                                type="text"
                                placeholder="Caption B"
                                value={block.captionB || ''}
                                onChange={(e) =>
                                  handleUpdateBlockField(bIdx, 'captionB', e.target.value)
                                }
                                className="w-full px-2.5 py-1 bg-black/40 border border-white/15 rounded text-white"
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'video' && (
                          <div className="space-y-3">
                            <CloudinaryUploadField
                              label="Video Source"
                              value={block.src || ''}
                              onChange={(url) => handleUpdateBlockField(bIdx, 'src', url)}
                              placeholder="Video URL or drag file..."
                              accept="video/*"
                              resourceType="video"
                            />
                            <CloudinaryUploadField
                              label="Poster Image Source"
                              value={block.poster || ''}
                              onChange={(url) => handleUpdateBlockField(bIdx, 'poster', url)}
                              placeholder="Poster image URL or drag file..."
                              accept="image/*"
                              resourceType="image"
                            />
                            <div className="flex items-center gap-6 pt-1">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!block.autoplay}
                                  onChange={(e) =>
                                    handleUpdateBlockField(bIdx, 'autoplay', e.target.checked)
                                  }
                                  className="rounded bg-black/40 border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                                />
                                <span>Autoplay</span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!block.loop}
                                  onChange={(e) =>
                                    handleUpdateBlockField(bIdx, 'loop', e.target.checked)
                                  }
                                  className="rounded bg-black/40 border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                                />
                                <span>Loop</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {block.type === 'caption' && (
                          <div>
                            <label className="block text-white/60 mb-1">Caption Text</label>
                            <input
                              type="text"
                              value={block.text || ''}
                              onChange={(e) => handleUpdateBlockField(bIdx, 'text', e.target.value)}
                              className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded text-white"
                            />
                          </div>
                        )}

                        {block.type === 'spacer' && (
                          <div>
                            <label className="block text-white/60 mb-1">Spacer Size</label>
                            <select
                              value={block.size || 'md'}
                              onChange={(e) => handleUpdateBlockField(bIdx, 'size', e.target.value)}
                              className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded text-white"
                            >
                              <option value="sm">Small (16px)</option>
                              <option value="md">Medium (32px)</option>
                              <option value="lg">Large (64px)</option>
                            </select>
                          </div>
                        )}

                        {block.type === 'meta' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="block text-white/60">Metadata Rows</label>
                              <button
                                onClick={() => {
                                  const rows = [...(block.rows || []), { label: '', value: '' }];
                                  handleUpdateBlockField(bIdx, 'rows', rows);
                                }}
                                className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded cursor-pointer"
                              >
                                + Add Row
                              </button>
                            </div>

                            {(!block.rows || block.rows.length === 0) && (
                              <p className="text-[10px] text-white/40 italic">No metadata rows.</p>
                            )}

                            {block.rows?.map((row: any, rIdx: number) => (
                              <div key={rIdx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  placeholder="Label"
                                  value={row.label || ''}
                                  onChange={(e) => {
                                    const rows = [...block.rows];
                                    rows[rIdx] = { ...rows[rIdx], label: e.target.value };
                                    handleUpdateBlockField(bIdx, 'rows', rows);
                                  }}
                                  className="w-1/3 px-2.5 py-1 bg-black/40 border border-white/15 rounded text-white"
                                />
                                <input
                                  type="text"
                                  placeholder="Value"
                                  value={row.value || ''}
                                  onChange={(e) => {
                                    const rows = [...block.rows];
                                    rows[rIdx] = { ...rows[rIdx], value: e.target.value };
                                    handleUpdateBlockField(bIdx, 'rows', rows);
                                  }}
                                  className="flex-1 px-2.5 py-1 bg-black/40 border border-white/15 rounded text-white"
                                />
                                <button
                                  onClick={() => {
                                    const rows = block.rows.filter((_: any, i: number) => i !== rIdx);
                                    handleUpdateBlockField(bIdx, 'rows', rows);
                                  }}
                                  className="p-1 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-white/40">
              Select a window entry from the list to view and edit its parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

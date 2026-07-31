import React from 'react';
import windowsConfig from './windows.json';

import { FinderWindowView } from '@/src/components/FinderWindowView';
import { PhotoshopView } from '@/src/components/PhotoshopView';
import { MessagesApp } from '@/src/components/MessagesApp';
import { NotesApp } from '@/src/components/NotesApp';
import { MailAppView } from '@/src/components/MailAppView';
import { SpotifyAppView } from '@/src/components/SpotifyAppView';
import { CloAppView } from '@/src/components/CloAppView';
import { FloraAppView } from '@/src/components/FloraAppView';
import { StickiesAppView } from '@/src/components/StickiesAppView';
import { MacintoshHDView } from '@/src/components/MacintoshHDView';
import { SystemSettingsAppView } from '@/src/components/SystemSettingsAppView';
import { BlockRenderer } from '@/src/components/BlockRenderer';

export interface WindowContentConfig {
  type: 'blocks' | 'component' | string;
  name?: string;
  text?: string;
  blocks?: any[];
  props?: Record<string, any>;
}

export interface WindowDataEntry {
  id: string;
  title: string;
  icon: string;
  folder: string | null;
  width: number | null;
  height: number | null;
  dockBreakpoints?: string[];
  trashed?: boolean;
  isFullScreen?: boolean;
  variant?: 'default' | 'folder' | string | null;
  order: number;
  visible: boolean;
  content: WindowContentConfig | null;
}

export const windowsRegistryData: WindowDataEntry[] = windowsConfig.windows as WindowDataEntry[];

export const COMPONENT_MAP: Record<string, React.FC<any>> = {
  FinderWindowView,
  PhotoshopView,
  MessagesApp,
  NotesApp,
  MailAppView,
  SpotifyAppView,
  CloAppView,
  FloraAppView,
  StickiesAppView,
  MacintoshHDView,
  SystemSettingsAppView,
};

export function resolveWindowComponent(entry: WindowDataEntry): React.ReactNode {
  if (!entry.content) {
    return null;
  }

  if (entry.content.type === 'component' && entry.content.name) {
    const Component = COMPONENT_MAP[entry.content.name];
    if (Component) {
      const componentProps = {
        ...(entry.content.props || {}),
        ...(entry.content.text !== undefined ? { text: entry.content.text } : {}),
      };
      return <Component {...componentProps} />;
    }
  }

  if (entry.content.type === 'blocks') {
    return <BlockRenderer blocks={entry.content.blocks || []} />;
  }

  return null;
}

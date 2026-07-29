import React from 'react';
import windowsConfig from './windows.json';

export const DOCK_ORDER: string[] = windowsConfig.dockOrder || ['clo', 'photoshop', 'flora_ai', 'mail', 'brooks_chat', 'freeform', 'spotify'];
export const MOBILE_DOCK_ORDER: string[] = windowsConfig.mobileDockOrder || ['clo', 'photoshop', 'flora_ai', 'contact_folder'];

import { AppWindowContent } from '@/src/components/AppWindowContent';
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
import { cn } from '@/src/lib/utils';

export interface WindowContentConfig {
  type: 'blocks' | 'component' | 'iframe' | string;
  name?: string;
  url?: string;
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
  showOnDesktop?: boolean;
  showInDock?: boolean;
  isFullScreen?: boolean;
  variant?: 'default' | 'folder' | string | null;
  order: number;
  visible: boolean;
  subtitle?: string | null;
  description?: string | null;
  details?: string | null;
  content: WindowContentConfig | null;
}

export const windowsRegistryData: WindowDataEntry[] = windowsConfig.windows as WindowDataEntry[];

const GenericApp = ({ title, subtitle, description, details, icon, ...props }: any) => (
  <AppWindowContent
    icon={icon}
    title={title}
    subtitle={subtitle}
    description={description}
    details={details}
    previewImage={icon.replace('w=200', 'w=800')}
    {...props}
  />
);

const AppTypeWindow = ({ title, subtitle, description }: any) => (
  <div className={cn("flex flex-col min-h-full bg-transparent p-6 md:p-8")}>
    <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white/90">{title}</h1>
    <h2 className="text-lg md:text-xl text-white/50 mb-4">{subtitle}</h2>
    <p className="text-white/80">{description}</p>
  </div>
);

const FullscreenProject = ({ title, subtitle, description }: any) => (
  <div className={cn("flex flex-col items-center justify-center min-h-full bg-transparent text-white p-6 md:p-8")}>
    <h1 className="text-3xl md:text-5xl font-bold mb-4 text-center">{title}</h1>
    <h2 className="text-xl md:text-2xl text-gray-400 mb-8 text-center">{subtitle}</h2>
    <p className="text-base md:text-lg text-gray-300 max-w-2xl text-center">{description}</p>
  </div>
);

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
};

export function resolveWindowComponent(entry: WindowDataEntry): React.ReactNode {
  if (!entry.content) {
    return null;
  }

  if (entry.content.type === 'component' && entry.content.name) {
    const Component = COMPONENT_MAP[entry.content.name];
    if (Component) {
      return <Component {...(entry.content.props || {})} />;
    }
  }

  if (entry.content.type === 'iframe' && entry.content.url) {
    return (
      <iframe
        src={entry.content.url}
        className="w-full h-full border-0"
        title={entry.title}
      />
    );
  }

  if (entry.content.type === 'blocks') {
    if (entry.isFullScreen) {
      return (
        <FullscreenProject
          title={entry.title}
          subtitle={entry.subtitle || ''}
          description={entry.description || ''}
        />
      );
    }
    if (entry.id === 'resume') {
      return (
        <AppTypeWindow
          title={entry.title}
          subtitle={entry.subtitle || ''}
          description={entry.description || ''}
        />
      );
    }
    return (
      <GenericApp
        title={entry.title}
        subtitle={entry.subtitle || ''}
        description={entry.description || ''}
        details={entry.details || ''}
        icon={entry.icon}
      />
    );
  }

  return null;
}

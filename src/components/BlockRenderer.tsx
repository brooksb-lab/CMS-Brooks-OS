import React from 'react';
import { cn } from '@/src/lib/utils';

export interface ImageBlock {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
  width?: 'full' | 'half' | 'inset';
}

export interface ImagePairBlock {
  type: 'imagePair';
  srcA: string;
  srcB: string;
  captionA?: string;
  captionB?: string;
}

export interface VideoBlock {
  type: 'video';
  src: string;
  poster?: string;
  autoplay?: boolean;
  loop?: boolean;
}

export interface TextBlock {
  type: 'text';
  heading?: string;
  body?: string;
}

export interface CaptionBlock {
  type: 'caption';
  text: string;
}

export interface SpacerBlock {
  type: 'spacer';
  size?: 'sm' | 'md' | 'lg';
}

export interface MetaBlockRow {
  label: string;
  value: string;
}

export interface MetaBlock {
  type: 'meta';
  rows: MetaBlockRow[];
}

export type Block =
  | ImageBlock
  | ImagePairBlock
  | VideoBlock
  | TextBlock
  | CaptionBlock
  | SpacerBlock
  | MetaBlock
  | Record<string, any>;

export interface BlockRendererProps {
  blocks?: Block[];
  className?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks = [], className }) => {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return <div className={cn("min-h-full p-6 text-white/50", className)} />;
  }

  return (
    <div className={cn("min-h-full p-6 md:p-8 space-y-6 text-white/90 max-w-4xl mx-auto", className)}>
      {blocks.map((block, idx) => {
        if (!block || typeof block !== 'object' || !block.type) {
          return null;
        }

        switch (block.type) {
          case 'image': {
            const imgBlock = block as ImageBlock;
            let widthClass = 'w-full';
            if (imgBlock.width === 'half') widthClass = 'w-1/2 mx-auto';
            if (imgBlock.width === 'inset') widthClass = 'w-5/6 mx-auto';

            return (
              <figure key={idx} className={cn("space-y-2", widthClass)}>
                <img
                  src={imgBlock.src}
                  alt={imgBlock.alt || ''}
                  className="w-full h-auto rounded-lg object-cover shadow-lg border border-white/10"
                />
                {imgBlock.caption && (
                  <figcaption className="text-xs text-white/50 text-center">{imgBlock.caption}</figcaption>
                )}
              </figure>
            );
          }

          case 'imagePair': {
            const pairBlock = block as ImagePairBlock;
            return (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <figure className="space-y-2">
                  <img
                    src={pairBlock.srcA}
                    alt=""
                    className="w-full h-auto rounded-lg object-cover shadow-lg border border-white/10"
                  />
                  {pairBlock.captionA && (
                    <figcaption className="text-xs text-white/50 text-center">{pairBlock.captionA}</figcaption>
                  )}
                </figure>
                <figure className="space-y-2">
                  <img
                    src={pairBlock.srcB}
                    alt=""
                    className="w-full h-auto rounded-lg object-cover shadow-lg border border-white/10"
                  />
                  {pairBlock.captionB && (
                    <figcaption className="text-xs text-white/50 text-center">{pairBlock.captionB}</figcaption>
                  )}
                </figure>
              </div>
            );
          }

          case 'video': {
            const vidBlock = block as VideoBlock;
            return (
              <div key={idx} className="w-full space-y-2">
                <video
                  src={vidBlock.src}
                  poster={vidBlock.poster}
                  autoPlay={vidBlock.autoplay}
                  loop={vidBlock.loop}
                  controls
                  className="w-full rounded-lg shadow-lg border border-white/10"
                />
              </div>
            );
          }

          case 'text': {
            const txtBlock = block as TextBlock;
            return (
              <div key={idx} className="space-y-2">
                {txtBlock.heading && (
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/95">{txtBlock.heading}</h2>
                )}
                {txtBlock.body && (
                  <p className="text-sm md:text-base text-white/70 leading-relaxed whitespace-pre-wrap">{txtBlock.body}</p>
                )}
              </div>
            );
          }

          case 'caption': {
            const capBlock = block as CaptionBlock;
            return (
              <p key={idx} className="text-xs text-white/50 italic text-center">
                {capBlock.text}
              </p>
            );
          }

          case 'spacer': {
            const spcBlock = block as SpacerBlock;
            const sizeMap = { sm: 'h-4', md: 'h-8', lg: 'h-16' };
            const heightClass = sizeMap[spcBlock.size || 'md'];
            return <div key={idx} className={heightClass} />;
          }

          case 'meta': {
            const metaBlock = block as MetaBlock;
            if (!Array.isArray(metaBlock.rows) || metaBlock.rows.length === 0) return null;
            return (
              <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-2">
                {metaBlock.rows.map((row, rIdx) => (
                  <div key={rIdx} className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm py-1 border-b border-white/5 last:border-b-0 gap-1">
                    <span className="text-white/50 font-medium">{row.label}</span>
                    <span className="text-white/80 font-mono">{row.value}</span>
                  </div>
                ))}
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
};

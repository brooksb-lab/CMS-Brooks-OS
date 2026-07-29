import React, { useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Settings, Play, MessageSquare, Download, Maximize2, Bookmark } from 'lucide-react';
import { cn } from '@/src/lib/utils';

// --- CUSTOM NODE TYPES ---

// Image Node
const ImageNode = ({ data, selected }: any) => {
  return (
    <div className={cn("relative flex flex-col gap-1 w-[280px] bg-transparent text-white group", selected ? "" : "")}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-white/50 border-none -ml-4" />
      
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-white/70 px-1">
        <div className="flex items-center gap-2">
          {data.icon} {data.title}
        </div>
        <div className="text-white/40">{data.model}</div>
      </div>
      
      {/* Content */}
      <div className={cn("relative rounded-xl overflow-hidden border", selected ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "border-white/10")}>
        <img src={data.imageUrl} alt={data.title} className="w-full h-auto object-cover" />
        {data.isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-current ml-1" />
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-white/50 border-none -mr-4" />
    </div>
  );
};

// Text Node
const TextNode = ({ data, selected }: any) => {
  return (
    <div className={cn("relative flex flex-col gap-1 w-[320px] bg-transparent text-white", selected ? "" : "")}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-white/50 border-none -ml-4" />
      
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-white/70 px-1">
        <div className="flex items-center gap-2">
          {data.icon} {data.title}
        </div>
      </div>
      
      {/* Content */}
      <div className={cn("rounded-xl bg-[#1e1e1e] border p-4 text-xs font-mono text-white/80 leading-relaxed", selected ? "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "border-white/10")}>
        {data.content}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-white/50 border-none -mr-4" />
    </div>
  );
}

const nodeTypes = {
  imageNode: ImageNode,
  textNode: TextNode,
};

// --- INITIAL DATA ---

const initialNodes = [
  {
    id: '1',
    type: 'imageNode',
    position: { x: 50, y: 150 },
    data: {
      title: 'Scenic Hillside View',
      model: 'Nano Banana 2',
      icon: <div className="w-3 h-3 rounded-sm border border-white/50 bg-black/40" />,
      imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  },
  {
    id: '2',
    type: 'imageNode',
    position: { x: 50, y: 350 },
    data: {
      title: 'sunset',
      model: 'Nano Banana 2',
      icon: <div className="w-3 h-3 rounded-sm border border-white/50 bg-black/40" />,
      imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  },
  {
    id: '3',
    type: 'imageNode',
    position: { x: 450, y: -50 },
    data: {
      title: '3D Bald Man Model',
      model: 'Nano Banana 2',
      icon: <div className="w-3 h-3 rounded-sm border border-white/50 bg-black/40" />,
      imageUrl: 'https://images.unsplash.com/photo-1620953158097-3f3f2258aaad?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  },
  {
    id: '4',
    type: 'imageNode',
    position: { x: 850, y: -50 },
    data: {
      title: 'Video',
      model: 'Kling 3.0 Standard',
      icon: <Play className="w-3 h-3" />,
      imageUrl: 'https://images.unsplash.com/photo-1620953158097-3f3f2258aaad?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      isVideo: true
    }
  },
  {
    id: '5',
    type: 'imageNode',
    position: { x: 450, y: 150 },
    data: {
      title: 'Image',
      model: 'Nano Banana 2',
      icon: <div className="w-3 h-3 rounded-sm border border-white/50 bg-black/40" />,
      imageUrl: 'https://images.unsplash.com/photo-1620953158097-3f3f2258aaad?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  },
  {
    id: '6',
    type: 'imageNode',
    position: { x: 850, y: 150 },
    data: {
      title: 'Video 1',
      model: 'Kling 3.0 Standard',
      icon: <Play className="w-3 h-3" />,
      imageUrl: 'https://images.unsplash.com/photo-1620953158097-3f3f2258aaad?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      isVideo: true
    }
  },
  {
    id: '7',
    type: 'imageNode',
    position: { x: 450, y: 350 },
    data: {
      title: 'Dark Mode Editing',
      model: 'Nano Banana 2',
      icon: <div className="w-3 h-3 rounded-sm border border-white/50 bg-black/40" />,
      imageUrl: 'https://images.unsplash.com/photo-1620953158097-3f3f2258aaad?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      darken: true
    }
  },
  {
    id: '8',
    type: 'imageNode',
    position: { x: 850, y: 350 },
    data: {
      title: 'Video 2',
      model: 'Kling 3.0 Standard',
      icon: <Play className="w-3 h-3" />,
      imageUrl: 'https://images.unsplash.com/photo-1620953158097-3f3f2258aaad?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      darken: true,
      isVideo: true
    }
  },
  {
    id: 'text-1',
    type: 'textNode',
    position: { x: 1250, y: 0 },
    data: {
      title: 'Claude Sonnet 4.6',
      icon: <MessageSquare className="w-3 h-3" />,
      content: 'Solid feedback — here\'s the updated prompt built around your new reference image and fixes:\n\nLow-poly 3D male avatar with a mustache, short facial stubble, bald head, and sharp geometric faceted skin texture. The avatar is captured chest-up against a clean neutral light gray background, camera locked off.\n\nThe starting pose is NOT a neutral straight-on position — the head begins already mid-groove, tilted very slightly to one side with a faint downward lean, as if caught in the middle of a continuous sway. This prevents any sense of a "reset" moment in the loop.\n\nThe animation is an extremely subtle, continuous funk-groove head bob — a slow, hypnotic sinusoidal sway.'
    }
  }
];

const initialEdges = [
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', animated: false, style: { stroke: '#ffffff30', strokeWidth: 1.5 } },
  { id: 'e1-5', source: '1', target: '5', type: 'smoothstep', animated: false, style: { stroke: '#ffffff30', strokeWidth: 1.5 } },
  { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', animated: true, style: { stroke: '#ffffff50', strokeWidth: 1.5 } },
  { id: 'e5-6', source: '5', target: '6', type: 'smoothstep', animated: true, style: { stroke: '#ffffff50', strokeWidth: 1.5 } },
  { id: 'e2-7', source: '2', target: '7', type: 'smoothstep', animated: false, style: { stroke: '#ffffff30', strokeWidth: 1.5 } },
  { id: 'e7-8', source: '7', target: '8', type: 'smoothstep', animated: true, style: { stroke: '#ffffff50', strokeWidth: 1.5 } },
  { id: 'e8-t1', source: '8', target: 'text-1', type: 'smoothstep', animated: false, style: { stroke: '#ffffff30', strokeWidth: 1.5 } },
  { id: 'e4-t1', source: '4', target: 'text-1', type: 'smoothstep', animated: false, style: { stroke: '#ffffff30', strokeWidth: 1.5 } }
];

export const FloraAppView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', style: { stroke: '#ffffff50', strokeWidth: 1.5 } }, eds)), [setEdges]);

  React.useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const handleGesture = (e: Event) => {
      e.preventDefault();
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      // Non-standard but effective for preventing browser pinch-zoom on macOS/Safari
      (container as any).addEventListener('gesturestart', handleGesture, { passive: false });
      (container as any).addEventListener('gesturechange', handleGesture, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
        (container as any).removeEventListener('gesturestart', handleGesture);
        (container as any).removeEventListener('gesturechange', handleGesture);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#0f0f0f] relative overflow-hidden flex flex-col font-sans touch-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 50, y: 150, zoom: 0.8 }}
        className="bg-[#0f0f0f]"
        minZoom={0.1}
        maxZoom={2}
        panOnScroll={true}
        selectionOnDrag={true}
        panOnDrag={true}
        priority={true}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#ffffff30', strokeWidth: 1.5 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#ffffff20" />
      </ReactFlow>

      {/* Floating Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1e1e1e]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 flex items-center gap-6 text-white/80 shadow-2xl z-10">
        <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
          <span className="font-semibold text-sm">Seedance 2.0</span>
          <ChevronDown className="w-4 h-4 text-white/50" />
        </div>
        
        <div className="w-[1px] h-4 bg-white/20" />
        
        <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
          <span className="font-semibold text-sm">16:9</span>
          <ChevronDown className="w-4 h-4 text-white/50" />
        </div>
        
        <div className="w-[1px] h-4 bg-white/20" />
        
        <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
          <div className="w-4 h-4 border border-current rounded flex items-center justify-center">
            <span className="text-[10px]">+</span>
          </div>
          <span className="font-semibold text-sm">Tools</span>
          <ChevronDown className="w-4 h-4 text-white/50" />
        </div>

        <div className="w-[1px] h-4 bg-white/20" />

        <div className="flex items-center gap-5">
          <Bookmark className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 cursor-pointer hover:text-white transition-colors">
            <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" />
          </svg>
          <Download className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
          <Maximize2 className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
};

const ChevronDown = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

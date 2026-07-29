import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Hat3DViewerProps {
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const Hat3DViewer: React.FC<Hat3DViewerProps> = ({ onContextMenu }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOrbiting, setIsOrbiting] = useState<boolean>(false);

  // References for Three.js scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cubeMeshRef = useRef<THREE.Mesh | null>(null);

  // Camera Orbit State
  const orbitState = useRef({
    azimuth: Math.PI * 0.25, // 45 deg
    polar: Math.PI * 0.35,   // ~63 deg from top
    distance: 3.5,
    target: new THREE.Vector3(0, 0, 0),
    isDragging: false,
    startX: 0,
    startY: 0,
    startAzimuth: 0,
    startPolar: 0,
    hasMoved: false,
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent canvas so original gradient background shows through
    sceneRef.current = scene;

    // 2. Camera
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    cameraRef.current = camera;

    const { azimuth, polar, distance, target } = orbitState.current;
    camera.position.set(
      target.x + distance * Math.sin(polar) * Math.sin(azimuth),
      target.y + distance * Math.cos(polar),
      target.z + distance * Math.sin(polar) * Math.cos(azimuth)
    );
    camera.lookAt(target);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;

    // 4. Lights
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd4e8ff, 0.8);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambLight);

    // 5. Basic Cube
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0x2b3a4a,
      roughness: 0.3,
      metalness: 0.2,
    });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.position.set(0, 0, 0);
    cubeMesh.castShadow = true;
    cubeMesh.receiveShadow = true;
    scene.add(cubeMesh);
    cubeMeshRef.current = cubeMesh;

    // Subtle edge highlight on cube
    const edges = new THREE.EdgesGeometry(cubeGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, linewidth: 1 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    cubeMesh.add(wireframe);

    // 6. 3D Floor Grid & Shadow Plane
    const gridHelper = new THREE.GridHelper(30, 60, 0x555555, 0x888888);
    gridHelper.position.y = -0.501;
    if (gridHelper.material instanceof THREE.Material) {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.4;
    }
    scene.add(gridHelper);

    const shadowPlaneGeo = new THREE.PlaneGeometry(30, 30);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.2 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.502;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // 6. Animation Loop
    let animationFrameId: number;
    const renderLoop = () => {
      if (cameraRef.current) {
        const { azimuth, polar, distance, target } = orbitState.current;
        cameraRef.current.position.set(
          target.x + distance * Math.sin(polar) * Math.sin(azimuth),
          target.y + distance * Math.cos(polar),
          target.z + distance * Math.sin(polar) * Math.cos(azimuth)
        );
        cameraRef.current.lookAt(target);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    // 7. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // --- Orbit Control Handlers (Right-click or Left-click drag) ---
  const handlePointerDown = (e: React.PointerEvent) => {
    const state = orbitState.current;
    state.isDragging = true;
    state.startX = e.clientX;
    state.startY = e.clientY;
    state.startAzimuth = state.azimuth;
    state.startPolar = state.polar;
    state.hasMoved = false;

    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
    setIsOrbiting(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const state = orbitState.current;
    if (!state.isDragging) return;

    const deltaX = e.clientX - state.startX;
    const deltaY = e.clientY - state.startY;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      state.hasMoved = true;
    }

    const sensitivity = 0.006;
    state.azimuth = state.startAzimuth - deltaX * sensitivity;
    
    const minPolar = 0.05;
    const maxPolar = Math.PI - 0.05;
    state.polar = Math.min(maxPolar, Math.max(minPolar, state.startPolar - deltaY * sensitivity));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const state = orbitState.current;
    state.isDragging = false;
    setIsOrbiting(false);

    if (containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const state = orbitState.current;
    const zoomFactor = e.deltaY * 0.002;
    state.distance = Math.min(8.0, Math.max(1.2, state.distance + zoomFactor));
  };

  const handleContextMenuInternal = (e: React.MouseEvent) => {
    if (orbitState.current.hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onContextMenu) {
      onContextMenu(e);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none touch-none ${
        isOrbiting ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenuInternal}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-10" />
    </div>
  );
};

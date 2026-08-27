import React, { useState, useRef } from 'react';
import { useAppData } from '../context/AppDataContext';
import { AcousticNode, GeoZone, PolygonPoint } from '../types';
import { ACOUSTIC_NODES } from '../data/mockData';
import { useNavigate } from 'react-router-dom';

interface MapCanvasProps {
  onSelectNode?: (node: AcousticNode) => void;
  selectedNodeId?: string;
  isDrawingMode?: boolean;
  onToggleDrawingMode?: (active: boolean) => void;
  showZones?: boolean;
  center?: { lat: number; lng: number };
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  onSelectNode,
  selectedNodeId,
  isDrawingMode = false,
  onToggleDrawingMode,
  showZones = true,
}) => {
  const { zones, setDraftPolygon } = useAppData();
  const navigate = useNavigate();

  const [mapLayer, setMapLayer] = useState<'dark' | 'satellite' | 'street'>('dark');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [drawnPoints, setDrawnPoints] = useState<PolygonPoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click on map to add vertex in drawing mode
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingMode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setDrawnPoints((prev) => [...prev, { x, y }]);
  };

  const handleClearDrawing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDrawnPoints([]);
  };

  const handleSaveDrawnZone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (drawnPoints.length < 3) return;
    setDraftPolygon(drawnPoints);
    if (onToggleDrawingMode) onToggleDrawingMode(false);
    navigate('/zones');
  };

  // Convert points array to SVG polygon string
  const pointsToSvgString = (points: PolygonPoint[]) => {
    return points.map((p) => `${p.x}%,${p.y}%`).join(' ');
  };

  return (
    <div
      ref={containerRef}
      onClick={handleMapClick}
      className={`relative w-full h-full min-h-[460px] bg-[#030712] overflow-hidden rounded-2xl border border-cyan-500/20 shadow-2xl select-none ${
        isDrawingMode ? 'cursor-crosshair' : 'cursor-default'
      }`}
    >
      {/* Background Map Imagery based on selected layer */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage:
            mapLayer === 'satellite'
              ? `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCf7a5KlvXZxltykyDzgPjf3yDpOGr876biU8_9UIdLrNa9b2EeqSb3wVdK0Lf6Y_LwIwwZQ11Hft41t-EIX4DK9fy29bbY2oYFq1gsmqDXlf1pnDM3UBcem2HLa4jwi9-4AnbAEHBu3aiaJYJMq-N4GRp5aj15Em8VNHm81Q6CaQEUMvV376a4Wc-kw6BVJLcYYAt9DNrTW8AEaL6bbZ7f5Rw7dxGpA7A-Fu8BGpsUuIN4-7CBow4')`
              : mapLayer === 'street'
              ? `radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)`
              : `radial-gradient(circle at 50% 50%, #0b1120 0%, #030712 100%)`,
          filter: mapLayer === 'satellite' ? 'brightness(0.45) contrast(1.3)' : 'none',
        }}
      />

      {/* Street Grid Overlay Lines for Dark & Street views */}
      {mapLayer !== 'satellite' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {/* Acoustic Heatmap Glow Overlay */}
      {showHeatmap && (
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen">
          <div className="absolute top-[28%] left-[32%] w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/50 to-transparent blur-3xl" />
          <div className="absolute top-[50%] left-[62%] w-72 h-72 rounded-full bg-gradient-to-r from-rose-500/60 to-transparent blur-3xl animate-pulse" />
          <div className="absolute top-[42%] left-[45%] w-80 h-80 rounded-full bg-gradient-to-r from-amber-500/40 to-transparent blur-3xl" />
        </div>
      )}

      {/* SVG Polygons & Radar Grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        {/* Render Saved Zones Polygons */}
        {showZones &&
          zones.map((zone, idx) => {
            const defaultCoords: PolygonPoint[] =
              idx === 0
                ? [{ x: 15, y: 22 }, { x: 42, y: 16 }, { x: 46, y: 44 }, { x: 18, y: 48 }]
                : idx === 1
                ? [{ x: 54, y: 48 }, { x: 86, y: 42 }, { x: 92, y: 78 }, { x: 58, y: 84 }]
                : idx === 2
                ? [{ x: 62, y: 15 }, { x: 88, y: 18 }, { x: 85, y: 38 }, { x: 58, y: 36 }]
                : [{ x: 22, y: 55 }, { x: 48, y: 52 }, { x: 50, y: 82 }, { x: 24, y: 85 }];

            const polyPoints = zone.polygon && zone.polygon.length > 2 ? zone.polygon : defaultCoords;
            const pointsStr = pointsToSvgString(polyPoints);

            return (
              <g key={zone.id}>
                <polygon
                  points={pointsStr}
                  fill={zone.color ? `${zone.color}22` : 'rgba(34, 211, 238, 0.15)'}
                  stroke={zone.color || '#22d3ee'}
                  strokeWidth="1.5"
                  strokeDasharray={zone.status === 'inactive' ? '4 4' : 'none'}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

        {/* Live Drawn Polygon */}
        {drawnPoints.length > 1 && (
          <g>
            <polygon
              points={pointsToSvgString(drawnPoints)}
              fill="rgba(34, 211, 238, 0.25)"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeDasharray="4 2"
              className="animate-pulse"
            />
          </g>
        )}
      </svg>

      {/* Drawn Vertices Handles in Drawing Mode */}
      {isDrawingMode &&
        drawnPoints.map((pt, i) => (
          <div
            key={i}
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 border-2 border-white shadow-lg z-20 pointer-events-none"
          />
        ))}

      {/* Sensor Node Pins */}
      {ACOUSTIC_NODES.map((node, index) => {
        const positions = [
          { top: '35%', left: '32%' },
          { top: '56%', left: '68%' },
          { top: '48%', left: '46%' },
          { top: '65%', left: '26%' },
        ];
        const pos = positions[index % positions.length];
        const isSelected = selectedNodeId === node.id;

        return (
          <div
            key={node.id}
            style={{ top: pos.top, left: pos.left }}
            onClick={(e) => {
              e.stopPropagation();
              if (onSelectNode) onSelectNode(node);
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
          >
            {/* Pulsing Radar Ring */}
            <div
              className={`absolute -inset-3 rounded-full animate-ping pointer-events-none opacity-40 ${
                node.currentDb > 85
                  ? 'bg-rose-500'
                  : node.currentDb > 70
                  ? 'bg-amber-400'
                  : 'bg-cyan-400'
              }`}
              style={{ animationDuration: node.currentDb > 85 ? '1.5s' : '3s' }}
            />

            {/* Pin Badge */}
            <div
              className={`relative px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-xl font-mono text-[11px] font-bold border transition-all ${
                isSelected
                  ? 'bg-cyan-400 text-slate-950 border-white ring-2 ring-cyan-400/50 scale-110'
                  : node.currentDb > 85
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500/50'
                  : node.currentDb > 70
                  ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900/90 text-cyan-300 border-cyan-500/40'
              }`}
            >
              <span className="material-symbols-outlined text-xs">sensors</span>
              <span>{node.currentDb} dB</span>
            </div>

            {/* Tooltip on Hover */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block bg-black/90 text-[10px] font-mono text-slate-200 px-2 py-1 rounded border border-white/10 whitespace-nowrap pointer-events-none z-30 shadow-xl">
              {node.name} • {node.location}
            </div>
          </div>
        );
      })}

      {/* Top-Right Floating Controls (Layer Toggle & Heatmap) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-xl border border-cyan-500/30 z-20 shadow-xl">
        <button
          onClick={() => setMapLayer('dark')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase transition-colors cursor-pointer ${
            mapLayer === 'dark' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Dark
        </button>
        <button
          onClick={() => setMapLayer('satellite')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase transition-colors cursor-pointer ${
            mapLayer === 'satellite' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapLayer('street')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase transition-colors cursor-pointer ${
            mapLayer === 'street' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Street
        </button>
        <div className="w-px h-4 bg-white/15 mx-0.5" />
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          title="Toggle Acoustic Sound Heatmap"
          className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
            showHeatmap ? 'text-cyan-300 bg-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-xs">local_fire_department</span>
          Heat
        </button>
      </div>

      {/* Floating Freehand Pen Drawing Action Bar */}
      {isDrawingMode && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-cyan-500/50 shadow-2xl flex items-center gap-3 z-30 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-base animate-pulse">edit_location_alt</span>
            <span className="text-xs font-mono text-cyan-300">
              Drawing Geofence: {drawnPoints.length} Points ({drawnPoints.length < 3 ? 'Min 3 needed' : 'Ready'})
            </span>
          </div>
          <button
            onClick={handleClearDrawing}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-[10px] font-mono text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={handleSaveDrawnZone}
            disabled={drawnPoints.length < 3}
            className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-mono font-bold text-xs flex items-center gap-1 transition-colors shadow-md cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            Save Zone
          </button>
          {onToggleDrawingMode && (
            <button
              onClick={() => onToggleDrawingMode(false)}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

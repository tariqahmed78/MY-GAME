import React from 'react';
import { CreatureDefinition, ArrowDirection } from '../types';
import { getAdaptedCreatureColors } from '../creatures';

interface CreatureEntityProps {
  creature: CreatureDefinition;
  x: number;
  y: number;
  direction: ArrowDirection;
  cellSize: number;
  bgHex: string;
  isMoving?: boolean;
  isWarping?: boolean;
  warpProgress?: number; // 0 to 1 during black-hole suction
  scale?: number;
}

export const CreatureEntity: React.FC<CreatureEntityProps> = ({
  creature,
  x,
  y,
  direction,
  cellSize,
  bgHex,
  isMoving = false,
  isWarping = false,
  warpProgress = 0,
  scale = 1,
}) => {
  const colors = getAdaptedCreatureColors(creature, bgHex);

  // Direction to angle mapping
  let angle = 0;
  switch (direction) {
    case 'RIGHT':
      angle = 0;
      break;
    case 'DOWN':
      angle = 90;
      break;
    case 'LEFT':
      angle = 180;
      break;
    case 'UP':
      angle = 270;
      break;
  }

  // Size calculations: responsive based on cell size
  const r = cellSize * 0.44 * scale;

  // Warp animation transforms (spiraling scale collapse)
  const currentScale = isWarping ? Math.max(0.01, 1 - warpProgress) : 1;
  const warpSpin = isWarping ? warpProgress * 720 : 0;

  return (
    <g
      id={`creature-entity-${creature.id}`}
      transform={`translate(${x}, ${y}) rotate(${angle + warpSpin}) scale(${currentScale})`}
      style={{
        transition: isWarping ? 'none' : 'transform 0.1s ease-out',
        filter: colors.filter,
      }}
    >
      {/* 1. Ambient Bioluminescent Glow Aura */}
      <circle
        cx="0"
        cy="0"
        r={r * 1.25}
        fill={colors.glow}
        opacity={isWarping ? 0.9 : colors.isDarkBg ? 0.35 : 0.15}
        className="animate-pulse"
      />

      {/* 2. Locomotion Type Specific Morphing Entity */}
      {creature.locomotionType === 'slither' && (
        <g id="creature-slither">
          {/* Undulating Serpentine Tail Segments */}
          <path
            d={`M -${r * 1.3} 0 Q -${r * 0.9} ${isMoving ? r * 0.4 : r * 0.15}, -${r * 0.5} 0 T 0 0`}
            fill="none"
            stroke={colors.secondary}
            strokeWidth={r * 0.55}
            strokeLinecap="round"
          />
          <path
            d={`M -${r * 1.3} 0 Q -${r * 0.9} ${isMoving ? r * 0.4 : r * 0.15}, -${r * 0.5} 0 T 0 0`}
            fill="none"
            stroke={colors.primary}
            strokeWidth={r * 0.38}
            strokeLinecap="round"
          />

          {/* Reptilian Diamond Scaled Head */}
          <path
            d={`M 0 -${r * 0.45} L ${r * 0.85} 0 L 0 ${r * 0.45} L -${r * 0.25} 0 Z`}
            fill={colors.primary}
            stroke={colors.outline}
            strokeWidth="1.2"
          />

          {/* Scale Ridge Details */}
          <line x1="-2" y1="-3" x2="3" y2="0" stroke={colors.secondary} strokeWidth="1.2" />
          <line x1="-2" y1="3" x2="3" y2="0" stroke={colors.secondary} strokeWidth="1.2" />

          {/* Flicking Forked Tongue */}
          <path
            d={`M ${r * 0.85} 0 L ${r * 1.25} 0 M ${r * 1.25} 0 L ${r * 1.45} -${r * 0.18} M ${r * 1.25} 0 L ${r * 1.45} ${r * 0.18}`}
            stroke="#EF4444"
            strokeWidth="1.2"
            strokeLinecap="round"
            className={isMoving ? 'animate-pulse' : ''}
          />

          {/* Glowing Slit Eyes */}
          <ellipse cx={r * 0.25} cy={-r * 0.22} rx="2" ry="1.2" fill={colors.glow} />
          <ellipse cx={r * 0.25} cy={r * 0.22} rx="2" ry="1.2" fill={colors.glow} />
          <circle cx={r * 0.25} cy={-r * 0.22} r="0.6" fill="#000" />
          <circle cx={r * 0.25} cy={r * 0.22} r="0.6" fill="#000" />
        </g>
      )}

      {creature.locomotionType === 'crawl' && (
        <g id="creature-crawl">
          {/* Splayed Animated Reptile/Scarab Limbs */}
          <g stroke={colors.secondary} strokeWidth="2.2" strokeLinecap="round">
            {/* Front legs */}
            <line
              x1={r * 0.2}
              y1={-r * 0.3}
              x2={r * 0.6}
              y2={isMoving ? -r * 0.8 : -r * 0.65}
            />
            <line
              x1={r * 0.2}
              y1={r * 0.3}
              x2={r * 0.6}
              y2={isMoving ? r * 0.65 : r * 0.8}
            />
            {/* Middle legs */}
            <line x1="-1" y1={-r * 0.4} x2="-4" y2={-r * 0.75} />
            <line x1="-1" y1={r * 0.4} x2="-4" y2={r * 0.75} />
            {/* Rear legs */}
            <line
              x1={-r * 0.4}
              y1={-r * 0.3}
              x2={-r * 0.8}
              y2={isMoving ? -r * 0.65 : -r * 0.8}
            />
            <line
              x1={-r * 0.4}
              y1={r * 0.3}
              x2={-r * 0.8}
              y2={isMoving ? r * 0.8 : r * 0.65}
            />
          </g>

          {/* Chitin/Carapace Torso */}
          <ellipse
            cx="-2"
            cy="0"
            rx={r * 0.6}
            ry={r * 0.45}
            fill={colors.primary}
            stroke={colors.outline}
            strokeWidth="1.2"
          />

          {/* Head Capsule with Pincers/Snout */}
          <path
            d={`M ${r * 0.35} -${r * 0.25} Q ${r * 0.85} 0, ${r * 0.35} ${r * 0.25} Z`}
            fill={colors.secondary}
            stroke={colors.outline}
            strokeWidth="1"
          />

          {/* Carapace Center Seam & Glyphs */}
          <line x1={-r * 0.55} y1="0" x2={r * 0.3} y2="0" stroke={colors.outline} strokeWidth="1" />
          <circle cx="-2" cy="0" r={r * 0.18} fill={colors.glow} opacity="0.8" />

          {/* Eyes */}
          <circle cx={r * 0.42} cy={-r * 0.16} r="1.6" fill={colors.glow} />
          <circle cx={r * 0.42} cy={r * 0.16} r="1.6" fill={colors.glow} />
        </g>
      )}

      {creature.locomotionType === 'flutter' && (
        <g id="creature-flutter">
          {/* Fluttering Butterfly / Insect Wings */}
          {/* Left Wing (Upper & Lower Lobes) */}
          <g>
            <path
              d={`M -2 -${r * 0.15} C -${r * 0.4} -${r * 0.95}, ${r * 0.6} -${r * 1.1}, ${r * 0.3} -${r * 0.15} Z`}
              fill={colors.primary}
              fillOpacity="0.85"
              stroke={colors.outline}
              strokeWidth="1.2"
              className={isMoving ? 'animate-pulse' : ''}
            />
            <path
              d={`M -4 -${r * 0.1} C -${r * 0.7} -${r * 0.6}, -${r * 0.1} -${r * 0.7}, -2 0 Z`}
              fill={colors.secondary}
              fillOpacity="0.75"
              stroke={colors.outline}
              strokeWidth="1"
            />
          </g>

          {/* Right Wing (Upper & Lower Lobes) */}
          <g>
            <path
              d={`M -2 ${r * 0.15} C -${r * 0.4} ${r * 0.95}, ${r * 0.6} ${r * 1.1}, ${r * 0.3} ${r * 0.15} Z`}
              fill={colors.primary}
              fillOpacity="0.85"
              stroke={colors.outline}
              strokeWidth="1.2"
              className={isMoving ? 'animate-pulse' : ''}
            />
            <path
              d={`M -4 ${r * 0.1} C -${r * 0.7} ${r * 0.6}, -${r * 0.1} ${r * 0.7}, -2 0 Z`}
              fill={colors.secondary}
              fillOpacity="0.75"
              stroke={colors.outline}
              strokeWidth="1"
            />
          </g>

          {/* Elongated Slender Body */}
          <ellipse
            cx="0"
            cy="0"
            rx={r * 0.65}
            ry={r * 0.16}
            fill={colors.secondary}
            stroke={colors.outline}
            strokeWidth="1"
          />

          {/* Bioluminescent Abdomen Tail Bulb */}
          <circle cx={-r * 0.55} cy="0" r={r * 0.22} fill={colors.glow} className="animate-ping opacity-60" />
          <circle cx={-r * 0.55} cy="0" r={r * 0.22} fill={colors.glow} />

          {/* Feathery Antennae */}
          <path
            d={`M ${r * 0.55} -2 Q ${r * 0.85} -${r * 0.35}, ${r * 1.1} -${r * 0.5}`}
            fill="none"
            stroke={colors.glow}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d={`M ${r * 0.55} 2 Q ${r * 0.85} ${r * 0.35}, ${r * 1.1} ${r * 0.5}`}
            fill="none"
            stroke={colors.glow}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </g>
      )}

      {(creature.locomotionType === 'glide' || creature.locomotionType === 'hover') && (
        <g id="creature-ethereal">
          {/* Ethereal Undulating Ray/Avian Mantle Wings */}
          <path
            d={`M ${r * 0.75} 0 C ${r * 0.2} -${r * 1.05}, -${r * 0.6} -${r * 0.95}, -${r * 0.45} 0 C -${r * 0.6} ${r * 0.95}, ${r * 0.2} ${r * 1.05}, ${r * 0.75} 0 Z`}
            fill={colors.primary}
            fillOpacity="0.82"
            stroke={colors.outline}
            strokeWidth="1.2"
          />

          {/* Inner Radiant Feather/Mantle Veins */}
          <path
            d={`M ${r * 0.5} 0 Q 0 -${r * 0.55}, -${r * 0.3} 0 Q 0 ${r * 0.55}, ${r * 0.5} 0 Z`}
            fill={colors.secondary}
            opacity="0.9"
          />

          {/* Orbiting Celestial Plasma Satellite Orbs */}
          <circle cx={-r * 0.2} cy={-r * 0.65} r="2.2" fill={colors.glow} className="animate-bounce" />
          <circle cx={-r * 0.2} cy={r * 0.65} r="2.2" fill={colors.glow} className="animate-bounce" />

          {/* Star Core Singularity Nucleus */}
          <circle cx="0" cy="0" r={r * 0.28} fill="#FFFFFF" stroke={colors.glow} strokeWidth="1.5" />
          <circle cx="0" cy="0" r={r * 0.15} fill={colors.primary} />

          {/* Trailing Filament Streams */}
          <path
            d={`M -${r * 0.45} 0 Q -${r * 0.95} -${r * 0.25}, -${r * 1.4} 0`}
            fill="none"
            stroke={colors.glow}
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="2 2"
          />
        </g>
      )}

      {/* 3. Directional Heading Indicator Bevel (Micro-Chevron) */}
      <polygon
        points={`${r * 0.7},0 ${r * 0.4},-${r * 0.18} ${r * 0.48},0 ${r * 0.4},${r * 0.18}`}
        fill="#FFFFFF"
        opacity="0.9"
      />
    </g>
  );
};

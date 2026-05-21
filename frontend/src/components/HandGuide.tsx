import React from 'react';
import { FINGER_COLORS } from '../utils/KeyboardLayout';
import type { FingerType } from '../utils/KeyboardLayout';

interface HandGuideProps {
  hand: 'left' | 'right';
  activeFinger: FingerType | '';
  status?: 'none' | 'correct' | 'error';
}

// Minimalistic clean vector colors
const SKIN_BASE   = '#f3d9c6';
const SKIN_SHADOW = '#e2c2a9';
const OUTLINE     = '#b8947a';
const CREASE      = '#d4b096';

const HandGuide: React.FC<HandGuideProps> = ({ hand, activeFinger, status = 'none' }) => {
  const isLeft = hand === 'left';

  const isFingerActive = (f: FingerType): boolean => activeFinger === f;

  const getFingerColor = (f: FingerType): string => {
    if (activeFinger === f) {
      if (status === 'correct') return '#22c55e'; // Green
      if (status === 'error')   return '#ef4444'; // Red
      return FINGER_COLORS[f]; // Default active zone color
    }
    return SKIN_BASE;
  };

  const getNailColor = (f: FingerType): string => {
    if (activeFinger === f) return '#ffffff';
    return '#d4d4d8'; // Simple gray color
  };

  /* ─── Finger Component ─── */
  const Finger = ({
    x, topY, w, h, angle = 0, pivotX, pivotY,
    nail, tiltedNailRx, tiltedNailRy,
  }: {
    x: number; topY: number; w: number; h: number;
    angle?: number; pivotX?: number; pivotY?: number;
    nail: FingerType;
    tiltedNailRx?: number; tiltedNailRy?: number;
  }) => {
    const px = pivotX ?? x;
    const py = pivotY ?? (topY + h);
    const hw = w / 2;
    const nrx = tiltedNailRx ?? hw * 0.72;
    const nry = tiltedNailRy ?? hw * 0.95;
    
    const active = isFingerActive(nail);
    // If active, finger moves down slightly and gets colored
    const activeTransform = active ? `translate(0, 8)` : '';
    const baseColor = active ? getFingerColor(nail) : SKIN_BASE;
    const strokeColor = active ? getFingerColor(nail) : OUTLINE;

    return (
      <g 
        transform={`rotate(${angle},${px},${py}) ${activeTransform}`} 
        style={{ transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {/* Finger body */}
        <rect x={x - hw} y={topY} width={w} height={h} rx={hw}
          fill={baseColor} stroke={strokeColor} strokeWidth="2.5" />
        
        {/* Shadow side */}
        <rect x={x - hw} y={topY + h * 0.45} width={hw * 0.55} height={h * 0.55} rx={hw * 0.55}
          fill={active ? 'rgba(0,0,0,0.1)' : SKIN_SHADOW} />
        
        {/* Knuckle crease 1 */}
        <path d={`M ${x - hw + 4} ${topY + h * 0.45} Q ${x} ${topY + h * 0.48} ${x + hw - 4} ${topY + h * 0.45}`}
          fill="none" stroke={active ? 'rgba(255,255,255,0.4)' : CREASE} strokeWidth="1.5" />
          
        {/* Knuckle crease 2 */}
        <path d={`M ${x - hw + 4} ${topY + h * 0.65} Q ${x} ${topY + h * 0.68} ${x + hw - 4} ${topY + h * 0.65}`}
          fill="none" stroke={active ? 'rgba(255,255,255,0.4)' : CREASE} strokeWidth="1.5" />
          
        {/* Nail */}
        <ellipse cx={x} cy={topY + nry + 5} rx={nrx} ry={nry}
          fill={getNailColor(nail)} opacity={active ? 1 : 0.6} />
      </g>
    );
  };

  /* ─── LEFT HAND ─── */
  if (isLeft) return (
    <svg viewBox="0 0 240 330" width="240" height="330" style={{ overflow: 'visible' }}>
      {/* Wrist */}
      <rect x="65" y="252" width="100" height="75" rx="22"
        fill={SKIN_BASE} stroke={OUTLINE} strokeWidth="2.5" />
      <rect x="65" y="252" width="50" height="75" rx="22" fill={SKIN_SHADOW} opacity="0.6"/>

      {/* Palm */}
      <ellipse cx="115" cy="220" rx="80" ry="60"
        fill={SKIN_BASE} stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="90" cy="230" rx="45" ry="40" fill={SKIN_SHADOW} />

      {/* Fingers */}
      <Finger x={40}  topY={68}  w={30} h={152} angle={-5}  pivotX={40}  pivotY={220} nail="left-pinky"  />
      <Finger x={75}  topY={42}  w={32} h={178} angle={-2}  pivotX={75}  pivotY={220} nail="left-ring"   />
      <Finger x={115} topY={22}  w={35} h={198} angle={0}   pivotX={115} pivotY={220} nail="left-middle" />
      <Finger x={155} topY={44}  w={32} h={178} angle={3}   pivotX={155} pivotY={220} nail="left-index"  />

      {/* Thumb */}
      <g 
        transform={`rotate(-22,170,195) ${isFingerActive('thumb') ? 'translate(-8, 5)' : ''}`} 
        style={{ transition: 'all 0.2s ease' }}
      >
        <rect x="160" y="175" width="70" height="36" rx="18"
          fill={isFingerActive('thumb') ? getFingerColor('thumb') : SKIN_BASE} 
          stroke={isFingerActive('thumb') ? getFingerColor('thumb') : OUTLINE} strokeWidth="2.5" />
        <rect x="160" y="190" width="70" height="21" rx="12" fill={isFingerActive('thumb') ? 'rgba(0,0,0,0.1)' : SKIN_SHADOW} opacity="0.6"/>
        <ellipse cx="215" cy="193" rx="17" ry="12"
          fill={getNailColor('thumb')} opacity={isFingerActive('thumb') ? 1 : 0.6} />
      </g>
    </svg>
  );

  /* ─── RIGHT HAND ─── */
  return (
    <svg viewBox="0 0 240 330" width="240" height="330" style={{ overflow: 'visible' }}>
      {/* Wrist */}
      <rect x="75" y="252" width="100" height="75" rx="22"
        fill={SKIN_BASE} stroke={OUTLINE} strokeWidth="2.5" />
      <rect x="125" y="252" width="50" height="75" rx="22" fill={SKIN_SHADOW} opacity="0.6"/>

      {/* Palm */}
      <ellipse cx="125" cy="220" rx="80" ry="60"
        fill={SKIN_BASE} stroke={OUTLINE} strokeWidth="2.5" />
      <ellipse cx="150" cy="230" rx="45" ry="40" fill={SKIN_SHADOW} />

      {/* Thumb (left side, angled left) */}
      <g 
        transform={`rotate(22,70,195) ${isFingerActive('thumb') ? 'translate(8, 5)' : ''}`} 
        style={{ transition: 'all 0.2s ease' }}
      >
        <rect x="10" y="175" width="70" height="36" rx="18"
          fill={isFingerActive('thumb') ? getFingerColor('thumb') : SKIN_BASE} 
          stroke={isFingerActive('thumb') ? getFingerColor('thumb') : OUTLINE} strokeWidth="2.5" />
        <rect x="10" y="190" width="70" height="21" rx="12" fill={isFingerActive('thumb') ? 'rgba(0,0,0,0.1)' : SKIN_SHADOW} opacity="0.6"/>
        <ellipse cx="25" cy="193" rx="17" ry="12"
          fill={getNailColor('thumb')} opacity={isFingerActive('thumb') ? 1 : 0.6} />
      </g>

      {/* Fingers */}
      <Finger x={85}  topY={44}  w={32} h={178} angle={-3}  pivotX={85}  pivotY={220} nail="right-index"  />
      <Finger x={125} topY={22}  w={35} h={198} angle={0}   pivotX={125} pivotY={220} nail="right-middle" />
      <Finger x={165} topY={42}  w={32} h={178} angle={2}   pivotX={165} pivotY={220} nail="right-ring"   />
      <Finger x={200} topY={68}  w={30} h={152} angle={5}   pivotX={200} pivotY={220} nail="right-pinky"  />
    </svg>
  );
};

export default HandGuide;

import React from 'react';
import { KEYBOARD_ROWS } from '../utils/KeyboardLayout';
import type { KeyConfig } from '../utils/KeyboardLayout';

interface VirtualKeyboardProps {
  activeKey: string;
  pressedKeys?: Set<string>;
}

const isModifier = (label: string) =>
  ['Tab','Caps','Shift','Ctrl','Win','Alt','Fn','Menu','←','Enter','\\'].includes(label);

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ activeKey, pressedKeys = new Set() }) => {
  const getKeyState = (key: KeyConfig) => {
    const isTarget =
      activeKey.toLowerCase() === key.label.toLowerCase() ||
      (activeKey === ' ' && key.code === 'Space');
    const isPressed = Array.from(pressedKeys).some(
      pk => pk.toLowerCase() === key.label.toLowerCase() || (pk === ' ' && key.code === 'Space')
    );
    return { isTarget, isPressed };
  };

  const getKeyStyle = (key: KeyConfig, isTarget: boolean, isPressed: boolean): React.CSSProperties => {
    const mod = isModifier(key.label) || key.label === 'Space';
    const base = mod ? '#929290' : '#d2d2ce';
    const textColor = mod ? '#f0f0ee' : (isTarget ? '#fff' : '#444440');

    if (isTarget) {
      return {
        width: key.width || '62px',
        height: '58px',
        borderRadius: '10px',
        background: 'linear-gradient(145deg, #4f9cf9, #2563eb)',
        boxShadow: '0 0 18px rgba(59,130,246,0.85), 0 0 36px rgba(59,130,246,0.4), 3px 3px 8px rgba(0,0,0,0.3)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: key.label.length > 3 ? '14px' : '22px',
        fontWeight: '700',
        cursor: 'default',
        userSelect: 'none',
        transform: 'translateY(-2px) scale(1.06)',
        transition: 'all 0.12s cubic-bezier(0.34,1.56,0.64,1)',
        flexShrink: 0,
        letterSpacing: '0.02em',
        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
      };
    }

    if (isPressed) {
      return {
        width: key.width || '62px',
        height: '58px',
        borderRadius: '10px',
        background: `linear-gradient(145deg, ${shadeColor(base, -15)}, ${base})`,
        boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.25), inset -1px -1px 3px rgba(255,255,255,0.15)',
        color: textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: key.label.length > 3 ? '14px' : '22px',
        fontWeight: '700',
        cursor: 'default',
        userSelect: 'none',
        transform: 'translateY(2px) scale(0.97)',
        transition: 'all 0.08s ease',
        flexShrink: 0,
        letterSpacing: '0.02em',
      };
    }

    return {
      width: key.width || '62px',
      height: '58px',
      borderRadius: '10px',
      background: `linear-gradient(145deg, ${shadeColor(base, 10)}, ${shadeColor(base, -8)})`,
      boxShadow: `4px 4px 10px rgba(0,0,0,0.22), -2px -2px 6px rgba(255,255,255,0.5)`,
      color: textColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: key.label.length > 3 ? '14px' : '22px',
      fontWeight: '600',
      cursor: 'default',
      userSelect: 'none',
      transform: 'none',
      transition: 'all 0.12s ease',
      flexShrink: 0,
      letterSpacing: '0.02em',
    };
  };

  return (
    <div
      style={{
        background: 'linear-gradient(160deg, #bcbcb8 0%, #a4a4a0 100%)',
        borderRadius: '24px',
        padding: '22px 24px 28px',
        boxShadow:
          '12px 12px 30px rgba(0,0,0,0.35), -5px -5px 14px rgba(255,255,255,0.5), inset 0 2px 1px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.12)',
        border: '1px solid rgba(200,200,196,0.7)',
        display: 'inline-block',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', gap: '7px', justifyContent: 'center' }}>
            {row.map(key => {
              const { isTarget, isPressed } = getKeyState(key);
              return (
                <div key={key.code} style={getKeyStyle(key, isTarget, isPressed)}>
                  {key.label === 'Space' ? '' : key.label}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

function shadeColor(hex: string, pct: number): string {
  // supports rgb(...) strings too
  if (hex.startsWith('rgb')) return hex;
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (n >> 16) + pct * 2.5));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + pct * 2.5));
  const b = Math.min(255, Math.max(0, (n & 0xff) + pct * 2.5));
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

export default VirtualKeyboard;

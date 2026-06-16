/**
 * Modal for choosing a profile avatar — either a preset illustrated avatar
 * (generated via DiceBear) or a custom uploaded photo.
 */

import React, { useEffect, useRef } from 'react';

/** Seeds used to generate the preset avatar grid via DiceBear avataaars. */
const PRESET_SEEDS = [
  'felix', 'aneka', 'max', 'sofia', 'james', 'maya',
  'alex', 'priya', 'sam', 'zoe', 'kai', 'emma',
  'luca', 'nina', 'omar', 'chloe', 'dante', 'yuki',
  'river', 'jade',
];

/** Build a DiceBear avataaars SVG URL for a given seed. */
export function dicebearUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&radius=50`;
}

/**
 * Returns a stable default avatar URL derived from a user's name or id
 * so every user always gets a unique but consistent avatar.
 */
export function defaultAvatarForUser(nameOrId: string): string {
  return dicebearUrl(nameOrId || 'user');
}

interface AvatarPickerProps {
  currentAvatar: string;
  busy: boolean;
  onSelect: (url: string) => void;
  onUploadClick: () => void;
  onClose: () => void;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({
  currentAvatar,
  busy,
  onSelect,
  onUploadClick,
  onClose,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);

  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choose profile avatar"
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto border border-white/60">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-900 text-lg tracking-tight">Choose Avatar</h2>
            <p className="text-xs text-gray-500 mt-0.5">Pick an illustrated avatar or upload your own photo</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-600 font-bold text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Preset grid */}
        <div className="p-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Illustrated Avatars</p>
          <div className="grid grid-cols-5 gap-3">
            {PRESET_SEEDS.map((seed) => {
              const url = dicebearUrl(seed);
              const isActive = currentAvatar === url;
              return (
                <button
                  key={seed}
                  type="button"
                  onClick={() => { onSelect(url); onClose(); }}
                  disabled={busy}
                  aria-label={`Avatar style ${seed}`}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5500] ${
                    isActive
                      ? 'border-[#FF5500] shadow-md scale-105'
                      : 'border-transparent hover:border-[#FF5500]/50 hover:scale-105'
                  }`}
                >
                  <img
                    src={url}
                    alt={seed}
                    className="w-full h-full object-cover bg-gray-100"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>

          {/* Upload option */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Custom Photo</p>
            <button
              type="button"
              onClick={() => { onUploadClick(); onClose(); }}
              disabled={busy}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#FF5500] hover:bg-orange-50/50 transition-all flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#FF5500]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload a photo from your device
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarPicker;

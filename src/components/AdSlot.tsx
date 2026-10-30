import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AdPlacement, AdvertisementConfig } from '../types';
import { fetchAdvertisements, DEFAULT_ADSENSE_PUBLISHER } from '../services/cmsService';
import { ExternalLink } from 'lucide-react';

interface AdSlotProps {
  placement?: AdPlacement;
  slotId?: string;
  format?: 'banner' | 'rectangle' | 'horizontal';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export const AdSlot: React.FC<AdSlotProps> = ({
  placement,
  slotId: explicitSlotId,
  format = 'banner',
  className = '',
}) => {
  const { t } = useLanguage();
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);
  const [adConfig, setAdConfig] = useState<AdvertisementConfig | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (placement) {
      fetchAdvertisements().then((ads) => {
        const found = ads.find((a) => a.placement === placement);
        if (found) {
          setAdConfig(found);
        }
        setLoaded(true);
      });
    } else {
      setLoaded(true);
    }
  }, [placement]);

  // If ad is explicitly disabled by admin, hide completely
  if (adConfig && !adConfig.active) {
    return null;
  }

  const effectiveType = adConfig?.type || 'adsense';
  const effectiveSlotId = adConfig?.adSenseSlot || explicitSlotId;

  // Push AdSense
  useEffect(() => {
    if (effectiveSlotId && !pushedRef.current && effectiveType === 'adsense') {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          window.adsbygoogle.push({});
          pushedRef.current = true;
        }
      } catch (err) {
        console.warn('AdSense push error:', err);
      }
    }
  }, [effectiveSlotId, effectiveType]);

  return (
    <div
      className={`my-6 p-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-center transition-all ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
        <span className="uppercase tracking-wider font-semibold text-[10px] text-slate-500">
          {t('advertisement') || 'Advertisement'}
        </span>
        <span className="text-[10px] text-slate-400">
          {t('sponsored') || 'Sponsored'}
        </span>
      </div>

      {/* 1. Custom Image Banner */}
      {effectiveType === 'custom_banner' && adConfig?.bannerImageUrl && (
        <a
          href={adConfig.targetUrl || '#'}
          target={adConfig.openInNewTab ? '_blank' : '_self'}
          rel="noopener noreferrer"
          className="block overflow-hidden rounded-xl group relative"
        >
          <img
            src={adConfig.bannerImageUrl}
            alt={adConfig.altText || adConfig.title || 'Sponsored Advertisement'}
            className="w-full max-h-48 object-cover rounded-xl group-hover:opacity-95 transition-opacity"
          />
          {adConfig.targetUrl && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Visit Sponsor</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </div>
          )}
        </a>
      )}

      {/* 2. HTML Embed Code */}
      {effectiveType === 'html_code' && adConfig?.htmlContent && (
        <div
          dangerouslySetInnerHTML={{ __html: adConfig.htmlContent }}
          className="overflow-hidden min-h-[60px]"
        />
      )}

      {/* 3. Google AdSense Unit */}
      {effectiveType === 'adsense' && effectiveSlotId && (
        <div className="overflow-hidden min-h-[90px] flex justify-center items-center">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={DEFAULT_ADSENSE_PUBLISHER}
            data-ad-slot={effectiveSlotId}
            data-ad-format={format === 'rectangle' ? 'rectangle' : 'auto'}
            data-full-width-responsive="true"
          />
        </div>
      )}

      {/* 4. Fallback Placeholder */}
      {(!effectiveSlotId || effectiveType === 'adsense') && !adConfig?.bannerImageUrl && !adConfig?.htmlContent && (
        <div
          className={`flex items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs ${
            format === 'rectangle' ? 'h-64' : 'h-24 sm:h-28'
          }`}
        >
          <div className="flex flex-col items-center gap-1.5 p-4">
            <div className="w-6 h-6 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 text-[10px] font-bold">
              Ad
            </div>
            <span className="text-xs text-slate-400 font-medium">Responsive Ad Placement</span>
            <span className="text-[10px] text-slate-500 max-w-xs font-mono">
              Publisher: {DEFAULT_ADSENSE_PUBLISHER}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

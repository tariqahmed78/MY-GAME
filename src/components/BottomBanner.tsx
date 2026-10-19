import React from 'react';
import { ThemeConfig } from '../types';

interface BottomBannerProps {
  subtitle: string;
  theme: ThemeConfig;
  remainingCount: number;
  totalCount: number;
}

export const BottomBanner: React.FC<BottomBannerProps> = ({
  subtitle,
  theme,
  remainingCount,
  totalCount,
}) => {
  return (
    <div className="w-full px-4 pb-4 pt-2 select-none flex flex-col items-center">
      {/* Progress pill */}
      <div className="mb-2 text-xs font-semibold tracking-wider uppercase opacity-70" style={{ color: theme.topBarText }}>
        {totalCount - remainingCount} / {totalCount} Escaped
      </div>

      {/* Main Bottom Banner exactly matching the screenshots */}
      <div
        id="bottom-mission-banner"
        className="w-full max-w-md py-4 px-6 rounded-2xl flex items-center justify-center transition-colors duration-200"
        style={{
          backgroundColor: theme.bannerBg,
          boxShadow: `0 4px 14px ${theme.shadow}`,
        }}
      >
        <span
          className="text-2xl sm:text-3xl font-extrabold tracking-normal text-center"
          style={{
            color: theme.bannerText,
            fontFamily: 'ui-rounded, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {subtitle}
        </span>
      </div>
    </div>
  );
};

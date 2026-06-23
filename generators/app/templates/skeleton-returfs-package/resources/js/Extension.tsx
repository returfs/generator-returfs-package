import React, { memo, StrictMode } from 'react';
import {
  ColorKey,
  Entrance,
  PortalSystemProps,
  ResourceSettingsData,
} from '@returfs/shared-external-react';

export default memo(function Extension({
  resourceItem,
  resourceRoute,
  resourceSettings,
  resourceUser,
}: PortalSystemProps) {
  return (
    <StrictMode>
      <Entrance
        themeColor={
          resourceSettings?.[ResourceSettingsData.ThemeColor] as ColorKey
        }
        className="h-screen w-full"
      ></Entrance>
    </StrictMode>
  );
});

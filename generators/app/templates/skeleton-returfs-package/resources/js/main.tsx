import React from 'react';
import { createRoot } from 'react-dom/client';
import Extension from './Extension';
import { ColorKey, ResourceSettingsData } from '@returfs/shared-external-react';

import '@returfs/shared-external-react/dist/index.css';

const resourceRoute =
  'http://project.test/api/dummy/<%= defaultFileExtensions %>';

createRoot(document.getElementById('root')!).render(
  <Extension
    resourceRoute={resourceRoute}
    resourceSettings={{ [ResourceSettingsData.ThemeColor]: ColorKey.Gray }}
  />,
);

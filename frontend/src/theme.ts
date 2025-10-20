// src/theme.ts
import type { ThemeConfig } from 'antd';
import { theme } from 'antd';


const config: ThemeConfig = {
  algorithm: [theme.defaultAlgorithm],
  token: {
    colorPrimary: '#1677ff',
    fontSize: 14,
    borderRadius: 12,
  },
  components: {
    Button: {
      borderRadius: 24,
      controlHeight: 36,
      controlHeightLG: 44,
    },
    Input: {
      borderRadius: 12,
      controlHeight: 40,
      controlHeightLG: 48,
    },
    Table: {
      borderRadius: 16,
    },
  },
};


export default config;

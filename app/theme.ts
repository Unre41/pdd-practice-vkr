import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        ink: { value: '#14263d' },
        muted: { value: '#536579' },
        canvas: { value: '#f4f7fb' },
        line: { value: '#d9e2ec' },
        navy: { value: '#183b63' },
        sky: { value: '#e8f1fa' },
        amber: { value: '#e5a52a' },
        paleAmber: { value: '#fff4db' },
      },
      fonts: {
        body: { value: 'var(--font-manrope), Arial, sans-serif' },
        heading: { value: 'var(--font-manrope), Arial, sans-serif' },
      },
    },
  },
  globalCss: {
    html: { bg: 'canvas', color: 'ink' },
    body: { bg: 'canvas', color: 'ink' },
    '*::selection': { bg: 'paleAmber' },
  },
});

export const system = createSystem(defaultConfig, config);

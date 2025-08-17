'use client';

import { ChakraProvider } from '@chakra-ui/react';
import sitecoreTheme, { toastOptions } from '@sitecore/blok-theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={sitecoreTheme} toastOptions={toastOptions}>
      {children}
    </ChakraProvider>
  );
}
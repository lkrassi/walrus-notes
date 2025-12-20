declare module 'react-syntax-highlighter' {
  import * as React from 'react';

  export const Prism: React.ComponentType<Record<string, unknown>>;
  export const Light: React.ComponentType<Record<string, unknown>>;
  const _default: unknown;
  export default _default;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneLight: Record<string, string>;
  export const oneDark: Record<string, string>;
  const _default: {
    oneLight: Record<string, string>;
    oneDark: Record<string, string>;
  };
  export default _default;
}

declare module 'react-syntax-highlighter/dist/cjs/styles/prism' {
  export const oneLight: Record<string, string>;
  export const oneDark: Record<string, string>;
  const _default: {
    oneLight: Record<string, string>;
    oneDark: Record<string, string>;
  };
  export default _default;
}

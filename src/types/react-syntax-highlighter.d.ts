declare module 'react-syntax-highlighter' {
  import * as React from 'react';

  // Minimal declarations used in this project. Keep types permissive to avoid
  // coupling to specific library types.
  export const Prism: React.ComponentType<any>;
  export const Light: React.ComponentType<any>;
  const _default: any;
  export default _default;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  export const oneLight: any;
  export const oneDark: any;
  const _default: { oneLight: any; oneDark: any };
  export default _default;
}

declare module 'react-syntax-highlighter/dist/cjs/styles/prism' {
  export const oneLight: any;
  export const oneDark: any;
  const _default: { oneLight: any; oneDark: any };
  export default _default;
}

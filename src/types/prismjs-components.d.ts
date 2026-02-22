// Type declarations for dynamic prismjs component imports
// Allows imports like `prismjs/components/prism-<lang>` without TS errors
declare module 'prismjs/components/prism-*';

// Also allow direct common component paths
declare module 'prismjs/components/prism-jsx';
declare module 'prismjs/components/prism-typescript';

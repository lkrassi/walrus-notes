import { CodeBlock } from '../ui/components/markdown/CodeBlock';
import { PreBlock } from '../ui/components/markdown/PreBlock';
import { SafeImage } from '../ui/components/markdown/SafeImage';
import { SafeLink } from '../ui/components/markdown/SafeLink';
import type { Components } from 'react-markdown';

export const markdownComponents: Partial<Components> = {
  code: CodeBlock,
  pre: PreBlock,
  a: SafeLink,
  img: SafeImage,
};

export const allowedMarkdownElements = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'code',
  'pre',
  'hr',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'del',
  'input',
] as const;

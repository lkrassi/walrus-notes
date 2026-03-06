import Highlight, { defaultProps, type Language } from 'prism-react-renderer';
import duotoneDark from 'prism-react-renderer/themes/duotoneDark';
import duotoneLight from 'prism-react-renderer/themes/duotoneLight';
import {
  useContext,
  useEffect,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { cn } from 'shared/lib/cn';
import { ThemeContext } from 'widgets/ui/ThemeProvider';

interface CodeHighlighterProps {
  children: ReactNode;
  className?: string;
}

const prismLoaders: Record<string, () => Promise<unknown>> = {
  tsx: async () => {
    await import('prismjs/components/prism-tsx');
    await import('prismjs/components/prism-jsx');
    await import('prismjs/components/prism-typescript');
  },
  jsx: () => import('prismjs/components/prism-jsx'),
  javascript: () => import('prismjs/components/prism-javascript'),
  typescript: () => import('prismjs/components/prism-typescript'),
  python: () => import('prismjs/components/prism-python'),
  json: () => import('prismjs/components/prism-json'),
  bash: () => import('prismjs/components/prism-bash'),
  css: () => import('prismjs/components/prism-css'),
  markup: () => import('prismjs/components/prism-markup'),
  markdown: () => import('prismjs/components/prism-markdown'),
  c: () => import('prismjs/components/prism-c'),
  cpp: () => import('prismjs/components/prism-cpp'),
  java: () => import('prismjs/components/prism-java'),
};

export const CodeHighlighter: FC<CodeHighlighterProps> = ({
  children,
  className,
}) => {
  const { theme } = useContext(ThemeContext);
  const code =
    typeof children === 'string' ? children.trim() : String(children).trim();
  let language: string | undefined;
  if (className) {
    const match = className.match(/language-([a-zA-Z0-9_+-]+)/);
    if (match) language = match[1];
  }
  const [loaded, setLoaded] = useState(false);
  const langMap: Record<string, string> = {
    tsx: 'tsx',
    jsx: 'jsx',
    js: 'javascript',
    javascript: 'javascript',
    ts: 'typescript',
    typescript: 'typescript',
    py: 'python',
    python: 'python',
    json: 'json',
    bash: 'bash',
    sh: 'bash',
    css: 'css',
    html: 'markup',
    md: 'markdown',
    markdown: 'markdown',
    c: 'c',
    cpp: 'cpp',
    java: 'java',
  };

  useEffect(() => {
    let mounted = true;

    async function loadLang() {
      try {
        if (language && language in langMap) {
          const name = langMap[language] || language;
          const loader = prismLoaders[name];
          if (loader) {
            await loader();
          }
        }
      } catch (_e) {}
      if (mounted) setLoaded(true);
    }

    loadLang();
    return () => {
      mounted = false;
    };
  }, [language]);

  const selectedTheme = theme === 'dark' ? duotoneDark : duotoneLight;

  const prismLanguage: Language = ((language &&
    (langMap[language] || language)) ||
    '') as unknown as Language;

  return (
    <div className={cn('m-0', 'overflow-x-auto', 'rounded-lg', 'relative')}>
      {language && (
        <div
          style={{
            position: 'absolute',
            right: 8,
            top: 8,
            background:
              theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            color: theme === 'dark' ? '#e6edf3' : '#111827',
            padding: '2px 8px',
            borderRadius: 9999,
            fontSize: 12,
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          {language}
        </div>
      )}

      {loaded ? (
        <Highlight
          {...defaultProps}
          code={code}
          language={prismLanguage}
          theme={selectedTheme}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={className}
              style={{
                ...style,
                margin: 0,
                padding: '1rem',
                borderRadius: 8,
                overflowX: 'auto',
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      ) : (
        <div style={{ padding: '1rem' }}>{code}</div>
      )}
    </div>
  );
};

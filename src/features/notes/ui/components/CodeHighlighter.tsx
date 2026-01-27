import { useContext } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneLight,
  oneDark,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from 'shared/lib/cn';
import { ThemeContext } from 'widgets/ui/ThemeProvider';

interface CodeHighlighterProps {
  children: React.ReactNode;
  className?: string;
}
export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({
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
  const style = theme === 'dark' ? oneDark : oneLight;

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
      <SyntaxHighlighter
        style={style}
        language={language}
        showLineNumbers={false}
        PreTag='div'
        customStyle={{ margin: 0, padding: '1rem', borderRadius: 8 }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

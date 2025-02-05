// app/src/components/ui/markdown.jsx
import React from 'react';
import DOMPurify from 'dompurify';
import remarkGfm from 'remark-gfm';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '@/lib/utils';

// Define constants
const EMOJI_STYLES = {
  '🔴': 'text-red-500',
  '🟡': 'text-yellow-500',
  '🟢': 'text-green-500',
  '💡': 'bg-yellow-100 dark:bg-yellow-900 px-1 rounded',
  '✨': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 rounded-full',
};

const ADMONITION_TYPES = {
  info: {
    icon: Info,
    styles:
      'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-950/50 dark:text-blue-200',
  },
  warning: {
    icon: AlertCircle,
    styles:
      'bg-amber-50 border-amber-500 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
  },
  success: {
    icon: CheckCircle2,
    styles:
      'bg-green-50 border-green-500 text-green-800 dark:bg-green-950/50 dark:text-green-200',
  },
};

const MarkdownDisplay = ({
  title,
  content,
  loading = false,
  className = '',
  trusted = false,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copied, setCopied] = React.useState(false);
  const sanitizedContent = React.useMemo(
    () => DOMPurify.sanitize(content),
    [content]
  );
  const markdownComponents = React.useMemo(
    () => ({
      a: ({ href, children }) => (
        <a
          href={href}
          onClick={(e) => {
            // if link is inside the app, open it in the same tab
            if (href.startsWith('/') || href.startsWith('#') || trusted)
              return navigate(href);
            // alert user of outgoing link
            e.preventDefault();
            const confirmed = window.confirm(
              'سيتم توجيهك إلى رابط خارجي. هل تريد المتابعة؟\n' + href
            );
            if (!confirmed) return false;
            window.open(href, '_blank', 'noopener,noreferrer');
            return false;
          }}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            width: 'max-content',
          }}
          className="text-foreground hover:text-purple-400 hover:underline">
          {children}
        </a>
      ),
      h1: ({ children }) => (
        <h1 className="scroll-m-20 bg-gradient-to-l from-purple-600 to-purple-900 bg-clip-text text-right text-4xl font-bold tracking-tight text-transparent">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="mb-4 mt-8 scroll-m-20 border-r-4 border-purple-500 pr-4 text-right text-2xl font-semibold tracking-tight">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="mb-2 mt-6 scroll-m-20 text-right text-xl font-semibold tracking-tight text-purple-600 dark:text-purple-400">
          {children}
        </h3>
      ),
      p: ({ children }) => {
        // Remove this check to allow admonitions to render properly
        return (
          <p className="text-right leading-7 dark:text-slate-300 [&:not(:first-child)]:mt-4">
            {children}
          </p>
        );
      },
      ul: ({ children }) => (
        <ul className="my-6 mr-6 list-none [&>li]:relative [&>li]:pr-6">
          {children}
        </ul>
      ),
      li: ({ children }) => (
        <li className="before:absolute before:right-0 before:text-sm before:text-purple-500 before:content-['◆']">
          {children}
        </li>
      ),
      em: ({ children }) => (
        <em className="not-italic text-primary dark:text-primary">
          {children}
        </em>
      ),
      strong: ({ children }) => {
        const content = React.Children.toArray(children).join('');
        const emoji = Object.keys(EMOJI_STYLES).find((e) =>
          content.startsWith(e)
        );
        if (emoji) {
          return (
            <strong className={cn('font-bold', EMOJI_STYLES[emoji])}>
              {content.slice(emoji.length)}
            </strong>
          );
        }
        return <strong className="font-bold">{children}</strong>;
      },
      // Modify blockquote component:
      blockquote: ({ children }) => {
        const text = React.Children.toArray(children)
          .map((child) => {
            if (typeof child === 'string') return child;
            if (React.isValidElement(child)) {
              const props = child.props;
              if (typeof props.children === 'string') return props.children;
              return React.Children.toArray(props.children)
                .map((c) =>
                  typeof c === 'string'
                    ? c
                    : c.props?.children
                      ? String(c.props.children)
                      : ''
                )
                .join('');
            }
            return '';
          })
          .join('')
          .trim();

        const admonitionMatch = text.match(
          /^\[!(info|warning|success)\]\s*(.*)/s
        );

        if (admonitionMatch) {
          const [, type, content] = admonitionMatch;
          const { icon: Icon, styles } = ADMONITION_TYPES[type];
          return (
            <div className={cn('my-3 flex gap-2 border-r-2 p-3', styles)}>
              <Icon className="h-4 w-4 shrink-0 self-center" />
              <ReactMarkdown
                components={markdownComponents}
                className="text-sm leading-tight [&>p]:m-0">
                {content.trim()}
              </ReactMarkdown>
            </div>
          );
        }

        return (
          <blockquote className="mt-6 border-r-2 border-purple-500 pr-6 italic dark:text-slate-300">
            {children}
          </blockquote>
        );
      },
      code: ({ className, children }) => {
        // Fix inline detection by checking the node type directly
        if (!className)
          return (
            <code className="relative rounded bg-slate-100 px-[0.3rem] py-[0.2rem] font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-300">
              {children}
            </code>
          );

        const match = /language-(\w+)/.exec(className || '');
        const code = String(children).replace(/\n$/, '');
        const language = match ? match[1] : '';

        const copyToClipboard = async () => {
          setCopied({ className, children });
          try {
            await navigator.clipboard.writeText(code);
            toast.success('تم النسخ');
          } catch (error) {
            console.error('Failed to copy:', error);
            toast.error('فشل النسخ');
          } finally {
            setTimeout(() => setCopied(false), 2000);
          }
        };

        return (
          <div
            className={cn(
              'group relative my-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700',
              isDark ? 'bg-slate-900' : 'border border-slate-200 bg-white'
            )}>
            <div
              className={cn(
                'flex items-center justify-between px-4 py-2',
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              )}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                {language && (
                  <span className="ml-2 font-mono text-xs text-slate-400">
                    {language}
                  </span>
                )}
              </div>
              <button
                onClick={copyToClipboard}
                className="rounded p-1 opacity-0 transition-opacity hover:bg-slate-700 group-hover:opacity-100"
                aria-label="Copy code">
                {copied.className === className &&
                copied.children === children ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-400" />
                )}
              </button>
            </div>

            <div className="p-4">
              <SyntaxHighlighter
                language={language}
                style={isDark ? oneDark : oneLight}
                customStyle={{
                  margin: 0,
                  padding: 0,
                  background: 'transparent',
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'monospace',
                  },
                }}
                useInlineStyles={true}>
                {code}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      },
      table: ({ children }) => (
        <div className="my-6 w-full overflow-y-auto">
          <table className="w-full border-collapse border border-slate-400 dark:border-slate-600">
            {children}
          </table>
        </div>
      ),
      th: ({ children }) => (
        <th className="border border-slate-400 bg-slate-100 p-2 text-right dark:border-slate-600 dark:bg-slate-800">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border border-slate-400 p-2 text-right dark:border-slate-600 dark:text-slate-300">
          {children}
        </td>
      ),
    }),
    [copied.children, copied.className, isDark, navigate, trusted] // Add any dependencies affecting component behavior
  );

  if (loading)
    return (
      <div className="flex h-[50vh] items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">جاري التحميل...</span>
      </div>
    );

  // Add PropTypes for children:
  MarkdownDisplay.propTypes = {
    children: PropTypes.node,
  };

  return (
    <div className={cn('space-y-6', className)} dir="rtl">
      {title && (
        <h2 className="scroll-m-20 text-3xl font-bold tracking-tight dark:text-slate-200">
          {title}
        </h2>
      )}
      <div className="markdown-content prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}>
          {trusted ? content : sanitizedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

// Move PropTypes declaration outside the component:
MarkdownDisplay.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string,
  trusted: PropTypes.bool,
  children: PropTypes.node,
};

export default MarkdownDisplay;

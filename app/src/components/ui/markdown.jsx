// app/src/components/ui/markdown.jsx
import React from 'react';
import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';
import remarkGfm from 'remark-gfm';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Input } from './input';
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
} from './select';

// Dynamic imports for syntax highlighting
// import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
const SyntaxHighlighter = React.lazy(() =>
  import('react-syntax-highlighter').then((mod) => ({
    default: mod.Prism,
  }))
);

const themeNames = [
  'a11yDark',
  'atomDark',
  'base16AteliersulphurpoolLight',
  'cb',
  'coldarkCold',
  'coldarkDark',
  'coyWithoutShadows',
  'coy',
  'darcula',
  'dark',
  'dracula',
  'duotoneDark',
  'duotoneEarth',
  'duotoneForest',
  'duotoneLight',
  'duotoneSea',
  'duotoneSpace',
  'funky',
  'ghcolors',
  'gruvboxDark',
  'gruvboxLight',
  'holiTheme',
  'hopscotch',
  'lucario',
  'materialDark',
  'materialLight',
  'materialOceanic',
  'nightOwl',
  'nord',
  'okaidia',
  'oneDark',
  'oneLight',
  'pojoaque',
  'prism',
  'shadesOfPurple',
  'solarizedDarkAtom',
  'solarizedlight',
  'synthwave84',
  'tomorrow',
  'twilight',
  'vs',
  'vscDarkPlus',
  'xonokai',
  'zTouch',
];

// Constants
const EMOJI_STYLES = {
  '🔴': 'text-red-500',
  '🟡': 'text-yellow-500',
  '🟢': 'text-green-500',
  '💡': 'bg-yellow-100 dark:bg-yellow-900 px-1 rounded-sm',
  '✨': 'bg-linear-to-r from-purple-500 to-pink-500 text-white px-2 rounded-full',
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
  const [syntaxTheme, setSyntaxTheme] = React.useState(null);
  const sanitizedContent = React.useMemo(
    () => DOMPurify.sanitize(content),
    [content]
  );
  const randomTheme =
    localStorage.getItem('syntaxSettings.styleTheme') ||
    themeNames[Math.floor(Math.random() * themeNames.length)];
  const [syntaxSettings, setSyntaxSettings] = React.useState({
    showLineNumbers: true,
    styleTheme: randomTheme,
  });
  const [isDropdownOpen, setIsDropdownOpen] = React.useState({
    show: false,
    type: 'onOpenChange',
    code: 'code',
  });

  React.useEffect(() => {
    import('react-syntax-highlighter/dist/esm/styles/prism').then((module) => {
      setSyntaxTheme(module[syntaxSettings.styleTheme]);
    });
  }, [syntaxSettings.styleTheme]);

  const CodeBlock = React.useCallback(
    ({ className, children }) => {
      if (!className)
        return (
          <code className="relative rounded-sm bg-slate-100 px-[0.3rem] py-[0.2rem] font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-300">
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
          tabIndex={0}
          className={cn(
            'group relative my-4 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700',
            isDark ? 'bg-slate-900' : 'bg-white'
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
              <span className="ml-2 font-mono text-xs text-slate-400 group-hover:hidden">
                {language}
              </span>
              <div
                onMouseEnter={() =>
                  setIsDropdownOpen((prev) => {
                    if (prev.type === 'onOpenChange' && prev.show) return prev;
                    return {
                      show: true,
                      type: 'onMouseEnter',
                      code,
                    };
                  })
                }
                onMouseLeave={() =>
                  setIsDropdownOpen((prev) => {
                    if (prev.type !== 'onMouseEnter') return prev;
                    return {
                      show: false,
                      type: 'onMouseLeave',
                      code,
                    };
                  })
                }
                className={cn(
                  'items-center gap-2 space-x-2 group-hover:flex in-focus:flex',
                  isDropdownOpen.show && isDropdownOpen.code === code
                    ? 'flex'
                    : 'hidden'
                )}>
                <Select
                  onOpenChange={(open) =>
                    setIsDropdownOpen(
                      open
                        ? {
                            show: true,
                            type: 'onOpenChange',
                            code,
                          }
                        : {
                            show: false,
                            type: 'onOpenChange',
                            code,
                          }
                    )
                  }
                  value={syntaxSettings.styleTheme}
                  onValueChange={(value) => {
                    setIsDropdownOpen({
                      show: false,
                      type: 'onValueChange',
                      code,
                    });
                    setSyntaxSettings({
                      ...syntaxSettings,
                      styleTheme: value,
                    });
                    localStorage.setItem('syntaxSettings.styleTheme', value);
                  }}>
                  <SelectTrigger className="h-8 py-1 text-sm">
                    <SelectValue placeholder={syntaxSettings.styleTheme.name} />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    <SelectGroup>
                      <SelectLabel>الثيمات</SelectLabel>
                      {themeNames.map((name) => (
                        <SelectItem
                          key={name}
                          value={name}
                          className="py-1 text-sm">
                          {name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Input
                  type="checkbox"
                  className="m-0 mr-2 h-4 w-4"
                  checked={syntaxSettings.showLineNumbers}
                  onChange={(e) =>
                    setSyntaxSettings({
                      ...syntaxSettings,
                      showLineNumbers: e.target.checked,
                    })
                  }
                />
              </div>
            </div>
            <Button
              onClick={copyToClipboard}
              className="h-8 w-8 rounded-sm p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-700 in-focus:opacity-100"
              aria-label="نسخ الكود">
              {copied.className === className &&
              copied.children === children ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-slate-400" />
              )}
            </Button>
          </div>

          <React.Suspense fallback={<div>جاري التحميل منظم للكود...</div>}>
            {syntaxTheme && (
              <div className="overflow-x-auto">
                <SyntaxHighlighter
                  style={syntaxTheme}
                  dir="ltr"
                  language={language}
                  showLineNumbers={syntaxSettings.showLineNumbers}
                  className="min-w-fit p-4 font-mono text-sm"
                  codeTagProps={{
                    style: {
                      fontFamily: 'inherit',
                      whiteSpace: 'pre',
                    },
                  }}
                  lineNumberStyle={{
                    minWidth: '2.25em',
                    paddingRight: '1em',
                    position: 'sticky',
                    left: 0,
                  }}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    minWidth: '100%',
                    width: 'max-content',
                  }}>
                  {code}
                </SyntaxHighlighter>
              </div>
            )}
          </React.Suspense>
        </div>
      );
    },
    [
      copied.children,
      copied.className,
      isDark,
      isDropdownOpen.code,
      isDropdownOpen.show,
      syntaxSettings,
      syntaxTheme,
    ]
  );

  const markdownComponents = React.useMemo(
    () => ({
      img: ({ src, alt }) => <img src={src} alt={alt} className="max-w-full" />,
      a: ({ href, children }) => {
        const handleLinkClick = (e) => {
          e.preventDefault();

          const Ehref = e.currentTarget.getAttribute('href');
          if (!Ehref) return;

          if (Ehref.startsWith('/') || Ehref.startsWith('#') || trusted) {
            navigate(Ehref);
            return;
          }

          const confirmed = window.confirm(
            'سيتم توجيهك إلى رابط خارجي. هل تريد المتابعة؟\n' + Ehref
          );
          if (confirmed) window.open(Ehref, '_blank', 'noopener,noreferrer');
        };

        return (
          <a
            href={href}
            onClick={handleLinkClick}
            style={{
              display: 'inline-block',
              width: 'max-content',
            }}
            className="text-foreground max-w-full hover:text-purple-400 hover:underline">
            {children}
          </a>
        );
      },
      h1: ({ children }) => (
        <h1 className="scroll-m-20 bg-linear-to-l from-purple-600 to-purple-900 bg-clip-text text-right text-4xl font-bold tracking-tight text-transparent">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="mt-8 mb-4 scroll-m-20 border-r-4 border-purple-500 pr-4 text-right text-2xl font-semibold tracking-tight">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="mt-6 mb-2 scroll-m-20 text-right text-xl font-semibold tracking-tight text-purple-600 dark:text-purple-400">
          {children}
        </h3>
      ),
      p: ({ children }) => (
        <p className="text-right leading-7 not-first:mt-4 dark:text-slate-300">
          {children}
        </p>
      ),
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
        <em className="text-primary dark:text-primary not-italic">
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
          const [, type, subContent] = admonitionMatch;
          const { icon: Icon, styles } = ADMONITION_TYPES[type];

          return (
            <div className={cn('my-3 flex gap-2 border-r-2 p-3', styles)}>
              <Icon className="h-4 w-4 shrink-0 self-center" />
              <div className="text-sm leading-tight [&>p]:m-0">
                <ReactMarkdown components={markdownComponents}>
                  {subContent.trim()}
                </ReactMarkdown>
              </div>
            </div>
          );
        }

        return (
          <blockquote className="mt-6 border-r-2 border-purple-500 pr-6 italic dark:text-slate-300">
            {children}
          </blockquote>
        );
      },
      code: CodeBlock,
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
    [CodeBlock, navigate, trusted]
  );

  if (loading)
    return (
      <div className="flex h-[50vh] items-center justify-center" role="status">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">جاري التحميل...</span>
      </div>
    );

  return (
    <div className={cn('space-y-6', className)} dir="rtl">
      {title && (
        <h2 className="scroll-m-20 text-3xl font-bold tracking-tight dark:text-slate-200">
          {title}
        </h2>
      )}
      <div className="markdown-content prose prose-neutral dark:prose-invert max-w-none">
        <React.Suspense fallback={<div>Loading markdown...</div>}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}>
            {trusted ? content : sanitizedContent}
          </ReactMarkdown>
        </React.Suspense>
      </div>
    </div>
  );
};

MarkdownDisplay.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string,
  trusted: PropTypes.bool,
  children: PropTypes.node,
};

export default MarkdownDisplay;

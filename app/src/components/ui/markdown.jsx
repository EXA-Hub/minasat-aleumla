import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

const MarkdownDisplay = ({
  title,
  content,
  loading = false,
  className = '',
}) => {
  const sanitizedContent = React.useMemo(
    () => DOMPurify.sanitize(content),
    [content]
  );

  if (loading) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const components = {
    h1: ({ children }) => (
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight text-right bg-gradient-to-l from-purple-600 to-purple-900 bg-clip-text text-transparent">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight text-right mt-8 mb-4 border-r-4 border-purple-500 pr-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="scroll-m-20 text-xl font-semibold tracking-tight text-right mt-6 mb-2 text-purple-600">
        {children}
      </h3>
    ),
    p: ({ children }) => {
      // Handle special case for admonition content
      if (typeof children === 'string' && children.startsWith('[!')) {
        return null;
      }
      return (
        <p className="leading-7 text-right [&:not(:first-child)]:mt-4">
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
      <li className="before:absolute before:right-0 before:content-['◆'] before:text-purple-500 before:text-sm">
        {children}
      </li>
    ),
    em: ({ children }) => (
      <em className="text-blue-500 not-italic">{children}</em>
    ),
    strong: ({ children }) => {
      if (typeof children === 'string') {
        if (children.startsWith('🔴')) {
          return (
            <strong className="text-red-500 font-bold">
              {children.slice(2)}
            </strong>
          );
        }
        if (children.startsWith('🟡')) {
          return (
            <strong className="text-yellow-500 font-bold">
              {children.slice(2)}
            </strong>
          );
        }
        if (children.startsWith('🟢')) {
          return (
            <strong className="text-green-500 font-bold">
              {children.slice(2)}
            </strong>
          );
        }
        if (children.startsWith('💡')) {
          return (
            <strong className="bg-yellow-100 px-1 rounded font-bold dark:bg-yellow-900">
              {children.slice(2)}
            </strong>
          );
        }
        if (children.startsWith('✨')) {
          return (
            <strong className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 rounded-full font-bold">
              {children.slice(2)}
            </strong>
          );
        }
      }
      return <strong className="font-bold">{children}</strong>;
    },
    blockquote: ({ children }) => {
      // Convert children to string if it's an array of elements
      const childrenText = React.Children.toArray(children)
        .map((child) => {
          if (React.isValidElement(child) && child.props.children) {
            return child.props.children;
          }
          return child;
        })
        .join('');

      // Parse admonition syntax
      if (typeof childrenText === 'string') {
        if (childrenText.startsWith('[!info]')) {
          return (
            <div className="flex gap-3 bg-blue-50 border-r-4 border-blue-500 p-4 my-4 dark:bg-blue-950">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="text-blue-800 dark:text-blue-200">
                {childrenText.replace('[!info]', '').trim()}
              </div>
            </div>
          );
        }
        if (childrenText.startsWith('[!warning]')) {
          return (
            <div className="flex gap-3 bg-amber-50 border-r-4 border-amber-500 p-4 my-4 dark:bg-amber-950">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="text-amber-800 dark:text-amber-200">
                {childrenText.replace('[!warning]', '').trim()}
              </div>
            </div>
          );
        }
        if (childrenText.startsWith('[!success]')) {
          return (
            <div className="flex gap-3 bg-green-50 border-r-4 border-green-500 p-4 my-4 dark:bg-green-950">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <div className="text-green-800 dark:text-green-200">
                {childrenText.replace('[!success]', '').trim()}
              </div>
            </div>
          );
        }
      }

      return (
        <blockquote className="mt-6 border-r-2 border-purple-500 pr-6 italic">
          {children}
        </blockquote>
      );
    },
    code: ({ children }) => (
      <code className="relative rounded bg-slate-100 px-[0.3rem] py-[0.2rem] font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-slate-400">
        {children}
      </code>
    ),
    table: ({ children }) => (
      <div className="my-6 w-full overflow-y-auto">
        <table className="w-full border-collapse border border-slate-400">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-slate-400 bg-slate-100 p-2 text-right dark:bg-slate-800">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-slate-400 p-2 text-right">{children}</td>
    ),
  };

  return (
    <div className={cn('space-y-6', className)} dir="rtl">
      {title && (
        <h2 className="scroll-m-20 text-3xl font-bold tracking-tight">
          {title}
        </h2>
      )}
      <div className="markdown-content prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
          {sanitizedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownDisplay;

import PropTypes from 'prop-types';
MarkdownDisplay.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

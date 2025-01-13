import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';
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
      <h1 className="scroll-m-20 text-4xl font-bold tracking-tight text-right">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight text-right mt-8 mb-4">
        {children}
      </h2>
    ),
    p: ({ children }) => (
      <p className="leading-7 text-right [&:not(:first-child)]:mt-4">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="my-6 mr-6 list-none [&>li]:relative [&>li]:pr-6">
        {children}
      </ul>
    ),
    li: ({ children }) => (
      <li className="before:absolute before:right-0 before:content-['•']">
        {children}
      </li>
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

import PropTypes from 'prop-types';
MarkdownDisplay.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

export default MarkdownDisplay;

import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

const MarkdownDisplay = ({
  title,
  content,
  loading = false,
  className = '',
}) => {
  if (loading)
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <div className={`space-y-6 ${className}`} dir="rtl">
      {title && <h2 className="text-3xl font-bold">{title}</h2>}
      <div className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mb-4 text-right">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mt-4 mb-2 text-right">
                {children}
              </h2>
            ),
            p: ({ children }) => <p className="my-2 text-right">{children}</p>,
            ul: ({ children }) => (
              <ul
                className="my-2 list-inside"
                style={{ paddingRight: '1.5rem', paddingLeft: 0 }}
              >
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li
                className="my-1 relative"
                style={{
                  listStyleType: 'none',
                  paddingRight: '1rem',
                }}
              >
                <span
                  className="absolute right-0"
                  style={{ marginRight: '-1rem' }}
                >
                  •
                </span>
                {children}
              </li>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownDisplay;

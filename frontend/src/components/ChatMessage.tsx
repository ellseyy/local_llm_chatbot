import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Message } from '../types';
import { CopyButton } from './CopyButton';

interface ChatMessageProps {
  message: Message;
}

function extractTableMarkdown(node: any): string {
  if (!node || !node.children) return '';

  const rows: string[][] = [];

  const traverse = (n: any) => {
    if (n.type === 'element' && n.tagName === 'tr') {
      const rowCells: string[] = [];
      n.children.forEach((cell: any) => {
        if (cell.type === 'element' && (cell.tagName === 'th' || cell.tagName === 'td')) {
          // Собираем текст внутри ячейки
          const getText = (childNode: any): string => {
            if (childNode.type === 'text') return childNode.value || '';
            if (childNode.children) return childNode.children.map(getText).join('');
            return '';
          };
          rowCells.push(cell.children.map(getText).join('').trim());
        }
      });
      if (rowCells.length > 0) rows.push(rowCells);
    } else if (n.children) {
      n.children.forEach(traverse);
    }
  };

  traverse(node);

  if (rows.length === 0) return '';

  const header = `| ${rows[0].join(' | ')} |`;
  const separator = `| ${rows[0].map(() => '---').join(' | ')} |`;
  const body = rows.slice(1).map((r) => `| ${r.join(' | ')} |`).join('\n');

  return [header, separator, body].filter(Boolean).join('\n');
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`message-wrapper ${message.role}`}>
      {isAssistant && <span className="message-label">AI</span>}

      <div className="message-bubble">
        {!isAssistant ? (
          message.content
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table({ node, children, ...rest }) {
                const tableMarkdown = extractTableMarkdown(node);

                return (
                  <div className="table-wrapper-container">
                    <div className="table-header">
                      <span className="table-title">Table</span>
                      <CopyButton text={tableMarkdown} label="Copy table" />
                    </div>
                    <div className="table-scroll-box">
                      <table {...rest}>{children}</table>
                    </div>
                  </div>
                );
              },

              // Блоки кода
              code(props: any) {
                const { children, className, node, ...rest } = props;
                const match = /language-(\w+)/.exec(className || '');
                const codeText = String(children).replace(/\n\$/, '');

                return match ? (
                  <div className="code-block-container">
                    <div className="code-header">
                      <span className="code-lang">{match[1]}</span>
                      <CopyButton text={codeText} />
                    </div>
                    <SyntaxHighlighter
                      style={oneLight}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        padding: '16px 20px',
                        background: '#fafafa',
                        fontSize: '13.5px',
                        lineHeight: '1.6',
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      }}
                      {...rest}
                    >
                      {codeText}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="inline-code" {...rest}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      {isAssistant && (
        <div className="message-actions">
          <CopyButton text={message.content} label="Copy response" />
        </div>
      )}
    </div>
  );
}
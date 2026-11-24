'use client';

import React from 'react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export function MarkdownView({ content, className = '' }: MarkdownViewProps) {
  // Parse paragraphs and blocks
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2 space-y-1.5 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-gray-800 dark:text-gray-100 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                <div className="flex-1">{item}</div>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-2 space-y-2 pl-1">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-gray-800 dark:text-gray-100 leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300 dark:border-emerald-700/50">
                  {idx + 1}
                </span>
                <div className="flex-1">{item}</div>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  const formatInlineText = (text: string): React.ReactNode => {
    // Replace **bold** and `code` with styled elements
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchStr = match[0];
      if (matchStr.startsWith('**') && matchStr.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-bold text-gray-900 dark:text-white">
            {matchStr.slice(2, -2)}
          </strong>
        );
      } else if (matchStr.startsWith('`') && matchStr.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-white/10 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-white/10 font-mono text-[11px]"
          >
            {matchStr.slice(1, -1)}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    // Headers: ### Header
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4
          key={`h4-${idx}`}
          className="text-sm font-bold text-gray-900 dark:text-white mt-3 mb-1.5 flex items-center gap-1.5 border-b border-gray-200 dark:border-white/10 pb-1"
        >
          {formatInlineText(line.slice(4))}
        </h4>
      );
      return;
    }

    if (line.startsWith('## ') || line.startsWith('# ')) {
      flushList();
      elements.push(
        <h3
          key={`h3-${idx}`}
          className="text-base font-extrabold text-gray-900 dark:text-white mt-3 mb-2 flex items-center gap-1.5"
        >
          {formatInlineText(line.replace(/^#+\s*/, ''))}
        </h3>
      );
      return;
    }

    // Unordered lists: * or -
    const bulletMatch = line.match(/^[-*•]\s+(.+)/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(formatInlineText(bulletMatch[1]));
      return;
    }

    // Ordered lists: 1. or 1)
    const numberMatch = line.match(/^\d+[.)]\s+(.+)/);
    if (numberMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(formatInlineText(numberMatch[1]));
      return;
    }

    // Standard paragraph line
    flushList();
    elements.push(
      <p key={`p-${idx}`} className="my-1.5 text-gray-800 dark:text-gray-100 leading-relaxed">
        {formatInlineText(line)}
      </p>
    );
  });

  flushList();

  return <div className={`space-y-1 text-xs sm:text-sm text-left ${className}`}>{elements}</div>;
}

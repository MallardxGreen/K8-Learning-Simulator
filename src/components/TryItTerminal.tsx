import { useState, useRef, useEffect } from 'react';
import type { TerminalLine } from '../types';
import type { Lesson } from '../types';

interface TryItTerminalProps {
  lesson: Lesson;
  onCommand: (cmd: string) => { success: boolean; message: string };
}

let lineId = 0;
const mkLine = (type: TerminalLine['type'], text: string): TerminalLine => ({
  id: `line-${lineId++}`, type, text,
});

export default function TryItTerminal({ lesson, onCommand }: TryItTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([
    mkLine('info', `── ${lesson.title} ──`),
    mkLine('info', 'Type kubectl commands here. Try "kubectl help" for a list.\n'),
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLines([
      mkLine('info', `── ${lesson.title} ──`),
      mkLine('info', 'Type kubectl commands here. Try "kubectl help" for a list.\n'),
    ]);
  }, [lesson.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setHistory(prev => [input, ...prev]);
    setHistoryIdx(-1);
    setLines(prev => [...prev, mkLine('input', input)]);

    if (input.trim() === 'clear') {
      setLines([mkLine('info', 'Terminal cleared.\n')]);
      setInput('');
      return;
    }

    const result = onCommand(input);
    setLines(prev => [...prev, mkLine(result.success ? 'output' : 'error', result.message)]);

    if (lesson.expectedCommands && result.success) {
      const normalized = input.trim().replace(/\s+/g, ' ');
      const match = lesson.expectedCommands.some(ec =>
        normalized.startsWith(ec.split(' ').slice(0, 3).join(' '))
      );
      if (match) {
        setLines(prev => [...prev, mkLine('success', '🎉 Nice! Check the diagram to see what you created.')]);
      }
    }

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        const idx = historyIdx + 1;
        setHistoryIdx(idx);
        setInput(history[idx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const idx = historyIdx - 1;
        setHistoryIdx(idx);
        setInput(history[idx]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    }
  };

  const colorFor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'info': return 'text-blue-400';
      case 'success': return 'text-yellow-300';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 overflow-hidden">
      <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2" />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Terminal</span>
        <span className="ml-auto text-xs text-gray-600">kubectl help</span>
      </div>
      <div
        className="flex-1 overflow-y-auto px-4 py-3 font-mono text-sm space-y-1"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map(line => (
          <div key={line.id} className={colorFor(line.type)}>
            {line.type === 'input' ? (
              <span><span className="text-blue-400">$ </span>{line.text}</span>
            ) : (
              <pre className="whitespace-pre-wrap">{line.text}</pre>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center px-4 py-3 bg-gray-900 border-t border-gray-800 flex-shrink-0">
        <span className="text-blue-400 mr-2 font-mono">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-gray-100 font-mono text-sm placeholder-gray-600"
          placeholder={lesson.example || 'kubectl help'}
          spellCheck={false}
        />
      </form>
    </div>
  );
}

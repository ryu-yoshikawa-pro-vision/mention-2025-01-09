import dynamic from 'next/dynamic';
import { useMemo, useEffect, useState, useRef } from 'react';
import MentionDropdown from './MentionDropdown';
import type { Quill } from 'react-quill';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export interface MentionData {
  id: number;
  value: string;
}

const ReactQuill = dynamic(
  () => import('react-quill').then((mod) => mod.default),
  { ssr: false }
);

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const [mentions, setMentions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionData[]>([]);
  const [searchString, setSearchString] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const quillRef = useRef<HTMLDivElement>(null);
  const [quillInstance, setQuillInstance] = useState<Quill | null>(null);

  const mentionData: MentionData[] = [
    { id: 1, value: 'Alice' },
    { id: 2, value: 'Bob' },
    { id: 3, value: 'Charlie' },
  ];

  const modules = useMemo(() => {
    return {
      toolbar: [
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean'],
      ],
    };
  }, []);

  const handleInputChange = (
    content: string,
    delta: any,
    source: string,
    editor: any
  ) => {
    onChange(content);
    setQuillInstance(editor);
    if (source === 'user') {
      const cursorIndex = editor.getSelection()?.index;
      if (cursorIndex) {
        const textBeforeCursor = editor.getText(0, cursorIndex);
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
        if (mentionMatch) {
          setSearchString(mentionMatch[1]);
          const range = editor.getSelection();
          if (range) {
            const bounds = editor.getBounds(range.index);
            setDropdownPosition({
              top: bounds.top + bounds.height,
              left: bounds.left,
            });
            const matchingMentions = mentionData.filter((mention) =>
              mention.value
                .toLowerCase()
                .startsWith(mentionMatch[1].toLowerCase())
            );
            setMentionSuggestions(matchingMentions);
            setShowDropdown(true);
            setSelectedIndex(0);
            return;
          }
        }
      }
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleMentionSelect = (mention: MentionData) => {
    console.log("handleMentionSelect called:", mention);
    if (quillInstance) {
      const cursorIndex = quillInstance.getSelection()?.index;
      console.log("cursorIndex:", cursorIndex);
      if (cursorIndex !== undefined) {
        const textBeforeCursor = quillInstance.getText(0, cursorIndex);
        console.log("textBeforeCursor:", textBeforeCursor);
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
        console.log("mentionMatch:", mentionMatch);
        if (mentionMatch) {
          const mentionIndex = cursorIndex - mentionMatch[0].length;
          console.log("mentionIndex:", mentionIndex);
          quillInstance.deleteText(mentionIndex, mentionMatch[0].length);
          console.log("deleteText executed");
          quillInstance.insertText(mentionIndex, `@${mention.value} `, { bold: true });
          console.log("insertText executed");
          quillInstance.setSelection(mentionIndex + mention.value.length + 2);
          console.log("setSelection executed");
          quillInstance.focus(); // フォーカスをエディタに戻す
          setShowDropdown(false);
          setSelectedIndex(-1);
        }
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (showDropdown) {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : mentionSuggestions.length - 1
        );
        event.preventDefault();
      } else if (event.key === 'ArrowDown') {
        setSelectedIndex((prevIndex) =>
          prevIndex < mentionSuggestions.length - 1 ? prevIndex + 1 : 0
        );
        event.preventDefault();
      } else if (event.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < mentionSuggestions.length) {
          handleMentionSelect(mentionSuggestions[selectedIndex]);
          event.preventDefault();
        }
      } else if (event.key === 'Escape') {
        setShowDropdown(false);
        setSelectedIndex(-1);
        event.preventDefault();
      }
    }
  };

  const extractMentionsFromContent = (htmlContent: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const mentionElements = tempDiv.getElementsByClassName('mention');
    const mentionsList = Array.from(mentionElements)
      .map((element) => {
        const mentionData = element.getAttribute('data-value');
        return mentionData;
      })
      .filter((mention): mention is string => mention !== null);

    return Array.from(new Set(mentionsList)) as string[];
  };

  useEffect(() => {
    const updatedMentions = extractMentionsFromContent(value);
    setMentions(updatedMentions);
  }, [value]);

  return (
    <div onKeyDown={handleKeyDown}>
      <ReactQuill
        ref={(el: ReactQuill | null) => {
          if (el && el.getEditor) {
            quillRef.current = el.getEditor().container;
          }
        }}
        value={value}
        onChange={handleInputChange}
        modules={modules}
        theme="snow"
      />
      {showDropdown && (
        <MentionDropdown
          mentions={mentionSuggestions}
          onSelect={handleMentionSelect}
          top={dropdownPosition.top}
          left={dropdownPosition.left}
          selectedIndex={selectedIndex}
        />
      )}
      <h2>Mentions:</h2>
      <ul>
        {mentions.map((mention) => (
          <li key={mention}>@{mention}</li>
        ))}
      </ul>
    </div>
  );
};

export default Editor;

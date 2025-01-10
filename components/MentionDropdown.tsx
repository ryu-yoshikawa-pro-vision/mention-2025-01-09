import React, { useEffect, useRef } from 'react';
    import { MentionData } from './Editor';

    interface MentionDropdownProps {
      mentions: MentionData[];
      onSelect: (mention: MentionData) => void;
      top: number;
      left: number;
      selectedIndex: number;
    }

    const MentionDropdown: React.FC<MentionDropdownProps> = ({
      mentions,
      onSelect,
      top,
      left,
      selectedIndex,
    }) => {
      const ulRef = useRef<HTMLUListElement>(null);

      useEffect(() => {
        if (ulRef.current && selectedIndex >= 0) {
          const selectedLi = ulRef.current.children[selectedIndex] as HTMLLIElement;
          if (selectedLi) {
            selectedLi.scrollIntoView({ block: 'nearest' });
          }
        }
      }, [selectedIndex]);

      return (
        <ul
          ref={ulRef}
          className="mention-dropdown"
          style={{
            position: 'absolute',
            top,
            left,
            zIndex: 1000,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            listStyle: 'none',
            padding: 0,
            margin: 0,
            overflowY: 'auto',
            maxHeight: '200px',
          }}
        >
          {mentions.map((mention, index) => (
            <li
              key={mention.id}
              onClick={() => {
                console.log("Mention clicked:", mention);
                onSelect(mention);
              }}
              style={{
                cursor: 'pointer',
                padding: '5px 10px',
                backgroundColor: index === selectedIndex ? '#f0f0f0' : 'white',
              }}
            >
              {mention.value}
            </li>
          ))}
        </ul>
      );
    };

    export default MentionDropdown;

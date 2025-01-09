import { useState, useCallback, useEffect } from 'react';
    import Editor from '../components/Editor';

    const Home = () => {
      const [content, setContent] = useState('');
      const [editorMentions, setEditorMentions] = useState<string[]>([]);

      const handleEditorChange = useCallback((newContent: string) => {
        setContent(newContent);
      }, []);

      useEffect(() => {
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

        const updatedMentions = extractMentionsFromContent(content);
        setEditorMentions(updatedMentions);
      }, [content]);

      return (
        <div>
          <h1>ReactQuill with Mention</h1>
          <Editor value={content} onChange={handleEditorChange} />
          <h2>Current Mentions in Editor:</h2>
          <ul>
            {editorMentions.map((mention) => (
              <li key={mention}>@{mention}</li>
            ))}
          </ul>
          <h2>Preview:</h2>
          <div dangerouslySetInnerHTML={{ __html: content }} />
          <h2>Preview Source:</h2>
          <pre>{content}</pre>
        </div>
      );
    };

    export default Home;

'use client'

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { X, FileCode, Package, FileText, Folder } from 'lucide-react';

export default function CodeEditor({ generatedCode, onCodeChange }) {
  const [activeFile, setActiveFile] = useState('App.js');
  const [files, setFiles] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState({});

  useEffect(() => {
    if (generatedCode && generatedCode.files) {
      setFiles(generatedCode.files);
      // Set the first file as active if current active file doesn't exist
      const fileNames = Object.keys(generatedCode.files);
      if (fileNames.length > 0 && !fileNames.includes(activeFile)) {
        setActiveFile(fileNames[0]);
      }
    }
  }, [generatedCode]);

  const handleEditorChange = (value, event) => {
    const updatedFiles = {
      ...files,
      [activeFile]: value
    };
    setFiles(updatedFiles);
    setUnsavedChanges({
      ...unsavedChanges,
      [activeFile]: true
    });

    // Notify parent component of changes
    if (onCodeChange) {
      onCodeChange(activeFile, value, updatedFiles);
    }
  };

  const getFileIcon = (filename) => {
    if (filename.endsWith('.json')) return <Package className="w-4 h-4" />;
    if (filename.endsWith('.md')) return <FileText className="w-4 h-4" />;
    if (filename.includes('/')) return <Folder className="w-4 h-4" />;
    return <FileCode className="w-4 h-4" />;
  };

  const getLanguage = (filename) => {
    if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.md')) return 'markdown';
    if (filename.endsWith('.css')) return 'css';
    return 'javascript';
  };

  const formatFileName = (filename) => {
    // Handle nested files (e.g., screens/MenuScreen.js)
    if (filename.includes('/')) {
      const parts = filename.split('/');
      return parts[parts.length - 1];
    }
    return filename;
  };

  if (!generatedCode || !generatedCode.files) {
    return (
      <div className="h-full bg-gray-900 text-gray-400 flex items-center justify-center">
        <p>No code generated yet. Start by describing your app!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* File Tabs */}
      <div className="bg-gray-800 border-b border-gray-700 flex overflow-x-auto">
        {Object.keys(files).map((filename) => (
          <button
            key={filename}
            onClick={() => setActiveFile(filename)}
            className={`flex items-center gap-2 px-4 py-2 text-sm border-r border-gray-700 hover:bg-gray-700 transition-colors ${
              activeFile === filename 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-400'
            }`}
          >
            {getFileIcon(filename)}
            <span>{formatFileName(filename)}</span>
            {unsavedChanges[filename] && (
              <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
            )}
          </button>
        ))}
      </div>

      {/* File Path */}
      <div className="bg-gray-850 px-4 py-1 text-xs text-gray-500 border-b border-gray-700">
        {activeFile}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(activeFile)}
          value={files[activeFile] || ''}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: false,
            automaticLayout: true,
            wordWrap: 'on',
            wrappingIndent: 'indent',
            folding: true,
            glyphMargin: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'all',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 border-t border-gray-700 px-4 py-1 flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>JavaScript</span>
          <span>UTF-8</span>
          <span>LF</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln {1}, Col {1}</span>
          <span>{Object.keys(files).length} files</span>
        </div>
      </div>
    </div>
  );
} 
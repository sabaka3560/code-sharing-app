'use client'

import React, { useState, useEffect } from 'react';
import { Save, Copy, Edit3, Trash2, Plus, FileText, Eye, Code, Download, Upload } from 'lucide-react';

const CodeSharingApp = () => {
  const [files, setFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  // Load files from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFiles = JSON.parse(localStorage.getItem('codeFiles') || '[]');
      setFiles(savedFiles);
      if (savedFiles.length > 0) {
        setActiveFile(savedFiles[0]);
      }
    }
  }, []);

  // Save files to localStorage whenever files change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('codeFiles', JSON.stringify(files));
    }
  }, [files]);

  const detectLanguage = (code, filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const langMap = {
      'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c', 'cs': 'csharp',
      'php': 'php', 'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'html': 'html',
      'css': 'css', 'sql': 'sql', 'json': 'json', 'xml': 'xml', 'yaml': 'yaml',
      'yml': 'yaml', 'md': 'markdown', 'sh': 'bash', 'ps1': 'powershell'
    };
    
    if (langMap[ext]) return langMap[ext];
    
    // Auto-detect based on content
    if (code.includes('function') && code.includes('{')) return 'javascript';
    if (code.includes('def ') && code.includes(':')) return 'python';
    if (code.includes('public class')) return 'java';
    if (code.includes('#include')) return 'cpp';
    if (code.includes('<?php')) return 'php';
    if (code.includes('<html') || code.includes('<!DOCTYPE')) return 'html';
    if (code.includes('SELECT') || code.includes('FROM')) return 'sql';
    
    return 'plaintext';
  };

  const createNewFile = () => {
    if (!newFileName.trim()) return;
    
    const newFile = {
      id: Date.now(),
      name: newFileName,
      code: '',
      language: detectLanguage('', newFileName),
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    };
    
    setFiles([newFile, ...files]);
    setActiveFile(newFile);
    setNewFileName('');
    setShowNewFileDialog(false);
    setIsEditing(true);
  };

  const saveFile = () => {
    if (!activeFile) return;
    
    const updatedFiles = files.map(file => 
      file.id === activeFile.id 
        ? { ...activeFile, modified: new Date().toISOString() }
        : file
    );
    
    setFiles(updatedFiles);
    setIsEditing(false);
    setCopySuccess('File saved!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const deleteFile = (fileId) => {
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    
    if (activeFile?.id === fileId) {
      setActiveFile(updatedFiles[0] || null);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('Copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  const downloadFile = (file) => {
    const blob = new Blob([file.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const code = e.target.result;
      const newFile = {
        id: Date.now(),
        name: file.name,
        code: code,
        language: detectLanguage(code, file.name),
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
      
      setFiles([newFile, ...files]);
      setActiveFile(newFile);
    };
    reader.readAsText(file);
  };

  const formatCode = (code, language) => {
    // Simple syntax highlighting for common languages
    const keywords = {
      javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export'],
      python: ['def', 'if', 'elif', 'else', 'for', 'while', 'return', 'class', 'import', 'from', 'try', 'except'],
      java: ['public', 'private', 'protected', 'class', 'interface', 'if', 'else', 'for', 'while', 'return', 'import'],
      cpp: ['#include', 'int', 'void', 'char', 'float', 'double', 'if', 'else', 'for', 'while', 'return', 'class']
    };

    let formatted = code;
    
    if (keywords[language]) {
      keywords[language].forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        formatted = formatted.replace(regex, `<span class="text-blue-400 font-semibold">${keyword}</span>`);
      });
    }

    // Highlight strings
    formatted = formatted.replace(/(["'])((?:\\.|(?!\1)[^\\])*?)\1/g, 
      '<span class="text-green-400">$1$2$1</span>');
    
    // Highlight comments
    formatted = formatted.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm, 
      '<span class="text-gray-500 italic">$1</span>');

    return formatted;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400">Code Share</h1>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg cursor-pointer transition-colors">
              <Upload size={16} />
              <span className="text-sm">Upload</span>
              <input type="file" className="hidden" onChange={uploadFile} accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.html,.css,.sql,.json,.xml,.yaml,.yml,.md,.sh,.ps1,.txt" />
            </label>
            <button 
              onClick={() => setShowNewFileDialog(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              <span>New File</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Files ({files.length})</h2>
            {files.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <FileText size={48} className="mx-auto mb-2 opacity-50" />
                <p>No files yet</p>
                <p className="text-sm">Create or upload a file to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {files.map(file => (
                  <div 
                    key={file.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      activeFile?.id === file.id 
                        ? 'bg-blue-900 border-blue-600' 
                        : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    }`}
                    onClick={() => setActiveFile(file)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium truncate">{file.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {file.language} • {new Date(file.modified).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadFile(file);
                          }}
                          className="p-1 hover:bg-gray-600 rounded"
                        >
                          <Download size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteFile(file.id);
                          }}
                          className="p-1 hover:bg-red-600 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {activeFile ? (
            <>
              {/* File Header */}
              <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold">{activeFile.name}</h2>
                    <span className="text-sm text-gray-400">
                      {activeFile.language} • {activeFile.code.length} chars
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setShowPreview(!showPreview)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        showPreview ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {showPreview ? <Eye size={16} /> : <Code size={16} />}
                      <span>{showPreview ? 'Preview' : 'Code'}</span>
                    </button>
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        isEditing ? 'bg-orange-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      <Edit3 size={16} />
                      <span>{isEditing ? 'Editing' : 'Edit'}</span>
                    </button>
                    <button 
                      onClick={() => copyToClipboard(activeFile.code)}
                      className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition-colors"
                    >
                      <Copy size={16} />
                      <span>Copy</span>
                    </button>
                    {isEditing && (
                      <button 
                        onClick={saveFile}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
                      >
                        <Save size={16} />
                        <span>Save</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Code Editor/Preview */}
              <div className="flex-1 overflow-hidden">
                {isEditing ? (
                  <textarea
                    value={activeFile.code}
                    onChange={(e) => setActiveFile({...activeFile, code: e.target.value})}
                    className="w-full h-full p-4 bg-gray-900 text-white font-mono text-sm resize-none outline-none"
                    placeholder="Paste your code here..."
                    spellCheck="false"
                  />
                ) : (
                  <div className="h-full overflow-auto">
                    {showPreview ? (
                      <div className="p-4">
                        <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                          <code 
                            className="text-sm font-mono"
                            dangerouslySetInnerHTML={{
                              __html: formatCode(activeFile.code, activeFile.language)
                            }}
                          />
                        </pre>
                      </div>
                    ) : (
                      <div className="p-4">
                        <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                          <code className="text-sm font-mono text-gray-300">
                            {activeFile.code}
                          </code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FileText size={64} className="mx-auto mb-4 opacity-50" />
                <h2 className="text-2xl font-semibold mb-2">No file selected</h2>
                <p>Select a file from the sidebar or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New File Dialog */}
      {showNewFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New File</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="Enter file name (e.g., main.py, app.js)"
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && createNewFile()}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                onClick={() => setShowNewFileDialog(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={createNewFile}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {copySuccess && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {copySuccess}
        </div>
      )}
    </div>
  );
};

export default CodeSharingApp;

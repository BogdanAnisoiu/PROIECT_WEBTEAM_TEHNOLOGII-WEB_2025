import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';

const FileNode = ({ node }) => {
    return (
        <NodeViewWrapper className="file-attachment-card" style={{
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            padding: '12px',
            margin: '10px 0',
            backgroundColor: '#f9f9f9',
            maxWidth: '400px',
            transition: 'background-color 0.2s'
        }}>
            <a
                href={node.attrs.src}
                target="_blank"
                rel="noopener noreferrer"
                className="file-link"
                style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
                <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    padding: '8px',
                    border: '1px solid #eee',
                    fontSize: '20px'
                }}>
                    📄
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="file-name" style={{ fontWeight: '600', fontSize: '14px' }}>{node.attrs.fileName}</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>Click pentru apasare</span>
                </div>
            </a>
        </NodeViewWrapper>
    );
};

export default FileNode;

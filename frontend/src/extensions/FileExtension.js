import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import FileNode from '../components/FileNode';

export const FileExtension = Node.create({
    name: 'fileAttachment',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            fileName: {
                default: 'Fisier',
            },
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="file-attachment"]',
                getAttrs: dom => {
                    const link = dom.querySelector('a'); // Look for any anchor if class missing
                    // We can be more specific if we save it consistently
                    return {
                        src: dom.getAttribute('data-src') || (link ? link.getAttribute('href') : null),
                        fileName: dom.getAttribute('data-filename') || (link ? link.textContent.trim() : 'Fisier')
                    }
                }
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        // For saving, we want a simple structure that parseHTML can read back
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'file-attachment',
                'data-src': HTMLAttributes.src,
                'data-filename': HTMLAttributes.fileName
            }),
            ['a', { href: HTMLAttributes.src, target: '_blank' }, HTMLAttributes.fileName]
        ]
    },

    addNodeView() {
        return ReactNodeViewRenderer(FileNode);
    },
});

import { Mark, mergeAttributes, InputRule } from '@tiptap/core';

export const KeywordExtension = Mark.create({
    name: 'keyword',

    addOptions() {
        return {
            HTMLAttributes: {
                class: 'etichetaCheie',
            },
        }
    },

    inclusive: false, // Prevent typing from extending the mark

    parseHTML() {
        return [
            {
                tag: 'span.etichetaCheie',
            },
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
    },

    addInputRules() {
        return [
            new InputRule({
                find: /(![\w\u00C0-\u017F]+)\s$/,
                handler: ({ state, range, match }) => {
                    const { tr } = state;
                    const matchStart = range.from;
                    const matchEnd = matchStart + match[1].length;

                    tr.addMark(matchStart, matchEnd, this.type.create());
                    tr.removeStoredMark(this.type);
                },
            }),
        ]
    },

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                const { state, dispatch } = this.editor;
                const { selection } = state;
                const { $from } = selection;

                // Textul dinaintea cursorului
                const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);

                // Regex pentru a găsi ultimul cuvânt dacă începe cu !
                const match = textBefore.match(/(![\w\u00C0-\u017F]+)$/);

                if (match) {
                    const matchEnd = $from.pos;
                    const matchStart = matchEnd - match[1].length;

                    if (dispatch) {
                        const tr = state.tr.addMark(matchStart, matchEnd, this.type.create());
                        tr.removeStoredMark(this.type);
                        dispatch(tr);
                    }
                }

                // Return false pentru a permite comportamentul normal de Enter (linie nouă etc.)
                return false;
            }
        }
    },
});

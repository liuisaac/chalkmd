import { Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "prosemirror-view";

// Helper: Snapshot Scroll Position (to prevent jumping during render)
function getScrollSnapshot(editorView) {
    if (!editorView) return null;
    const root = document.documentElement;
    const body = document.body;

    let editorScroller = null;
    let p = editorView.dom.parentElement;
    while (p) {
        const style = getComputedStyle(p);
        if (style.overflowY === "auto" || style.overflowY === "scroll") {
            editorScroller = p;
            break;
        }
        p = p.parentElement;
    }

    return {
        docElX: root.scrollLeft,
        docElY: root.scrollTop,
        bodyX: body.scrollLeft,
        bodyY: body.scrollTop,
        editorX: editorScroller?.scrollLeft ?? null,
        editorY: editorScroller?.scrollTop ?? null,
        editorScroller,
    };
}

// Helper: Restore Scroll Position
function restoreScroll(snapshot) {
    if (!snapshot) return;
    const root = document.documentElement;
    const body = document.body;

    root.scrollLeft = snapshot.docElX;
    root.scrollTop = snapshot.docElY;
    body.scrollLeft = snapshot.bodyX;
    body.scrollTop = snapshot.bodyY;

    if (snapshot.editorScroller) {
        snapshot.editorScroller.scrollLeft = snapshot.editorX;
        snapshot.editorScroller.scrollTop = snapshot.editorY;
    }
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Parse alignment from separator row (e.g., | :--: | --- | --: |)
function parseAlignment(separator) {
    const cells = separator.split('|').filter(c => c.trim() !== '');
    return cells.map(cell => {
        const trimmed = cell.trim();
        const left = trimmed.startsWith(':');
        const right = trimmed.endsWith(':');
        if (left && right) return 'center';
        if (right) return 'right';
        return 'left';
    });
}

// Check if a line is a valid table row
function isTableRow(line) {
    const trimmed = line.trim();
    return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2;
}

// Check if a line is a separator row
function isSeparatorRow(line) {
    const trimmed = line.trim();
    if (!isTableRow(line)) return false;
    // Separator row contains only |, :, -, and whitespace
    const inner = trimmed.slice(1, -1);
    return /^[\s|:\-]+$/.test(inner) && inner.includes('-');
}

// Parse table rows into cells
function parseRow(line) {
    const trimmed = line.trim();
    // Remove leading and trailing |
    const inner = trimmed.slice(1, -1);
    return inner.split('|').map(cell => cell.trim());
}

// Parse table data for manipulation
function parseTableData(tableText) {
    const lines = tableText.split('\n').filter(l => l.trim() !== '');
    if (lines.length < 2) return null;
    
    let separatorIndex = -1;
    for (let i = 1; i < lines.length; i++) {
        if (isSeparatorRow(lines[i])) {
            separatorIndex = i;
            break;
        }
    }
    
    if (separatorIndex === -1) return null;
    
    const alignments = parseAlignment(lines[separatorIndex]);
    const headerRows = lines.slice(0, separatorIndex).map(parseRow);
    const bodyRows = lines.slice(separatorIndex + 1).filter(isTableRow).map(parseRow);
    
    return { alignments, headerRows, bodyRows, separatorLine: lines[separatorIndex] };
}

// Generate markdown from table data
function generateTableMarkdown(data) {
    const { alignments, headerRows, bodyRows } = data;
    const lines = [];
    
    // Header rows
    for (const row of headerRows) {
        lines.push('| ' + row.join(' | ') + ' |');
    }
    
    // Separator row
    const separatorCells = alignments.map(align => {
        if (align === 'center') return ':---:';
        if (align === 'right') return '---:';
        return '---';
    });
    lines.push('| ' + separatorCells.join(' | ') + ' |');
    
    // Body rows
    for (const row of bodyRows) {
        lines.push('| ' + row.join(' | ') + ' |');
    }
    
    return lines.join('\n') + '\n';
}

// Create the + button element
function createAddButton(isRow, onClick) {
    const btn = document.createElement('button');
    btn.textContent = '+';
    btn.className = isRow ? 'chalk-table-add-row' : 'chalk-table-add-col';
    Object.assign(btn.style, {
        position: 'absolute',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        border: '1px solid #d0d0d0',
        background: '#fff',
        color: '#666',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: '0',
        transition: 'opacity 0.15s ease, background 0.15s ease, border-color 0.15s ease',
        zIndex: '10',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    });
    
    if (isRow) {
        Object.assign(btn.style, {
            bottom: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
        });
    } else {
        Object.assign(btn.style, {
            right: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
        });
    }
    
    btn.addEventListener('mouseenter', () => {
        btn.style.background = '#f0f0f0';
        btn.style.borderColor = '#8250ff';
        btn.style.color = '#8250ff';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.background = '#fff';
        btn.style.borderColor = '#d0d0d0';
        btn.style.color = '#666';
    });
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
    });
    
    return btn;
}

// Update the markdown with new cell value
function updateTableCell(matchStart, matchEnd, data, isHeader, rowIndex, colIndex, newValue) {
    const view = window.__editorView;
    if (!view) return;
    
    const newData = {
        alignments: [...data.alignments],
        headerRows: data.headerRows.map(row => [...row]),
        bodyRows: data.bodyRows.map(row => [...row]),
    };
    
    if (isHeader) {
        newData.headerRows[rowIndex][colIndex] = newValue;
    } else {
        newData.bodyRows[rowIndex][colIndex] = newValue;
    }
    
    const newMarkdown = generateTableMarkdown(newData);
    
    const tr = view.state.tr.replaceWith(
        matchStart,
        matchEnd,
        view.state.schema.text(newMarkdown)
    );
    view.dispatch(tr);
}

// Make a cell editable
function makeEditableCell(cell, data, isHeader, rowIndex, colIndex, matchStart, matchEnd) {
    cell.setAttribute('tabindex', '0');
    
    cell.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Don't re-enter edit mode if already editing
        if (cell.querySelector('input')) return;
        
        const currentText = cell.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        Object.assign(input.style, {
            width: '100%',
            minWidth: '60px',
            border: 'none',
            background: 'transparent',
            font: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            textAlign: cell.style.textAlign || 'left',
            padding: '0',
            margin: '0',
            outline: 'none',
        });
        
        cell.textContent = '';
        cell.appendChild(input);
        input.focus();
        input.select();
        
        const finishEdit = () => {
            const newValue = input.value;
            if (newValue !== currentText) {
                updateTableCell(matchStart, matchEnd, data, isHeader, rowIndex, colIndex, newValue);
            } else {
                cell.textContent = currentText;
            }
        };
        
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                input.blur();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cell.textContent = currentText;
            } else if (e.key === 'Tab') {
                e.preventDefault();
                input.blur();
                // Move to next cell
                const nextCell = e.shiftKey ? cell.previousElementSibling : cell.nextElementSibling;
                if (nextCell) {
                    nextCell.click();
                }
            }
        });
    });
}

// Render a parsed table to HTML element
function renderTableElement(tableText, matchStart, matchEnd) {
    const data = parseTableData(tableText);
    if (!data) return null;
    
    const { alignments, headerRows, bodyRows } = data;
    
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'chalk-table-wrapper';
    wrapper.contentEditable = 'false';
    Object.assign(wrapper.style, {
        position: 'relative',
        display: 'inline-block',
        margin: '12px 0',
        padding: '0 16px 16px 0',
    });
    
    // Create table
    const table = document.createElement('table');
    table.className = 'chalk-table';
    
    // Header
    const thead = document.createElement('thead');
    headerRows.forEach((headerCells, rowIdx) => {
        const tr = document.createElement('tr');
        headerCells.forEach((cellText, colIdx) => {
            const th = document.createElement('th');
            th.style.textAlign = alignments[colIdx] || 'left';
            th.textContent = cellText;
            makeEditableCell(th, data, true, rowIdx, colIdx, matchStart, matchEnd);
            tr.appendChild(th);
        });
        thead.appendChild(tr);
    });
    table.appendChild(thead);
    
    // Body
    if (bodyRows.length > 0) {
        const tbody = document.createElement('tbody');
        bodyRows.forEach((rowCells, rowIdx) => {
            const tr = document.createElement('tr');
            rowCells.forEach((cellText, colIdx) => {
                const td = document.createElement('td');
                td.style.textAlign = alignments[colIdx] || 'left';
                td.textContent = cellText;
                makeEditableCell(td, data, false, rowIdx, colIdx, matchStart, matchEnd);
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
    }
    
    wrapper.appendChild(table);
    
    // Add row button (bottom)
    const addRowBtn = createAddButton(true, () => {
        const view = window.__editorView;
        if (!view) return;
        
        // Add a new row with empty cells
        const newData = { ...data };
        const numCols = alignments.length;
        const newRow = Array(numCols).fill('');
        newData.bodyRows = [...bodyRows, newRow];
        
        const newMarkdown = generateTableMarkdown(newData);
        
        // Replace the table text
        const tr = view.state.tr.replaceWith(
            matchStart,
            matchEnd,
            view.state.schema.text(newMarkdown)
        );
        view.dispatch(tr);
    });
    wrapper.appendChild(addRowBtn);
    
    // Add column button (right)
    const addColBtn = createAddButton(false, () => {
        const view = window.__editorView;
        if (!view) return;
        
        // Add a new column
        const newData = {
            alignments: [...alignments, 'left'],
            headerRows: headerRows.map(row => [...row, '']),
            bodyRows: bodyRows.map(row => [...row, '']),
        };
        
        const newMarkdown = generateTableMarkdown(newData);
        
        // Replace the table text
        const tr = view.state.tr.replaceWith(
            matchStart,
            matchEnd,
            view.state.schema.text(newMarkdown)
        );
        view.dispatch(tr);
    });
    wrapper.appendChild(addColBtn);
    
    // Show buttons on hover
    wrapper.addEventListener('mouseenter', () => {
        addRowBtn.style.opacity = '1';
        addColBtn.style.opacity = '1';
    });
    wrapper.addEventListener('mouseleave', () => {
        addRowBtn.style.opacity = '0';
        addColBtn.style.opacity = '0';
    });
    
    return wrapper;
}

// Match a complete markdown table (header + separator + body rows)
// This regex matches tables that span multiple lines with \n
const TABLE_RE = /^(\|[^\n]+\|\n)(\|[\s:\-|]+\|\n)((?:\|[^\n]+\|\n?)*)/gm;

const pluginKey = new PluginKey("tablePlugin");

export const TableNode = Node.create({
    name: "tableNode",
    group: "inline",
    inline: true,
    atom: true,

    addProseMirrorPlugins() {
        let editorViewRef = null;

        return [
            new Plugin({
                key: pluginKey,

                state: {
                    init(_, { doc }) {
                        return DecorationSet.create(doc, []);
                    },

                    apply(tr, oldDecos, oldState, newState) {
                        const decorations = [];
                        const scrollSnap = editorViewRef ? getScrollSnapshot(editorViewRef) : null;
                        let layoutChanged = false;

                        newState.doc.descendants((node, pos) => {
                            if (!node.isText) return;
                            const text = node.text;
                            if (!text) return;

                            // Reset regex state
                            TABLE_RE.lastIndex = 0;
                            let m;

                            while ((m = TABLE_RE.exec(text)) !== null) {
                                const fullMatch = m[0];
                                const matchStart = pos + m.index;
                                const matchEnd = matchStart + fullMatch.length;

                                // Always hide raw markdown and show rendered table
                                decorations.push(
                                    Decoration.inline(matchStart, matchEnd, { style: "display: none !important" })
                                );
                                layoutChanged = true;

                                // Render table widget
                                const tableElement = renderTableElement(fullMatch, matchStart, matchEnd);

                                if (tableElement) {
                                    decorations.push(Decoration.widget(matchEnd, tableElement, { side: 1 }));
                                }
                            }
                        });

                        if (scrollSnap && layoutChanged) {
                            requestAnimationFrame(() => {
                                requestAnimationFrame(() => {
                                    restoreScroll(scrollSnap);
                                });
                            });
                        }

                        return DecorationSet.create(newState.doc, decorations);
                    },
                },

                props: {
                    decorations(state) {
                        return this.getState(state);
                    },
                },

                view(editorView) {
                    editorViewRef = editorView;
                    editorView.dom.__editorView = editorView;
                    window.__editorView = editorView;
                    return {};
                },
            }),
        ];
    },
});

export default TableNode;

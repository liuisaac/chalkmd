export class HeadingNodeView {
    constructor(node, view, getPos) {
        this.node = node;
        this.view = view;
        this.getPos = getPos;
        
        // Wrapper
        this.dom = document.createElement('div');
        this.dom.style.display = 'flex';
        this.dom.style.alignItems = 'baseline';
        
        // Editable prefix INPUT
        this.prefix = document.createElement('input');
        this.prefix.type = 'text';
        this.prefix.value = '#'.repeat(node.attrs.level) + ' ';
        this.prefix.style.border = 'none';
        this.prefix.style.outline = 'none';
        this.prefix.style.background = 'transparent';
        this.prefix.style.color = '#999';
        this.prefix.style.width = '3em';
        this.prefix.style.fontSize = 'inherit';
        this.prefix.style.fontFamily = 'inherit';
        this.prefix.style.padding = '0';
        
        // Content
        this.heading = document.createElement(`h${node.attrs.level}`);
        this.contentDOM = this.heading;
        this.heading.style.margin = '0';
        this.heading.style.flex = '1';
        
        this.prefix.addEventListener('input', () => {
            const match = this.prefix.value.match(/^(#{1,6})/);
            if (match) {
                const newLevel = match[1].length;
                const pos = this.getPos();
                this.view.dispatch(
                    this.view.state.tr.setNodeMarkup(pos, null, { level: newLevel })
                );
            }
        });
        
        this.dom.appendChild(this.prefix);
        this.dom.appendChild(this.heading);
    }
    
    update(node) {
        if (node.type.name !== 'heading') return false;
        this.node = node;
        this.prefix.value = '#'.repeat(node.attrs.level) + ' ';
        return true;
    }
}
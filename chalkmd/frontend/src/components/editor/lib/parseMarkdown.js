export const parseMarkdown = (text) => {
    if (!text) return "";

    let html = text;

    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
        return `<pre class="bg-gray-800 text-gray-100 p-4 rounded my-3 overflow-x-auto"><code class="text-sm font-mono">${code.trim()}</code></pre>`;
    });

    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold mt-6">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-semibold mt-5 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-6 mb-3">$1</h1>');

    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold">$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');

    html = html.replace(/`([^`]+)`/gim, '<code class="bg-gray-200 text-gray-900 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');

    const lines = html.split("\n");
    let inList = false;
    let result = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const listMatch = line.match(/^- (.+)$/);
        const numberedMatch = line.match(/^\d+\.\s(.+)$/);
        
        if (listMatch) {
            if (!inList) {
                result.push('<ul class="list-disc ml-6 my-2 space-y-1">');
                inList = true;
            }
            result.push(`<li class="text-black text-left">${listMatch[1]}</li>`);
        } else if (numberedMatch) {
            if (!inList) {
                result.push('<ol class="list-decimal ml-6 my-2 space-y-1">');
                inList = 'numbered';
            }
            result.push(`<li class="text-black text-left">${numberedMatch[1]}</li>`);
        } else {
            if (inList) {
                result.push(inList === 'numbered' ? '</ol>' : '</ul>');
                inList = false;
            }
            result.push(line);
        }
    }
    
    if (inList) {
        result.push(inList === 'numbered' ? '</ol>' : '</ul>');
    }

    html = result.join("\n");
    html = html.replace(/\n\n/g, "<div class='my-4'></div>");
    html = html.replace(/\n/g, "<div class='my-0.5'></div>");

    return html;
};
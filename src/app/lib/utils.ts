import {GridFilterModel} from "@mui/x-data-grid-pro";
import {IWebsitePage, IWebsiteTable} from "@/app/actions/websiteActions";
import { parseDocument } from 'htmlparser2';

// Define types for schema and marks
type SchemaNode = {
    type: string;
    text?: string;
    marks?: Mark[];
    attrs?: Record<string, any>;
    content?: SchemaNode[];
};

type Mark = {
    type: string;
    attrs?: Record<string, any>;
};

// Helper functions to convert HTML to Schema
export function convertHtmlToSchema(html: string): { version: number; type: string; content: SchemaNode[] } {
    const document = parseDocument(html);

    function flattenParagraphs(nodes: SchemaNode[]): SchemaNode[] {
        // @ts-ignore
        return nodes.flatMap(node => {
            if (node.type === 'paragraph' && node.content) {
                return node.content.map(contentNode => ({
                    type: 'paragraph',
                    content: [contentNode],
                }));
            }
            return node;
        });
    }

    function traverseDom(node: any): SchemaNode | SchemaNode[] | null {
        if (node.type === 'text') {
            return {
                type: 'paragraph',
                content: [{
                    type: 'text',
                    text: node.data,
                }],
            }
        }

        if (node.type === 'tag') {
            let children = node.children.map(traverseDom).flat().filter(Boolean) as SchemaNode[];

            switch (node.name) {
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    return {
                        type: 'heading',
                        attrs: { level: parseInt(node.name.substring(1)) },
                        content: children,
                    };

                case 'p':
                    // Flatten nested content into individual paragraph nodes
                    return flattenParagraphs([{ type: 'paragraph', content: children }]);

                case 'ul':
                case 'ol':
                    return {
                        type: node.name === 'ul' ? 'bulletList' : 'orderedList',
                        content: children,
                    };

                case 'li':
                    // Ensure list items only have 1 level of depth
                    return {
                        type: 'listItem',
                        content: flattenParagraphs(children),
                    };

                case 'code':
                    return {
                        type: 'codeBlock',
                        content: [{ type: 'text', text: node.children[0]?.data || '' }],
                    };

                case 'blockquote':
                    return {
                        type: 'blockquote',
                        content: children,
                    };

                case 'hr':
                    return { type: 'rule' };

                case 'a':
                    return {
                        type: 'text',
                        text: node.children[0]?.data || '',
                        marks: [
                            {
                                type: 'link',
                                attrs: { href: node.attribs.href },
                            },
                        ],
                    };

                case 'em':
                case 'strong':
                case 's':
                case 'u':
                case 'sub':
                case 'sup':
                case 'span':
                    const markTypeMap: Record<string, string> = {
                        em: 'em',
                        strong: 'strong',
                        s: 'strike',
                        u: 'underline',
                        sub: 'subsup',
                        sup: 'subsup',
                        span: 'textColor',
                    };
                    let markAttrs: Record<string, any>;

                    if (node.name === 'sub' || node.name === 'sup') {
                        markAttrs = {type: node.name};
                    } else if (node.name === 'span' && node.attribs.style) {
                        const colorMatch = node.attribs.style.match(/color:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|[a-zA-Z]+)/);
                        if (colorMatch) {
                            markAttrs = {color :colorMatch[1]};
                        }
                    }

                    return children.map(child => ({
                        ...child,
                        marks: [...(child.marks || []), { type: markTypeMap[node.name], attrs: markAttrs }],
                    }));

                default:
                    return children;
            }
        }

        return null;
    }

    const content = document.children.map(traverseDom).flat().filter(Boolean) as SchemaNode[];
    return { version: 1, type: 'doc', content };
}


// Helper functions to convert Schema to HTML
export function convertSchemaToHtml(schema: { content: SchemaNode[] }): string {
    function traverseSchema(node: SchemaNode): string {
        switch (node.type) {
            case 'heading':
                return `<h${node.attrs?.level}>${node.content?.map(traverseSchema).join('')}</h${node.attrs?.level}>`;

            case 'paragraph':
                return `<p>${node.content?.map(traverseSchema).join('')}</p>`;

            case 'bulletList':
                return `<ul>${node.content?.map(traverseSchema).join('')}</ul>`;

            case 'orderedList':
                return `<ol>${node.content?.map(traverseSchema).join('')}</ol>`;

            case 'listItem':
                return `<li>${node.content?.map(traverseSchema).join('')}</li>`;

            case 'codeBlock':
                return `<code>${node.content?.map(traverseSchema).join('')}</code>`;

            case 'blockquote':
                return `<blockquote>${node.content?.map(traverseSchema).join('')}</blockquote>`;

            case 'rule':
                return `<hr />`;

            case 'text':
                let text = node.text || '';
                if (node.marks) {
                    node.marks.forEach(mark => {
                        switch (mark.type) {
                            case 'em':
                                text = `<em>${text}</em>`;
                                break;
                            case 'strong':
                                text = `<strong>${text}</strong>`;
                                break;
                            case 'strike':
                                text = `<s>${text}</s>`;
                                break;
                            case 'underline':
                                text = `<u>${text}</u>`;
                                break;
                            case 'subsup':
                                text = mark.attrs?.type === 'sub' ? `<sub>${text}</sub>` : `<sup>${text}</sup>`;
                                break;
                            case 'textColor':
                                text = `<span style="color:${mark.attrs?.color}">${text}</span>`;
                                break;
                            case 'link':
                                text = `<a href="${mark.attrs?.href}">${text}</a>`;
                                break;
                        }
                    });
                }
                return text;

            default:
                return '';
        }
    }

    return schema.content.map(traverseSchema).join('');
}

export function filterWebsiteTable(website: IWebsiteTable, filters: GridFilterModel): Boolean {
    let valid = false;
    for(const filter of filters.items) {
        const logicOperator = filters.logicOperator || 'and';
        const val = website[filter.field]?.value || website[filter.field];
        if(filter.operator === 'notEmpty' || filter.operator === 'isNotEmpty') {
            console.log('notEmpty', filter.field, website[filter.field]);
            if (val?.toString() != "" && val?.toString() != 'N/A') {
                valid = true;
            }
            if (logicOperator == 'and' && (val?.toString() == "" || val?.toString() == 'N/A')) {
                valid = false;
                break;
            }
            if (logicOperator == 'or' && (val?.toString() != "" && val?.toString() != 'N/A')) {
                valid = true;
                break;
            }
        }
        if(filter.operator === 'empty' || filter.operator === 'isEmpty') {
            if(val?.toString() == "" || val?.toString() == 'N/A') {
                valid = true;
            }
            if(logicOperator == 'and' && (val?.toString() != "" && val?.toString() != 'N/A')) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && (val?.toString() == "" || val?.toString() == 'N/A')) {
                valid = true;
                break;
            }
        }
        if(!filter.value) continue;
        if(filter.operator === 'contains') {
            if(val?.toString().toLowerCase().includes(filter.value.toString().toLowerCase())) {
                valid = true;
            }
            if(logicOperator == 'and' && !val?.toString().toLowerCase().includes(filter.value.toString().toLowerCase())) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && val?.toString().toLowerCase().includes(filter.value.toString().toLowerCase())) {
                console.log('contains', filter.field, website[filter.field], filter.value.toString().toLowerCase());
                valid = true;
                break;
            }
        }
        if(filter.operator === 'notContains') {
            if(!val?.toString().toLowerCase().includes(filter.value.toString().toLowerCase())) {
                valid = true;
            }
            if(logicOperator == 'and' && val?.toString().toLowerCase().includes(filter.value.toString().toLowerCase())) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && !val?.toString().toLowerCase().includes(filter.value.toString().toLowerCase())) {
                valid = true;
                break;
            }
        }
        if(filter.operator === '=' || filter.operator === 'equals' || filter.operator === 'is') {
            if(val?.toString().toLowerCase() == filter.value.toString().toLowerCase()) {
                valid = true;
            }
            if(logicOperator == 'and' && val?.toString().toLowerCase() != filter.value.toString().toLowerCase()) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && val?.toString().toLowerCase() == filter.value.toString().toLowerCase()) {
                valid = true;
                break;
            }
        }
        if(filter.operator == "startsWith") {
            if(val?.toString().toLowerCase().startsWith(filter.value.toString().toLowerCase())) {
                valid = true;
            }
            if(logicOperator == 'and' && !val?.toString().toLowerCase().startsWith(filter.value.toString().toLowerCase())) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && val?.toString().toLowerCase().startsWith(filter.value.toString().toLowerCase())) {
                valid = true;
                break;
            }
        }
        if(filter.operator == "endsWith") {
            if(val?.toString().toLowerCase().endsWith(filter.value.toString().toLowerCase())) {
                valid = true;
            }
            if(logicOperator == 'and' && !val?.toString().toLowerCase().endsWith(filter.value.toString().toLowerCase())) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && val?.toString().toLowerCase().endsWith(filter.value.toString().toLowerCase())) {
                valid = true;
                break;
            }
        }
        if(filter.operator === '!=' || filter.operator === 'isNot' || filter.operator === 'not') {
            if(val?.toString().toLowerCase() != filter.value.toString().toLowerCase()) {
                valid = true;
            }
            if(logicOperator == 'and' && val?.toString().toLowerCase() == filter.value.toString().toLowerCase()) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && val?.toString().toLowerCase() != filter.value.toString().toLowerCase()) {
                valid = true;
                break;
            }
        }
        if(filter.operator === '>') {
            if(website[filter.field] > filter.value) {
                valid = true;
            }
            if(logicOperator == 'and' && website[filter.field] <= filter.value) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && website[filter.field] > filter.value) {
                valid = true;
                break;
            }
        }
        if(filter.operator === '<') {
            if(website[filter.field] < filter.value) {
                valid = true;
            }
            if(logicOperator == 'and' && website[filter.field] >= filter.value) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && website[filter.field] < filter.value) {
                valid = true;
                break;
            }
        }
        if(filter.operator === '>=') {
            if(website[filter.field] >= filter.value) {
                valid = true;
            }
            if(logicOperator == 'and' && website[filter.field] < filter.value) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && website[filter.field] >= filter.value) {
                valid = true;
                break;
            }
        }
        if(filter.operator === '<=') {
            if(website[filter.field] <= filter.value) {
                valid = true;
            }
            if(logicOperator == 'and' && website[filter.field] > filter.value) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && website[filter.field] <= filter.value) {
                valid = true;
                break;
            }
        }
        if(filter.operator === 'isAnyOf') {
            const filterValuesLower = filter.value.map((v: any) => v.toString().toLowerCase());
            if(filterValuesLower.includes(val?.toString().toLowerCase())) {
                valid = true;
            }
            if(logicOperator == 'and' && !filterValuesLower.includes(val?.toString().toLowerCase())) {
                valid = false;
                break;
            }
            if(logicOperator == 'or' && filterValuesLower.includes(val?.toString().toLowerCase())) {
                valid = true;
                break;
            }
        }
    }
    return valid;
}

export function filterWebsitesPage(website: IWebsitePage, filters: {
    text?: string;
    name?: string;
    type?: string[];
    folder?: string[];
    team?: string[];
    tags?: string[];
    status?: string[];
}): Boolean {
    let valid = true;
    if(filters.text) {
        if(
            website.siteName?.toLowerCase().includes(filters.text.toLowerCase()) ||
            website.siteUrl?.toLowerCase().includes(filters.text.toLowerCase()) ||
            website.frameWorkType?.toLowerCase().includes(filters.text.toLowerCase()) ||
            website.frameWorkUpdateStatus?.toLowerCase().includes(filters.text.toLowerCase()) ||
            website.tags?.join(' ').toLowerCase().includes(filters.text.toLowerCase())
        ) {
            valid = true;
        } else {
            valid = false;
        }
    }
    if(filters.name && website.siteName?.toLowerCase().includes(filters.name.toLowerCase())) {
        valid = true;
    } else if (filters.name && !website.siteName?.toLowerCase().includes(filters.name.toLowerCase())) {
        valid = false;
    }
    if(filters.type && filters.type.length > 0) {
        let validType = false
        for(const type of filters.type) {
            if(website.frameWorkType?.toLowerCase() == type.toLowerCase()) {
                validType = true;
                break;
            }
        }
        valid = valid && validType;
    } else {
        valid = valid && true;
    }
    if(filters.status && filters.status.length > 0) {
        let validStatus = false;
        for(const status of filters.status) {
            if(website.frameWorkUpdateStatus?.toLowerCase() == status.toLowerCase()) {
                validStatus = true;
                break;
            }
        }
        valid = valid && validStatus;
    } else {
        valid = valid && true;
    }
    if(filters.folder && filters.folder.length > 0) {
        let validFolder = false;
        for(const folder of filters.folder) {
            const websiteFolder = website.folders?.find(f => f == folder);
            if(websiteFolder) {
                validFolder = true;
                break;
            }
        }
        valid = valid && validFolder;
    } else {
        valid = valid && true;
    }
    if(filters.team && filters.team.length > 0) {
        let validTeams = false;
        for(const team of filters.team) {
            const websiteTeam = website.teams?.find(t => t == team);
            if(websiteTeam) {
                validTeams = true;
                break;
            }
        }
        valid = valid && validTeams;
    } else {
        valid = valid && true;
    }
    if(filters.tags && filters.tags.length > 0) {
        let validTags = false;
        for(const tag of filters.tags) {
            if(website.tags?.includes(tag)) {
                validTags = true;
                break;
            }
        }
        valid = valid && validTags;
    } else {
        valid = valid && true;
    }
    return valid;
}
export function getPostExcerpt(content: string, maxLength = 140): string {
    const text = content
        .replace(/^---[\s\S]*?---/, " ")
        .replace(/^\s*(import|export)\s.+$/gm, " ")
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
        .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
        .replace(/[#>*_`~|:-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength).trim()}...`;
}

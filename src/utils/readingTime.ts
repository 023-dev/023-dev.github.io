/**
 * Calculate the estimated reading time for a given text.
 * Assumes an average reading speed of 200 words per minute.
 */
export function getReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const clean = content.replace(/<\/?[^>]+(>|$)/g, '');
    const numberOfWords = clean.split(/\s/g).length;
    const minutes = Math.ceil(numberOfWords / wordsPerMinute);
    return `${minutes} min read`;
}

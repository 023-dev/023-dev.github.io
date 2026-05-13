import * as React from 'react';

export default function Header() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [results, setResults] = React.useState([]);

    React.useEffect(() => {
        const performSearch = async () => {
            if (searchTerm.length < 2) {
                setResults([]);
                return;
            }
            try {
                // @ts-ignore
                const pagefindUrl = '/pagefind/pagefind.js';
                const pagefind = await import(/* @vite-ignore */ pagefindUrl);
                const search = await pagefind.search(searchTerm);
                const fiveResults = await Promise.all(search.results.slice(0, 5).map(r => r.data()));

                setResults(fiveResults.map(d => ({
                    url: d.url,
                    title: d.meta.title,
                    heroImage: d.meta.heroImage,
                    tags: d.meta.tag ? (Array.isArray(d.meta.tag) ? d.meta.tag : [d.meta.tag]) : [],
                    date: d.meta.date
                })));
            } catch (e) {
                console.warn("Pagefind search failed (likely because it's only available after build):", e);
                setResults([]);
            }
        };

        const timeoutId = setTimeout(performSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Close modal on Escape key
    React.useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const fontStyle = { fontFamily: 'Pretendard, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif' };
    const closeSearch = () => setIsOpen(false);

    return (
        <>
            <header
                className="sticky top-0 z-[2002] w-full bg-white/95 backdrop-blur-md"
                style={fontStyle}
            >
                <div className="mx-auto flex h-14 w-full max-w-[1310px] items-center justify-between px-4">
                    <a
                        href="/"
                        className="inline-flex text-[22px] font-bold leading-tight text-black no-underline"
                        style={fontStyle}
                    >
                        Tech Blog
                    </a>

                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-medium text-[#555] transition-colors hover:bg-[rgb(246,246,246)] hover:text-black"
                        style={fontStyle}
                        aria-label="Search posts"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <span className="hidden sm:inline">Search</span>
                    </button>
                </div>
            </header>

            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex justify-center px-4 pt-[14vh]">
                    <div
                        className="absolute inset-0 bg-white/75 backdrop-blur-sm"
                        onClick={closeSearch}
                    />

                    <div
                        className="relative flex max-h-[76vh] w-[680px] max-w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Search posts"
                    >
                        <div className="flex items-center border-b border-gray-200 px-5 py-4">
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-3 shrink-0 text-[#777]"
                                aria-hidden="true"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                placeholder="Search posts..."
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="min-w-0 flex-1 border-none bg-transparent text-[20px] font-medium text-black outline-none placeholder:text-gray-400"
                                style={fontStyle}
                            />
                            <button
                                type="button"
                                onClick={closeSearch}
                                className="ml-3 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#777] transition-colors hover:bg-[rgb(246,246,246)] hover:text-black"
                                aria-label="Close search"
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-2">
                            <div className="px-5 pb-2 pt-3 text-xs font-medium text-[#777]">
                                {searchTerm ? 'Search results' : 'Type at least 2 characters'}
                            </div>

                            {results.map((result, index) => (
                                <a key={index} href={result.url} className="block no-underline" onClick={closeSearch}>
                                    <div className="group flex cursor-pointer px-5 py-3 transition-colors hover:bg-[rgb(246,246,246)]">
                                        <div
                                            className="mr-4 h-[60px] w-[60px] shrink-0 rounded-md bg-gray-100 bg-cover bg-center"
                                            style={{
                                                backgroundImage: result.heroImage ? `url(${typeof result.heroImage === 'string' ? result.heroImage : result.heroImage.src})` : 'none'
                                            }}
                                        />
                                        <div className="flex flex-col justify-center min-w-0">
                                            <div className="mb-1 truncate text-base font-bold text-black">
                                                {result.title}
                                            </div>
                                            <div className="flex items-center text-xs text-[#777]">
                                                <span className="mr-2 shrink-0 rounded-full bg-[rgb(246,246,246)] px-2 py-0.5 text-[#555]">
                                                    {result.tags && result.tags.length > 0 ? result.tags[0] : 'Blog'}
                                                </span>
                                                <span className="truncate">
                                                    {result.date ? new Date(result.date).toLocaleDateString('ko-KR') : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}

                            {results.length === 0 && searchTerm.length >= 2 && (
                                <div className="px-5 py-10 text-center text-sm text-[#777]">
                                    No posts found.
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-3 text-xs text-[#777]">
                            <span>Type to search...</span>
                            <span>
                                <kbd className="mr-1 rounded bg-[rgb(246,246,246)] px-1 py-0.5 font-mono text-[#555]">ESC</kbd>
                                to close
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

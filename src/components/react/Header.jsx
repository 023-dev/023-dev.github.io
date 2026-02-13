import * as React from 'react';

// Using Tailwind CSS for styling instead of Styletron/BaseUI
// Replicating the exact look & feel of the previous Header implementation

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
                    slug: d.url.replace(/^\/blog\/|\/$/g, ""),
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

    const fontStyle = { fontFamily: 'UberMoveText, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif' };

    return (
        <>
            {/* Top Bar - Black */}
            <header
                className="w-full sticky top-0 bg-black/90 backdrop-blur-md z-[2002] box-border flex items-center py-3 h-16"
                style={fontStyle}
            >
                <div className="w-full max-w-[1310px] mx-auto px-4 h-full flex items-center justify-between">
                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <a href="/" className="text-white text-2xl font-normal no-underline flex items-center leading-none" style={fontStyle}>
                            Blog
                        </a>
                    </div>

                    {/* Right: Search Trigger */}
                    <div className="flex items-center">
                        <div
                            onClick={() => setIsOpen(true)}
                            className="flex items-center cursor-pointer group"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-3 text-white">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <span className="text-white text-base font-medium" style={fontStyle}>
                                Search
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Second Bar - White Navigation */}
            <nav
                className="w-full sticky top-16 bg-white z-[2001] flex items-center py-3 border-b border-gray-100"
                style={fontStyle}
            >
                <div className="w-full max-w-[1310px] mx-auto px-4 h-full flex items-center justify-between overflow-x-auto no-scrollbar">
                    <a href="/tags/engineering" className="no-underline mr-auto">
                        <div className="text-2xl font-bold text-black cursor-pointer" style={fontStyle}>
                            Engineering
                        </div>
                    </a>
                    <div className="flex space-x-8 ml-8">
                        {['Backend', 'DevOps', 'Communication', 'Etc'].map((item) => (
                            <a key={item} href={`/tags/${item.toLowerCase()}`} className="no-underline text-[#555555] text-sm font-normal whitespace-nowrap hover:text-black transition-colors" style={fontStyle}>
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Search Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex justify-center items-start pt-[15vh]">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative bg-[#262626] w-[640px] max-w-[90vw] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-down">
                        {/* Search Input */}
                        <div className="flex items-center p-6 border-b border-[#333]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-4">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                placeholder="Search posts..."
                                autoFocus
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 bg-transparent border-none text-white text-2xl font-light outline-none placeholder-gray-600"
                                style={fontStyle}
                            />
                        </div>

                        {/* Results Area */}
                        <div className="flex-1 overflow-y-auto py-2">
                            <div className="px-6 pt-4 pb-2 text-[#888] text-xs font-medium uppercase tracking-wider">
                                {searchTerm ? 'Search Results' : 'Recent Posts'}
                            </div>

                            {results.map((result, index) => (
                                <a key={index} href={`/blog/${result.slug}`} className="block no-underline" onClick={() => setIsOpen(false)}>
                                    <div className="flex px-6 py-3 cursor-pointer hover:bg-[#333] transition-colors group">
                                        <div
                                            className="w-[60px] h-[60px] rounded-lg bg-[#444] mr-4 bg-cover bg-center shrink-0"
                                            style={{
                                                backgroundImage: result.heroImage ? `url(${typeof result.heroImage === 'string' ? result.heroImage : result.heroImage.src})` : 'none'
                                            }}
                                        />
                                        <div className="flex flex-col justify-center min-w-0">
                                            <div className="text-white text-base font-medium mb-1 truncate group-hover:text-blue-400 transition-colors">
                                                {result.title}
                                            </div>
                                            <div className="flex items-center text-[#999] text-xs">
                                                <span className="bg-[#333] px-1.5 py-0.5 rounded text-[#ccc] mr-2 shrink-0">
                                                    {result.tags && result.tags.length > 0 ? result.tags[0] : 'Blog'}
                                                </span>
                                                <span className="truncate">
                                                    {new Date(result.date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}

                            {results.length === 0 && searchTerm.length >= 2 && (
                                <div className="p-6 text-[#999] text-center">
                                    No posts found.
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 px-6 bg-[#262626] border-t border-[#333] text-[#666] text-xs flex justify-between items-center">
                            <span>Type to search...</span>
                            <span>
                                <kbd className="bg-[#444] px-1 py-0.5 rounded text-[#bbb] font-mono mr-1">ESC</kbd>
                                to close
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

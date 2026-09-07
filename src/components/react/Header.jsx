import * as React from 'react';

const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('ko-KR');
};

export default function Header() {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [results, setResults] = React.useState([]);
    const [theme, setTheme] = React.useState(() => (
        typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark'
            ? 'dark'
            : 'light'
    ));
    React.useEffect(() => {
        const performSearch = async () => {
            if (searchTerm.length < 2) {
                setResults([]);
                return;
            }

            try {
                const pagefindUrl = '/pagefind/pagefind.js';
                const pagefind = await import(/* @vite-ignore */ pagefindUrl);
                const search = await pagefind.search(searchTerm);
                const resultData = await Promise.all(
                    search.results.slice(0, 8).map((result) => result.data()),
                );

                setResults(resultData.map((data) => ({
                    url: data.url,
                    title: data.meta.title,
                    tags: data.meta.tag
                        ? (Array.isArray(data.meta.tag) ? data.meta.tag : [data.meta.tag])
                        : [],
                    date: data.meta.date,
                })));
            } catch (error) {
                console.warn('Pagefind search is available after build.', error);
                setResults([]);
            }
        };

        const timeoutId = window.setTimeout(performSearch, 250);
        return () => window.clearTimeout(timeoutId);
    }, [searchTerm]);

    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setIsOpen(false);
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setIsOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    React.useEffect(() => {
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem('023-theme', theme);
    }, [theme]);

    const closeSearch = () => setIsOpen(false);
    const toggleTheme = () => setTheme((current) => current === 'dark' ? 'light' : 'dark');
    return (
        <>
            <header className="site-header">
                <div className="site-header__inner">
                    <a href="/" className="site-brand" aria-label="023 DEV home">
                        <span>023 DEV</span>
                    </a>

                    <div className="header-actions">
                        <a className="header-dashboard" href="https://github.com/023-dev/023-dev.github.io">
                            GitHub <span aria-hidden="true">↗</span>
                        </a>
                        <button
                            type="button"
                            className="theme-toggle"
                            data-theme-toggle
                            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                            aria-pressed={theme === 'dark'}
                            onClick={toggleTheme}
                        >
                            {theme === 'dark' ? (
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M20.6 15.2A8.5 8.5 0 0 1 8.8 3.4 8.5 8.5 0 1 0 20.6 15.2Z" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <circle cx="12" cy="12" r="4" />
                                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                                </svg>
                            )}
                        </button>
                        <button
                            type="button"
                            className="header-search"
                            onClick={() => setIsOpen(true)}
                            aria-haspopup="dialog"
                            aria-expanded={isOpen}
                            aria-label="Search posts"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-4-4" />
                            </svg>
                            <span>Search</span>
                        </button>
                    </div>
                </div>
            </header>

            {isOpen && (
                <div
                    className="search-backdrop"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) closeSearch();
                    }}
                >
                    <div className="search-dialog" role="dialog" aria-modal="true" aria-label="Search posts">
                        <div className="search-dialog__input">
                            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-4-4" />
                            </svg>
                            <input
                                autoFocus
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search posts..."
                                aria-label="Search posts"
                            />
                            <button type="button" className="search-dialog__close" onClick={closeSearch} aria-label="Close search">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M6 6l12 12M18 6 6 18" />
                                </svg>
                            </button>
                        </div>

                        <div className="search-dialog__results">
                            <span className="search-dialog__label">
                                {searchTerm ? 'Search results' : 'Type at least 2 characters'}
                            </span>

                            {results.map((result) => (
                                <a key={result.url} href={result.url} className="search-result" onClick={closeSearch}>
                                    <span className="search-result__title">{result.title}</span>
                                    <span className="search-result__meta">
                                        <span>{result.tags[0] || 'Blog'}</span>
                                        <span>{formatDate(result.date)}</span>
                                    </span>
                                </a>
                            ))}

                            {results.length === 0 && searchTerm.length >= 2 && (
                                <span className="search-dialog__empty">No posts found.</span>
                            )}
                        </div>

                        <div className="search-dialog__footer">
                            <span>Search 023 DEV</span>
                            <span><kbd>ESC</kbd> to close</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

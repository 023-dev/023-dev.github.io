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
                            GitHub
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M16.243 6.757a1 1 0 0 1 1 1v7.072a1 1 0 0 1-2 0v-4.657L8.464 16.95a1 1 0 0 1-1.414-1.414l6.778-6.779H9.172a1 1 0 0 1 0-2h7.07Z" clipRule="evenodd" />
                            </svg>
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
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                    <path d="M10.7836 0.470481C10.9676 0.765118 10.9855 1.13415 10.8309 1.44525C10.2994 2.51497 10 3.7211 10 5.00001C10 9.41829 13.5817 13 18 13L18.0575 12.9998C18.4049 12.9974 18.7287 13.1754 18.9127 13.47C19.0968 13.7647 19.1147 14.1337 18.9601 14.4448C17.325 17.7352 13.9279 20 10 20C4.47715 20 0 15.5229 0 10C0 4.50107 4.43841 0.038857 9.92838 0.000268937C10.2758 -0.00217271 10.5995 0.175844 10.7836 0.470481ZM8.40989 2.15803C4.75344 2.8954 2 6.12619 2 10C2 14.4183 5.58172 18 10 18C12.587 18 14.8886 16.7721 16.3516 14.8648C11.6131 14.0789 8 9.96139 8 5.00001C8 4.01361 8.1431 3.05953 8.40989 2.15803Z" fill="currentColor" />
                                </svg>
                            ) : (
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M11 0C11.5523 0 12 0.447715 12 1V3C12 3.55228 11.5523 4 11 4C10.4477 4 10 3.55228 10 3V1C10 0.447715 10.4477 0 11 0ZM3.22183 3.22183C3.61235 2.8313 4.24551 2.8313 4.63604 3.22183L6.05025 4.63604C6.44078 5.02656 6.44078 5.65973 6.05025 6.05025C5.65973 6.44078 5.02656 6.44078 4.63604 6.05025L3.22183 4.63604C2.8313 4.24551 2.8313 3.61235 3.22183 3.22183ZM18.7782 3.22183C19.1687 3.61235 19.1687 4.24551 18.7782 4.63604L17.364 6.05025C16.9734 6.44078 16.3403 6.44078 15.9497 6.05025C15.5592 5.65973 15.5592 5.02656 15.9497 4.63604L17.364 3.22183C17.7545 2.8313 18.3876 2.8313 18.7782 3.22183ZM11 8C9.34315 8 8 9.34315 8 11C8 12.6569 9.34315 14 11 14C12.6569 14 14 12.6569 14 11C14 9.34315 12.6569 8 11 8ZM6 11C6 8.23858 8.23858 6 11 6C13.7614 6 16 8.23858 16 11C16 13.7614 13.7614 16 11 16C8.23858 16 6 13.7614 6 11ZM0 11C0 10.4477 0.447715 10 1 10H3C3.55228 10 4 10.4477 4 11C4 11.5523 3.55228 12 3 12H1C0.447715 12 0 11.5523 0 11ZM18 11C18 10.4477 18.4477 10 19 10H21C21.5523 10 22 10.4477 22 11C22 11.5523 21.5523 12 21 12H19C18.4477 12 18 11.5523 18 11ZM6.05025 15.9497C6.44078 16.3403 6.44078 16.9734 6.05025 17.364L4.63604 18.7782C4.24551 19.1687 3.61235 19.1687 3.22183 18.7782C2.8313 18.3876 2.8313 17.7545 3.22183 17.364L4.63604 15.9497C5.02656 15.5592 5.65973 15.5592 6.05025 15.9497ZM15.9497 15.9497C16.3403 15.5592 16.9734 15.5592 17.364 15.9497L18.7782 17.364C19.1687 17.7545 19.1687 18.3876 18.7782 18.7782C18.3877 19.1687 17.7545 19.1687 17.364 18.7782L15.9497 17.364C15.5592 16.9734 15.5592 16.3403 15.9497 15.9497ZM11 18C11.5523 18 12 18.4477 12 19V21C12 21.5523 11.5523 22 11 22C10.4477 22 10 21.5523 10 21V19C10 18.4477 10.4477 18 11 18Z" fill="currentColor" />
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

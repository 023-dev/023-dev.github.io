
import React, { useState, useEffect, useRef } from 'react';

// SVG Icons
const ChartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
);

const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default function VisitorMonitor() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState(null);
    const [hoverData, setHoverData] = useState(null);
    const containerRef = useRef(null);

    // Fetch data on mount or first hover
    useEffect(() => {
        const fetchData = async () => {
            if (stats) return; // Already loaded
            setIsLoading(true);
            try {
                const res = await fetch('/api/visitor-stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch visitor stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // Prefetch on load for instant hover (optional, but good for UX)
        fetchData();
    }, []);


    // Graph logic
    const trend = stats?.trend || [];
    const counts = trend.map(d => d.count);
    const maxCount = Math.max(...counts, 1);
    const minCount = Math.min(...counts, 0);
    const width = 240;
    const height = 60;
    const padding = 5;

    const getX = (index) => padding + (index / (trend.length - 1 || 1)) * (width - padding * 2);
    const getY = (count) => {
        const range = maxCount - minCount || 1;
        return height - padding - ((count - minCount) / range) * (height - padding * 2);
    };

    const pathD = trend.length > 0 ? trend.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.count)}`).join(' ') : '';
    const areaD = trend.length > 0 ? `${pathD} L ${getX(trend.length - 1)} ${height} L ${getX(0)} ${height} Z` : '';

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.length !== 8) return 'Today';
        const y = dateStr.substring(0, 4);
        const m = dateStr.substring(4, 6);
        const d = dateStr.substring(6, 8);
        return `${y}.${m}.${d}`;
    };

    return (
        <div
            className="fixed bottom-6 right-6 z-[9999] font-sans"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            ref={containerRef}
        >
            {/* Popover */}
            <div
                className={`absolute bottom-full right-0 mb-4 bg-white dark:bg-[#262626] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 w-[280px] transition-all duration-300 origin-bottom-right transform ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center h-[100px] text-gray-400 text-sm">Loading...</div>
                ) : stats ? (
                    <>
                        <div className="flex justify-between items-baseline mb-2">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {hoverData ? formatDate(hoverData.date) : 'Today'}
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {hoverData ? hoverData.count.toLocaleString() : stats.today.toLocaleString()}
                            </div>
                        </div>

                        {/* Graph */}
                        <div className="relative w-full h-[60px] mb-3">
                            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
                                <defs>
                                    <linearGradient id="monitor-gradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#9CA3AF" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#9CA3AF" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={areaD} fill="url(#monitor-gradient)" className="transition-all duration-300" />
                                <path d={pathD} fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                                {/* Interactive Overlay */}
                                {trend.map((d, i) => (
                                    <rect
                                        key={i}
                                        x={getX(i) - (width / trend.length) / 2}
                                        y="0"
                                        width={width / trend.length}
                                        height={height}
                                        fill="transparent"
                                        onMouseEnter={() => setHoverData(d)}
                                        onMouseLeave={() => setHoverData(null)}
                                        className="cursor-crosshair hover:fill-gray-100/10"
                                    />
                                ))}

                                {/* Indicator Dot */}
                                {hoverData && (
                                    <circle
                                        cx={getX(trend.indexOf(hoverData))}
                                        cy={getY(hoverData.count)}
                                        r="3"
                                        fill="#9CA3AF"
                                        className="pointer-events-none"
                                    />
                                )}
                            </svg>
                        </div>

                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between text-xs text-gray-400">
                            <span>Total Users</span>
                            <span className="font-medium text-gray-600 dark:text-gray-300">{stats.total.toLocaleString()}</span>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-red-500 text-sm py-4">Failed to load data</div>
                )}
            </div>

            {/* Floating Button */}
            <button
                className={`w-12 h-12 rounded-full bg-white dark:bg-[#262626] border border-gray-200 dark:border-gray-700 shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 transition-all duration-300 group ${isOpen ? 'ring-2 ring-gray-400 ring-offset-2 dark:ring-offset-black' : ''}`}
                aria-label="Visitor Stats"
            >
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'scale-100 opacity-100'} absolute`}>
                    <ChartIcon />
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'} absolute`}>
                    <CloseIcon />
                </div>
            </button>
        </div>
    );
}

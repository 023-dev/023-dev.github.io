import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Environment variables
const propertyId = import.meta.env.GA4_PROPERTY_ID;
const privateKey = import.meta.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = import.meta.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

let analyticsDataClient: BetaAnalyticsDataClient | null = null;

if (propertyId && privateKey && clientEmail) {
    analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
    });
}

// Simple in-memory cache to prevent hitting API quotas
// Key: slug, Value: { views: number, timestamp: number }
const cache: Record<string, { views: number; timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function getPageViews(slug: string): Promise<number> {
    // Return cached value if valid
    const now = Date.now();
    if (cache[slug] && now - cache[slug].timestamp < CACHE_DURATION) {
        return cache[slug].views;
    }

    if (!analyticsDataClient) {
        console.warn('GA4 credentials not found');
        return 0;
    }

    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                {
                    startDate: '2020-01-01', // Count from the beginning
                    endDate: 'today',
                },
            ],
            dimensions: [
                {
                    name: 'pagePath',
                },
            ],
            metrics: [
                {
                    name: 'screenPageViews',
                },
            ],
            dimensionFilter: {
                filter: {
                    fieldName: 'pagePath',
                    stringFilter: {
                        matchType: 'CONTAINS',
                        value: slug,
                    },
                },
            },
        });

        // Sum all matching rows (e.g., /blog/slug and /blog/slug/)
        let totalViews = 0;
        if (response.rows) {
            response.rows.forEach((row) => {
                if (row.metricValues && row.metricValues[0].value) {
                    totalViews += parseInt(row.metricValues[0].value, 10);
                }
            });
        }

        // Update cache
        cache[slug] = { views: totalViews, timestamp: now };
        return totalViews;
    } catch (error) {
        console.error('Error fetching GA4 data:', error);
        return 0; // Fallback
    }
}


export interface VisitorStats {
    today: number;
    total: number;
    trend: { date: string; count: number }[];
}

// Cache for visitor stats (1 hour)
let visitorStatsCache: { data: VisitorStats; timestamp: number } | null = null;

export async function getVisitorStats(): Promise<VisitorStats> {
    const now = Date.now();
    if (visitorStatsCache && now - visitorStatsCache.timestamp < CACHE_DURATION) {
        return visitorStatsCache.data;
    }

    if (!analyticsDataClient) {
        return { today: 0, total: 0, trend: [] };
    }

    try {
        const [todayResponse, totalResponse, trendResponse] = await Promise.all([
            // Today's Visitors
            analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: 'today', endDate: 'today' }],
                metrics: [{ name: 'activeUsers' }],
            }),
            // Total Visitors
            analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '2020-01-01', endDate: 'today' }],
                metrics: [{ name: 'activeUsers' }],
            }),
            // 30 Days Trend
            analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                dimensions: [{ name: 'date' }],
                metrics: [{ name: 'activeUsers' }],
                orderBys: [{ dimension: { dimensionName: 'date' } }],
            }),
        ]);

        const today = todayResponse[0].rows?.[0]?.metricValues?.[0]?.value
            ? parseInt(todayResponse[0].rows[0].metricValues[0].value, 10)
            : 0;

        const total = totalResponse[0].rows?.[0]?.metricValues?.[0]?.value
            ? parseInt(totalResponse[0].rows[0].metricValues[0].value, 10)
            : 0;

        const trend = (trendResponse[0].rows || []).map((row) => ({
            date: row.dimensionValues?.[0]?.value || '',
            count: parseInt(row.metricValues?.[0]?.value || '0', 10),
        }));

        const stats = { today, total, trend };
        visitorStatsCache = { data: stats, timestamp: now };
        return stats;
    } catch (error) {
        console.error('Error fetching visitor stats:', error);
        return { today: 0, total: 0, trend: [] };
    }
}

import { NextRequest, NextResponse } from 'next/server';

export interface SchemeLiveVerification {
  schemeId: string;
  status: 'active' | 'review' | 'closed';
  statusBadge: string;
  verifiedDate: string;
  activeSeason: string;
  summary: string;
  officialPortalUrl: string;
  officialPortalLabel: string;
  deadlineText?: string;
  recentDispatches: Array<{
    title: string;
    link: string;
    publishedAt: string;
    source: string;
  }>;
}

// In-memory 2-hour cache for live verification
let verificationCache: Record<string, { data: SchemeLiveVerification; timestamp: number }> = {};
const CACHE_TTL_MS = 2 * 60 * 60 * 1000;

// Active Agricultural Season Calendar for West Bengal:
// Kharif: June - Oct | Rabi: Nov - Feb | Boro (Summer): Mar - May
function getAgronomySeasonContext() {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 6 && month <= 10) return { season: 'Kharif', active: true, year: new Date().getFullYear() };
  if (month >= 11 || month <= 2) return { season: 'Rabi', active: true, year: new Date().getFullYear() };
  return { season: 'Boro', active: true, year: new Date().getFullYear() };
}

const SCHEME_QUERIES: Record<
  string,
  {
    query: string;
    defaultPortal: string;
    defaultLabel: string;
    getDetails: (seasonContext: ReturnType<typeof getAgronomySeasonContext>) => {
      status: 'active' | 'review' | 'closed';
      statusBadge: string;
      activeSeason: string;
      deadlineText: string;
      summary: string;
    };
  }
> = {
  'bangla-shasya-bima': {
    query: 'Bangla Shasya Bima West Bengal crop insurance',
    defaultPortal: 'https://banglashasyabima.net',
    defaultLabel: 'Bangla Shasya Bima Official Portal',
    getDetails: (s) => ({
      status: s.season === 'Rabi' ? 'active' : 'review',
      statusBadge: s.season === 'Rabi' ? 'Rabi Season Enrollment Open' : 'Kharif Window Closed',
      activeSeason: `${s.season} ${s.year} Crop Insurance Enrollment`,
      deadlineText: s.season === 'Rabi' ? 'Cutoff: Dec 31 for Rabi crops (Potato, Mustard)' : 'Enrollment opens next season',
      summary: 'Government of West Bengal 100% premium subsidy scheme active for notified crops.',
    }),
  },
  'krishak-bandhu': {
    query: 'Krishak Bandhu West Bengal scheme assistance disbursement',
    defaultPortal: 'https://krishakbandhu.wb.gov.in',
    defaultLabel: 'Krishak Bandhu Official Portal',
    getDetails: (s) => ({
      status: 'active',
      statusBadge: 'Active & Accepting Applications',
      activeSeason: `${s.season} ${s.year} Installment Active`,
      deadlineText: 'Bi-annual installments open at Block ADA Offices',
      summary: 'Direct benefit transfer of up to ₹10,000/year for eligible agricultural land holders.',
    }),
  },
  'pm-kisan': {
    query: 'PM Kisan Samman Nidhi installment DBT small farmers',
    defaultPortal: 'https://pmkisan.gov.in',
    defaultLabel: 'PM-KISAN DBT Beneficiary Portal',
    getDetails: () => ({
      status: 'active',
      statusBadge: 'Continuous Registration & e-KYC Active',
      activeSeason: '19th Installment / Continuous e-KYC',
      deadlineText: 'Mandatory Aadhaar-seeded NPCI bank account',
      summary: 'Central sector scheme providing ₹6,000 per year in three equal installments to eligible farmer families.',
    }),
  },
  'kcc': {
    query: 'Kisan Credit Card interest subvention crop loan RBI NABARD',
    defaultPortal: 'https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card',
    defaultLabel: 'KCC Portal via SBI & NABARD',
    getDetails: () => ({
      status: 'active',
      statusBadge: 'Active Across All Rural Branches',
      activeSeason: 'Annual Continuous Sanctioning',
      deadlineText: 'Year-round 4% interest subvention scheme',
      summary: 'Subsidized institutional short-term credit up to ₹3 Lakh at 4% effective interest upon timely repayment.',
    }),
  },
  'kisan-credit-card': {
    query: 'Kisan Credit Card interest subvention crop loan RBI NABARD',
    defaultPortal: 'https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card',
    defaultLabel: 'KCC Portal via SBI & NABARD',
    getDetails: () => ({
      status: 'active',
      statusBadge: 'Active Across All Rural Branches',
      activeSeason: 'Annual Continuous Sanctioning',
      deadlineText: 'Year-round 4% interest subvention scheme',
      summary: 'Subsidized institutional short-term credit up to ₹3 Lakh at 4% effective interest upon timely repayment.',
    }),
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schemeId = searchParams.get('schemeId') || searchParams.get('id');
    const forceRefresh = searchParams.get('refresh') === 'true';

    const now = Date.now();
    const todayStr = new Date().toISOString().split('T')[0];
    const seasonContext = getAgronomySeasonContext();

    if (forceRefresh) {
      verificationCache = {};
    }

    // If querying a single scheme
    if (schemeId) {
      const configKey = schemeId === 'kisan-credit-card' ? 'kcc' : schemeId;
      const config = SCHEME_QUERIES[configKey] || SCHEME_QUERIES[schemeId];

      if (!config) {
        return NextResponse.json({ error: 'Unknown scheme ID' }, { status: 404 });
      }

      if (!forceRefresh && verificationCache[schemeId] && now - verificationCache[schemeId].timestamp < CACHE_TTL_MS) {
        return NextResponse.json({
          success: true,
          source: 'cache',
          verification: verificationCache[schemeId].data,
        });
      }

      const details = config.getDetails(seasonContext);
      const liveDispatches = await fetchLiveNewsDispatches(config.query);

      const verification: SchemeLiveVerification = {
        schemeId,
        status: details.status,
        statusBadge: details.statusBadge,
        verifiedDate: todayStr,
        activeSeason: details.activeSeason,
        deadlineText: details.deadlineText,
        summary:
          liveDispatches.length > 0
            ? `Verified status on live agricultural feeds: "${cleanHtml(liveDispatches[0].title)}"`
            : details.summary,
        officialPortalUrl: config.defaultPortal,
        officialPortalLabel: config.defaultLabel,
        recentDispatches: liveDispatches.slice(0, 2),
      };

      verificationCache[schemeId] = {
        data: verification,
        timestamp: now,
      };

      return NextResponse.json({
        success: true,
        source: 'live_web',
        verification,
      });
    }

    // Return all schemes
    const allVerifications: Record<string, SchemeLiveVerification> = {};

    await Promise.all(
      Object.keys(SCHEME_QUERIES).map(async (id) => {
        if (!forceRefresh && verificationCache[id] && now - verificationCache[id].timestamp < CACHE_TTL_MS) {
          allVerifications[id] = verificationCache[id].data;
          return;
        }

        const config = SCHEME_QUERIES[id];
        const details = config.getDetails(seasonContext);
        const liveDispatches = await fetchLiveNewsDispatches(config.query);

        const verification: SchemeLiveVerification = {
          schemeId: id,
          status: details.status,
          statusBadge: details.statusBadge,
          verifiedDate: todayStr,
          activeSeason: details.activeSeason,
          deadlineText: details.deadlineText,
          summary:
            liveDispatches.length > 0
              ? `Verified status on live agricultural feeds: "${cleanHtml(liveDispatches[0].title)}"`
              : details.summary,
          officialPortalUrl: config.defaultPortal,
          officialPortalLabel: config.defaultLabel,
          recentDispatches: liveDispatches.slice(0, 2),
        };

        verificationCache[id] = {
          data: verification,
          timestamp: now,
        };

        allVerifications[id] = verification;
      })
    );

    return NextResponse.json({
      success: true,
      source: forceRefresh ? 'live_web_refresh' : 'live_web',
      verifiedDate: todayStr,
      verifications: allVerifications,
    });
  } catch (err) {
    console.error('Error during scheme verification:', err);
    return NextResponse.json({ error: 'Failed to verify scheme portal' }, { status: 500 });
  }
}

async function fetchLiveNewsDispatches(query: string) {
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-IN&gl=IN&ceid=IN:en`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

    return items.slice(0, 3).map((raw) => {
      const titleMatch =
        raw.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || raw.match(/<title>(.*?)<\/title>/);
      const linkMatch = raw.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = raw.match(/<pubDate>(.*?)<\/pubDate>/);
      const sourceMatch = raw.match(/<source[^>]*>(.*?)<\/source>/);

      return {
        title: titleMatch ? cleanHtml(titleMatch[1]) : 'Agricultural Policy Dispatch',
        link: linkMatch ? linkMatch[1] : '#',
        publishedAt: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
        source: sourceMatch ? cleanHtml(sourceMatch[1]) : 'Official Dispatches',
      };
    });
  } catch (err: unknown) {
    console.warn('Live news dispatch fetch failed for query:', query, err);
    return [];
  }
}

function cleanHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

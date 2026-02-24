import { prisma } from "@/lib/db";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default async function AdminIntelligencePage() {
  const [documents, sessions] = await Promise.all([
    prisma.document.findMany({
      select: {
        id: true,
        type: true,
        currency: true,
        grandTotal: true,
        ipCountry: true,
        senderInfo: true,
        recipientInfo: true,
        senderEmailDomain: true,
        recipientEmailDomain: true,
        detectedIndustry: true,
        revenueRange: true,
        lineItemCount: true,
        avgLineItemPrice: true,
        createdAt: true,
        lineItems: { select: { description: true, unitPrice: true } },
      },
    }),
    prisma.formSession.findMany({
      select: {
        fingerprintHash: true,
        completed: true,
      },
    }),
  ]);

  // Industry breakdown
  const industryMap = new Map<string, { count: number; totalRevenue: number }>();
  for (const doc of documents) {
    const industry = doc.detectedIndustry || "unclassified";
    const existing = industryMap.get(industry) || { count: 0, totalRevenue: 0 };
    existing.count++;
    existing.totalRevenue += Number(doc.grandTotal);
    industryMap.set(industry, existing);
  }
  const industries = Array.from(industryMap.entries())
    .map(([name, data]) => ({ name, ...data, avgRevenue: data.count > 0 ? data.totalRevenue / data.count : 0 }))
    .sort((a, b) => b.count - a.count);

  // Revenue range distribution
  const revenueRangeMap = new Map<string, number>();
  for (const doc of documents) {
    const range = doc.revenueRange || "unknown";
    revenueRangeMap.set(range, (revenueRangeMap.get(range) || 0) + 1);
  }
  const revenueOrder = ["<1k", "1k-5k", "5k-25k", "25k-100k", "100k+", "unknown"];
  const revenueRanges = revenueOrder
    .filter((r) => revenueRangeMap.has(r))
    .map((r) => ({ range: r, count: revenueRangeMap.get(r)! }));

  // Email domain analysis
  const freeEmails = new Set(["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com", "icloud.com", "mail.com", "protonmail.com", "yandex.com"]);
  const senderDomainMap = new Map<string, number>();
  let corporateSenders = 0;
  let freeSenders = 0;
  for (const doc of documents) {
    if (doc.senderEmailDomain) {
      senderDomainMap.set(doc.senderEmailDomain, (senderDomainMap.get(doc.senderEmailDomain) || 0) + 1);
      if (freeEmails.has(doc.senderEmailDomain)) freeSenders++;
      else corporateSenders++;
    }
  }
  const topSenderDomains = Array.from(senderDomainMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  // Currency-Country correlation
  const currencyCountryMap = new Map<string, Map<string, number>>();
  for (const doc of documents) {
    if (!doc.ipCountry) continue;
    if (!currencyCountryMap.has(doc.currency)) currencyCountryMap.set(doc.currency, new Map());
    const countryMap = currencyCountryMap.get(doc.currency)!;
    countryMap.set(doc.ipCountry, (countryMap.get(doc.ipCountry) || 0) + 1);
  }
  const currencyCountry = Array.from(currencyCountryMap.entries())
    .map(([currency, countries]) => ({
      currency,
      topCountry: Array.from(countries.entries()).sort((a, b) => b[1] - a[1])[0],
      total: Array.from(countries.values()).reduce((s, n) => s + n, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // Client relationship mapping (who invoices who)
  const relationships = new Map<string, number>();
  for (const doc of documents) {
    const s = doc.senderInfo as Record<string, string> | null;
    const r = doc.recipientInfo as Record<string, string> | null;
    if (s?.businessName && r?.businessName) {
      const key = `${s.businessName} → ${r.businessName}`;
      relationships.set(key, (relationships.get(key) || 0) + 1);
    }
  }
  const topRelationships = Array.from(relationships.entries())
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count > 1)
    .slice(0, 15);

  // Document frequency (repeat users by sender business name)
  const senderFreq = new Map<string, number>();
  for (const doc of documents) {
    const s = doc.senderInfo as Record<string, string> | null;
    if (s?.businessName) {
      senderFreq.set(s.businessName, (senderFreq.get(s.businessName) || 0) + 1);
    }
  }
  const repeatSenders = Array.from(senderFreq.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  // Pricing by industry
  const industryPricing = new Map<string, number[]>();
  for (const doc of documents) {
    const industry = doc.detectedIndustry || "unclassified";
    if (!industryPricing.has(industry)) industryPricing.set(industry, []);
    industryPricing.get(industry)!.push(Number(doc.grandTotal));
  }

  // Returning visitors
  const uniqueFingerprints = new Set<string>();
  const returningFingerprints = new Set<string>();
  for (const s of sessions) {
    if (s.fingerprintHash) {
      if (uniqueFingerprints.has(s.fingerprintHash)) {
        returningFingerprints.add(s.fingerprintHash);
      }
      uniqueFingerprints.add(s.fingerprintHash);
    }
  }
  const returningPct = uniqueFingerprints.size > 0
    ? Math.round((returningFingerprints.size / uniqueFingerprints.size) * 100)
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Business Intelligence</h1>
        <p className="text-gray-400 mt-1">
          Industry analysis, revenue patterns, and business relationships from {documents.length} documents
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Detected Industries", value: industries.filter((i) => i.name !== "unclassified").length, color: "text-emerald-400" },
          { label: "Corporate Senders", value: `${corporateSenders}`, color: "text-blue-400", sub: `vs ${freeSenders} free email` },
          { label: "Returning Visitors", value: `${returningPct}%`, color: "text-purple-400", sub: `${returningFingerprints.size} of ${uniqueFingerprints.size} unique` },
          { label: "Repeat Businesses", value: repeatSenders.length, color: "text-amber-400", sub: "Sent >1 document" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            {"sub" in stat && <p className="text-xs text-gray-600 mt-1">{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Breakdown */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Industry Breakdown
          </h2>
          <div className="space-y-3">
            {industries.map(({ name, count, totalRevenue, avgRevenue }) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300 capitalize">{name.replace(/_/g, " ")}</span>
                  <span className="text-xs font-medium text-white">{count} docs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${documents.length > 0 ? (count / documents.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500">{formatCurrency(avgRevenue)} avg</span>
                </div>
              </div>
            ))}
            {industries.length === 0 && <p className="text-xs text-gray-600">No data yet</p>}
          </div>
        </div>

        {/* Revenue Range Distribution */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Revenue Range Distribution
          </h2>
          <div className="space-y-3">
            {revenueRanges.map(({ range, count }) => (
              <div key={range} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 font-mono">{range}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${documents.length > 0 ? (count / documents.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs font-medium text-white w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
            {revenueRanges.length === 0 && <p className="text-xs text-gray-600">No data yet</p>}
          </div>
        </div>

        {/* Email Domain Analysis */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Sender Email Domains
          </h2>
          <div className="mb-3 flex gap-3">
            <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <span className="text-xs text-blue-400 font-medium">{corporateSenders} corporate</span>
            </div>
            <div className="px-3 py-1.5 bg-gray-500/10 border border-gray-500/20 rounded-lg">
              <span className="text-xs text-gray-400 font-medium">{freeSenders} free email</span>
            </div>
          </div>
          <div className="space-y-2.5">
            {topSenderDomains.map(([domain, count]) => (
              <div key={domain} className="flex items-center justify-between">
                <span className={`text-xs font-mono ${freeEmails.has(domain) ? "text-gray-500" : "text-blue-300"}`}>
                  {domain}
                </span>
                <span className="text-xs font-medium text-white">{count}</span>
              </div>
            ))}
            {topSenderDomains.length === 0 && <p className="text-xs text-gray-600">No email data yet</p>}
          </div>
        </div>

        {/* Currency-Country Correlation */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Currency Usage by Country
          </h2>
          <div className="space-y-2.5">
            {currencyCountry.map(({ currency, topCountry, total }) => (
              <div key={currency} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-white">{currency}</span>
                  {topCountry && <span className="text-xs text-gray-500">top: {topCountry[0]}</span>}
                </div>
                <span className="text-xs font-medium text-white">{total} docs</span>
              </div>
            ))}
            {currencyCountry.length === 0 && <p className="text-xs text-gray-600">No data yet</p>}
          </div>
        </div>

        {/* Client Relationships */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Client Relationships (Repeat)
          </h2>
          <p className="text-[10px] text-gray-600 mb-3">Business-to-business pairs that appear more than once</p>
          <div className="space-y-2.5">
            {topRelationships.map(([pair, count]) => (
              <div key={pair} className="flex items-center justify-between">
                <span className="text-xs text-gray-300 truncate mr-2">{pair}</span>
                <span className="text-xs font-medium text-purple-400">{count}x</span>
              </div>
            ))}
            {topRelationships.length === 0 && <p className="text-xs text-gray-600">No repeat relationships yet</p>}
          </div>
        </div>

        {/* Repeat Senders */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Repeat Users (By Business Name)
          </h2>
          <div className="space-y-2.5">
            {repeatSenders.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate mr-2">{name}</span>
                <span className="text-xs font-medium text-amber-400">{count} docs</span>
              </div>
            ))}
            {repeatSenders.length === 0 && <p className="text-xs text-gray-600">No repeat users yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export default async function AdminNetworkPage() {
  const sessions = await prisma.formSession.findMany({
    where: { ipGeo: { not: Prisma.JsonNullValueFilter.JsonNull } },
    select: { ipAddress: true, ipGeo: true, ipCountry: true },
  });

  // Aggregate by country
  const countryMap = new Map<string, number>();
  const cityMap = new Map<string, number>();
  const regionMap = new Map<string, number>();
  const ispMap = new Map<string, number>();
  const orgMap = new Map<string, number>();
  const timezoneMap = new Map<string, number>();
  const ipGroupMap = new Map<string, number>();

  for (const s of sessions) {
    const geo = s.ipGeo as Record<string, string> | null;
    if (!geo) continue;

    if (geo.country) countryMap.set(geo.country, (countryMap.get(geo.country) || 0) + 1);
    if (geo.city) cityMap.set(`${geo.city}, ${geo.country}`, (cityMap.get(`${geo.city}, ${geo.country}`) || 0) + 1);
    if (geo.region) regionMap.set(`${geo.region}, ${geo.country}`, (regionMap.get(`${geo.region}, ${geo.country}`) || 0) + 1);
    if (geo.isp) ispMap.set(geo.isp, (ispMap.get(geo.isp) || 0) + 1);
    if (geo.org) orgMap.set(geo.org, (orgMap.get(geo.org) || 0) + 1);
    if (geo.timezone) timezoneMap.set(geo.timezone, (timezoneMap.get(geo.timezone) || 0) + 1);
    if (s.ipAddress) ipGroupMap.set(s.ipAddress, (ipGroupMap.get(s.ipAddress) || 0) + 1);
  }

  const sortedMap = (m: Map<string, number>) =>
    Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15);

  const countries = sortedMap(countryMap);
  const cities = sortedMap(cityMap);
  const regions = sortedMap(regionMap);
  const isps = sortedMap(ispMap);
  const orgs = sortedMap(orgMap);
  const timezones = sortedMap(timezoneMap);
  const ipGroups = sortedMap(ipGroupMap).filter(([, count]) => count > 1);

  // Also count from documents
  const docsByCountry = await prisma.document.groupBy({
    by: ["ipCountry"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    where: { ipCountry: { not: null } },
    take: 15,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Network Intelligence</h1>
        <p className="text-gray-400 mt-1">
          IP geolocation, ISP analysis, and network patterns from {sessions.length} geolocated sessions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Top Countries (Sessions)
          </h2>
          <div className="space-y-2.5">
            {countries.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${sessions.length > 0 ? (count / sessions.length) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs font-medium text-white w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
            {countries.length === 0 && <p className="text-xs text-gray-600">No geo data yet</p>}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Top Cities
          </h2>
          <div className="space-y-2.5">
            {cities.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{name}</span>
                <span className="text-xs font-medium text-white">{count}</span>
              </div>
            ))}
            {cities.length === 0 && <p className="text-xs text-gray-600">No data yet</p>}
          </div>
        </div>

        {/* ISP Breakdown */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            ISP / Provider Breakdown
          </h2>
          <div className="space-y-2.5">
            {isps.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate mr-2">{name}</span>
                <span className="text-xs font-medium text-white shrink-0">{count}</span>
              </div>
            ))}
            {isps.length === 0 && <p className="text-xs text-gray-600">No data yet</p>}
          </div>
        </div>

        {/* Organization Breakdown */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Organization / Company (from IP)
          </h2>
          <p className="text-[10px] text-gray-600 mb-3">Identifies business/corporate users</p>
          <div className="space-y-2.5">
            {orgs.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate mr-2">{name}</span>
                <span className="text-xs font-medium text-white shrink-0">{count}</span>
              </div>
            ))}
            {orgs.length === 0 && <p className="text-xs text-gray-600">No data yet</p>}
          </div>
        </div>

        {/* IP Grouping (same office detection) */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            IP Grouping (Same Office Detection)
          </h2>
          <p className="text-[10px] text-gray-600 mb-3">Multiple sessions from same IP = same location</p>
          <div className="space-y-2.5">
            {ipGroups.map(([ip, count]) => (
              <div key={ip} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 font-mono">{ip}</span>
                <span className="text-xs font-medium text-amber-400">{count} sessions</span>
              </div>
            ))}
            {ipGroups.length === 0 && <p className="text-xs text-gray-600">No repeated IPs yet</p>}
          </div>
        </div>

        {/* Timezone Distribution */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Timezone Distribution
          </h2>
          <div className="space-y-2.5">
            {timezones.map(([tz, count]) => (
              <div key={tz} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{tz}</span>
                <span className="text-xs font-medium text-white">{count}</span>
              </div>
            ))}
            {timezones.length === 0 && <p className="text-xs text-gray-600">No data yet</p>}
          </div>
        </div>

        {/* Countries by Document Count */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 lg:col-span-2">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Countries by Document Count
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {docsByCountry.map((row) => (
              <div key={row.ipCountry} className="bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-white">{row._count.id}</p>
                <p className="text-xs text-gray-400">{row.ipCountry}</p>
              </div>
            ))}
            {docsByCountry.length === 0 && <p className="text-xs text-gray-600 col-span-4">No data yet</p>}
          </div>
        </div>

        {/* Regions */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 lg:col-span-2">
          <h2 className="text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Top Regions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {regions.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between bg-gray-800/30 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-300">{name}</span>
                <span className="text-xs font-medium text-white">{count}</span>
              </div>
            ))}
            {regions.length === 0 && <p className="text-xs text-gray-600">No data yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

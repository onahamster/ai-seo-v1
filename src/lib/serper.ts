export async function fetchSERP(query: string, gl: string = "jp", hl: string = "ja") {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      gl,
      hl,
      num: 20,
    }),
  });
  if (!res.ok) throw new Error("Failed to fetch SERP data");
  return res.json();
}

export async function checkAIOverview(query: string) {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      gl: "jp",
      hl: "ja",
      num: 10,
    }),
  });
  if (!res.ok) throw new Error("Failed to fetch AI Overview data");
  
  const data = await res.json() as any;
  return {
    hasAIOverview: !!data.aiOverview,
    aiOverviewText: data.aiOverview?.text || null,
    aiOverviewSources: data.aiOverview?.sources || [],
    organicResults: data.organic?.slice(0, 10) || [],
    relatedSearches: data.relatedSearches || [],
  };
}

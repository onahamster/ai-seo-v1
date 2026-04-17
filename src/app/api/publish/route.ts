import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { article, publishConfig } = await request.json() as any;

    const results: any = {};

    if (publishConfig.platform === "wordpress") {
      // Mocked Implementation for WordPress REST API publish
      const wpConfig = publishConfig.wordpress;
      
      const auth = btoa(`${wpConfig.username}:${wpConfig.applicationPassword}`);
      
      const response = await fetch(`${wpConfig.url}/wp-json/wp/v2/posts`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: article.title,
          content: article.content_html || article.content_markdown, 
          slug: article.slug,
          status: "draft", // or "publish"
          excerpt: article.meta_description,
          meta: {
            _yoast_wpseo_metadesc: article.meta_description,
            _yoast_wpseo_title: article.title,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`WordPress API Error: ${response.statusText}`);
      }

      const result = await response.json() as any;
      results.blog = {
        published_url: result.link,
        post_id: result.id,
        status: result.status,
      };
    } else if (publishConfig.platform === "microcms") {
      // Mocked Implementation for microCMS publish
    }

    // 配信ドラフト保存
    results.drafts = {
      reddit: article.distribution_drafts?.reddit || null,
      quora: article.distribution_drafts?.quora || null,
      linkedin: article.distribution_drafts?.linkedin || null,
      medium: article.distribution_drafts?.medium || null,
    };

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export function generateAllSchemas(
  article: any,
  company: any,
  pageUrl: string
) {
  return {
    article: generateArticleSchema(article, company, pageUrl),
    faq: generateFAQSchema(article),
    organization: generateOrganizationSchema(company),
    breadcrumb: generateBreadcrumbSchema(article, company),
    llms_txt: generateLlmsTxt(company, [article]), // Basic support for now
  };
}

function generateArticleSchema(article: any, company: any, pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.meta_description,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: company.name,
      url: company.website || "",
      sameAs: company.social_links || [],
    },
    publisher: {
      "@type": "Organization",
      name: company.name,
      logo: {
        "@type": "ImageObject",
        url: `${company.website}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    about: (article.target_keywords || []).map((kw: string) => ({
      "@type": "Thing",
      name: kw,
    })),
    wordCount: article.word_count,
    inLanguage: "ja",
  };
}

function generateFAQSchema(article: any) {
  const faqs: any[] = [];
  const content = article.content_markdown || "";
  const faqSection = content.match(/##.*?FAQ.*?\n([\s\S]*?)(?=\n##[^#]|$)/i);

  if (faqSection) {
    const qaPairs = faqSection[1].match(/###\s*(.+?)\n+([\s\S]*?)(?=\n###|$)/g);
    if (qaPairs) {
      for (const pair of qaPairs) {
        const match = pair.match(/###\s*(.+?)\n+([\s\S]*)/);
        if (match && match[1] && match[2]) {
          faqs.push({
            "@type": "Question",
            name: match[1].trim(),
            acceptedAnswer: {
              "@type": "Answer",
              text: match[2].trim().substring(0, 500),
            },
          });
        }
      }
    }
  }

  if (faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs,
  };
}

function generateOrganizationSchema(company: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: company.website,
    logo: `${company.website}/logo.png`,
    description: company.description,
    sameAs: company.social_links || [],
    knowsAbout: company.strengths || [],
    foundingDate: company.entity_info?.founding_year || undefined,
    address: company.entity_info?.location
      ? {
          "@type": "PostalAddress",
          addressLocality: company.entity_info.location,
          addressCountry: "JP",
        }
      : undefined,
  };
}

function generateBreadcrumbSchema(article: any, company: any) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: company.website || "",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${company.website}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${company.website}/blog/${article.slug}`,
      },
    ],
  };
}

export function generateLlmsTxt(company: any, articles: any[]): string {
  return `# ${company.name}

> ${company.description || "Description missing"}

## About
${company.name} is based in ${company.entity_info?.location || "Japan"}.
${company.uvp || ""}

## Core Services
${(company.strengths || []).map((s: string) => `- ${s}`).join("\n")}

## Key Information
- Website: ${company.website || ""}
- Industry: ${company.business_category || ""}
${(company.social_links || []).map((l: string) => `- ${l}`).join("\n")}

## Recent Articles
${articles
  .slice(0, 20)
  .map(
    (a: any) =>
      `- [${a.title}](${company.website}/blog/${a.slug}): ${a.meta_description}`
  )
  .join("\n")}
`;
}

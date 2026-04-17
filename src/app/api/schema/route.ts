import { NextResponse } from 'next/server';
import { generateAllSchemas } from '@/lib/schema-generator';

export async function POST(request: Request) {
  try {
    const { article, company, pageUrl } = await request.json() as any;

    if (!article || !company || !pageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const schemas = generateAllSchemas(article, company, pageUrl);

    return NextResponse.json({
      success: true,
      schemas
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

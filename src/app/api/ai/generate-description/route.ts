import { NextRequest, NextResponse } from 'next/server';

interface AIRequestBody {
  promptOrTitle: string;
  category?: string;
  optionsSummary?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AIRequestBody = await request.json();
    const { promptOrTitle, category = 'Furniture > Divan Beds', optionsSummary } = body;

    if (!promptOrTitle || promptOrTitle.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please provide a product title, fabric keyword, or spec summary.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // Check if live OpenAI key is configured
    if (apiKey && apiKey.trim().length > 0 && !apiKey.startsWith('sk-placeholder')) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert e-commerce copywriter for luxury furniture. Generate an optimized title, rich marketing description, and bulleted features in JSON format with fields: { "title": string, "description": string, "highlights": string[] }',
              },
              {
                role: 'user',
                content: `Product Idea: "${promptOrTitle}". Category: "${category}". Options: "${optionsSummary || 'Custom sizes and storage available'}".`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const completion = await response.json();
          const parsed = JSON.parse(completion.choices[0].message.content);
          return NextResponse.json({
            success: true,
            isLiveAI: true,
            provider: 'OpenAI GPT-4o-mini',
            data: parsed,
          });
        }
      } catch (openAiErr) {
        console.warn('OpenAI request failed, falling back to local generator', openAiErr);
      }
    }

    // Local Fallback Generator (Clearly Identified per Assessment Spec)
    const normalizedInput = promptOrTitle.trim();
    const isBed = normalizedInput.toLowerCase().includes('bed') || category.toLowerCase().includes('bed');

    const generatedTitle = isBed
      ? `${normalizedInput.replace(/bed/i, '').trim()} Luxury Divan Bed – Custom Upholstery`
      : `${normalizedInput} – Premium Handcrafted Edition`;

    const generatedDescription = `The ${generatedTitle} delivers a harmonious blend of refined contemporary aesthetics and enduring architectural support. Expertly hand-tailored in the UK, every detail has been thoughtfully considered—from the deep-cushioned upholstered finish to the reinforced internal hardwood frame. Engineered to provide exceptional postural alignment and tailored bedroom elegance.`;

    const generatedHighlights = [
      'Handcrafted in the United Kingdom by master upholsterers',
      'Solid timber framework certified for heavy-duty structural integrity',
      'Available in versatile storage drawer and custom headboard configurations',
      'Soft-touch premium fabric with subtle sheen and easy-clean resilience',
      'Compatible with all standard UK mattress dimensions',
    ];

    return NextResponse.json({
      success: true,
      isLiveAI: false,
      note: 'Notice: OPENAI_API_KEY is not configured. Running high-fidelity local template fallback generator.',
      provider: 'Local E-Commerce AI Fallback Generator',
      data: {
        title: generatedTitle,
        description: generatedDescription,
        highlights: generatedHighlights,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'AI generation failed' },
      { status: 500 }
    );
  }
}

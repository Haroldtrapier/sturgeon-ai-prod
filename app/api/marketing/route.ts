import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';

// DEMO MODE CHECK
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Mock marketing content for demo mode
const generateDemoContent = (contentType: string, tone: string, topic: string) => {
  return `📝 **[DEMO MODE]**

**Generated ${contentType}** (${tone} tone)
**Topic**: ${topic}

---

**Sample Content:**

${contentType === 'email' ? `
Subject: ${topic} - Strategic Partnership Opportunity

Dear [Name],

This is a sample email generated in demo mode. In production, GPT-4 would create compelling, personalized content tailored to your government contracting needs.

Key benefits:
• Professional tone and structure
• Persuasive call-to-action
• Compliant with government communication standards

Best regards,
[Your Name]
` : contentType === 'linkedin' ? `
🎯 ${topic}

This is a sample LinkedIn post generated in demo mode. In production, GPT-4 would create engaging social media content optimized for professional networks.

💡 Key insights that would be included:
• Industry-specific expertise
• Thought leadership positioning
• Engagement-driving hooks

#GovCon #FederalContracting #Government
` : contentType === 'blog' ? `
# ${topic}

## Introduction
This is a sample blog post generated in demo mode. In production, GPT-4 would create SEO-optimized, comprehensive content that positions you as an industry expert.

## Key Sections That Would Be Included:
- In-depth analysis
- Actionable insights
- Industry best practices
- Real-world examples

## Conclusion
[Professional closing with call-to-action]
` : `This is a sample ${contentType} generated in demo mode. To generate real, high-quality marketing content, set NEXT_PUBLIC_DEMO_MODE=false and add your OpenAI API key.`}

---

**🔧 To Enable Real AI-Generated Content:**
1. Set \`NEXT_PUBLIC_DEMO_MODE=false\` in .env.local
2. Add your \`OPENAI_API_KEY\` to .env.local
3. Refresh and try again!
`;
};

const openai = !DEMO_MODE && process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: Request) {
  try {
    const { contentType, tone, topic } = await request.json();

    // DEMO MODE: Return mock content
    if (DEMO_MODE) {
      console.log('🔧 DEMO MODE: Generating mock marketing content');
      return NextResponse.json({
        content: generateDemoContent(contentType, tone, topic),
        demo: true
      });
    }

    // PRODUCTION MODE: Use real OpenAI
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Add OPENAI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const prompts: Record<string, string> = {
      email: `Write a professional ${tone} email campaign about: ${topic}. Include subject line and body.`,
      linkedin: `Create a ${tone} LinkedIn post about: ${topic}. Make it engaging and professional.`,
      twitter: `Write a ${tone} Twitter thread (5-7 tweets) about: ${topic}. Start with a hook.`,
      facebook: `Create a ${tone} Facebook post about: ${topic}. Make it conversational and engaging.`,
      landing: `Write ${tone} landing page copy for: ${topic}. Include headline, subheadline, benefits, and CTA.`,
      blog: `Write a ${tone} SEO-optimized blog post about: ${topic}. Include H2/H3 headings.`,
      proposal: `Write a ${tone} executive summary for a proposal about: ${topic}.`,
      capability: `Write a ${tone} capability statement for: ${topic}. Highlight expertise and past performance.`
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert marketing copywriter specializing in government contracting. Create compelling, professional content that follows best practices.'
        },
        {
          role: 'user',
          content: prompts[contentType] || prompts['email']
        }
      ],
      temperature: 0.8,
      max_tokens: 1500,
    });

    return NextResponse.json({
      content: completion.choices[0]?.message?.content || 'No content generated',
      demo: false
    });

  } catch (error: any) {
    console.error('Marketing API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

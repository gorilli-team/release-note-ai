import { PullRequestData, ParsedPRBody, GeneratedSummary } from './types';

export async function generateSummary(
  prData: PullRequestData,
  parsedBody: ParsedPRBody,
  model?: string,
  apiKey?: string
): Promise<GeneratedSummary> {
  if (!apiKey) {
    throw new Error('API key is required for summary generation');
  }

  const prompt = buildSummarizationPrompt(prData, parsedBody);
  const summary = await callAnthropicAPI(prompt, model || 'claude-3-5-sonnet-20241022', apiKey);

  return summary;
}

function buildSummarizationPrompt(prData: PullRequestData, parsedBody: ParsedPRBody): string {
  const sections: string[] = [];

  sections.push('Generate a concise, user-friendly release note from this pull request.');
  sections.push('');
  sections.push(`PR Title: ${prData.title}`);
  sections.push('');

  if (parsedBody.whatWasDone) {
    sections.push('What was done:');
    sections.push(parsedBody.whatWasDone);
    sections.push('');
  }

  if (parsedBody.why) {
    sections.push('Why:');
    sections.push(parsedBody.why);
    sections.push('');
  }

  if (parsedBody.userImpact) {
    sections.push('User impact:');
    sections.push(parsedBody.userImpact);
    sections.push('');
  }

  if (parsedBody.technicalDetails) {
    sections.push('Technical details:');
    sections.push(parsedBody.technicalDetails);
    sections.push('');
  }

  for (const [key, value] of Object.entries(parsedBody.otherSections)) {
    sections.push(`${key}:`);
    sections.push(value);
    sections.push('');
  }

  sections.push('---');
  sections.push('');
  sections.push('Generate a JSON response with this exact structure:');
  sections.push('{');
  sections.push('  "title": "A concise title (max 80 characters) suitable for end users",');
  sections.push('  "description": "A brief one-sentence summary of the change",');
  sections.push('  "changes": ["3-5 bullet points written for end users, not developers"]');
  sections.push('}');
  sections.push('');
  sections.push('Focus on user-facing value, not implementation details. Use clear, non-technical language.');

  return sections.join('\n');
}

async function callAnthropicAPI(prompt: string, model: string, apiKey: string): Promise<GeneratedSummary> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.content || data.content.length === 0) {
    throw new Error('No content returned from Anthropic API');
  }

  const textContent = data.content[0].text;

  return parseAIResponse(textContent);
}

function parseAIResponse(text: string): GeneratedSummary {
  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    const parsed = JSON.parse(jsonText);

    return {
      title: String(parsed.title || '').substring(0, 80),
      description: String(parsed.description || ''),
      changes: Array.isArray(parsed.changes) ? parsed.changes.map(String) : [],
    };
  } catch (error) {
    throw new Error(`Failed to parse AI response as JSON: ${error}`);
  }
}

export function createFallbackSummary(prData: PullRequestData, parsedBody: ParsedPRBody): GeneratedSummary {
  const title = prData.title.length > 80 ? prData.title.substring(0, 77) + '...' : prData.title;

  const description = parsedBody.userImpact || parsedBody.why || parsedBody.whatWasDone || prData.title;

  const changes: string[] = [];

  if (parsedBody.whatWasDone) {
    const bullets = extractSimpleBullets(parsedBody.whatWasDone);
    changes.push(...bullets);
  }

  if (changes.length === 0 && parsedBody.userImpact) {
    const bullets = extractSimpleBullets(parsedBody.userImpact);
    changes.push(...bullets);
  }

  if (changes.length === 0) {
    changes.push(prData.title);
  }

  return {
    title,
    description: description.split('\n')[0].substring(0, 200),
    changes: changes.slice(0, 5),
  };
}

function extractSimpleBullets(text: string): string[] {
  const bullets: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);

    if (bulletMatch) {
      bullets.push(bulletMatch[1].trim());
    } else if (numberedMatch) {
      bullets.push(numberedMatch[1].trim());
    }
  }

  return bullets;
}

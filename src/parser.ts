import { PullRequestData, ParsedPRBody } from './types';

const LABEL_TAG_MAP: Record<string, string> = {
  'bug': 'fix',
  'fix': 'fix',
  'bugfix': 'fix',
  'feature': 'feature',
  'enhancement': 'feature',
  'feat': 'feature',
  'refactor': 'refactor',
  'refactoring': 'refactor',
  'infrastructure': 'infra',
  'infra': 'infra',
  'ci': 'infra',
  'deployment': 'infra',
  'documentation': 'docs',
  'docs': 'docs',
  'chore': 'chore',
  'maintenance': 'chore',
  'dependencies': 'dependencies',
  'deps': 'dependencies',
  'security': 'security',
  'breaking': 'breaking-change',
  'breaking-change': 'breaking-change',
};

export function parsePRBody(body: string): ParsedPRBody {
  if (!body || body.trim() === '') {
    return { otherSections: {} };
  }

  const sections: ParsedPRBody = { otherSections: {} };

  const lines = body.split('\n');
  let currentSection: string | null = null;
  let currentContent: string[] = [];

  const savePreviousSection = () => {
    if (currentSection && currentContent.length > 0) {
      const content = currentContent.join('\n').trim();
      const lowerSection = currentSection.toLowerCase();

      if (lowerSection.includes('what') && (lowerSection.includes('done') || lowerSection.includes('changed'))) {
        sections.whatWasDone = content;
      } else if (lowerSection.includes('why') || lowerSection.includes('motivation')) {
        sections.why = content;
      } else if (lowerSection.includes('user') && lowerSection.includes('impact')) {
        sections.userImpact = content;
      } else if (lowerSection.includes('technical') || lowerSection.includes('implementation')) {
        sections.technicalDetails = content;
      } else {
        sections.otherSections[currentSection] = content;
      }
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if this is a section header (starts with ## or ###)
    const headerMatch = trimmedLine.match(/^#{2,3}\s+(.+)$/);
    if (headerMatch) {
      savePreviousSection();
      currentSection = headerMatch[1].trim();
      currentContent = [];
      continue;
    }

    if (currentSection !== null) {
      currentContent.push(line);
    }
  }

  savePreviousSection();

  return sections;
}

export function normalizeTags(labels: string[]): string[] {
  const tags = new Set<string>();

  for (const label of labels) {
    const normalizedLabel = label.toLowerCase().trim();
    const tag = LABEL_TAG_MAP[normalizedLabel];

    if (tag) {
      tags.add(tag);
    } else if (normalizedLabel) {
      tags.add(normalizedLabel);
    }
  }

  return Array.from(tags);
}

export function extractAuthors(prData: PullRequestData): string[] {
  const authors = new Set<string>();

  if (prData.authors && prData.authors.length > 0) {
    prData.authors.forEach(author => authors.add(author));
  }

  return Array.from(authors);
}

export function extractChangesFromParsedBody(parsed: ParsedPRBody): string[] {
  const changes: string[] = [];

  if (parsed.whatWasDone) {
    const bullets = extractBulletPoints(parsed.whatWasDone);
    changes.push(...bullets);
  }

  if (changes.length === 0 && parsed.userImpact) {
    const bullets = extractBulletPoints(parsed.userImpact);
    changes.push(...bullets);
  }

  return changes;
}

function extractBulletPoints(text: string): string[] {
  const bullets: string[] = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Match bullet points (-, *, +) or numbered lists
    const bulletMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);

    if (bulletMatch) {
      bullets.push(bulletMatch[1].trim());
    } else if (numberedMatch) {
      bullets.push(numberedMatch[1].trim());
    } else if (trimmed && !trimmed.startsWith('#')) {
      // If it's not a header and has content, include it
      if (bullets.length === 0 || trimmed.length > 20) {
        bullets.push(trimmed);
      }
    }
  }

  return bullets;
}

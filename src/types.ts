export interface PullRequestData {
  number: number;
  title: string;
  body: string;
  labels: string[];
  authors: string[];
  mergedAt: string;
  url: string;
}

export interface ParsedPRBody {
  whatWasDone?: string;
  why?: string;
  userImpact?: string;
  technicalDetails?: string;
  otherSections: Record<string, string>;
}

export interface GeneratedSummary {
  title: string;
  description: string;
  changes: string[];
}

export interface ReleaseNote {
  title: string;
  description: string;
  changes: string[];
  tags: string[];
  pr: {
    number: number;
    url: string;
    authors: string[];
    mergedAt: string;
  };
  raw: {
    title: string;
    body: string;
    labels: string[];
  };
}

export interface ActionInputs {
  githubToken: string;
  generateSummary: boolean;
  model?: string;
  anthropicApiKey?: string;
}

import * as core from '@actions/core';
import * as github from '@actions/github';
import { PullRequestData, ReleaseNote, ActionInputs } from './types';
import { parsePRBody, normalizeTags, extractAuthors, extractChangesFromParsedBody } from './parser';
import { generateSummary, createFallbackSummary } from './summarizer';

async function run(): Promise<void> {
  try {
    const inputs = getInputs();
    const prData = await getPullRequestData(inputs.githubToken);

    if (!prData) {
      core.setFailed('This action must be run on a merged pull request');
      return;
    }

    const releaseNote = await buildReleaseNote(prData, inputs);

    const jsonOutput = JSON.stringify(releaseNote, null, 2);
    core.setOutput('release_note', jsonOutput);

    core.info('Release note generated successfully');
    core.info(jsonOutput);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unknown error occurred');
    }
  }
}

function getInputs(): ActionInputs {
  const githubToken = core.getInput('github_token', { required: true });
  const generateSummaryInput = core.getInput('generate_summary');
  const generateSummary = generateSummaryInput === 'true';
  const model = core.getInput('model') || undefined;
  const anthropicApiKey = core.getInput('anthropic_api_key') || undefined;

  if (generateSummary && !anthropicApiKey) {
    throw new Error('anthropic_api_key is required when generate_summary is true');
  }

  return {
    githubToken,
    generateSummary,
    model,
    anthropicApiKey,
  };
}

async function getPullRequestData(token: string): Promise<PullRequestData | null> {
  const context = github.context;

  if (context.eventName !== 'pull_request') {
    core.warning(`Event is ${context.eventName}, expected pull_request`);
    return null;
  }

  const payload = context.payload;

  if (payload.action !== 'closed') {
    core.warning(`PR action is ${payload.action}, expected closed`);
    return null;
  }

  const pr = payload.pull_request;

  if (!pr) {
    core.warning('No pull request found in payload');
    return null;
  }

  if (!pr.merged) {
    core.warning('Pull request was closed but not merged');
    return null;
  }

  if (pr.base?.ref !== 'main') {
    core.warning(`PR was merged to ${pr.base?.ref}, expected main`);
    return null;
  }

  const octokit = github.getOctokit(token);

  const { data: fullPR } = await octokit.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pr.number,
  });

  const authors = new Set<string>();
  authors.add(fullPR.user?.login || 'unknown');

  const { data: commits } = await octokit.rest.pulls.listCommits({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pr.number,
  });

  for (const commit of commits) {
    if (commit.author?.login) {
      authors.add(commit.author.login);
    }
  }

  return {
    number: pr.number,
    title: pr.title || '',
    body: pr.body || '',
    labels: (pr.labels || []).map((label: { name?: string }) => label.name || '').filter(Boolean),
    authors: Array.from(authors),
    mergedAt: pr.merged_at || new Date().toISOString(),
    url: pr.html_url || '',
  };
}

async function buildReleaseNote(prData: PullRequestData, inputs: ActionInputs): Promise<ReleaseNote> {
  const parsedBody = parsePRBody(prData.body);
  const tags = normalizeTags(prData.labels);
  const authors = extractAuthors(prData);

  let title = prData.title;
  let description = '';
  let changes: string[] = [];

  if (inputs.generateSummary && inputs.anthropicApiKey) {
    try {
      const summary = await generateSummary(prData, parsedBody, inputs.model, inputs.anthropicApiKey);
      title = summary.title;
      description = summary.description;
      changes = summary.changes;
    } catch (error) {
      core.warning(`Failed to generate AI summary: ${error}. Falling back to parsed content.`);
      const fallback = createFallbackSummary(prData, parsedBody);
      title = fallback.title;
      description = fallback.description;
      changes = fallback.changes;
    }
  } else {
    const fallback = createFallbackSummary(prData, parsedBody);
    title = fallback.title;
    description = fallback.description;
    changes = fallback.changes.length > 0 ? fallback.changes : extractChangesFromParsedBody(parsedBody);
  }

  return {
    title,
    description,
    changes,
    tags,
    pr: {
      number: prData.number,
      url: prData.url,
      authors,
      mergedAt: prData.mergedAt,
    },
    raw: {
      title: prData.title,
      body: prData.body,
      labels: prData.labels,
    },
  };
}

run();

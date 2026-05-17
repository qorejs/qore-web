import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const sourceDirs = ['api', 'blog', 'examples', 'guide', 'zh'];
const rootDocs = ['README.md', 'index.md'];
const codeLanguages = new Set(['ts', 'tsx', 'js', 'javascript', 'typescript']);
const allowedQoreExports = new Set([
  'AppContext',
  'BackpressureOptions',
  'ComputedSignal',
  'EffectOptions',
  'EffectScheduler',
  'ProviderRequestOptions',
  'QoreChild',
  'QoreDocumentFragment',
  'QoreElement',
  'QoreNode',
  'QoreStream',
  'QoreText',
  'ReadonlySignal',
  'ResponseRenderState',
  'ResponseState',
  'SSEAdapter',
  'SSEEvent',
  'Signal',
  'StreamController',
  'batch',
  'computed',
  'createAnthropic',
  'createApp',
  'createOpenAI',
  'createResponse',
  'createSSEAdapter',
  'dynamic',
  'effect',
  'fragment',
  'from',
  'h',
  'isSignal',
  'list',
  'mapStream',
  'mount',
  'normalizeError',
  'renderResponse',
  'response',
  'scanStream',
  'show',
  'signal',
  'sleep',
  'stream',
  'text',
  'toAsyncIterable',
  'untrack'
]);

function walkMarkdown(dir) {
  const files = [];

  if (!existsSync(dir)) {
    return files;
  }

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkMarkdown(path));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(path);
    }
  }

  return files;
}

function sourceMarkdownFiles() {
  const files = [];

  for (const doc of rootDocs) {
    const path = join(root, doc);

    if (existsSync(path)) {
      files.push(path);
    }
  }

  for (const dir of sourceDirs) {
    files.push(...walkMarkdown(join(root, dir)));
  }

  return files.sort();
}

function extractCodeBlocks(markdown) {
  const blocks = [];
  const pattern = /```([\w-]+)?[^\n]*\n([\s\S]*?)```/g;
  let match;

  while ((match = pattern.exec(markdown))) {
    blocks.push({
      language: match[1] ?? '',
      code: match[2] ?? '',
      offset: match.index
    });
  }

  return blocks;
}

function lineForOffset(content, offset) {
  return content.slice(0, offset).split('\n').length;
}

function importedQoreNames(code) {
  const names = new Set();
  const importPattern = /import\s*\{([^}]+)\}\s*from\s*['"]@qorejs\/qore['"]/g;
  let match;

  while ((match = importPattern.exec(code))) {
    for (const rawName of match[1].split(',')) {
      const name = rawName
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0]
        ?.trim();

      if (name) {
        names.add(name);
      }
    }
  }

  return names;
}

const failures = [];
const files = sourceMarkdownFiles();

for (const filePath of files) {
  const relativePath = relative(root, filePath);
  const content = readFileSync(filePath, 'utf8');

  for (const block of extractCodeBlocks(content)) {
    if (!codeLanguages.has(block.language)) {
      continue;
    }

    for (const importedName of importedQoreNames(block.code)) {
      if (!allowedQoreExports.has(importedName)) {
        failures.push(`${relativePath}:${lineForOffset(content, block.offset)} imports unsupported Qore API '${importedName}'.`);
      }
    }

    if (/from\s*['"]qore\/ai['"]/.test(block.code)) {
      failures.push(`${relativePath}:${lineForOffset(content, block.offset)} imports removed qore/ai helper.`);
    }

    if (/createSSEAdapter\s*\(\s*\{[\s\S]*?\bendpoint\s*:/.test(block.code)) {
      failures.push(`${relativePath}:${lineForOffset(content, block.offset)} uses endpoint; createSSEAdapter expects url.`);
    }

    if (/\bcomponent\s*\(/.test(block.code)) {
      failures.push(`${relativePath}:${lineForOffset(content, block.offset)} uses removed component() helper; use plain functions plus h().`);
    }
  }
}

if (failures.length > 0) {
  console.error('Documentation API validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`docs-api-ok ${files.length} files`);

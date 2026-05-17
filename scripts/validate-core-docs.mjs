import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));

const coreDocs = [
  'guide/quick-start.md',
  'guide/streaming.md',
  'guide/ai-native.md',
  'api/streaming.md',
  'examples/ai-integration.md',
  'zh/guide/quick-start.md',
  'zh/guide/streaming.md',
  'zh/guide/ai-native.md',
  'zh/api/streaming.md',
  'zh/examples/ai-integration.md'
];

const allowedQoreExports = new Set([
  'batch',
  'computed',
  'createAnthropic',
  'createOpenAI',
  'createSSEAdapter',
  'effect',
  'h',
  'list',
  'mapStream',
  'mount',
  'scanStream',
  'signal',
  'stream',
  'text'
]);

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
      const name = rawName.trim().split(/\s+as\s+/)[0]?.trim();

      if (name) {
        names.add(name);
      }
    }
  }

  return names;
}

const failures = [];

for (const relativePath of coreDocs) {
  const filePath = join(root, relativePath);
  const content = readFileSync(filePath, 'utf8');

  for (const block of extractCodeBlocks(content)) {
    if (!['ts', 'tsx', 'js', 'javascript', 'typescript'].includes(block.language)) {
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
  }
}

if (failures.length > 0) {
  console.error('Core documentation validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`core-docs-ok ${coreDocs.length} files`);

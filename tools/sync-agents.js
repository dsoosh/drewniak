// Copies project skills and agents from .claude/ to .github/ so Copilot sees the same ones.
// OpenSpec skills are generated for both by `openspec init` and are left alone.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const own = ['ciesielka-i-stolarka', 'nowa-konstrukcja', 'wydanie'];

for (const name of own) {
  const src = path.join(root, '.claude/skills', name);
  const dst = path.join(root, '.github/skills', name);
  fs.mkdirSync(dst, { recursive: true });
  for (const f of fs.readdirSync(src)) fs.copyFileSync(path.join(src, f), path.join(dst, f));
}

fs.mkdirSync(path.join(root, '.github/agents'), { recursive: true });
for (const f of fs.readdirSync(path.join(root, '.claude/agents'))) {
  const text = fs.readFileSync(path.join(root, '.claude/agents', f), 'utf8')
    .replace(/^tools: .*$/m, "tools: ['read', 'search', 'execute']")
    .replace(/\.claude\/skills\//g, '.github/skills/');
  fs.writeFileSync(path.join(root, '.github/agents', f.replace(/\.md$/, '.agent.md')), text);
}
console.log('synced', own.join(', '), '+ agents');

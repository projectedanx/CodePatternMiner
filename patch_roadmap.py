with open('ROADMAP.md', 'r') as f:
    content = f.read()

content += "\n## Algorithmic Reparations\n- [x] Refactored `PatternCatalog.tsx` to reduce cognitive complexity by extracting `PatternDetailPanel.tsx` and updated to use semantic color tokens.\n"

with open('ROADMAP.md', 'w') as f:
    f.write(content)

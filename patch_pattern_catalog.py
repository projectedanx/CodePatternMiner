import re

with open('components/PatternCatalog.tsx', 'r') as f:
    content = f.read()

# Replace imports
content = content.replace(
    "import { PatternCard, PatternLinkRenderer } from './PatternCard';",
    "import { PatternCard } from './PatternCard';\nimport { PatternDetailPanel } from './PatternDetailPanel';"
)

content = content.replace(
    "import { ASTVisualizer } from './ASTVisualizer';",
    "" # remove as it is in PatternDetailPanel
)

content = content.replace(
    "import { X, Copy, Tag, Code2, FileText, Share2, Filter, Activity, Search } from 'lucide-react';",
    "import { X, Filter, Activity, Search } from 'lucide-react';"
)

# Extract and remove detail slide-over
detail_slide_over_pattern = re.compile(r"\{\s*/\*\s*Detail Slide-over\s*\*/\s*\}\s*\{\s*selected &&\s*\(\s*<div.*?</div>\s*\)\s*\}", re.DOTALL)
content = re.sub(detail_slide_over_pattern, """{/* Detail Slide-over */}
      <PatternDetailPanel
        selected={selected}
        onClose={() => setSelected(null)}
        allPatternNames={allPatternNames}
        onLinkClick={handleLinkClick}
      />""", content)

with open('components/PatternCatalog.tsx', 'w') as f:
    f.write(content)

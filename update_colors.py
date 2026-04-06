import re
import os

files = ['components/PatternCatalog.tsx', 'components/PatternDetailPanel.tsx', 'components/PatternCard.tsx', 'components/MinerDashboard.tsx', 'components/Layout.tsx', 'components/ASTVisualizer.tsx']

for filepath in files:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()

    # Apply semantic replacements
    # General colors
    content = content.replace("text-white", "text-primary")
    content = content.replace("bg-white", "bg-primary")
    content = content.replace("border-white", "border-primary")

    content = content.replace("text-gray-300", "text-secondary")
    content = content.replace("text-gray-400", "text-secondary")
    content = content.replace("text-gray-500", "text-tertiary")
    content = content.replace("text-gray-600", "text-tertiary")

    # Specific surface backgrounds (that might conflict with some literal black/void tokens depending on context, keeping simple)
    content = content.replace("bg-void-light", "bg-surface-light")
    content = content.replace("bg-void", "bg-surface")

    # border-white/5 etc -> usually border-border-subtle
    content = re.sub(r'border-primary/[0-9]+', 'border-border-subtle', content)

    # bg-black/40 etc -> bg-surface-light
    content = re.sub(r'bg-black/[0-9]+', 'bg-surface-light', content)

    # Note: text-primary/40 might be generated, that's fine if we want opacity on primary,
    # but we should ensure semantic names. We'll leave the opacity modifiers alone since tailwind handles it.

    with open(filepath, 'w') as f:
        f.write(content)

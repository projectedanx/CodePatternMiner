import re

with open('index.html', 'r') as f:
    content = f.read()

replacement = """            colors: {
              'void': '#09090b',
              'void-light': '#18181b',
              'neon-cyan': '#06b6d4',
              'neon-purple': '#8b5cf6',
              'signal-green': '#10b981',
              'alert-red': '#ef4444',
              'primary': 'var(--primary, #ffffff)',
              'secondary': 'var(--secondary, #a1a1aa)',
              'tertiary': 'var(--tertiary, #71717a)',
              'surface': 'var(--surface, #09090b)',
              'surface-light': 'var(--surface-light, #18181b)',
              'border-subtle': 'var(--border-subtle, rgba(255,255,255,0.1))',
            }"""

content = re.sub(r"colors: \{[^\}]+\}", replacement, content)

with open('index.html', 'w') as f:
    f.write(content)

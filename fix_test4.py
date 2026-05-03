import re

with open("tests/PatternDetailPanel.test.tsx", "r") as f:
    content = f.read()

# Mock ASTVisualizer completely to bypass D3 JSDOM issues
ast_mock = """import { ASTVisualizer } from '../components/ASTVisualizer';

vi.mock('../components/ASTVisualizer', () => ({
  ASTVisualizer: () => <div data-testid="mock-ast-visualizer" />
}));
"""

# replace d3 mock with component mock
content = re.sub(r"vi\.mock\('d3', async \(\) => \{.*?\}\);\n", ast_mock, content, flags=re.DOTALL)

with open("tests/PatternDetailPanel.test.tsx", "w") as f:
    f.write(content)

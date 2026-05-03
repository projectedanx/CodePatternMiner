import re

with open("tests/PatternDetailPanel.test.tsx", "r") as f:
    content = f.read()

# We need to mock fetchASTFromPhantomStorage since it resolves async and sets state
import_mock = """import { fixerAgent } from '../services/intelligence/FixerAgent';
import { fetchASTFromPhantomStorage } from '../services/phantomStorage';

vi.mock('../services/phantomStorage', () => ({
  fetchASTFromPhantomStorage: vi.fn().mockResolvedValue({ name: 'root', type: 'Program', children: [] })
}));
"""

content = content.replace("import { fixerAgent } from '../services/intelligence/FixerAgent';", import_mock)

with open("tests/PatternDetailPanel.test.tsx", "w") as f:
    f.write(content)

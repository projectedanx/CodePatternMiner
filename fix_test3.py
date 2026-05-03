import re

with open("tests/PatternDetailPanel.test.tsx", "r") as f:
    content = f.read()

# Mock d3 functions fully
d3_mock = """import { fixerAgent } from '../services/intelligence/FixerAgent';
import { fetchASTFromPhantomStorage } from '../services/phantomStorage';

vi.mock('../services/phantomStorage', () => ({
  fetchASTFromPhantomStorage: vi.fn().mockResolvedValue({ name: 'root', type: 'Program', children: [] })
}));

vi.mock('d3', async () => {
  const original = await vi.importActual('d3');
  const zoomMock = {
    scaleExtent: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    transform: vi.fn()
  };
  return {
    ...original,
    zoom: vi.fn().mockReturnValue(zoomMock),
    zoomIdentity: {
      translate: vi.fn().mockReturnValue({ scale: vi.fn().mockReturnValue({}) })
    },
    zoomTransform: vi.fn().mockReturnValue({ x: 0, y: 0, k: 1 })
  };
});
"""

content = re.sub(r"import \{ fixerAgent \} from '\.\./services/intelligence/FixerAgent';\nimport \{ fetchASTFromPhantomStorage \} from '\.\./services/phantomStorage';.*?vi\.mock\('d3', async \(\) => \{.*?\}\);\n", d3_mock, content, flags=re.DOTALL)


with open("tests/PatternDetailPanel.test.tsx", "w") as f:
    f.write(content)

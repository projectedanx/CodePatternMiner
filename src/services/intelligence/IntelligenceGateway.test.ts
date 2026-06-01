import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Define a mock generateContent function so we can change its implementation per test
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: mockGenerateContent
        }
      };
    }),
    Type: {
      ARRAY: 'ARRAY',
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER'
    }
  };
});

describe('IntelligenceGateway - scoutPatterns', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, API_KEY: 'test-api-key' };

    // Mock crypto.randomUUID
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: () => '1234-5678-9012-3456'
      },
      configurable: true
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should successfully retrieve and enrich patterns', async () => {
    const mockResponseText = JSON.stringify([
      {
        name: 'testFunction',
        type: 'FUNCTION',
        description: 'A test function',
        code: 'function test() {}',
        complexity: 1,
        ast: { name: 'Program', type: 'Program', children: [] }
      }
    ]);

    mockGenerateContent.mockResolvedValueOnce({
      text: mockResponseText
    });

    const topic = 'Test Topic';
    // We need to re-import dynamically if we want the module to see the new env variable
    // but the file initializes API_KEY outside functions.
    // Vitest has vi.stubEnv but we might need to reset module registry to re-evaluate module level vars
    const { intelligenceGateway } = await import('./IntelligenceGateway');
    const result = await intelligenceGateway.scoutPatterns(topic);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent.mock.calls[0][0].contents).toContain(`TOPIC: "${topic}"`);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'testFunction',
      type: 'FUNCTION',
      description: 'A test function',
      code: 'function test() {}',
      complexity: 1,
      origin: 'NEURAL_MINE',
      id: expect.any(String)
    });
  });

  it('should return an empty array if response text is missing', async () => {
    mockGenerateContent.mockResolvedValueOnce({});

    const { intelligenceGateway } = await import('./IntelligenceGateway');
    const result = await intelligenceGateway.scoutPatterns('Test Topic');

    expect(result).toEqual([]);
  });

  it('should throw an error if the generation fails', async () => {
    const error = new Error('API Error');
    mockGenerateContent.mockImplementationOnce(() => Promise.reject(error));

    const { intelligenceGateway } = await import('./IntelligenceGateway');
    await expect(intelligenceGateway.scoutPatterns('Test Topic')).rejects.toThrow('API Error');
  });

  it('should throw an error if the API_KEY is missing', async () => {
    // Modify env and re-import to force the module-level variable to read the empty key
    vi.stubEnv('API_KEY', '');
    const importedModule = await import('./IntelligenceGateway');
    await expect(importedModule.intelligenceGateway.scoutPatterns('Test Topic')).rejects.toThrow('API Key not found in environment');
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });
});

describe('IntelligenceGateway - analyzeCodeBlock', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, API_KEY: 'test-api-key' };

    // Mock crypto.randomUUID
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: () => '1234-5678-9012-3456'
      },
      configurable: true
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should throw an error if the generation fails', async () => {
    const error = new Error('API Error');
    mockGenerateContent.mockImplementationOnce(() => Promise.reject(error));

    const { intelligenceGateway } = await import('./IntelligenceGateway');
    await expect(intelligenceGateway.analyzeCodeBlock('function test() {}')).rejects.toThrow('API Error');
  });

  it('should successfully analyze a code block and enrich patterns', async () => {
    const mockResponseText = JSON.stringify([
      {
        name: 'testFunction',
        type: 'FUNCTION',
        description: 'A test function',
        code: 'function test() {}',
        complexity: 1,
        ast: { name: 'Program', type: 'Program', children: [] }
      }
    ]);

    mockGenerateContent.mockResolvedValueOnce({
      text: mockResponseText
    });

    const code = 'function test() {}';
    const { intelligenceGateway } = await import('./IntelligenceGateway');
    const result = await intelligenceGateway.analyzeCodeBlock(code);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent.mock.calls[0][0].contents).toContain(code);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'testFunction',
      type: 'FUNCTION',
      description: 'A test function',
      code: 'function test() {}',
      complexity: 1,
      origin: 'USER_INPUT',
      id: expect.any(String)
    });
  });

  it('should return an empty array if response text is missing', async () => {
    mockGenerateContent.mockResolvedValueOnce({});

    const { intelligenceGateway } = await import('./IntelligenceGateway');
    const result = await intelligenceGateway.analyzeCodeBlock('function test() {}');

    expect(result).toEqual([]);
  });

  it('should throw an error if the API_KEY is missing', async () => {
    vi.stubEnv('API_KEY', '');
    const importedModule = await import('./IntelligenceGateway');
    await expect(importedModule.intelligenceGateway.analyzeCodeBlock('function test() {}')).rejects.toThrow('API Key not found in environment');
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });
});

describe('IntelligenceGateway - generateSearchQuery', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv, API_KEY: 'test-api-key' };

    // Mock crypto.randomUUID
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: () => '1234-5678-9012-3456'
      },
      configurable: true
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should generate semantic search tags successfully', async () => {
    const mockResponseText = JSON.stringify(['tag1', 'tag2', 'tag3']);

    mockGenerateContent.mockResolvedValueOnce({
      text: mockResponseText
    });

    const query = 'How to use React hooks';
    const { intelligenceGateway } = await import('./IntelligenceGateway');
    const result = await intelligenceGateway.generateSearchQuery(query);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    expect(mockGenerateContent.mock.calls[0][0].contents).toContain(`Generate 5 semantic search tags for the coding query: "${query}"`);
    expect(result).toEqual(['tag1', 'tag2', 'tag3']);
  });

  it('should return an empty array if response text is missing', async () => {
    mockGenerateContent.mockResolvedValueOnce({});

    const { intelligenceGateway } = await import('./IntelligenceGateway');
    const result = await intelligenceGateway.generateSearchQuery('How to use React hooks');

    expect(result).toEqual([]);
  });

  it('should throw an error if the generation fails', async () => {
    const error = new Error('API Error');
    mockGenerateContent.mockImplementationOnce(() => Promise.reject(error));

    const { intelligenceGateway } = await import('./IntelligenceGateway');
    await expect(intelligenceGateway.generateSearchQuery('How to use React hooks')).rejects.toThrow('API Error');
  });

  it('should throw an error if the API_KEY is missing', async () => {
    vi.stubEnv('API_KEY', '');
    const importedModule = await import('./IntelligenceGateway');
    await expect(importedModule.intelligenceGateway.generateSearchQuery('How to use React hooks')).rejects.toThrow('API Key not found in environment');
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });
});

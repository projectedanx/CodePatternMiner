import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as geminiService from './geminiService';

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

describe('geminiService - scoutPatterns', () => {
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
    const { scoutPatterns } = await import('./geminiService');
    const result = await scoutPatterns(topic);

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
      id: '1234-5678-9012-3456'
    });
  });

  it('should return an empty array if response text is missing', async () => {
    mockGenerateContent.mockResolvedValueOnce({});

    const { scoutPatterns } = await import('./geminiService');
    const result = await scoutPatterns('Test Topic');

    expect(result).toEqual([]);
  });

  it('should throw an error if the generation fails', async () => {
    const error = new Error('API Error');
    mockGenerateContent.mockRejectedValueOnce(error);

    const { scoutPatterns } = await import('./geminiService');
    await expect(scoutPatterns('Test Topic')).rejects.toThrow('API Error');
  });

  it('should throw an error if the API_KEY is missing', async () => {
    // Modify env and re-import to force the module-level variable to read the empty key
    process.env.API_KEY = '';
    const importedModule = await import(`./geminiService?t=${Date.now()}`); // force re-evaluate
    await expect(importedModule.scoutPatterns('Test Topic')).rejects.toThrow('API Key not found in environment');
    expect(mockGenerateContent).not.toHaveBeenCalled();
  });
});

describe('geminiService - analyzeCodeBlock', () => {
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
    mockGenerateContent.mockRejectedValueOnce(error);

    const { analyzeCodeBlock } = await import('./geminiService');
    await expect(analyzeCodeBlock('function test() {}')).rejects.toThrow('API Error');
  });
});

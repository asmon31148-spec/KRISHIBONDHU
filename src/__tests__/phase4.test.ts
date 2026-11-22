import { describe, it, expect } from 'vitest';
import { buildSystemPrompt } from '../lib/ai/chat';

describe('Phase 4 Verification: AI Assistant Grounding & System Prompting', () => {
  it('generates Bengali system prompt with West Bengal vernacular dialect instructions', () => {
    const prompt = buildSystemPrompt('bn');
    expect(prompt).toContain('Krishibondhu AI');
    expect(prompt).toContain('West Bengal');
    expect(prompt).toContain('standard Bengali (বাংলা)');
    expect(prompt).toContain('বিঘা');
  });

  it('generates Hindi system prompt with Devanagari dialect instructions', () => {
    const prompt = buildSystemPrompt('hi');
    expect(prompt).toContain('standard Hindi (हिन्दी)');
    expect(prompt).toContain('बीघा');
    expect(prompt).toContain('झुलसा');
  });

  it('injects authenticated farmer profile context into prompt', () => {
    const prompt = buildSystemPrompt('en', {
      name: 'Ashok Das',
      district: 'Burdwan',
      state: 'West Bengal',
      crops: ['Potato', 'Boro Rice'],
      soilType: 'alluvial',
    });

    expect(prompt).toContain('Ashok Das');
    expect(prompt).toContain('Burdwan');
    expect(prompt).toContain('Potato, Boro Rice');
    expect(prompt).toContain('alluvial');
  });

  it('mandates chemical pesticide safety protocol in all assistant prompts', () => {
    const prompt = buildSystemPrompt('en');
    expect(prompt).toContain('Wear protective face mask and gloves');
    expect(prompt).toContain('Strictly follow the manufacturer');
    expect(prompt).toContain('Observe the waiting period (PHI) before harvesting');
  });
});

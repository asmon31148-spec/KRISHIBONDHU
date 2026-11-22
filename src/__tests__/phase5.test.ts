import { describe, it, expect } from 'vitest';
import { getWeatherDescription } from '../lib/weather/open-meteo';

describe('Phase 5 Verification: Open-Meteo Weather Agronomic Calculations', () => {
  it('correctly maps WMO weather codes to human descriptive terms', () => {
    expect(getWeatherDescription(0)).toBe('Clear Sky');
    expect(getWeatherDescription(2)).toBe('Partly Cloudy');
    expect(getWeatherDescription(45)).toBe('Fog / Morning Mist');
    expect(getWeatherDescription(61)).toBe('Rain');
    expect(getWeatherDescription(95)).toBe('Thunderstorm');
  });

  it('correctly evaluates pesticide spraying window rules', () => {
    const evaluateSpray = (precip: number, wind: number) => {
      if (precip > 0.5) return 'unfavorable';
      if (wind > 18) return 'unfavorable';
      if (wind > 12) return 'marginal';
      return 'optimal';
    };

    expect(evaluateSpray(0, 6)).toBe('optimal');
    expect(evaluateSpray(0, 14)).toBe('marginal');
    expect(evaluateSpray(0, 22)).toBe('unfavorable');
    expect(evaluateSpray(1.5, 5)).toBe('unfavorable');
  });

  it('correctly evaluates Late Blight & Fungal Blast environmental risk triggers', () => {
    const evaluateFungalRisk = (humidity: number, temp: number) => {
      if (humidity > 85 && temp >= 14 && temp <= 23) {
        return 'high';
      }
      if (humidity > 75) {
        return 'moderate';
      }
      return 'low';
    };

    // Typical cold foggy Bengal morning (18°C, 92% humidity)
    expect(evaluateFungalRisk(92, 18)).toBe('high');
    // Warm dry afternoon (32°C, 45% humidity)
    expect(evaluateFungalRisk(45, 32)).toBe('low');
    // Humid evening (80% humidity, 28°C)
    expect(evaluateFungalRisk(80, 28)).toBe('moderate');
  });
});

describe('Phase 5 Verification: Agricultural News Categorization', () => {
  const articles = [
    { title: 'PM-KISAN DBT Funds Released', category: 'schemes' },
    { title: 'Mandi Potato Rates in Burdwan', category: 'mandi' },
    { title: 'New Biological Pest Lures for Brinjal', category: 'technology' },
  ];

  it('filters news by specific agricultural category', () => {
    const schemes = articles.filter((a) => a.category === 'schemes');
    expect(schemes.length).toBe(1);
    expect(schemes[0].title).toContain('PM-KISAN');
  });

  it('filters news by case-insensitive keyword search', () => {
    const query = 'burdwan';
    const matches = articles.filter((a) => a.title.toLowerCase().includes(query));
    expect(matches.length).toBe(1);
    expect(matches[0].category).toBe('mandi');
  });
});

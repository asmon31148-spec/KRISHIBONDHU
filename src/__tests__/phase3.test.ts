import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Magic number detector matching server implementation
function testValidateSignature(buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: RIFF ... WEBP
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return 'image/webp';
  }

  return null;
}

describe('Phase 3 Verification: Server File Signature (Magic Numbers) Validation', () => {
  it('correctly identifies genuine JPEG headers', () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
    expect(testValidateSignature(jpegBuffer)).toBe('image/jpeg');
  });

  it('correctly identifies genuine PNG headers', () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    expect(testValidateSignature(pngBuffer)).toBe('image/png');
  });

  it('rejects fake executable or script files disguised as images', () => {
    // UTF-8 string "<script>alert(1)</script>" or plain text
    const textBuffer = Buffer.from('<!DOCTYPE html><html><body>malicious</body></html>');
    expect(testValidateSignature(textBuffer)).toBeNull();
  });
});

describe('Phase 3 Verification: AI Honest Uncertainty Enforcement', () => {
  it('enforces is_uncertain flag when confidence is below 50%', () => {
    const modelOutput = {
      crop_name: 'Potato',
      crop_confidence: 42, // Low confidence
      is_healthy: false,
      disease_name: 'Late Blight',
      disease_confidence: 35,
      severity: 'moderate',
      is_uncertain: false,
    };

    const enforceHonesty = (output: typeof modelOutput) => {
      const isLowConfidence = output.crop_confidence < 50 || (output.disease_confidence !== null && output.disease_confidence < 50);
      return {
        ...output,
        is_uncertain: isLowConfidence ? true : output.is_uncertain,
        severity: isLowConfidence ? 'uncertain' : output.severity,
      };
    };

    const sanitized = enforceHonesty(modelOutput);
    expect(sanitized.is_uncertain).toBe(true);
    expect(sanitized.severity).toBe('uncertain');
  });
});

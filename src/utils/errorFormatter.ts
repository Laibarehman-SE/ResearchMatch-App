/**
 * Error Formatter for ResearchMatch
 * Converts API error codes and raw JSON strings into clear, reassuring human language.
 */

export function formatSimpleErrorMessage(rawError: unknown): string {
  if (!rawError) {
    return 'An unexpected issue occurred. Please try again.';
  }

  let message = '';

  if (typeof rawError === 'string') {
    // If it looks like JSON, attempt parsing
    if (rawError.trim().startsWith('{') && rawError.trim().endsWith('}')) {
      try {
        const parsed = JSON.parse(rawError);
        message = parsed.error?.message || parsed.error || parsed.message || rawError;
      } catch {
        message = rawError;
      }
    } else {
      message = rawError;
    }
  } else if (rawError instanceof Error) {
    message = rawError.message;
  } else if (typeof rawError === 'object' && rawError !== null) {
    const anyErr = rawError as any;
    if (anyErr.error) {
      message = typeof anyErr.error === 'string' ? anyErr.error : anyErr.error.message || JSON.stringify(anyErr.error);
    } else if (anyErr.message) {
      message = anyErr.message;
    } else {
      message = String(rawError);
    }
  } else {
    message = String(rawError);
  }

  // Strip JSON formatting if embedded inside message
  if (message.includes('{"error":') || message.includes('{"message":')) {
    try {
      const match = message.match(/\{.*"error".*\}/s);
      if (match) {
        const parsed = JSON.parse(match[0]);
        message = parsed.error?.message || parsed.error || message;
      }
    } catch {
      // Continue with cleaned string
    }
  }

  const lower = message.toLowerCase();

  // 1. Quota / Rate Limiting (429)
  if (
    lower.includes('429') ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate limit')
  ) {
    return 'The AI service is currently receiving a high volume of requests. We automatically retried, but servers remain occupied. Please wait a moment and click Retry.';
  }

  // 2. Service Unavailable / Overloaded (503)
  if (
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('overloaded') ||
    lower.includes('high demand') ||
    lower.includes('model is busy')
  ) {
    return 'The research matching model is momentarily busy. Please try again in a few seconds.';
  }

  // 3. Network or connection failure
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('econnrefused') ||
    lower.includes('network request failed')
  ) {
    return 'Network connection could not be established. Please check your internet connection and try again.';
  }

  // 4. Input brevity
  if (lower.includes('at least 20 characters') || lower.includes('at least 25 characters')) {
    return 'Please provide a little more detail in the input boxes (at least a couple of sentences) so the model can evaluate research synergy accurately.';
  }

  // 5. Authentication or configuration
  if (lower.includes('api key') || lower.includes('unauthenticated') || lower.includes('forbidden')) {
    return 'The AI service credentials could not be verified. Please check that your API key is configured.';
  }

  return message;
}

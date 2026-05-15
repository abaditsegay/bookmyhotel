export const MIN_SEARCH_CHARACTERS = 3;

export function getEffectiveSearchTerm(value: string, minLength: number = MIN_SEARCH_CHARACTERS): string | null {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return '';
  }

  if (trimmedValue.length < minLength) {
    return null;
  }

  return trimmedValue;
}
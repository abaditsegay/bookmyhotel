/**
 * Extracts total element count from Spring Data page responses.
 * Handles both legacy and hypermedia (HAL) response shapes:
 *   - { totalElements, content }
 *   - { page: { totalElements }, content }
 *   - bare arrays (e.g. non-paginated endpoints)
 */
export const getPageTotalElements = (data: unknown): number => {
  if (!data || typeof data !== 'object') {
    return 0;
  }
  const d = data as Record<string, unknown>;

  if (typeof d.totalElements === 'number') {
    return d.totalElements;
  }

  if (d.page && typeof (d.page as Record<string, unknown>).totalElements === 'number') {
    return (d.page as Record<string, unknown>).totalElements as number;
  }

  if (Array.isArray(d.content)) {
    return d.content.length;
  }

  return 0;
};

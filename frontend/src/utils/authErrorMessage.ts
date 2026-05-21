export const extractAuthErrorMessage = async (response: Response, fallbackMessage: string): Promise<string> => {
  const errorText = await response.text().catch(() => '');

  if (!errorText) {
    return fallbackMessage;
  }

  try {
    const errorData = JSON.parse(errorText);
    const preferredMessage = [
      errorData?.userFriendlyMessage,
      errorData?.message,
      errorData?.details,
      errorData?.error,
    ].find((value): value is string => typeof value === 'string' && value.trim().length > 0);

    return preferredMessage || fallbackMessage;
  } catch {
    return errorText || fallbackMessage;
  }
};
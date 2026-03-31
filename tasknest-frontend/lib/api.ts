const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = 'Ошибка запроса';
    try {
      const error = await response.json();
      if (error?.message) {
        message = Array.isArray(error.message)
          ? error.message.join(', ')
          : error.message;
      }
    } catch {

    }
    throw new Error(message);
  }

  return response.json();
}


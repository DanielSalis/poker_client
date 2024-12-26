import { useState } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions<T> {
  method: HttpMethod;
  body?: T;
  headers?: HeadersInit;
}

interface UseApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  fetchApi: <TBody = unknown>(url: string, options?: FetchOptions<TBody>) => Promise<void>;
}

export const usePokerApi = <TResponse = unknown>(): UseApiResponse<TResponse> => {
  const [data, setData] = useState<TResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const api = "http://localhost:3000/";

  const fetchApi = async <TBody = unknown>(
    url: string,
    options?: FetchOptions<TBody>
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(api+url, {
        method: options?.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers || {}),
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = (await response.json()) as TResponse;
      setData(result);
    } catch (err: any) {
      setError(err.message || "error");
    } finally {
      setLoading(false);
    }
  };

  return { data, error, loading, fetchApi };
};

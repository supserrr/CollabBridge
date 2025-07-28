// Helper utilities for Next.js 15 compatibility

export interface AsyncPageProps<T = any> {
  params: Promise<T>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface SyncPageProps<T = any> {
  params: T;
  searchParams?: { [key: string]: string | string[] | undefined };
}

// For Next.js 15, params are always async
export type PageProps<T = any> = AsyncPageProps<T>;

// Utility function to handle async params
export async function useAsyncParams<T>(params: Promise<T>): Promise<T> {
  return await params;
}

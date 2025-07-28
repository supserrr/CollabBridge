// Type declarations for Next.js 15 compatibility

declare module 'next/router' {
  export interface NextRouter {
    push: (url: string) => void;
  }
}

// Helper type for async params
export type AsyncParams<T = any> = Promise<T>;

// Page props with async params
export interface PagePropsWithAsyncParams<T = any> {
  params: AsyncParams<T>;
  searchParams?: { [key: string]: string | string[] | undefined };
}

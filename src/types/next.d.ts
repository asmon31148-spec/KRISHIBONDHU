declare module 'next' {
  export interface Metadata {
    title?: any;
    description?: any;
    icons?: any;
    manifest?: any;
    themeColor?: any;
    openGraph?: any;
    viewport?: any;
    [key: string]: any;
  }
  export interface Viewport {
    width?: string;
    initialScale?: number;
    maximumScale?: number;
    viewportFit?: 'auto' | 'contain' | 'cover';
    themeColor?: string;
    [key: string]: any;
  }
  export interface NextConfig {
    reactStrictMode?: boolean;
    headers?(): Promise<any[]>;
    images?: any;
    env?: any;
    [key: string]: any;
  }
  const next: any;
  export default next;
}

declare module 'next/server' {
  export class NextRequest extends Request {
    readonly nextUrl: URL;
    readonly ip?: string;
    readonly geo?: {
      city?: string;
      country?: string;
      region?: string;
      latitude?: string;
      longitude?: string;
    };
    readonly cookies: any;
  }

  export class NextResponse<_Body = any> extends Response {
    readonly cookies: any;
    static json<JsonBody = any>(body: JsonBody, init?: ResponseInit): NextResponse<JsonBody>;
    static redirect(url: string | URL | Location, init?: number | ResponseInit): NextResponse<unknown>;
    static rewrite(destination: string | URL, init?: ResponseInit): NextResponse<unknown>;
    static next(init?: any): NextResponse<unknown>;
  }

  export const ImageResponse: any;
  export const userAgentFromString: any;
  export const userAgent: any;
  export const URLPattern: any;
  export const after: any;
  export const connection: any;
}

declare module 'next/server.js' {
  export class NextRequest extends Request {
    readonly nextUrl: URL;
    readonly ip?: string;
    readonly geo?: {
      city?: string;
      country?: string;
      region?: string;
      latitude?: string;
      longitude?: string;
    };
    readonly cookies: any;
  }

  export class NextResponse<_Body = any> extends Response {
    readonly cookies: any;
    static json<JsonBody = any>(body: JsonBody, init?: ResponseInit): NextResponse<JsonBody>;
    static redirect(url: string | URL | Location, init?: number | ResponseInit): NextResponse<unknown>;
    static rewrite(destination: string | URL, init?: ResponseInit): NextResponse<unknown>;
    static next(init?: any): NextResponse<unknown>;
  }

  export const ImageResponse: any;
  export const userAgentFromString: any;
  export const userAgent: any;
  export const URLPattern: any;
  export const after: any;
  export const connection: any;
}

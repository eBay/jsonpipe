export interface Options {
  delimiter?: string;
  success?: (data: Record<string, any>) => void;
  error?: (errorMsg: string) => void;
  complete?: (statusText: string) => void;
  timeout?: number;
  method?: string;
  headers?: Record<string, string>;
  data?: string | FormData | File | Blob;
  disableContentType?: boolean;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
  withCredentials?: boolean;
}

export interface OptionsWithUrl extends Options {
  url: string;
}

export function flow(url: string, options: Options): XMLHttpRequest | undefined;
export function flow(options: OptionsWithUrl): XMLHttpRequest | undefined;

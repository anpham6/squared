export const FRAMEWORK_NOT_INSTALLED = 'Framework not installed.';
export const SERVER_REQUIRED = 'Server required. See README for instructions.';
export const DIRECTORY_NOT_PROVIDED = 'Directory not provided (pathname).';
export const UNABLE_TO_FINALIZE_DOCUMENT = 'Unable to finalize document.';
export const INVALID_ASSET_REQUEST = 'Invalid asset request.';
export const OPERATION_NOT_SUPPORTED = 'Operation not supported.';
export const DOCUMENT_ROOT_NOT_FOUND = 'Document root not found.';
export const DOCUMENT_IS_CLOSED = 'Document is closed. Reset and rerun?';
export const CSS_CANNOT_BE_PARSED = 'CSS cannot be parsed inside <link> tags when loading files directly from your hard drive or from external websites. Either use a local web server, embed your CSS into a <style> tag, or you can try using a different browser. See README for instructions.';

export function reject<T = void>(value: string): Promise<T> {
    return Promise.reject(new Error(value));
}
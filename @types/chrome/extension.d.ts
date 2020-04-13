import { MIMEOrAll } from '../lib/squared';

export interface CompressOptions {
    level?: number;
    mimeTypes: MIMEOrAll;
}

export interface ConvertOptions extends CompressOptions {
    mimeTypes: string[];
    replaceWith: boolean;
    pickSmaller: boolean;
}
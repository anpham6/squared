import { MIMEOrAll } from '../lib/data';

export interface CompressOptions {
    level?: number;
    mimeTypes: MIMEOrAll;
}

export interface ConvertOptions extends CompressOptions {
    mimeTypes: string[];
    replaceWith: boolean;
    pickSmaller: boolean;
}
import { MIMEOrAll } from '../lib/data';

export interface CompressOptions {
    level?: number;
    mimeTypes: MIMEOrAll;
    greaterThan: number;
    smallerThan: number;
    whenSmaller: boolean;
}

export interface ConvertOptions extends CompressOptions {
    mimeTypes: string[];
    replaceWith: boolean;
}
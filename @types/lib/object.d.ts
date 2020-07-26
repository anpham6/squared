interface CssProperties {
    [key: string]: CssPropertyData;
}

interface CssPropertyData {
    trait: number;
    value: string | string[];
    name?: string;
    valueOfNone?: string;
}

interface KeyframesData extends ObjectMap<StringMap> {}

interface FontFaceData {
    fontFamily: string;
    fontWeight: number;
    fontStyle: string;
    srcFormat: string;
    srcUrl?: string;
    srcLocal?: string;
}

interface TransformData {
    method: string;
    values: number[];
}

type MIMEOrAll = string[] | "*";
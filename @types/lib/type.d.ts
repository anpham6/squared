interface CssProperties {
    [key: string]: CssPropertyData;
}

type MIMEOrAll = string[] | "*";
type PatternGroupPredicate = (group: RegExpExecArray, value: string) => string;
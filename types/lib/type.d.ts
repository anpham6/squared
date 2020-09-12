type MIMEOrAll = Set<string> | "*";
type PatternGroupPredicate = (group: RegExpExecArray, value: string) => string;
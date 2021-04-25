type Specificity = [number, number, number, number?, number?];
type MIMEOrAll = string[] | "*";
type PatternGroupPredicate = (group: RegExpExecArray, value: string) => string;
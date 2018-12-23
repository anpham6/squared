export interface CssGridData<T> {
    children: Set<T>;
    row: CssGridDirectionData;
    column: CssGridDirectionData;
    emptyRows: Array<Undefined<number[]>>;
    rowData: Undefined<T[]>[][];
    templateAreas: ObjectMap<CssGridCellData>;
    alignItems: string;
    alignContent: string;
    justifyItems: string;
    justifyContent: string;
}

export interface CssGridDirectionData {
    count: number;
    gap: number;
    unit: string[];
    unitMin: string[];
    auto: string[];
    autoFit: boolean;
    autoFill: boolean;
    repeat: boolean[];
    name: ObjectMap<number[]>;
    normal: boolean;
}

export interface CssGridCellData {
    rowStart: number;
    rowSpan: number;
    columnStart: number;
    columnSpan: number;
}

export interface FlexboxData<T> {
    wrap: boolean;
    wrapReverse: boolean;
    directionReverse: boolean;
    justifyContent: string;
    rowCount: number;
    rowDirection: boolean;
    columnDirection: boolean;
    columnCount: number;
    children: T[];
}

export interface GridData extends BoxPadding {
    columnCount: number;
}

export interface GridCellData<T> {
    rowSpan: number;
    columnSpan: number;
    index: number;
    cellStart: boolean;
    cellEnd: boolean;
    rowEnd: boolean;
    rowStart: boolean;
    siblings: T[];
}

export interface ListData {
    ordinal: string;
    imageSrc: string;
    imagePosition: string;
}

export interface VerticalAlignData<T> {
    aboveBaseline: T[];
    belowBaseline: T[];
}

export interface TableData {
    layoutType: number;
    expand: boolean;
    rowCount: number;
    columnCount: number;
}
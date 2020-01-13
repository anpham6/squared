export interface AccessibilityOptions {
    showLabel: boolean;
}

export interface CssGridData<T> {
    children: T[];
    row: CssGridDirectionData;
    column: CssGridDirectionData;
    emptyRows: Array<Undefined<number[]>>;
    rowData: (T[] | undefined)[][];
    rowHeight: number[];
    rowSpanMultiple: (true | undefined)[];
    templateAreas: ObjectMap<CssGridCellData>;
    alignItems: string;
    alignContent: string;
    justifyItems: string;
    justifyContent: string;
}

export interface CssGridDirectionData {
    length: number;
    gap: number;
    unit: string[];
    unitMin: string[];
    unitTotal: number[];
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
    directionReverse: boolean;
    directionRow: boolean;
    directionColumn: boolean;
    wrap: boolean;
    wrapReverse: boolean;
    alignContent: string;
    justifyContent: string;
    rowCount: number;
    columnCount: number;
    children: T[];
}

export interface GridCellData<T> {
    rowSpan: number;
    columnSpan: number;
    index: number;
    cellStart: boolean;
    cellEnd: boolean;
    rowEnd: boolean;
    rowStart: boolean;
    block: boolean;
    siblings?: T[];
}

export interface ListData {
    ordinal: string;
    imageSrc: string;
    imagePosition: string;
}

export interface TableData {
    layoutType: number;
    layoutFixed: boolean;
    borderCollapse: boolean;
    expand: boolean;
    rowCount: number;
    columnCount: number;
}

export interface TableCellData {
    rowSpan: number;
    colSpan: number;
    spaceSpan?: number;
}
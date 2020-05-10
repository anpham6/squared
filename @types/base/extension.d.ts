interface CssGridData<T> {
    children: T[];
    row: CssGridDirectionData;
    column: CssGridDirectionData;
    emptyRows: Array<Undef<number[]>>;
    rowData: Undef<T[]>[][];
    rowSpanMultiple: Undef<true>[];
    rowDirection: boolean;
    dense: boolean;
    templateAreas: ObjectMap<CssGridCellData>;
    alignItems: string;
    alignContent: string;
    justifyItems: string;
    justifyContent: string;
    minCellHeight: number;
}

interface CssGridDirectionData {
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
    fixedWidth: boolean;
    flexible: boolean;
    frTotal: number;
}

interface CssGridCellData {
    rowStart: number;
    rowSpan: number;
    columnStart: number;
    columnSpan: number;
}

interface FlexboxData<T> extends Required<FlexData> {
    rowCount: number;
    columnCount: number;
    children: T[];
}

interface GridCellData<T> extends ObjectMap<any> {
    rowSpan: number;
    columnSpan: number;
    index: number;
    cellStart: boolean;
    cellEnd: boolean;
    rowEnd: boolean;
    rowStart: boolean;
    siblings?: T[];
}

interface ListData {
    ordinal: string;
    imageSrc: string;
    imagePosition: string;
}

interface TableData {
    layoutType: number;
    layoutFixed: boolean;
    borderCollapse: boolean;
    expand: boolean;
    rowCount: number;
    columnCount: number;
}

interface TableCellData {
    rowSpan: number;
    colSpan: number;
    spaceSpan?: number;
    percent?: string;
    expand?: boolean;
    downsized?: boolean;
    exceed?: boolean;
    placed?: boolean;
    flexible?: boolean;
}

interface ColumnData<T> {
    rows: T[][];
    columnCount: number;
    columnWidth: number;
    columnSized: number;
    columnGap: number;
    columnRule: {
        borderLeftStyle: string;
        borderLeftWidth: string;
        borderLeftColor: string;
    };
    boxWidth: number;
    multiline: boolean;
}
interface CssGridData<T> {
    children: T[];
    row: CssGridDirectionData;
    column: CssGridDirectionData;
    emptyRows: Undef<number[]>[];
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
    repeat: boolean[];
    name: ObjectMap<number[]>;
    frTotal: number;
    flags: number;
}

interface CssGridCellData {
    rowStart: number;
    rowSpan: number;
    columnStart: number;
    columnSpan: number;
    bounds?: BoxRectDimension;
}

interface FlexboxData<T> extends Required<FlexData> {
    rowCount: number;
    columnCount: number;
    rowGap: number;
    columnGap: number;
    children: T[];
    singleRow?: boolean;
}

interface GridCellData<T> {
    rowSpan: number;
    columnSpan: number;
    index: number;
    flags: number;
    siblings?: T[];
}

interface ListData {
    ordinal?: string;
    imageSrc?: string;
    imagePosition?: string;
}

interface TableData {
    layoutType: number;
    rowCount: number;
    columnCount: number;
    flags: number;
}

interface TableCellSpanData {
    rowSpan?: number;
    colSpan?: number;
}

interface TableCellData extends Required<TableCellSpanData> {
    flags: number;
    spaceSpan?: number;
    percent?: string;
}

interface ColumnData<T> {
    rows: T[][];
    columnCount: number;
    columnWidth: number;
    columnSized: number;
    columnGap: number;
    columnRule: {
        borderLeftStyle: string;
        borderLeftWidth: number;
        borderLeftColor: string;
    };
    boxWidth: number;
    multiline: boolean;
}

interface SpriteData extends Dimension {
    image: Required<RawAsset>;
    position: BoxRectPosition;
}
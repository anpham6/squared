interface Asset {
    uri?: string;
}

interface FileAsset extends Asset {
    pathname: string;
    filename: string;
    content: string;
}

interface ImageAsset extends Asset {
    width: number;
    height: number;
    position?: Point;
}
interface ContainerCascadeOptions<T> {
    error?: IteratorPredicate<T, boolean>;
}

interface ContainerFindOptions<T> extends ContainerCascadeOptions<T> {
    cascade?: boolean;
}

interface ContainerSomeOptions<T> extends ContainerFindOptions<T> {}

interface ColorData extends StringValue {
    valueAsRGBA: string;
    valueAsARGB: string;
    rgba: RGBA;
    hsl: HSL;
    opacity: number;
    transparent: boolean;
}

interface ColorResult extends StringValue {
    rgb: RGB;
    hsl: HSL;
}
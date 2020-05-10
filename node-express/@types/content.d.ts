declare namespace Content {
    interface External {
        html?: ObjectMap<StandardMap>;
        css?: ObjectMap<StandardMap>;
        js?: ObjectMap<StandardMap>;
    }

    interface ResizeMode extends Dimension {
        mode: string;
    }
}

export = Content;
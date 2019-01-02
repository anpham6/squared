declare global {
    namespace squared.base {
        interface ExtensionManager<T extends Node> {
            readonly application: Application<T>;
            include(ext: Extension<T>): boolean;
            exclude(ext: Extension<T>): boolean;
            retrieve(name: string): Extension<T> | null;
            optionValue(name: string, attr: string): any;
            optionValueAsObject(name: string, attr: string): {} | null;
            optionValueAsString(name: string, attr: string): string;
            optionValueAsNumber(name: string, attr: string): number;
            optionValueAsBoolean(name: string, attr: string): boolean;
        }

        class ExtensionManager<T extends Node> implements ExtensionManager<T> {}
    }
}

export = squared.base.ExtensionManager;
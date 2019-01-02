import { Constraint, LocalSettings } from '../src/@types/node';

declare global {
    namespace android.base {
        interface View extends squared.base.Node {
            anchored: boolean;
            readonly constraint: Constraint;
            readonly localSettings: LocalSettings;
            readonly documentId: string;
            readonly layoutFrame: boolean;
            readonly layoutLinear: boolean;
            readonly layoutRelative: boolean;
            readonly layoutConstraint: boolean;
            readonly inlineWidth: boolean;
            readonly inlineHeight: boolean;
            readonly blockWidth: boolean;
            readonly blockHeight: boolean;
            readonly singleChild: boolean;
            android(attr: string, value?: string, overwrite?: boolean): string;
            app(attr: string, value?: string, overwrite?: boolean): string;
            formatted(value: string, overwrite?: boolean): void;
            mergeGravity(attr: string, ...alignment: string[]): string;
            anchor(position: string, documentId?: string, overwrite?: boolean): boolean;
            anchorParent(orientation: string, overwrite?: boolean, constraintBias?: boolean): boolean;
            anchorDelete(...position: string[]): void;
            anchorClear(): void;
            horizontalBias(): number;
            verticalBias(): number;
            supported(obj: string, attr: string, result?: {}): boolean;
            combine(...objs: string[]): string[];
        }

        class View implements View {
            public static documentBody(): View;
            public static getCustomizationValue(api: number, tagName: string, obj: string, attr: string): string;
            public static getControlName(containerType: number): string;
            constructor(id: number, element?: Element | null, afterInit?: BindGeneric<View, void>);
        }

        class ViewGroup<T extends View> extends View {}
    }
}

export = android.base.View;
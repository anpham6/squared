import { UserSettingsAndroid } from '../src/@types/application';
import { ViewAttribute } from '../src/@types/node';

declare global {
    namespace android.base {
        interface Controller<T extends View> extends squared.base.Controller<T> {
            readonly userSettings: UserSettingsAndroid;
            checkFrameHorizontal(data: squared.base.Layout<T>): boolean;
            checkConstraintFloat(data: squared.base.Layout<T>): boolean;
            checkConstraintHorizontal(data: squared.base.Layout<T>): boolean;
            checkRelativeHorizontal(data: squared.base.Layout<T>): boolean;
            addGuideline(node: T, parent: T, orientation?: string, percent?: boolean, opposite?: boolean): void;
            renderSpace(depth: number, width: string, height?: string, columnSpan?: number, rowSpan?: number, options?: ViewAttribute): string;
            createNodeWrapper(node: T, parent?: T, controlName?: string, containerType?: number): T;
        }

        class Controller<T extends View> implements Controller<T> {
            public static evaluateAnchors<T extends View>(nodes: T[]): void;
            public static setConstraintDimension<T extends View>(node: T): void;
            public static setFlexDimension<T extends View>(node: T, horizontal: boolean): void;
        }
    }
}

export = android.base.Controller;
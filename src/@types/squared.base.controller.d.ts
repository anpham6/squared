import { AppHandler, ControllerSettings, UserSettings } from '../base/@types/application';

declare global {
    namespace squared.base {
        interface Controller<T extends Node> extends AppHandler<T> {
            application: Application<T>;
            cache: NodeList<T>;
            readonly userSettings: UserSettings;
            readonly localSettings: ControllerSettings;
            readonly generateSessionId: string;
            readonly afterInsertNode?: BindGeneric<Node, void>;
            init(): void;
            reset(): void;
            evaluateNonStatic(documentRoot: T, cache: NodeList<T>): void;
            preventNodeCascade(element: Element): boolean;
            includeElement(element: Element): boolean;
            visibleElement(element: Element, target?: string): boolean;
            applyDefaultStyles(element: Element): void;
        }

        class Controller<T extends Node> implements Controller<T> {
            constructor(application: Application<T>, cache: NodeList<T>);
        }
    }
}

export = squared.base.Controller;
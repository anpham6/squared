declare global {
    namespace chrome.base {
        interface View extends squared.base.Node {
            localSettings: { floatPrecision: number };
            clone(id?: number): View;
        }

        class View implements View {
            constructor(id: number, sessionId: string, element: Element, afterInit?: BindGeneric<View, void>);
        }
    }
}

export = chrome.base.View;
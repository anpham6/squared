import { LocalSettings } from '../src/@types/node';

declare global {
    namespace chrome.base {
        interface View extends squared.base.Node {
            localSettings: LocalSettings;
        }

        class View implements View {
            constructor(id: number, sessionId: string, element: Element);
        }
    }
}

export = chrome.base.View;
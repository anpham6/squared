
export default class Controller<T extends squared.base.NodeElement> extends squared.base.Controller<T> implements vdom.base.Controller<T> {
    public readonly localSettings: ControllerSettings = {
        mimeType: {
            font: '*',
            image: '*',
            audio: '*',
            video: '*'
        }
    };

    constructor(
        public readonly application: vdom.base.Application<T>,
        public readonly cache: squared.base.NodeList<T>)
    {
        super();
    }
}
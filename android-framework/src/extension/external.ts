import View from '../view';

export default class <T extends View> extends squared.base.extensions.External<T> {
    public readonly eventOnly = true;
}
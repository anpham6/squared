export default abstract class Extension<T extends squared.base.Node> extends squared.base.Extension<T> implements chrome.base.Extension<T> {
    public processFile(data: ChromeAsset) {
        return true;
    }
}
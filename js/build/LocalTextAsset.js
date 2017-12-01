var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var LocalTextAsset = (function (_super) {
    __extends(LocalTextAsset, _super);
    function LocalTextAsset(id, path) {
        var _this = _super.call(this, id, path) || this;
        _this.data = decodeURIComponent(window.gLocalAssetContainer[id]);
        return _this;
    }
    LocalTextAsset.prototype._load = function (loader) {
        var _this = this;
        if (this.data !== undefined) {
            setTimeout(function () {
                loader._onAssetLoad(_this);
            }, 0);
        }
        else {
            setTimeout(function () {
                loader._onAssetError(_this, g.ExceptionFactory.createAssetLoadError("can not load text asset"));
            }, 0);
        }
    };
    return LocalTextAsset;
}(g.TextAsset));

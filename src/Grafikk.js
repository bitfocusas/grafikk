var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var Grafikk = /** @class */ (function () {
    function Grafikk(outputSpecification, outputCallback) {
        this.inputSpecification = { text: null };
        this.outputSpecification = {
            width: 128,
            height: 128
        };
        console.log("constructor");
        this.outputSpecification = __assign(__assign({}, this.outputSpecification), outputSpecification);
        this.outputCallback = outputCallback;
    }
    Grafikk.prototype.generate = function (inputSpecification) {
        console.log("generate");
        this.inputSpecification = __assign(__assign({}, this.inputSpecification), inputSpecification);
        var outputResult = {
            error: null,
            buffer: new Buffer(1)
        };
        this.outputCallback(outputResult);
    };
    return Grafikk;
}());

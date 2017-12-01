module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var filters = __webpack_require__(1);
module.exports = function () {
    var scene = new g.Scene({ game: g.game });
    scene.loaded.add(function () {
        var black = new g.FilledRect({
            scene: scene,
            cssColor: "#000000",
            width: g.game.width,
            height: g.game.height
        });
        scene.append(black);
        var builtin = new filters.FilterContainer({
            scene: scene
        });
        builtin.filters = [
            new filters.BuiltInFilterBuilder()
                .blur("5px")
                .build()
        ];
        var red = new g.FilledRect({
            scene: scene,
            cssColor: "#ff0000",
            x: 10,
            y: 10,
            width: 32,
            height: 32
        });
        builtin.append(red);
        scene.append(builtin);
        var blue = new g.FilledRect({
            scene: scene,
            cssColor: "#0000ff",
            x: 50,
            y: 10,
            width: 32,
            height: 32
        });
        scene.append(blue);
        var snow = new filters.FilterContainer({
            scene: scene
        });
        var snowflake = new filters.SnowflakeFilter({
            radius: {
                min: 0.5,
                max: 3.0
            },
            wind: {
                min: -0.5,
                max: 1.0
            },
            speed: {
                min: 1.0,
                max: 3.0
            },
            width: g.game.width,
            height: g.game.height,
            count: 200
        });
        snow.filters = [
            snowflake
        ];
        scene.append(snow);
        scene.update.add(function () {
            snowflake.update();
            snow.modified();
        });
    });
    g.game.pushScene(scene);
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(2));
__export(__webpack_require__(3));
__export(__webpack_require__(4));


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var BuiltInFilterBuilder = /** @class */ (function () {
    function BuiltInFilterBuilder(filters) {
        this.filters = filters ? filters : [];
    }
    BuiltInFilterBuilder.prototype.build = function () {
        return new BuiltInFilter(this.filters);
    };
    BuiltInFilterBuilder.prototype.blur = function (length) {
        return this.add("blur(" + length + ")");
    };
    BuiltInFilterBuilder.prototype.brightness = function (percentage) {
        return this.add("brightness(" + percentage + ")");
    };
    BuiltInFilterBuilder.prototype.contrast = function (percentage) {
        return this.add("contrast(" + percentage + ")");
    };
    BuiltInFilterBuilder.prototype.dropShadow = function (offsetX, offsetY, blurRadius, color) {
        return this.add("drop-shadow(" + offsetX + " " + offsetY + " " + blurRadius + " " + color + ")");
    };
    BuiltInFilterBuilder.prototype.grayscale = function (percentage) {
        return this.add("grayscale(" + percentage + ")");
    };
    BuiltInFilterBuilder.prototype.hueRotate = function (degree) {
        return this.add("hue-rotate(" + degree + ")");
    };
    BuiltInFilterBuilder.prototype.invert = function (percentage) {
        return this.add("invert(" + percentage + ")");
    };
    BuiltInFilterBuilder.prototype.opacity = function (percentage) {
        return this.add("opacity(" + percentage + ")");
    };
    BuiltInFilterBuilder.prototype.saturate = function (percentage) {
        return this.add("saturate(" + percentage + ")");
    };
    BuiltInFilterBuilder.prototype.sepia = function (percentage) {
        return this.add("sepia(" + percentage + ")");
    };
    BuiltInFilterBuilder.prototype.add = function (filter) {
        this.filters.push(filter);
        return this;
    };
    return BuiltInFilterBuilder;
}());
exports.BuiltInFilterBuilder = BuiltInFilterBuilder;
var BuiltInFilter = /** @class */ (function () {
    function BuiltInFilter(filters) {
        this.filter = filters.join(" ");
    }
    BuiltInFilter.prototype.apply = function (renderer) {
        // FIXME: CanvasRenderingContext2D.filter property is experimental technology.
        // https://developer.mozilla.org/docs/Web/API/CanvasRenderingContext2D/filter
        var context = renderer.context;
        if (context.filter && context.filter !== "none") {
            context.filter = context.filter + " " + this.filter;
        }
        else {
            context.filter = this.filter;
        }
    };
    return BuiltInFilter;
}());
exports.BuiltInFilter = BuiltInFilter;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var FilterContainer = /** @class */ (function (_super) {
    __extends(FilterContainer, _super);
    function FilterContainer(param) {
        var _this = _super.call(this, param) || this;
        _this.filters = [];
        return _this;
    }
    Object.defineProperty(FilterContainer.prototype, "filters", {
        get: function () {
            return this._filters;
        },
        set: function (values) {
            this._filters = values;
        },
        enumerable: true,
        configurable: true
    });
    FilterContainer.prototype.renderSelf = function (renderer, camera) {
        renderer.save();
        if (this._filters) {
            for (var _i = 0, _a = this._filters; _i < _a.length; _i++) {
                var filter = _a[_i];
                filter.apply(renderer);
            }
        }
        if (this.children) {
            var children = this.children; // NOTE: Not cloned. Will break if modified while rendering
            for (var i = 0; i < children.length; ++i) {
                children[i].render(renderer, camera);
            }
        }
        renderer.restore();
        return false;
    };
    FilterContainer.prototype.destroy = function () {
        this._filters = null;
        _super.prototype.destroy.call(this);
    };
    return FilterContainer;
}(g.E));
exports.FilterContainer = FilterContainer;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function random(min, max) {
    return g.game.random.get(min, max);
}
var Snowflake = /** @class */ (function () {
    function Snowflake(param) {
        this.x = random(0, param.width);
        this.y = random(-param.height, 0);
        this.radius = random(param.radius.min, Math.min(3.0, param.radius.max));
        this.wind = random(param.wind.min, Math.min(3.0, param.wind.max));
        this.speed = random(Math.max(1.0, param.speed.min), Math.min(3.0, param.speed.max));
        this.color = param.color ? param.color : "#ffffff";
        this.width = param.width;
        this.height = param.height;
    }
    Snowflake.prototype.draw = function (renderer) {
        if (this.outOfRange) {
            return;
        }
        renderer.begin();
        for (var y = this.y - this.radius; y <= this.y + this.radius; ++y) {
            var w = this.radius * Math.cos(Math.asin((this.y - y) / this.radius));
            renderer.fillRect(this.x - w, y, 2 * w, 1, this.color);
        }
        renderer.end();
    };
    Snowflake.prototype.update = function () {
        this.x += this.wind;
        this.y += this.speed;
        if (this.outOfRange) {
            this.x = random(0, this.width);
            this.y = 0;
        }
    };
    Object.defineProperty(Snowflake.prototype, "outOfRange", {
        get: function () {
            return this.x < -(this.radius * 2) || this.x > this.width || this.y > this.height;
        },
        enumerable: true,
        configurable: true
    });
    return Snowflake;
}());
var SnowflakeFilter = /** @class */ (function () {
    function SnowflakeFilter(param) {
        this.snowflakes = new Array(param.count);
        for (var i = 0; i < param.count; i++) {
            this.snowflakes[i] = new Snowflake(param);
        }
    }
    SnowflakeFilter.prototype.apply = function (renderer) {
        for (var _i = 0, _a = this.snowflakes; _i < _a.length; _i++) {
            var snowflake = _a[_i];
            snowflake.draw(renderer);
        }
    };
    SnowflakeFilter.prototype.update = function () {
        for (var _i = 0, _a = this.snowflakes; _i < _a.length; _i++) {
            var snowflake = _a[_i];
            snowflake.update();
        }
    };
    return SnowflakeFilter;
}());
exports.SnowflakeFilter = SnowflakeFilter;


/***/ })
/******/ ]);
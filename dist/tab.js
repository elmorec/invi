!function(t,n){"object"==typeof exports&&"object"==typeof module?module.exports=n():"function"==typeof define&&define.amd?define([],n):"object"==typeof exports?exports.Invi=n():t.Invi=n()}(window,function(){return function(t){var n={};function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}return e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:r})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,n){if(1&n&&(t=e(t)),8&n)return t;if(4&n&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(e.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var o in t)e.d(r,o,function(n){return t[n]}.bind(null,o));return r},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},e.p="",e(e.s=4)}([function(t,n,e){"use strict";e.d(n,"j",function(){return o}),e.d(n,"g",function(){return i}),e.d(n,"e",function(){return c}),e.d(n,"f",function(){return s}),e.d(n,"h",function(){return u}),e.d(n,"b",function(){return f}),e.d(n,"i",function(){return a}),e.d(n,"c",function(){return l}),e.d(n,"d",function(){return p}),e.d(n,"a",function(){return d});var r=function(){return(r=Object.assign||function(t){for(var n,e=1,r=arguments.length;e<r;e++)for(var o in n=arguments[e])Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o]);return t}).apply(this,arguments)};function o(t){var n=Object.prototype.toString.call(t).split(" ")[1].slice(0,-1).toLowerCase();return n.match(/element$/)?"element":n}var i="ontouchstart"in window||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0;function c(t,n,e){var r=this;r.addEventListener(t,function(t){var o=function(t,n,e){void 0===e&&(e=document.body);for(var r,o=[],i=Array.from(e.querySelectorAll(n));t&&!~i.indexOf(t);)t=t!==e&&!(null!=(r=t)&&r.nodeType==r.DOCUMENT_NODE)&&t.parentNode;return t&&o.indexOf(t)<0&&o.push(t),o}(t.target,n,r)[0];o&&e(o,t)})}function s(t,n){return Array.prototype.forEach.call(t,n)}function u(t,n){var e=r({},t);if("object"!==o(n))return e;for(var i in n){var c=t[i],s=n[i],f=o(c);null!=c?f===o(s)&&(e[i]="object"===f?u(c,s):s):e[i]=s}return e}var f=void 0!==document.createElement("div").style.animation?"animationend":"webkitAnimationEnd",a=void 0!==document.createElement("div").style.transition?"transitionend":"webkittransitionEnd";function l(t,n,e,r){void 0===r&&(r={passive:!0});var o=function(){e(),t.removeEventListener(n,o,r)};t.addEventListener(n,o,r)}function p(t,n){for(var e in n)t.style[e]=n[e]}var d=function(){function t(){this.events={}}return t.prototype.on=function(t,n){(this.events[t]||(this.events[t]=[])).push(n)},t.prototype.off=function(t,n){this.events[t]&&this.events[t].splice(this.events[t].indexOf(n)>>>0,1)},t.prototype.removeAllListeners=function(){this.events=[]},t.prototype.emit=function(t){for(var n=[],e=1;e<arguments.length;e++)n[e-1]=arguments[e];(this.events[t]||[]).slice().map(function(t){t.apply(void 0,n)})},t}()},,,,function(t,n,e){"use strict";e.r(n),e.d(n,"Tab",function(){return u});var r,o=e(0),i=(r=function(t,n){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,n){t.__proto__=n}||function(t,n){for(var e in n)n.hasOwnProperty(e)&&(t[e]=n[e])})(t,n)},function(t,n){function e(){this.constructor=t}r(t,n),t.prototype=null===n?Object.create(n):(e.prototype=n.prototype,new e)}),c="switch",s={selectors:{tab:"a",content:"article"},classes:{},event:"click",index:0},u=function(t){function n(e,r){void 0===r&&(r={});var i=t.call(this)||this;return i.current=0,i.tabs=[],i.contents=[],i.config=n.config(r,!0),i.host=e,i.refresh(),o.e.bind(e)(i.config.event,i.config.selectors.tab,function(t){var n=i.tabs.indexOf(t);~n&&i.switch(n)}),i}return i(n,t),n.config=function(t,n){var e=Object(o.h)(s,t);if(n)return e;s=e},n.prototype.switch=function(t,n){var e=this;if((t!==this.current||n)&&this.tabs[t]){var r=this.config.classes,o=this.tabs[this.current],i=this.contents[this.current],s=this.tabs[t],u=this.contents[t];r.active&&([o,i].forEach(function(t){return t.classList.remove(r.active)}),[s,u].forEach(function(t){return t.classList.add(r.active)})),i.style.display="none",u.style.display="",setTimeout(function(){e.emit(c,s,u,t,e.current)},0),this.current=t}},n.prototype.refresh=function(){var t=this,n=this.host.querySelectorAll(this.config.selectors.tab),e=this.host.querySelectorAll(this.config.selectors.content);Object(o.f)(n,function(n,r){var o=e[r];o&&(o.style.display="none",t.tabs.push(n),t.contents.push(o))}),this.switch(this.current,!0)},n.prototype.destroy=function(){this.removeAllListeners(),this.host=this.tabs=this.contents=this.config=null},n}(o.a)}])});
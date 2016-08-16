// In IE < 9, the fontSize is measured as pt,
// sometimes, as em,
// in a words, not as px,
// so, can not used in these browser
// 
// get or set the style sheets in a DOM element
// support simple arithmetic about size(px/em/%)
proto.css = function (obj) {
   var p, v, s, f, mv, ms,
       domElms = this.source,
       reg1 = /([\+\-\*\/])([\d\.]*)(px|em|%)?/,
       reg2 = /([\d\.]*)px/;
   // detect null and undefined
   if (obj == null) {
       console.log('Warning: DOMWrapper.prototype.css - The first parameter is null.');
   } else if (typeof obj == 'object') {
       for (p in obj) {
           if (_hasOwn.call(obj, p)) {
               v = obj[p];
               if (typeof v != 'string') continue;
               // internal traversal
               domElms.forEach(function (elm) {
                   mv = v.match(reg1);
                   // need for arithmetic computation
                   if (mv && mv[0].length == v.length && mv[1]) {
                       s = $.dom.getStyle(elm);
                       // base value used to evaluate the relative value setting
                       // em can not work in IE 8,
                       // because of IE8's computed font-size is measured in em or pt.
                       f = parseFloat(s.fontSize);
                       console.log(432, s.fontSize);
                       // the computed styles contain the prop
                       if (ms = s[p].match(reg2)) {
                           switch (mv[3]) {
                           case 'em':
                               v = eval(ms[1] + mv[1] + (+mv[2] * f));
                               break;
                           case '%':
                               v = eval(ms[1] + mv[1] + (+mv[2] / 100 * ms[1]));
                               break;
                           default: // deal with px and pure numbr in the indentical
                               v = eval(ms[1] + mv[1] + mv[2]);
                               break;
                           }
                       } else {
                           return;
                       }
                       v += 'px';
                   }
                   elm.style[p] = v;
               });
           }
       }
   }
   return this;
};

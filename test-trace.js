// Add inline debug
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  const exports = originalRequire.apply(this, arguments);
  
  if (id.includes('rtf-converter')) {
    const original = exports.rtfToHtml;
    exports.rtfToHtml = function(rtf, options) {
      console.log('[TRACE] rtfToHtml called with RTF length:', rtf.length);
      const result = original.call(this, rtf, options);
      console.log('[TRACE] Result HTML length:', result.length);
      return result;
    };
  }
  
  return exports;
};

const { rtfToHtml } = require('./lib/rtf-converter');
const rtf = '{\\rtf1\\ansi\\pard \\bullet\\tab Item 1\\par\\pard \\bullet\\tab Item 2\\par}';
console.log('HTML:', rtfToHtml(rtf));

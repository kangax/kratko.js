function Method(method) {
  this.method = method;
}

Method.prototype = {
  
  getLength: function() {
    return this.getLines().length;
  },
  
  getLines: function() {
    // here be function decompilation coz no other way
    var lines = String(this.method).split('\n');
    
    lines = this._stripHead(lines);
    lines = this._stripEmptyAndComments(lines);
    
    return lines;
  },
  
  _stripHead: function(lines) {
    if (/\s*\}\s*$/.test(lines[lines.length - 1])) {
      lines.pop();
    }
    // aproximate representation of identifier (e.g.: a-zA-Z instead of proper UnicodeLetter set for the first char)
    if (/^\s*function\s*([$_a-zA-Z]\w*)?\s*\([^)]*\)\s*\{\s*$/.test(lines[0])) {
      lines.shift();
    }
    return lines;
  },
  
  _stripEmptyAndComments: function(lines) {
    for (var i = lines.length; i--; ) {
      if (/^\s*(\/\/.*)?$/.test(lines[i])) {
        lines.splice(i, 1);
      }
    }
    return lines;
  },
  
  getArgsLength: function() {
    return this.method.length;
  },
  
  toObject: function() {
    return {
      length: this.getLength(),
      argsLength: this.getArgsLength(),
      methodString: this.method.toString()
    };
  }
};
function Kratko(object) {
  this.object = object;
  
  this.methods = { };
  
  this.stats = {
    totalMethodLength: 0,
    minMethodLength: Number.MAX_VALUE,
    maxMethodLength: 0,
    totalArgsLength: 0,
    minArgsLength: Number.MAX_VALUE,
    maxArgsLength: 0,
    numMethods: 0
  };
  
  this.collectMethods();
  this.collectStats();
}

Kratko.prototype = {
  
  getMethodNames: function() {
    var names = [ ], _toString = Object.prototype.toString;
    for (var prop in this.object) {
      if (_toString.call(this.object[prop]) === '[object Function]') {
        names.push(prop);
      }
    }
    return names;
  },
  
  collectMethods: function() {
    this.methodNames = this.getMethodNames();
    for (var i = this.methodNames.length; i--; ) {
      var methodName = this.methodNames[i];
      this.methods[methodName] = new Method(this.object[methodName]);
    }
  },
  
  collectStats: function() {
    if (this.methodNames.length === 0) {
      this.stats.minArgsLength = 
      this.stats.minMethodLength = 
      this.stats.averageArgsLength =
      this.stats.averageMethodLength = 0;
      
      return;
    }
    
    for (var methodName in this.methods) {
      this.stats.numMethods++;
      this.getStatsForArgsLength(methodName);
      this.getStatsForMethodLength(methodName);
    }
    this.stats.averageArgsLength = parseFloat((this.stats.totalArgsLength / this.stats.numMethods).toFixed(2));
    this.stats.averageMethodLength = parseFloat((this.stats.totalMethodLength / this.stats.numMethods).toFixed(2));
    
    this.stats.medianMethodLength = this.getMedianForMethods();
    this.stats.medianArgsLength = this.getMedianForArgs();
  },
  
  getMedian: function(arr) {
    arr = arr.sort(function(a, b) { return a - b });
    if (arr.length % 2) {
      return arr[Math.ceil(arr.length / 2)];
    }
    else {
      return (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2;
    }
  },
  
  getMedianForMethods: function() {
    var methodLengths = [ ];
    for (var methodName in this.methods) {
      methodLengths.push(this.methods[methodName].getLength());
    }
    return this.getMedian(methodLengths);
  },
  
  getMedianForArgs: function() {
    var argLengths = [ ];
    for (var methodName in this.methods) {
      argLengths.push(this.methods[methodName].getArgsLength());
    }
    return this.getMedian(argLengths);
  },
  
  getStatsForArgsLength: function(methodName) {
    var argsLength = this.methods[methodName].getArgsLength();
    this.stats.totalArgsLength += argsLength;
    
    if (argsLength < this.stats.minArgsLength) {
      this.stats.minArgsLength = argsLength;
    }
    if (argsLength > this.stats.maxArgsLength) {
      this.stats.maxArgsLength = argsLength;
    }
  },
  
  getStatsForMethodLength: function(methodName) {
    var methodLength = this.methods[methodName].getLength();
    this.stats.totalMethodLength += methodLength;
    
    if (methodLength < this.stats.minMethodLength) {
      this.stats.minMethodLength = methodLength;
    }
    if (methodLength > this.stats.maxMethodLength) {
      this.stats.maxMethodLength = methodLength;
    }
  },
  
  getStats: function() {
    var stats = { };
    for (var prop in this.stats) {
      stats[prop] = this.stats[prop];
    }
    var methods = { };
    for (var methodName in this.methods) {
      methods[methodName] = this.methods[methodName].toObject();
    }
    stats.methods = methods;
    return stats;
  }
};

Kratko.getStatsFor = function(object) {
  return new Kratko(object).getStats();
};
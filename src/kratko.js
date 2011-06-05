(function(global) {
  
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
  
  function TableViewer(stats) {
    
    this.stats = stats;
    
    this.buildWrapper();
    this.buildSwitch();
    this.buildCloseEl();
    this.buildOverview();
    this.buildTableHeader();
    this.buildTableBody();
    
    this.wrapperEl.appendChild(this.tableEl);
    document.body.appendChild(this.wrapperEl);
    
    this.applyStyles();
  }
  
  TableViewer.prototype = {
    
    applyStyles: function() {
      var styleEl = document.createElement('style');
      styleEl.appendChild(document.createTextNode(
        '.method-analyzer-wrapper { position:absolute;top:10px;left:10px;background:#dedeff;' +
          'box-shadow:0px 0px 10px rgba(0,0,0,0.7);padding:10px;max-height:700px;overflow-y:scroll;' +
          'font-family:Optima,sans-serif; text-align: left; line-height:1.5 }' +
        '.method-analyzer-wrapper table { border-collapse: collapse; box-shadow: 0 0 1px #fff; }' +
        '.method-analyzer-wrapper td, .method-analyzer-wrapper th { border: 1px solid #ccc; padding: 5px; background: #fff; }' +
        '.method-analyzer-wrapper th { padding: 5px 10px; font-weight: bold; text-align: center }' +
        '.method-analyzer-wrapper .overview { text-align:left; overflow: hidden; }' +
        '.method-analyzer-wrapper label { margin-right:5px; }' +
        '.method-analyzer-wrapper .overview span { margin-left: 10px }' +
        '.method-analyzer-wrapper .hl { background:#ffc;padding:2px 5px;border-radius:3px}' +
        '.method-analyzer-wrapper .close-trigger { position: absolute; top: 5px; right: 5px; color: red }'
      ));
      document.getElementsByTagName('head')[0].appendChild(styleEl);
    },
    
    buildWrapper: function() {
      this.wrapperEl = document.createElement('div');
      this.wrapperEl.className = 'method-analyzer-wrapper';
      
      this.tableEl = document.createElement('table');
      this.tbodyEl = document.createElement('tbody');
      
      this.tableEl.appendChild(this.tbodyEl);
    },
    
    buildSwitch: function() {
      var switchEl = document.createElement('p');
      switchEl.innerHTML = '<form><label>Global object "name"</label><input><button type="button">Analyze</button></form>';
      this.wrapperEl.appendChild(switchEl);
      
      var wrapperEl = this.wrapperEl;
      switchEl.childNodes[0].onsubmit = function() {
        var methodName = switchEl.childNodes[0].elements[0].value;
        
        if (methodName) {
          document.body.removeChild(wrapperEl);
          new TableViewer(
            Kratko.getStatsFor(
              window[methodName]
            )
          );
        }
        return false;
      };
    },
    
    buildCloseEl: function() {
      var closeEl = document.createElement('a');
      closeEl.innerHTML = 'x';
      closeEl.className = 'close-trigger';
      closeEl.href = '#'
      this.wrapperEl.appendChild(closeEl);
      
      var _this = this;
      closeEl.onclick = function() {
        _this.wrapperEl.parentNode.removeChild(_this.wrapperEl);
        return false;
      };
    },
    
    buildOverview: function() {
      var overviewEl = document.createElement('div');
      overviewEl.className = 'overview';
      
      overviewEl.innerHTML = (
        '<p>Total number of methods: <b class="hl">' + this.stats.numMethods + '</b></p>' +
        '<p style="float:left">Args length:<br>' + 
          '<span>min:</span> <b>' + this.stats.minArgsLength + '</b><br>' +
          '<span>max:</span> <b class="hl">' + this.stats.maxArgsLength + '</b><br>' +
          '<span>average:</span> <b>' + this.stats.averageArgsLength + '</b><br>' +
          '<span>median:</span> <b>' + this.stats.medianArgsLength + '</b></p>' +
        '<p style="float:left;margin-left:50px">Method length:<br>' + 
          '<span>min:</span> <b>' + this.stats.minMethodLength + '</b><br>' +
          '<span>max:</span> <b class="hl">' + this.stats.maxMethodLength + '</b><br>' +
          '<span>average:</span> <b>' + this.stats.averageMethodLength + '</b><br>'+
          '<span>median:</span> <b>' + this.stats.medianMethodLength + '</b></p>'
      );
      
      this.wrapperEl.appendChild(overviewEl);
    },
    
    buildTableHeader: function() {
      var headEl = document.createElement('thead');
      var headerRowEl = document.createElement('tr');

      var headerNameEl = document.createElement('th');
      headerNameEl.appendChild(document.createTextNode('Method Name'));
      headerRowEl.appendChild(headerNameEl);

      var headerLengthEl = document.createElement('th');
      headerLengthEl.appendChild(document.createTextNode('Method Length'));
      headerRowEl.appendChild(headerLengthEl);

      var headerArgsLengthEl = document.createElement('th');
      headerArgsLengthEl.appendChild(document.createTextNode('Arguments Length'));
      headerRowEl.appendChild(headerArgsLengthEl);
      
      headEl.appendChild(headerRowEl);
      this.tableEl.appendChild(headEl);
      
      this.headEl = headEl;
    },
    
    buildTableBody: function() {
      var sortedMethods = [ ];
      for (var methodName in this.stats.methods) {
        this.stats.methods[methodName].name = methodName;
        sortedMethods.push(this.stats.methods[methodName]);
      }
      sortedMethods.sort(function(a, b) { return a.length - b.length });
      
      for (var i = sortedMethods.length; i--; ) {
        this.buildTableRow(sortedMethods[i].name);
      }
    },
    
    buildTableRow: function(methodName) {
      var rowEl = document.createElement('tr');

      var nameEl = document.createElement('td');
      var lengthEl = document.createElement('td');
      var argsLengthEl = document.createElement('td');
      
      var linkEl = document.createElement('a');
      linkEl.href = '#';
      linkEl.appendChild(document.createTextNode(methodName));
      
      linkEl.onclick = (function(methodString){
        return function() {
          alert(methodString);
          return false;
        };
      })(this.stats.methods[methodName].methodString);
      
      nameEl.appendChild(linkEl);
      linkEl = null;
      
      lengthEl.appendChild(document.createTextNode(this.stats.methods[methodName].length));
      argsLengthEl.appendChild(document.createTextNode(this.stats.methods[methodName].argsLength));

      rowEl.appendChild(nameEl);
      rowEl.appendChild(lengthEl);
      rowEl.appendChild(argsLengthEl);

      this.tbodyEl.appendChild(rowEl);
    }
  };


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
  
  global.Kratko = Kratko;
  global.TableViewer = TableViewer;
  
})(this);
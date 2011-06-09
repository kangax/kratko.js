function TableViewer(stats) {
  
  this.stats = stats;
  this.methodLengthsData = this.getMethodLengthsData();
  
  this.buildWrapper();
  this.buildPreview();
  this.buildSwitch();
  this.buildCloseEl();
  this.buildOverview();
  this.buildShim();
  this.buildTableHeader();
  this.buildTableBody();
  this.buildGraph();
  
  this.wrapperEl.appendChild(this.tableWrapperEl);
  document.body.appendChild(this.wrapperEl);
  
  this.applyStyles();  
}

TableViewer.prototype = {
  styles: (
    '.kratko-wrapper { position: fixed; z-index: 100; top: 10px; left: 10px; background: #dedeff;' +
                    'box-shadow: 0px 0px 7px rgba(0,0,0,0.3); padding: 10px;' +
                    'font-family: Helvetica, arial, sans-serif; text-align: left; line-height: 1.5; border: 1px solid #aaa; ' +
                    'overflow-y: auto; color: #000; font-size: 13px }' +
    '.kratko-wrapper table { border-collapse: collapse; box-shadow: 0 0 1px #fff; }' +
    '.kratko-wrapper td, .kratko-wrapper th { border: 1px solid #ccc; padding: 5px; background: #fff; color: #000 }' +
    '.kratko-wrapper th { padding: 5px 0 5px 10px; font-weight: bold; text-align: center; min-width: 140px }' +
    '.kratko-wrapper tr.selected td { background: #ffc }' +
    '.kratko-wrapper input { width: 200px }' +
    '.kratko-wrapper form a { margin-left: 10px }' +
    '.kratko-wrapper .overview { text-align:left; overflow: hidden; }' +
    '.kratko-wrapper .overview span { margin-left: 10px }' +
    '.kratko-wrapper label { margin-right: 5px; }' +
    '.kratko-wrapper a { color: blue }' +
    '.kratko-wrapper p { margin-bottom: 7px }' +
    '.kratko-wrapper .hl { background: #ffc; padding: 2px 5px; border-radius: 3px }' +
    '.kratko-wrapper .close-trigger { position: absolute; top: 0; right: 5px; color: red; text-decoration: none }' +
    '.kratko-wrapper .sorter { margin-left: 10px; text-decoration: none; color: #ddd; font-weight: bold; padding: 5px }' +
    '.kratko-wrapper .sorter.active { color: red }' +
    '.kratko-wrapper .table-wrapper { max-height: 531px; overflow-y: scroll }' +
    '.kratko-preview { background: #fafaff; position: fixed; top: 38px; box-shadow: 0px 0px 7px rgba(0,0,0,0.3); ' +
                      'z-index: 100; border-top-right-radius: 10px; border-bottom-right-radius: 10px; }' +
    '.kratko-preview pre { margin: 0; display: inline-block; text-align: left; color: #000; font-size: 12px; margin: 10px 10px 10px 5px;' +
                          'font-family: Courier, monospace; max-height: 675px; overflow-y: auto; overflow-x: hidden; padding-right: 20px; }' +
    '.kratko-shim { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 99 }' +
    '.kratko-graph { position: fixed; top: 10px; right: 10px; z-index: 100; background: #fff; padding: 5px; box-shadow: 0px 0px 7px rgba(0,0,0,0.3); }' +
    '.kratko-graph .block { display: inline-block; width: 12px; background: red; height: 100px; margin-right: 1px }' +
    '.kratko-graph .axis { border-top: 1px solid #ddd }' +
    '.kratko-graph .axis span { display: inline-block; width: 12px; border-right: 1px solid #ccc; background: #fff; '+
                                'text-align: center; font-family: Courier, monospace; font-size: 9px; '+
                                'vertical-align: top; padding-top: 4px }' +
    '.kratko-graph .axis span:last-child { border: 0 }'
  ),
  
  applyStyles: function() {
    var styleEl = document.createElement('style');
    styleEl.appendChild(document.createTextNode(this.styles));
    document.getElementsByTagName('head')[0].appendChild(styleEl);
  },
  
  buildWrapper: function() {
    this.wrapperEl = document.createElement('div');
    this.wrapperEl.className = 'kratko-wrapper';
    
    this.tableWrapperEl = document.createElement('div');
    this.tableWrapperEl.className = 'table-wrapper';
    
    this.tableEl = document.createElement('table');
    this.tbodyEl = document.createElement('tbody');
    
    this.tableEl.appendChild(this.tbodyEl);
    this.tableWrapperEl.appendChild(this.tableEl);
  },
  
  buildSwitch: function() {
    var switchEl = document.createElement('p');
    switchEl.innerHTML = '<form><label>Object to inspect:</label><input placeholder="e.g. fabric.Element"><button type="button">Analyze</button></form>';
    this.wrapperEl.appendChild(switchEl);
    
    var wrapperEl = this.wrapperEl, 
        previewWrapperEl = this.previewWrapperEl, 
        shimEl = this.shimEl;
        
    switchEl.childNodes[0].onsubmit = function(){ return this.onChangeObject(switchEl) };
  },
  
  onChangeObject: function(switchEl) {
    var methodName = switchEl.childNodes[0].elements[0].value;
    
    if (methodName) {
      this.cleanup();
      new TableViewer(Kratko.getStatsFor(eval(methodName)));
    }
    
    return false;
  },
  
  buildCloseEl: function() {
    var closeEl = document.createElement('a');
    closeEl.innerHTML = 'x';
    closeEl.className = 'close-trigger';
    closeEl.href = '#'
    this.wrapperEl.appendChild(closeEl);
    
    var _this = this;
    closeEl.onclick = function() {
      _this.cleanup();
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
  
  buildShim: function() {
    this.shimEl = document.createElement('div');
    this.shimEl.className = 'kratko-shim';
    document.body.appendChild(this.shimEl);
  },
  
  buildPreview: function() {
    this.previewWrapperEl = document.createElement('div');
    this.previewWrapperEl.className = 'kratko-preview';
    this.previewWrapperEl.style.display = 'none';
    
    this.previewEl = document.createElement('pre');
    this.previewWrapperEl.appendChild(this.previewEl);
    
    document.body.appendChild(this.previewWrapperEl);
  },
  
  buildTableHeader: function() {
    var headEl = document.createElement('thead');
    var headerRowEl = document.createElement('tr');

    var headerNameEl = document.createElement('th');
    headerNameEl.appendChild(document.createTextNode('Method Name'));
    headerNameEl.appendChild(this.makeSorterEl('name'));
    headerRowEl.appendChild(headerNameEl);

    var headerLengthEl = document.createElement('th');
    headerLengthEl.appendChild(document.createTextNode('Method Length'));
    headerLengthEl.appendChild(this.makeSorterEl('methodLength', { active: true }));
    headerRowEl.appendChild(headerLengthEl);

    var headerArgsLengthEl = document.createElement('th');
    headerArgsLengthEl.appendChild(document.createTextNode('Arguments Length'));
    headerArgsLengthEl.appendChild(this.makeSorterEl('argsLength'));
    headerRowEl.appendChild(headerArgsLengthEl);
    
    headEl.appendChild(headerRowEl);
    this.tableEl.appendChild(headEl);
    
    this.headEl = headEl;
  },
  
  makeSorterEl: function(type, options) {
    options = options || { };
    
    var sortEl = document.createElement('a');
    var _this = this;
    
    sortEl.href = '#';
    sortEl.className = 'sorter' + (options.active ? ' active' : '');
    sortEl.innerHTML = '&darr;';
    sortEl.onclick = function(){ return _this.onSorterClick(sortEl, type); };
    return sortEl;
  },
  
  onSorterClick: function(sortEl, type) {
    var sorterEls = this.headEl.rows[0].getElementsByTagName('a');
    for (var i = 0, len = sorterEls.length; i < len; i++) {
      sorterEls[i].className = sorterEls[i].className.replace('active', '');
    }
    sortEl.className += (sortEl.className.indexOf('active') === -1 ? ' active' : '');
    var isOrderDescending = sortEl.innerHTML.charCodeAt(0) === 8595;
    this.sortTableBy(type, isOrderDescending ? 'asc' : 'desc');
    sortEl.innerHTML = (isOrderDescending ? '&uarr;' : '&darr;');
    return false;
  },
  
  buildGraph: function() {
    this.graphEl = document.createElement('div');
    this.graphEl.style.display = 'none';
    this.graphEl.className = 'kratko-graph';
    
    this.graphEl.innerHTML = '<div class="sectors"></div><div class="axis"></div>';
    
    this.buildSectors(this.graphEl);
    this.buildAxis(this.graphEl);
    this.buildGraphTrigger();
    
    document.body.appendChild(this.graphEl);
  },
  
  buildGraphTrigger: function() {
    var formEl = this.wrapperEl.getElementsByTagName('form')[0];
    var linkEl = document.createElement('a');
    
    linkEl.href = '#';
    linkEl.innerHTML = 'Toggle graph';
    
    var _this = this;
    linkEl.onclick = function() { 
      _this.graphEl.style.display = (_this.graphEl.style.display === 'none' ? '' : 'none');
    };
    
    formEl.appendChild(linkEl);
  },
  
  buildSectors: function(graphEl) {
    var sectorsMarkup = '', scale = 10;
    
    for (var i = 0, len = this.stats.maxMethodLength; i <= len; i++) {
      var sectorHeight = ((i in this.methodLengthsData) ? this.methodLengthsData[i] : '0');
      sectorsMarkup += '<div class="block" style="height: ' + (sectorHeight * scale) + 'px"></div>';
    }
    
    graphEl.firstChild.innerHTML = sectorsMarkup;
  },
  
  buildAxis: function(graphEl) {
    var axisMarkup = '';
    for (var i = 0, len = this.stats.maxMethodLength; i <= len; i++) {
      axisMarkup += '<span>' + i + '</span>';
    }
    graphEl.childNodes[1].innerHTML = axisMarkup;
  },
  
  getMethodLengthsData: function() {
    var methodLengthsData = { };
    
    for (var methodName in this.stats.methods) {
      
      var methodLength = this.stats.methods[methodName].length;
      if (methodLength in methodLengthsData) {
        methodLengthsData[methodLength]++;
      }
      else {
        methodLengthsData[methodLength] = 1;
      }
    }
    
    return methodLengthsData;
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
    
    var _this = this;
    linkEl.onclick = this.createOnClickHandler(this.stats.methods[methodName].methodString, rowEl);
    
    nameEl.appendChild(linkEl);
    linkEl = null;
    
    lengthEl.appendChild(document.createTextNode(this.stats.methods[methodName].length));
    argsLengthEl.appendChild(document.createTextNode(this.stats.methods[methodName].argsLength));

    rowEl.appendChild(nameEl);
    rowEl.appendChild(lengthEl);
    rowEl.appendChild(argsLengthEl);

    this.tbodyEl.appendChild(rowEl);
  },
  
  createOnClickHandler: function(methodString, rowEl) {
    var _this = this;
    return function() {
      
      if (TableViewer.selectedRowEl) {
        TableViewer.selectedRowEl.className = TableViewer.selectedRowEl.className.replace('selected', '')
      }
      
      TableViewer.selectedRowEl = rowEl;
      rowEl.className = 'selected';
      
      _this.previewEl.innerHTML = '';
      _this.previewEl.appendChild(document.createTextNode(methodString));
      _this.previewWrapperEl.style.left = (_this.wrapperEl.offsetWidth + _this.wrapperEl.offsetLeft) + 'px';
      _this.previewWrapperEl.style.display = '';
      return false;
    };
  },
  
  sortTableBy: function(type, order) {
    var fragment = document.createDocumentFragment();
    var cellTexts = [ ];
    var cellToSortByNum = type === 'name' ? 0 : type === 'methodLength' ? 1 : 2;
    
    for (var i = 1, rows = this.tableEl.rows, len = rows.length; i < len; i++) {
      var cellToSortBy = rows[i].cells[cellToSortByNum];
      
      var cellText = cellToSortBy.firstChild.nodeName === 'A' 
        ? cellToSortBy.firstChild.firstChild.nodeValue 
        : cellToSortBy.firstChild.nodeValue;
        
      cellTexts.push([cellText, rows[i]]);
    }
    var sortFn = type === 'name'
      ? function(a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; }
      : function(a, b) { return a[0] - b[0]; };
    
    cellTexts.sort(sortFn);
    
    if (order === 'desc') {
      cellTexts.reverse();
    }
    
    for (var i = 0, len = cellTexts.length; i < len; i++) {
      fragment.appendChild(cellTexts[i][1]);
    }
    this.tbodyEl.appendChild(fragment);
  },
  
  cleanup: function() {
    document.body.removeChild(this.wrapperEl);
    document.body.removeChild(this.previewWrapperEl);
    document.body.removeChild(this.shimEl);
    document.body.removeChild(this.graphEl);
  }
};
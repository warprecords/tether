(function(href) {

  // We'll be returning this
  var url = {};

  // Where is the hash?
  var h = href.indexOf('#');
  
  // Where is the query string?
  // (we find it ourselves instead of using location.search so that this
  // closure can just take in a string)
  var q = href.indexOf('?');
  var search = h == -1 ? href.substring(q) : href.substring(q, h);

  // Create url dictionary
  search.replace(
    /([^?=&]+)(=([^&]+))?/g,
    function($0, $1, $2, $3) {
      url[$1] = decodeURIComponent($3);
    }
  );

  // Define boolean parser
  url['boolean'] = function(name, defaultValue) {
    if (!url.hasOwnProperty(name))
      return defaultValue;
    return url[name] !== 'false';
  };

  // Define number parser
  url['number'] = function(name, defaultValue) {
    var r = parseFloat(url[name]);
    if (r != r) 
      return defaultValue;
    return r;
  };

  // Get hash value without hash mark
  url['hash'] = h == -1 ? undefined : href.substring(h+1);

  // Store this closure for unit tests
  url['setUrl'] = arguments.callee; 

  // Make library public
  window['url'] = url;

})(location.href);
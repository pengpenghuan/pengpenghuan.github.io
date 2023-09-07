import "./chunk-3TEUGPMP.js";

// node_modules/.pnpm/@codemirror+legacy-modes@6.3.3/node_modules/@codemirror/legacy-modes/mode/solr.js
var isStringChar = /[^\s\|\!\+\-\*\?\~\^\&\:\(\)\[\]\{\}\"\\]/;
var isOperatorChar = /[\|\!\+\-\*\?\~\^\&]/;
var isOperatorString = /^(OR|AND|NOT|TO)$/i;
function isNumber(word) {
  return parseFloat(word).toString() === word;
}
function tokenString(quote) {
  return function(stream, state) {
    var escaped = false, next;
    while ((next = stream.next()) != null) {
      if (next == quote && !escaped)
        break;
      escaped = !escaped && next == "\\";
    }
    if (!escaped)
      state.tokenize = tokenBase;
    return "string";
  };
}
function tokenOperator(operator) {
  return function(stream, state) {
    if (operator == "|")
      stream.eat(/\|/);
    else if (operator == "&")
      stream.eat(/\&/);
    state.tokenize = tokenBase;
    return "operator";
  };
}
function tokenWord(ch) {
  return function(stream, state) {
    var word = ch;
    while ((ch = stream.peek()) && ch.match(isStringChar) != null) {
      word += stream.next();
    }
    state.tokenize = tokenBase;
    if (isOperatorString.test(word))
      return "operator";
    else if (isNumber(word))
      return "number";
    else if (stream.peek() == ":")
      return "propertyName";
    else
      return "string";
  };
}
function tokenBase(stream, state) {
  var ch = stream.next();
  if (ch == '"')
    state.tokenize = tokenString(ch);
  else if (isOperatorChar.test(ch))
    state.tokenize = tokenOperator(ch);
  else if (isStringChar.test(ch))
    state.tokenize = tokenWord(ch);
  return state.tokenize != tokenBase ? state.tokenize(stream, state) : null;
}
var solr = {
  name: "solr",
  startState: function() {
    return {
      tokenize: tokenBase
    };
  },
  token: function(stream, state) {
    if (stream.eatSpace())
      return null;
    return state.tokenize(stream, state);
  }
};
export {
  solr
};
//# sourceMappingURL=solr-T642WQH3.js.map

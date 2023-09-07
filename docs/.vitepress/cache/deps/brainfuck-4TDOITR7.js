import "./chunk-3TEUGPMP.js";

// node_modules/.pnpm/@codemirror+legacy-modes@6.3.3/node_modules/@codemirror/legacy-modes/mode/brainfuck.js
var reserve = "><+-.,[]".split("");
var brainfuck = {
  name: "brainfuck",
  startState: function() {
    return {
      commentLine: false,
      left: 0,
      right: 0,
      commentLoop: false
    };
  },
  token: function(stream, state) {
    if (stream.eatSpace())
      return null;
    if (stream.sol()) {
      state.commentLine = false;
    }
    var ch = stream.next().toString();
    if (reserve.indexOf(ch) !== -1) {
      if (state.commentLine === true) {
        if (stream.eol()) {
          state.commentLine = false;
        }
        return "comment";
      }
      if (ch === "]" || ch === "[") {
        if (ch === "[") {
          state.left++;
        } else {
          state.right++;
        }
        return "bracket";
      } else if (ch === "+" || ch === "-") {
        return "keyword";
      } else if (ch === "<" || ch === ">") {
        return "atom";
      } else if (ch === "." || ch === ",") {
        return "def";
      }
    } else {
      state.commentLine = true;
      if (stream.eol()) {
        state.commentLine = false;
      }
      return "comment";
    }
    if (stream.eol()) {
      state.commentLine = false;
    }
  }
};
export {
  brainfuck
};
//# sourceMappingURL=brainfuck-4TDOITR7.js.map

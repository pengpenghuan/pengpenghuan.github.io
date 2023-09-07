import {
  completeFromList,
  ifNotIn,
  snippetCompletion
} from "./chunk-4AGQ5J3S.js";
import {
  ContextTracker,
  ExternalTokenizer,
  IterMode,
  LRLanguage,
  LRParser,
  LanguageSupport,
  NodeWeakMap,
  delimitedIndent,
  foldInside,
  foldNodeProp,
  indentNodeProp,
  styleTags,
  syntaxTree,
  tags
} from "./chunk-S5BUKLIZ.js";
import "./chunk-3TEUGPMP.js";

// node_modules/.pnpm/@lezer+python@1.1.8/node_modules/@lezer/python/dist/index.js
var printKeyword = 1;
var indent = 196;
var dedent = 197;
var newline$1 = 198;
var blankLineStart = 199;
var newlineBracketed = 200;
var eof = 201;
var formatString1Content = 202;
var formatString1Brace = 2;
var formatString1End = 203;
var formatString2Content = 204;
var formatString2Brace = 3;
var formatString2End = 205;
var formatString1lContent = 206;
var formatString1lBrace = 4;
var formatString1lEnd = 207;
var formatString2lContent = 208;
var formatString2lBrace = 5;
var formatString2lEnd = 209;
var ParenL = 26;
var ParenthesizedExpression = 27;
var TupleExpression = 51;
var ComprehensionExpression = 52;
var BracketL = 57;
var ArrayExpression = 58;
var ArrayComprehensionExpression = 59;
var BraceL = 61;
var DictionaryExpression = 62;
var DictionaryComprehensionExpression = 63;
var SetExpression = 64;
var SetComprehensionExpression = 65;
var ArgList = 67;
var subscript = 246;
var FormatString = 74;
var importList = 265;
var ParamList = 129;
var SequencePattern = 150;
var MappingPattern = 151;
var PatternArgList = 154;
var newline = 10;
var carriageReturn = 13;
var space = 32;
var tab = 9;
var hash = 35;
var parenOpen = 40;
var dot = 46;
var braceOpen = 123;
var singleQuote = 39;
var doubleQuote = 34;
var backslash = 92;
var bracketed = /* @__PURE__ */ new Set([
  ParenthesizedExpression,
  TupleExpression,
  ComprehensionExpression,
  importList,
  ArgList,
  ParamList,
  ArrayExpression,
  ArrayComprehensionExpression,
  subscript,
  SetExpression,
  SetComprehensionExpression,
  FormatString,
  DictionaryExpression,
  DictionaryComprehensionExpression,
  SequencePattern,
  MappingPattern,
  PatternArgList
]);
function isLineBreak(ch) {
  return ch == newline || ch == carriageReturn;
}
var newlines = new ExternalTokenizer((input, stack) => {
  let prev;
  if (input.next < 0) {
    input.acceptToken(eof);
  } else if (stack.context.depth < 0) {
    if (isLineBreak(input.next))
      input.acceptToken(newlineBracketed, 1);
  } else if (((prev = input.peek(-1)) < 0 || isLineBreak(prev)) && stack.canShift(blankLineStart)) {
    let spaces = 0;
    while (input.next == space || input.next == tab) {
      input.advance();
      spaces++;
    }
    if (input.next == newline || input.next == carriageReturn || input.next == hash)
      input.acceptToken(blankLineStart, -spaces);
  } else if (isLineBreak(input.next)) {
    input.acceptToken(newline$1, 1);
  }
}, { contextual: true });
var indentation = new ExternalTokenizer((input, stack) => {
  let cDepth = stack.context.depth;
  if (cDepth < 0)
    return;
  let prev = input.peek(-1);
  if (prev == newline || prev == carriageReturn) {
    let depth = 0, chars = 0;
    for (; ; ) {
      if (input.next == space)
        depth++;
      else if (input.next == tab)
        depth += 8 - depth % 8;
      else
        break;
      input.advance();
      chars++;
    }
    if (depth != cDepth && input.next != newline && input.next != carriageReturn && input.next != hash) {
      if (depth < cDepth)
        input.acceptToken(dedent, -chars);
      else
        input.acceptToken(indent);
    }
  }
});
function IndentLevel(parent, depth) {
  this.parent = parent;
  this.depth = depth;
  this.hash = (parent ? parent.hash + parent.hash << 8 : 0) + depth + (depth << 4);
}
var topIndent = new IndentLevel(null, 0);
function countIndent(space2) {
  let depth = 0;
  for (let i = 0; i < space2.length; i++)
    depth += space2.charCodeAt(i) == tab ? 8 - depth % 8 : 1;
  return depth;
}
var trackIndent = new ContextTracker({
  start: topIndent,
  reduce(context, term) {
    return context.depth < 0 && bracketed.has(term) ? context.parent : context;
  },
  shift(context, term, stack, input) {
    if (term == indent)
      return new IndentLevel(context, countIndent(input.read(input.pos, stack.pos)));
    if (term == dedent)
      return context.parent;
    if (term == ParenL || term == BracketL || term == BraceL)
      return new IndentLevel(context, -1);
    return context;
  },
  hash(context) {
    return context.hash;
  }
});
var legacyPrint = new ExternalTokenizer((input) => {
  for (let i = 0; i < 5; i++) {
    if (input.next != "print".charCodeAt(i))
      return;
    input.advance();
  }
  if (/\w/.test(String.fromCharCode(input.next)))
    return;
  for (let off = 0; ; off++) {
    let next = input.peek(off);
    if (next == space || next == tab)
      continue;
    if (next != parenOpen && next != dot && next != newline && next != carriageReturn && next != hash)
      input.acceptToken(printKeyword);
    return;
  }
});
function formatString(quote, len, content, brace, end) {
  return new ExternalTokenizer((input) => {
    let start = input.pos;
    for (; ; ) {
      if (input.next < 0) {
        break;
      } else if (input.next == braceOpen) {
        if (input.peek(1) == braceOpen) {
          input.advance(2);
        } else {
          if (input.pos == start) {
            input.acceptToken(brace, 1);
            return;
          }
          break;
        }
      } else if (input.next == backslash) {
        input.advance();
        if (input.next >= 0)
          input.advance();
      } else if (input.next == quote && (len == 1 || input.peek(1) == quote && input.peek(2) == quote)) {
        if (input.pos == start) {
          input.acceptToken(end, len);
          return;
        }
        break;
      } else {
        input.advance();
      }
    }
    if (input.pos > start)
      input.acceptToken(content);
  });
}
var formatString1 = formatString(singleQuote, 1, formatString1Content, formatString1Brace, formatString1End);
var formatString2 = formatString(doubleQuote, 1, formatString2Content, formatString2Brace, formatString2End);
var formatString1l = formatString(singleQuote, 3, formatString1lContent, formatString1lBrace, formatString1lEnd);
var formatString2l = formatString(doubleQuote, 3, formatString2lContent, formatString2lBrace, formatString2lEnd);
var pythonHighlighting = styleTags({
  'async "*" "**" FormatConversion FormatSpec': tags.modifier,
  "for while if elif else try except finally return raise break continue with pass assert await yield match case": tags.controlKeyword,
  "in not and or is del": tags.operatorKeyword,
  "from def class global nonlocal lambda": tags.definitionKeyword,
  import: tags.moduleKeyword,
  "with as print": tags.keyword,
  Boolean: tags.bool,
  None: tags.null,
  VariableName: tags.variableName,
  "CallExpression/VariableName": tags.function(tags.variableName),
  "FunctionDefinition/VariableName": tags.function(tags.definition(tags.variableName)),
  "ClassDefinition/VariableName": tags.definition(tags.className),
  PropertyName: tags.propertyName,
  "CallExpression/MemberExpression/PropertyName": tags.function(tags.propertyName),
  Comment: tags.lineComment,
  Number: tags.number,
  String: tags.string,
  FormatString: tags.special(tags.string),
  UpdateOp: tags.updateOperator,
  "ArithOp!": tags.arithmeticOperator,
  BitOp: tags.bitwiseOperator,
  CompareOp: tags.compareOperator,
  AssignOp: tags.definitionOperator,
  Ellipsis: tags.punctuation,
  At: tags.meta,
  "( )": tags.paren,
  "[ ]": tags.squareBracket,
  "{ }": tags.brace,
  ".": tags.derefOperator,
  ", ;": tags.separator
});
var spec_identifier = { __proto__: null, await: 48, or: 58, and: 60, in: 64, not: 66, is: 68, if: 74, else: 76, lambda: 80, yield: 98, from: 100, async: 106, for: 108, None: 168, True: 170, False: 170, del: 184, pass: 188, break: 192, continue: 196, return: 200, raise: 208, import: 212, as: 214, global: 218, nonlocal: 220, assert: 224, elif: 234, while: 238, try: 244, except: 246, finally: 248, with: 252, def: 256, class: 266, match: 277, case: 283 };
var parser = LRParser.deserialize({
  version: 14,
  states: "#!OO`Q#yOOP$_OSOOO%hQ&nO'#H^OOQS'#Cq'#CqOOQS'#Cr'#CrO'WQ#xO'#CpO(yQ&nO'#H]OOQS'#H^'#H^OOQS'#DW'#DWOOQS'#H]'#H]O)gQ#xO'#DaO)zQ#xO'#DhO*[Q#xO'#DlOOQS'#Dw'#DwO*oO,UO'#DwO*wO7[O'#DwO+POWO'#DxO+[O`O'#DxO+gOpO'#DxO+rO!bO'#DxO-tQ&nO'#G}OOQS'#G}'#G}O'WQ#xO'#G|O/WQ&nO'#G|OOQS'#Ee'#EeO/oQ#xO'#EfOOQS'#G{'#G{O/yQ#xO'#GzOOQV'#Gz'#GzO0UQ#xO'#FXOOQS'#G`'#G`O0ZQ#xO'#FWOOQV'#IS'#ISOOQV'#Gy'#GyOOQV'#Fp'#FpQ`Q#yOOO'WQ#xO'#CsO0iQ#xO'#DPO0pQ#xO'#DTO1OQ#xO'#HbO1`Q&nO'#EYO'WQ#xO'#EZOOQS'#E]'#E]OOQS'#E_'#E_OOQS'#Ea'#EaO1tQ#xO'#EcO2[Q#xO'#EgO0UQ#xO'#EiO2oQ&nO'#EiO0UQ#xO'#ElO/oQ#xO'#EoO/oQ#xO'#EsO/oQ#xO'#EvO2zQ#xO'#ExO3RQ#xO'#E}O3^Q#xO'#EyO/oQ#xO'#E}O0UQ#xO'#FPO0UQ#xO'#FUO3cQ#xO'#FZP3jO#xO'#GxPOOO)CBl)CBlOOQS'#Cg'#CgOOQS'#Ch'#ChOOQS'#Ci'#CiOOQS'#Cj'#CjOOQS'#Ck'#CkOOQS'#Cl'#ClOOQS'#Cn'#CnO'WQ#xO,59QO'WQ#xO,59QO'WQ#xO,59QO'WQ#xO,59QO'WQ#xO,59QO'WQ#xO,59QO3uQ#xO'#DqOOQS,5:[,5:[O4YQ#xO'#HlOOQS,5:_,5:_O4gQMlO,5:_O4lQ&nO,59[O0iQ#xO,59dO0iQ#xO,59dO0iQ#xO,59dO7[Q#xO,59dO7aQ#xO,59dO7hQ#xO,59lO7oQ#xO'#H]O8uQ#xO'#H[OOQS'#H['#H[OOQS'#D^'#D^O9^Q#xO,59cO'WQ#xO,59cO9lQ#xO,59cOOQS,59{,59{O9qQ#xO,5:TO'WQ#xO,5:TOOQS,5:S,5:SO:PQ#xO,5:SO:UQ#xO,5:ZO'WQ#xO,5:ZO'WQ#xO,5:XOOQS,5:W,5:WO:gQ#xO,5:WO:lQ#xO,5:YOOOO'#Fx'#FxO:qO,UO,5:cOOQS,5:c,5:cOOOO'#Fy'#FyO:yO7[O,5:cO;RQ#xO'#DyOOOW'#Fz'#FzO;cOWO,5:dOOQS,5:d,5:dO;RQ#xO'#D}OOO`'#F}'#F}O;nO`O,5:dO;RQ#xO'#EOOOOp'#GO'#GOO;yOpO,5:dO;RQ#xO'#EPOOO!b'#GP'#GPO<UO!bO,5:dOOQS'#GQ'#GQO<aQ&nO,5:lO?RQ&nO,5=hO?lQ!LUO,5=hO@]Q&nO,5=hOOQS,5;Q,5;QO@tQ#yO'#GYOBTQ#xO,5;]OOQV,5=f,5=fOB`Q&nO'#IOOBwQ#xO,5;sOOQS-E:^-E:^OOQV,5;r,5;rO3XQ#xO'#FPOOQV-E9n-E9nOCPQ&nO,59_OEWQ&nO,59kOEqQ#xO'#H_OE|Q#xO'#H_O0UQ#xO'#H_OFXQ#xO'#DVOFaQ#xO,59oOFfQ#xO'#HcO'WQ#xO'#HcO/oQ#xO,5=|OOQS,5=|,5=|O/oQ#xO'#EUOOQS'#EV'#EVOGTQ#xO'#GSOGeQ#xO,59OOGeQ#xO,59OO)mQ#xO,5:rOGsQ&nO'#HeOOQS,5:u,5:uOOQS,5:},5:}OHWQ#xO,5;ROHiQ#xO,5;TOOQS'#GV'#GVOHwQ&nO,5;TOIVQ#xO,5;TOI[Q#xO'#IROOQS,5;W,5;WOIjQ#xO'#H}OOQS,5;Z,5;ZO3^Q#xO,5;_O3^Q#xO,5;bOI{Q&nO'#ITO'WQ#xO'#ITOJVQ#xO,5;dO2zQ#xO,5;dO/oQ#xO,5;iO0UQ#xO,5;kOJ[Q#yO'#EtOKeQ#{O,5;eONvQ#xO'#IUO3^Q#xO,5;iO! RQ#xO,5;kO! WQ#xO,5;pO! `Q&nO,5;uO'WQ#xO,5;uPOOO,5=d,5=dP! gOSO,5=dP! lO#xO,5=dO!$aQ&nO1G.lO!$hQ&nO1G.lO!'XQ&nO1G.lO!'cQ&nO1G.lO!)|Q&nO1G.lO!*aQ&nO1G.lO!*tQ#xO'#HkO!+SQ&nO'#G}O/oQ#xO'#HkO!+^Q#xO'#HjOOQS,5:],5:]O!+fQ#xO,5:]O!+kQ#xO'#HmO!+vQ#xO'#HmO!,ZQ#xO,5>WOOQS'#Du'#DuOOQS1G/y1G/yOOQS1G/O1G/OO!-ZQ&nO1G/OO!-bQ&nO1G/OO0iQ#xO1G/OO!-}Q#xO1G/WOOQS'#D]'#D]O/oQ#xO,59vOOQS1G.}1G.}O!.UQ#xO1G/gO!.fQ#xO1G/gO!.nQ#xO1G/hO'WQ#xO'#HdO!.sQ#xO'#HdO!.xQ&nO1G.}O!/YQ#xO,59kO!0`Q#xO,5>SO!0pQ#xO,5>SO!0xQ#xO1G/oO!0}Q&nO1G/oOOQS1G/n1G/nO!1_Q#xO,5=}O!2UQ#xO,5=}O/oQ#xO1G/sO!2sQ#xO1G/uO!2xQ&nO1G/uO!3YQ&nO1G/sOOQS1G/r1G/rOOQS1G/t1G/tOOOO-E9v-E9vOOQS1G/}1G/}OOOO-E9w-E9wO!3jQ#xO'#HwO/oQ#xO'#HwO!3xQ#xO,5:eOOOW-E9x-E9xOOQS1G0O1G0OO!4TQ#xO,5:iOOO`-E9{-E9{O!4`Q#xO,5:jOOOp-E9|-E9|O!4kQ#xO,5:kOOO!b-E9}-E9}OOQS-E:O-E:OO!4vQ!LUO1G3SO!5gQ&nO1G3SO'WQ#xO,5<mOOQS,5<m,5<mOOQS-E:P-E:POOQS,5<t,5<tOOQS-E:W-E:WOOQV1G0w1G0wO0UQ#xO'#GUO!6OQ&nO,5>jOOQS1G1_1G1_O!6gQ#xO1G1_OOQS'#DX'#DXO/oQ#xO,5=yOOQS,5=y,5=yO!6lQ#xO'#FqO!6wQ#xO,59qO!7PQ#xO1G/ZO!7ZQ&nO,5=}OOQS1G3h1G3hOOQS,5:p,5:pO!7zQ#xO'#G|OOQS,5<n,5<nOOQS-E:Q-E:QO!8]Q#xO1G.jOOQS1G0^1G0^O!8kQ#xO,5>PO!8{Q#xO,5>PO/oQ#xO1G0mO/oQ#xO1G0mO0UQ#xO1G0oOOQS-E:T-E:TO!9^Q#xO1G0oO!9iQ#xO1G0oO!9nQ#xO,5>mO!9|Q#xO,5>mO!:[Q#xO,5>iO!:rQ#xO,5>iO!;TQ#{O1G0yO!>cQ#{O1G0|O!AnQ#xO,5>oO!AxQ#xO,5>oO!BQQ&nO,5>oO/oQ#xO1G1OO!B[Q#xO1G1OO3^Q#xO1G1TO! RQ#xO1G1VOOQV,5;`,5;`O!BaQ#zO,5;`O!BfQ#{O1G1PO!EwQ#xO'#G]O3^Q#xO1G1PO3^Q#xO1G1PO!FUQ#xO,5>pO!FcQ#xO,5>pO0UQ#xO,5>pOOQV1G1T1G1TO!FkQ#xO'#FRO!F|QMlO1G1VOOQV1G1[1G1[O3^Q#xO1G1[O!GUQ#xO'#F]OOQV1G1a1G1aO! `Q&nO1G1aPOOO1G3O1G3OP!GZOSO1G3OOOQS,5>V,5>VOOQS'#Dr'#DrO/oQ#xO,5>VO!G`Q#xO,5>UO!GsQ#xO,5>UOOQS1G/w1G/wO!G{Q#xO,5>XO!H]Q#xO,5>XO!HeQ#xO,5>XO!HxQ#xO,5>XO!IYQ#xO,5>XOOQS1G3r1G3rOOQS7+$j7+$jO!7PQ#xO7+$rO!J{Q#xO1G/OO!KSQ#xO1G/OOOQS1G/b1G/bOOQS,5<_,5<_O'WQ#xO,5<_OOQS7+%R7+%RO!KZQ#xO7+%ROOQS-E9q-E9qOOQS7+%S7+%SO!KkQ#xO,5>OO'WQ#xO,5>OOOQS7+$i7+$iO!KpQ#xO7+%RO!KxQ#xO7+%SO!K}Q#xO1G3nOOQS7+%Z7+%ZO!L_Q#xO1G3nO!LgQ#xO7+%ZOOQS,5<^,5<^O'WQ#xO,5<^O!LlQ#xO1G3iOOQS-E9p-E9pO!McQ#xO7+%_OOQS7+%a7+%aO!MqQ#xO1G3iO!N`Q#xO7+%aO!NeQ#xO1G3oO!NuQ#xO1G3oO!N}Q#xO7+%_O# SQ#xO,5>cO# jQ#xO,5>cO# jQ#xO,5>cO# xO$ISO'#D{O#!TO#tO'#HxOOOW1G0P1G0PO#!YQ#xO1G0POOO`1G0T1G0TO#!bQ#xO1G0TOOOp1G0U1G0UO#!jQ#xO1G0UOOO!b1G0V1G0VO#!rQ#xO1G0VO#!zQ!LUO7+(nO##kQ&nO1G2XP#$UQ#xO'#GROOQS,5<p,5<pOOQS-E:S-E:SOOQS7+&y7+&yOOQS1G3e1G3eOOQS,5<],5<]OOQS-E9o-E9oOOQS7+$u7+$uO#$cQ#xO,5=hO#$|Q#xO,5=hO#%_Q&nO,5<`O#%rQ#xO1G3kOOQS-E9r-E9rOOQS7+&X7+&XO#&SQ#xO7+&XOOQS7+&Z7+&ZO#&bQ#xO'#IQO0UQ#xO'#IPO#&vQ#xO7+&ZOOQS,5<s,5<sO#'RQ#xO1G4XOOQS-E:V-E:VOOQS,5<o,5<oO#'aQ#xO1G4TOOQS-E:R-E:RO#'wQ#{O7+&eO!EwQ#xO'#GZO3^Q#xO7+&eO3^Q#xO7+&hO#+VQ&nO,5<vO'WQ#xO,5<vO#+aQ#xO1G4ZOOQS-E:Y-E:YO#+kQ#xO1G4ZO3^Q#xO7+&jO/oQ#xO7+&jOOQV7+&o7+&oO!F|QMlO7+&qO`Q#yO1G0zOOQV-E:Z-E:ZO3^Q#xO7+&kO3^Q#xO7+&kOOQV,5<w,5<wO#+sQ#xO,5<wOOQV7+&k7+&kO#,OQ#{O7+&kO#/ZQ#xO,5<xO#/fQ#xO1G4[OOQS-E:[-E:[O#/sQ#xO1G4[O#/{Q#xO'#IWO#0ZQ#xO'#IWO0UQ#xO'#IWOOQS'#IW'#IWO#0fQ#xO'#IVOOQS,5;m,5;mO#0nQ#xO,5;mO/oQ#xO'#FTOOQV7+&q7+&qO3^Q#xO7+&qOOQV7+&v7+&vO#0sQ#zO,5;wOOQV7+&{7+&{POOO7+(j7+(jOOQS1G3q1G3qOOQS,5<b,5<bO#0xQ#xO1G3pOOQS-E9t-E9tO#1]Q#xO,5<cO#1hQ#xO,5<cO#1{Q#xO1G3sOOQS-E9u-E9uO#2]Q#xO1G3sO#2eQ#xO1G3sO#2uQ#xO1G3sO#2]Q#xO1G3sOOQS<<H^<<H^O#3QQ&nO1G1yOOQS<<Hm<<HmP#3_Q#xO'#FsO7hQ#xO1G3jO#3lQ#xO1G3jO#3qQ#xO<<HmOOQS<<Hn<<HnO#4RQ#xO7+)YOOQS<<Hu<<HuO#4cQ&nO1G1xP#5SQ#xO'#FrO#5aQ#xO7+)ZO#5qQ#xO7+)ZO#5yQ#xO<<HyO#6OQ#xO7+)TOOQS<<H{<<H{O#6uQ#xO,5<aO'WQ#xO,5<aOOQS-E9s-E9sOOQS<<Hy<<HyOOQS,5<g,5<gO/oQ#xO,5<gO#6zQ#xO1G3}OOQS-E9y-E9yO#7bQ#xO1G3}O;RQ#xO'#D|OOOO'#F|'#F|O#7pO$ISO,5:gOOO#l,5>d,5>dOOOW7+%k7+%kOOO`7+%o7+%oOOOp7+%p7+%pOOO!b7+%q7+%qO#7{Q#xO1G3SO#8fQ#xO1G3SP'WQ#xO'#FtO/oQ#xO<<IsO#8wQ#xO,5>lO#9YQ#xO,5>lO0UQ#xO,5>lO#9kQ#xO,5>kOOQS<<Iu<<IuP0UQ#xO'#GXP/oQ#xO'#GTOOQV-E:X-E:XO3^Q#xO<<JPOOQV,5<u,5<uO3^Q#xO,5<uOOQV<<JP<<JPOOQV<<JS<<JSO#9pQ&nO1G2bP#9zQ#xO'#G[O#:RQ#xO7+)uO#:]Q#{O<<JUO3^Q#xO<<JUOOQV<<J]<<J]O3^Q#xO<<J]O#=hQ#{O7+&fOOQV<<JV<<JVO#=rQ#{O<<JVOOQV1G2c1G2cO0UQ#xO1G2cO3^Q#xO<<JVO0UQ#xO1G2dP/oQ#xO'#G^O#@}Q#xO7+)vO#A[Q#xO7+)vOOQS'#FS'#FSO/oQ#xO,5>rO#AdQ#xO,5>rOOQS,5>r,5>rO#AoQ#xO,5>qO#BQQ#xO,5>qOOQS1G1X1G1XOOQS,5;o,5;oO#BYQ#xO1G1cP#B_Q#xO'#FvO#BoQ#xO1G1}O#CSQ#xO1G1}O#CdQ#xO1G1}P#CoQ#xO'#FwO#C|Q#xO7+)_O#D^Q#xO7+)_O#D^Q#xO7+)_O#DfQ#xO7+)_O#DvQ#xO7+)UO7hQ#xO7+)UOOQSAN>XAN>XO#EaQ#xO<<LuOOQSAN>eAN>eO/oQ#xO1G1{O#EqQ&nO1G1{P#E{Q#xO'#FuOOQS1G2R1G2RP#FYQ#xO'#F{O#FgQ#xO7+)iO#F}Q#xO,5:hOOOO-E9z-E9zO#GYQ#xO7+(nOOQSAN?_AN?_O#GsQ#xO,5<rO#HXQ#xO1G4WOOQS-E:U-E:UO#HjQ#xO1G4WOOQS1G4V1G4VOOQVAN?kAN?kOOQV1G2a1G2aO3^Q#xOAN?pO#H{Q#{OAN?pOOQVAN?wAN?wOOQV<<JQ<<JQO3^Q#xOAN?qO3^Q#xO7+'}OOQVAN?qAN?qOOQS7+(O7+(OO#LWQ#xO<<MbOOQS1G4^1G4^O/oQ#xO1G4^OOQS,5<y,5<yO#LeQ#xO1G4]OOQS-E:]-E:]OOQU'#Ga'#GaO#LvQ#zO7+&}O#MRQ#xO'#F^O#MyQ#xO7+'iO#NZQ#xO7+'iOOQS7+'i7+'iO#NfQ#xO<<LyO#NvQ#xO<<LyO#NvQ#xO<<LyO$ OQ#xO'#HfOOQS<<Lp<<LpO$ YQ#xO<<LpOOQS7+'g7+'gOOOO1G0S1G0SO$ sQ#xO1G0SO0UQ#xO1G2^P0UQ#xO'#GWO$ {Q#xO7+)rO$!^Q#xO7+)rOOQVG25[G25[O3^Q#xOG25[OOQVG25]G25]OOQV<<Ki<<KiOOQS7+)x7+)xP$!oQ#xO'#G_OOQU-E:_-E:_OOQV<<Ji<<JiO$#cQ&nO'#F`OOQS'#Fb'#FbO$#sQ#xO'#FaO$$eQ#xO'#FaOOQS'#Fa'#FaO$$jQ#xO'#IYO#MRQ#xO'#FhO#MRQ#xO'#FhO$%RQ#xO'#FiO#MRQ#xO'#FjO$%YQ#xO'#IZOOQS'#IZ'#IZO$%wQ#xO,5;xOOQS<<KT<<KTO$&PQ#xO<<KTO$&aQ#xOANBeO$&qQ#xOANBeO$&yQ#xO'#HgOOQS'#Hg'#HgO0pQ#xO'#DeO$'dQ#xO,5>QOOQSANB[ANB[OOOO7+%n7+%nOOQS7+'x7+'xO$'{Q#xO<<M^OOQVLD*vLD*vO4gQMlO'#GcO$(^Q&nO,5<RO#MRQ#xO'#FlOOQS,5<V,5<VOOQS'#Fc'#FcO$)OQ#xO,5;{O$)TQ#xO,5;{OOQS'#Ff'#FfO#MRQ#xO'#GbO$)uQ#xO,5<PO$*aQ#xO,5>tO$*qQ#xO,5>tO0UQ#xO,5<OO$+SQ#xO,5<SO$+XQ#xO,5<SO#MRQ#xO'#I[O$+^Q#xO'#I[O$+cQ#xO,5<TOOQS,5<U,5<UO'WQ#xO'#FoOOQU1G1d1G1dO3^Q#xO1G1dOOQSAN@oAN@oO$+hQ#xOG28PO$+xQ#xO,5:POOQS1G3l1G3lOOQS,5<},5<}OOQS-E:a-E:aO$+}Q&nO'#F`O$,UQ#xO'#I]O$,dQ#xO'#I]O$,lQ#xO,5<WOOQS1G1g1G1gO$,qQ#xO1G1gO$,vQ#xO,5<|OOQS-E:`-E:`O$-bQ#xO,5=QO$-yQ#xO1G4`OOQS-E:d-E:dOOQS1G1j1G1jOOQS1G1n1G1nO$.ZQ#xO,5>vO#MRQ#xO,5>vOOQS1G1o1G1oO$.iQ&nO,5<ZOOQU7+'O7+'OO$ OQ#xO1G/kO#MRQ#xO,5<XO$.pQ#xO,5>wO$.wQ#xO,5>wOOQS1G1r1G1rOOQS7+'R7+'RP#MRQ#xO'#GfO$/PQ#xO1G4bO$/ZQ#xO1G4bO$/cQ#xO1G4bOOQS7+%V7+%VO$/qQ#xO1G1sO$0PQ&nO'#F`O$0WQ#xO,5=POOQS,5=P,5=PO$0fQ#xO1G4cOOQS-E:c-E:cO#MRQ#xO,5=OO$0mQ#xO,5=OO$0rQ#xO7+)|OOQS-E:b-E:bO$0|Q#xO7+)|O#MRQ#xO,5<YP#MRQ#xO'#GeO$1UQ#xO1G2jO#MRQ#xO1G2jP$1dQ#xO'#GdO$1kQ#xO<<MhO$1uQ#xO1G1tO$2TQ#xO7+(UO7hQ#xO'#DPO7hQ#xO,59dO7hQ#xO,59dO7hQ#xO,59dO$2cQ&nO,5=hO7hQ#xO1G/OO/oQ#xO1G/ZO/oQ#xO7+$rP$2vQ#xO'#GRO'WQ#xO'#G|O$3TQ#xO,59dO$3YQ#xO,59dO$3aQ#xO,59oO$3fQ#xO1G/WO0pQ#xO'#DTO7hQ#xO,59l",
  stateData: "$3w~O%kOS%`OSUOS%_PQ~OPiOXfOhtOjYOquOu!TOxvO!RwO!S!QO!V!WO!W!VO!ZZO!_[O!jeO!ueO!veO!weO#OyO#QzO#S{O#U|O#W}O#[!OO#^!PO#a!RO#b!RO#d!SO#k!UO#n!XO#r!YO#t!ZO#y![O#|mO$O!]O%wRO%xRO%|SO%}WO&c]O&d^O&g_O&j`O&naO&obO&pcO~O%_!^O~OX!eOa!eOc!fOj!mO!Z!oO!h!qO%r!`O%s!aO%t!bO%u!cO%v!cO%w!dO%x!dO%y!eO%z!eO%{!eO~Om&QXn&QXo&QXp&QXq&QXr&QXu&QX|&QX}&QX!{&QX#f&QX%^&QX%a&QX&S&QXi&QX!V&QX!W&QX&T&QX!Y&QX!^&QX!S&QX#_&QXv&QX!n&QX~P$dOhtOjYO!ZZO!_[O!jeO!ueO!veO!weO%wRO%xRO%|SO%}WO&c]O&d^O&g_O&j`O&naO&obO&pcO~O|&PX}&PX#f&PX%^&PX%a&PX&S&PX~Om!tOn!uOo!sOp!sOq!vOr!wOu!xO!{&PX~P(eOX#OOi#QOq0VOx0eO!RwO~P'WOX#SOq0VOx0eO!Y#TO~P'WOX#WOc#XOq0VOx0eO!^#YO~P'WO&e#]O&f#_O~O&h#`O&i#_O~OQ#bO%b#cO%c#eO~OR#fO%d#gO%e#eO~OS#iO%f#jO%g#eO~OT#lO%h#mO%i#eO~OX%qXa%qXc%qXj%qXm%qXn%qXo%qXp%qXq%qXr%qXu%qX|%qX!Z%qX!h%qX%r%qX%s%qX%t%qX%u%qX%v%qX%w%qX%x%qX%y%qX%z%qX%{%qXi%qX!V%qX!W%qX~O&c]O&d^O&g_O&j`O&naO&obO&pcO}%qX!{%qX#f%qX%^%qX%a%qX&S%qX&T%qX!Y%qX!^%qX!S%qX#_%qXv%qX!n%qX~P+}O|#rO}%pX!{%pX#f%pX%^%pX%a%pX&S%pX~Oq0VOx0eO~P'WO#f#uO%^#wO%a#wO~O%}WO~O!V#|O#t!ZO#y![O#|mO~OquO~P'WOX$ROc$SO%}WO}yP~OX$WOq0VOx0eO!S$XO~P'WO}$ZO!{$`O&S$[O#f!|X%^!|X%a!|X~OX$WOq0VOx0eO#f#VX%^#VX%a#VX~P'WOq0VOx0eO#f#ZX%^#ZX%a#ZX~P'WO!h$fO!u$fO%}WO~OX$pO~P'WO!W$rO#r$sO#t$tO~O}$uO~OX$|O~P'WOU%OO%^$}O%k%PO~OX%YOc%YOi%[Oq0VOx0eO~P'WOq0VOx0eO}%_O~P'WO&b%aO~Oc!fOj!mO!Z!oO!h!qOXdaadamdandaodapdaqdardauda|da}da!{da#fda%^da%ada%rda%sda%tda%uda%vda%wda%xda%yda%zda%{da&Sdaida!Vda!Wda&Tda!Yda!^da!Sda#_davda!nda~Op%fO~Oq%fO~P'WOq0VO~P'WOm0XOn0YOo0WOp0WOq0aOr0bOu0fOi&PX!V&PX!W&PX&T&PX!Y&PX!^&PX!S&PX#_&PX!n&PX~P(eO&T%hOi&OX|&OX!V&OX!W&OX!Y&OX}&OX~Oi%jO|%kO!V%oO!W%nO~Oi%jO~O|%rO!V%oO!W%nO!Y&[X~O!Y%vO~O|%wO}%yO!V%oO!W%nO!^&VX~O!^%}O~O!^&OO~O&e#]O&f&QO~O&h#`O&i&QO~OX&TOq0VOx0eO!RwO~P'WOQ#bO%b#cO%c&WO~OR#fO%d#gO%e&WO~OS#iO%f#jO%g&WO~OT#lO%h#mO%i&WO~OX!taa!tac!taj!tam!tan!tao!tap!taq!tar!tau!ta|!ta}!ta!Z!ta!h!ta!{!ta#f!ta%^!ta%a!ta%r!ta%s!ta%t!ta%u!ta%v!ta%w!ta%x!ta%y!ta%z!ta%{!ta&S!tai!ta!V!ta!W!ta&T!ta!Y!ta!^!ta!S!ta#_!tav!ta!n!ta~P#vO|&`O}%pa!{%pa#f%pa%^%pa%a%pa&S%pa~P$dOX&bOquOxvO}%pa!{%pa#f%pa%^%pa%a%pa&S%pa~P'WO|&`O}%pa!{%pa#f%pa%^%pa%a%pa&S%pa~OPiOXfOquOxvO!RwO!S!QO#OyO#QzO#S{O#U|O#W}O#[!OO#^!PO#a!RO#b!RO#d!SO#f$|X%^$|X%a$|X~P'WO#f#uO%^&gO%a&gO~O!h&hOj&rX%^&rX#_&rX#f&rX%a&rX#^&rX~Oj!mO%^&jO~Omgangaogapgaqgargauga|ga}ga!{ga#fga%^ga%aga&Sgaiga!Vga!Wga&Tga!Yga!^ga!Sga#_gavga!nga~P$dOusa|sa}sa#fsa%^sa%asa&Ssa~Om!tOn!uOo!sOp!sOq!vOr!wO!{sa~PDoO&S&lO|&RX}&RX~O%}WO|&RX}&RX~O|&oO}yX~O}&qO~O|%wO#f&VX%^&VX%a&VXi&VX}&VX!^&VX!n&VX&S&VX~OX0`Oq0VOx0eO!RwO~P'WO&S$[O#fWa%^Wa%aWa~O|&zO#f&XX%^&XX%a&XXp&XX~P$dO|&}O!S&|O#f#Za%^#Za%a#Za~O#_'OO#f#]a%^#]a%a#]a~O!h$fO!u$fO#^'QO%}WO~O#^'QO~O|'SO#f&uX%^&uX%a&uX~O|'UO#f&qX%^&qX%a&qX}&qX~O|'YOp&wX~P$dOp']O~OPiOXfOquOxvO!RwO!S!QO#OyO#QzO#S{O#U|O#W}O#[!OO#^!PO#a!RO#b!RO#d!SO%^'bO~P'WOv'fO#o'dO#p'eOP#maX#mah#maj#maq#mau#max#ma!R#ma!S#ma!V#ma!W#ma!Z#ma!_#ma!j#ma!u#ma!v#ma!w#ma#O#ma#Q#ma#S#ma#U#ma#W#ma#[#ma#^#ma#a#ma#b#ma#d#ma#k#ma#n#ma#r#ma#t#ma#y#ma#|#ma$O#ma%Z#ma%w#ma%x#ma%|#ma%}#ma&c#ma&d#ma&g#ma&j#ma&n#ma&o#ma&p#ma%]#ma%a#ma~O|'gO#_'iO}&xX~Oj'kO~Oj!mO}$uO~O}'oO~P$dO%^'rO~OU'sO%^'rO~OX!eOa!eOc!fOj!mO!Z!oO!h!qO%t!bO%u!cO%v!cO%w!dO%x!dO%y!eO%z!eO%{!eOmYinYioYipYiqYirYiuYi|Yi}Yi!{Yi#fYi%^Yi%aYi%rYi&SYiiYi!VYi!WYi&TYi!YYi!^Yi!SYi#_YivYi!nYi~O%s!aO~P! tO%sYi~P! tOX!eOa!eOc!fOj!mO!Z!oO!h!qO%w!dO%x!dO%y!eO%z!eO%{!eOmYinYioYipYiqYirYiuYi|Yi}Yi!{Yi#fYi%^Yi%aYi%rYi%sYi%tYi&SYiiYi!VYi!WYi&TYi!YYi!^Yi!SYi#_YivYi!nYi~O%u!cO%v!cO~P!$oO%uYi%vYi~P!$oOc!fOj!mO!Z!oO!h!qOmYinYioYipYiqYirYiuYi|Yi}Yi!{Yi#fYi%^Yi%aYi%rYi%sYi%tYi%uYi%vYi%wYi%xYi&SYiiYi!VYi!WYi&TYi!YYi!^Yi!SYi#_YivYi!nYi~OX!eOa!eO%y!eO%z!eO%{!eO~P!'mOXYiaYi%yYi%zYi%{Yi~P!'mO!V%oO!W%nOi&_X|&_X~O&S'uO&T'uO~P+}O|'wOi&^X~Oi'yO~O|'zO}'|O!Y&aX~Oq0VOx0eO|'zO}'}O!Y&aX~P'WO!Y(PO~Oo!sOp!sOq!vOr!wOmliuli|li}li!{li#fli%^li%ali&Sli~On!uO~P!,`Onli~P!,`Om0XOn0YOo0WOp0WOq0aOr0bO~Ov(RO~P!-iOX(WOi(XOq0VOx0eO~P'WOi(XO|(YO~Oi([O~O!W(^O~Oi(_O|(YO!V%oO!W%nO~P$dOm0XOn0YOo0WOp0WOq0aOr0bOisa!Vsa!Wsa&Tsa!Ysa!^sa!Ssa#_savsa!nsa~PDoOX(WOq0VOx0eO!Y&[a~P'WO|(bO!Y&[a~O!Y(cO~O|(bO!V%oO!W%nO!Y&[a~P$dOX(gOq0VOx0eO!^&Va#f&Va%^&Va%a&Vai&Va}&Va!n&Va&S&Va~P'WO|(hO!^&Va#f&Va%^&Va%a&Vai&Va}&Va!n&Va&S&Va~O!^(kO~O|(hO!V%oO!W%nO!^&Va~P$dO|(nO!V%oO!W%nO!^&]a~P$dO|(qO}&kX!^&kX!n&kX~O}(tO!^(vO!n(wO~O}(tO!^(xO!n(yO~O}(tO!^(zO!n({O~O}(tO!^(|O!n(}O~OX&bOquOxvO}%pi!{%pi#f%pi%^%pi%a%pi&S%pi~P'WO|)OO}%pi!{%pi#f%pi%^%pi%a%pi&S%pi~O!h&hOj&ra%^&ra#_&ra#f&ra%a&ra#^&ra~O%^)TO~OX$ROc$SO%}WO~O|&oO}ya~OquOxvO~P'WO|(hO#f&Va%^&Va%a&Vai&Va}&Va!^&Va!n&Va&S&Va~P$dO|)YO#f%pX%^%pX%a%pX&S%pX~O&S$[O#fWi%^Wi%aWi~O#f&Xa%^&Xa%a&Xap&Xa~P'WO|)]O#f&Xa%^&Xa%a&Xap&Xa~OX)aOj)cO%}WO~O#^)dO~O%}WO#f&ua%^&ua%a&ua~O|)fO#f&ua%^&ua%a&ua~Oq0VOx0eO#f&qa%^&qa%a&qa}&qa~P'WO|)iO#f&qa%^&qa%a&qa}&qa~Ov)mO#i)lOP#giX#gih#gij#giq#giu#gix#gi!R#gi!S#gi!V#gi!W#gi!Z#gi!_#gi!j#gi!u#gi!v#gi!w#gi#O#gi#Q#gi#S#gi#U#gi#W#gi#[#gi#^#gi#a#gi#b#gi#d#gi#k#gi#n#gi#r#gi#t#gi#y#gi#|#gi$O#gi%Z#gi%w#gi%x#gi%|#gi%}#gi&c#gi&d#gi&g#gi&j#gi&n#gi&o#gi&p#gi%]#gi%a#gi~Ov)nOP#jiX#jih#jij#jiq#jiu#jix#ji!R#ji!S#ji!V#ji!W#ji!Z#ji!_#ji!j#ji!u#ji!v#ji!w#ji#O#ji#Q#ji#S#ji#U#ji#W#ji#[#ji#^#ji#a#ji#b#ji#d#ji#k#ji#n#ji#r#ji#t#ji#y#ji#|#ji$O#ji%Z#ji%w#ji%x#ji%|#ji%}#ji&c#ji&d#ji&g#ji&j#ji&n#ji&o#ji&p#ji%]#ji%a#ji~OX)pOp&wa~P'WO|)qOp&wa~O|)qOp&wa~P$dOp)uO~O%[)xO~Ov){O#o'dO#p)zOP#miX#mih#mij#miq#miu#mix#mi!R#mi!S#mi!V#mi!W#mi!Z#mi!_#mi!j#mi!u#mi!v#mi!w#mi#O#mi#Q#mi#S#mi#U#mi#W#mi#[#mi#^#mi#a#mi#b#mi#d#mi#k#mi#n#mi#r#mi#t#mi#y#mi#|#mi$O#mi%Z#mi%w#mi%x#mi%|#mi%}#mi&c#mi&d#mi&g#mi&j#mi&n#mi&o#mi&p#mi%]#mi%a#mi~Oq0VOx0eO}$uO~P'WOq0VOx0eO}&xa~P'WO|*RO}&xa~OX*VOc*WOi*ZO%y*XO%}WO~O}$uO&{*]O~O%^*aO~O%^*cO~OX%YOc%YOq0VOx0eOi&^a~P'WO|*fOi&^a~Oq0VOx0eO}*iO!Y&aa~P'WO|*jO!Y&aa~Oq0VOx0eO|*jO}*mO!Y&aa~P'WOq0VOx0eO|*jO!Y&aa~P'WO|*jO}*mO!Y&aa~Oo0WOp0WOq0aOr0bOilimliuli|li!Vli!Wli&Tli!Yli}li!^li#fli%^li%ali!Sli#_livli!nli&Sli~On0YO~P!IeOnli~P!IeOX(WOi*rOq0VOx0eO~P'WOp*tO~Oi*rO|*vO~Oi*wO~OX(WOq0VOx0eO!Y&[i~P'WO|*xO!Y&[i~O!Y*yO~OX(gOq0VOx0eO!^&Vi#f&Vi%^&Vi%a&Vii&Vi}&Vi!n&Vi&S&Vi~P'WO|*|O!V%oO!W%nO!^&]i~O|+PO!^&Vi#f&Vi%^&Vi%a&Vii&Vi}&Vi!n&Vi&S&Vi~O!^+QO~Oc+SOq0VOx0eO!^&]i~P'WO|*|O!^&]i~O!^+UO~OX+WOq0VOx0eO}&ka!^&ka!n&ka~P'WO|+XO}&ka!^&ka!n&ka~O!_+[O&m+]O!^!oX~O!^+_O~O}(tO!^+`O~O}(tO!^+aO~O}(tO!^+bO~O}(tO!^+cO~OX&bOquOxvO}%pq!{%pq#f%pq%^%pq%a%pq&S%pq~P'WO|$ui}$ui!{$ui#f$ui%^$ui%a$ui&S$ui~P$dOX&bOquOxvO~P'WOX&bOq0VOx0eO#f%pa%^%pa%a%pa&S%pa~P'WO|+dO#f%pa%^%pa%a%pa&S%pa~O|$ha#f$ha%^$ha%a$hap$ha~P$dO#f&Xi%^&Xi%a&Xip&Xi~P'WO|+gO#f#Zq%^#Zq%a#Zq~O|+hO#_+jO#f&tX%^&tX%a&tXi&tX~OX+lOj)cO%}WO~O%}WO#f&ui%^&ui%a&ui~Oq0VOx0eO#f&qi%^&qi%a&qi}&qi~P'WOv+pO#i)lOP#gqX#gqh#gqj#gqq#gqu#gqx#gq!R#gq!S#gq!V#gq!W#gq!Z#gq!_#gq!j#gq!u#gq!v#gq!w#gq#O#gq#Q#gq#S#gq#U#gq#W#gq#[#gq#^#gq#a#gq#b#gq#d#gq#k#gq#n#gq#r#gq#t#gq#y#gq#|#gq$O#gq%Z#gq%w#gq%x#gq%|#gq%}#gq&c#gq&d#gq&g#gq&j#gq&n#gq&o#gq&p#gq%]#gq%a#gq~Op%Oa|%Oa~P$dOX)pOp&wi~P'WO|+wOp&wi~O|,QO}$uO#_,QO~O#p,ROP#mqX#mqh#mqj#mqq#mqu#mqx#mq!R#mq!S#mq!V#mq!W#mq!Z#mq!_#mq!j#mq!u#mq!v#mq!w#mq#O#mq#Q#mq#S#mq#U#mq#W#mq#[#mq#^#mq#a#mq#b#mq#d#mq#k#mq#n#mq#r#mq#t#mq#y#mq#|#mq$O#mq%Z#mq%w#mq%x#mq%|#mq%}#mq&c#mq&d#mq&g#mq&j#mq&n#mq&o#mq&p#mq%]#mq%a#mq~O#_,SO|%Qa}%Qa~Oq0VOx0eO}&xi~P'WO|,UO}&xi~O}$ZO&S,WOi&zX|&zX~O%}WOi&zX|&zX~O|,[Oi&yX~Oi,^O~O%[,`O~OX%YOc%YOq0VOx0eOi&^i~P'WO},bO|$ka!Y$ka~Oq0VOx0eO},cO|$ka!Y$ka~P'WOq0VOx0eO}*iO!Y&ai~P'WO|,fO!Y&ai~Oq0VOx0eO|,fO!Y&ai~P'WO|,fO},iO!Y&ai~Oi$gi|$gi!Y$gi~P$dOX(WOq0VOx0eO~P'WOp,kO~OX(WOi,lOq0VOx0eO~P'WOX(WOq0VOx0eO!Y&[q~P'WO|$fi!^$fi#f$fi%^$fi%a$fii$fi}$fi!n$fi&S$fi~P$dOX(gOq0VOx0eO~P'WOc+SOq0VOx0eO!^&]q~P'WO|,mO!^&]q~O!^,nO~OX(gOq0VOx0eO!^&Vq#f&Vq%^&Vq%a&Vqi&Vq}&Vq!n&Vq&S&Vq~P'WO},oO~OX+WOq0VOx0eO}&ki!^&ki!n&ki~P'WO|,tO}&ki!^&ki!n&ki~O!_+[O&m+]O!^!oa~OX&bOq0VOx0eO#f%pi%^%pi%a%pi&S%pi~P'WO|,wO#f%pi%^%pi%a%pi&S%pi~O%}WO#f&ta%^&ta%a&tai&ta~O|,zO#f&ta%^&ta%a&tai&ta~Oi,}O~Op%Oi|%Oi~P$dOX)pO~P'WOX)pOp&wq~P'WOv-QOP#lyX#lyh#lyj#lyq#lyu#lyx#ly!R#ly!S#ly!V#ly!W#ly!Z#ly!_#ly!j#ly!u#ly!v#ly!w#ly#O#ly#Q#ly#S#ly#U#ly#W#ly#[#ly#^#ly#a#ly#b#ly#d#ly#k#ly#n#ly#r#ly#t#ly#y#ly#|#ly$O#ly%Z#ly%w#ly%x#ly%|#ly%}#ly&c#ly&d#ly&g#ly&j#ly&n#ly&o#ly&p#ly%]#ly%a#ly~O%]-TO%a-TO~P`O#p-UOP#myX#myh#myj#myq#myu#myx#my!R#my!S#my!V#my!W#my!Z#my!_#my!j#my!u#my!v#my!w#my#O#my#Q#my#S#my#U#my#W#my#[#my#^#my#a#my#b#my#d#my#k#my#n#my#r#my#t#my#y#my#|#my$O#my%Z#my%w#my%x#my%|#my%}#my&c#my&d#my&g#my&j#my&n#my&o#my&p#my%]#my%a#my~Oq0VOx0eO}&xq~P'WO|-YO}&xq~O&S,WOi&za|&za~OX*VOc*WO%y*XO%}WOi&ya~O|-^Oi&ya~O$R-bO~OX%YOc%YOq0VOx0eO~P'WOq0VOx0eO}-cO|$ki!Y$ki~P'WOq0VOx0eO|$ki!Y$ki~P'WO}-cO|$ki!Y$ki~Oq0VOx0eO}*iO~P'WOq0VOx0eO}*iO!Y&aq~P'WO|-fO!Y&aq~Oq0VOx0eO|-fO!Y&aq~P'WOu-iO!V%oO!W%nOi&Wq!Y&Wq!^&Wq|&Wq~P!-iOc+SOq0VOx0eO!^&]y~P'WO|$ii!^$ii~P$dOc+SOq0VOx0eO~P'WOX+WOq0VOx0eO~P'WOX+WOq0VOx0eO}&kq!^&kq!n&kq~P'WO}(tO!^-mO!n-nO~OX&bOq0VOx0eO#f%pq%^%pq%a%pq&S%pq~P'WO#_-oO|$za#f$za%^$za%a$zai$za~O%}WO#f&ti%^&ti%a&tii&ti~O|-qO#f&ti%^&ti%a&tii&ti~Ov-tOP#l!RX#l!Rh#l!Rj#l!Rq#l!Ru#l!Rx#l!R!R#l!R!S#l!R!V#l!R!W#l!R!Z#l!R!_#l!R!j#l!R!u#l!R!v#l!R!w#l!R#O#l!R#Q#l!R#S#l!R#U#l!R#W#l!R#[#l!R#^#l!R#a#l!R#b#l!R#d#l!R#k#l!R#n#l!R#r#l!R#t#l!R#y#l!R#|#l!R$O#l!R%Z#l!R%w#l!R%x#l!R%|#l!R%}#l!R&c#l!R&d#l!R&g#l!R&j#l!R&n#l!R&o#l!R&p#l!R%]#l!R%a#l!R~Oq0VOx0eO}&xy~P'WOX*VOc*WO%y*XO%}WOi&yi~O$R-bO%]-zO%a-zO~OX.UOj.SO!Z.RO!_.TO!j-}O!v.PO!w.PO%x-|O%}WO&c]O&d^O&g_O~Oq0VOx0eO|$kq!Y$kq~P'WO}.ZO|$kq!Y$kq~Oq0VOx0eO}*iO!Y&ay~P'WO|.[O!Y&ay~Oq0VOx.`O~P'WOu-iO!V%oO!W%nOi&Wy!Y&Wy!^&Wy|&Wy~P!-iO}(tO!^.cO~O%}WO#f&tq%^&tq%a&tqi&tq~O|.eO#f&tq%^&tq%a&tqi&tq~OX*VOc*WO%y*XO%}WO~Oj.iO!h.gO|$SX#_$SX%r$SXi$SX~Ou$SX}$SX!Y$SX!^$SX~P$!}O%w.kO%x.kOu$TX|$TX}$TX#_$TX%r$TX!Y$TXi$TX!^$TX~O!j.mO~O|.qO#_.sO%r.nOu&|X}&|X!Y&|Xi&|X~Oc.vO~P#M_Oj.iOu&}X|&}X}&}X#_&}X%r&}X!Y&}Xi&}X!^&}X~Ou.zO}$uO~Oq0VOx0eO|$ky!Y$ky~P'WOq0VOx0eO}*iO!Y&a!R~P'WO|/OO!Y&a!R~Oi&ZXu&ZX!V&ZX!W&ZX!Y&ZX!^&ZX|&ZX~P!-iOu-iO!V%oO!W%nOi&Ya!Y&Ya!^&Ya|&Ya~O%}WO#f&ty%^&ty%a&tyi&ty~O!h.gOj$Zau$Za|$Za}$Za#_$Za%r$Za!Y$Zai$Za!^$Za~O!j/XO~O%w.kO%x.kOu$Ta|$Ta}$Ta#_$Ta%r$Ta!Y$Tai$Ta!^$Ta~O%r.nOu$Xa|$Xa}$Xa#_$Xa!Y$Xai$Xa!^$Xa~Ou&|a}&|a!Y&|ai&|a~P#MRO|/^Ou&|a}&|a!Y&|ai&|a~O!Y/aO~Oi/aO~O}/cO~O!^/dO~Oq0VOx0eO}*iO!Y&a!Z~P'WO}/gO~O&S/hO~P$!}O|/iO#_.sO%r.nOi'PX~O|/iOi'PX~Oi/kO~O!j/lO~O#_.sOu%Ua|%Ua}%Ua%r%Ua!Y%Uai%Ua!^%Ua~O#_.sO%r.nOu%Ya|%Ya}%Ya!Y%Yai%Ya~Ou&|i}&|i!Y&|ii&|i~P#MRO|/nO#_.sO%r.nO!^'Oa~O}$ca~P$dOi'Pa~P#MRO|/vOi'Pa~Oc/xO!^'Oi~P#M_O|/zO!^'Oi~O|/zO#_.sO%r.nO!^'Oi~O#_.sO%r.nOi$ai|$ai~O&S/}O~P$!}O#_.sO%r.nOi%Xa|%Xa~Oi'Pi~P#MRO}0QO~Oc/xO!^'Oq~P#M_O|0SO!^'Oq~O#_.sO%r.nO|%Wi!^%Wi~Oc/xO~P#M_Oc/xO!^'Oy~P#M_O#_.sO%r.nOi$bi|$bi~O#_.sO%r.nO|%Wq!^%Wq~O|+dO#f%pa%^%pa%a%pa&S%pa~P$dOX&bOq0VOx0eO~P'WOp0[O~Oq0[O~P'WO}0]O~Ov0^O~P!-iO&d&g&o&p&c&j&n%}&c~",
  goto: "!<w'QPPPPPPPP'RP'Z*s+]+v,b,}-kP.YP'Z.y.y'ZPPP'Z2cPPPPPP2c5VPP5VP7g7p=pPP=s>e>hPP'Z'ZPP?QPP'Z'ZPP'Z'Z'Z'Z'Z?U?{'ZP@OP@UD]GyPG}HZH_HcHg'ZPPPHkHq'RP'R'RP'RP'RP'RP'RP'R'R'RP'RPP'RPP'RPHwPIOIUPIOPIOIOPPPIOPKTPK^KdKjKTPIOKpPIOPKwK}PLRLgMUMoLRLRMuNSLRLRLRLRNhNnNqNvNy! T! Z! g! y!!P!!Z!!a!!}!#T!#Z!#a!#k!#q!#w!#}!$T!$Z!$m!$w!$}!%T!%Z!%e!%k!%q!%w!&R!&X!&c!&i!&r!&x!'X!'a!'k!'rPPPPPPPPPPPPPPPPP!'x!'{!(R!([!(f!(qPPPPPPPPPPPP!-e!.y!2s!6TPP!6]!6o!6x!7n!7e!7w!7}!8Q!8T!8W!8`!9PPPPPPPPPP!9S!9cPPPP!:R!:_!:k!:q!:z!:}!;T!;Z!;a!;dP!;l!;u!<q!<t]jOs#u$u)x+|'}eOTYZ[fistuwy}!O!S!T!U!V!Y!]!g!h!i!j!k!l!m!o!s!t!u!w!x#O#S#W#X#b#f#i#l#r#u$W$X$Z$]$`$p$r$s$u$|%Y%_%f%i%k%n%r%w%y&T&`&b&m&q&z&|&}'U'Y']'d'g'v'w'z'|'}(R(W(Y(^(b(g(h(n(q)O)Q)Y)])i)l)p)q)u)x*R*]*f*i*j*m*s*t*v*x*{*|+P+S+W+X+[+d+f+g+n+v+w+|,T,U,X,a,b,c,e,f,i,k,m,o,q,s,t,w-Y-[-c-f-i.Z.[.z/O/g0V0W0X0Y0[0]0^0_0`0b0f}!gQ#q$O$a$o${%p%u%{%|&r'['q)P)[)o*q*z+u,p/e0Z!P!hQ#q$O$a$o${%Q%p%u%{%|&r'['q)P)[)o*q*z+u,p/e0Z!R!iQ#q$O$a$o${%Q%R%p%u%{%|&r'['q)P)[)o*q*z+u,p/e0Z!T!jQ#q$O$a$o${%Q%R%S%p%u%{%|&r'['q)P)[)o*q*z+u,p/e0Z!V!kQ#q$O$a$o${%Q%R%S%T%p%u%{%|&r'['q)P)[)o*q*z+u,p/e0Z!X!lQ#q$O$a$o${%Q%R%S%T%U%p%u%{%|&r'['q)P)[)o*q*z+u,p/e0Z!]!lQ!r#q$O$a$o${%Q%R%S%T%U%V%p%u%{%|&r'['q)P)[)o*q*z+u,p/e0Z'}TOTYZ[fistuwy}!O!S!T!U!V!Y!]!g!h!i!j!k!l!m!o!s!t!u!w!x#O#S#W#X#b#f#i#l#r#u$W$X$Z$]$`$p$r$s$u$|%Y%_%f%i%k%n%r%w%y&T&`&b&m&q&z&|&}'U'Y']'d'g'v'w'z'|'}(R(W(Y(^(b(g(h(n(q)O)Q)Y)])i)l)p)q)u)x*R*]*f*i*j*m*s*t*v*x*{*|+P+S+W+X+[+d+f+g+n+v+w+|,T,U,X,a,b,c,e,f,i,k,m,o,q,s,t,w-Y-[-c-f-i.Z.[.z/O/g0V0W0X0Y0[0]0^0_0`0b0f&cVOYZ[isuw}!O!S!T!U!Y!m!o!s!t!u!w!x#b#f#i#l#r#u$X$Z$]$`$s$u%Y%_%f%i%k%r%w%y&T&`&m&q&|&}'U']'d'g'v'w'z'|'}(R(Y(b(h(n(q)O)Q)Y)i)l)u)x*R*]*f*i*j*m*s*t*v*x*{*|+P+W+X+[+d+g+n+|,T,U,X,a,b,c,e,f,i,k,m,o,q,s,t,w-Y-[-c-f-i.Z.[/O/g0V0W0X0Y0[0]0^0_0b0f%mXOYZ[isw}!O!S!T!U!Y!m!o#b#f#i#l#r#u$X$Z$]$`$s$u%Y%_%i%k%r%w%y&T&`&m&q&|&}'U']'d'g'v'w'z'|'}(R(Y(b(h(n(q)O)Q)Y)i)l)u)x*R*]*f*i*j*m*s*v*x*{*|+P+W+X+[+d+g+n+|,T,U,X,a,b,c,e,f,i,m,o,q,s,t,w-Y-[-c-f.Z.[/O0]0^0_Q$UvQ/P.`R0c0e'teOTYZ[fistuwy}!O!S!T!U!V!Y!]!g!h!i!j!k!l!o!s!t!u!w!x#O#S#W#X#b#f#i#l#r#u$W$X$Z$]$`$p$r$s$u$|%Y%_%f%i%k%n%r%w%y&T&`&b&m&q&z&|&}'U'Y']'d'g'v'z'|'}(R(W(Y(^(b(g(h(n(q)O)Q)Y)])i)l)p)q)u)x*R*]*i*j*m*s*t*v*x*{*|+P+S+W+X+[+d+f+g+n+v+w+|,T,U,X,b,c,e,f,i,k,m,o,q,s,t,w-Y-[-c-f-i.Z.[.z/O/g0V0W0X0Y0[0]0^0_0`0b0fW#xm!P!Q$gW$Qv&o.`0eQ$i!RQ$y!ZQ$z![W%X!m'w*f,aS&n$R$SQ'`$tQ)R&hQ)a'OU)b'Q)c)dU)e'S)f+mQ*T'iW*U'k,[-^-xS,Z*V*WY,y+h,z-p-q.eQ,|+jQ-V,QQ-X,Sl-{-b.R.S.U.o.q.v/^/c/h/m/x/}0QQ.d-oQ.w.TQ/T.iQ/`.sU/s/i/v0OX/y/n/z0R0SR&m$Q!_!{YZ!T!U!o%_%k%r'z'|'}(Y(b)l*i*j*m*s*v*x,b,c,e,f,i-c-f.Z.[/OR%i!zQ#PYQ&U#bQ&X#fQ&Z#iQ&]#lQ&v$]Q&y$`R,u+[T._-i/g![!nQ!r#q$O$a$o${%Q%R%S%T%U%V%p%u%{%|&r'['q)P)[)o*q*z+u,p/e0ZQ&k#yR'n$zR'v%XQ%b!qR/R.g'|dOTYZ[fistuwy}!O!S!T!U!V!Y!]!g!h!i!j!k!l!m!o!s!t!u!w!x#O#S#W#X#b#f#i#l#r#u$W$X$Z$]$`$p$r$s$u$|%Y%_%f%i%k%n%r%w%y&T&`&b&m&q&z&|&}'U'Y']'d'g'v'w'z'|'}(R(W(Y(^(b(g(h(n(q)O)Q)Y)])i)l)p)q)u)x*R*]*f*i*j*m*s*t*v*x*{*|+P+S+W+X+[+d+f+g+n+v+w+|,T,U,X,a,b,c,e,f,i,k,m,o,q,s,t,w-Y-[-c-f-i.Z.[.z/O/g0V0W0X0Y0[0]0^0_0`0b0fS#od#p!P.P-b.R.S.T.U.i.o.q.v/^/c/h/i/m/n/v/x/z/}0O0Q0R0S'|dOTYZ[fistuwy}!O!S!T!U!V!Y!]!g!h!i!j!k!l!m!o!s!t!u!w!x#O#S#W#X#b#f#i#l#r#u$W$X$Z$]$`$p$r$s$u$|%Y%_%f%i%k%n%r%w%y&T&`&b&m&q&z&|&}'U'Y']'d'g'v'w'z'|'}(R(W(Y(^(b(g(h(n(q)O)Q)Y)])i)l)p)q)u)x*R*]*f*i*j*m*s*t*v*x*{*|+P+S+W+X+[+d+f+g+n+v+w+|,T,U,X,a,b,c,e,f,i,k,m,o,q,s,t,w-Y-[-c-f-i.Z.[.z/O/g0V0W0X0Y0[0]0^0_0`0b0fT#od#pT#c`#de(u&U&X&Z&](w(y({(},u-nT+](t+^T#ga#hT#jb#kT#mc#nQ$_xR,Y*UX$]x$^$_&xZlOs$u)x+|XpOs)x+|Q$v!XQ'W$mQ'X$nQ'j$xQ'm$zQ)v'_Q)|'dQ*O'eQ*P'fQ*^'lQ*`'nQ+q)lQ+s)mQ+t)nQ+x)tS+z)w*_Q+})zQ,O){Q,P)}Q-O+pQ-P+rQ-R+yQ-S+{Q-W,RQ-s-QQ-u-UQ-v-VQ.f-tQ.{.XR/f.|WpOs)x+|R#{oQ'l$yR)w'`Q,X*UR-[,YQ*_'lR+{)wZnOos)x+|Q'p${R*b'qT-`,`-au.W-b.R.S.U.i.o.q.v/^/c/h/i/m/v/x/}0O0Qt.W-b.R.S.U.i.o.q.v/^/c/h/i/m/v/x/}0O0QQ.w.TX/y/n/z0R0S!P.O-b.R.S.T.U.i.o.q.v/^/c/h/i/m/n/v/x/z/}0O0Q0R0SQ.l-}R/Y.mg.o.Q.p/U/]/b/p/r/t0P0T0Uu.V-b.R.S.U.i.o.q.v/^/c/h/i/m/v/x/}0O0QX.j-{.V/T/sR/V.iV/u/i/v0OR.|.XQsOS#}s+|R+|)xQ&p$TR)W&pS%x#V$VS(i%x(lT(l%{&rQ%l!}Q%s#RW(Z%l%s(`(dQ(`%pR(d%uQ&{$aR)^&{Q(o%|Q*}(jT+T(o*}Q'x%ZR*g'xS'{%^%_Y*k'{*l,g-g.]U*l'|'}(OU,g*m*n*oS-g,h,iR.]-hQ#^^R&P#^Q#a_R&R#aQ#d`R&V#dQ(r&SS+Y(r+ZR+Z(sQ+^(tR,v+^Q#haR&Y#hQ#kbR&[#kQ#ncR&^#nQ#pdR&_#pQ#sgQ&a#qW&d#s&a)Z+eQ)Z&uR+e0ZQ$^xS&w$^&xR&x$_Q'V$kR)j'VQ&i#xR)S&iQ$g!QR'P$gQ+i)bS,{+i-rR-r,|Q'T$iR)g'TQ#vkR&f#vQ)k'WR+o)kQ'Z$oS)r'Z)sR)s'[Q'c$vR)y'cQ'h$wS*S'h,VR,V*TQ,]*YR-_,]WoOs)x+|R#zoQ-a,`R-y-ad.p.Q/U/]/b/p/r/t0P0T0UR/[.pU.h-{/T/sR/S.hQ/o/bS/{/o/|R/|/pS/j/U/VR/w/jQ.r.QR/_.rR!_PXrOs)x+|WqOs)x+|R'a$uYkOs$u)x+|R&e#u[xOs#u$u)x+|R&v$]&bQOYZ[isuw}!O!S!T!U!Y!m!o!s!t!u!w!x#b#f#i#l#r#u$X$Z$]$`$s$u%Y%_%f%i%k%r%w%y&T&`&m&q&|&}'U']'d'g'v'w'z'|'}(R(Y(b(h(n(q)O)Q)Y)i)l)u)x*R*]*f*i*j*m*s*t*v*x*{*|+P+W+X+[+d+g+n+|,T,U,X,a,b,c,e,f,i,k,m,o,q,s,t,w-Y-[-c-f-i.Z.[/O/g0V0W0X0Y0[0]0^0_0b0fQ!rTQ#qfQ$OtU$ay%n(^S$o!V$rQ${!]Q%Q!gQ%R!hQ%S!iQ%T!jQ%U!kQ%V!lQ%p#OQ%u#SQ%{#WQ%|#XQ&r$WQ'[$pQ'q$|Q)P&bU)[&z)]+fW)o'Y)q+v+wQ*q(WQ*z(gQ+u)pQ,p+SQ/e.zR0Z0`Q!}YQ#RZQ$m!TQ$n!UQ%^!oQ(O%_^(V%k%r(Y(b*s*v*x^*h'z*j,e,f-f.[/OQ*n'|Q*o'}Q+r)lQ,d*iQ,h*mQ-d,bQ-e,cQ-h,iQ.Y-cR.}.Z[gOs#u$u)x+|!^!zYZ!T!U!o%_%k%r'z'|'}(Y(b)l*i*j*m*s*v*x,b,c,e,f,i-c-f.Z.[/OQ#V[Q#tiS$Vw}Q$d!OW$k!S$`'])uS$w!Y$sW%W!m'w*f,aY&S#b#f#i#l+[`&c#r&`)O)Q)Y+d,w0_Q&s$XQ&t$ZQ&u$]Q't%YQ(U%iW(f%w(h*{+PQ(j%yQ(s&TQ)U&mS)X&q0]Q)_&|Q)`&}U)h'U)i+nQ)}'dY*Q'g*R,T,U-YQ*d'vS*p(R0^W+R(n*|,m,qW+V(q+X,s,tQ,_*]Q,r+WQ,x+gQ-Z,XQ-l,oR-w-[hUOs#r#u$u&`&q(R)O)Q)x+|%S!yYZ[iw}!O!S!T!U!Y!m!o#b#f#i#l$X$Z$]$`$s%Y%_%i%k%r%w%y&T&m&|&}'U']'d'g'v'w'z'|'}(Y(b(h(n(q)Y)i)l)u*R*]*f*i*j*m*s*v*x*{*|+P+W+X+[+d+g+n,T,U,X,a,b,c,e,f,i,m,o,q,s,t,w-Y-[-c-f.Z.[/O0]0^0_Q$PuW%c!s!w0W0bQ%d!tQ%e!uQ%g!xQ%q0VS(Q%f0[Q(S0XQ(T0YQ,j*tQ-k,kS.^-i/gR0d0fU$Tv.`0eR)V&o[hOs#u$u)x+|a!|Y#b#f#i#l$]$`+[Q#[[Q$YwR$c}Q%m!}Q%t#RQ%z#VQ't%WQ(a%pQ(e%uQ(m%{Q(p%|Q+O(jQ-j,jQ.b-kR/Q.aQ$byQ(]%nR*u(^Q.a-iR/q/gR#UZR#Z[R%]!mQ%Z!mV*e'w*f,a!]!pQ!r#q$O$a$o${%Q%R%S%T%U%V%p%u%{%|&r'['q)P)[)o*q*z+u,p/e0ZR%`!oQ&U#bQ&X#fQ&Z#iQ&]#lR,u+[Q(v&UQ(x&XQ(z&ZQ(|&]Q+`(wQ+a(yQ+b({Q+c(}Q-m,uR.c-nQ$l!SQ&y$`Q)t']R+y)uQ#ymQ$e!PQ$h!QR'R$gQ)a'QR+l)dQ)a'QQ+k)cR+l)dR$j!RXqOs)x+|Q$q!VR'^$rQ$x!YR'_$sR*['kQ*Y'kV-],[-^-xQ.X-bQ.t.RR.u.SU.Q-b.R.SQ.y.UQ/U.iQ/Z.oU/].q/^/mQ/b.vQ/p/cQ/r/hU/t/i/v0OQ0P/xQ0T/}R0U0QR.x.TR/W.i",
  nodeNames: "⚠ print { { { { Comment Script AssignStatement * BinaryExpression BitOp BitOp BitOp BitOp ArithOp ArithOp @ ArithOp ** UnaryExpression ArithOp BitOp AwaitExpression await ) ( ParenthesizedExpression BinaryExpression or and CompareOp in not is UnaryExpression ConditionalExpression if else LambdaExpression lambda ParamList VariableName AssignOp , : NamedExpression AssignOp YieldExpression yield from TupleExpression ComprehensionExpression async for LambdaExpression ] [ ArrayExpression ArrayComprehensionExpression } { DictionaryExpression DictionaryComprehensionExpression SetExpression SetComprehensionExpression CallExpression ArgList AssignOp MemberExpression . PropertyName Number String FormatString FormatReplacement FormatConversion FormatSpec FormatReplacement FormatReplacement FormatReplacement FormatReplacement ContinuedString Ellipsis None Boolean TypeDef AssignOp UpdateStatement UpdateOp ExpressionStatement DeleteStatement del PassStatement pass BreakStatement break ContinueStatement continue ReturnStatement return YieldStatement PrintStatement RaiseStatement raise ImportStatement import as ScopeStatement global nonlocal AssertStatement assert StatementGroup ; IfStatement Body elif WhileStatement while ForStatement TryStatement try except finally WithStatement with FunctionDefinition def ParamList AssignOp TypeDef ClassDefinition class DecoratedStatement Decorator At MatchStatement match MatchBody MatchClause case CapturePattern LiteralPattern ArithOp ArithOp AsPattern OrPattern LogicOp AttributePattern SequencePattern MappingPattern StarPattern ClassPattern PatternArgList KeywordPattern KeywordPattern Guard",
  maxTerm: 277,
  context: trackIndent,
  nodeProps: [
    ["group", -14, 8, 88, 90, 91, 93, 95, 97, 99, 101, 102, 103, 105, 108, 111, "Statement Statement", -22, 10, 20, 23, 27, 42, 51, 52, 58, 59, 62, 63, 64, 65, 66, 69, 72, 73, 74, 82, 83, 84, 85, "Expression", -10, 113, 115, 118, 120, 121, 125, 127, 132, 134, 137, "Statement", -9, 142, 143, 146, 147, 149, 150, 151, 152, 153, "Pattern"],
    ["openedBy", 25, "(", 56, "[", 60, "{"],
    ["closedBy", 26, ")", 57, "]", 61, "}"]
  ],
  propSources: [pythonHighlighting],
  skippedNodes: [0, 6],
  repeatNodeCount: 37,
  tokenData: "%-W#sR!`OX%TXY=|Y[%T[]=|]p%Tpq=|qr@_rsDOst!+|tu%Tuv!Nnvw#!|wx#$Wxy#:Uyz#;Yz{#<^{|#>x|}#@S}!O#AW!O!P#Ci!P!Q#N_!Q!R$!y!R![$&w![!]$1e!]!^$3s!^!_$4w!_!`$7c!`!a$8m!a!b%T!b!c$;U!c!d$<b!d!e$>W!e!h$<b!h!i$H[!i!t$<b!t!u%#r!u!w$<b!w!x$Fl!x!}$<b!}#O%%z#O#P?d#P#Q%'O#Q#R%(S#R#S$<b#S#T%T#T#U$<b#U#V$>W#V#Y$<b#Y#Z$H[#Z#f$<b#f#g%#r#g#i$<b#i#j$Fl#j#o$<b#o#p%)^#p#q%*S#q#r%+^#r#s%,S#s$g%T$g;'S$<b;'S;=`$>Q<%lO$<b!n%^]&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T!n&^]&m!b&eSOr%Trs'Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T!n'^]&m!b&eSOr%Trs(Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T!f(^Z&m!b&eSOw(Vwx)Px#O(V#O#P+Z#P#o(V#o#p+x#p#q(V#q#r+x#r;'S(V;'S;=`/R<%lO(V!f)UZ&m!bOw(Vwx)wx#O(V#O#P+Z#P#o(V#o#p+x#p#q(V#q#r+x#r;'S(V;'S;=`/R<%lO(V!f)|Z&m!bOw(Vwx*ox#O(V#O#P+Z#P#o(V#o#p+x#p#q(V#q#r+x#r;'S(V;'S;=`/R<%lO(V!b*tT&m!bO#o*o#p#q*o#r;'S*o;'S;=`+T<%lO*o!b+WP;=`<%l*o!f+`W&m!bO#o(V#o#p+x#p#q(V#q#r+x#r;'S(V;'S;=`.d;=`<%l+x<%lO(VS+}V&eSOw+xwx,dx#O+x#O#P-c#P;'S+x;'S;=`.^<%lO+xS,gVOw+xwx,|x#O+x#O#P-c#P;'S+x;'S;=`.^<%lO+xS-PUOw+xx#O+x#O#P-c#P;'S+x;'S;=`.^<%lO+xS-fRO;'S+x;'S;=`-o;=`O+xS-tW&eSOw+xwx,dx#O+x#O#P-c#P;'S+x;'S;=`.^;=`<%l+x<%lO+xS.aP;=`<%l+x!f.iW&eSOw+xwx,dx#O+x#O#P-c#P;'S+x;'S;=`.^;=`<%l(V<%lO+x!f/UP;=`<%l(V!n/`]&m!b&hWOr%Trs&Vsw%Twx0Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T!n0`]&m!b&hWOr%Trs&Vsw%Twx1Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T!j1`Z&m!b&hWOr1Xrs2Rs#O1X#O#P3q#P#o1X#o#p4`#p#q1X#q#r4`#r;'S1X;'S;=`7i<%lO1X!j2WZ&m!bOr1Xrs2ys#O1X#O#P3q#P#o1X#o#p4`#p#q1X#q#r4`#r;'S1X;'S;=`7i<%lO1X!j3OZ&m!bOr1Xrs*os#O1X#O#P3q#P#o1X#o#p4`#p#q1X#q#r4`#r;'S1X;'S;=`7i<%lO1X!j3vW&m!bO#o1X#o#p4`#p#q1X#q#r4`#r;'S1X;'S;=`6z;=`<%l4`<%lO1XW4eV&hWOr4`rs4zs#O4`#O#P5y#P;'S4`;'S;=`6t<%lO4`W4}VOr4`rs5ds#O4`#O#P5y#P;'S4`;'S;=`6t<%lO4`W5gUOr4`s#O4`#O#P5y#P;'S4`;'S;=`6t<%lO4`W5|RO;'S4`;'S;=`6V;=`O4`W6[W&hWOr4`rs4zs#O4`#O#P5y#P;'S4`;'S;=`6t;=`<%l4`<%lO4`W6wP;=`<%l4`!j7PW&hWOr4`rs4zs#O4`#O#P5y#P;'S4`;'S;=`6t;=`<%l1X<%lO4`!j7lP;=`<%l1X!n7tW&m!bO#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=P;=`<%l8^<%lO%T[8eX&eS&hWOr8^rs9Qsw8^wx:dx#O8^#O#P;v#P;'S8^;'S;=`<y<%lO8^[9VX&eSOr8^rs9rsw8^wx:dx#O8^#O#P;v#P;'S8^;'S;=`<y<%lO8^[9wX&eSOr8^rs+xsw8^wx:dx#O8^#O#P;v#P;'S8^;'S;=`<y<%lO8^[:iX&hWOr8^rs9Qsw8^wx;Ux#O8^#O#P;v#P;'S8^;'S;=`<y<%lO8^[;ZX&hWOr8^rs9Qsw8^wx4`x#O8^#O#P;v#P;'S8^;'S;=`<y<%lO8^[;yRO;'S8^;'S;=`<S;=`O8^[<ZY&eS&hWOr8^rs9Qsw8^wx:dx#O8^#O#P;v#P;'S8^;'S;=`<y;=`<%l8^<%lO8^[<|P;=`<%l8^!n=WY&eS&hWOr8^rs9Qsw8^wx:dx#O8^#O#P;v#P;'S8^;'S;=`<y;=`<%l%T<%lO8^!n=yP;=`<%l%T#s>Xc&m!b&eS&hW%k!TOX%TXY=|Y[%T[]=|]p%Tpq=|qr%Trs&Vsw%Twx/Xx#O%T#O#P?d#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#s?i[&m!bOY%TYZ=|Z]%T]^=|^#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=P;=`<%l8^<%lO%T!q@hd&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`Av!`#O%T#O#P7o#P#T%T#T#UBz#U#f%T#f#gBz#g#hBz#h#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T!qBR]oR&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T!qCV]!nR&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#cDXa&m!b&eS&csOYE^YZ%TZ]E^]^%T^rE^rs!)|swE^wxGpx#OE^#O#P!!u#P#oE^#o#p!#d#p#qE^#q#r!#d#r;'SE^;'S;=`!)v<%lOE^#cEia&m!b&eS&hW&csOYE^YZ%TZ]E^]^%T^rE^rsFnswE^wxGpx#OE^#O#P!!u#P#oE^#o#p!#d#p#qE^#q#r!#d#r;'SE^;'S;=`!)v<%lOE^#cFw]&m!b&eS&csOr%Trs'Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#cGya&m!b&hW&csOYE^YZ%TZ]E^]^%T^rE^rsFnswE^wxIOx#OE^#O#P!!u#P#oE^#o#p!#d#p#qE^#q#r!#d#r;'SE^;'S;=`!)v<%lOE^#cIXa&m!b&hW&csOYE^YZ%TZ]E^]^%T^rE^rsFnswE^wxJ^x#OE^#O#P!!u#P#oE^#o#p!#d#p#qE^#q#r!#d#r;'SE^;'S;=`!)v<%lOE^#_Jg_&m!b&hW&csOYJ^YZ1XZ]J^]^1X^rJ^rsKfs#OJ^#O#PL`#P#oJ^#o#pL}#p#qJ^#q#rL}#r;'SJ^;'S;=`!!o<%lOJ^#_KmZ&m!b&csOr1Xrs2ys#O1X#O#P3q#P#o1X#o#p4`#p#q1X#q#r4`#r;'S1X;'S;=`7i<%lO1X#_LeW&m!bO#oJ^#o#pL}#p#qJ^#q#rL}#r;'SJ^;'S;=`! r;=`<%lL}<%lOJ^{MUZ&hW&csOYL}YZ4`Z]L}]^4`^rL}rsMws#OL}#O#PNc#P;'SL};'S;=`! l<%lOL}{M|V&csOr4`rs5ds#O4`#O#P5y#P;'S4`;'S;=`6t<%lO4`{NfRO;'SL};'S;=`No;=`OL}{Nv[&hW&csOYL}YZ4`Z]L}]^4`^rL}rsMws#OL}#O#PNc#P;'SL};'S;=`! l;=`<%lL}<%lOL}{! oP;=`<%lL}#_! y[&hW&csOYL}YZ4`Z]L}]^4`^rL}rsMws#OL}#O#PNc#P;'SL};'S;=`! l;=`<%lJ^<%lOL}#_!!rP;=`<%lJ^#c!!zW&m!bO#oE^#o#p!#d#p#qE^#q#r!#d#r;'SE^;'S;=`!(q;=`<%l!#d<%lOE^!P!#m]&eS&hW&csOY!#dYZ8^Z]!#d]^8^^r!#drs!$fsw!#dwx!%Yx#O!#d#O#P!'Y#P;'S!#d;'S;=`!(k<%lO!#d!P!$mX&eS&csOr8^rs9rsw8^wx:dx#O8^#O#P;v#P;'S8^;'S;=`<y<%lO8^!P!%a]&hW&csOY!#dYZ8^Z]!#d]^8^^r!#drs!$fsw!#dwx!&Yx#O!#d#O#P!'Y#P;'S!#d;'S;=`!(k<%lO!#d!P!&a]&hW&csOY!#dYZ8^Z]!#d]^8^^r!#drs!$fsw!#dwxL}x#O!#d#O#P!'Y#P;'S!#d;'S;=`!(k<%lO!#d!P!']RO;'S!#d;'S;=`!'f;=`O!#d!P!'o^&eS&hW&csOY!#dYZ8^Z]!#d]^8^^r!#drs!$fsw!#dwx!%Yx#O!#d#O#P!'Y#P;'S!#d;'S;=`!(k;=`<%l!#d<%lO!#d!P!(nP;=`<%l!#d#c!(z^&eS&hW&csOY!#dYZ8^Z]!#d]^8^^r!#drs!$fsw!#dwx!%Yx#O!#d#O#P!'Y#P;'S!#d;'S;=`!(k;=`<%lE^<%lO!#d#c!)yP;=`<%lE^#c!*V]&m!b&eS&csOr%Trs!+Osw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c!+ZZ&iW&m!b&eS&gsOw(Vwx)Px#O(V#O#P+Z#P#o(V#o#p+x#p#q(V#q#r+x#r;'S(V;'S;=`/R<%lO(V#s!,XaU!T&m!b&eS&hWOY!+|YZ%TZ]!+|]^%T^r!+|rs!-^sw!+|wx!:hx#O!+|#O#P!FW#P#o!+|#o#p!GT#p#q!+|#q#r!GT#r;'S!+|;'S;=`!Nh<%lO!+|#s!-gaU!T&m!b&eSOY!+|YZ%TZ]!+|]^%T^r!+|rs!.lsw!+|wx!:hx#O!+|#O#P!FW#P#o!+|#o#p!GT#p#q!+|#q#r!GT#r;'S!+|;'S;=`!Nh<%lO!+|#s!.uaU!T&m!b&eSOY!+|YZ%TZ]!+|]^%T^r!+|rs!/zsw!+|wx!:hx#O!+|#O#P!FW#P#o!+|#o#p!GT#p#q!+|#q#r!GT#r;'S!+|;'S;=`!Nh<%lO!+|#k!0T_U!T&m!b&eSOY!/zYZ(VZ]!/z]^(V^w!/zwx!1Sx#O!/z#O#P!4z#P#o!/z#o#p!5w#p#q!/z#q#r!5w#r;'S!/z;'S;=`!:b<%lO!/z#k!1Z_U!T&m!bOY!/zYZ(VZ]!/z]^(V^w!/zwx!2Yx#O!/z#O#P!4z#P#o!/z#o#p!5w#p#q!/z#q#r!5w#r;'S!/z;'S;=`!:b<%lO!/z#k!2a_U!T&m!bOY!/zYZ(VZ]!/z]^(V^w!/zwx!3`x#O!/z#O#P!4z#P#o!/z#o#p!5w#p#q!/z#q#r!5w#r;'S!/z;'S;=`!:b<%lO!/z#g!3gZU!T&m!bOY!3`YZ*oZ]!3`]^*o^#o!3`#o#p!4Y#p#q!3`#q#r!4Y#r;'S!3`;'S;=`!4t<%lO!3`!T!4_TU!TOY!4YZ]!4Y^;'S!4Y;'S;=`!4n<%lO!4Y!T!4qP;=`<%l!4Y#g!4wP;=`<%l!3`#k!5R[U!T&m!bOY!/zYZ(VZ]!/z]^(V^#o!/z#o#p!5w#p#q!/z#q#r!5w#r;'S!/z;'S;=`!9s;=`<%l+x<%lO!/z!X!6OZU!T&eSOY!5wYZ+xZ]!5w]^+x^w!5wwx!6qx#O!5w#O#P!8a#P;'S!5w;'S;=`!9m<%lO!5w!X!6vZU!TOY!5wYZ+xZ]!5w]^+x^w!5wwx!7ix#O!5w#O#P!8a#P;'S!5w;'S;=`!9m<%lO!5w!X!7nZU!TOY!5wYZ+xZ]!5w]^+x^w!5wwx!4Yx#O!5w#O#P!8a#P;'S!5w;'S;=`!9m<%lO!5w!X!8fWU!TOY!5wYZ+xZ]!5w]^+x^;'S!5w;'S;=`!9O;=`<%l+x<%lO!5w!X!9TW&eSOw+xwx,dx#O+x#O#P-c#P;'S+x;'S;=`.^;=`<%l!5w<%lO+x!X!9pP;=`<%l!5w#k!9xW&eSOw+xwx,dx#O+x#O#P-c#P;'S+x;'S;=`.^;=`<%l!/z<%lO+x#k!:eP;=`<%l!/z#s!:qaU!T&m!b&hWOY!+|YZ%TZ]!+|]^%T^r!+|rs!-^sw!+|wx!;vx#O!+|#O#P!FW#P#o!+|#o#p!GT#p#q!+|#q#r!GT#r;'S!+|;'S;=`!Nh<%lO!+|#s!<PaU!T&m!b&hWOY!+|YZ%TZ]!+|]^%T^r!+|rs!-^sw!+|wx!=Ux#O!+|#O#P!FW#P#o!+|#o#p!GT#p#q!+|#q#r!GT#r;'S!+|;'S;=`!Nh<%lO!+|#o!=__U!T&m!b&hWOY!=UYZ1XZ]!=U]^1X^r!=Urs!>^s#O!=U#O#P!@j#P#o!=U#o#p!Ag#p#q!=U#q#r!Ag#r;'S!=U;'S;=`!FQ<%lO!=U#o!>e_U!T&m!bOY!=UYZ1XZ]!=U]^1X^r!=Urs!?ds#O!=U#O#P!@j#P#o!=U#o#p!Ag#p#q!=U#q#r!Ag#r;'S!=U;'S;=`!FQ<%lO!=U#o!?k_U!T&m!bOY!=UYZ1XZ]!=U]^1X^r!=Urs!3`s#O!=U#O#P!@j#P#o!=U#o#p!Ag#p#q!=U#q#r!Ag#r;'S!=U;'S;=`!FQ<%lO!=U#o!@q[U!T&m!bOY!=UYZ1XZ]!=U]^1X^#o!=U#o#p!Ag#p#q!=U#q#r!Ag#r;'S!=U;'S;=`!Ec;=`<%l4`<%lO!=U!]!AnZU!T&hWOY!AgYZ4`Z]!Ag]^4`^r!Agrs!Bas#O!Ag#O#P!DP#P;'S!Ag;'S;=`!E]<%lO!Ag!]!BfZU!TOY!AgYZ4`Z]!Ag]^4`^r!Agrs!CXs#O!Ag#O#P!DP#P;'S!Ag;'S;=`!E]<%lO!Ag!]!C^ZU!TOY!AgYZ4`Z]!Ag]^4`^r!Agrs!4Ys#O!Ag#O#P!DP#P;'S!Ag;'S;=`!E]<%lO!Ag!]!DUWU!TOY!AgYZ4`Z]!Ag]^4`^;'S!Ag;'S;=`!Dn;=`<%l4`<%lO!Ag!]!DsW&hWOr4`rs4zs#O4`#O#P5y#P;'S4`;'S;=`6t;=`<%l!Ag<%lO4`!]!E`P;=`<%l!Ag#o!EhW&hWOr4`rs4zs#O4`#O#P5y#P;'S4`;'S;=`6t;=`<%l!=U<%lO4`#o!FTP;=`<%l!=U#s!F_[U!T&m!bOY!+|YZ%TZ]!+|]^%T^#o!+|#o#p!GT#p#q!+|#q#r!GT#r;'S!+|;'S;=`!Mq;=`<%l8^<%lO!+|!a!G^]U!T&eS&hWOY!GTYZ8^Z]!GT]^8^^r!GTrs!HVsw!GTwx!JVx#O!GT#O#P!LV#P;'S!GT;'S;=`!Mk<%lO!GT!a!H^]U!T&eSOY!GTYZ8^Z]!GT]^8^^r!GTrs!IVsw!GTwx!JVx#O!GT#O#P!LV#P;'S!GT;'S;=`!Mk<%lO!GT!a!I^]U!T&eSOY!GTYZ8^Z]!GT]^8^^r!GTrs!5wsw!GTwx!JVx#O!GT#O#P!LV#P;'S!GT;'S;=`!Mk<%lO!GT!a!J^]U!T&hWOY!GTYZ8^Z]!GT]^8^^r!GTrs!HVsw!GTwx!KVx#O!GT#O#P!LV#P;'S!GT;'S;=`!Mk<%lO!GT!a!K^]U!T&hWOY!GTYZ8^Z]!GT]^8^^r!GTrs!HVsw!GTwx!Agx#O!GT#O#P!LV#P;'S!GT;'S;=`!Mk<%lO!GT!a!L[WU!TOY!GTYZ8^Z]!GT]^8^^;'S!GT;'S;=`!Lt;=`<%l8^<%lO!GT!a!L{Y&eS&hWOr8^rs9Qsw8^wx:dx#O8^#O#P;v#P;'S8^;'S;=`<y;=`<%l!GT<%lO8^!a!MnP;=`<%l!GT#s!MxY&eS&hWOr8^rs9Qsw8^wx:dx#O8^#O#P;v#P;'S8^;'S;=`<y;=`<%l!+|<%lO8^#s!NkP;=`<%l!+|#b!Ny_%zQ&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`# x!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#b#!T]!{r&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#b##X_%tQ&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`# x!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c#$aa&m!b&hW&csOY#%fYZ%TZ]#%f]^%T^r#%frs#&vsw#%fwx#8Ux#O#%f#O#P#0}#P#o#%f#o#p#1l#p#q#%f#q#r#1l#r;'S#%f;'S;=`#8O<%lO#%f#c#%qa&m!b&eS&hW&csOY#%fYZ%TZ]#%f]^%T^r#%frs#&vsw#%fwx#/{x#O#%f#O#P#0}#P#o#%f#o#p#1l#p#q#%f#q#r#1l#r;'S#%f;'S;=`#8O<%lO#%f#c#'Pa&m!b&eS&csOY#%fYZ%TZ]#%f]^%T^r#%frs#(Usw#%fwx#/{x#O#%f#O#P#0}#P#o#%f#o#p#1l#p#q#%f#q#r#1l#r;'S#%f;'S;=`#8O<%lO#%f#c#(_a&m!b&eS&csOY#%fYZ%TZ]#%f]^%T^r#%frs#)dsw#%fwx#/{x#O#%f#O#P#0}#P#o#%f#o#p#1l#p#q#%f#q#r#1l#r;'S#%f;'S;=`#8O<%lO#%f#Z#)m_&m!b&eS&csOY#)dYZ(VZ]#)d]^(V^w#)dwx#*lx#O#)d#O#P#+f#P#o#)d#o#p#,T#p#q#)d#q#r#,T#r;'S#)d;'S;=`#/u<%lO#)d#Z#*sZ&m!b&csOw(Vwx)wx#O(V#O#P+Z#P#o(V#o#p+x#p#q(V#q#r+x#r;'S(V;'S;=`/R<%lO(V#Z#+kW&m!bO#o#)d#o#p#,T#p#q#)d#q#r#,T#r;'S#)d;'S;=`#.x;=`<%l#,T<%lO#)dw#,[Z&eS&csOY#,TYZ+xZ]#,T]^+x^w#,Twx#,}x#O#,T#O#P#-i#P;'S#,T;'S;=`#.r<%lO#,Tw#-SV&csOw+xwx,|x#O+x#O#P-c#P;'S+x;'S;=`.^<%lO+xw#-lRO;'S#,T;'S;=`#-u;=`O#,Tw#-|[&eS&csOY#,TYZ+xZ]#,T]^+x^w#,Twx#,}x#O#,T#O#P#-i#P;'S#,T;'S;=`#.r;=`<%l#,T<%lO#,Tw#.uP;=`<%l#,T#Z#/P[&eS&csOY#,TYZ+xZ]#,T]^+x^w#,Twx#,}x#O#,T#O#P#-i#P;'S#,T;'S;=`#.r;=`<%l#)d<%lO#,T#Z#/xP;=`<%l#)d#c#0U]&m!b&hW&csOr%Trs&Vsw%Twx0Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c#1SW&m!bO#o#%f#o#p#1l#p#q#%f#q#r#1l#r;'S#%f;'S;=`#6y;=`<%l#1l<%lO#%f!P#1u]&eS&hW&csOY#1lYZ8^Z]#1l]^8^^r#1lrs#2nsw#1lwx#4nx#O#1l#O#P#5b#P;'S#1l;'S;=`#6s<%lO#1l!P#2u]&eS&csOY#1lYZ8^Z]#1l]^8^^r#1lrs#3nsw#1lwx#4nx#O#1l#O#P#5b#P;'S#1l;'S;=`#6s<%lO#1l!P#3u]&eS&csOY#1lYZ8^Z]#1l]^8^^r#1lrs#,Tsw#1lwx#4nx#O#1l#O#P#5b#P;'S#1l;'S;=`#6s<%lO#1l!P#4uX&hW&csOr8^rs9Qsw8^wx;Ux#O8^#O#P;v#P;'S8^;'S;=`<y<%lO8^!P#5eRO;'S#1l;'S;=`#5n;=`O#1l!P#5w^&eS&hW&csOY#1lYZ8^Z]#1l]^8^^r#1lrs#2nsw#1lwx#4nx#O#1l#O#P#5b#P;'S#1l;'S;=`#6s;=`<%l#1l<%lO#1l!P#6vP;=`<%l#1l#c#7S^&eS&hW&csOY#1lYZ8^Z]#1l]^8^^r#1lrs#2nsw#1lwx#4nx#O#1l#O#P#5b#P;'S#1l;'S;=`#6s;=`<%l#%f<%lO#1l#c#8RP;=`<%l#%f#c#8_]&m!b&hW&csOr%Trs&Vsw%Twx#9Wx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c#9cZ&fS&m!b&hW&dsOr1Xrs2Rs#O1X#O#P3q#P#o1X#o#p4`#p#q1X#q#r4`#r;'S1X;'S;=`7i<%lO1X#c#:a]js&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T!q#;e]iR&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c#<iaXs&m!b&eS&hWOr%Trs&Vsw%Twx/Xxz%Tz{#=n{!_%T!_!`# x!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c#=y_cR&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`# x!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c#?T_%ws&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`# x!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T!q#@_]|R&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#s#Ac`%xs&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`# x!`!a#Be!a#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#O#Bp]&{`&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c#Cta!hQ&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!O%T!O!P#Dy!P!Q%T!Q![#GV![#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c#ES_&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!O%T!O!P#FR!P#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c#F^]!us&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a#Gbi!jq&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!Q%T!Q![#GV![!g%T!g!h#IP!h!l%T!l!m#MZ!m#O%T#O#P7o#P#R%T#R#S#GV#S#X%T#X#Y#IP#Y#^%T#^#_#MZ#_#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a#IYc&m!b&eS&hWOr%Trs&Vsw%Twx/Xx{%T{|#Je|}%T}!O#Je!O!Q%T!Q![#Km![#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a#Jn_&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!Q%T!Q![#Km![#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a#Kxe!jq&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!Q%T!Q![#Km![!l%T!l!m#MZ!m#O%T#O#P7o#P#R%T#R#S#Km#S#^%T#^#_#MZ#_#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a#Mf]!jq&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c#Nja%yR&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!P%T!P!Q$ o!Q!_%T!_!`# x!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#b$ z_%{Q&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`# x!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a$#Uw!jq&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!O%T!O!P$%o!P!Q%T!Q![$&w![!d%T!d!e$(w!e!g%T!g!h#IP!h!l%T!l!m#MZ!m!q%T!q!r$+m!r!z%T!z!{$.]!{#O%T#O#P7o#P#R%T#R#S$&w#S#U%T#U#V$(w#V#X%T#X#Y#IP#Y#^%T#^#_#MZ#_#c%T#c#d$+m#d#l%T#l#m$.]#m#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a$%x_&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!Q%T!Q![#GV![#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a$'Sk!jq&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!O%T!O!P$%o!P!Q%T!Q![$&w![!g%T!g!h#IP!h!l%T!l!m#MZ!m#O%T#O#P7o#P#R%T#R#S$&w#S#X%T#X#Y#IP#Y#^%T#^#_#MZ#_#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a$)Qb&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!Q%T!Q!R$*Y!R!S$*Y!S#O%T#O#P7o#P#R%T#R#S$*Y#S#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a$*eb!jq&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!Q%T!Q!R$*Y!R!S$*Y!S#O%T#O#P7o#P#R%T#R#S$*Y#S#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a$+va&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!Q%T!Q!Y$,{!Y#O%T#O#P7o#P#R%T#R#S$,{#S#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a$-Wa!jq&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!Q%T!Q!Y$,{!Y#O%T#O#P7o#P#R%T#R#S$,{#S#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a$.fe&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!Q%T!Q![$/w![!c%T!c!i$/w!i#O%T#O#P7o#P#R%T#R#S$/w#S#T%T#T#Z$/w#Z#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a$0Se!jq&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!Q%T!Q![$/w![!c%T!c!i$/w!i#O%T#O#P7o#P#R%T#R#S$/w#S#T%T#T#Z$/w#Z#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#s$1p_}!T&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`$2o!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T!q$2z]&TR&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c$4O]#fs&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c$5SaoR&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!^%T!^!_$6X!_!`Av!`!aAv!a#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#b$6d_%uQ&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`# x!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c$7n_&Ss&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`Av!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c$8x`oR&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`Av!`!a$9z!a#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#b$:V_%vQ&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`# x!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c$;c_aQ#|P&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`# x!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#s$<oe&m!b&eS&hW&b`%}sOr%Trs&Vsw%Twx/Xx!Q%T!Q![$<b![!c%T!c!}$<b!}#O%T#O#P7o#P#R%T#R#S$<b#S#T%T#T#o$<b#o#p8^#p#q%T#q#r8^#r$g%T$g;'S$<b;'S;=`$>Q<%lO$<b#s$>TP;=`<%l$<b#s$>ei&m!b&eS&hW&b`%}sOr%Trs$@Ssw%Twx$C`x!Q%T!Q![$<b![!c%T!c!t$<b!t!u$Fl!u!}$<b!}#O%T#O#P7o#P#R%T#R#S$<b#S#T%T#T#f$<b#f#g$Fl#g#o$<b#o#p8^#p#q%T#q#r8^#r$g%T$g;'S$<b;'S;=`$>Q<%lO$<b#c$@]a&m!b&eS&csOYE^YZ%TZ]E^]^%T^rE^rs$AbswE^wxGpx#OE^#O#P!!u#P#oE^#o#p!#d#p#qE^#q#r!#d#r;'SE^;'S;=`!)v<%lOE^#c$Ak]&m!b&eS&csOr%Trs$Bdsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#Z$BmZ&m!b&eS&gsOw(Vwx)Px#O(V#O#P+Z#P#o(V#o#p+x#p#q(V#q#r+x#r;'S(V;'S;=`/R<%lO(V#c$Cia&m!b&hW&csOY#%fYZ%TZ]#%f]^%T^r#%frs#&vsw#%fwx$Dnx#O#%f#O#P#0}#P#o#%f#o#p#1l#p#q#%f#q#r#1l#r;'S#%f;'S;=`#8O<%lO#%f#c$Dw]&m!b&hW&csOr%Trs&Vsw%Twx$Epx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#_$EyZ&m!b&hW&dsOr1Xrs2Rs#O1X#O#P3q#P#o1X#o#p4`#p#q1X#q#r4`#r;'S1X;'S;=`7i<%lO1X#s$Fye&m!b&eS&hW&b`%}sOr%Trs$@Ssw%Twx$C`x!Q%T!Q![$<b![!c%T!c!}$<b!}#O%T#O#P7o#P#R%T#R#S$<b#S#T%T#T#o$<b#o#p8^#p#q%T#q#r8^#r$g%T$g;'S$<b;'S;=`$>Q<%lO$<b#s$Hii&m!b&eS&hW&b`%}sOr%Trs$JWsw%Twx$MUx!Q%T!Q![$<b![!c%T!c!t$<b!t!u%!S!u!}$<b!}#O%T#O#P7o#P#R%T#R#S$<b#S#T%T#T#f$<b#f#g%!S#g#o$<b#o#p8^#p#q%T#q#r8^#r$g%T$g;'S$<b;'S;=`$>Q<%lO$<b#c$Ja]&m!b&eS&nsOr%Trs$KYsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c$Ka]&m!b&eSOr%Trs$LYsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#Z$LcZ&m!b&eS&psOw(Vwx)Px#O(V#O#P+Z#P#o(V#o#p+x#p#q(V#q#r+x#r;'S(V;'S;=`/R<%lO(V#c$M_]&m!b&hW&jsOr%Trs&Vsw%Twx$NWx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#c$N_]&m!b&hWOr%Trs&Vsw%Twx% Wx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#_% aZ&m!b&hW&osOr1Xrs2Rs#O1X#O#P3q#P#o1X#o#p4`#p#q1X#q#r4`#r;'S1X;'S;=`7i<%lO1X#s%!ae&m!b&eS&hW&b`%}sOr%Trs$JWsw%Twx$MUx!Q%T!Q![$<b![!c%T!c!}$<b!}#O%T#O#P7o#P#R%T#R#S$<b#S#T%T#T#o$<b#o#p8^#p#q%T#q#r8^#r$g%T$g;'S$<b;'S;=`$>Q<%lO$<b#s%$Pm&m!b&eS&hW&b`%}sOr%Trs$@Ssw%Twx$C`x!Q%T!Q![$<b![!c%T!c!h$<b!h!i%!S!i!t$<b!t!u$Fl!u!}$<b!}#O%T#O#P7o#P#R%T#R#S$<b#S#T%T#T#U$<b#U#V$Fl#V#Y$<b#Y#Z%!S#Z#o$<b#o#p8^#p#q%T#q#r8^#r$g%T$g;'S$<b;'S;=`$>Q<%lO$<b#c%&V]!Zs&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T!q%'Z]!YR&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#b%(__%sQ&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`# x!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T#a%)gX!_#T&eS&hWOr8^rs9Qsw8^wx:dx#O8^#O#P;v#P;'S8^;'S;=`<y<%lO8^#c%*__%rR&m!b&eS&hWOr%Trs&Vsw%Twx/Xx!_%T!_!`# x!`#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T!q%+gX!^!e&eS&hWOr8^rs9Qsw8^wx:dx#O8^#O#P;v#P;'S8^;'S;=`<y<%lO8^#a%,_]%|q&m!b&eS&hWOr%Trs&Vsw%Twx/Xx#O%T#O#P7o#P#o%T#o#p8^#p#q%T#q#r8^#r;'S%T;'S;=`=v<%lO%T",
  tokenizers: [legacyPrint, indentation, newlines, formatString1, formatString2, formatString1l, formatString2l, 0, 1, 2, 3, 4, 5, 6],
  topRules: { "Script": [0, 7] },
  specialized: [{ term: 229, get: (value) => spec_identifier[value] || -1 }],
  tokenPrec: 7205
});

// node_modules/.pnpm/@codemirror+lang-python@6.1.3_@codemirror+state@6.2.1_@codemirror+view@6.17.0_@lezer+common@1.0.4/node_modules/@codemirror/lang-python/dist/index.js
var cache = new NodeWeakMap();
var ScopeNodes = /* @__PURE__ */ new Set([
  "Script",
  "Body",
  "FunctionDefinition",
  "ClassDefinition",
  "LambdaExpression",
  "ForStatement",
  "MatchClause"
]);
function defID(type) {
  return (node, def, outer) => {
    if (outer)
      return false;
    let id = node.node.getChild("VariableName");
    if (id)
      def(id, type);
    return true;
  };
}
var gatherCompletions = {
  FunctionDefinition: defID("function"),
  ClassDefinition: defID("class"),
  ForStatement(node, def, outer) {
    if (outer)
      for (let child = node.node.firstChild; child; child = child.nextSibling) {
        if (child.name == "VariableName")
          def(child, "variable");
        else if (child.name == "in")
          break;
      }
  },
  ImportStatement(_node, def) {
    var _a, _b;
    let { node } = _node;
    let isFrom = ((_a = node.firstChild) === null || _a === void 0 ? void 0 : _a.name) == "from";
    for (let ch = node.getChild("import"); ch; ch = ch.nextSibling) {
      if (ch.name == "VariableName" && ((_b = ch.nextSibling) === null || _b === void 0 ? void 0 : _b.name) != "as")
        def(ch, isFrom ? "variable" : "namespace");
    }
  },
  AssignStatement(node, def) {
    for (let child = node.node.firstChild; child; child = child.nextSibling) {
      if (child.name == "VariableName")
        def(child, "variable");
      else if (child.name == ":" || child.name == "AssignOp")
        break;
    }
  },
  ParamList(node, def) {
    for (let prev = null, child = node.node.firstChild; child; child = child.nextSibling) {
      if (child.name == "VariableName" && (!prev || !/\*|AssignOp/.test(prev.name)))
        def(child, "variable");
      prev = child;
    }
  },
  CapturePattern: defID("variable"),
  AsPattern: defID("variable"),
  __proto__: null
};
function getScope(doc, node) {
  let cached = cache.get(node);
  if (cached)
    return cached;
  let completions = [], top = true;
  function def(node2, type) {
    let name = doc.sliceString(node2.from, node2.to);
    completions.push({ label: name, type });
  }
  node.cursor(IterMode.IncludeAnonymous).iterate((node2) => {
    if (node2.name) {
      let gather = gatherCompletions[node2.name];
      if (gather && gather(node2, def, top) || !top && ScopeNodes.has(node2.name))
        return false;
      top = false;
    } else if (node2.to - node2.from > 8192) {
      for (let c of getScope(doc, node2.node))
        completions.push(c);
      return false;
    }
  });
  cache.set(node, completions);
  return completions;
}
var Identifier = /^[\w\xa1-\uffff][\w\d\xa1-\uffff]*$/;
var dontComplete = ["String", "FormatString", "Comment", "PropertyName"];
function localCompletionSource(context) {
  let inner = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (dontComplete.indexOf(inner.name) > -1)
    return null;
  let isWord = inner.name == "VariableName" || inner.to - inner.from < 20 && Identifier.test(context.state.sliceDoc(inner.from, inner.to));
  if (!isWord && !context.explicit)
    return null;
  let options = [];
  for (let pos = inner; pos; pos = pos.parent) {
    if (ScopeNodes.has(pos.name))
      options = options.concat(getScope(context.state.doc, pos));
  }
  return {
    options,
    from: isWord ? inner.from : context.pos,
    validFor: Identifier
  };
}
var globals = [
  "__annotations__",
  "__builtins__",
  "__debug__",
  "__doc__",
  "__import__",
  "__name__",
  "__loader__",
  "__package__",
  "__spec__",
  "False",
  "None",
  "True"
].map((n) => ({ label: n, type: "constant" })).concat([
  "ArithmeticError",
  "AssertionError",
  "AttributeError",
  "BaseException",
  "BlockingIOError",
  "BrokenPipeError",
  "BufferError",
  "BytesWarning",
  "ChildProcessError",
  "ConnectionAbortedError",
  "ConnectionError",
  "ConnectionRefusedError",
  "ConnectionResetError",
  "DeprecationWarning",
  "EOFError",
  "Ellipsis",
  "EncodingWarning",
  "EnvironmentError",
  "Exception",
  "FileExistsError",
  "FileNotFoundError",
  "FloatingPointError",
  "FutureWarning",
  "GeneratorExit",
  "IOError",
  "ImportError",
  "ImportWarning",
  "IndentationError",
  "IndexError",
  "InterruptedError",
  "IsADirectoryError",
  "KeyError",
  "KeyboardInterrupt",
  "LookupError",
  "MemoryError",
  "ModuleNotFoundError",
  "NameError",
  "NotADirectoryError",
  "NotImplemented",
  "NotImplementedError",
  "OSError",
  "OverflowError",
  "PendingDeprecationWarning",
  "PermissionError",
  "ProcessLookupError",
  "RecursionError",
  "ReferenceError",
  "ResourceWarning",
  "RuntimeError",
  "RuntimeWarning",
  "StopAsyncIteration",
  "StopIteration",
  "SyntaxError",
  "SyntaxWarning",
  "SystemError",
  "SystemExit",
  "TabError",
  "TimeoutError",
  "TypeError",
  "UnboundLocalError",
  "UnicodeDecodeError",
  "UnicodeEncodeError",
  "UnicodeError",
  "UnicodeTranslateError",
  "UnicodeWarning",
  "UserWarning",
  "ValueError",
  "Warning",
  "ZeroDivisionError"
].map((n) => ({ label: n, type: "type" }))).concat([
  "bool",
  "bytearray",
  "bytes",
  "classmethod",
  "complex",
  "float",
  "frozenset",
  "int",
  "list",
  "map",
  "memoryview",
  "object",
  "range",
  "set",
  "staticmethod",
  "str",
  "super",
  "tuple",
  "type"
].map((n) => ({ label: n, type: "class" }))).concat([
  "abs",
  "aiter",
  "all",
  "anext",
  "any",
  "ascii",
  "bin",
  "breakpoint",
  "callable",
  "chr",
  "compile",
  "delattr",
  "dict",
  "dir",
  "divmod",
  "enumerate",
  "eval",
  "exec",
  "exit",
  "filter",
  "format",
  "getattr",
  "globals",
  "hasattr",
  "hash",
  "help",
  "hex",
  "id",
  "input",
  "isinstance",
  "issubclass",
  "iter",
  "len",
  "license",
  "locals",
  "max",
  "min",
  "next",
  "oct",
  "open",
  "ord",
  "pow",
  "print",
  "property",
  "quit",
  "repr",
  "reversed",
  "round",
  "setattr",
  "slice",
  "sorted",
  "sum",
  "vars",
  "zip"
].map((n) => ({ label: n, type: "function" })));
var snippets = [
  snippetCompletion("def ${name}(${params}):\n	${}", {
    label: "def",
    detail: "function",
    type: "keyword"
  }),
  snippetCompletion("for ${name} in ${collection}:\n	${}", {
    label: "for",
    detail: "loop",
    type: "keyword"
  }),
  snippetCompletion("while ${}:\n	${}", {
    label: "while",
    detail: "loop",
    type: "keyword"
  }),
  snippetCompletion("try:\n	${}\nexcept ${error}:\n	${}", {
    label: "try",
    detail: "/ except block",
    type: "keyword"
  }),
  snippetCompletion("if ${}:\n	\n", {
    label: "if",
    detail: "block",
    type: "keyword"
  }),
  snippetCompletion("if ${}:\n	${}\nelse:\n	${}", {
    label: "if",
    detail: "/ else block",
    type: "keyword"
  }),
  snippetCompletion("class ${name}:\n	def __init__(self, ${params}):\n			${}", {
    label: "class",
    detail: "definition",
    type: "keyword"
  }),
  snippetCompletion("import ${module}", {
    label: "import",
    detail: "statement",
    type: "keyword"
  }),
  snippetCompletion("from ${module} import ${names}", {
    label: "from",
    detail: "import",
    type: "keyword"
  })
];
var globalCompletion = ifNotIn(dontComplete, completeFromList(globals.concat(snippets)));
function indentBody(context, node) {
  let base = context.baseIndentFor(node);
  let line = context.lineAt(context.pos, -1), to = line.from + line.text.length;
  if (/^\s*($|#)/.test(line.text) && context.node.to < to + 100 && !/\S/.test(context.state.sliceDoc(to, context.node.to)) && context.lineIndent(context.pos, -1) <= base)
    return null;
  if (/^\s*(else:|elif |except |finally:)/.test(context.textAfter) && context.lineIndent(context.pos, -1) > base)
    return null;
  return base + context.unit;
}
var pythonLanguage = LRLanguage.define({
  name: "python",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Body: (context) => {
          var _a;
          return (_a = indentBody(context, context.node)) !== null && _a !== void 0 ? _a : context.continue();
        },
        IfStatement: (cx) => /^\s*(else:|elif )/.test(cx.textAfter) ? cx.baseIndent : cx.continue(),
        TryStatement: (cx) => /^\s*(except |finally:|else:)/.test(cx.textAfter) ? cx.baseIndent : cx.continue(),
        "TupleExpression ComprehensionExpression ParamList ArgList ParenthesizedExpression": delimitedIndent({ closing: ")" }),
        "DictionaryExpression DictionaryComprehensionExpression SetExpression SetComprehensionExpression": delimitedIndent({ closing: "}" }),
        "ArrayExpression ArrayComprehensionExpression": delimitedIndent({ closing: "]" }),
        "String FormatString": () => null,
        Script: (context) => {
          if (context.pos + /\s*/.exec(context.textAfter)[0].length >= context.node.to) {
            let endBody = null;
            for (let cur = context.node, to = cur.to; ; ) {
              cur = cur.lastChild;
              if (!cur || cur.to != to)
                break;
              if (cur.type.name == "Body")
                endBody = cur;
            }
            if (endBody) {
              let bodyIndent = indentBody(context, endBody);
              if (bodyIndent != null)
                return bodyIndent;
            }
          }
          return context.continue();
        }
      }),
      foldNodeProp.add({
        "ArrayExpression DictionaryExpression SetExpression TupleExpression": foldInside,
        Body: (node, state) => ({ from: node.from + 1, to: node.to - (node.to == state.doc.length ? 0 : 1) })
      })
    ]
  }),
  languageData: {
    closeBrackets: {
      brackets: ["(", "[", "{", "'", '"', "'''", '"""'],
      stringPrefixes: [
        "f",
        "fr",
        "rf",
        "r",
        "u",
        "b",
        "br",
        "rb",
        "F",
        "FR",
        "RF",
        "R",
        "U",
        "B",
        "BR",
        "RB"
      ]
    },
    commentTokens: { line: "#" },
    indentOnInput: /^\s*([\}\]\)]|else:|elif |except |finally:)$/
  }
});
function python() {
  return new LanguageSupport(pythonLanguage, [
    pythonLanguage.data.of({ autocomplete: localCompletionSource }),
    pythonLanguage.data.of({ autocomplete: globalCompletion })
  ]);
}
export {
  globalCompletion,
  localCompletionSource,
  python,
  pythonLanguage
};
//# sourceMappingURL=dist-5B76FFHN.js.map

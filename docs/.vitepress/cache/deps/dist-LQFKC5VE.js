import {
  ContextTracker,
  ExternalTokenizer,
  LRLanguage,
  LRParser,
  LanguageSupport,
  bracketMatchingHandle,
  foldNodeProp,
  indentNodeProp,
  styleTags,
  syntaxTree,
  tags
} from "./chunk-S5BUKLIZ.js";
import "./chunk-3TEUGPMP.js";

// node_modules/.pnpm/@lezer+xml@1.0.2/node_modules/@lezer/xml/dist/index.js
var StartTag = 1;
var StartCloseTag = 2;
var MissingCloseTag = 3;
var mismatchedStartCloseTag = 4;
var incompleteStartCloseTag = 5;
var commentContent$1 = 35;
var piContent$1 = 36;
var cdataContent$1 = 37;
var Element = 11;
var OpenTag = 13;
function nameChar(ch) {
  return ch == 45 || ch == 46 || ch == 58 || ch >= 65 && ch <= 90 || ch == 95 || ch >= 97 && ch <= 122 || ch >= 161;
}
function isSpace(ch) {
  return ch == 9 || ch == 10 || ch == 13 || ch == 32;
}
var cachedName = null;
var cachedInput = null;
var cachedPos = 0;
function tagNameAfter(input, offset) {
  let pos = input.pos + offset;
  if (cachedInput == input && cachedPos == pos)
    return cachedName;
  while (isSpace(input.peek(offset)))
    offset++;
  let name = "";
  for (; ; ) {
    let next = input.peek(offset);
    if (!nameChar(next))
      break;
    name += String.fromCharCode(next);
    offset++;
  }
  cachedInput = input;
  cachedPos = pos;
  return cachedName = name || null;
}
function ElementContext(name, parent) {
  this.name = name;
  this.parent = parent;
  this.hash = parent ? parent.hash : 0;
  for (let i = 0; i < name.length; i++)
    this.hash += (this.hash << 4) + name.charCodeAt(i) + (name.charCodeAt(i) << 8);
}
var elementContext = new ContextTracker({
  start: null,
  shift(context, term, stack, input) {
    return term == StartTag ? new ElementContext(tagNameAfter(input, 1) || "", context) : context;
  },
  reduce(context, term) {
    return term == Element && context ? context.parent : context;
  },
  reuse(context, node, _stack, input) {
    let type = node.type.id;
    return type == StartTag || type == OpenTag ? new ElementContext(tagNameAfter(input, 1) || "", context) : context;
  },
  hash(context) {
    return context ? context.hash : 0;
  },
  strict: false
});
var startTag = new ExternalTokenizer((input, stack) => {
  if (input.next != 60)
    return;
  input.advance();
  if (input.next == 47) {
    input.advance();
    let name = tagNameAfter(input, 0);
    if (!name)
      return input.acceptToken(incompleteStartCloseTag);
    if (stack.context && name == stack.context.name)
      return input.acceptToken(StartCloseTag);
    for (let cx = stack.context; cx; cx = cx.parent)
      if (cx.name == name)
        return input.acceptToken(MissingCloseTag, -2);
    input.acceptToken(mismatchedStartCloseTag);
  } else if (input.next != 33 && input.next != 63) {
    return input.acceptToken(StartTag);
  }
}, { contextual: true });
function scanTo(type, end) {
  return new ExternalTokenizer((input) => {
    for (let endPos = 0, len = 0; ; len++) {
      if (input.next < 0) {
        if (len)
          input.acceptToken(type);
        break;
      }
      if (input.next == end.charCodeAt(endPos)) {
        endPos++;
        if (endPos == end.length) {
          if (len >= end.length)
            input.acceptToken(type, 1 - end.length);
          break;
        }
      } else {
        endPos = input.next == end.charCodeAt(0) ? 1 : 0;
      }
      input.advance();
    }
  });
}
var commentContent = scanTo(commentContent$1, "-->");
var piContent = scanTo(piContent$1, "?>");
var cdataContent = scanTo(cdataContent$1, "]]>");
var xmlHighlighting = styleTags({
  Text: tags.content,
  "StartTag StartCloseTag EndTag SelfCloseEndTag": tags.angleBracket,
  TagName: tags.tagName,
  "MismatchedCloseTag/Tagname": [tags.tagName, tags.invalid],
  AttributeName: tags.attributeName,
  AttributeValue: tags.attributeValue,
  Is: tags.definitionOperator,
  "EntityReference CharacterReference": tags.character,
  Comment: tags.blockComment,
  ProcessingInst: tags.processingInstruction,
  DoctypeDecl: tags.documentMeta,
  Cdata: tags.special(tags.string)
});
var parser = LRParser.deserialize({
  version: 14,
  states: ",SOQOaOOOrOxO'#CfOzOpO'#CiO!tOaO'#CgOOOP'#Cg'#CgO!{OrO'#CrO#TOtO'#CsO#]OpO'#CtOOOP'#DS'#DSOOOP'#Cv'#CvQQOaOOOOOW'#Cw'#CwO#eOxO,59QOOOP,59Q,59QOOOO'#Cx'#CxO#mOpO,59TO#uO!bO,59TOOOP'#C{'#C{O$TOaO,59RO$[OpO'#CoOOOP,59R,59ROOOQ'#C|'#C|O$dOrO,59^OOOP,59^,59^OOOS'#C}'#C}O$lOtO,59_OOOP,59_,59_O$tOpO,59`O$|OpO,59`OOOP-E6t-E6tOOOW-E6u-E6uOOOP1G.l1G.lOOOO-E6v-E6vO%UO!bO1G.oO%UO!bO1G.oO%dOpO'#CkO%lO!bO'#CyO%zO!bO1G.oOOOP1G.o1G.oOOOP1G.w1G.wOOOP-E6y-E6yOOOP1G.m1G.mO&VOpO,59ZO&_OpO,59ZOOOQ-E6z-E6zOOOP1G.x1G.xOOOS-E6{-E6{OOOP1G.y1G.yO&gOpO1G.zO&gOpO1G.zOOOP1G.z1G.zO&oO!bO7+$ZO&}O!bO7+$ZOOOP7+$Z7+$ZOOOP7+$c7+$cO'YOpO,59VO'bOpO,59VO'jO!bO,59eOOOO-E6w-E6wO'xOpO1G.uO'xOpO1G.uOOOP1G.u1G.uO(QOpO7+$fOOOP7+$f7+$fO(YO!bO<<GuOOOP<<Gu<<GuOOOP<<G}<<G}O'bOpO1G.qO'bOpO1G.qO(eO#tO'#CnOOOO1G.q1G.qO(sOpO7+$aOOOP7+$a7+$aOOOP<<HQ<<HQOOOPAN=aAN=aOOOPAN=iAN=iO'bOpO7+$]OOOO7+$]7+$]OOOO'#Cz'#CzO({O#tO,59YOOOO,59Y,59YOOOP<<G{<<G{OOOO<<Gw<<GwOOOO-E6x-E6xOOOO1G.t1G.t",
  stateData: ")Z~OPQOSVOTWOVWOWWOXWOiXOxPO}TO!PUO~OuZOw]O~O^`Oy^O~OPQOQcOSVOTWOVWOWWOXWOxPO}TO!PUO~ORdO~P!SOseO|gO~OthO!OjO~O^lOy^O~OuZOwoO~O^qOy^O~O[vO`sOdwOy^O~ORyO~P!SO^{Oy^O~OseO|}O~OthO!O!PO~O^!QOy^O~O[!SOy^O~O[!VO`sOd!WOy^O~Oa!YOy^O~Oy^O[mX`mXdmX~O[!VO`sOd!WO~O^!]Oy^O~O[!_Oy^O~O[!aOy^O~O[!cO`sOd!dOy^O~O[!cO`sOd!dO~Oa!eOy^O~Oy^Oz!gO~Oy^O[ma`madma~O[!jOy^O~O[!kOy^O~O[!lO`sOd!mO~OW!pOX!pOz!rO{!pO~O[!sOy^O~OW!pOX!pOz!vO{!pO~O",
  goto: "%[wPPPPPPPPPPxxP!OP!UPP!_!iP!oxxxP!u!{#R$Z$j$p$v$|PPPP%SXWORYbXRORYb_t`qru!T!U!bQ!h!YS!o!e!fR!t!nQdRRybXSORYbQYORmYQ[PRn[Q_QQkVjp_krz!R!T!X!Z!^!`!f!i!nQr`QzcQ!RlQ!TqQ!XsQ!ZtQ!^{Q!`!QQ!f!YQ!i!]R!n!eQu`S!UqrU![u!U!bR!b!TQ!q!gR!u!qQbRRxbQfTR|fQiUR!OiSXOYTaRb",
  nodeNames: "⚠ StartTag StartCloseTag MissingCloseTag StartCloseTag StartCloseTag Document Text EntityReference CharacterReference Cdata Element EndTag OpenTag TagName Attribute AttributeName Is AttributeValue CloseTag SelfCloseEndTag SelfClosingTag Comment ProcessingInst MismatchedCloseTag DoctypeDecl",
  maxTerm: 47,
  context: elementContext,
  nodeProps: [
    ["closedBy", 1, "SelfCloseEndTag EndTag", 13, "CloseTag MissingCloseTag"],
    ["openedBy", 12, "StartTag StartCloseTag", 19, "OpenTag", 20, "StartTag"]
  ],
  propSources: [xmlHighlighting],
  skippedNodes: [0],
  repeatNodeCount: 8,
  tokenData: "IX~R!XOX$nXY&kYZ&kZ]$n]^&k^p$npq&kqr$nrs'ssv$nvw(Zw}$n}!O*l!O!P$n!P!Q,{!Q![$n![!].e!]!^$n!^!_1v!_!`Cz!`!aDm!a!bE`!b!c$n!c!}.e!}#P$n#P#QFx#Q#R$n#R#S.e#S#T$n#T#o.e#o%W$n%W%o.e%o%p$n%p&a.e&a&b$n&b1p.e1p4U$n4U4d.e4d4e$n4e$IS.e$IS$I`$n$I`$Ib.e$Ib$Kh$n$Kh%#t.e%#t&/x$n&/x&Et.e&Et&FV$n&FV;'S.e;'S;:j1p;:j;=`&e<%l?&r$n?&r?Ah.e?Ah?BY$n?BY?Mn.e?MnO$nX$uWVP{WOr$nrs%_sv$nw!^$n!^!_%y!_;'S$n;'S;=`&e<%lO$nP%dTVPOv%_w!^%_!_;'S%_;'S;=`%s<%lO%_P%vP;=`<%l%_W&OT{WOr%ysv%yw;'S%y;'S;=`&_<%lO%yW&bP;=`<%l%yX&hP;=`<%l$n_&t_VP{WyUOX$nXY&kYZ&kZ]$n]^&k^p$npq&kqr$nrs%_sv$nw!^$n!^!_%y!_;'S$n;'S;=`&e<%lO$nZ'zTzYVPOv%_w!^%_!_;'S%_;'S;=`%s<%lO%_~(^VOp(sqs(sst)ht!](s!^;'S(s;'S;=`)b<%lO(s~(vVOp(sqs(st!](s!]!^)]!^;'S(s;'S;=`)b<%lO(s~)bOW~~)eP;=`<%l(s~)kTOp)zq!])z!^;'S)z;'S;=`*f<%lO)z~)}UOp)zq!])z!]!^*a!^;'S)z;'S;=`*f<%lO)z~*fOX~~*iP;=`<%l)zZ*sYVP{WOr$nrs%_sv$nw}$n}!O+c!O!^$n!^!_%y!_;'S$n;'S;=`&e<%lO$nZ+jYVP{WOr$nrs%_sv$nw!^$n!^!_%y!_!`$n!`!a,Y!a;'S$n;'S;=`&e<%lO$nZ,cW|QVP{WOr$nrs%_sv$nw!^$n!^!_%y!_;'S$n;'S;=`&e<%lO$n]-SYVP{WOr$nrs%_sv$nw!^$n!^!_%y!_!`$n!`!a-r!a;'S$n;'S;=`&e<%lO$n]-{WdSVP{WOr$nrs%_sv$nw!^$n!^!_%y!_;'S$n;'S;=`&e<%lO$n_.p!O`S^QVP{WOr$nrs%_sv$nw}$n}!O.e!O!P.e!P!Q$n!Q![.e![!].e!]!^$n!^!_%y!_!c$n!c!}.e!}#R$n#R#S.e#S#T$n#T#o.e#o$}$n$}%O.e%O%W$n%W%o.e%o%p$n%p&a.e&a&b$n&b1p.e1p4U.e4U4d.e4d4e$n4e$IS.e$IS$I`$n$I`$Ib.e$Ib$Je$n$Je$Jg.e$Jg$Kh$n$Kh%#t.e%#t&/x$n&/x&Et.e&Et&FV$n&FV;'S.e;'S;:j1p;:j;=`&e<%l?&r$n?&r?Ah.e?Ah?BY$n?BY?Mn.e?MnO$n_1sP;=`<%l.eX1{W{WOq%yqr2esv%yw!a%y!a!bCd!b;'S%y;'S;=`&_<%lO%yX2j]{WOr%ysv%yw}%y}!O3c!O!f%y!f!g4e!g!}%y!}#O9t#O#W%y#W#X@Q#X;'S%y;'S;=`&_<%lO%yX3hV{WOr%ysv%yw}%y}!O3}!O;'S%y;'S;=`&_<%lO%yX4UT}P{WOr%ysv%yw;'S%y;'S;=`&_<%lO%yX4jV{WOr%ysv%yw!q%y!q!r5P!r;'S%y;'S;=`&_<%lO%yX5UV{WOr%ysv%yw!e%y!e!f5k!f;'S%y;'S;=`&_<%lO%yX5pV{WOr%ysv%yw!v%y!v!w6V!w;'S%y;'S;=`&_<%lO%yX6[V{WOr%ysv%yw!{%y!{!|6q!|;'S%y;'S;=`&_<%lO%yX6vV{WOr%ysv%yw!r%y!r!s7]!s;'S%y;'S;=`&_<%lO%yX7bV{WOr%ysv%yw!g%y!g!h7w!h;'S%y;'S;=`&_<%lO%yX7|X{WOr7wrs8isv7wvw8iw!`7w!`!a9W!a;'S7w;'S;=`9n<%lO7wP8lTO!`8i!`!a8{!a;'S8i;'S;=`9Q<%lO8iP9QOiPP9TP;=`<%l8iX9_TiP{WOr%ysv%yw;'S%y;'S;=`&_<%lO%yX9qP;=`<%l7wX9yX{WOr%ysv%yw!e%y!e!f:f!f#V%y#V#W=t#W;'S%y;'S;=`&_<%lO%yX:kV{WOr%ysv%yw!f%y!f!g;Q!g;'S%y;'S;=`&_<%lO%yX;VV{WOr%ysv%yw!c%y!c!d;l!d;'S%y;'S;=`&_<%lO%yX;qV{WOr%ysv%yw!v%y!v!w<W!w;'S%y;'S;=`&_<%lO%yX<]V{WOr%ysv%yw!c%y!c!d<r!d;'S%y;'S;=`&_<%lO%yX<wV{WOr%ysv%yw!}%y!}#O=^#O;'S%y;'S;=`&_<%lO%yX=eT{WxPOr%ysv%yw;'S%y;'S;=`&_<%lO%yX=yV{WOr%ysv%yw#W%y#W#X>`#X;'S%y;'S;=`&_<%lO%yX>eV{WOr%ysv%yw#T%y#T#U>z#U;'S%y;'S;=`&_<%lO%yX?PV{WOr%ysv%yw#h%y#h#i?f#i;'S%y;'S;=`&_<%lO%yX?kV{WOr%ysv%yw#T%y#T#U<r#U;'S%y;'S;=`&_<%lO%yX@VV{WOr%ysv%yw#c%y#c#d@l#d;'S%y;'S;=`&_<%lO%yX@qV{WOr%ysv%yw#V%y#V#WAW#W;'S%y;'S;=`&_<%lO%yXA]V{WOr%ysv%yw#h%y#h#iAr#i;'S%y;'S;=`&_<%lO%yXAwV{WOr%ysv%yw#m%y#m#nB^#n;'S%y;'S;=`&_<%lO%yXBcV{WOr%ysv%yw#d%y#d#eBx#e;'S%y;'S;=`&_<%lO%yXB}V{WOr%ysv%yw#X%y#X#Y7w#Y;'S%y;'S;=`&_<%lO%yXCkT!PP{WOr%ysv%yw;'S%y;'S;=`&_<%lO%yZDTWaQVP{WOr$nrs%_sv$nw!^$n!^!_%y!_;'S$n;'S;=`&e<%lO$n_DvW[UVP{WOr$nrs%_sv$nw!^$n!^!_%y!_;'S$n;'S;=`&e<%lO$nZEgYVP{WOr$nrs%_sv$nw!^$n!^!_%y!_!`$n!`!aFV!a;'S$n;'S;=`&e<%lO$nZF`W!OQVP{WOr$nrs%_sv$nw!^$n!^!_%y!_;'S$n;'S;=`&e<%lO$nZGPYVP{WOr$nrs%_sv$nw!^$n!^!_%y!_#P$n#P#QGo#Q;'S$n;'S;=`&e<%lO$nZGvYVP{WOr$nrs%_sv$nw!^$n!^!_%y!_!`$n!`!aHf!a;'S$n;'S;=`&e<%lO$nZHoWwQVP{WOr$nrs%_sv$nw!^$n!^!_%y!_;'S$n;'S;=`&e<%lO$n",
  tokenizers: [startTag, commentContent, piContent, cdataContent, 0, 1, 2, 3],
  topRules: { "Document": [0, 6] },
  tokenPrec: 0
});

// node_modules/.pnpm/@codemirror+lang-xml@6.0.2_@codemirror+view@6.17.0/node_modules/@codemirror/lang-xml/dist/index.js
function tagName(doc, tag) {
  let name = tag && tag.getChild("TagName");
  return name ? doc.sliceString(name.from, name.to) : "";
}
function elementName(doc, tree) {
  let tag = tree && tree.firstChild;
  return !tag || tag.name != "OpenTag" ? "" : tagName(doc, tag);
}
function attrName(doc, tag, pos) {
  let attr = tag && tag.getChildren("Attribute").find((a) => a.from <= pos && a.to >= pos);
  let name = attr && attr.getChild("AttributeName");
  return name ? doc.sliceString(name.from, name.to) : "";
}
function findParentElement(tree) {
  for (let cur = tree && tree.parent; cur; cur = cur.parent)
    if (cur.name == "Element")
      return cur;
  return null;
}
function findLocation(state, pos) {
  var _a;
  let at = syntaxTree(state).resolveInner(pos, -1), inTag = null;
  for (let cur = at; !inTag && cur.parent; cur = cur.parent)
    if (cur.name == "OpenTag" || cur.name == "CloseTag" || cur.name == "SelfClosingTag" || cur.name == "MismatchedCloseTag")
      inTag = cur;
  if (inTag && (inTag.to > pos || inTag.lastChild.type.isError)) {
    let elt = inTag.parent;
    if (at.name == "TagName")
      return inTag.name == "CloseTag" || inTag.name == "MismatchedCloseTag" ? { type: "closeTag", from: at.from, context: elt } : { type: "openTag", from: at.from, context: findParentElement(elt) };
    if (at.name == "AttributeName")
      return { type: "attrName", from: at.from, context: inTag };
    if (at.name == "AttributeValue")
      return { type: "attrValue", from: at.from, context: inTag };
    let before = at == inTag || at.name == "Attribute" ? at.childBefore(pos) : at;
    if ((before === null || before === void 0 ? void 0 : before.name) == "StartTag")
      return { type: "openTag", from: pos, context: findParentElement(elt) };
    if ((before === null || before === void 0 ? void 0 : before.name) == "StartCloseTag" && before.to <= pos)
      return { type: "closeTag", from: pos, context: elt };
    if ((before === null || before === void 0 ? void 0 : before.name) == "Is")
      return { type: "attrValue", from: pos, context: inTag };
    if (before)
      return { type: "attrName", from: pos, context: inTag };
    return null;
  } else if (at.name == "StartCloseTag") {
    return { type: "closeTag", from: pos, context: at.parent };
  }
  while (at.parent && at.to == pos && !((_a = at.lastChild) === null || _a === void 0 ? void 0 : _a.type.isError))
    at = at.parent;
  if (at.name == "Element" || at.name == "Text" || at.name == "Document")
    return { type: "tag", from: pos, context: at.name == "Element" ? at : findParentElement(at) };
  return null;
}
var Element2 = class {
  constructor(spec, attrs, attrValues) {
    this.attrs = attrs;
    this.attrValues = attrValues;
    this.children = [];
    this.name = spec.name;
    this.completion = Object.assign(Object.assign({ type: "type" }, spec.completion || {}), { label: this.name });
    this.openCompletion = Object.assign(Object.assign({}, this.completion), { label: "<" + this.name });
    this.closeCompletion = Object.assign(Object.assign({}, this.completion), { label: "</" + this.name + ">", boost: 2 });
    this.closeNameCompletion = Object.assign(Object.assign({}, this.completion), { label: this.name + ">" });
    this.text = spec.textContent ? spec.textContent.map((s) => ({ label: s, type: "text" })) : [];
  }
};
var Identifier = /^[:\-\.\w\u00b7-\uffff]*$/;
function attrCompletion(spec) {
  return Object.assign(Object.assign({ type: "property" }, spec.completion || {}), { label: spec.name });
}
function valueCompletion(spec) {
  return typeof spec == "string" ? { label: `"${spec}"`, type: "constant" } : /^"/.test(spec.label) ? spec : Object.assign(Object.assign({}, spec), { label: `"${spec.label}"` });
}
function completeFromSchema(eltSpecs, attrSpecs) {
  let allAttrs = [], globalAttrs = [];
  let attrValues = /* @__PURE__ */ Object.create(null);
  for (let s of attrSpecs) {
    let completion = attrCompletion(s);
    allAttrs.push(completion);
    if (s.global)
      globalAttrs.push(completion);
    if (s.values)
      attrValues[s.name] = s.values.map(valueCompletion);
  }
  let allElements = [], topElements = [];
  let byName = /* @__PURE__ */ Object.create(null);
  for (let s of eltSpecs) {
    let attrs = globalAttrs, attrVals = attrValues;
    if (s.attributes)
      attrs = attrs.concat(s.attributes.map((s2) => {
        if (typeof s2 == "string")
          return allAttrs.find((a) => a.label == s2) || { label: s2, type: "property" };
        if (s2.values) {
          if (attrVals == attrValues)
            attrVals = Object.create(attrVals);
          attrVals[s2.name] = s2.values.map(valueCompletion);
        }
        return attrCompletion(s2);
      }));
    let elt = new Element2(s, attrs, attrVals);
    byName[elt.name] = elt;
    allElements.push(elt);
    if (s.top)
      topElements.push(elt);
  }
  if (!topElements.length)
    topElements = allElements;
  for (let i = 0; i < allElements.length; i++) {
    let s = eltSpecs[i], elt = allElements[i];
    if (s.children) {
      for (let ch of s.children)
        if (byName[ch])
          elt.children.push(byName[ch]);
    } else {
      elt.children = allElements;
    }
  }
  return (cx) => {
    var _a;
    let { doc } = cx.state, loc = findLocation(cx.state, cx.pos);
    if (!loc || loc.type == "tag" && !cx.explicit)
      return null;
    let { type, from, context } = loc;
    if (type == "openTag") {
      let children = topElements;
      let parentName = elementName(doc, context);
      if (parentName) {
        let parent = byName[parentName];
        children = (parent === null || parent === void 0 ? void 0 : parent.children) || allElements;
      }
      return {
        from,
        options: children.map((ch) => ch.completion),
        validFor: Identifier
      };
    } else if (type == "closeTag") {
      let parentName = elementName(doc, context);
      return parentName ? {
        from,
        to: cx.pos + (doc.sliceString(cx.pos, cx.pos + 1) == ">" ? 1 : 0),
        options: [((_a = byName[parentName]) === null || _a === void 0 ? void 0 : _a.closeNameCompletion) || { label: parentName + ">", type: "type" }],
        validFor: Identifier
      } : null;
    } else if (type == "attrName") {
      let parent = byName[tagName(doc, context)];
      return {
        from,
        options: (parent === null || parent === void 0 ? void 0 : parent.attrs) || globalAttrs,
        validFor: Identifier
      };
    } else if (type == "attrValue") {
      let attr = attrName(doc, context, from);
      if (!attr)
        return null;
      let parent = byName[tagName(doc, context)];
      let values = ((parent === null || parent === void 0 ? void 0 : parent.attrValues) || attrValues)[attr];
      if (!values || !values.length)
        return null;
      return {
        from,
        to: cx.pos + (doc.sliceString(cx.pos, cx.pos + 1) == '"' ? 1 : 0),
        options: values,
        validFor: /^"[^"]*"?$/
      };
    } else if (type == "tag") {
      let parentName = elementName(doc, context), parent = byName[parentName];
      let closing = [], last = context && context.lastChild;
      if (parentName && (!last || last.name != "CloseTag" || tagName(doc, last) != parentName))
        closing.push(parent ? parent.closeCompletion : { label: "</" + parentName + ">", type: "type", boost: 2 });
      let options = closing.concat(((parent === null || parent === void 0 ? void 0 : parent.children) || (context ? allElements : topElements)).map((e) => e.openCompletion));
      if (context && (parent === null || parent === void 0 ? void 0 : parent.text.length)) {
        let openTag = context.firstChild;
        if (openTag.to > cx.pos - 20 && !/\S/.test(cx.state.sliceDoc(openTag.to, cx.pos)))
          options = options.concat(parent.text);
      }
      return {
        from,
        options,
        validFor: /^<\/?[:\-\.\w\u00b7-\uffff]*$/
      };
    } else {
      return null;
    }
  };
}
var xmlLanguage = LRLanguage.define({
  name: "xml",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        Element(context) {
          let closed = /^\s*<\//.test(context.textAfter);
          return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
        },
        "OpenTag CloseTag SelfClosingTag"(context) {
          return context.column(context.node.from) + context.unit;
        }
      }),
      foldNodeProp.add({
        Element(subtree) {
          let first = subtree.firstChild, last = subtree.lastChild;
          if (!first || first.name != "OpenTag")
            return null;
          return { from: first.to, to: last.name == "CloseTag" ? last.from : subtree.to };
        }
      }),
      bracketMatchingHandle.add({
        "OpenTag CloseTag": (node) => node.getChild("TagName")
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "<!--", close: "-->" } },
    indentOnInput: /^\s*<\/$/
  }
});
function xml(conf = {}) {
  return new LanguageSupport(xmlLanguage, xmlLanguage.data.of({
    autocomplete: completeFromSchema(conf.elements || [], conf.attributes || [])
  }));
}
export {
  completeFromSchema,
  xml,
  xmlLanguage
};
//# sourceMappingURL=dist-LQFKC5VE.js.map

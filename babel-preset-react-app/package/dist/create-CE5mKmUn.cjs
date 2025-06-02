'use strict';

var require$$0$1 = require('path');
var index = require('./index-DDQISHMI.cjs');
var require$$0 = require('@babel/core');
var require$$0$2 = require('assert');

var lib$d = {};

var lib$c = {};

var createPlugin = {};

var lib$b = {};

var hasRequiredLib$d;

function requireLib$d () {
	if (hasRequiredLib$d) return lib$b;
	hasRequiredLib$d = 1;
	Object.defineProperty(lib$b, "__esModule", {
	  value: true
	});
	lib$b.default = void 0;
	var _helperPluginUtils = index.requireLib();
	lib$b.default = (0, _helperPluginUtils.declare)((api) => {
	  api.assertVersion(7);
	  return {
	    name: "syntax-jsx",
	    manipulateOptions(opts, parserOpts) {
	      {
	        if (parserOpts.plugins.some((p) => (Array.isArray(p) ? p[0] : p) === "typescript")) {
	          return;
	        }
	      }
	      parserOpts.plugins.push("jsx");
	    }
	  };
	});
	return lib$b;
}

var hasRequiredCreatePlugin;

function requireCreatePlugin () {
	if (hasRequiredCreatePlugin) return createPlugin;
	hasRequiredCreatePlugin = 1;
	Object.defineProperty(createPlugin, "__esModule", {
	  value: true
	});
	createPlugin.default = createPlugin$1;
	var _pluginSyntaxJsx = requireLib$d();
	var _helperPluginUtils = index.requireLib();
	var _core = require$$0;
	var _helperModuleImports = index.requireLib$1();
	var _helperAnnotateAsPure = index.requireLib$2();
	const DEFAULT = {
	  importSource: "react",
	  pragma: "React.createElement",
	  pragmaFrag: "React.Fragment"
	};
	const JSX_SOURCE_ANNOTATION_REGEX = /^\s*(?:\*\s*)?@jsxImportSource\s+(\S+)\s*$/m;
	const JSX_RUNTIME_ANNOTATION_REGEX = /^\s*(?:\*\s*)?@jsxRuntime\s+(\S+)\s*$/m;
	const JSX_ANNOTATION_REGEX = /^\s*(?:\*\s*)?@jsx\s+(\S+)\s*$/m;
	const JSX_FRAG_ANNOTATION_REGEX = /^\s*(?:\*\s*)?@jsxFrag\s+(\S+)\s*$/m;
	const get = (pass, name) => pass.get(`@babel/plugin-react-jsx/${name}`);
	const set = (pass, name, v) => pass.set(`@babel/plugin-react-jsx/${name}`, v);
	function hasProto(node) {
	  return node.properties.some((value) => _core.types.isObjectProperty(value, {
	    computed: false,
	    shorthand: false
	  }) && (_core.types.isIdentifier(value.key, {
	    name: "__proto__"
	  }) || _core.types.isStringLiteral(value.key, {
	    value: "__proto__"
	  })));
	}
	function createPlugin$1({
	  name,
	  development
	}) {
	  return (0, _helperPluginUtils.declare)((_, options) => {
	    const {
	      pure: PURE_ANNOTATION,
	      throwIfNamespace = true,
	      filter,
	      runtime: RUNTIME_DEFAULT = development ? "automatic" : "classic",
	      importSource: IMPORT_SOURCE_DEFAULT = DEFAULT.importSource,
	      pragma: PRAGMA_DEFAULT = DEFAULT.pragma,
	      pragmaFrag: PRAGMA_FRAG_DEFAULT = DEFAULT.pragmaFrag
	    } = options;
	    {
	      var {
	        useSpread = false,
	        useBuiltIns = false
	      } = options;
	      if (RUNTIME_DEFAULT === "classic") {
	        if (typeof useSpread !== "boolean") {
	          throw new Error("transform-react-jsx currently only accepts a boolean option for useSpread (defaults to false)");
	        }
	        if (typeof useBuiltIns !== "boolean") {
	          throw new Error("transform-react-jsx currently only accepts a boolean option for useBuiltIns (defaults to false)");
	        }
	        if (useSpread && useBuiltIns) {
	          throw new Error("transform-react-jsx currently only accepts useBuiltIns or useSpread but not both");
	        }
	      }
	    }
	    const injectMetaPropertiesVisitor = {
	      JSXOpeningElement(path, state) {
	        const attributes = [];
	        if (isThisAllowed(path.scope)) {
	          attributes.push(_core.types.jsxAttribute(_core.types.jsxIdentifier("__self"), _core.types.jsxExpressionContainer(_core.types.thisExpression())));
	        }
	        attributes.push(_core.types.jsxAttribute(_core.types.jsxIdentifier("__source"), _core.types.jsxExpressionContainer(makeSource(path, state))));
	        path.pushContainer("attributes", attributes);
	      }
	    };
	    return {
	      name,
	      inherits: _pluginSyntaxJsx.default,
	      visitor: {
	        JSXNamespacedName(path) {
	          if (throwIfNamespace) {
	            throw path.buildCodeFrameError(`Namespace tags are not supported by default. React's JSX doesn't support namespace tags. You can set \`throwIfNamespace: false\` to bypass this warning.`);
	          }
	        },
	        JSXSpreadChild(path) {
	          throw path.buildCodeFrameError("Spread children are not supported in React.");
	        },
	        Program: {
	          enter(path, state) {
	            const {
	              file
	            } = state;
	            let runtime = RUNTIME_DEFAULT;
	            let source = IMPORT_SOURCE_DEFAULT;
	            let pragma = PRAGMA_DEFAULT;
	            let pragmaFrag = PRAGMA_FRAG_DEFAULT;
	            let sourceSet = !!options.importSource;
	            let pragmaSet = !!options.pragma;
	            let pragmaFragSet = !!options.pragmaFrag;
	            if (file.ast.comments) {
	              for (const comment of file.ast.comments) {
	                const sourceMatches = JSX_SOURCE_ANNOTATION_REGEX.exec(comment.value);
	                if (sourceMatches) {
	                  source = sourceMatches[1];
	                  sourceSet = true;
	                }
	                const runtimeMatches = JSX_RUNTIME_ANNOTATION_REGEX.exec(comment.value);
	                if (runtimeMatches) {
	                  runtime = runtimeMatches[1];
	                }
	                const jsxMatches = JSX_ANNOTATION_REGEX.exec(comment.value);
	                if (jsxMatches) {
	                  pragma = jsxMatches[1];
	                  pragmaSet = true;
	                }
	                const jsxFragMatches = JSX_FRAG_ANNOTATION_REGEX.exec(comment.value);
	                if (jsxFragMatches) {
	                  pragmaFrag = jsxFragMatches[1];
	                  pragmaFragSet = true;
	                }
	              }
	            }
	            set(state, "runtime", runtime);
	            if (runtime === "classic") {
	              if (sourceSet) {
	                throw path.buildCodeFrameError(`importSource cannot be set when runtime is classic.`);
	              }
	              const createElement = toMemberExpression(pragma);
	              const fragment = toMemberExpression(pragmaFrag);
	              set(state, "id/createElement", () => _core.types.cloneNode(createElement));
	              set(state, "id/fragment", () => _core.types.cloneNode(fragment));
	              set(state, "defaultPure", pragma === DEFAULT.pragma);
	            } else if (runtime === "automatic") {
	              if (pragmaSet || pragmaFragSet) {
	                throw path.buildCodeFrameError(`pragma and pragmaFrag cannot be set when runtime is automatic.`);
	              }
	              const define = (name2, id) => set(state, name2, createImportLazily(state, path, id, source));
	              define("id/jsx", development ? "jsxDEV" : "jsx");
	              define("id/jsxs", development ? "jsxDEV" : "jsxs");
	              define("id/createElement", "createElement");
	              define("id/fragment", "Fragment");
	              set(state, "defaultPure", source === DEFAULT.importSource);
	            } else {
	              throw path.buildCodeFrameError(`Runtime must be either "classic" or "automatic".`);
	            }
	            if (development) {
	              path.traverse(injectMetaPropertiesVisitor, state);
	            }
	          }
	        },
	        JSXFragment: {
	          exit(path, file) {
	            let callExpr;
	            if (get(file, "runtime") === "classic") {
	              callExpr = buildCreateElementFragmentCall(path, file);
	            } else {
	              callExpr = buildJSXFragmentCall(path, file);
	            }
	            path.replaceWith(_core.types.inherits(callExpr, path.node));
	          }
	        },
	        JSXElement: {
	          exit(path, file) {
	            let callExpr;
	            if (get(file, "runtime") === "classic" || shouldUseCreateElement(path)) {
	              callExpr = buildCreateElementCall(path, file);
	            } else {
	              callExpr = buildJSXElementCall(path, file);
	            }
	            path.replaceWith(_core.types.inherits(callExpr, path.node));
	          }
	        },
	        JSXAttribute(path) {
	          if (_core.types.isJSXElement(path.node.value)) {
	            path.node.value = _core.types.jsxExpressionContainer(path.node.value);
	          }
	        }
	      }
	    };
	    function isDerivedClass(classPath) {
	      return classPath.node.superClass !== null;
	    }
	    function isThisAllowed(scope) {
	      do {
	        const {
	          path
	        } = scope;
	        if (path.isFunctionParent() && !path.isArrowFunctionExpression()) {
	          if (!path.isMethod()) {
	            return true;
	          }
	          if (path.node.kind !== "constructor") {
	            return true;
	          }
	          return !isDerivedClass(path.parentPath.parentPath);
	        }
	        if (path.isTSModuleBlock()) {
	          return false;
	        }
	      } while (scope = scope.parent);
	      return true;
	    }
	    function call(pass, name2, args) {
	      const node = _core.types.callExpression(get(pass, `id/${name2}`)(), args);
	      if (PURE_ANNOTATION != null ? PURE_ANNOTATION : get(pass, "defaultPure")) (0, _helperAnnotateAsPure.default)(node);
	      return node;
	    }
	    function shouldUseCreateElement(path) {
	      const openingPath = path.get("openingElement");
	      const attributes = openingPath.node.attributes;
	      let seenPropsSpread = false;
	      for (let i = 0; i < attributes.length; i++) {
	        const attr = attributes[i];
	        if (seenPropsSpread && _core.types.isJSXAttribute(attr) && attr.name.name === "key") {
	          return true;
	        } else if (_core.types.isJSXSpreadAttribute(attr)) {
	          seenPropsSpread = true;
	        }
	      }
	      return false;
	    }
	    function convertJSXIdentifier(node, parent) {
	      if (_core.types.isJSXIdentifier(node)) {
	        if (node.name === "this" && _core.types.isReferenced(node, parent)) {
	          return _core.types.thisExpression();
	        } else if (_core.types.isValidIdentifier(node.name, false)) {
	          node.type = "Identifier";
	          return node;
	        } else {
	          return _core.types.stringLiteral(node.name);
	        }
	      } else if (_core.types.isJSXMemberExpression(node)) {
	        return _core.types.memberExpression(convertJSXIdentifier(node.object, node), convertJSXIdentifier(node.property, node));
	      } else if (_core.types.isJSXNamespacedName(node)) {
	        return _core.types.stringLiteral(`${node.namespace.name}:${node.name.name}`);
	      }
	      return node;
	    }
	    function convertAttributeValue(node) {
	      if (_core.types.isJSXExpressionContainer(node)) {
	        return node.expression;
	      } else {
	        return node;
	      }
	    }
	    function accumulateAttribute(array, attribute) {
	      if (_core.types.isJSXSpreadAttribute(attribute.node)) {
	        const arg = attribute.node.argument;
	        if (_core.types.isObjectExpression(arg) && !hasProto(arg)) {
	          array.push(...arg.properties);
	        } else {
	          array.push(_core.types.spreadElement(arg));
	        }
	        return array;
	      }
	      const value = convertAttributeValue(attribute.node.name.name !== "key" ? attribute.node.value || _core.types.booleanLiteral(true) : attribute.node.value);
	      if (attribute.node.name.name === "key" && value === null) {
	        throw attribute.buildCodeFrameError('Please provide an explicit key value. Using "key" as a shorthand for "key={true}" is not allowed.');
	      }
	      if (_core.types.isStringLiteral(value) && !_core.types.isJSXExpressionContainer(attribute.node.value)) {
	        var _value$extra;
	        value.value = value.value.replace(/\n\s+/g, " ");
	        (_value$extra = value.extra) == null || delete _value$extra.raw;
	      }
	      if (_core.types.isJSXNamespacedName(attribute.node.name)) {
	        attribute.node.name = _core.types.stringLiteral(attribute.node.name.namespace.name + ":" + attribute.node.name.name.name);
	      } else if (_core.types.isValidIdentifier(attribute.node.name.name, false)) {
	        attribute.node.name.type = "Identifier";
	      } else {
	        attribute.node.name = _core.types.stringLiteral(attribute.node.name.name);
	      }
	      array.push(_core.types.inherits(_core.types.objectProperty(attribute.node.name, value), attribute.node));
	      return array;
	    }
	    function buildChildrenProperty(children) {
	      let childrenNode;
	      if (children.length === 1) {
	        childrenNode = children[0];
	      } else if (children.length > 1) {
	        childrenNode = _core.types.arrayExpression(children);
	      } else {
	        return void 0;
	      }
	      return _core.types.objectProperty(_core.types.identifier("children"), childrenNode);
	    }
	    function buildJSXElementCall(path, file) {
	      const openingPath = path.get("openingElement");
	      const args = [getTag(openingPath)];
	      const attribsArray = [];
	      const extracted = /* @__PURE__ */ Object.create(null);
	      for (const attr of openingPath.get("attributes")) {
	        if (attr.isJSXAttribute() && _core.types.isJSXIdentifier(attr.node.name)) {
	          const {
	            name: name2
	          } = attr.node.name;
	          switch (name2) {
	            case "__source":
	            case "__self":
	              if (extracted[name2]) throw sourceSelfError(path, name2);
	            case "key": {
	              const keyValue = convertAttributeValue(attr.node.value);
	              if (keyValue === null) {
	                throw attr.buildCodeFrameError('Please provide an explicit key value. Using "key" as a shorthand for "key={true}" is not allowed.');
	              }
	              extracted[name2] = keyValue;
	              break;
	            }
	            default:
	              attribsArray.push(attr);
	          }
	        } else {
	          attribsArray.push(attr);
	        }
	      }
	      const children = _core.types.react.buildChildren(path.node);
	      let attribs;
	      if (attribsArray.length || children.length) {
	        attribs = buildJSXOpeningElementAttributes(attribsArray, children);
	      } else {
	        attribs = _core.types.objectExpression([]);
	      }
	      args.push(attribs);
	      if (development) {
	        var _extracted$key;
	        args.push((_extracted$key = extracted.key) != null ? _extracted$key : path.scope.buildUndefinedNode(), _core.types.booleanLiteral(children.length > 1));
	        if (extracted.__source) {
	          args.push(extracted.__source);
	          if (extracted.__self) args.push(extracted.__self);
	        } else if (extracted.__self) {
	          args.push(path.scope.buildUndefinedNode(), extracted.__self);
	        }
	      } else if (extracted.key !== void 0) {
	        args.push(extracted.key);
	      }
	      return call(file, children.length > 1 ? "jsxs" : "jsx", args);
	    }
	    function buildJSXOpeningElementAttributes(attribs, children) {
	      const props = attribs.reduce(accumulateAttribute, []);
	      if ((children == null ? void 0 : children.length) > 0) {
	        props.push(buildChildrenProperty(children));
	      }
	      return _core.types.objectExpression(props);
	    }
	    function buildJSXFragmentCall(path, file) {
	      const args = [get(file, "id/fragment")()];
	      const children = _core.types.react.buildChildren(path.node);
	      args.push(_core.types.objectExpression(children.length > 0 ? [buildChildrenProperty(children)] : []));
	      if (development) {
	        args.push(path.scope.buildUndefinedNode(), _core.types.booleanLiteral(children.length > 1));
	      }
	      return call(file, children.length > 1 ? "jsxs" : "jsx", args);
	    }
	    function buildCreateElementFragmentCall(path, file) {
	      if (filter && !filter(path.node, file)) return;
	      return call(file, "createElement", [get(file, "id/fragment")(), _core.types.nullLiteral(), ..._core.types.react.buildChildren(path.node)]);
	    }
	    function buildCreateElementCall(path, file) {
	      const openingPath = path.get("openingElement");
	      return call(file, "createElement", [getTag(openingPath), buildCreateElementOpeningElementAttributes(file, path, openingPath.get("attributes")), ..._core.types.react.buildChildren(path.node)]);
	    }
	    function getTag(openingPath) {
	      const tagExpr = convertJSXIdentifier(openingPath.node.name, openingPath.node);
	      let tagName;
	      if (_core.types.isIdentifier(tagExpr)) {
	        tagName = tagExpr.name;
	      } else if (_core.types.isStringLiteral(tagExpr)) {
	        tagName = tagExpr.value;
	      }
	      if (_core.types.react.isCompatTag(tagName)) {
	        return _core.types.stringLiteral(tagName);
	      } else {
	        return tagExpr;
	      }
	    }
	    function buildCreateElementOpeningElementAttributes(file, path, attribs) {
	      const runtime = get(file, "runtime");
	      {
	        if (runtime !== "automatic") {
	          const objs = [];
	          const props2 = attribs.reduce(accumulateAttribute, []);
	          if (!useSpread) {
	            let start = 0;
	            props2.forEach((prop, i) => {
	              if (_core.types.isSpreadElement(prop)) {
	                if (i > start) {
	                  objs.push(_core.types.objectExpression(props2.slice(start, i)));
	                }
	                objs.push(prop.argument);
	                start = i + 1;
	              }
	            });
	            if (props2.length > start) {
	              objs.push(_core.types.objectExpression(props2.slice(start)));
	            }
	          } else if (props2.length) {
	            objs.push(_core.types.objectExpression(props2));
	          }
	          if (!objs.length) {
	            return _core.types.nullLiteral();
	          }
	          if (objs.length === 1) {
	            if (!(_core.types.isSpreadElement(props2[0]) && _core.types.isObjectExpression(props2[0].argument))) {
	              return objs[0];
	            }
	          }
	          if (!_core.types.isObjectExpression(objs[0])) {
	            objs.unshift(_core.types.objectExpression([]));
	          }
	          const helper = useBuiltIns ? _core.types.memberExpression(_core.types.identifier("Object"), _core.types.identifier("assign")) : file.addHelper("extends");
	          return _core.types.callExpression(helper, objs);
	        }
	      }
	      const props = [];
	      const found = /* @__PURE__ */ Object.create(null);
	      for (const attr of attribs) {
	        const {
	          node
	        } = attr;
	        const name2 = _core.types.isJSXAttribute(node) && _core.types.isJSXIdentifier(node.name) && node.name.name;
	        if (runtime === "automatic" && (name2 === "__source" || name2 === "__self")) {
	          if (found[name2]) throw sourceSelfError(path, name2);
	          found[name2] = true;
	        }
	        accumulateAttribute(props, attr);
	      }
	      return props.length === 1 && _core.types.isSpreadElement(props[0]) && !_core.types.isObjectExpression(props[0].argument) ? props[0].argument : props.length > 0 ? _core.types.objectExpression(props) : _core.types.nullLiteral();
	    }
	  });
	  function getSource(source, importName) {
	    switch (importName) {
	      case "Fragment":
	        return `${source}/${development ? "jsx-dev-runtime" : "jsx-runtime"}`;
	      case "jsxDEV":
	        return `${source}/jsx-dev-runtime`;
	      case "jsx":
	      case "jsxs":
	        return `${source}/jsx-runtime`;
	      case "createElement":
	        return source;
	    }
	  }
	  function createImportLazily(pass, path, importName, source) {
	    return () => {
	      const actualSource = getSource(source, importName);
	      if ((0, _helperModuleImports.isModule)(path)) {
	        let reference = get(pass, `imports/${importName}`);
	        if (reference) return _core.types.cloneNode(reference);
	        reference = (0, _helperModuleImports.addNamed)(path, importName, actualSource, {
	          importedInterop: "uncompiled",
	          importPosition: "after"
	        });
	        set(pass, `imports/${importName}`, reference);
	        return reference;
	      } else {
	        let reference = get(pass, `requires/${actualSource}`);
	        if (reference) {
	          reference = _core.types.cloneNode(reference);
	        } else {
	          reference = (0, _helperModuleImports.addNamespace)(path, actualSource, {
	            importedInterop: "uncompiled"
	          });
	          set(pass, `requires/${actualSource}`, reference);
	        }
	        return _core.types.memberExpression(reference, _core.types.identifier(importName));
	      }
	    };
	  }
	}
	function toMemberExpression(id) {
	  return id.split(".").map((name) => _core.types.identifier(name)).reduce((object, property) => _core.types.memberExpression(object, property));
	}
	function makeSource(path, state) {
	  const location = path.node.loc;
	  if (!location) {
	    return path.scope.buildUndefinedNode();
	  }
	  if (!state.fileNameIdentifier) {
	    const {
	      filename = ""
	    } = state;
	    const fileNameIdentifier = path.scope.generateUidIdentifier("_jsxFileName");
	    path.scope.getProgramParent().push({
	      id: fileNameIdentifier,
	      init: _core.types.stringLiteral(filename)
	    });
	    state.fileNameIdentifier = fileNameIdentifier;
	  }
	  return makeTrace(_core.types.cloneNode(state.fileNameIdentifier), location.start.line, location.start.column);
	}
	function makeTrace(fileNameIdentifier, lineNumber, column0Based) {
	  const fileLineLiteral = lineNumber != null ? _core.types.numericLiteral(lineNumber) : _core.types.nullLiteral();
	  const fileColumnLiteral = column0Based != null ? _core.types.numericLiteral(column0Based + 1) : _core.types.nullLiteral();
	  return _core.template.expression.ast`{
    fileName: ${fileNameIdentifier},
    lineNumber: ${fileLineLiteral},
    columnNumber: ${fileColumnLiteral},
  }`;
	}
	function sourceSelfError(path, name) {
	  const pluginName = `transform-react-jsx-${name.slice(2)}`;
	  return path.buildCodeFrameError(`Duplicate ${name} prop found. You are most likely using the deprecated ${pluginName} Babel plugin. Both __source and __self are automatically set when using the automatic runtime. Please remove transform-react-jsx-source and transform-react-jsx-self from your Babel config.`);
	}
	return createPlugin;
}

var hasRequiredLib$c;

function requireLib$c () {
	if (hasRequiredLib$c) return lib$c;
	hasRequiredLib$c = 1;
	Object.defineProperty(lib$c, "__esModule", {
	  value: true
	});
	lib$c.default = void 0;
	var _createPlugin = requireCreatePlugin();
	lib$c.default = (0, _createPlugin.default)({
	  name: "transform-react-jsx",
	  development: false
	});
	return lib$c;
}

var lib$a = {};

var development = {};

var hasRequiredDevelopment;

function requireDevelopment () {
	if (hasRequiredDevelopment) return development;
	hasRequiredDevelopment = 1;
	Object.defineProperty(development, "__esModule", {
	  value: true
	});
	development.default = void 0;
	var _createPlugin = requireCreatePlugin();
	development.default = (0, _createPlugin.default)({
	  name: "transform-react-jsx/development",
	  development: true
	});
	return development;
}

var hasRequiredLib$b;

function requireLib$b () {
	if (hasRequiredLib$b) return lib$a;
	hasRequiredLib$b = 1;
	Object.defineProperty(lib$a, "__esModule", {
	  value: true
	});
	lib$a.default = void 0;
	var _development = requireDevelopment();
	lib$a.default = _development.default;
	return lib$a;
}

var lib$9 = {};

var hasRequiredLib$a;

function requireLib$a () {
	if (hasRequiredLib$a) return lib$9;
	hasRequiredLib$a = 1;
	Object.defineProperty(lib$9, "__esModule", {
	  value: true
	});
	lib$9.default = void 0;
	var _helperPluginUtils = index.requireLib();
	var _path = require$$0$1;
	var _core = require$$0;
	lib$9.default = (0, _helperPluginUtils.declare)((api) => {
	  api.assertVersion(7);
	  function addDisplayName(id, call) {
	    const props = call.arguments[0].properties;
	    let safe = true;
	    for (let i = 0; i < props.length; i++) {
	      const prop = props[i];
	      if (_core.types.isSpreadElement(prop)) {
	        continue;
	      }
	      const key = _core.types.toComputedKey(prop);
	      if (_core.types.isStringLiteral(key, {
	        value: "displayName"
	      })) {
	        safe = false;
	        break;
	      }
	    }
	    if (safe) {
	      props.unshift(_core.types.objectProperty(_core.types.identifier("displayName"), _core.types.stringLiteral(id)));
	    }
	  }
	  const isCreateClassCallExpression = _core.types.buildMatchMemberExpression("React.createClass");
	  const isCreateClassAddon = (callee) => _core.types.isIdentifier(callee, {
	    name: "createReactClass"
	  });
	  function isCreateClass(node) {
	    if (!node || !_core.types.isCallExpression(node)) return false;
	    if (!isCreateClassCallExpression(node.callee) && !isCreateClassAddon(node.callee)) {
	      return false;
	    }
	    const args = node.arguments;
	    if (args.length !== 1) return false;
	    const first = args[0];
	    if (!_core.types.isObjectExpression(first)) return false;
	    return true;
	  }
	  return {
	    name: "transform-react-display-name",
	    visitor: {
	      ExportDefaultDeclaration({
	        node
	      }, state) {
	        if (isCreateClass(node.declaration)) {
	          const filename = state.filename || "unknown";
	          let displayName = _path.basename(filename, _path.extname(filename));
	          if (displayName === "index") {
	            displayName = _path.basename(_path.dirname(filename));
	          }
	          addDisplayName(displayName, node.declaration);
	        }
	      },
	      CallExpression(path) {
	        const {
	          node
	        } = path;
	        if (!isCreateClass(node)) return;
	        let id;
	        path.find(function(path2) {
	          if (path2.isAssignmentExpression()) {
	            id = path2.node.left;
	          } else if (path2.isObjectProperty()) {
	            id = path2.node.key;
	          } else if (path2.isVariableDeclarator()) {
	            id = path2.node.id;
	          } else if (path2.isStatement()) {
	            return true;
	          }
	          if (id) return true;
	        });
	        if (!id) return;
	        if (_core.types.isMemberExpression(id)) {
	          id = id.property;
	        }
	        if (_core.types.isIdentifier(id)) {
	          addDisplayName(id.name, node);
	        }
	      }
	    }
	  };
	});
	return lib$9;
}

var lib$8 = {};

var hasRequiredLib$9;

function requireLib$9 () {
	if (hasRequiredLib$9) return lib$8;
	hasRequiredLib$9 = 1;
	Object.defineProperty(lib$8, "__esModule", {
	  value: true
	});
	lib$8.default = void 0;
	var _helperPluginUtils = index.requireLib();
	var _helperAnnotateAsPure = index.requireLib$2();
	var _core = require$$0;
	const PURE_CALLS = [["react", /* @__PURE__ */ new Set(["cloneElement", "createContext", "createElement", "createFactory", "createRef", "forwardRef", "isValidElement", "memo", "lazy"])], ["react-dom", /* @__PURE__ */ new Set(["createPortal"])]];
	lib$8.default = (0, _helperPluginUtils.declare)((api) => {
	  api.assertVersion(7);
	  return {
	    name: "transform-react-pure-annotations",
	    visitor: {
	      CallExpression(path) {
	        if (isReactCall(path)) {
	          (0, _helperAnnotateAsPure.default)(path);
	        }
	      }
	    }
	  };
	});
	function isReactCall(path) {
	  const calleePath = path.get("callee");
	  if (!calleePath.isMemberExpression()) {
	    for (const [module, methods] of PURE_CALLS) {
	      for (const method of methods) {
	        if (calleePath.referencesImport(module, method)) {
	          return true;
	        }
	      }
	    }
	    return false;
	  }
	  const object = calleePath.get("object");
	  const callee = calleePath.node;
	  if (!callee.computed && _core.types.isIdentifier(callee.property)) {
	    const propertyName = callee.property.name;
	    for (const [module, methods] of PURE_CALLS) {
	      if (object.referencesImport(module, "default") || object.referencesImport(module, "*")) {
	        return methods.has(propertyName);
	      }
	    }
	  }
	  return false;
	}
	return lib$8;
}

var hasRequiredLib$8;

function requireLib$8 () {
	if (hasRequiredLib$8) return lib$d;
	hasRequiredLib$8 = 1;
	Object.defineProperty(lib$d, "__esModule", { value: true });
	var helperPluginUtils = index.requireLib();
	var transformReactJSX = requireLib$c();
	var transformReactJSXDevelopment = requireLib$b();
	var transformReactDisplayName = requireLib$a();
	var transformReactPure = requireLib$9();
	var helperValidatorOption = index.requireLib$3();
	function _interopDefault(e) {
	  return e && e.__esModule ? e : { default: e };
	}
	var transformReactJSX__default = /* @__PURE__ */ _interopDefault(transformReactJSX);
	var transformReactJSXDevelopment__default = /* @__PURE__ */ _interopDefault(transformReactJSXDevelopment);
	var transformReactDisplayName__default = /* @__PURE__ */ _interopDefault(transformReactDisplayName);
	var transformReactPure__default = /* @__PURE__ */ _interopDefault(transformReactPure);
	new helperValidatorOption.OptionValidator("@babel/preset-react");
	function normalizeOptions(options = {}) {
	  {
	    let {
	      pragma,
	      pragmaFrag
	    } = options;
	    const {
	      pure,
	      throwIfNamespace = true,
	      runtime = "classic",
	      importSource,
	      useBuiltIns,
	      useSpread
	    } = options;
	    if (runtime === "classic") {
	      pragma = pragma || "React.createElement";
	      pragmaFrag = pragmaFrag || "React.Fragment";
	    }
	    const development = options.development == null ? void 0 : !!options.development;
	    return {
	      development,
	      importSource,
	      pragma,
	      pragmaFrag,
	      pure,
	      runtime,
	      throwIfNamespace,
	      useBuiltIns,
	      useSpread
	    };
	  }
	}
	var index$1 = helperPluginUtils.declarePreset((api, opts) => {
	  api.assertVersion(7);
	  const {
	    development = false,
	    importSource,
	    pragma,
	    pragmaFrag,
	    pure,
	    runtime,
	    throwIfNamespace
	  } = normalizeOptions(opts);
	  return {
	    plugins: [[development ? transformReactJSXDevelopment__default.default : transformReactJSX__default.default, {
	      importSource,
	      pragma,
	      pragmaFrag,
	      runtime,
	      throwIfNamespace,
	      pure,
	      useBuiltIns: !!opts.useBuiltIns,
	      useSpread: opts.useSpread
	    }], transformReactDisplayName__default.default, pure !== false && transformReactPure__default.default].filter(Boolean)
	  };
	});
	lib$d.default = index$1;
	return lib$d;
}

var libExports$a = requireLib$8();
var babelPresetReact = /*@__PURE__*/index.getDefaultExportFromCjs(libExports$a);

var lib$7 = {};

var lib$6 = {};

var lib$5 = {};

var hasRequiredLib$7;

function requireLib$7 () {
	if (hasRequiredLib$7) return lib$5;
	hasRequiredLib$7 = 1;
	Object.defineProperty(lib$5, "__esModule", {
	  value: true
	});
	lib$5.default = void 0;
	var _helperPluginUtils = index.requireLib();
	{
	  var removePlugin = function(plugins, name) {
	    const indices = [];
	    plugins.forEach((plugin, i) => {
	      const n = Array.isArray(plugin) ? plugin[0] : plugin;
	      if (n === name) {
	        indices.unshift(i);
	      }
	    });
	    for (const i of indices) {
	      plugins.splice(i, 1);
	    }
	  };
	}
	lib$5.default = (0, _helperPluginUtils.declare)((api, opts) => {
	  api.assertVersion(7);
	  const {
	    disallowAmbiguousJSXLike,
	    dts
	  } = opts;
	  {
	    var {
	      isTSX
	    } = opts;
	  }
	  return {
	    name: "syntax-typescript",
	    manipulateOptions(opts2, parserOpts) {
	      {
	        const {
	          plugins
	        } = parserOpts;
	        removePlugin(plugins, "flow");
	        removePlugin(plugins, "jsx");
	        {
	          plugins.push("objectRestSpread", "classProperties");
	        }
	        if (isTSX) {
	          plugins.push("jsx");
	        }
	      }
	      parserOpts.plugins.push(["typescript", {
	        disallowAmbiguousJSXLike,
	        dts
	      }]);
	    }
	  };
	});
	return lib$5;
}

var constEnum = {};

var _enum = {};

var hasRequired_enum;

function require_enum () {
	if (hasRequired_enum) return _enum;
	hasRequired_enum = 1;
	Object.defineProperty(_enum, "__esModule", {
	  value: true
	});
	_enum.default = transpileEnum;
	_enum.isSyntacticallyString = isSyntacticallyString;
	_enum.translateEnumValues = translateEnumValues;
	var _core = require$$0;
	var _assert = require$$0$2;
	var _helperAnnotateAsPure = index.requireLib$2();
	var _helperSkipTransparentExpressionWrappers = index.requireLib$4();
	const ENUMS = /* @__PURE__ */ new WeakMap();
	const buildEnumWrapper = _core.template.expression(`
    (function (ID) {
      ASSIGNMENTS;
      return ID;
    })(INIT)
  `);
	function transpileEnum(path, t) {
	  const {
	    node,
	    parentPath
	  } = path;
	  if (node.declare) {
	    path.remove();
	    return;
	  }
	  const name = node.id.name;
	  const {
	    fill,
	    data,
	    isPure
	  } = enumFill(path, t, node.id);
	  switch (parentPath.type) {
	    case "BlockStatement":
	    case "ExportNamedDeclaration":
	    case "Program": {
	      const isGlobal = t.isProgram(path.parent);
	      const isSeen = seen(parentPath);
	      let init = t.objectExpression([]);
	      if (isSeen || isGlobal) {
	        init = t.logicalExpression("||", t.cloneNode(fill.ID), init);
	      }
	      const enumIIFE = buildEnumWrapper(Object.assign({}, fill, {
	        INIT: init
	      }));
	      if (isPure) (0, _helperAnnotateAsPure.default)(enumIIFE);
	      if (isSeen) {
	        const toReplace = parentPath.isExportDeclaration() ? parentPath : path;
	        toReplace.replaceWith(t.expressionStatement(t.assignmentExpression("=", t.cloneNode(node.id), enumIIFE)));
	      } else {
	        path.scope.registerDeclaration(path.replaceWith(t.variableDeclaration(isGlobal ? "var" : "let", [t.variableDeclarator(node.id, enumIIFE)]))[0]);
	      }
	      ENUMS.set(path.scope.getBindingIdentifier(name), data);
	      break;
	    }
	    default:
	      throw new Error(`Unexpected enum parent '${path.parent.type}`);
	  }
	  function seen(parentPath2) {
	    if (parentPath2.isExportDeclaration()) {
	      return seen(parentPath2.parentPath);
	    }
	    if (parentPath2.getData(name)) {
	      return true;
	    } else {
	      parentPath2.setData(name, true);
	      return false;
	    }
	  }
	}
	const buildStringAssignment = _core.template.statement(`
  ENUM["NAME"] = VALUE;
`);
	const buildNumericAssignment = _core.template.statement(`
  ENUM[ENUM["NAME"] = VALUE] = "NAME";
`);
	const buildEnumMember = (isString, options) => (isString ? buildStringAssignment : buildNumericAssignment)(options);
	function enumFill(path, t, id) {
	  const {
	    enumValues,
	    data,
	    isPure
	  } = translateEnumValues(path, t);
	  const enumMembers = path.get("members");
	  const assignments = [];
	  for (let i = 0; i < enumMembers.length; i++) {
	    const [memberName, memberValue] = enumValues[i];
	    assignments.push(t.inheritsComments(buildEnumMember(isSyntacticallyString(memberValue), {
	      ENUM: t.cloneNode(id),
	      NAME: memberName,
	      VALUE: memberValue
	    }), enumMembers[i].node));
	  }
	  return {
	    fill: {
	      ID: t.cloneNode(id),
	      ASSIGNMENTS: assignments
	    },
	    data,
	    isPure
	  };
	}
	function isSyntacticallyString(expr) {
	  expr = (0, _helperSkipTransparentExpressionWrappers.skipTransparentExprWrapperNodes)(expr);
	  switch (expr.type) {
	    case "BinaryExpression": {
	      const left = expr.left;
	      const right = expr.right;
	      return expr.operator === "+" && (isSyntacticallyString(left) || isSyntacticallyString(right));
	    }
	    case "TemplateLiteral":
	    case "StringLiteral":
	      return true;
	  }
	  return false;
	}
	function ReferencedIdentifier(expr, state) {
	  const {
	    seen,
	    path,
	    t
	  } = state;
	  const name = expr.node.name;
	  if (seen.has(name)) {
	    {
	      for (let curScope = expr.scope; curScope !== path.scope; curScope = curScope.parent) {
	        if (curScope.hasOwnBinding(name)) {
	          return;
	        }
	      }
	    }
	    expr.replaceWith(t.memberExpression(t.cloneNode(path.node.id), t.cloneNode(expr.node)));
	    expr.skip();
	  }
	}
	const enumSelfReferenceVisitor = {
	  ReferencedIdentifier
	};
	function translateEnumValues(path, t) {
	  var _ENUMS$get;
	  const bindingIdentifier = path.scope.getBindingIdentifier(path.node.id.name);
	  const seen = (_ENUMS$get = ENUMS.get(bindingIdentifier)) != null ? _ENUMS$get : /* @__PURE__ */ new Map();
	  let constValue = -1;
	  let lastName;
	  let isPure = true;
	  const enumMembers = path.get("members");
	  const enumValues = enumMembers.map((memberPath) => {
	    const member = memberPath.node;
	    const name = t.isIdentifier(member.id) ? member.id.name : member.id.value;
	    const initializerPath = memberPath.get("initializer");
	    const initializer = member.initializer;
	    let value;
	    if (initializer) {
	      constValue = computeConstantValue(initializerPath, seen);
	      if (constValue !== void 0) {
	        seen.set(name, constValue);
	        _assert(typeof constValue === "number" || typeof constValue === "string");
	        if (constValue === Infinity || Number.isNaN(constValue)) {
	          value = t.identifier(String(constValue));
	        } else if (constValue === -Infinity) {
	          value = t.unaryExpression("-", t.identifier("Infinity"));
	        } else {
	          value = t.valueToNode(constValue);
	        }
	      } else {
	        isPure && (isPure = initializerPath.isPure());
	        if (initializerPath.isReferencedIdentifier()) {
	          ReferencedIdentifier(initializerPath, {
	            t,
	            seen,
	            path
	          });
	        } else {
	          initializerPath.traverse(enumSelfReferenceVisitor, {
	            t,
	            seen,
	            path
	          });
	        }
	        value = initializerPath.node;
	        seen.set(name, void 0);
	      }
	    } else if (typeof constValue === "number") {
	      constValue += 1;
	      value = t.numericLiteral(constValue);
	      seen.set(name, constValue);
	    } else if (typeof constValue === "string") {
	      throw path.buildCodeFrameError("Enum member must have initializer.");
	    } else {
	      const lastRef = t.memberExpression(t.cloneNode(path.node.id), t.stringLiteral(lastName), true);
	      value = t.binaryExpression("+", t.numericLiteral(1), lastRef);
	      seen.set(name, void 0);
	    }
	    lastName = name;
	    return [name, value];
	  });
	  return {
	    isPure,
	    data: seen,
	    enumValues
	  };
	}
	function computeConstantValue(path, prevMembers, seen = /* @__PURE__ */ new Set()) {
	  return evaluate(path);
	  function evaluate(path2) {
	    const expr = path2.node;
	    switch (expr.type) {
	      case "MemberExpression":
	        return evaluateRef(path2, prevMembers, seen);
	      case "StringLiteral":
	        return expr.value;
	      case "UnaryExpression":
	        return evalUnaryExpression(path2);
	      case "BinaryExpression":
	        return evalBinaryExpression(path2);
	      case "NumericLiteral":
	        return expr.value;
	      case "ParenthesizedExpression":
	        return evaluate(path2.get("expression"));
	      case "Identifier":
	        return evaluateRef(path2, prevMembers, seen);
	      case "TemplateLiteral": {
	        if (expr.quasis.length === 1) {
	          return expr.quasis[0].value.cooked;
	        }
	        const paths = path2.get("expressions");
	        const quasis = expr.quasis;
	        let str = "";
	        for (let i = 0; i < quasis.length; i++) {
	          str += quasis[i].value.cooked;
	          if (i + 1 < quasis.length) {
	            const value = evaluateRef(paths[i], prevMembers, seen);
	            if (value === void 0) return void 0;
	            str += value;
	          }
	        }
	        return str;
	      }
	      default:
	        return void 0;
	    }
	  }
	  function evaluateRef(path2, prevMembers2, seen2) {
	    if (path2.isMemberExpression()) {
	      const expr = path2.node;
	      const obj = expr.object;
	      const prop = expr.property;
	      if (!_core.types.isIdentifier(obj) || (expr.computed ? !_core.types.isStringLiteral(prop) : !_core.types.isIdentifier(prop))) {
	        return;
	      }
	      const bindingIdentifier = path2.scope.getBindingIdentifier(obj.name);
	      const data = ENUMS.get(bindingIdentifier);
	      if (!data) return;
	      return data.get(prop.computed ? prop.value : prop.name);
	    } else if (path2.isIdentifier()) {
	      const name = path2.node.name;
	      if (["Infinity", "NaN"].includes(name)) {
	        return Number(name);
	      }
	      let value = prevMembers2 == null ? void 0 : prevMembers2.get(name);
	      if (value !== void 0) {
	        return value;
	      }
	      if (prevMembers2 != null && prevMembers2.has(name)) {
	        return void 0;
	      }
	      if (seen2.has(path2.node)) return;
	      seen2.add(path2.node);
	      value = computeConstantValue(path2.resolve(), prevMembers2, seen2);
	      return value;
	    }
	  }
	  function evalUnaryExpression(path2) {
	    const value = evaluate(path2.get("argument"));
	    if (value === void 0) {
	      return void 0;
	    }
	    switch (path2.node.operator) {
	      case "+":
	        return value;
	      case "-":
	        return -value;
	      case "~":
	        return ~value;
	      default:
	        return void 0;
	    }
	  }
	  function evalBinaryExpression(path2) {
	    const left = evaluate(path2.get("left"));
	    if (left === void 0) {
	      return void 0;
	    }
	    const right = evaluate(path2.get("right"));
	    if (right === void 0) {
	      return void 0;
	    }
	    switch (path2.node.operator) {
	      case "|":
	        return left | right;
	      case "&":
	        return left & right;
	      case ">>":
	        return left >> right;
	      case ">>>":
	        return left >>> right;
	      case "<<":
	        return left << right;
	      case "^":
	        return left ^ right;
	      case "*":
	        return left * right;
	      case "/":
	        return left / right;
	      case "+":
	        return left + right;
	      case "-":
	        return left - right;
	      case "%":
	        return left % right;
	      case "**":
	        return Math.pow(left, right);
	      default:
	        return void 0;
	    }
	  }
	}
	return _enum;
}

var hasRequiredConstEnum;

function requireConstEnum () {
	if (hasRequiredConstEnum) return constEnum;
	hasRequiredConstEnum = 1;
	Object.defineProperty(constEnum, "__esModule", {
	  value: true
	});
	constEnum.EXPORTED_CONST_ENUMS_IN_NAMESPACE = void 0;
	constEnum.default = transpileConstEnum;
	var _enum = require_enum();
	const EXPORTED_CONST_ENUMS_IN_NAMESPACE = constEnum.EXPORTED_CONST_ENUMS_IN_NAMESPACE = /* @__PURE__ */ new WeakSet();
	function transpileConstEnum(path, t) {
	  const {
	    name
	  } = path.node.id;
	  const parentIsExport = path.parentPath.isExportNamedDeclaration();
	  let isExported = parentIsExport;
	  if (!isExported && t.isProgram(path.parent)) {
	    isExported = path.parent.body.some((stmt) => t.isExportNamedDeclaration(stmt) && stmt.exportKind !== "type" && !stmt.source && stmt.specifiers.some((spec) => t.isExportSpecifier(spec) && spec.exportKind !== "type" && spec.local.name === name));
	  }
	  const {
	    enumValues: entries
	  } = (0, _enum.translateEnumValues)(path, t);
	  if (isExported || EXPORTED_CONST_ENUMS_IN_NAMESPACE.has(path.node)) {
	    const obj = t.objectExpression(entries.map(([name2, value]) => t.objectProperty(t.isValidIdentifier(name2) ? t.identifier(name2) : t.stringLiteral(name2), value)));
	    if (path.scope.hasOwnBinding(name)) {
	      (parentIsExport ? path.parentPath : path).replaceWith(t.expressionStatement(t.callExpression(t.memberExpression(t.identifier("Object"), t.identifier("assign")), [path.node.id, obj])));
	    } else {
	      path.replaceWith(t.variableDeclaration("var", [t.variableDeclarator(path.node.id, obj)]));
	      path.scope.registerDeclaration(path);
	    }
	    return;
	  }
	  const entriesMap = new Map(entries);
	  path.scope.path.traverse({
	    Scope(path2) {
	      if (path2.scope.hasOwnBinding(name)) path2.skip();
	    },
	    MemberExpression(path2) {
	      if (!t.isIdentifier(path2.node.object, {
	        name
	      })) return;
	      let key;
	      if (path2.node.computed) {
	        if (t.isStringLiteral(path2.node.property)) {
	          key = path2.node.property.value;
	        } else {
	          return;
	        }
	      } else if (t.isIdentifier(path2.node.property)) {
	        key = path2.node.property.name;
	      } else {
	        return;
	      }
	      if (!entriesMap.has(key)) return;
	      path2.replaceWith(t.cloneNode(entriesMap.get(key)));
	    }
	  });
	  path.remove();
	}
	return constEnum;
}

var globalTypes = {};

var hasRequiredGlobalTypes;

function requireGlobalTypes () {
	if (hasRequiredGlobalTypes) return globalTypes;
	hasRequiredGlobalTypes = 1;
	Object.defineProperty(globalTypes, "__esModule", {
	  value: true
	});
	globalTypes.GLOBAL_TYPES = void 0;
	globalTypes.isGlobalType = isGlobalType;
	globalTypes.registerGlobalType = registerGlobalType;
	const GLOBAL_TYPES = globalTypes.GLOBAL_TYPES = /* @__PURE__ */ new WeakMap();
	function isGlobalType({
	  scope
	}, name) {
	  if (scope.hasBinding(name)) return false;
	  if (GLOBAL_TYPES.get(scope).has(name)) return true;
	  console.warn(`The exported identifier "${name}" is not declared in Babel's scope tracker
as a JavaScript value binding, and "@babel/plugin-transform-typescript"
never encountered it as a TypeScript type declaration.
It will be treated as a JavaScript value.

This problem is likely caused by another plugin injecting
"${name}" without registering it in the scope tracker. If you are the author
 of that plugin, please use "scope.registerDeclaration(declarationPath)".`);
	  return false;
	}
	function registerGlobalType(programScope, name) {
	  GLOBAL_TYPES.get(programScope).add(name);
	}
	return globalTypes;
}

var namespace = {};

var hasRequiredNamespace;

function requireNamespace () {
	if (hasRequiredNamespace) return namespace;
	hasRequiredNamespace = 1;
	Object.defineProperty(namespace, "__esModule", {
	  value: true
	});
	namespace.default = transpileNamespace;
	namespace.getFirstIdentifier = getFirstIdentifier;
	var _core = require$$0;
	var _globalTypes = requireGlobalTypes();
	var _constEnum = requireConstEnum();
	function getFirstIdentifier(node) {
	  if (_core.types.isIdentifier(node)) {
	    return node;
	  }
	  return getFirstIdentifier(node.left);
	}
	function transpileNamespace(path, allowNamespaces) {
	  if (path.node.declare || path.node.id.type === "StringLiteral") {
	    path.remove();
	    return;
	  }
	  if (!allowNamespaces) {
	    throw path.get("id").buildCodeFrameError("Namespace not marked type-only declare. Non-declarative namespaces are only supported experimentally in Babel. To enable and review caveats see: https://babeljs.io/docs/en/babel-plugin-transform-typescript");
	  }
	  const name = getFirstIdentifier(path.node.id).name;
	  const value = handleNested(path, path.node);
	  if (value === null) {
	    const program = path.findParent((p) => p.isProgram());
	    (0, _globalTypes.registerGlobalType)(program.scope, name);
	    path.remove();
	  } else if (path.scope.hasOwnBinding(name)) {
	    path.replaceWith(value);
	  } else {
	    path.scope.registerDeclaration(path.replaceWithMultiple([getDeclaration(name), value])[0]);
	  }
	}
	function getDeclaration(name) {
	  return _core.types.variableDeclaration("let", [_core.types.variableDeclarator(_core.types.identifier(name))]);
	}
	function getMemberExpression(name, itemName) {
	  return _core.types.memberExpression(_core.types.identifier(name), _core.types.identifier(itemName));
	}
	function handleVariableDeclaration(node, name, hub) {
	  if (node.kind !== "const") {
	    throw hub.file.buildCodeFrameError(node, "Namespaces exporting non-const are not supported by Babel. Change to const or see: https://babeljs.io/docs/en/babel-plugin-transform-typescript");
	  }
	  const {
	    declarations
	  } = node;
	  if (declarations.every((declarator) => _core.types.isIdentifier(declarator.id))) {
	    for (const declarator of declarations) {
	      declarator.init = _core.types.assignmentExpression("=", getMemberExpression(name, declarator.id.name), declarator.init);
	    }
	    return [node];
	  }
	  const bindingIdentifiers = _core.types.getBindingIdentifiers(node);
	  const assignments = [];
	  for (const idName in bindingIdentifiers) {
	    assignments.push(_core.types.assignmentExpression("=", getMemberExpression(name, idName), _core.types.cloneNode(bindingIdentifiers[idName])));
	  }
	  return [node, _core.types.expressionStatement(_core.types.sequenceExpression(assignments))];
	}
	function buildNestedAmbientModuleError(path, node) {
	  return path.hub.buildError(node, "Ambient modules cannot be nested in other modules or namespaces.", Error);
	}
	function handleNested(path, node, parentExport) {
	  const names = /* @__PURE__ */ new Set();
	  const realName = node.id;
	  const name = path.scope.generateUid(realName.name);
	  const body = node.body;
	  node.id;
	  let namespaceTopLevel;
	  {
	    namespaceTopLevel = _core.types.isTSModuleBlock(body) ? body.body : [_core.types.exportNamedDeclaration(body)];
	  }
	  let isEmpty = true;
	  for (let i = 0; i < namespaceTopLevel.length; i++) {
	    const subNode = namespaceTopLevel[i];
	    switch (subNode.type) {
	      case "TSModuleDeclaration": {
	        if (!_core.types.isIdentifier(subNode.id)) {
	          throw buildNestedAmbientModuleError(path, subNode);
	        }
	        const transformed = handleNested(path, subNode);
	        if (transformed !== null) {
	          isEmpty = false;
	          const moduleName = subNode.id.name;
	          if (names.has(moduleName)) {
	            namespaceTopLevel[i] = transformed;
	          } else {
	            names.add(moduleName);
	            namespaceTopLevel.splice(i++, 1, getDeclaration(moduleName), transformed);
	          }
	        }
	        continue;
	      }
	      case "TSEnumDeclaration":
	      case "FunctionDeclaration":
	      case "ClassDeclaration":
	        isEmpty = false;
	        names.add(subNode.id.name);
	        continue;
	      case "VariableDeclaration": {
	        isEmpty = false;
	        for (const name2 in _core.types.getBindingIdentifiers(subNode)) {
	          names.add(name2);
	        }
	        continue;
	      }
	      default:
	        isEmpty && (isEmpty = _core.types.isTypeScript(subNode));
	        continue;
	      case "ExportNamedDeclaration":
	    }
	    if ("declare" in subNode.declaration && subNode.declaration.declare) {
	      continue;
	    }
	    switch (subNode.declaration.type) {
	      case "TSEnumDeclaration":
	        _constEnum.EXPORTED_CONST_ENUMS_IN_NAMESPACE.add(subNode.declaration);
	      case "FunctionDeclaration":
	      case "ClassDeclaration": {
	        isEmpty = false;
	        const itemName = subNode.declaration.id.name;
	        names.add(itemName);
	        namespaceTopLevel.splice(i++, 1, subNode.declaration, _core.types.expressionStatement(_core.types.assignmentExpression("=", getMemberExpression(name, itemName), _core.types.identifier(itemName))));
	        break;
	      }
	      case "VariableDeclaration": {
	        isEmpty = false;
	        const nodes = handleVariableDeclaration(subNode.declaration, name, path.hub);
	        namespaceTopLevel.splice(i, nodes.length, ...nodes);
	        i += nodes.length - 1;
	        break;
	      }
	      case "TSModuleDeclaration": {
	        if (!_core.types.isIdentifier(subNode.declaration.id)) {
	          throw buildNestedAmbientModuleError(path, subNode.declaration);
	        }
	        const transformed = handleNested(path, subNode.declaration, _core.types.identifier(name));
	        if (transformed !== null) {
	          isEmpty = false;
	          const moduleName = subNode.declaration.id.name;
	          if (names.has(moduleName)) {
	            namespaceTopLevel[i] = transformed;
	          } else {
	            names.add(moduleName);
	            namespaceTopLevel.splice(i++, 1, getDeclaration(moduleName), transformed);
	          }
	        } else {
	          namespaceTopLevel.splice(i, 1);
	          i--;
	        }
	      }
	    }
	  }
	  if (isEmpty) return null;
	  let fallthroughValue = _core.types.objectExpression([]);
	  if (parentExport) {
	    const memberExpr = _core.types.memberExpression(parentExport, realName);
	    fallthroughValue = _core.template.expression.ast`
      ${_core.types.cloneNode(memberExpr)} ||
        (${_core.types.cloneNode(memberExpr)} = ${fallthroughValue})
    `;
	  }
	  return _core.template.statement.ast`
    (function (${_core.types.identifier(name)}) {
      ${namespaceTopLevel}
    })(${realName} || (${_core.types.cloneNode(realName)} = ${fallthroughValue}));
  `;
	}
	return namespace;
}

var hasRequiredLib$6;

function requireLib$6 () {
	if (hasRequiredLib$6) return lib$6;
	hasRequiredLib$6 = 1;
	Object.defineProperty(lib$6, "__esModule", {
	  value: true
	});
	lib$6.default = void 0;
	var _helperPluginUtils = index.requireLib();
	var _pluginSyntaxTypescript = requireLib$7();
	var _helperCreateClassFeaturesPlugin = index.requireLib$5();
	var _constEnum = requireConstEnum();
	var _enum = require_enum();
	var _globalTypes = requireGlobalTypes();
	var _namespace = requireNamespace();
	function isInType(path) {
	  switch (path.parent.type) {
	    case "TSTypeReference":
	    case "TSExpressionWithTypeArguments":
	    case "TSExpressionWithTypeArguments":
	    case "TSTypeQuery":
	      return true;
	    case "TSQualifiedName":
	      return path.parentPath.findParent((path2) => path2.type !== "TSQualifiedName").type !== "TSImportEqualsDeclaration";
	    case "ExportSpecifier":
	      return path.parent.exportKind === "type" || path.parentPath.parent.exportKind === "type";
	    default:
	      return false;
	  }
	}
	const NEEDS_EXPLICIT_ESM = /* @__PURE__ */ new WeakMap();
	const PARSED_PARAMS = /* @__PURE__ */ new WeakSet();
	function safeRemove(path) {
	  const ids = path.getBindingIdentifiers();
	  for (const name of Object.keys(ids)) {
	    const binding = path.scope.getBinding(name);
	    if (binding && binding.identifier === ids[name]) {
	      binding.scope.removeBinding(name);
	    }
	  }
	  path.opts.noScope = true;
	  path.remove();
	  path.opts.noScope = false;
	}
	function assertCjsTransformEnabled(path, pass, wrong, suggestion, extra = "") {
	  if (pass.file.get("@babel/plugin-transform-modules-*") !== "commonjs") {
	    throw path.buildCodeFrameError(`\`${wrong}\` is only supported when compiling modules to CommonJS.
Please consider using \`${suggestion}\`${extra}, or add @babel/plugin-transform-modules-commonjs to your Babel config.`);
	  }
	}
	lib$6.default = (0, _helperPluginUtils.declare)((api, opts) => {
	  const {
	    types: t,
	    template
	  } = api;
	  api.assertVersion(7);
	  const JSX_PRAGMA_REGEX = /\*?\s*@jsx((?:Frag)?)\s+(\S+)/;
	  const {
	    allowNamespaces = true,
	    jsxPragma = "React.createElement",
	    jsxPragmaFrag = "React.Fragment",
	    onlyRemoveTypeImports = false,
	    optimizeConstEnums = false
	  } = opts;
	  {
	    var {
	      allowDeclareFields = false
	    } = opts;
	  }
	  const classMemberVisitors = {
	    field(path) {
	      const {
	        node
	      } = path;
	      {
	        if (!allowDeclareFields && node.declare) {
	          throw path.buildCodeFrameError(`The 'declare' modifier is only allowed when the 'allowDeclareFields' option of @babel/plugin-transform-typescript or @babel/preset-typescript is enabled.`);
	        }
	      }
	      if (node.declare) {
	        if (node.value) {
	          throw path.buildCodeFrameError(`Fields with the 'declare' modifier cannot be initialized here, but only in the constructor`);
	        }
	        if (!node.decorators) {
	          path.remove();
	        }
	      } else if (node.definite) {
	        if (node.value) {
	          throw path.buildCodeFrameError(`Definitely assigned fields cannot be initialized here, but only in the constructor`);
	        }
	        {
	          if (!allowDeclareFields && !node.decorators && !t.isClassPrivateProperty(node)) {
	            path.remove();
	          }
	        }
	      } else if (node.abstract) {
	        path.remove();
	      } else {
	        if (!allowDeclareFields && !node.value && !node.decorators && !t.isClassPrivateProperty(node)) {
	          path.remove();
	        }
	      }
	      if (node.accessibility) node.accessibility = null;
	      if (node.abstract) node.abstract = null;
	      if (node.readonly) node.readonly = null;
	      if (node.optional) node.optional = null;
	      if (node.typeAnnotation) node.typeAnnotation = null;
	      if (node.definite) node.definite = null;
	      if (node.declare) node.declare = null;
	      if (node.override) node.override = null;
	    },
	    method({
	      node
	    }) {
	      if (node.accessibility) node.accessibility = null;
	      if (node.abstract) node.abstract = null;
	      if (node.optional) node.optional = null;
	      if (node.override) node.override = null;
	    },
	    constructor(path, classPath) {
	      if (path.node.accessibility) path.node.accessibility = null;
	      const assigns = [];
	      const {
	        scope
	      } = path;
	      for (const paramPath of path.get("params")) {
	        const param = paramPath.node;
	        if (param.type === "TSParameterProperty") {
	          const parameter = param.parameter;
	          if (PARSED_PARAMS.has(parameter)) continue;
	          PARSED_PARAMS.add(parameter);
	          let id;
	          if (t.isIdentifier(parameter)) {
	            id = parameter;
	          } else if (t.isAssignmentPattern(parameter) && t.isIdentifier(parameter.left)) {
	            id = parameter.left;
	          } else {
	            throw paramPath.buildCodeFrameError("Parameter properties can not be destructuring patterns.");
	          }
	          assigns.push(template.statement.ast`
              this.${t.cloneNode(id)} = ${t.cloneNode(id)}
            `);
	          paramPath.replaceWith(paramPath.get("parameter"));
	          scope.registerBinding("param", paramPath);
	        }
	      }
	      (0, _helperCreateClassFeaturesPlugin.injectInitialization)(classPath, path, assigns);
	    }
	  };
	  return {
	    name: "transform-typescript",
	    inherits: _pluginSyntaxTypescript.default,
	    visitor: {
	      Pattern: visitPattern,
	      Identifier: visitPattern,
	      RestElement: visitPattern,
	      Program: {
	        enter(path, state) {
	          const {
	            file
	          } = state;
	          let fileJsxPragma = null;
	          let fileJsxPragmaFrag = null;
	          const programScope = path.scope;
	          if (!_globalTypes.GLOBAL_TYPES.has(programScope)) {
	            _globalTypes.GLOBAL_TYPES.set(programScope, /* @__PURE__ */ new Set());
	          }
	          if (file.ast.comments) {
	            for (const comment of file.ast.comments) {
	              const jsxMatches = JSX_PRAGMA_REGEX.exec(comment.value);
	              if (jsxMatches) {
	                if (jsxMatches[1]) {
	                  fileJsxPragmaFrag = jsxMatches[2];
	                } else {
	                  fileJsxPragma = jsxMatches[2];
	                }
	              }
	            }
	          }
	          let pragmaImportName = fileJsxPragma || jsxPragma;
	          if (pragmaImportName) {
	            [pragmaImportName] = pragmaImportName.split(".");
	          }
	          let pragmaFragImportName = fileJsxPragmaFrag || jsxPragmaFrag;
	          if (pragmaFragImportName) {
	            [pragmaFragImportName] = pragmaFragImportName.split(".");
	          }
	          for (let stmt of path.get("body")) {
	            if (stmt.isImportDeclaration()) {
	              if (!NEEDS_EXPLICIT_ESM.has(state.file.ast.program)) {
	                NEEDS_EXPLICIT_ESM.set(state.file.ast.program, true);
	              }
	              if (stmt.node.importKind === "type") {
	                for (const specifier of stmt.node.specifiers) {
	                  (0, _globalTypes.registerGlobalType)(programScope, specifier.local.name);
	                }
	                stmt.remove();
	                continue;
	              }
	              const importsToRemove = /* @__PURE__ */ new Set();
	              const specifiersLength = stmt.node.specifiers.length;
	              const isAllSpecifiersElided = () => specifiersLength > 0 && specifiersLength === importsToRemove.size;
	              for (const specifier of stmt.node.specifiers) {
	                if (specifier.type === "ImportSpecifier" && specifier.importKind === "type") {
	                  (0, _globalTypes.registerGlobalType)(programScope, specifier.local.name);
	                  const binding = stmt.scope.getBinding(specifier.local.name);
	                  if (binding) {
	                    importsToRemove.add(binding.path);
	                  }
	                }
	              }
	              if (onlyRemoveTypeImports) {
	                NEEDS_EXPLICIT_ESM.set(path.node, false);
	              } else {
	                if (stmt.node.specifiers.length === 0) {
	                  NEEDS_EXPLICIT_ESM.set(path.node, false);
	                  continue;
	                }
	                for (const specifier of stmt.node.specifiers) {
	                  const binding = stmt.scope.getBinding(specifier.local.name);
	                  if (binding && !importsToRemove.has(binding.path)) {
	                    if (isImportTypeOnly({
	                      binding,
	                      programPath: path,
	                      pragmaImportName,
	                      pragmaFragImportName
	                    })) {
	                      importsToRemove.add(binding.path);
	                    } else {
	                      NEEDS_EXPLICIT_ESM.set(path.node, false);
	                    }
	                  }
	                }
	              }
	              if (isAllSpecifiersElided() && !onlyRemoveTypeImports) {
	                stmt.remove();
	              } else {
	                for (const importPath of importsToRemove) {
	                  importPath.remove();
	                }
	              }
	              continue;
	            }
	            if (!onlyRemoveTypeImports && stmt.isTSImportEqualsDeclaration()) {
	              const {
	                id
	              } = stmt.node;
	              const binding = stmt.scope.getBinding(id.name);
	              if (binding && !stmt.node.isExport && isImportTypeOnly({
	                binding,
	                programPath: path,
	                pragmaImportName,
	                pragmaFragImportName
	              })) {
	                stmt.remove();
	                continue;
	              }
	            }
	            if (stmt.isExportDeclaration()) {
	              stmt = stmt.get("declaration");
	            }
	            if (stmt.isVariableDeclaration({
	              declare: true
	            })) {
	              for (const name of Object.keys(stmt.getBindingIdentifiers())) {
	                (0, _globalTypes.registerGlobalType)(programScope, name);
	              }
	            } else if (stmt.isTSTypeAliasDeclaration() || stmt.isTSDeclareFunction() && stmt.get("id").isIdentifier() || stmt.isTSInterfaceDeclaration() || stmt.isClassDeclaration({
	              declare: true
	            }) || stmt.isTSEnumDeclaration({
	              declare: true
	            }) || stmt.isTSModuleDeclaration({
	              declare: true
	            }) && stmt.get("id").isIdentifier()) {
	              (0, _globalTypes.registerGlobalType)(programScope, stmt.node.id.name);
	            }
	          }
	        },
	        exit(path) {
	          if (path.node.sourceType === "module" && NEEDS_EXPLICIT_ESM.get(path.node)) {
	            path.pushContainer("body", t.exportNamedDeclaration());
	          }
	        }
	      },
	      ExportNamedDeclaration(path, state) {
	        if (!NEEDS_EXPLICIT_ESM.has(state.file.ast.program)) {
	          NEEDS_EXPLICIT_ESM.set(state.file.ast.program, true);
	        }
	        if (path.node.exportKind === "type") {
	          path.remove();
	          return;
	        }
	        if (path.node.source && path.node.specifiers.length > 0 && path.node.specifiers.every((specifier) => specifier.type === "ExportSpecifier" && specifier.exportKind === "type")) {
	          path.remove();
	          return;
	        }
	        if (!path.node.source && path.node.specifiers.length > 0 && path.node.specifiers.every((specifier) => t.isExportSpecifier(specifier) && (0, _globalTypes.isGlobalType)(path, specifier.local.name))) {
	          path.remove();
	          return;
	        }
	        if (t.isTSModuleDeclaration(path.node.declaration)) {
	          const namespace = path.node.declaration;
	          if (!t.isStringLiteral(namespace.id)) {
	            const id = (0, _namespace.getFirstIdentifier)(namespace.id);
	            if (path.scope.hasOwnBinding(id.name)) {
	              path.replaceWith(namespace);
	            } else {
	              const [newExport] = path.replaceWithMultiple([t.exportNamedDeclaration(t.variableDeclaration("let", [t.variableDeclarator(t.cloneNode(id))])), namespace]);
	              path.scope.registerDeclaration(newExport);
	            }
	          }
	        }
	        NEEDS_EXPLICIT_ESM.set(state.file.ast.program, false);
	      },
	      ExportAllDeclaration(path) {
	        if (path.node.exportKind === "type") path.remove();
	      },
	      ExportSpecifier(path) {
	        const parent = path.parent;
	        if (!parent.source && (0, _globalTypes.isGlobalType)(path, path.node.local.name) || path.node.exportKind === "type") {
	          path.remove();
	        }
	      },
	      ExportDefaultDeclaration(path, state) {
	        if (!NEEDS_EXPLICIT_ESM.has(state.file.ast.program)) {
	          NEEDS_EXPLICIT_ESM.set(state.file.ast.program, true);
	        }
	        if (t.isIdentifier(path.node.declaration) && (0, _globalTypes.isGlobalType)(path, path.node.declaration.name)) {
	          path.remove();
	          return;
	        }
	        NEEDS_EXPLICIT_ESM.set(state.file.ast.program, false);
	      },
	      TSDeclareFunction(path) {
	        safeRemove(path);
	      },
	      TSDeclareMethod(path) {
	        safeRemove(path);
	      },
	      VariableDeclaration(path) {
	        if (path.node.declare) {
	          safeRemove(path);
	        }
	      },
	      VariableDeclarator({
	        node
	      }) {
	        if (node.definite) node.definite = null;
	      },
	      TSIndexSignature(path) {
	        path.remove();
	      },
	      ClassDeclaration(path) {
	        const {
	          node
	        } = path;
	        if (node.declare) {
	          safeRemove(path);
	        }
	      },
	      Class(path) {
	        const {
	          node
	        } = path;
	        if (node.typeParameters) node.typeParameters = null;
	        {
	          if (node.superTypeParameters) node.superTypeParameters = null;
	        }
	        if (node.implements) node.implements = null;
	        if (node.abstract) node.abstract = null;
	        path.get("body.body").forEach((child) => {
	          if (child.isClassMethod() || child.isClassPrivateMethod()) {
	            if (child.node.kind === "constructor") {
	              classMemberVisitors.constructor(child, path);
	            } else {
	              classMemberVisitors.method(child);
	            }
	          } else if (child.isClassProperty() || child.isClassPrivateProperty() || child.isClassAccessorProperty()) {
	            classMemberVisitors.field(child);
	          }
	        });
	      },
	      Function(path) {
	        const {
	          node
	        } = path;
	        if (node.typeParameters) node.typeParameters = null;
	        if (node.returnType) node.returnType = null;
	        const params = node.params;
	        if (params.length > 0 && t.isIdentifier(params[0], {
	          name: "this"
	        })) {
	          params.shift();
	        }
	      },
	      TSModuleDeclaration(path) {
	        (0, _namespace.default)(path, allowNamespaces);
	      },
	      TSInterfaceDeclaration(path) {
	        path.remove();
	      },
	      TSTypeAliasDeclaration(path) {
	        path.remove();
	      },
	      TSEnumDeclaration(path) {
	        if (optimizeConstEnums && path.node.const) {
	          (0, _constEnum.default)(path, t);
	        } else {
	          (0, _enum.default)(path, t);
	        }
	      },
	      TSImportEqualsDeclaration(path, pass) {
	        const {
	          id,
	          moduleReference
	        } = path.node;
	        let init;
	        let varKind;
	        if (t.isTSExternalModuleReference(moduleReference)) {
	          assertCjsTransformEnabled(path, pass, `import ${id.name} = require(...);`, `import ${id.name} from '...';`, " alongside Typescript's --allowSyntheticDefaultImports option");
	          init = t.callExpression(t.identifier("require"), [moduleReference.expression]);
	          varKind = "const";
	        } else {
	          init = entityNameToExpr(moduleReference);
	          varKind = "var";
	        }
	        const newNode = t.variableDeclaration(varKind, [t.variableDeclarator(id, init)]);
	        {
	          path.replaceWith(path.node.isExport ? t.exportNamedDeclaration(newNode) : newNode);
	        }
	        path.scope.registerDeclaration(path);
	      },
	      TSExportAssignment(path, pass) {
	        assertCjsTransformEnabled(path, pass, `export = <value>;`, `export default <value>;`);
	        path.replaceWith(template.statement.ast`module.exports = ${path.node.expression}`);
	      },
	      TSTypeAssertion(path) {
	        path.replaceWith(path.node.expression);
	      },
	      [`TSAsExpression${t.tsSatisfiesExpression ? "|TSSatisfiesExpression" : ""}`](path) {
	        let {
	          node
	        } = path;
	        do {
	          node = node.expression;
	        } while (t.isTSAsExpression(node) || t.isTSSatisfiesExpression != null && t.isTSSatisfiesExpression(node));
	        path.replaceWith(node);
	      },
	      [api.types.tsInstantiationExpression ? "TSNonNullExpression|TSInstantiationExpression" : "TSNonNullExpression"](path) {
	        path.replaceWith(path.node.expression);
	      },
	      CallExpression(path) {
	        {
	          path.node.typeParameters = null;
	        }
	      },
	      OptionalCallExpression(path) {
	        {
	          path.node.typeParameters = null;
	        }
	      },
	      NewExpression(path) {
	        {
	          path.node.typeParameters = null;
	        }
	      },
	      JSXOpeningElement(path) {
	        {
	          path.node.typeParameters = null;
	        }
	      },
	      TaggedTemplateExpression(path) {
	        {
	          path.node.typeParameters = null;
	        }
	      }
	    }
	  };
	  function entityNameToExpr(node) {
	    if (t.isTSQualifiedName(node)) {
	      return t.memberExpression(entityNameToExpr(node.left), node.right);
	    }
	    return node;
	  }
	  function visitPattern({
	    node
	  }) {
	    if (node.typeAnnotation) node.typeAnnotation = null;
	    if (t.isIdentifier(node) && node.optional) node.optional = null;
	  }
	  function isImportTypeOnly({
	    binding,
	    programPath,
	    pragmaImportName,
	    pragmaFragImportName
	  }) {
	    for (const path of binding.referencePaths) {
	      if (!isInType(path)) {
	        return false;
	      }
	    }
	    if (binding.identifier.name !== pragmaImportName && binding.identifier.name !== pragmaFragImportName) {
	      return true;
	    }
	    let sourceFileHasJsx = false;
	    programPath.traverse({
	      "JSXElement|JSXFragment"(path) {
	        sourceFileHasJsx = true;
	        path.stop();
	      }
	    });
	    return !sourceFileHasJsx;
	  }
	});
	return lib$6;
}

var hasRequiredLib$5;

function requireLib$5 () {
	if (hasRequiredLib$5) return lib$7;
	hasRequiredLib$5 = 1;
	Object.defineProperty(lib$7, "__esModule", { value: true });
	var helperPluginUtils = index.requireLib();
	var transformTypeScript = requireLib$6();
	requireLib$d();
	var transformModulesCommonJS = index.requireLib$6();
	var helperValidatorOption = index.requireLib$3();
	function _interopDefault(e) {
	  return e && e.__esModule ? e : { default: e };
	}
	var transformTypeScript__default = /* @__PURE__ */ _interopDefault(transformTypeScript);
	var transformModulesCommonJS__default = /* @__PURE__ */ _interopDefault(transformModulesCommonJS);
	const v = new helperValidatorOption.OptionValidator("@babel/preset-typescript");
	function normalizeOptions(options = {}) {
	  let {
	    allowNamespaces = true,
	    jsxPragma,
	    onlyRemoveTypeImports
	  } = options;
	  const TopLevelOptions = {
	    ignoreExtensions: "ignoreExtensions",
	    disallowAmbiguousJSXLike: "disallowAmbiguousJSXLike",
	    jsxPragmaFrag: "jsxPragmaFrag",
	    optimizeConstEnums: "optimizeConstEnums",
	    rewriteImportExtensions: "rewriteImportExtensions",
	    allExtensions: "allExtensions",
	    isTSX: "isTSX"
	  };
	  const jsxPragmaFrag = v.validateStringOption(TopLevelOptions.jsxPragmaFrag, options.jsxPragmaFrag, "React.Fragment");
	  {
	    var allExtensions = v.validateBooleanOption(TopLevelOptions.allExtensions, options.allExtensions, false);
	    var isTSX = v.validateBooleanOption(TopLevelOptions.isTSX, options.isTSX, false);
	    if (isTSX) {
	      v.invariant(allExtensions, "isTSX:true requires allExtensions:true");
	    }
	  }
	  const ignoreExtensions = v.validateBooleanOption(TopLevelOptions.ignoreExtensions, options.ignoreExtensions, false);
	  const disallowAmbiguousJSXLike = v.validateBooleanOption(TopLevelOptions.disallowAmbiguousJSXLike, options.disallowAmbiguousJSXLike, false);
	  if (disallowAmbiguousJSXLike) {
	    {
	      v.invariant(allExtensions, "disallowAmbiguousJSXLike:true requires allExtensions:true");
	    }
	  }
	  const optimizeConstEnums = v.validateBooleanOption(TopLevelOptions.optimizeConstEnums, options.optimizeConstEnums, false);
	  const rewriteImportExtensions = v.validateBooleanOption(TopLevelOptions.rewriteImportExtensions, options.rewriteImportExtensions, false);
	  const normalized = {
	    ignoreExtensions,
	    allowNamespaces,
	    disallowAmbiguousJSXLike,
	    jsxPragma,
	    jsxPragmaFrag,
	    onlyRemoveTypeImports,
	    optimizeConstEnums,
	    rewriteImportExtensions
	  };
	  {
	    normalized.allExtensions = allExtensions;
	    normalized.isTSX = isTSX;
	  }
	  return normalized;
	}
	var pluginRewriteTSImports = helperPluginUtils.declare(function({
	  types: t,
	  template
	}) {
	  function maybeReplace(source, path, state) {
	    if (!source) return;
	    if (t.isStringLiteral(source)) {
	      if (/^\.\.?\//.test(source.value)) {
	        source.value = source.value.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
	          return tsx ? ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
	        });
	      }
	      return;
	    }
	    if (state.availableHelper("tsRewriteRelativeImportExtensions")) {
	      path.replaceWith(t.callExpression(state.addHelper("tsRewriteRelativeImportExtensions"), [source]));
	    } else {
	      path.replaceWith(template.expression.ast`(${source} + "").replace(/([\\/].*\.[mc]?)tsx?$/, "$1js")`);
	    }
	  }
	  return {
	    name: "preset-typescript/plugin-rewrite-ts-imports",
	    visitor: {
	      "ImportDeclaration|ExportAllDeclaration|ExportNamedDeclaration"(path, state) {
	        const node = path.node;
	        const kind = t.isImportDeclaration(node) ? node.importKind : node.exportKind;
	        if (kind === "value") {
	          maybeReplace(node.source, path.get("source"), state);
	        }
	      },
	      CallExpression(path, state) {
	        if (t.isImport(path.node.callee)) {
	          maybeReplace(path.node.arguments[0], path.get("arguments.0"), state);
	        }
	      },
	      ImportExpression(path, state) {
	        maybeReplace(path.node.source, path.get("source"), state);
	      }
	    }
	  };
	});
	var index$1 = helperPluginUtils.declarePreset((api, opts) => {
	  api.assertVersion(7);
	  const {
	    allExtensions,
	    ignoreExtensions,
	    allowNamespaces,
	    disallowAmbiguousJSXLike,
	    isTSX,
	    jsxPragma,
	    jsxPragmaFrag,
	    onlyRemoveTypeImports,
	    optimizeConstEnums,
	    rewriteImportExtensions
	  } = normalizeOptions(opts);
	  const pluginOptions = (disallowAmbiguousJSXLike2) => ({
	    allowDeclareFields: opts.allowDeclareFields,
	    allowNamespaces,
	    disallowAmbiguousJSXLike: disallowAmbiguousJSXLike2,
	    jsxPragma,
	    jsxPragmaFrag,
	    onlyRemoveTypeImports,
	    optimizeConstEnums
	  });
	  const getPlugins = (isTSX2, disallowAmbiguousJSXLike2) => {
	    {
	      return [[transformTypeScript__default.default, Object.assign({
	        isTSX: isTSX2
	      }, pluginOptions(disallowAmbiguousJSXLike2))]];
	    }
	  };
	  const disableExtensionDetect = allExtensions || ignoreExtensions;
	  return {
	    plugins: rewriteImportExtensions ? [pluginRewriteTSImports] : [],
	    overrides: disableExtensionDetect ? [{
	      plugins: getPlugins(isTSX, disallowAmbiguousJSXLike)
	    }] : [{
	      test: /\.ts$/,
	      plugins: getPlugins(false, false)
	    }, {
	      test: /\.mts$/,
	      sourceType: "module",
	      plugins: getPlugins(false, true)
	    }, {
	      test: /\.cts$/,
	      sourceType: "unambiguous",
	      plugins: [[transformModulesCommonJS__default.default, {
	        allowTopLevelThis: true
	      }], [transformTypeScript__default.default, pluginOptions(true)]]
	    }, {
	      test: /\.tsx$/,
	      plugins: getPlugins(true, false)
	    }]
	  };
	});
	lib$7.default = index$1;
	return lib$7;
}

var libExports$9 = requireLib$5();
var babelPresetTypescript = /*@__PURE__*/index.getDefaultExportFromCjs(libExports$9);

var lib$4 = {};

var lib$3 = {};

var hasRequiredLib$4;

function requireLib$4 () {
	if (hasRequiredLib$4) return lib$3;
	hasRequiredLib$4 = 1;
	Object.defineProperty(lib$3, "__esModule", {
	  value: true
	});
	lib$3.default = void 0;
	var _helperPluginUtils = index.requireLib();
	lib$3.default = (0, _helperPluginUtils.declare)((api, options) => {
	  api.assertVersion(7);
	  const {
	    all,
	    enums
	  } = options;
	  if (typeof all !== "boolean" && all !== void 0) {
	    throw new Error(".all must be a boolean, or undefined");
	  }
	  {
	    if (enums === false) {
	      console.warn("The .enums option has been removed and it's now always enabled.");
	    }
	  }
	  return {
	    name: "syntax-flow",
	    manipulateOptions(opts, parserOpts) {
	      {
	        if (parserOpts.plugins.some((p) => (Array.isArray(p) ? p[0] : p) === "typescript")) {
	          return;
	        }
	      }
	      {
	        parserOpts.plugins.push(["flow", {
	          all,
	          enums
	        }]);
	      }
	    }
	  };
	});
	return lib$3;
}

var hasRequiredLib$3;

function requireLib$3 () {
	if (hasRequiredLib$3) return lib$4;
	hasRequiredLib$3 = 1;
	Object.defineProperty(lib$4, "__esModule", {
	  value: true
	});
	lib$4.default = void 0;
	var _helperPluginUtils = index.requireLib();
	var _pluginSyntaxFlow = requireLib$4();
	var _core = require$$0;
	lib$4.default = (0, _helperPluginUtils.declare)((api, opts) => {
	  api.assertVersion(7);
	  const FLOW_DIRECTIVE = /@flow(?:\s+(?:strict(?:-local)?|weak))?|@noflow/;
	  let skipStrip = false;
	  const {
	    requireDirective = false
	  } = opts;
	  {
	    var {
	      allowDeclareFields = false
	    } = opts;
	  }
	  return {
	    name: "transform-flow-strip-types",
	    inherits: _pluginSyntaxFlow.default,
	    visitor: {
	      Program(path, {
	        file: {
	          ast: {
	            comments
	          }
	        }
	      }) {
	        skipStrip = false;
	        let directiveFound = false;
	        if (comments) {
	          for (const comment of comments) {
	            if (FLOW_DIRECTIVE.test(comment.value)) {
	              directiveFound = true;
	              comment.value = comment.value.replace(FLOW_DIRECTIVE, "");
	              if (!comment.value.replace(/\*/g, "").trim()) {
	                comment.ignore = true;
	              }
	            }
	          }
	        }
	        if (!directiveFound && requireDirective) {
	          skipStrip = true;
	        }
	      },
	      ImportDeclaration(path) {
	        if (skipStrip) return;
	        if (!path.node.specifiers.length) return;
	        let typeCount = 0;
	        path.node.specifiers.forEach(({
	          importKind
	        }) => {
	          if (importKind === "type" || importKind === "typeof") {
	            typeCount++;
	          }
	        });
	        if (typeCount === path.node.specifiers.length) {
	          path.remove();
	        }
	      },
	      Flow(path) {
	        if (skipStrip) {
	          throw path.buildCodeFrameError("A @flow directive is required when using Flow annotations with the `requireDirective` option.");
	        }
	        path.remove();
	      },
	      ClassPrivateProperty(path) {
	        if (skipStrip) return;
	        path.node.typeAnnotation = null;
	      },
	      Class(path) {
	        if (skipStrip) return;
	        path.node.implements = null;
	        path.get("body.body").forEach((child) => {
	          if (child.isClassProperty()) {
	            const {
	              node
	            } = child;
	            {
	              if (!allowDeclareFields && node.declare) {
	                throw child.buildCodeFrameError(`The 'declare' modifier is only allowed when the 'allowDeclareFields' option of @babel/plugin-transform-flow-strip-types or @babel/preset-flow is enabled.`);
	              }
	            }
	            if (node.declare) {
	              child.remove();
	            } else {
	              {
	                if (!allowDeclareFields && !node.value && !node.decorators) {
	                  child.remove();
	                  return;
	                }
	              }
	              node.variance = null;
	              node.typeAnnotation = null;
	            }
	          }
	        });
	      },
	      AssignmentPattern({
	        node
	      }) {
	        if (skipStrip) return;
	        if (node.left.optional) {
	          node.left.optional = false;
	        }
	      },
	      Function({
	        node
	      }) {
	        if (skipStrip) return;
	        if (node.params.length > 0 && node.params[0].type === "Identifier" && node.params[0].name === "this") {
	          node.params.shift();
	        }
	        for (let i = 0; i < node.params.length; i++) {
	          let param = node.params[i];
	          if (param.type === "AssignmentPattern") {
	            param = param.left;
	          }
	          if (param.optional) {
	            param.optional = false;
	          }
	        }
	        if (!_core.types.isMethod(node)) {
	          node.predicate = null;
	        }
	      },
	      TypeCastExpression(path) {
	        if (skipStrip) return;
	        let {
	          node
	        } = path;
	        do {
	          node = node.expression;
	        } while (_core.types.isTypeCastExpression(node));
	        path.replaceWith(node);
	      },
	      CallExpression({
	        node
	      }) {
	        if (skipStrip) return;
	        node.typeArguments = null;
	      },
	      JSXOpeningElement({
	        node
	      }) {
	        if (skipStrip) return;
	        node.typeArguments = null;
	      },
	      OptionalCallExpression({
	        node
	      }) {
	        if (skipStrip) return;
	        node.typeArguments = null;
	      },
	      NewExpression({
	        node
	      }) {
	        if (skipStrip) return;
	        node.typeArguments = null;
	      }
	    }
	  };
	});
	return lib$4;
}

var libExports$8 = requireLib$3();
var babelPluginTransformFlowStripTypes = /*@__PURE__*/index.getDefaultExportFromCjs(libExports$8);

var lib$2 = {};

var lib$1 = {};

var hasRequiredLib$2;

function requireLib$2 () {
	if (hasRequiredLib$2) return lib$1;
	hasRequiredLib$2 = 1;
	Object.defineProperty(lib$1, "__esModule", {
	  value: true
	});
	lib$1.default = void 0;
	var _helperPluginUtils = index.requireLib();
	lib$1.default = (0, _helperPluginUtils.declare)((api, options) => {
	  api.assertVersion("^7.0.0-0 || >8.0.0-alpha <8.0.0-beta");
	  let {
	    version
	  } = options;
	  {
	    const {
	      legacy
	    } = options;
	    if (legacy !== void 0) {
	      if (typeof legacy !== "boolean") {
	        throw new Error(".legacy must be a boolean.");
	      }
	      if (version !== void 0) {
	        throw new Error("You can either use the .legacy or the .version option, not both.");
	      }
	    }
	    if (version === void 0) {
	      version = legacy ? "legacy" : "2018-09";
	    } else if (version !== "2023-11" && version !== "2023-05" && version !== "2023-01" && version !== "2022-03" && version !== "2021-12" && version !== "2018-09" && version !== "legacy") {
	      throw new Error("Unsupported decorators version: " + version);
	    }
	    var {
	      decoratorsBeforeExport
	    } = options;
	    if (decoratorsBeforeExport === void 0) {
	      if (version === "2021-12" || version === "2022-03") {
	        decoratorsBeforeExport = false;
	      } else if (version === "2018-09") {
	        throw new Error("The decorators plugin, when .version is '2018-09' or not specified, requires a 'decoratorsBeforeExport' option, whose value must be a boolean.");
	      }
	    } else {
	      if (version === "legacy" || version === "2022-03" || version === "2023-01") {
	        throw new Error(`'decoratorsBeforeExport' can't be used with ${version} decorators.`);
	      }
	      if (typeof decoratorsBeforeExport !== "boolean") {
	        throw new Error("'decoratorsBeforeExport' must be a boolean.");
	      }
	    }
	  }
	  return {
	    name: "syntax-decorators",
	    manipulateOptions({
	      generatorOpts
	    }, parserOpts) {
	      if (version === "legacy") {
	        parserOpts.plugins.push("decorators-legacy");
	      } else {
	        if (version === "2023-01" || version === "2023-05" || version === "2023-11") {
	          parserOpts.plugins.push(["decorators", {
	            allowCallParenthesized: false
	          }], "decoratorAutoAccessors");
	        } else if (version === "2022-03") {
	          parserOpts.plugins.push(["decorators", {
	            decoratorsBeforeExport: false,
	            allowCallParenthesized: false
	          }], "decoratorAutoAccessors");
	        } else if (version === "2021-12") {
	          parserOpts.plugins.push(["decorators", {
	            decoratorsBeforeExport
	          }], "decoratorAutoAccessors");
	          generatorOpts.decoratorsBeforeExport = decoratorsBeforeExport;
	        } else if (version === "2018-09") {
	          parserOpts.plugins.push(["decorators", {
	            decoratorsBeforeExport
	          }]);
	          generatorOpts.decoratorsBeforeExport = decoratorsBeforeExport;
	        }
	      }
	    }
	  };
	});
	return lib$1;
}

var transformerLegacy = {};

var hasRequiredTransformerLegacy;

function requireTransformerLegacy () {
	if (hasRequiredTransformerLegacy) return transformerLegacy;
	hasRequiredTransformerLegacy = 1;
	Object.defineProperty(transformerLegacy, "__esModule", {
	  value: true
	});
	transformerLegacy.default = void 0;
	var _core = require$$0;
	const buildClassDecorator = _core.template.statement(`
  DECORATOR(CLASS_REF = INNER) || CLASS_REF;
`);
	const buildClassPrototype = (0, _core.template)(`
  CLASS_REF.prototype;
`);
	const buildGetDescriptor = (0, _core.template)(`
    Object.getOwnPropertyDescriptor(TARGET, PROPERTY);
`);
	const buildGetObjectInitializer = (0, _core.template)(`
    (TEMP = Object.getOwnPropertyDescriptor(TARGET, PROPERTY), (TEMP = TEMP ? TEMP.value : undefined), {
        enumerable: true,
        configurable: true,
        writable: true,
        initializer: function(){
            return TEMP;
        }
    })
`);
	const WARNING_CALLS = /* @__PURE__ */ new WeakSet();
	function applyEnsureOrdering(path) {
	  const decorators = (path.isClass() ? [path, ...path.get("body.body")] : path.get("properties")).reduce((acc, prop) => acc.concat(prop.node.decorators || []), []);
	  const identDecorators = decorators.filter((decorator) => !_core.types.isIdentifier(decorator.expression));
	  if (identDecorators.length === 0) return;
	  return _core.types.sequenceExpression(identDecorators.map((decorator) => {
	    const expression = decorator.expression;
	    const id = decorator.expression = path.scope.generateDeclaredUidIdentifier("dec");
	    return _core.types.assignmentExpression("=", id, expression);
	  }).concat([path.node]));
	}
	function applyClassDecorators(classPath) {
	  if (!hasClassDecorators(classPath.node)) return;
	  const decorators = classPath.node.decorators || [];
	  classPath.node.decorators = null;
	  const name = classPath.scope.generateDeclaredUidIdentifier("class");
	  return decorators.map((dec) => dec.expression).reverse().reduce(function(acc, decorator) {
	    return buildClassDecorator({
	      CLASS_REF: _core.types.cloneNode(name),
	      DECORATOR: _core.types.cloneNode(decorator),
	      INNER: acc
	    }).expression;
	  }, classPath.node);
	}
	function hasClassDecorators(classNode) {
	  var _classNode$decorators;
	  return !!((_classNode$decorators = classNode.decorators) != null && _classNode$decorators.length);
	}
	function applyMethodDecorators(path, state) {
	  if (!hasMethodDecorators(path.node.body.body)) return;
	  return applyTargetDecorators(path, state, path.node.body.body);
	}
	function hasMethodDecorators(body) {
	  return body.some((node) => {
	    var _node$decorators;
	    return (_node$decorators = node.decorators) == null ? void 0 : _node$decorators.length;
	  });
	}
	function applyObjectDecorators(path, state) {
	  if (!hasMethodDecorators(path.node.properties)) return;
	  return applyTargetDecorators(path, state, path.node.properties.filter((prop) => prop.type !== "SpreadElement"));
	}
	function applyTargetDecorators(path, state, decoratedProps) {
	  const name = path.scope.generateDeclaredUidIdentifier(path.isClass() ? "class" : "obj");
	  const exprs = decoratedProps.reduce(function(acc, node) {
	    let decorators = [];
	    if (node.decorators != null) {
	      decorators = node.decorators;
	      node.decorators = null;
	    }
	    if (decorators.length === 0) return acc;
	    if (node.computed) {
	      throw path.buildCodeFrameError("Computed method/property decorators are not yet supported.");
	    }
	    const property = _core.types.isLiteral(node.key) ? node.key : _core.types.stringLiteral(node.key.name);
	    const target = path.isClass() && !node.static ? buildClassPrototype({
	      CLASS_REF: name
	    }).expression : name;
	    if (_core.types.isClassProperty(node, {
	      static: false
	    })) {
	      const descriptor = path.scope.generateDeclaredUidIdentifier("descriptor");
	      const initializer = node.value ? _core.types.functionExpression(null, [], _core.types.blockStatement([_core.types.returnStatement(node.value)])) : _core.types.nullLiteral();
	      node.value = _core.types.callExpression(state.addHelper("initializerWarningHelper"), [descriptor, _core.types.thisExpression()]);
	      WARNING_CALLS.add(node.value);
	      acc.push(_core.types.assignmentExpression("=", _core.types.cloneNode(descriptor), _core.types.callExpression(state.addHelper("applyDecoratedDescriptor"), [_core.types.cloneNode(target), _core.types.cloneNode(property), _core.types.arrayExpression(decorators.map((dec) => _core.types.cloneNode(dec.expression))), _core.types.objectExpression([_core.types.objectProperty(_core.types.identifier("configurable"), _core.types.booleanLiteral(true)), _core.types.objectProperty(_core.types.identifier("enumerable"), _core.types.booleanLiteral(true)), _core.types.objectProperty(_core.types.identifier("writable"), _core.types.booleanLiteral(true)), _core.types.objectProperty(_core.types.identifier("initializer"), initializer)])])));
	    } else {
	      acc.push(_core.types.callExpression(state.addHelper("applyDecoratedDescriptor"), [_core.types.cloneNode(target), _core.types.cloneNode(property), _core.types.arrayExpression(decorators.map((dec) => _core.types.cloneNode(dec.expression))), _core.types.isObjectProperty(node) || _core.types.isClassProperty(node, {
	        static: true
	      }) ? buildGetObjectInitializer({
	        TEMP: path.scope.generateDeclaredUidIdentifier("init"),
	        TARGET: _core.types.cloneNode(target),
	        PROPERTY: _core.types.cloneNode(property)
	      }).expression : buildGetDescriptor({
	        TARGET: _core.types.cloneNode(target),
	        PROPERTY: _core.types.cloneNode(property)
	      }).expression, _core.types.cloneNode(target)]));
	    }
	    return acc;
	  }, []);
	  return _core.types.sequenceExpression([_core.types.assignmentExpression("=", _core.types.cloneNode(name), path.node), _core.types.sequenceExpression(exprs), _core.types.cloneNode(name)]);
	}
	function decoratedClassToExpression({
	  node,
	  scope
	}) {
	  if (!hasClassDecorators(node) && !hasMethodDecorators(node.body.body)) {
	    return;
	  }
	  const ref = node.id ? _core.types.cloneNode(node.id) : scope.generateUidIdentifier("class");
	  return _core.types.variableDeclaration("let", [_core.types.variableDeclarator(ref, _core.types.toExpression(node))]);
	}
	const visitor = {
	  ExportDefaultDeclaration(path) {
	    const decl = path.get("declaration");
	    if (!decl.isClassDeclaration()) return;
	    const replacement = decoratedClassToExpression(decl);
	    if (replacement) {
	      const [varDeclPath] = path.replaceWithMultiple([replacement, _core.types.exportNamedDeclaration(null, [_core.types.exportSpecifier(_core.types.cloneNode(replacement.declarations[0].id), _core.types.identifier("default"))])]);
	      if (!decl.node.id) {
	        path.scope.registerDeclaration(varDeclPath);
	      }
	    }
	  },
	  ClassDeclaration(path) {
	    const replacement = decoratedClassToExpression(path);
	    if (replacement) {
	      const [newPath] = path.replaceWith(replacement);
	      const decl = newPath.get("declarations.0");
	      const id = decl.node.id;
	      const binding = path.scope.getOwnBinding(id.name);
	      binding.identifier = id;
	      binding.path = decl;
	    }
	  },
	  ClassExpression(path, state) {
	    const decoratedClass = applyEnsureOrdering(path) || applyClassDecorators(path) || applyMethodDecorators(path, state);
	    if (decoratedClass) path.replaceWith(decoratedClass);
	  },
	  ObjectExpression(path, state) {
	    const decoratedObject = applyEnsureOrdering(path) || applyObjectDecorators(path, state);
	    if (decoratedObject) path.replaceWith(decoratedObject);
	  },
	  AssignmentExpression(path, state) {
	    if (!WARNING_CALLS.has(path.node.right)) return;
	    path.replaceWith(_core.types.callExpression(state.addHelper("initializerDefineProperty"), [_core.types.cloneNode(path.get("left.object").node), _core.types.stringLiteral(path.get("left.property").node.name || path.get("left.property").node.value), _core.types.cloneNode(path.get("right.arguments")[0].node), _core.types.cloneNode(path.get("right.arguments")[1].node)]));
	  },
	  CallExpression(path, state) {
	    if (path.node.arguments.length !== 3) return;
	    if (!WARNING_CALLS.has(path.node.arguments[2])) return;
	    if (path.node.callee.name !== state.addHelper("defineProperty").name) {
	      return;
	    }
	    path.replaceWith(_core.types.callExpression(state.addHelper("initializerDefineProperty"), [_core.types.cloneNode(path.get("arguments")[0].node), _core.types.cloneNode(path.get("arguments")[1].node), _core.types.cloneNode(path.get("arguments.2.arguments")[0].node), _core.types.cloneNode(path.get("arguments.2.arguments")[1].node)]));
	  }
	};
	transformerLegacy.default = visitor;
	return transformerLegacy;
}

var hasRequiredLib$1;

function requireLib$1 () {
	if (hasRequiredLib$1) return lib$2;
	hasRequiredLib$1 = 1;
	Object.defineProperty(lib$2, "__esModule", {
	  value: true
	});
	lib$2.default = void 0;
	var _helperPluginUtils = index.requireLib();
	var _pluginSyntaxDecorators = requireLib$2();
	var _helperCreateClassFeaturesPlugin = index.requireLib$5();
	var _transformerLegacy = requireTransformerLegacy();
	lib$2.default = (0, _helperPluginUtils.declare)((api, options) => {
	  api.assertVersion(7);
	  {
	    var {
	      legacy
	    } = options;
	  }
	  const {
	    version
	  } = options;
	  if (legacy || version === "legacy") {
	    return {
	      name: "proposal-decorators",
	      inherits: _pluginSyntaxDecorators.default,
	      visitor: _transformerLegacy.default
	    };
	  } else if (!version || version === "2018-09" || version === "2021-12" || version === "2022-03" || version === "2023-01" || version === "2023-05" || version === "2023-11") {
	    api.assertVersion("^7.0.2");
	    return (0, _helperCreateClassFeaturesPlugin.createClassFeaturePlugin)({
	      name: "proposal-decorators",
	      api,
	      feature: _helperCreateClassFeaturesPlugin.FEATURES.decorators,
	      inherits: _pluginSyntaxDecorators.default,
	      decoratorVersion: version
	    });
	  } else {
	    throw new Error("The '.version' option must be one of 'legacy', '2023-11', '2023-05', '2023-01', '2022-03', or '2021-12'.");
	  }
	});
	return lib$2;
}

var libExports$7 = requireLib$1();
var babelPluginProposalDecorators = /*@__PURE__*/index.getDefaultExportFromCjs(libExports$7);

var libExports$6 = index.requireLib$7();
var babelPluginTransformClassProperties = /*@__PURE__*/index.getDefaultExportFromCjs(libExports$6);

var libExports$5 = index.requireLib$8();
var babelPluginTransformPrivateMethods = /*@__PURE__*/index.getDefaultExportFromCjs(libExports$5);

var libExports$4 = index.requireLib$9();
var babelPluginTransformPrivatePropertyInObject = /*@__PURE__*/index.getDefaultExportFromCjs(libExports$4);

var libExports$3 = index.requireLib$10();
var babelPluginTransformNumericSeparator = /*@__PURE__*/index.getDefaultExportFromCjs(libExports$3);

var lib = {};

var isAnnotatedForRemoval = {};

var hasRequiredIsAnnotatedForRemoval;

function requireIsAnnotatedForRemoval () {
	if (hasRequiredIsAnnotatedForRemoval) return isAnnotatedForRemoval;
	hasRequiredIsAnnotatedForRemoval = 1;
	Object.defineProperty(isAnnotatedForRemoval, "__esModule", {
	  value: true
	});
	isAnnotatedForRemoval.default = isAnnotatedForRemoval$1;
	function isAnnotatedForRemoval$1(node) {
	  var comments = node.trailingComments || [];
	  return Boolean(comments.find(function(_ref) {
	    var value = _ref.value;
	    return value.trim() === "remove-proptypes";
	  }));
	}
	return isAnnotatedForRemoval;
}

var isStatelessComponent = {};

var hasRequiredIsStatelessComponent;

function requireIsStatelessComponent () {
	if (hasRequiredIsStatelessComponent) return isStatelessComponent;
	hasRequiredIsStatelessComponent = 1;
	Object.defineProperty(isStatelessComponent, "__esModule", {
	  value: true
	});
	isStatelessComponent.default = isStatelessComponent$1;
	var traversed = Symbol("traversed");
	function isJSXElementOrReactCreateElement(path) {
	  var visited = false;
	  path.traverse({
	    CallExpression: function CallExpression(path2) {
	      var callee = path2.get("callee");
	      if (callee.matchesPattern("React.createElement") || callee.matchesPattern("React.cloneElement") || callee.node.name === "cloneElement") {
	        visited = true;
	      }
	    },
	    JSXElement: function JSXElement() {
	      visited = true;
	    }
	  });
	  return visited;
	}
	function isReturningJSXElement(path) {
	  var iteration = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
	  if (path.node.init && path.node.init.body && isJSXElementOrReactCreateElement(path)) {
	    return true;
	  }
	  if (iteration > 20) {
	    throw new Error("transform-react-remove-prop-type: infinite loop detected.");
	  }
	  var visited = false;
	  path.traverse({
	    ReturnStatement: function ReturnStatement(path2) {
	      if (visited) {
	        return;
	      }
	      var argument = path2.get("argument");
	      if (!argument.node) {
	        return;
	      }
	      if (isJSXElementOrReactCreateElement(path2)) {
	        visited = true;
	        return;
	      }
	      if (argument.node.type === "CallExpression") {
	        var name = argument.get("callee").node.name;
	        var binding = path.scope.getBinding(name);
	        if (!binding) {
	          return;
	        }
	        if (binding.path[traversed]) {
	          return;
	        }
	        binding.path[traversed] = true;
	        if (isReturningJSXElement(binding.path, iteration + 1)) {
	          visited = true;
	        }
	      }
	    }
	  });
	  return visited;
	}
	var VALID_POSSIBLE_STATELESS_COMPONENT_TYPES = ["VariableDeclarator", "FunctionDeclaration"];
	function isStatelessComponent$1(path) {
	  if (VALID_POSSIBLE_STATELESS_COMPONENT_TYPES.indexOf(path.node.type) === -1) {
	    return false;
	  }
	  if (isReturningJSXElement(path)) {
	    return true;
	  }
	  return false;
	}
	return isStatelessComponent;
}

var remove = {};

var hasRequiredRemove;

function requireRemove () {
	if (hasRequiredRemove) return remove;
	hasRequiredRemove = 1;
	Object.defineProperty(remove, "__esModule", {
	  value: true
	});
	remove.default = remove$1;
	function isInside(scope, regex) {
	  if (!scope.hub.file.opts) {
	    return true;
	  }
	  var filename = scope.hub.file.opts.filename;
	  if (!filename) {
	    return true;
	  }
	  if (!regex) {
	    return false;
	  }
	  return regex.test(filename);
	}
	function remove$1(path, globalOptions, options) {
	  var visitedKey = globalOptions.visitedKey, unsafeWrapTemplate = globalOptions.unsafeWrapTemplate, wrapTemplate = globalOptions.wrapTemplate, mode = globalOptions.mode, ignoreFilenames = globalOptions.ignoreFilenames, types = globalOptions.types;
	  if (ignoreFilenames && isInside(path.scope, ignoreFilenames)) {
	    return;
	  }
	  if (path.node[visitedKey]) {
	    return;
	  }
	  path.node[visitedKey] = true;
	  if (mode === "remove") {
	    if (path.parentPath.type === "ConditionalExpression") {
	      path.replaceWith(types.unaryExpression("void", types.numericLiteral(0)));
	    } else {
	      path.remove();
	    }
	    return;
	  }
	  if (mode === "wrap" || mode === "unsafe-wrap") {
	    switch (options.type) {
	      // This is legacy, we do not optimize it.
	      case "createClass":
	        break;
	      // Inspired from babel-plugin-transform-class-properties.
	      case "class static": {
	        var ref;
	        var pathClassDeclaration = options.pathClassDeclaration;
	        if (!pathClassDeclaration.isClassExpression() && pathClassDeclaration.node.id) {
	          ref = pathClassDeclaration.node.id;
	        } else {
	          return;
	        }
	        var node = types.expressionStatement(types.assignmentExpression("=", types.memberExpression(ref, path.node.key), path.node.value));
	        if (pathClassDeclaration.parentPath.isExportDeclaration()) {
	          pathClassDeclaration = pathClassDeclaration.parentPath;
	        }
	        pathClassDeclaration.insertAfter(node);
	        path.remove();
	        break;
	      }
	      case "assign":
	        if (mode === "unsafe-wrap") {
	          path.replaceWith(unsafeWrapTemplate({
	            NODE: path.node
	          }));
	        } else {
	          path.replaceWith(wrapTemplate({
	            LEFT: path.node.left,
	            RIGHT: path.node.right
	          }));
	        }
	        path.node[visitedKey] = true;
	        break;
	      case "declarator":
	        path.replaceWith(wrapTemplate({
	          LEFT: path.node.id,
	          RIGHT: path.node.init
	        }, {
	          as: "variableDeclarator"
	        }));
	        path.node[visitedKey] = true;
	        break;
	    }
	    return;
	  }
	  throw new Error("transform-react-remove-prop-type: unsupported mode ".concat(mode, "."));
	}
	return remove;
}

var hasRequiredLib;

function requireLib () {
	if (hasRequiredLib) return lib;
	hasRequiredLib = 1;
	Object.defineProperty(lib, "__esModule", {
	  value: true
	});
	lib.default = _default;
	var _isAnnotatedForRemoval = _interopRequireDefault(requireIsAnnotatedForRemoval());
	var _isStatelessComponent = _interopRequireDefault(requireIsStatelessComponent());
	var _remove = _interopRequireDefault(requireRemove());
	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { default: obj };
	}
	function _objectSpread(target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i] != null ? arguments[i] : {};
	    var ownKeys = Object.keys(source);
	    if (typeof Object.getOwnPropertySymbols === "function") {
	      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
	        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
	      }));
	    }
	    ownKeys.forEach(function(key) {
	      _defineProperty(target, key, source[key]);
	    });
	  }
	  return target;
	}
	function _defineProperty(obj, key, value) {
	  if (key in obj) {
	    Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
	  } else {
	    obj[key] = value;
	  }
	  return obj;
	}
	function isPathReactClass(path, globalOptions) {
	  var node = path.node;
	  var matchers = globalOptions.classNameMatchers;
	  if (path.matchesPattern("React.Component") || path.matchesPattern("React.PureComponent")) {
	    return true;
	  }
	  if (node && (node.name === "Component" || node.name === "PureComponent")) {
	    return true;
	  }
	  if (node && matchers && matchers.test(node.name)) {
	    return true;
	  }
	  return false;
	}
	function isReactClass(superClass, scope, globalOptions) {
	  if (!superClass.node) {
	    return false;
	  }
	  var answer = false;
	  if (isPathReactClass(superClass, globalOptions)) {
	    answer = true;
	  } else if (superClass.node.name) {
	    var className = superClass.node.name;
	    var binding = scope.getBinding(className);
	    if (!binding) {
	      answer = false;
	    } else {
	      var bindingSuperClass = binding.path.get("superClass");
	      if (isPathReactClass(bindingSuperClass, globalOptions)) {
	        answer = true;
	      }
	    }
	  }
	  return answer;
	}
	function areSetsEqual(set1, set2) {
	  if (set1 === set2) {
	    return true;
	  }
	  if (set1.size !== set2.size) {
	    return false;
	  }
	  return !Array.from(set1).some(function(item) {
	    return !set2.has(item);
	  });
	}
	function memberExpressionRootIdentifier(path) {
	  var parent = path.findParent(function(p) {
	    return !p.isMemberExpression();
	  });
	  var type = parent.node.type;
	  var memberExpression;
	  if (type === "ObjectProperty") {
	    memberExpression = parent.get("value");
	  }
	  if (!memberExpression || memberExpression.type !== "MemberExpression") {
	    return null;
	  }
	  while (memberExpression.node.object.type === "MemberExpression") {
	    memberExpression = memberExpression.get("object");
	  }
	  return memberExpression.get("object");
	}
	function _default(api) {
	  var template = api.template, types = api.types, traverse = api.traverse;
	  var nestedIdentifiers = /* @__PURE__ */ new Set();
	  var removedPaths = /* @__PURE__ */ new WeakSet();
	  var collectNestedIdentifiers = {
	    Identifier: function Identifier(path) {
	      if (path.parent.type === "MemberExpression") {
	        var root = memberExpressionRootIdentifier(path);
	        if (root) {
	          nestedIdentifiers.add(root.node.name);
	        }
	        return;
	      }
	      if (path.parent.type === "ObjectProperty" && (path.parent.key === path.node || path.parent.shorthand)) {
	        return;
	      }
	      nestedIdentifiers.add(path.node.name);
	    }
	  };
	  return {
	    visitor: {
	      Program: function Program(programPath, state) {
	        var ignoreFilenames;
	        var classNameMatchers;
	        if (state.opts.ignoreFilenames) {
	          ignoreFilenames = new RegExp(state.opts.ignoreFilenames.join("|"), "i");
	        } else {
	          ignoreFilenames = void 0;
	        }
	        if (state.opts.classNameMatchers) {
	          classNameMatchers = new RegExp(state.opts.classNameMatchers.join("|"));
	        } else {
	          classNameMatchers = void 0;
	        }
	        var globalOptions = {
	          visitedKey: "transform-react-remove-prop-types".concat(Date.now()),
	          unsafeWrapTemplate: template('\n              if (process.env.NODE_ENV !== "production") {\n                NODE;\n              }\n            ', {
	            placeholderPattern: /^NODE$/
	          }),
	          wrapTemplate: function wrapTemplate(_ref) {
	            var LEFT = _ref.LEFT, RIGHT = _ref.RIGHT;
	            var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
	            var _options$as = options.as, as = _options$as === void 0 ? "assignmentExpression" : _options$as;
	            var right = template.expression('\n                process.env.NODE_ENV !== "production" ? RIGHT : {}\n              ', {
	              placeholderPattern: /^(LEFT|RIGHT)$/
	            })({
	              RIGHT
	            });
	            switch (as) {
	              case "variableDeclarator":
	                return types.variableDeclarator(LEFT, right);
	              case "assignmentExpression":
	                return types.assignmentExpression("=", LEFT, right);
	              default:
	                throw new Error("unrecognized template type ".concat(as));
	            }
	          },
	          mode: state.opts.mode || "remove",
	          ignoreFilenames,
	          types,
	          removeImport: state.opts.removeImport || false,
	          libraries: (state.opts.additionalLibraries || []).concat("prop-types"),
	          classNameMatchers,
	          createReactClassName: state.opts.createReactClassName || "createReactClass"
	        };
	        if (state.opts.plugins) {
	          var pluginsState = state;
	          var pluginsVisitors = state.opts.plugins.map(function(pluginOpts) {
	            var pluginName = typeof pluginOpts === "string" ? pluginOpts : pluginOpts[0];
	            if (typeof pluginOpts !== "string") {
	              pluginsState.opts = _objectSpread({}, pluginsState.opts, pluginOpts[1]);
	            }
	            var plugin = require(pluginName);
	            if (typeof plugin !== "function") {
	              plugin = plugin.default;
	            }
	            return plugin(api).visitor;
	          });
	          traverse(programPath.parent, traverse.visitors.merge(pluginsVisitors), programPath.scope, pluginsState, programPath.parentPath);
	        }
	        programPath.traverse({
	          ObjectProperty: {
	            exit: function exit(path) {
	              var node = path.node;
	              if (node.computed || node.key.name !== "propTypes") {
	                return;
	              }
	              var parent = path.findParent(function(currentNode) {
	                if (currentNode.type !== "CallExpression") {
	                  return false;
	                }
	                return currentNode.get("callee").node.name === globalOptions.createReactClassName || currentNode.get("callee").node.property && currentNode.get("callee").node.property.name === "createClass";
	              });
	              if (parent) {
	                path.traverse(collectNestedIdentifiers);
	                removedPaths.add(path);
	                (0, _remove.default)(path, globalOptions, {
	                  type: "createClass"
	                });
	              }
	            }
	          },
	          // Here to support stage-1 transform-class-properties.
	          ClassProperty: function ClassProperty(path) {
	            var node = path.node, scope = path.scope;
	            if (node.key.name === "propTypes") {
	              var pathClassDeclaration = scope.path;
	              if (isReactClass(pathClassDeclaration.get("superClass"), scope, globalOptions)) {
	                path.traverse(collectNestedIdentifiers);
	                removedPaths.add(path);
	                (0, _remove.default)(path, globalOptions, {
	                  type: "class static",
	                  pathClassDeclaration
	                });
	              }
	            }
	          },
	          AssignmentExpression: function AssignmentExpression(path) {
	            var node = path.node, scope = path.scope;
	            if (node.left.computed || !node.left.property || node.left.property.name !== "propTypes") {
	              return;
	            }
	            var forceRemoval = (0, _isAnnotatedForRemoval.default)(path.node.left);
	            if (forceRemoval) {
	              path.traverse(collectNestedIdentifiers);
	              removedPaths.add(path);
	              (0, _remove.default)(path, globalOptions, {
	                type: "assign"
	              });
	              return;
	            }
	            var className = node.left.object.name;
	            var binding = scope.getBinding(className);
	            if (!binding) {
	              return;
	            }
	            if (binding.path.isClassDeclaration()) {
	              var superClass = binding.path.get("superClass");
	              if (isReactClass(superClass, scope, globalOptions)) {
	                path.traverse(collectNestedIdentifiers);
	                removedPaths.add(path);
	                (0, _remove.default)(path, globalOptions, {
	                  type: "assign"
	                });
	              }
	            } else if ((0, _isStatelessComponent.default)(binding.path)) {
	              path.traverse(collectNestedIdentifiers);
	              removedPaths.add(path);
	              (0, _remove.default)(path, globalOptions, {
	                type: "assign"
	              });
	            }
	          }
	        });
	        var skippedIdentifiers = 0;
	        var removeNewlyUnusedIdentifiers = {
	          VariableDeclarator: function VariableDeclarator(path) {
	            if (path.scope.block.type !== "Program") {
	              return;
	            }
	            if (["ObjectPattern", "ArrayPattern"].includes(path.node.id.type)) {
	              return;
	            }
	            var name = path.node.id.name;
	            if (!nestedIdentifiers.has(name)) {
	              return;
	            }
	            var _path$scope$getBindin = path.scope.getBinding(name), referencePaths = _path$scope$getBindin.referencePaths;
	            var hasRemainingReferencePaths = referencePaths.some(function(referencePath) {
	              var found = referencePath.find(function(path2) {
	                return removedPaths.has(path2);
	              });
	              return !found;
	            });
	            if (hasRemainingReferencePaths) {
	              skippedIdentifiers += 1;
	              return;
	            }
	            removedPaths.add(path);
	            nestedIdentifiers.delete(name);
	            path.get("init").traverse(collectNestedIdentifiers);
	            (0, _remove.default)(path, globalOptions, {
	              type: "declarator"
	            });
	          }
	        };
	        var lastNestedIdentifiers = /* @__PURE__ */ new Set();
	        while (!areSetsEqual(nestedIdentifiers, lastNestedIdentifiers) && nestedIdentifiers.size > 0 && skippedIdentifiers < nestedIdentifiers.size) {
	          lastNestedIdentifiers = new Set(nestedIdentifiers);
	          skippedIdentifiers = 0;
	          programPath.scope.crawl();
	          programPath.traverse(removeNewlyUnusedIdentifiers);
	        }
	        if (globalOptions.removeImport) {
	          if (globalOptions.mode === "remove") {
	            programPath.scope.crawl();
	            programPath.traverse({
	              ImportDeclaration: function ImportDeclaration(path) {
	                var _path$node = path.node, source = _path$node.source, specifiers = _path$node.specifiers;
	                var found = globalOptions.libraries.some(function(library) {
	                  if (library instanceof RegExp) {
	                    return library.test(source.value);
	                  }
	                  return source.value === library;
	                });
	                if (!found) {
	                  return;
	                }
	                var haveUsedSpecifiers = specifiers.some(function(specifier) {
	                  var importedIdentifierName = specifier.local.name;
	                  var _path$scope$getBindin2 = path.scope.getBinding(importedIdentifierName), referencePaths = _path$scope$getBindin2.referencePaths;
	                  return referencePaths.length > 0;
	                });
	                if (!haveUsedSpecifiers) {
	                  path.remove();
	                }
	              }
	            });
	          } else {
	            throw new Error('transform-react-remove-prop-type: removeImport = true and mode != "remove" can not be used at the same time.');
	          }
	        }
	      }
	    }
	  };
	}
	return lib;
}

var libExports$2 = requireLib();
var babelPluginTransformReactRemovePropTypes = /*@__PURE__*/index.getDefaultExportFromCjs(libExports$2);

var libExports$1 = index.requireLib$11();
var babelPluginTransformOptionalChaining = /*@__PURE__*/index.getDefaultExportFromCjs(libExports$1);

var libExports = index.requireLib$12();
var babelPluginTransformNullishCoalescingOperator = /*@__PURE__*/index.getDefaultExportFromCjs(libExports);

const validateBoolOption = (name, value, defaultValue) => {
  if (typeof value === "undefined") {
    value = defaultValue;
  }
  if (typeof value !== "boolean") {
    throw new Error(`Preset react-app: '${name}' option must be a boolean.`);
  }
  return value;
};
function create(api, opts, env) {
  if (!opts) {
    opts = {};
  }
  var isEnvDevelopment = env === "development";
  var isEnvProduction = env === "production";
  var isEnvTest = env === "test";
  var useESModules = validateBoolOption(
    "useESModules",
    opts.useESModules,
    isEnvDevelopment || isEnvProduction
  );
  var isFlowEnabled = validateBoolOption("flow", opts.flow, true);
  var isTypeScriptEnabled = validateBoolOption(
    "typescript",
    opts.typescript,
    true
  );
  var areHelpersEnabled = validateBoolOption("helpers", opts.helpers, true);
  var useAbsoluteRuntime = validateBoolOption(
    "absoluteRuntime",
    opts.absoluteRuntime,
    true
  );
  var absoluteRuntimePath = void 0;
  if (useAbsoluteRuntime) {
    absoluteRuntimePath = require$$0$1.dirname(
      require.resolve("@babel/runtime/package.json")
    );
  }
  if (!isEnvDevelopment && !isEnvProduction && !isEnvTest) {
    throw new Error(
      'Using `babel-preset-react-app` requires that you specify `NODE_ENV` or `BABEL_ENV` environment variables. Valid values are "development", "test", and "production". Instead, received: ' + JSON.stringify(env) + "."
    );
  }
  return {
    presets: [
      isEnvTest && [
        // ES features necessary for user's Node version
        index.babelPresetEnv,
        {
          targets: {
            node: "current"
          }
        }
      ],
      (isEnvProduction || isEnvDevelopment) && [
        // Latest stable ECMAScript features
        index.babelPresetEnv,
        {
          // Allow importing core-js in entrypoint and use browserlist to select polyfills
          useBuiltIns: "entry",
          // Set the corejs version we are using to avoid warnings in console
          corejs: 3,
          // Exclude transforms that make all code slower
          exclude: ["transform-typeof-symbol"]
        }
      ],
      [
        babelPresetReact,
        {
          // Adds component stack to warning messages
          // Adds __self attribute to JSX which React will use for some warnings
          development: isEnvDevelopment || isEnvTest,
          // Will use the native built-in instead of trying to polyfill
          // behavior for any plugins that require one.
          ...opts.runtime !== "automatic" ? { useBuiltIns: true } : {},
          runtime: opts.runtime || "classic"
        }
      ],
      isTypeScriptEnabled && [babelPresetTypescript]
    ].filter(Boolean),
    plugins: [
      // Strip flow types before any other transform, emulating the behavior
      // order as-if the browser supported all of the succeeding features
      // https://github.com/facebook/create-react-app/pull/5182
      // We will conditionally enable this plugin below in overrides as it clashes with
      // @babel/plugin-proposal-decorators when using TypeScript.
      // https://github.com/facebook/create-react-app/issues/5741
      isFlowEnabled && [babelPluginTransformFlowStripTypes, false],
      // Experimental macros support. Will be documented after it's had some time
      // in the wild.
      //require('babel-plugin-macros'),
      // Disabled as it's handled automatically by preset-env, and `selectiveLoose` isn't
      // yet merged into babel: https://github.com/babel/babel/pull/9486
      // Related: https://github.com/facebook/create-react-app/pull/8215
      // [
      //   require('@babel/plugin-transform-destructuring').default,
      //   {
      //     // Use loose mode for performance:
      //     // https://github.com/facebook/create-react-app/issues/5602
      //     loose: false,
      //     selectiveLoose: [
      //       'useState',
      //       'useEffect',
      //       'useContext',
      //       'useReducer',
      //       'useCallback',
      //       'useMemo',
      //       'useRef',
      //       'useImperativeHandle',
      //       'useLayoutEffect',
      //       'useDebugValue',
      //     ],
      //   },
      // ],
      // Turn on legacy decorators for TypeScript files
      isTypeScriptEnabled && [babelPluginProposalDecorators, false],
      // class { handleClick = () => { } }
      // Enable loose mode to use assignment instead of defineProperty
      // See discussion in https://github.com/facebook/create-react-app/issues/4263
      // Note:
      // 'loose' mode configuration must be the same for
      // * @babel/plugin-proposal-class-properties
      // * @babel/plugin-proposal-private-methods
      // * @babel/plugin-proposal-private-property-in-object
      // (when they are enabled)
      [
        babelPluginTransformClassProperties,
        {
          loose: true
        }
      ],
      [
        babelPluginTransformPrivateMethods,
        {
          loose: true
        }
      ],
      [
        babelPluginTransformPrivatePropertyInObject,
        {
          loose: true
        }
      ],
      // Adds Numeric Separators
      babelPluginTransformNumericSeparator,
      // Polyfills the runtime needed for async/await, generators, and friends
      // https://babeljs.io/docs/en/babel-plugin-transform-runtime
      [
        index.babelPluginTransformRuntime,
        {
          corejs: false,
          helpers: areHelpersEnabled,
          // By default, babel assumes babel/runtime version 7.0.0-beta.0,
          // explicitly resolving to match the provided helper functions.
          // https://github.com/babel/babel/issues/10261
          version: require(["@babel/runtime/package.json"][0]).version,
          regenerator: true,
          // https://babeljs.io/docs/en/babel-plugin-transform-runtime#useesmodules
          // We should turn this on once the lowest version of Node LTS
          // supports ES Modules.
          useESModules,
          // Undocumented option that lets us encapsulate our runtime, ensuring
          // the correct version is used
          // https://github.com/babel/babel/blob/090c364a90fe73d36a30707fc612ce037bdbbb24/packages/babel-plugin-transform-runtime/src/index.js#L35-L42
          absoluteRuntime: absoluteRuntimePath
        }
      ],
      isEnvProduction && [
        // Remove PropTypes from production build
        babelPluginTransformReactRemovePropTypes,
        {
          removeImport: true
        }
      ],
      // Optional chaining and nullish coalescing are supported in @babel/preset-env,
      // but not yet supported in webpack due to support missing from acorn.
      // These can be removed once webpack has support.
      // See https://github.com/facebook/create-react-app/issues/8445#issuecomment-588512250
      babelPluginTransformOptionalChaining,
      babelPluginTransformNullishCoalescingOperator
    ].filter(Boolean),
    overrides: [
      isFlowEnabled && {
        exclude: /\.tsx?$/,
        plugins: [babelPluginTransformFlowStripTypes]
      },
      isTypeScriptEnabled && {
        test: /\.tsx?$/,
        plugins: [[babelPluginProposalDecorators, { legacy: true }]]
      }
    ].filter(Boolean)
  };
}

exports.create = create;

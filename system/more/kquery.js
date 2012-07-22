

/*------------------------------------------------------------------------------
 * 999-patch.js
 *
 * Function#apply, Function#call,
 * Array#pop, Array#push, Array#shift, Array#unshift, Array#splice,
 * encodeURI, encodeURIComponent, decodeURI, decodeURIComponent,
 * String#replace(RegExp, Function)
 * の実装を行う
 *----------------------------------------------------------------------------*/

/*
 * Function
 */

// evalを使うため、変数名を変更するコンプレッサーは使えない
Function.prototype.apply || (Function.prototype.apply = function (x, y) {
	x = x || window;
	y = y ||[];
	x.__apply = this;
	if (!x.__apply)
		x.constructor.prototype.__apply = this;
	var r, j = y.length;
	switch (j) {
		case 0: r = x.__apply(); break;
		case 1: r = x.__apply(y[0]); break;
		case 2: r = x.__apply(y[0], y[1]); break;
		case 3: r = x.__apply(y[0], y[1], y[2]); break;
		case 4: r = x.__apply(y[0], y[1], y[2], y[3]); break;
		default:
			var a = [];
			for (var i = 0; i < j; ++i)
				a[i] = "y[" + i + "]";
			r = eval("x.__apply(" + a.join(",") + ")");
			break;
	}
	try {
		delete x.__apply ? x.__apply : x.constructor.prototype.__apply;
	}
	catch (e) {}
	return r;
});

// applyに丸投げ
Function.prototype.call || (Function.prototype.call = function () {
	var a = arguments, x = a[0], y = [];
	for (var i = 1, j = a.length; i < j; ++i)
		y[i - 1] = a[i]
	return this.apply(x, y);
});


/*
 * Array
 */

Array.prototype.pop || (Array.prototype.pop = function () {
	var r = this[this.length - 1];
	--this.length;
	return r;
});

Array.prototype.push || (Array.prototype.push = function () {
	var a = arguments, l = this.length, i = 0, j = a.length;
	for (; i < j; ++i, ++l)
		this[l] = a[i];
	return this.length || (this.length = l);
},
// applyの時は特別に処理することで高速化を図る
Array.prototype.push.apply = function (x, y) {
	var l = x.length || 0, i = 0, j = y.length;
	for (; i < j; ++i, ++l)
		x[l] = y[i];
	return x.length || (x.length = l);
});

Array.prototype.shift || (Array.prototype.shift = function () {
	var r = this[0];
	for(var i = 1, j = this.length; i < j; ++i)
		this[i - 1] = this[i];
	--this.length;
	return r;
});

Array.prototype.unshift || (Array.prototype.unshift = function () {
	if (!this.length)
		this.length = 0;
	var a = arguments, l = a.length, j = this.length += l - 1;
	for (var i = j; i >= l; --i)
		this[i] = this[i - l];
	for (var i = 0; i < l; ++i)
		this[i] = a[i];
	return j;
});

Array.prototype.splice || (Array.prototype.splice = function (x, y) {
	var a = arguments, s = a.length - 2 - y, r = this.slice(x, x + y);
	if (s > 0) {
		for (var i = this.length - 1, j = x + y; i >= j; --i)
			this[i + s] = this[i];
	}
	else if (s < 0) {
		for (var i = x + y, j = this.length; i < j; ++i)
			this[i + s] = this[i];
		this.length += s;
	}
	for (var i = 2, j = a.length; i < j; ++i)
		this[i - 2 + x] = a[i];
	return r;
});


/*
 * Window
 * by http://nurucom-archives.hp.infoseek.co.jp/digital/trans-uri.html
 */

window.encodeURI || (window.encodeURI = function (x) {
	return ("" + x).replace(/[^!#$&-;=?-Z_a-z~]/g, function (s) {
		var c = s.charCodeAt(0), p = "%";
		return (
			c < 16 ? "%0" + c.toString(16) :
			c < 128 ? p + c.toString(16) :
			c < 2048 ? p + (c >> 6 | 192).toString(16) + p + (c & 63 | 128).toString(16) :
			p + (c >> 12 | 224).toString(16) + p + (c >> 6 & 63 | 128).toString(16) + p + (c & 63 | 128).toString(16)
		).toUpperCase();
	});
});

window.encodeURIComponent || (window.encodeURIComponent = function (x) {
	return ("" + x).replace(/[^!'-*.0-9A-Z_a-z~-]/g, function (s) {
		var c = s.charCodeAt(0), p = "%";
		return (
			c < 16 ? "%0" + c.toString(16) :
			c < 128 ? p + c.toString(16) :
			c < 2048 ? p + (c >> 6 | 192).toString(16) + p + (c & 63 | 128).toString(16) :
			p + (c >> 12 | 224).toString(16) + p + (c >> 6 & 63 | 128).toString(16) + p + (c & 63 | 128).toString(16)
		).toUpperCase();
	});
});

window.decodeURI || (window.decodeURI = function (x) {
	return ("" + x).replace(/%(E(0%[AB]|[1-CEF]%[89AB]|D%[89])[0-9A-F]|C[2-9A-F]|D[0-9A-F])%[89AB][0-9A-F]|%[0-7][0-9A-F]/ig, function (s) {
		var c = parseInt(s.substring(1), 16);
		return String.fromCharCode(
			c < 128 ? c :
			c < 224 ? (c & 31) << 6 | parseInt(s.substring(4), 16) & 63 :
			((c & 15) << 6 | parseInt(s.substring(4), 16) & 63) << 6 | parseInt(s.substring(7), 16) & 63
		);
	});
});

// 手抜き
window.decodeURIComponent || (window.decodeURIComponent = window.decodeURI);


/*
 * String
 */

// replace(RegExp, Function)対応
if (window.ActiveXObject ? !Number.prototype.toFixed : (!navigator.taintEnabled && !document.createElement("input").setSelectionRange))
	(function () {
		var g = String.prototype.replace;
		String.prototype.replace = function (x, y) {
			var s = this, z = y;
			// 第二引数が関数
			if (y instanceof Function) {
				// 第一引数が正規表現
				if (x instanceof RegExp) {
					// その上、グローバルマッチ
					if (x.global || /^\/.*g$/.test(x)) {
						var r = [], m;
						while ((m = x.exec(s)) != null) {
							var i = m.index;
							r[r.length] = s.slice(0, i);
							s = s.slice(i + m[0].length);
							r[r.length] = y.apply(null, m.concat(i, this));
						}
						r[r.length] = s;
						return r.join("");
					}
					var m = x.exec(s);
					if (!m)
						return s;
					z = y.apply(null, m.concat(m.index, s));
				}
				else {
					var i = s.indexOf(x);
					if (i < 0)
						return s;
					z = y(x, i, s);
				}
			}
			return g.call(s, x, z);
		};
	})();

(function () {

/*------------------------------------------------------------------------------
 * Initialize & Cache
 *----------------------------------------------------------------------------*/

var
_window = window,
_document = document,
_navigator = navigator,
_XMLHttpRequest = _window.XMLHttpRequest,
_ActiveXObject = _window.ActiveXObject,
$ = function (obj, nodes) {
	return new $.fn.init(obj, nodes);
};

/*
 * ブラウザ判定
 */
$.browser = {
	msie:    false,
	mozilla: false,
	opera:   false,
	safari:  false,
	chrome:  false,
	unknown: false
};
var
tmp_compatMode = _document.compatMode,
tmp_toFixed    = (0).toFixed,
tmp_opera      = _window.opera,
tmp_version    = 0;

// Win IEはActiveXObjectで判定する
if (_ActiveXObject) {
	$.browser.msie = true;
	tmp_version = _document.querySelectorAll ? 8.0 :
	              _XMLHttpRequest            ? 7.0 :
	              tmp_compatMode             ? 6.0 :
	              tmp_toFixed                ? 5.5 :
	              _document.getElementById   ? 5.0 : 0;
}
// Operaはwindow.operaで判定する
else if (tmp_opera) {
	$.browser.opera = true;
	// opera.versionは8から実装だが、8以下は切るので、typeofとかしない
	tmp_version = parseFloat(tmp_opera.version());
}
// Chromeはwindow.execScriptで判定する
else if (_window.execScript) {
	$.browser.chrome = true;
}
// Safariはnavigator.taintEnabledが定義すらされていないらしいことで判定する
else if (!_navigator.taintEnabled) {
	$.browser.safari = true;
	// バージョンはwebkitじゃなくて、safariのバージョン。
	tmp_version = _document.evaluate                                 ? 420 :
	              _document.createElement("input").setSelectionRange ? 417.9 :
	              {}.hasOwnProperty                                  ? 416.11 :
	              _window.DOMParser                                  ? 412.7 :
	              tmp_toFixed                                        ? 312.1 :
	              _XMLHttpRequest                                    ? 124 : 0
}
// MozillaはComponentsで判定する
else if (_window.Components) {
	$.browser.mozilla = true;
	// navigator.productSubの日付を見る。これGeckoなら全部おｋ？
	tmp_version = parseInt(_navigator.productSub, 10);
}
// 不明
else
	$.browser.unknown = true;

$.browser.version = tmp_version;

$.boxModel = tmp_compatMode ? tmp_compatMode === "CSS1Compat" : !$.browser.msie;


/*------------------------------------------------------------------------------
 * Base Functions
 *----------------------------------------------------------------------------*/

var
// ドキュメントルートを取得する
getRoot = function (node) {
	return node.documentElement ? node : node.ownerDocument || node.document;
},
// XMLかどうかを判別する
isXmlDocument = function (root) {
	return root.createElement("p").tagName !== root.createElement("P").tagName;
},

/*
 * Core
 */
// uniqueIDのカウンタ
data_uid = 0,

// dataの保存データ
data_cache = {},

// dataのget、set
funcData = function (node, key, val) {
	if (!node)
		return;
	var uniqueID = node.nodeType === 1 ? "uniqueID" : "__uid__",
	    uid = node[uniqueID] || (node[uniqueID] = ++data_uid);
	if (!key)
		return uid;
	var tmp = data_cache[uid] || (data_cache[uid] = {});
	return val === void 0 ? tmp[key] : (tmp[key] = val);
},

// dataのdelete
removeData = function (node, key) {
	var uniqueID = node.nodeType === 1 ? "uniqueID" : "__uid__",
	    uid = node[uniqueID];
	if (key) {
		var tmp = data_cache[uid];
		if (tmp) {
			delete tmp[key];
			key = "";
			for (key in tmp)
				break;
		}
	}
	if (!key) {
		try {
			delete node[uniqueID];
		} catch (e) {
			if (node.removeAttribute)
				node.removeAttribute(uniqueID);
		}
		delete data_cache[uid];
	}
},

/*
 * Selectors
 */

hash_selector   = { ">": 1, "+": 2, "~": 3, "#": 4, ".": 5, ":": 6, "scope": 7, "root": 8, "link":9 },
hash_operator   = { "=": 1, "!=": 2, "~=": 3, "^=": 4, "$=": 5, "*=": 6, "|=": 7 },
_reg_arg_encode  = /\\([0-9a-fA-F]{0,6})/g,
_func_arg_encode = function (x, y) {
	return String.fromCharCode(parseInt(y, 16));
},
_func_arg = function (key, match) {
	var arg = match[3] || match[2];
	arg = arg ? arg.replace(_reg_arg_encode, _func_arg_encode) : match[1];
	if (key.indexOf("nth") === 0) {
		match = /(-?)(\d*)n([-+]?\d*)/.exec(arg === "even" && "2n" || arg === "odd" && "2n+1" || !/\D/.test(arg) && "0n+" + arg || arg);
		return { a: (match[1] + (match[2] || 1)) - 0, b: match[3] - 0 };
	}
	return arg;
},

// タグの取得
getElementsByTagName = function (tagName, parent) {
	var elems = [], flag_all = tagName === "*";
	switch (parent.length) {
		case 0:
			return elems;
		case 1:
			if ($.browser.msie) {
				var nodes = flag_all && parent[0].all || parent[0].getElementsByTagName(tagName), i = nodes.length;
				while (i)
					elems[--i] = nodes[i];
				return elems;
			}
			return Array.prototype.slice.apply(parent[0].getElementsByTagName(tagName));
		default:
			for (var i = 0, iz = parent.length, n = -1, merge = {}, _data = funcData; i < iz; ++i) {
				for (var j = 0, node, nodes = flag_all && parent[i].all || parent[i].getElementsByTagName(tagName); node = nodes[j]; ++j) {
					var uid = node.uniqueID || _data(node);
					if (!merge[uid]) {
						merge[uid] = true;
						elems[++n] = node;
					}
				}
			}
			return elems;
	}
},

// フィルター
funcFilter = function (selector, elems, parent, root, flag_xml) {
	var _doc = _document,
	    _hash = hash_selector,
	    _hash_op = hash_operator,
	    _data = funcData,
	    _push = Array.prototype.push,
	    _slice = Array.prototype.slice,
	    reg_sequence    = /^([#\.:]|\[\s*)([\w_-]+)/,
	    reg_args        = /^\(\s*("([^"]*)"|'([^']*)'|[^\(\)]*(\([^\(\)]*\))?)\s*\)/,
	    reg_attrib      = /^\s*(([~^$*|!]?=)\s*("([^"]*)"|'([^']*)'|[^ \[\]]*)\s*)?\]/,
	    reg_guard       = /^(title|id|name|class|for|href|src)$/,
	    reg_arg_encode  = _reg_arg_encode,
	    func_arg_encode = _func_arg_encode,
	    func_arg        = _func_arg,
	    match;

	if (!parent)
		parent = [];
	if (!root) {
		root = _doc;
		flag_xml = isXmlDocument(root);
	}

	// フィルターする
	while (match = reg_sequence.exec(selector)) {
		selector = selector.slice(match[0].length);

		// 要素がまだ予約中の場合
		if (!elems) {
			// contextノードのみの時は別な処理をする
			if (parent.length === 1 && parent[0] === root)
				switch (_hash[match[1]]) {
					// #, ID
					case 4:
						if (root.getElementById) {
							var tmp = root.getElementById(match[2]);
							if (!tmp) {
								elems = [];
								continue;
							}
							if (tmp.id == match[2]) {
								elems = [tmp];
								continue;
							}
						}
						break;
					// :, 擬似クラス
					case 6:
						switch (_hash[match[2]]) {
							// scope
							case 7:
								elems = [root];
								continue;
							// root
							case 8:
								elems = [root.documentElement];
								continue;
							// link
							case 9:
								elems = [];
								var links = root.links;
								if (links) {
									if ($.browser.msie) {
										var i = links.length;
										while (i)
											elems[--i] = links[i];
									}
									else
										elems = _slice.apply(links);
								}
								continue;
						}
						break;
				}
			// タグの絞り込みができていないので絞り込みを行う
			elems = getElementsByTagName("*", parent);
		}

		// 絞り込み設定
		var filter, filter_arg, flag_not = false; // filterは絞り込みを行う関数か[属性名, 演算子, 値]
		switch (_hash[match[1]]) {
			// #, ID
			case 4:
				filter = ["id", "=", match[2]];
				break;
			// ., class
			case 5:
				filter = ["class", "~=", match[2]];
				break;
			// :, 擬似クラス
			case 6:
				var key = match[2], func = $.selector.filter[key];
				if (match = reg_args.exec(selector)) {
					selector = selector.slice(match[0].length);
					filter_arg = func_arg(key, match);
				}
				if (func)
					filter = func;
				else if (key === "not") {
					flag_not = true;
					if (filter_arg === "*")
						elems = [];
					else {
						if (match = reg_sequence.exec(filter_arg)) {
							key = match[2];
							switch (_hash[match[1]]) {
								// #, ID
								case 4:
									filter = ["id", "=", key];
									break;
								// ., class
								case 5:
									filter = ["class", "~=", key];
									break;
								// :, 擬似クラス
								case 6:
									func = $.selector.filter[key];
									if (match = reg_args.exec(filter_arg.slice(match[0].length)))
										filter_arg = func_arg(key, match);
									if (func)
										filter = func;
									else
										throw "Invalid Pseudo-classes";
									break;
								// 属性
								default:
									filter = [match[2].toLowerCase()];
									if (match = reg_attrib.exec(filter_arg.slice(match[0].length))) {
										if (match[2]) {
											filter[1] = match[2];
											filter[2] = match[5] || match[4];
											filter[2] = filter[2] ? filter[2].replace(reg_arg_encode, func_arg_encode) : match[3];
										}
									}
									break;
								}
							}
							else {
								var tmp = [], tagName = flag_xml ? filter_arg : filter_arg.toUpperCase();
								for (var i = 0, n = -1, elem; elem = elems[i]; ++i)
									if (tagName !== elem.tagName)
										tmp[++n] = elem;
								elems = tmp;
							}
						}
				}
				else
					throw "Invalid Pseudo-classes";
				break;
			// 属性セレクタ
			default:
				filter = [match[2].toLowerCase()];
				if (match = reg_attrib.exec(selector)) {
					selector = selector.slice(match[0].length);
					if (match[2]) {
						filter[1] = match[2];
						filter[2] = match[5] || match[4];
						filter[2] = filter[2] ? filter[2].replace(reg_arg_encode, func_arg_encode) : match[3];
					}
				}
				break;
		}

		// 絞り込む
		// ruleがtureでnotがfalseのとき挿入
		// ruleがfalseでnotがtrueのとき挿入
		if (elems.length && filter) {
			var tmp = [];

			// filterが関数の場合
			if (typeof filter === "function") {
				for (var i = 0, n = -1, elem; elem = elems[i]; ++i)
					if ((!!filter(elem, filter_arg)) ^ flag_not)
						tmp[++n] = elem;
			}
			// filter.mが関数の場合
			else if (typeof filter.m === "function")
				tmp = filter.m({ not: flag_not, xml: flag_xml }, elems, filter_arg);
			// 属性セレクター
			else {
				var key = filter[0], op = _hash_op[filter[1]], val = filter[2];
				// [class~="val"]
				if (!flag_xml && key === "class" && op === 3) {
					val = " " + val + " ";
					for (var i = 0, n = -1, elem; elem = elems[i]; ++i) {
						var className = elem.className;
						if (!!(className && (" " + className + " ").indexOf(val) > -1) ^ flag_not)
							tmp[++n] = elem;
					}
				}
				// 通常
				else {
					var
						// 諦めて、funcAttrを呼ぶ
						flag_call = ($.browser.safari && key === "selected"),
						// getAttributeを使わない
						flag_name = $.browser.msie && key !== "href" && key !== "src",
						flag_lower = !!val && !flag_xml && !reg_guard.test(key);
					if (flag_lower)
						val = val.toLowerCase();
					if (op === 3)
						val = " " + val + " ";

					for (var i = 0, n = -1, elem; elem = elems[i]; ++i) {
						var attr = flag_call ? funcAttr(elem, key) :
						           flag_name ? elem[attr_props[key] || key] :
						           elem.getAttribute(key, 2),
						    flag = attr != null && (!flag_name || attr !== "");
						if (flag && op) {
							if (flag_lower)
								attr = attr.toLowerCase();
							switch (op) {
								case 1: flag = attr === val; break;
								case 2: flag = attr !== val; break;
								case 3: flag = (" " + attr + " ").indexOf(val) !== -1; break;
								case 4: flag = attr.indexOf(val) === 0; break;
								case 5: flag = attr.lastIndexOf(val) + val.length === attr.length; break;
								case 6: flag = attr.indexOf(val) !== -1; break;
								case 7: flag = attr === val || attr.substring(0, val.length + 1) === val + "-"; break;
							}
						}
						if (!!flag ^ flag_not)
							tmp[++n] = elem;
					}
				}
			}

			elems = tmp;
		}
	}
	return [selector, elems];
},

// セレクター
funcSelector = function (selector, nodes) {
	// 文字列以外は空で返す
	if (typeof selector !== "string")
		return [];

	var _doc = _document,
	    _hash = hash_selector,
	    _data = funcData,
	    _push = Array.prototype.push,
	    _slice = Array.prototype.slice,
	    reg_space_left  = /^\s+/,
	    reg_space_right = /\s+$/,
	    reg_combinator  = /^([>+~])\s*(\w*|\*)/,
	    reg_element     = /^(\w+|\*)/,
	    reg_comma       = /^\s*,\s*/,
	    parent = [], // 探索元の親要素
	    result = [], // 結果要素
	    elems, // 一時保存用
	    merge,
	    flag_dirty, // 要素がコメントノードで汚染されている場合使う
	    flag_multi, // 要素をマージする必要がある
	    last, // セレクターのパースで使う
	    match;

	// contextが空なら、documentで埋める
	if (!nodes)
		nodes = [_doc];
	else if (nodes.nodeType)
		nodes = [nodes];
	else if (!nodes.length)
		return [];

	// セレクターの正規化
	selector = selector.replace(reg_space_right, "");

	// querySelectorAllに対応
	if (_doc.querySelectorAll) {
		var iz = nodes.length;
		if (iz === 1)
			try {
				return _slice.apply(nodes[0].querySelectorAll(selector));
			}
			catch (e) { parent[0] = nodes[0]; }
		else {
			flag_multi = true;
			for (var i = 0, n = -1; i < iz; ++i)
				try {
					_push.apply(result, _slice.apply(nodes[i].querySelectorAll(selector)));
				}
				catch (e) { parent[++n] = context[i]; }
		}
	}
	// 配列はそのまま入れる
	else if (nodes instanceof Array)
		parent = nodes;
	// DOM Collection
	else if ($.browser.msie) {
		var i = nodes.length;
		while (i)
			parent[--i] = nodes[i];
	}
	else
		parent = _slice.apply(nodes);

	// ルート
	var root = getRoot(nodes[0]),
	    flag_xml = isXmlDocument(root);

	// 以下、パースと探索
	if (parent.length)
		while (selector && last !== selector) {
			// 初期化処理
			last = selector = selector.replace(reg_space_left, "");
			flag_dirty = false;
			elems = null;
			merge = {};

			// combinatorの処理
			if (match = reg_combinator.exec(selector)) {
				selector = selector.slice(match[0].length);
				elems = [];
				var tagName = (flag_xml ? match[2] : match[2].toUpperCase()) || "*",
				    i = 0, iz = parent.length, n = -1, flag_all = tagName === "*";
				switch (_hash[match[1]]) {
					// >
					case 1:
						for (; i < iz; ++i)
							for (var node = parent[i].firstChild; node; node = node.nextSibling)
								if (node.nodeType === 1 && (flag_all || tagName === node.tagName))
									elems[++n] = node;
						break;
					// +
					case 2:
						for (; i < iz; ++i)
							for (var node = parent[i].nextSibling; node; node = node.nextSibling)
								if (node.nodeType === 1) {
									if (flag_all || tagName === node.tagName)
										elems[++n] = node;
									break;
								}
						break;
					// ~
					case 3:
						for (; i < iz; ++i)
							for (var node = parent[i].nextSibling; node; node = node.nextSibling)
								if (node.nodeType === 1 && (flag_all || tagName === node.tagName)) {
									var uid = node.uniqueID || _data(node);
									if (merge[uid])
										break;
									else {
										merge[uid] = true;
										elems[++n] = node;
									}
								}
						break;
				}
			}
			// 子孫があるときのタグ名の処理
			else if (match = reg_element.exec(selector)) {
				selector = selector.slice(match[0].length);
				if (match[1] !== "*")
					elems = getElementsByTagName(match[1], parent);
			}

			// 要素をフィルターする
			var tmp = funcFilter(selector, elems, parent, root, flag_xml);
			selector = tmp[0];
			elems = tmp[1];
			if (!elems) {
				flag_dirty = true;
				elems = getElementsByTagName("*", parent);
			}

			// カンマ
			if (match = reg_comma.exec(selector)) {
				selector = selector.slice(match[0].length);
				flag_multi = true;
				if (elems.length)
					_push.apply(result, elems);
			}
			// 次の階層に行く
			else
				parent = elems;
		}

	if (flag_multi) {
		if (elems.length)
			_push.apply(result, elems);
		elems = [];
		merge = {};
		for (var i = 0, elem, n = -1; elem = result[i]; ++i) {
			var uid = elem.uniqueID || _data(elem);
			if (!merge[uid] && elem.nodeType === 1) {
				merge[uid] = true;
				elems[++n] = elem;
			}
		}
	}
	else if (flag_dirty && $.browser.msie) {
		result = [];
		for (var i = 0, n = -1, node; node = elems[i]; ++i)
			if (node.nodeType === 1)
				result[++n] = node;
		return result;
	}

	return elems;
},

/*
 * Attributes
 */
// 属性の名称変換テーブル
attr_textContent = $.browser.msie || $.browser.opera ? "innerText" : "textContent",
attr_props = {
	"class": "className",
	accesskey: "accessKey",
	"accept-charset": "acceptCharset",
	bgcolor: "bgColor",
	cellpadding: "cellPadding",
	cellspacing: "cellSpacing",
	"char": "ch",
	charoff: "chOff",
	codebase: "codeBase",
	codetype: "codeType",
	colspan: "colSpan",
	datetime: "dateTime",
	"for": "htmlFor",
	frameborder: "frameBorder",
	"http-equiv": "httpEquiv",
	ismap: "isMap",
	longdesc: "longDesc",
	maxlength: "maxLength",
	nohref: "noHref",
	readonly: "readOnly",
	rowspan: "rowSpan",
	tabindex: "tabIndex",
	usemap: "useMap",
	valuetype: "valueType"
},

// 属性のラッパー
funcAttr = function (flag_xml, elem, key, val) {
	if (!elem || elem.nodeType !== 1)
		return;

	var flag_get = val === void 0,
	    flag_special = !flag_xml && (key === "href" || key === "src");

	// HTML文書の場合
	if (!flag_xml) {
		// styleのみ別処理
		if (key === "style") {
			var tmp = elem.style;
			return flag_set ? (tmp.cssText = "" + val) : tmp.cssText;
		}

		var tmp = elem.parentNode;
		key = attr_props[key] || key; // 属性名変換
		// safariのバグ対策
		if ($.browser.safari && key === "selected" && tmp)
			tmp.selectedIndex;
		// 要素に存在する場合
		if (!flag_special && elem[key] !== void 0) {
			// getter
			if (flag_get) {
				if (elem.tagName.toLowerCase() === "form" && elem.getAttributeNode(key))
					return elem.getAttributeNode(key).nodeValue;
				return elem[key];
			}
			// setter
			if (key === "type" && tmp && elem.tagName.toLowerCase() === "input")
				throw "type property can't be changed";
			elem[key] = val;
			return;
		}
	}
	// getter
	if (flag_get) {
		val = elem.getAttribute(key, 2);
		return val === null ? void 0 : val;
	}
	// setter
	elem.setAttribute(key, "" + val);
},


/*
 * Traversing
 */

/*
 * Manipulation
 */

/*
 * CSS
 */

css_styleFloat = $.browser.msie ? "styleFloat" : "cssFloat",
css_getComputedStyle = _document.defaultView && _document.defaultView.getComputedStyle,
getCurrentCss = css_getComputedStyle
// getComputedStyle版
? function (elem, key, flag) {
	var style = elem.style, res;

	// Operaのバグ対策
	if ($.browser.opera && key === "display") {
		res = style.outline;
		style.outline = "0 solid black";
		style.outline = res;
	}

	// styleに値がある場合は返す
	if (!flag && style && style[key])
		res = style[key];
	// ない場合
	else {
		// キーの復旧
		if (key === css_styleFloat)
			key = "float";
		else
			key = key.replace(/([A-Z])/g, "-$1").toLowerCase();
		var computedStyle = css_getComputedStyle(elem, null);
		// jQueryでのsafariのバグ対策
		if ($.browser.safari && (!computedStyle || computedStyle.getPropertyValue("color") === "")) {
			var swap = [], stack = [], color = function (elem) {
				var tmp = css_getComputedStyle(elem, null);
				return !tmp || tmp.getPropertyValue("color") === "";
			};
			for (var node = elem; node && color(node); node = node.parentNode)
				stack.unshift(node);
			for (var i = 0, iz = stack.length; i < iz; ++i)
				if (color(stack[i])) {
					res = stack[i].style;
					swap[i] = res.display;
					res.display = "block";
				}
			if (key === "display" && swap[stack.length - 1] != null)
				res = "none";
			else
				res = computedStyle && computedStyle.getPropertyValue(key) || "";
			for (var i = 0, iz = swap.length; i < iz; ++i)
				if (swap[i] != null)
					stack[i].style.display = swap[i];
		}
		else
			res = computedStyle && computedStyle.getPropertyValue(key) || "";
	}

	return key === "opacity" && res === "" ? "1" : res;
}
// currentStyle版
: function (elem, key, flag) {
	var style = elem.style, res;

	// styleに値がある場合は返す
	if (!flag && style && style[key])
		res = style[key];
	// ない場合
	else {
		var currentStyle = elem.currentStyle, tmp_bp = "backgroundPosition";
		res = currentStyle[key];
		// backgroundPositionのバグ修正
		if (!res && key === tmp_bp)
			res = currentStyle[tmp_bp + "X"] + " " + currentStyle[tmp_bp + "Y"];
		// jQueryでのpixel返却対策
		else if (!/^(fontSize|backgroundPosition[XY]?)$/.test(key) && /^-?\d+\w*$/.test(res) && !/^-?\d+(px)?$/i.test(res)) {
			var runtimeStyle = elem.runtimeStyle,
			    left = style.left,
			    rsLeft = runtimeStyle.left;
			runtimeStyle.left = currentStyle.left;
			style.left = res || 0;
			res = style.pixelLeft + "px";
			style.left = left;
			runtimeStyle.left = rsLeft;
		}
	}
	return res;
},

// CSS設定用
funcCss = function (elem, key, val) {
	// 値の固定
	if (val === null)
		val = void 0;
	// キーの正規化
	if (key === "float")
		key = css_styleFloat;
	else {
		key = key.replace(/-([a-z])/g, function (x, y) {
			return y.toUpperCase();
		});
		// ハックの適用
		if ($.css.special[key]) {
			key = $.css.special[key];
			if (typeof key === "function")
				return key(elem, val);
		}
	}
	// getter
	if (val === void 0)
		return getCurrentCss(elem, key);
	// setter
	elem.style[key] = val;
},

/*
 * Ajax
 */

/*
 * Utilities
 */

_reg_quick = /^\s*(<[\s\S]+>)\s*$|^(\w*|\*)(?:#([\w_-]+))?$/;

/*------------------------------------------------------------------------------
 * kQuery Methods
 *----------------------------------------------------------------------------*/

$.fn = $.prototype = {

/*
 * Core
 */
	init: function (obj, nodes) {
		obj = obj || _document;

		// DOMElement
		if (obj.nodeType) {
			this[0] = obj;
			this.length = 1;
			return this;
		}

		var elems = [], // 結果の要素を入れる
		    tmp, match, elem, root, reg = _reg_quick;
		// HTML文字列
		if (typeof obj === "string") {
			// HTML文字列、ID名にマッチする
			if (match = reg.exec(obj)) {
				// rootの取得
				root = nodes && nodes.length ? nodes[0] : nodes;
				root = root ? root.documentElement ? root : root.ownerDocument || root.document : _document;

				// パース結果の保存
				// ID
				if (tmp = match[3]) {
					if (elem = root.getElementById(tmp)) {
						// タグ取得成功
						if (elem.id === tmp) {
							tmp = match[2]; // タグ名
							if (!tmp || tmp === "*" || tmp.toUpperCase() === elem.tagName) {
								this[0] = elem;
								this.length = 1;
							}
							else
								this.length = 0;
							return this;
						}
						// elemはあるけど、ID名がないなら、再探索する必要がある
						else
							match = null;
					}
				}
				// タグ
				else if (tmp = match[2]) {
					if (tmp !== "*") {
						elem = root.getElementsByTagName(tmp);
						if ($.browser.msie) {
							tmp = elem.length;
							while (tmp)
								elems[--tmp] = elem[tmp];
						}
						else
							elems = Array.prototype.slice.apply(elem);
					}
					else
						match = null;
				}
				// HTML
				else
					elems = []; // 配列で返す
			}
			// セレクター取得
			if (!match)
				elems = funcSelector(obj, nodes);
		}
		// 関数
		else if (false && $.isFunction(obj))
			return $().on("ready", obj);
		// DOMCollection
		else if (!(obj instanceof Array)) {
			if ($.browser.msie) {
				tmp = obj.length;
				while (tmp)
					elems[--tmp] = obj[tmp];
			}
			else
				elems = Array.prototype.slice.apply(obj);
		}
		// 配列もしくはStaticNodeListの挿入
		this.length = 0;
		Array.prototype.push.apply(this, elems);
		return this;
	},
	each: function (func) {},
	size: function () {},
	get: function (num) {},
	index: function (elem) {},
	data: function (key, val) {},
	removeData: function (key) {},

/*
 * Attributes
 */
	attr: function (obj_key, obj_val) {},
	removeAttr: function (key) {},
	addClass: function (str) {},
	hasClass: function (str) {},
	removeClass: function (str) {},
	toggleClass: function (str) {},
	html: function (str) {},
	text: function (str) {},
	val: function (str) {},

/*
 * Traversing
 */
	eq: function (num) {},
	filter: function (obj) {},
	is: function (obj) {},
	map: function (func) {},
	not: function (obj) {},
	slice: function (num_begin, num_end) {},
	add: function (obj) {},
	children: function (expr) {},
	contents: function () {},
	find: function (expr) {},
	next: function (expr) {},
	nextAll: function (expr) {},
	offsetParent: function () {},
	parent: function (expr) {},
	parents: function (expr) {},
	prev: function (expr) {},
	prevAll: function (expr) {},
	siblings: function (expr) {},
	pushStack: function(nodes, key, expr) {},
	andSelf: function() {},
	end: function() {},

/*
 * Manipulation
 */
	append: function (obj) {},
	appendTo: function (obj) {},
	prepend: function (obj) {},
	prependTo: function (obj) {},
	after: function (obj) {},
	before: function (obj) {},
	insertAfter: function (obj) {},
	insertBefore: function (obj) {},
	wrap: function (obj) {},
	wrapAll: function (obj) {},
	wrapInner: function (obj) {},
	replaceWith: function (obj) {},
	replaceAll: function (obj) {},
	empty: function () {},
	remove: function (obj) {},
	clone: function (flag) {},

/*
 * CSS
 */
	css: function (obj_key, obj_val) {},
	offset: function () {},
	position: function () {},
	scrollTop: function (num) {},
	scrollLeft: function (num) {},
	height: function (num) {},
	width: function (num) {},
	innerHeight: function () {},
	innerWidth: function () {},
	outerHeight: function (flag) {},
	outerWidth: function (flag) {},

/*
 * Event
 */
	on: function (type, func, hash) {},
	un: function (type, func) {},
	fire: function (type, flag, hash) {},
/*
	bind: function (type, hash, func) {},
	trigger: function (type, hash) {},
	triggerHandler: function (type, hash) {},
	unbind: function (type, func) {},

	ready: function (func) {},
	hover: function (func_over, func_out) {},
	toggle: function () {},
*/

/*
 * Effects
 */
	animate: function (hash, opt) {},
	stop: function (flag_clear, flag_end) {},
	queue: function (obj) {},
	dequeue: function () {}

};

$.fn.init.prototype = $.fn;

/*------------------------------------------------------------------------------
 * kQuery Statics
 *----------------------------------------------------------------------------*/

/*
 * css
 */

$.css = {
	// CSSプロパティーの変換に使う
	special: (function () {
		var res = {}, style = _document.documentElement.style, _undefined = void 0;
		// opacity
		if (style.opacity === _undefined)
			res.opacity =
				style.MozOpacity   !== _undefined ? "MozOpacity" :
				style.KhtmlOpacity !== _undefined ? "KhtmlOpacity" :
				style.filter       !== _undefined ? function (elem, val) {
					var style = elem.style;
					if (val === void 0)
						return /opacity=(\d*)/.test(style.filter) ? "" + (parseFloat(RegExp.$1) / 100) : "1";
					var tmp = (style.filter || "").replace(/(progid\:DXImageTransform\.Microsoft\.)?Alpha\([^\(\)]\)/gi, "");
					val = parseFloat(val) * 100;
					if (isFinite(val)) {
						val = val <= 0 ? 0 : val >= 100 ? 100 : Math.round(val);
						val < 100 && (tmp += " alpha(opacity=" +  + ")");
					}
					style.filter = tmp;
				} : _undefined;
		// background-position-x, background-position-y
		if (style.backgroundPositionX === _undefined) {
			var backgroundPosition = function (num) {
				return function (elem, val) {
					var tmp_bp = "backgroundPosition",
					    val_bp = getCurrentCss(elem, tmp_bp).split(" ");
					if (val === void 0)
						return val_bp[num];
					val_bp[num] = val;
					elem.style[tmp_bp] = val.bp.join(" ");
				};
			};
			res.backgroundPositionX = backgroundPosition(0);
			res.backgroundPositionY = backgroundPosition(1);
		}
		return res;
	})()
};

/*
 * Selectors
 */

var
funcSelectorChild = function (num_type, flag) {
	return {
		m: function (flags, elems) {
			var res = [],
			    type = num_type,
			    flag_all = flag,
			    flag_not = flags.not;
			for (var i = 0, n = -1, elem; elem = elems[i]; ++i) {
				var tagName = flag_all || elem.tagName, tmp = null;
				if (tmp === null && type <= 0)
					for (var node = elem.previousSibling; node; node = node.previousSibling)
						if (node.nodeType === 1 && (flag_all || tagName === node.tagName)) {
							tmp = false;
							break;
						}
				if (tmp === null && type >= 0)
					for (var node = elem.nextSibling; node; node = node.nextSibling)
						if (node.nodeType === 1 && (flag_all || tagName === node.tagName)) {
							tmp = false;
							break;
						}
				if (tmp === null)
					tmp = true;
				if (tmp ^ flag_not)
					res[++n] = elem;
			}
			return res;
		}
	};
},
funcSelectorNth = function (str_pointer, str_sibling, flag) {
	return {
		m: function (flags, elems, arg) {
			var _data = funcData,
			    a = arg.a,
			    b = arg.b,
			    res = [],
			    checked = {},
			    pointer = str_pointer,
			    sibling = str_sibling,
			    flag_all = flag,
			    flag_not = flags.not;
			for (var i = 0, n = -1, elem; elem = elems[i]; ++i) {
				var uid = elem.uniqueID || _data(elem),
				    tmp = checked[uid];
				if (tmp === void 0) {
					for (var c = 0, node = elem.parentNode[pointer], tagName = flag_all || elem.tagName; node; node = node[sibling])
						if (node.nodeType === 1 && (flag_all || tagName === node.tagName)) {
							++c;
							checked[node.uniqueID || _data(node)] = a === 0 ? c === b : (c - b) % a === 0 && (c - b) / a >= 0;
						}
					tmp = checked[uid];
				}
				if (tmp ^ flag_not)
					res[++n] = elem;
			}
			return res;
		}
	};
},
funcSelectorProp = function (str_prop, flag) {
	return {
		m: function (flags, elems) {
			var res = [],
			    prop = str_prop,
			    flag_not = flag ? flags.not : !flags.not;
			for (var i = 0, n = -1, elem; elem = elems[i]; ++i)
				if (elem[prop] ^ flag_not)
					res[++n] = elem;
			return res;
		}
	};
};

$.selector = {
	filter: {
		root: function (elem) {
			return elem === (elem.ownerDocument || elem.document).documentElement;
		},
		target: {
			m: function (flags, elems) {
				var res = [], hash = location.hash.slice(1), flag_not = flags.not;
				for (var i = 0, n = -1, elem; elem = elems[i]; ++i)
					if (((elem.id || elem.name) === hash) ^ flag_not)
						res[++n] = elem;
				return res;
			}
		},
		"first-child":      funcSelectorChild(-1, true),
		"last-child":       funcSelectorChild( 1, true),
		"only-child":       funcSelectorChild( 0, true),
		"first-of-type":    funcSelectorChild(-1),
		"last-of-type":     funcSelectorChild( 1),
		"only-of-type":     funcSelectorChild( 0),
		"nth-child":        funcSelectorNth("firstChild", "nextSibling",     true),
		"nth-last-child":   funcSelectorNth("lastChild",  "previousSibling", true),
		"nth-of-type":      funcSelectorNth("firstChild", "nextSibling"),
		"nth-last-of-type": funcSelectorNth("lastChild",  "previousSibling"),
		empty: {
			m: function (flags, elems) {
				var res = [], flag_not = flags.not;
				for (var i = 0, n = -1, elem; elem = elems[i]; ++i) {
					var tmp = null;
					for (var node = elem.firstChild; node; node = node.nextSibling)
						if (node.nodeType === 1) {
							tmp = false;
							break;
						}
					if (tmp === null)
						tmp = !elem[attr_textContent];
					if (tmp ^ flag_not)
						res[++n] = elem;
				}
				return res;
			}
		},
		link: {
			m: function (flags, elems) {
				var links = (elems[0].ownerDocument || elems[0].document).links;
				if (!links) return [];
				var _data = funcData,
				    res = [],
				    checked = {},
				    flag_not = flags.not;
				for (var i = 0, elem; elem = links[i]; ++i)
					checked[elem.uniqueID || _data(elem)] = true;
				for (var i = 0, n = -1, elem; elem = elems[i]; ++i)
					if (checked[elem.uniqueID] ^ flag_not)
						res[++n] = elem;
				return res;
			}
		},
		lang: {
			m: function (flags, elems, arg) {
				var res = [], reg = new RegExp("^" + arg, "i"), flag_not = flags.not;
				for (var i = 0, n = -1, elem; elem = elems[i]; ++i) {
					var tmp = elem;
					while (tmp && !tmp.getAttribute("lang"))
						tmp = tmp.parentNode;
					tmp = !!(tmp && reg.test(tmp.getAttribute("lang")));
					if (tmp ^ flag_not)
						res[++n] = elem;
				}
				return res;
			}
		},
		enabled: funcSelectorProp("disabled", false),
		disabled: funcSelectorProp("disabled", true),
		checked: funcSelectorProp("checked", true),
		contains: {
			m: function (flags, elems, arg) {
				var res = [],
				    textContent = attr_textContent,
				    flag_not = flags.not;
				for (var i = 0, n = -1, elem; elem = elems[i]; ++i)
					if (((elem[textContent] || "").indexOf(arg) > -1) ^ flag_not)
						res[++n] = elem;
				return res;
			}
		}
	}
};

/*
 * Ajax
 */


/*------------------------------------------------------------------------------
 * Publish
 *----------------------------------------------------------------------------*/

_window.kQuery = $;

})();



(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("DataTrue", [], factory);
	else if(typeof exports === 'object')
		exports["DataTrue"] = factory();
	else
		root["DataTrue"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.Validator = exports.AtomicSetError = exports.default = undefined;var _from = __webpack_require__(1);var _from2 = _interopRequireDefault(_from);var _possibleConstructorReturn2 = __webpack_require__(54);var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = __webpack_require__(79);var _inherits3 = _interopRequireDefault(_inherits2);var _defineProperty = __webpack_require__(87);var _defineProperty2 = _interopRequireDefault(_defineProperty);var _getOwnPropertyNames = __webpack_require__(90);var _getOwnPropertyNames2 = _interopRequireDefault(_getOwnPropertyNames);var _classCallCheck2 = __webpack_require__(94);var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _createClass2 = __webpack_require__(95);var _createClass3 = _interopRequireDefault(_createClass2);var _preventExtensions = __webpack_require__(96);var _preventExtensions2 = _interopRequireDefault(_preventExtensions);var _getPrototypeOf = __webpack_require__(99);var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _create = __webpack_require__(84);var _create2 = _interopRequireDefault(_create);var _seal = __webpack_require__(102);var _seal2 = _interopRequireDefault(_seal);var _map = __webpack_require__(105);var _map2 = _interopRequireDefault(_map);var _freeze = __webpack_require__(120);var _freeze2 = _interopRequireDefault(_freeze);var _keys = __webpack_require__(123);var _keys2 = _interopRequireDefault(_keys);var _typeof2 = __webpack_require__(55);var _typeof3 = _interopRequireDefault(_typeof2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}



	var DATATRUE_PREFIX = 'DataTrue';
	var ATOMIC_SET_KEY = 'atomicSet';
	var defaultOpts = {
		dtPrefix: DATATRUE_PREFIX,
		atomicSet: ATOMIC_SET_KEY,
		writableValidatorMethods: false,
		configurableValidatorMethods: false };

	var DataTrue = function DataTrue() {var _this = this;var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		if ((typeof opts === 'undefined' ? 'undefined' : (0, _typeof3.default)(opts)) !== 'object') throw new Error('First argument, opts, to DataTrue should be an object. You gave me a \'' + (typeof opts === 'undefined' ? 'undefined' : (0, _typeof3.default)(opts)) + '\'');
		this.opts = {};
		(0, _keys2.default)(defaultOpts).forEach(function (k) {
			_this.opts[k] = defaultOpts[k];
		});
		(0, _keys2.default)(opts).forEach(function (k) {
			if (!(k in _this.opts)) throw new Error('Unknown DataTrue option: \'' + k + '\'');
			_this.opts[k] = opts[k];
		});
		(0, _freeze2.default)(this.opts);
		this.classes = {
			byConstructor: new _map2.default(),
			byClass: new _map2.default(),
			byName: new _map2.default() };

		this.validating = false;
		this.validators = new _map2.default();
		(0, _seal2.default)(this);
	};





	var DT_OBJECT_FLAG = 'This is a DataTrue Object';

	var createClass = function createClass(clName) {var userTemplate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};var _this2 = this;var userConstructor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;var prototype = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Object.prototype;

		if (typeof clName !== 'string') throw new Error('The class name must be a string');

		if ((typeof userTemplate === 'undefined' ? 'undefined' : (0, _typeof3.default)(userTemplate)) !== 'object') throw new Error('Object properties must be an object. You gave me a \'' + (typeof userTemplate === 'undefined' ? 'undefined' : (0, _typeof3.default)(userTemplate)) + '\'');
		(0, _keys2.default)(userTemplate).forEach(function (name) {
			if (name.startsWith(_this2.dtPrefix)) throw new Error('Property \'' + name + '\' is not allowed. DataTrue reserves all properties starting with the string \'' + _this2.dtPrefix + '\'');
		});
		if (userConstructor !== false && typeof userConstructor !== 'function') throw new Error('Constructor must be a function. You gave me a \'' + (typeof userConstructor === 'undefined' ? 'undefined' : (0, _typeof3.default)(userConstructor)) + '\'');

		var template = userTemplate;

		var dtClass = new DataTrueClass(clName, template, this, prototype);
		var schema = this;
		var dtConstructor = function dtConstructor() {var _this3 = this;
			dtClass.init(this);

			var validate = false;
			if (!(schema.validating instanceof _map2.default)) {
				schema.validating = new _map2.default();
				validate = true;
			}
			var initData = arguments[0];
			if (initData) {(function () {

					var universe = void 0;



					if (dtClass.dtProp in initData && initData[dtClass.dtProp] instanceof _map2.default) {
						universe = initData[dtClass.dtProp];
						delete initData[dtClass.dtProp];
					} else {
						universe = new _map2.default();
					}

					if (universe.has(initData)) throw new Error('Something is trying to instantiate a class with the same initial values object multiple times');
					universe.set(initData, _this3);

					(0, _keys2.default)(initData).forEach(function (p) {
						if (!(p in dtClass.template)) {

							_this3[p] = initData[p];
							return;
						}
						if ((0, _typeof3.default)(initData[p]) === 'object') {

							if (universe.has(initData[p])) {
								initData[p] = universe.get(initData[p]);
							} else if (dtClass.dtProp in initData[p]) {
								switch ((0, _typeof3.default)(initData[p][dtClass.dtProp])) {
									case 'string':
										var DepClass = schema.lookupClass(initData[p][dtClass.dtProp]);
										if (!DepClass) throw new Error('Unknown DataTrue class: \'' + initData[p][dtClass.dtProp] + '\' for property: \'' + p + '\'');
										initData[p][dtClass.dtProp] = universe;
										initData[p] = new DepClass(initData[p]);
										break;
									case 'function':
										if (!schema.isDataTrueClass(initData[p][dtClass.dtProp])) throw new Error('You appear to be mixing schemas. That\'s not allowed');
										DepClass = initData[p][dtClass.dtProp];
										initData[p][dtClass.dtProp] = universe;
										initData[p] = new DepClass(initData[p]);
										break;
									case 'object':

										break;
									default:
										throw new Error('Attempt to initialize a DataTrue object with a sub-object that has a \'' + dtClass.dtProp + '\' property of unknown type \'' + (0, _typeof3.default)(initData[p][dtClass.dtProp]) + '\'');}

							}
						}
						set[p] = { val: initData[p], block: false };
					});})();
			}

			(0, _keys2.default)(set).forEach(function (k) {
				if (set[k].block) return;
				_this3[k] = set[k].val;
			});
			if (validate) dtClass.atomicSet(function () {}, true);

			if (userConstructor) userConstructor.apply(this, arguments);
		};

		var objProps = {};
		objProps[this.dtTmplProp] = { get: function get() {return template;} };
		(0, _keys2.default)(template).forEach(function (name) {
			objProps[name] = genProp(name, template[name], dtClass);
		});
		if (!(this.atomicSetProp in objProps)) {
			objProps[schema.atomicSetProp] = { value: function value(setter) {
					return schema.atomicSet(setter);
				} };
		} else {
			if (schema.atomicSetProp === ATOMIC_SET_KEY) {
				console.warn('You\'ve defined \'' + ATOMIC_SET_KEY + '\' on your DataTrueClass, which dataTrue uses. This means you can\'t call the \'' + ATOMIC_SET_KEY + '\' method on objects of this DataTrue class. Alternativly, you can call \'atomicSet\' on the DataTrue schema object or any DataTrue class, or choose a different name for the atomicSet method of your classes by defining \'atomicSet\' option when instantiating DataTrue.');
			} else {
				console.warn('You\'ve defined \'' + schema.atomicSetProp + '\' on your DataTrue class. You also set \'' + schema.atomicSetProp + '\' as the customized name for the atomicSet method in your schema. This means you can\'t call the \'' + ATOMIC_SET_KEY + '\' method of objects of this DataTrue class, since your property overrides the one you told DataTrue to use. Change the value of \'atomicSet\' in the options you pass when instantiating the DataTrue schema object or just call \'atomicSet\' on the DataTrue schema object itself or any DataTrue class insted of calling \'' + schema.atomicSetProp + '\' on objects of this DataTrue class.');
			}
		}
		dtConstructor.prototype = (0, _create2.default)(prototype, objProps);

		var set = {};
		var proto = prototype;
		var chain = [dtConstructor.prototype];
		while (proto) {
			chain.unshift(proto);
			proto = (0, _getPrototypeOf2.default)(proto);
		}
		while (chain.length > 0) {
			proto = chain.shift();
			if (schema.dtTmplProp in proto) {
				(0, _keys2.default)(proto[schema.dtTmplProp]).forEach(function (prop) {
					if ('default' in proto[schema.dtTmplProp][prop]) {
						set[prop] = { val: proto[schema.dtTmplProp][prop].default, block: false };
					} else if ('validate' in proto[schema.dtTmplProp][prop]) {


						set[prop] = { val: undefined, block: false };
					}
				});
			} else {
				(0, _keys2.default)(set).forEach(function (prop) {
					if (proto.hasOwnProperty(prop)) set[prop] = { val: undefined, block: true };
				});
			}
		}

		(0, _preventExtensions2.default)(dtConstructor);

		if (this.lookupClass(clName)) throw new Error('A class named \'' + clName + '\' has already been defined');
		var clObj = {
			dtConstructor: dtConstructor,
			dtClass: dtClass,
			name: clName };

		this.classes.byName.set(clName, clObj);
		this.classes.byClass.set(dtClass, clObj);
		this.classes.byConstructor.set(dtConstructor, clObj);

		return dtConstructor;
	};
	DataTrue.prototype = (0, _create2.default)(Object.prototype, {




		createClass: {
			value: createClass,
			writable: false,
			configurable: false },

		isDataTrueObject: { value: function value(obj) {
				return (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) === 'object' &&
				this.dtProp in obj &&
				'DT_OBJECT_FLAG' in obj[this.dtProp] &&
				obj[this.dtProp].DT_OBJECT_FLAG === DT_OBJECT_FLAG;
			} },
		isDataTrueClass: { value: function value(cl) {return this.lookupClass(cl) !== false;} },
		getDataTrueClass: { value: function value(obj) {
				if (!this.isDataTrueObject(obj)) throw new Error('Attempt to get DataTrue class on a value that\'s not a DataTrue object');
				return obj[this.dtProp].dtclass;
			} },
		dtPrefix: { get: function get() {return this.opts.dtPrefix;} },
		dtProp: { get: function get() {return this.dtPrefix;} },
		dtTmplProp: { get: function get() {return this.dtPrefix + 'Template';} },
		atomicSetProp: { get: function get() {return this.opts.atomicSet;} },
		atomicSet: { value: function value(setter, inConstructor) {var _this4 = this;


				if (!inConstructor === true && this.validating !== false) throw new Error('Internal Error: atomicSet called recursivly. That should be impossible');


				if (!(this.validating instanceof _map2.default)) this.validating = new _map2.default();
				setter([]);


				var valid = true;
				var resultCache = new _map2.default();
				this.validating.forEach(function (errs, keyObj) {

					valid = _this4.getDataTrueClass(keyObj).validate(keyObj, resultCache) && valid;
				});


				this.validating.forEach(function (e, o) {
					var cl = _this4.getDataTrueClass(o);
					if (valid) {
						cl.acceptNewValues(o);
					} else {
						cl.rejectNewValues(o);
					}
				});


				var validating = this.validating;
				this.validating = false;

				if (!valid) throw new AtomicSetError(validating);

			} },

		lookupClass: { value: function value(key) {
				switch (typeof key === 'undefined' ? 'undefined' : (0, _typeof3.default)(key)) {
					case 'string':
						var cl = this.classes.byName.get(key);
						if (cl) return cl.dtConstructor;
						break;
					case 'function':
						cl = this.classes.byConstructor.get(key);
						if (cl) return cl.dtConstructor;
						break;
					case 'object':
						cl = this.classes.byClass.get(key);
						if (cl) return cl.dtConstructor;
						break;
					default:
						throw new Error('Attempt to lookup class with key of unsupported type \'' + (typeof key === 'undefined' ? 'undefined' : (0, _typeof3.default)(key)) + '\': \'' + key + '\'');}

				return false;
			} } });


	var JS_DEFINE_PROP_KEYS = ['enumerable', 'writable', 'configurable'];
	var genProp = function genProp(name, tmpl, dtcl) {

		if ('value' in tmpl) {
			if ('validate' in tmpl) throw new Error('You defined both \'value\' and \'validate\' for the \'' + name + '\' property. DataTrue cannot validate properties for which you directly define a value. To set a default value, use \'default\' instead. You should should generally only use \'value\' to define methods of your DataTrue class.');
			return tmpl;
		}
		var getMunge = 'get' in tmpl ?
		tmpl.get :
		function (value) {return value;};
		var setMunge = 'set' in tmpl ?
		tmpl.set :
		function (value) {return value;};
		var prop = {
			configurable: false,
			get: function get() {
				return getMunge(
				dtcl.dt.validating !== false && name in dtcl.newValues(this) ?
				dtcl.newValues(this)[name].value :
				dtcl.data(this)[name]);

			},
			set: function set(data) {var _this5 = this;
				data = setMunge(data);
				if (dtcl.dt.validating !== false) {

					var validate = false;
					if ('validate' in tmpl) {
						validate = tmpl.validate;

						if (!dtcl.dt.validating.has(this)) dtcl.dt.validating.set(this, {});
					}

					dtcl.newValues(this)[name] = {
						value: data,
						validate: validate };

				} else {
					dtcl.atomicSet(function () {
						_this5[name] = data;
					});
				}
			} };

		(0, _keys2.default)(tmpl).forEach(function (p) {
			if (['get', 'set', 'default', 'validate'].indexOf(p) >= 0) return;
			if (JS_DEFINE_PROP_KEYS.indexOf(p) < 0) {
				throw new Error('No such property configuration option \'' + p + '\' for property \'' + name + '\'');
			}
			prop[p] = tmpl[p];
		});

		return prop;
	};

	var Validator = function Validator(validator, applyTo) {
		if (arguments.length < 1) throw new Error('You must supply a validator function as the first argument');
		if (typeof validator !== 'function') throw new Error('validator (1st argument) must be a function, you gave me a \'' + (typeof validator === 'undefined' ? 'undefined' : (0, _typeof3.default)(validator)) + '\'');
		this.validator = validator;
		if (['function', 'object', 'boolean', 'undefined'].indexOf(typeof applyTo === 'undefined' ? 'undefined' : (0, _typeof3.default)(applyTo)) <= -1) {
			throw new Error('applyTo (2nd argument) must be a function, you gave me a \'' + (typeof applyTo === 'undefined' ? 'undefined' : (0, _typeof3.default)(applyTo)) + '\'');
		}
		this.applyTo = applyTo;
		(0, _freeze2.default)(this);
	};
	Validator.prototype = (0, _create2.default)(Object.prototype, {
		run: { value: function value(obj, resultCache, errMap, errs) {
				var applyTo = void 0;
				switch ((0, _typeof3.default)(this.applyTo)) {
					case 'function':
						applyTo = this.applyTo.apply(obj, []);
						break;
					case 'object':
						applyTo = this.applyTo;
						break;
					case 'boolean':
					case 'undefined':
						applyTo = obj;
						break;
					default:
						throw new Error('BUG: applyTo has invalid type: \'' + (0, _typeof3.default)(this.applyTo) + '\'. This should be impossible since we check in the constructor as well.');}


				var runResult = {
					appliedTo: applyTo,
					returnValue: undefined,
					exception: false,
					cached: false };


				if (resultCache.has(applyTo)) {
					if (resultCache.get(applyTo).has(this.validator)) {
						runResult.cached = true;
						var result = resultCache.get(applyTo).get(this.validator);
						if (result instanceof Error) {
							return false;
						} else {
							return true;
						}
					}
				} else {
					resultCache.set(applyTo, new _map2.default());
				}

				try {
					runResult.returnValue = resultCache.get(applyTo).set(this.validator, this.validator.apply(applyTo, []));
				} catch (e) {
					resultCache.get(applyTo).set(this.validator, e);
					runResult.exception = e;
					errMap.get(this.validator).setResults(runResult, obj, errs);
					return false;
				}
				return true;
			} } });var



	DataTrueClass = function () {
		function DataTrueClass(clName, template, dataTrue, proto) {var _this6 = this;(0, _classCallCheck3.default)(this, DataTrueClass);
			this.name = clName;
			this.dt = dataTrue;
			this.proto = proto;


			(0, _keys2.default)(template).forEach(function (prop) {
				if ('validate' in template[prop]) {
					if ('value' in template[prop]) throw new Error('You defined both \'value\' and \'validate\' for the \'' + prop + '\' property. DataTrue cannot validate properties for which you directly define a value. To set a default value, use \'default\' instead of \'value\'. You should should generally only use \'value\' to define methods of DataTrue classes.');
				} else {
					if ('value' in template[prop]) return;
					template[prop].validate = [];
					return;
				}

				if (Array.isArray(template[prop].validate)) {(function () {
						var vo = {};
						template[prop].validate.forEach(function (v, i) {
							vo[i] = v;
						});
						template[prop].validate = vo;})();
				} else if ((0, _typeof3.default)(template[prop].validate) !== 'object' || template[prop].validate instanceof Validator) {
					template[prop].validate = { '': template[prop].validate };
				}
				(0, _keys2.default)(template[prop].validate).forEach(function (vname) {
					var v = template[prop].validate[vname];
					switch (typeof v === 'undefined' ? 'undefined' : (0, _typeof3.default)(v)) {
						case 'string':
							if (!(v in template)) throw new Error('You requested that we call \'' + v + '\' on property \'' + prop + '\', but there is no such method defined.');
							if (!('value' in template[v])) {
								throw new Error('You requested that we call \'' + v + '\' on property \'' + prop + '\', but \'' + v + '\' is a property managed by DataTrue. We were expecting a function. Perhapse you wanted to make \'' + prop + '\' a method of your class by setting the \'value\' key for that property to a function in your object template.');
							} else {
								if (typeof template[v].value !== 'function') throw new Error('You requested that we call \'' + v + '\' to validate property \'' + prop + '\', but \'' + v + '\' is a \'' + (0, _typeof3.default)(template[v].value) + '\', not a function');
							}
							if ('writable' in template[v]) {
								if (!dataTrue.opts.writableValidatorMethods && template[v].writable) throw new Error('You\'re using method ' + v + ' as a validator for property ' + prop + ', but you\'re also trying to make the property ' + v + ' writable. ' + prop + ' MUST be a function. If you write something other than a function to that property later bad things happen. Therefore this is verboten unless you set the \'writableValidatorMethods\' option to true when instantiating your DataTrue schema object.');
							} else {
								template[v].writable = false;
							}
							if ('configurable' in template[v]) {
								if (!dataTrue.opts.configurableValidatorMethods && template[v].configurable) throw new Error('You\'re using method ' + v + ' as a validator for property ' + prop + ', but you\'re also trying to make the property ' + v + ' configurable. ' + prop + ' MUST be a function. If you write something other than a function to that property later bad things happen. Therefore this is verboten unless you set the \'configurableValidatorMethods\' option to true when instantiating your DataTrue schema object.');
							} else {
								template[v].configurable = false;
							}
							template[prop].validate[vname] = new Validator(template[v].value);
							break;
						case 'function':
							template[prop].validate[vname] = new Validator(v);
							break;
						case 'object':
							if (!(v instanceof Validator)) throw new Error('You passed an object that wasn\'t a DataTrue.Validator as the validator named \'' + vname + '\' for property \'' + prop + '\'');
							break;
						default:
							throw new Error('You passed something of type \'' + (typeof v === 'undefined' ? 'undefined' : (0, _typeof3.default)(v)) + '\' as the validator named \'' + vname + '\' for property \'' + prop + '\'. That doesn\'t make sense. Please see the DataTrue documentation.');}





					if (!_this6.dt.validators.has(template[prop].validate[vname].validator)) {
						_this6.dt.validators.set(template[prop].validate[vname].validator, new ValidatorObjectMap());
					}

				});
			});
			this.template = template;
			(0, _freeze2.default)(this.template);
		}(0, _createClass3.default)(DataTrueClass, [{ key: 'getFullTemplate', value: function getFullTemplate(


			obj) {var _this7 = this;
				var proto = obj;
				var tmpl = {};
				while (proto) {
					if (proto.hasOwnProperty(this.dt.dtTmplProp)) {
						(0, _getOwnPropertyNames2.default)(proto[this.dt.dtTmplProp]).forEach(function (prop) {
							if (prop in tmpl) return;
							tmpl[prop] = proto[_this7.dt.dtTmplProp][prop];
						});
					}
					proto = (0, _getPrototypeOf2.default)(proto);
				}
				return tmpl;
			} }, { key: 'data', value: function data(





			obj) {return obj[this.dtProp]._;} }, { key: 'newValues', value: function newValues(

			obj) {

				if (this.dt.validating === false) throw new Error('Internal Error: newValues called when we\'re not validating.');
				if (!('__' in obj[this.dtProp])) obj[this.dtProp].__ = {};
				return obj[this.dtProp].__;
			} }, { key: 'validate', value: function validate(

			obj, resultCache) {var _this8 = this;
				var valid = true;
				var newValues = this.newValues(obj);
				(0, _keys2.default)(newValues).forEach(function (value) {
					if (!newValues[value].validate) return;
					(0, _keys2.default)(newValues[value].validate).forEach(function (vname) {
						valid = newValues[value].validate[vname].run(obj, resultCache, _this8.dt.validators, _this8.dt.validating) && valid;
					});
				});
				return valid;
			} }, { key: 'acceptNewValues', value: function acceptNewValues(

			obj) {var _this9 = this;

				if (this.dt.validating === false) throw new Error('Internal Error: acceptNewValues called when we\'re not validating.');
				(0, _keys2.default)(this.newValues(obj)).forEach(function (value) {
					_this9.data(obj)[value] = _this9.newValues(obj)[value].value;
				});
				delete obj[this.dtProp].__;
			} }, { key: 'rejectNewValues', value: function rejectNewValues(

			obj) {

				if (this.dt.validating === false) throw new Error('Internal Error: rejectNewValues called when we\'re not validating.');
				delete obj[this.dtProp].__;
			} }, { key: 'mapValidators', value: function mapValidators(





			obj) {var _this10 = this;
				var tmpl = this.getFullTemplate(obj);
				(0, _keys2.default)(tmpl).forEach(function (prop) {
					if (!('validate' in tmpl[prop])) return;
					(0, _keys2.default)(tmpl[prop].validate).forEach(function (vname) {
						var applyTo = tmpl[prop].validate[vname].applyTo;
						if (typeof applyTo === 'boolean' || typeof applyTo === 'undefined') applyTo = obj;
						_this10.dt.validators.get(tmpl[prop].validate[vname].validator).add(applyTo, prop, vname);
					});
				});
			} }, { key: 'init', value: function init(

			obj) {
				(0, _defineProperty2.default)(obj, this.dtProp, {
					value: {
						dt: this.dt,
						dtclass: this,
						_: {},
						DT_OBJECT_FLAG: DT_OBJECT_FLAG } });


				this.mapValidators(obj);
			} }, { key: 'atomicSet', value: function atomicSet(

			setter, inConstructor) {
				return this.dt.atomicSet(setter, inConstructor);
			} }, { key: 'dtProp', get: function get() {return this.dt.dtProp;}, set: function set(v) {throw new Error('You may not change the DataTrue property after you instantiated a DataTrue schema. ');} }]);return DataTrueClass;}();var

	ValidatorObjectMap = function () {
		function ValidatorObjectMap() {(0, _classCallCheck3.default)(this, ValidatorObjectMap);
			this.objects = new _map2.default();
			this.functions = new _map2.default();
		}(0, _createClass3.default)(ValidatorObjectMap, [{ key: 'add', value: function add(
			item, prop, vname) {
				var spec = { property: prop, validator: vname };
				var itemType = (typeof item === 'undefined' ? 'undefined' : (0, _typeof3.default)(item)) + 's';
				switch (itemType) {
					case 'functions':
					case 'objects':
						break;
					default:
						throw new Error('BUG: ValidatorObjectMap.add() got something other than a function or an object. That should be impossible.');}

				var specList = [];
				if (this[itemType].has(item)) {
					specList = this[itemType].get(item);
				} else {
					this[itemType].set(item, specList);
				}
				specList.push(spec);
			} }, { key: 'setResults', value: function setResults(

			result, obj, errObj) {

				if (result.exception === false) throw new Error('setResults called when no exception was thrown');

				var getErrs = function getErrs(o) {
					var errs = {};
					if (errObj.has(o)) {
						errs = errObj.get(o);
					} else {
						errObj.set(o, errs);
					}
					return errs;
				};

				var doSet = function doSet(errs, specList) {
					specList.forEach(function (spec) {
						if (!(spec.property in errs)) errs[spec.property] = {};
						if (spec.validator in errs[spec.property]) throw new Error('Internal Error: validator \'' + spec.validator + '\' already defined for property \'' + spec.property + '\' on this object. That should be impossible.');
						errs[spec.property][spec.validator] = result.exception;
					});
				};


				if (result.appliedTo === obj) {
					if (this.objects.has(obj)) {
						doSet(getErrs(obj), this.objects.get(result.appliedTo));
					} else {
						throw new Error('BUG: DataTrue validator called on an object that had no registered validators');
					}
				}
				this.functions.forEach(function (specList, applyTo) {
					var appliedTo = applyTo.apply(obj, []);
					if (appliedTo !== result.appliedTo) return;
					doSet(getErrs(appliedTo), specList);
				});
			} }]);return ValidatorObjectMap;}();var

	AtomicSetError = function (_Error) {(0, _inherits3.default)(AtomicSetError, _Error);
		function AtomicSetError(exceptions) {(0, _classCallCheck3.default)(this, AtomicSetError);
			var msgs = new _map2.default();
			exceptions.forEach(function (errs, keyObj) {
				(0, _keys2.default)(errs).forEach(function (value) {
					(0, _keys2.default)(errs[value]).forEach(function (vname) {
						if (msgs.has(errs[value][vname])) return;
						msgs.set(errs[value][vname], errs[value][vname].message);
					});
				});
			});var _this11 = (0, _possibleConstructorReturn3.default)(this, (AtomicSetError.__proto__ || (0, _getPrototypeOf2.default)(AtomicSetError)).call(this,
			(0, _from2.default)(msgs.values()).join('\n')));



			_this11.AtomicSetError = true;
			_this11.exceptions = exceptions;



			Object.defineProperty(_this11, 'getExceptionsFor', { value: function value(object, property, validator) {
					if (!this.exceptions.has(object)) false;
					var oe = this.exceptions.get(object);
					if (!property) return oe;
					if (!(property in oe)) false;
					var pe = oe[property];
					if (validator === true) return pe;
					if (validator === false) return (0, _keys2.default)(pe).map(function (vname) {return pe[vname];});
					if (!(validator in pe)) false;
					return pe[validator];
				} });
			(0, _freeze2.default)(_this11);return _this11;
		}return AtomicSetError;}(Error);exports.




	default = DataTrue;exports.
	AtomicSetError = AtomicSetError;exports.
	Validator = Validator;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(2), __esModule: true };

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	__webpack_require__(47);
	module.exports = __webpack_require__(11).Array.from;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(4)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(7)(String, 'String', function(iterated){
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , index = this._i
	    , point;
	  if(index >= O.length)return {value: undefined, done: true};
	  point = $at(O, index);
	  this._i += point.length;
	  return {value: point, done: false};
	});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(5)
	  , defined   = __webpack_require__(6);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function(TO_STRING){
	  return function(that, pos){
	    var s = String(defined(that))
	      , i = toInteger(pos)
	      , l = s.length
	      , a, b;
	    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(8)
	  , $export        = __webpack_require__(9)
	  , redefine       = __webpack_require__(24)
	  , hide           = __webpack_require__(14)
	  , has            = __webpack_require__(25)
	  , Iterators      = __webpack_require__(26)
	  , $iterCreate    = __webpack_require__(27)
	  , setToStringTag = __webpack_require__(43)
	  , getPrototypeOf = __webpack_require__(45)
	  , ITERATOR       = __webpack_require__(44)('iterator')
	  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
	  , FF_ITERATOR    = '@@iterator'
	  , KEYS           = 'keys'
	  , VALUES         = 'values';

	var returnThis = function(){ return this; };

	module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function(kind){
	    if(!BUGGY && kind in proto)return proto[kind];
	    switch(kind){
	      case KEYS: return function keys(){ return new Constructor(this, kind); };
	      case VALUES: return function values(){ return new Constructor(this, kind); };
	    } return function entries(){ return new Constructor(this, kind); };
	  };
	  var TAG        = NAME + ' Iterator'
	    , DEF_VALUES = DEFAULT == VALUES
	    , VALUES_BUG = false
	    , proto      = Base.prototype
	    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
	    , $default   = $native || getMethod(DEFAULT)
	    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
	    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
	    , methods, key, IteratorPrototype;
	  // Fix native
	  if($anyNative){
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
	    if(IteratorPrototype !== Object.prototype){
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if(DEF_VALUES && $native && $native.name !== VALUES){
	    VALUES_BUG = true;
	    $default = function values(){ return $native.call(this); };
	  }
	  // Define iterator
	  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG]  = returnThis;
	  if(DEFAULT){
	    methods = {
	      values:  DEF_VALUES ? $default : getMethod(VALUES),
	      keys:    IS_SET     ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if(FORCED)for(key in methods){
	      if(!(key in proto))redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(10)
	  , core      = __webpack_require__(11)
	  , ctx       = __webpack_require__(12)
	  , hide      = __webpack_require__(14)
	  , PROTOTYPE = 'prototype';

	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , expProto  = exports[PROTOTYPE]
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(a, b, c){
	        if(this instanceof C){
	          switch(arguments.length){
	            case 0: return new C;
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if(IS_PROTO){
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library` 
	module.exports = $export;

/***/ },
/* 10 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 11 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(13);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(15)
	  , createDesc = __webpack_require__(23);
	module.exports = __webpack_require__(19) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(16)
	  , IE8_DOM_DEFINE = __webpack_require__(18)
	  , toPrimitive    = __webpack_require__(22)
	  , dP             = Object.defineProperty;

	exports.f = __webpack_require__(19) ? Object.defineProperty : function defineProperty(O, P, Attributes){
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if(IE8_DOM_DEFINE)try {
	    return dP(O, P, Attributes);
	  } catch(e){ /* empty */ }
	  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
	  if('value' in Attributes)O[P] = Attributes.value;
	  return O;
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(17);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 17 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(19) && !__webpack_require__(20)(function(){
	  return Object.defineProperty(__webpack_require__(21)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(20)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(17)
	  , document = __webpack_require__(10).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(17);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function(it, S){
	  if(!isObject(it))return it;
	  var fn, val;
	  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
	  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
	  throw TypeError("Can't convert object to primitive value");
	};

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(14);

/***/ },
/* 25 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(28)
	  , descriptor     = __webpack_require__(23)
	  , setToStringTag = __webpack_require__(43)
	  , IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(14)(IteratorPrototype, __webpack_require__(44)('iterator'), function(){ return this; });

	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(16)
	  , dPs         = __webpack_require__(29)
	  , enumBugKeys = __webpack_require__(41)
	  , IE_PROTO    = __webpack_require__(38)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(21)('iframe')
	    , i      = enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(42).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};

	module.exports = Object.create || function create(O, Properties){
	  var result;
	  if(O !== null){
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty;
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(15)
	  , anObject = __webpack_require__(16)
	  , getKeys  = __webpack_require__(30);

	module.exports = __webpack_require__(19) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(31)
	  , enumBugKeys = __webpack_require__(41);

	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(25)
	  , toIObject    = __webpack_require__(32)
	  , arrayIndexOf = __webpack_require__(35)(false)
	  , IE_PROTO     = __webpack_require__(38)('IE_PROTO');

	module.exports = function(object, names){
	  var O      = toIObject(object)
	    , i      = 0
	    , result = []
	    , key;
	  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while(names.length > i)if(has(O, key = names[i++])){
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(33)
	  , defined = __webpack_require__(6);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(34);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 34 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(32)
	  , toLength  = __webpack_require__(36)
	  , toIndex   = __webpack_require__(37);
	module.exports = function(IS_INCLUDES){
	  return function($this, el, fromIndex){
	    var O      = toIObject($this)
	      , length = toLength(O.length)
	      , index  = toIndex(fromIndex, length)
	      , value;
	    // Array#includes uses SameValueZero equality algorithm
	    if(IS_INCLUDES && el != el)while(length > index){
	      value = O[index++];
	      if(value != value)return true;
	    // Array#toIndex ignores holes, Array#includes - not
	    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
	      if(O[index] === el)return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(5)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(5)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(39)('keys')
	  , uid    = __webpack_require__(40);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(10)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 40 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 41 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(10).document && document.documentElement;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(15).f
	  , has = __webpack_require__(25)
	  , TAG = __webpack_require__(44)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(39)('wks')
	  , uid        = __webpack_require__(40)
	  , Symbol     = __webpack_require__(10).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

	$exports.store = store;

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(25)
	  , toObject    = __webpack_require__(46)
	  , IE_PROTO    = __webpack_require__(38)('IE_PROTO')
	  , ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(6);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var ctx            = __webpack_require__(12)
	  , $export        = __webpack_require__(9)
	  , toObject       = __webpack_require__(46)
	  , call           = __webpack_require__(48)
	  , isArrayIter    = __webpack_require__(49)
	  , toLength       = __webpack_require__(36)
	  , createProperty = __webpack_require__(50)
	  , getIterFn      = __webpack_require__(51);

	$export($export.S + $export.F * !__webpack_require__(53)(function(iter){ Array.from(iter); }), 'Array', {
	  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
	  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
	    var O       = toObject(arrayLike)
	      , C       = typeof this == 'function' ? this : Array
	      , aLen    = arguments.length
	      , mapfn   = aLen > 1 ? arguments[1] : undefined
	      , mapping = mapfn !== undefined
	      , index   = 0
	      , iterFn  = getIterFn(O)
	      , length, result, step, iterator;
	    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
	    // if object isn't iterable or it's array with default iterator - use simple case
	    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
	      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
	        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
	      }
	    } else {
	      length = toLength(O.length);
	      for(result = new C(length); length > index; index++){
	        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
	      }
	    }
	    result.length = index;
	    return result;
	  }
	});


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(16);
	module.exports = function(iterator, fn, value, entries){
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch(e){
	    var ret = iterator['return'];
	    if(ret !== undefined)anObject(ret.call(iterator));
	    throw e;
	  }
	};

/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators  = __webpack_require__(26)
	  , ITERATOR   = __webpack_require__(44)('iterator')
	  , ArrayProto = Array.prototype;

	module.exports = function(it){
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $defineProperty = __webpack_require__(15)
	  , createDesc      = __webpack_require__(23);

	module.exports = function(object, index, value){
	  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
	  else object[index] = value;
	};

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	var classof   = __webpack_require__(52)
	  , ITERATOR  = __webpack_require__(44)('iterator')
	  , Iterators = __webpack_require__(26);
	module.exports = __webpack_require__(11).getIteratorMethod = function(it){
	  if(it != undefined)return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(34)
	  , TAG = __webpack_require__(44)('toStringTag')
	  // ES3 wrong here
	  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function(it, key){
	  try {
	    return it[key];
	  } catch(e){ /* empty */ }
	};

	module.exports = function(it){
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	var ITERATOR     = __webpack_require__(44)('iterator')
	  , SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function(){ SAFE_CLOSING = true; };
	  Array.from(riter, function(){ throw 2; });
	} catch(e){ /* empty */ }

	module.exports = function(exec, skipClosing){
	  if(!skipClosing && !SAFE_CLOSING)return false;
	  var safe = false;
	  try {
	    var arr  = [7]
	      , iter = arr[ITERATOR]();
	    iter.next = function(){ return {done: safe = true}; };
	    arr[ITERATOR] = function(){ return iter; };
	    exec(arr);
	  } catch(e){ /* empty */ }
	  return safe;
	};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _typeof2 = __webpack_require__(55);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
	};

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _iterator = __webpack_require__(56);

	var _iterator2 = _interopRequireDefault(_iterator);

	var _symbol = __webpack_require__(63);

	var _symbol2 = _interopRequireDefault(_symbol);

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(57), __esModule: true };

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	__webpack_require__(58);
	module.exports = __webpack_require__(62).f('iterator');

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(59);
	var global        = __webpack_require__(10)
	  , hide          = __webpack_require__(14)
	  , Iterators     = __webpack_require__(26)
	  , TO_STRING_TAG = __webpack_require__(44)('toStringTag');

	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(60)
	  , step             = __webpack_require__(61)
	  , Iterators        = __webpack_require__(26)
	  , toIObject        = __webpack_require__(32);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(7)(Array, 'Array', function(iterated, kind){
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function(){
	  var O     = this._t
	    , kind  = this._k
	    , index = this._i++;
	  if(!O || index >= O.length){
	    this._t = undefined;
	    return step(1);
	  }
	  if(kind == 'keys'  )return step(0, index);
	  if(kind == 'values')return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

/***/ },
/* 60 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 61 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(44);

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(64), __esModule: true };

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(65);
	__webpack_require__(76);
	__webpack_require__(77);
	__webpack_require__(78);
	module.exports = __webpack_require__(11).Symbol;

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var global         = __webpack_require__(10)
	  , has            = __webpack_require__(25)
	  , DESCRIPTORS    = __webpack_require__(19)
	  , $export        = __webpack_require__(9)
	  , redefine       = __webpack_require__(24)
	  , META           = __webpack_require__(66).KEY
	  , $fails         = __webpack_require__(20)
	  , shared         = __webpack_require__(39)
	  , setToStringTag = __webpack_require__(43)
	  , uid            = __webpack_require__(40)
	  , wks            = __webpack_require__(44)
	  , wksExt         = __webpack_require__(62)
	  , wksDefine      = __webpack_require__(67)
	  , keyOf          = __webpack_require__(68)
	  , enumKeys       = __webpack_require__(69)
	  , isArray        = __webpack_require__(72)
	  , anObject       = __webpack_require__(16)
	  , toIObject      = __webpack_require__(32)
	  , toPrimitive    = __webpack_require__(22)
	  , createDesc     = __webpack_require__(23)
	  , _create        = __webpack_require__(28)
	  , gOPNExt        = __webpack_require__(73)
	  , $GOPD          = __webpack_require__(75)
	  , $DP            = __webpack_require__(15)
	  , $keys          = __webpack_require__(30)
	  , gOPD           = $GOPD.f
	  , dP             = $DP.f
	  , gOPN           = gOPNExt.f
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , PROTOTYPE      = 'prototype'
	  , HIDDEN         = wks('_hidden')
	  , TO_PRIMITIVE   = wks('toPrimitive')
	  , isEnum         = {}.propertyIsEnumerable
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , OPSymbols      = shared('op-symbols')
	  , ObjectProto    = Object[PROTOTYPE]
	  , USE_NATIVE     = typeof $Symbol == 'function'
	  , QObject        = global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(dP({}, 'a', {
	    get: function(){ return dP(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = gOPD(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  dP(it, key, D);
	  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
	} : dP;

	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
	  return typeof it == 'symbol';
	} : function(it){
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D){
	  if(it === ObjectProto)$defineProperty(OPSymbols, key, D);
	  anObject(it);
	  key = toPrimitive(key, true);
	  anObject(D);
	  if(has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key = toPrimitive(key, true));
	  if(this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return false;
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  it  = toIObject(it);
	  key = toPrimitive(key, true);
	  if(it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key))return;
	  var D = gOPD(it, key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = gOPN(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var IS_OP  = it === ObjectProto
	    , names  = gOPN(IS_OP ? OPSymbols : toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i){
	    if(has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true))result.push(AllSymbols[key]);
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if(!USE_NATIVE){
	  $Symbol = function Symbol(){
	    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
	    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function(value){
	      if(this === ObjectProto)$set.call(OPSymbols, value);
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    };
	    if(DESCRIPTORS && setter)setSymbolDesc(ObjectProto, tag, {configurable: true, set: $set});
	    return wrap(tag);
	  };
	  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
	    return this._k;
	  });

	  $GOPD.f = $getOwnPropertyDescriptor;
	  $DP.f   = $defineProperty;
	  __webpack_require__(74).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(71).f  = $propertyIsEnumerable;
	  __webpack_require__(70).f = $getOwnPropertySymbols;

	  if(DESCRIPTORS && !__webpack_require__(8)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  wksExt.f = function(name){
	    return wrap(wks(name));
	  }
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

	for(var symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), i = 0; symbols.length > i; )wks(symbols[i++]);

	for(var symbols = $keys(wks.store), i = 0; symbols.length > i; )wksDefine(symbols[i++]);

	$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    if(isSymbol(key))return keyOf(SymbolRegistry, key);
	    throw TypeError(key + ' is not a symbol!');
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	});

	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it){
	    if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	    var args = [it]
	      , i    = 1
	      , replacer, $replacer;
	    while(arguments.length > i)args.push(arguments[i++]);
	    replacer = args[1];
	    if(typeof replacer == 'function')$replacer = replacer;
	    if($replacer || !isArray(replacer))replacer = function(key, value){
	      if($replacer)value = $replacer.call(this, key, value);
	      if(!isSymbol(value))return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(14)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var META     = __webpack_require__(40)('meta')
	  , isObject = __webpack_require__(17)
	  , has      = __webpack_require__(25)
	  , setDesc  = __webpack_require__(15).f
	  , id       = 0;
	var isExtensible = Object.isExtensible || function(){
	  return true;
	};
	var FREEZE = !__webpack_require__(20)(function(){
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function(it){
	  setDesc(it, META, {value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  }});
	};
	var fastKey = function(it, create){
	  // return primitive with prefix
	  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return 'F';
	    // not necessary to add metadata
	    if(!create)return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function(it, create){
	  if(!has(it, META)){
	    // can't set metadata to uncaught frozen object
	    if(!isExtensible(it))return true;
	    // not necessary to add metadata
	    if(!create)return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function(it){
	  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY:      META,
	  NEED:     false,
	  fastKey:  fastKey,
	  getWeak:  getWeak,
	  onFreeze: onFreeze
	};

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	var global         = __webpack_require__(10)
	  , core           = __webpack_require__(11)
	  , LIBRARY        = __webpack_require__(8)
	  , wksExt         = __webpack_require__(62)
	  , defineProperty = __webpack_require__(15).f;
	module.exports = function(name){
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
	};

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	var getKeys   = __webpack_require__(30)
	  , toIObject = __webpack_require__(32);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(30)
	  , gOPS    = __webpack_require__(70)
	  , pIE     = __webpack_require__(71);
	module.exports = function(it){
	  var result     = getKeys(it)
	    , getSymbols = gOPS.f;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = pIE.f
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
	  } return result;
	};

/***/ },
/* 70 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 71 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(34);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(32)
	  , gOPN      = __webpack_require__(74).f
	  , toString  = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function(it){
	  try {
	    return gOPN(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};

	module.exports.f = function getOwnPropertyNames(it){
	  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys      = __webpack_require__(31)
	  , hiddenKeys = __webpack_require__(41).concat('length', 'prototype');

	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
	  return $keys(O, hiddenKeys);
	};

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var pIE            = __webpack_require__(71)
	  , createDesc     = __webpack_require__(23)
	  , toIObject      = __webpack_require__(32)
	  , toPrimitive    = __webpack_require__(22)
	  , has            = __webpack_require__(25)
	  , IE8_DOM_DEFINE = __webpack_require__(18)
	  , gOPD           = Object.getOwnPropertyDescriptor;

	exports.f = __webpack_require__(19) ? gOPD : function getOwnPropertyDescriptor(O, P){
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if(IE8_DOM_DEFINE)try {
	    return gOPD(O, P);
	  } catch(e){ /* empty */ }
	  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
	};

/***/ },
/* 76 */
/***/ function(module, exports) {

	

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(67)('asyncIterator');

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(67)('observable');

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _setPrototypeOf = __webpack_require__(80);

	var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

	var _create = __webpack_require__(84);

	var _create2 = _interopRequireDefault(_create);

	var _typeof2 = __webpack_require__(55);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
	  }

	  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
	};

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(81), __esModule: true };

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(82);
	module.exports = __webpack_require__(11).Object.setPrototypeOf;

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $export = __webpack_require__(9);
	$export($export.S, 'Object', {setPrototypeOf: __webpack_require__(83).set});

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var isObject = __webpack_require__(17)
	  , anObject = __webpack_require__(16);
	var check = function(O, proto){
	  anObject(O);
	  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	    function(test, buggy, set){
	      try {
	        set = __webpack_require__(12)(Function.call, __webpack_require__(75).f(Object.prototype, '__proto__').set, 2);
	        set(test, []);
	        buggy = !(test instanceof Array);
	      } catch(e){ buggy = true; }
	      return function setPrototypeOf(O, proto){
	        check(O, proto);
	        if(buggy)O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }({}, false) : undefined),
	  check: check
	};

/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(85), __esModule: true };

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(86);
	var $Object = __webpack_require__(11).Object;
	module.exports = function create(P, D){
	  return $Object.create(P, D);
	};

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(9)
	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	$export($export.S, 'Object', {create: __webpack_require__(28)});

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(88), __esModule: true };

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(89);
	var $Object = __webpack_require__(11).Object;
	module.exports = function defineProperty(it, key, desc){
	  return $Object.defineProperty(it, key, desc);
	};

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(9);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(19), 'Object', {defineProperty: __webpack_require__(15).f});

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(91), __esModule: true };

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(92);
	var $Object = __webpack_require__(11).Object;
	module.exports = function getOwnPropertyNames(it){
	  return $Object.getOwnPropertyNames(it);
	};

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 Object.getOwnPropertyNames(O)
	__webpack_require__(93)('getOwnPropertyNames', function(){
	  return __webpack_require__(73).f;
	});

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(9)
	  , core    = __webpack_require__(11)
	  , fails   = __webpack_require__(20);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 94 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _defineProperty = __webpack_require__(87);

	var _defineProperty2 = _interopRequireDefault(_defineProperty);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(97), __esModule: true };

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(98);
	module.exports = __webpack_require__(11).Object.preventExtensions;

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.15 Object.preventExtensions(O)
	var isObject = __webpack_require__(17)
	  , meta     = __webpack_require__(66).onFreeze;

	__webpack_require__(93)('preventExtensions', function($preventExtensions){
	  return function preventExtensions(it){
	    return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
	  };
	});

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(100), __esModule: true };

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(101);
	module.exports = __webpack_require__(11).Object.getPrototypeOf;

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 Object.getPrototypeOf(O)
	var toObject        = __webpack_require__(46)
	  , $getPrototypeOf = __webpack_require__(45);

	__webpack_require__(93)('getPrototypeOf', function(){
	  return function getPrototypeOf(it){
	    return $getPrototypeOf(toObject(it));
	  };
	});

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(103), __esModule: true };

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(104);
	module.exports = __webpack_require__(11).Object.seal;

/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.17 Object.seal(O)
	var isObject = __webpack_require__(17)
	  , meta     = __webpack_require__(66).onFreeze;

	__webpack_require__(93)('seal', function($seal){
	  return function seal(it){
	    return $seal && isObject(it) ? $seal(meta(it)) : it;
	  };
	});

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(106), __esModule: true };

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(76);
	__webpack_require__(3);
	__webpack_require__(58);
	__webpack_require__(107);
	__webpack_require__(117);
	module.exports = __webpack_require__(11).Map;

/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var strong = __webpack_require__(108);

	// 23.1 Map Objects
	module.exports = __webpack_require__(113)('Map', function(get){
	  return function Map(){ return get(this, arguments.length > 0 ? arguments[0] : undefined); };
	}, {
	  // 23.1.3.6 Map.prototype.get(key)
	  get: function get(key){
	    var entry = strong.getEntry(this, key);
	    return entry && entry.v;
	  },
	  // 23.1.3.9 Map.prototype.set(key, value)
	  set: function set(key, value){
	    return strong.def(this, key === 0 ? 0 : key, value);
	  }
	}, strong, true);

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var dP          = __webpack_require__(15).f
	  , create      = __webpack_require__(28)
	  , redefineAll = __webpack_require__(109)
	  , ctx         = __webpack_require__(12)
	  , anInstance  = __webpack_require__(110)
	  , defined     = __webpack_require__(6)
	  , forOf       = __webpack_require__(111)
	  , $iterDefine = __webpack_require__(7)
	  , step        = __webpack_require__(61)
	  , setSpecies  = __webpack_require__(112)
	  , DESCRIPTORS = __webpack_require__(19)
	  , fastKey     = __webpack_require__(66).fastKey
	  , SIZE        = DESCRIPTORS ? '_s' : 'size';

	var getEntry = function(that, key){
	  // fast case
	  var index = fastKey(key), entry;
	  if(index !== 'F')return that._i[index];
	  // frozen object case
	  for(entry = that._f; entry; entry = entry.n){
	    if(entry.k == key)return entry;
	  }
	};

	module.exports = {
	  getConstructor: function(wrapper, NAME, IS_MAP, ADDER){
	    var C = wrapper(function(that, iterable){
	      anInstance(that, C, NAME, '_i');
	      that._i = create(null); // index
	      that._f = undefined;    // first entry
	      that._l = undefined;    // last entry
	      that[SIZE] = 0;         // size
	      if(iterable != undefined)forOf(iterable, IS_MAP, that[ADDER], that);
	    });
	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear(){
	        for(var that = this, data = that._i, entry = that._f; entry; entry = entry.n){
	          entry.r = true;
	          if(entry.p)entry.p = entry.p.n = undefined;
	          delete data[entry.i];
	        }
	        that._f = that._l = undefined;
	        that[SIZE] = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function(key){
	        var that  = this
	          , entry = getEntry(that, key);
	        if(entry){
	          var next = entry.n
	            , prev = entry.p;
	          delete that._i[entry.i];
	          entry.r = true;
	          if(prev)prev.n = next;
	          if(next)next.p = prev;
	          if(that._f == entry)that._f = next;
	          if(that._l == entry)that._l = prev;
	          that[SIZE]--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /*, that = undefined */){
	        anInstance(this, C, 'forEach');
	        var f = ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3)
	          , entry;
	        while(entry = entry ? entry.n : this._f){
	          f(entry.v, entry.k, this);
	          // revert to the last existing entry
	          while(entry && entry.r)entry = entry.p;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key){
	        return !!getEntry(this, key);
	      }
	    });
	    if(DESCRIPTORS)dP(C.prototype, 'size', {
	      get: function(){
	        return defined(this[SIZE]);
	      }
	    });
	    return C;
	  },
	  def: function(that, key, value){
	    var entry = getEntry(that, key)
	      , prev, index;
	    // change existing entry
	    if(entry){
	      entry.v = value;
	    // create new entry
	    } else {
	      that._l = entry = {
	        i: index = fastKey(key, true), // <- index
	        k: key,                        // <- key
	        v: value,                      // <- value
	        p: prev = that._l,             // <- previous entry
	        n: undefined,                  // <- next entry
	        r: false                       // <- removed
	      };
	      if(!that._f)that._f = entry;
	      if(prev)prev.n = entry;
	      that[SIZE]++;
	      // add to index
	      if(index !== 'F')that._i[index] = entry;
	    } return that;
	  },
	  getEntry: getEntry,
	  setStrong: function(C, NAME, IS_MAP){
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    $iterDefine(C, NAME, function(iterated, kind){
	      this._t = iterated;  // target
	      this._k = kind;      // kind
	      this._l = undefined; // previous
	    }, function(){
	      var that  = this
	        , kind  = that._k
	        , entry = that._l;
	      // revert to the last existing entry
	      while(entry && entry.r)entry = entry.p;
	      // get next entry
	      if(!that._t || !(that._l = entry = entry ? entry.n : that._t._f)){
	        // or finish the iteration
	        that._t = undefined;
	        return step(1);
	      }
	      // return step by kind
	      if(kind == 'keys'  )return step(0, entry.k);
	      if(kind == 'values')return step(0, entry.v);
	      return step(0, [entry.k, entry.v]);
	    }, IS_MAP ? 'entries' : 'values' , !IS_MAP, true);

	    // add [@@species], 23.1.2.2, 23.2.2.2
	    setSpecies(NAME);
	  }
	};

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(14);
	module.exports = function(target, src, safe){
	  for(var key in src){
	    if(safe && target[key])target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};

/***/ },
/* 110 */
/***/ function(module, exports) {

	module.exports = function(it, Constructor, name, forbiddenField){
	  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	var ctx         = __webpack_require__(12)
	  , call        = __webpack_require__(48)
	  , isArrayIter = __webpack_require__(49)
	  , anObject    = __webpack_require__(16)
	  , toLength    = __webpack_require__(36)
	  , getIterFn   = __webpack_require__(51)
	  , BREAK       = {}
	  , RETURN      = {};
	var exports = module.exports = function(iterable, entries, fn, that, ITERATOR){
	  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
	    , f      = ctx(fn, that, entries ? 2 : 1)
	    , index  = 0
	    , length, step, iterator, result;
	  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if(result === BREAK || result === RETURN)return result;
	  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
	    result = call(iterator, f, step.value, entries);
	    if(result === BREAK || result === RETURN)return result;
	  }
	};
	exports.BREAK  = BREAK;
	exports.RETURN = RETURN;

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global      = __webpack_require__(10)
	  , core        = __webpack_require__(11)
	  , dP          = __webpack_require__(15)
	  , DESCRIPTORS = __webpack_require__(19)
	  , SPECIES     = __webpack_require__(44)('species');

	module.exports = function(KEY){
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
	    configurable: true,
	    get: function(){ return this; }
	  });
	};

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var global         = __webpack_require__(10)
	  , $export        = __webpack_require__(9)
	  , meta           = __webpack_require__(66)
	  , fails          = __webpack_require__(20)
	  , hide           = __webpack_require__(14)
	  , redefineAll    = __webpack_require__(109)
	  , forOf          = __webpack_require__(111)
	  , anInstance     = __webpack_require__(110)
	  , isObject       = __webpack_require__(17)
	  , setToStringTag = __webpack_require__(43)
	  , dP             = __webpack_require__(15).f
	  , each           = __webpack_require__(114)(0)
	  , DESCRIPTORS    = __webpack_require__(19);

	module.exports = function(NAME, wrapper, methods, common, IS_MAP, IS_WEAK){
	  var Base  = global[NAME]
	    , C     = Base
	    , ADDER = IS_MAP ? 'set' : 'add'
	    , proto = C && C.prototype
	    , O     = {};
	  if(!DESCRIPTORS || typeof C != 'function' || !(IS_WEAK || proto.forEach && !fails(function(){
	    new C().entries().next();
	  }))){
	    // create collection constructor
	    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
	    redefineAll(C.prototype, methods);
	    meta.NEED = true;
	  } else {
	    C = wrapper(function(target, iterable){
	      anInstance(target, C, NAME, '_c');
	      target._c = new Base;
	      if(iterable != undefined)forOf(iterable, IS_MAP, target[ADDER], target);
	    });
	    each('add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON'.split(','),function(KEY){
	      var IS_ADDER = KEY == 'add' || KEY == 'set';
	      if(KEY in proto && !(IS_WEAK && KEY == 'clear'))hide(C.prototype, KEY, function(a, b){
	        anInstance(this, C, KEY);
	        if(!IS_ADDER && IS_WEAK && !isObject(a))return KEY == 'get' ? undefined : false;
	        var result = this._c[KEY](a === 0 ? 0 : a, b);
	        return IS_ADDER ? this : result;
	      });
	    });
	    if('size' in proto)dP(C.prototype, 'size', {
	      get: function(){
	        return this._c.size;
	      }
	    });
	  }

	  setToStringTag(C, NAME);

	  O[NAME] = C;
	  $export($export.G + $export.W + $export.F, O);

	  if(!IS_WEAK)common.setStrong(C, NAME, IS_MAP);

	  return C;
	};

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	// 0 -> Array#forEach
	// 1 -> Array#map
	// 2 -> Array#filter
	// 3 -> Array#some
	// 4 -> Array#every
	// 5 -> Array#find
	// 6 -> Array#findIndex
	var ctx      = __webpack_require__(12)
	  , IObject  = __webpack_require__(33)
	  , toObject = __webpack_require__(46)
	  , toLength = __webpack_require__(36)
	  , asc      = __webpack_require__(115);
	module.exports = function(TYPE, $create){
	  var IS_MAP        = TYPE == 1
	    , IS_FILTER     = TYPE == 2
	    , IS_SOME       = TYPE == 3
	    , IS_EVERY      = TYPE == 4
	    , IS_FIND_INDEX = TYPE == 6
	    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX
	    , create        = $create || asc;
	  return function($this, callbackfn, that){
	    var O      = toObject($this)
	      , self   = IObject(O)
	      , f      = ctx(callbackfn, that, 3)
	      , length = toLength(self.length)
	      , index  = 0
	      , result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined
	      , val, res;
	    for(;length > index; index++)if(NO_HOLES || index in self){
	      val = self[index];
	      res = f(val, index, O);
	      if(TYPE){
	        if(IS_MAP)result[index] = res;            // map
	        else if(res)switch(TYPE){
	          case 3: return true;                    // some
	          case 5: return val;                     // find
	          case 6: return index;                   // findIndex
	          case 2: result.push(val);               // filter
	        } else if(IS_EVERY)return false;          // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
	  };
	};

/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	// 9.4.2.3 ArraySpeciesCreate(originalArray, length)
	var speciesConstructor = __webpack_require__(116);

	module.exports = function(original, length){
	  return new (speciesConstructor(original))(length);
	};

/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(17)
	  , isArray  = __webpack_require__(72)
	  , SPECIES  = __webpack_require__(44)('species');

	module.exports = function(original){
	  var C;
	  if(isArray(original)){
	    C = original.constructor;
	    // cross-realm fallback
	    if(typeof C == 'function' && (C === Array || isArray(C.prototype)))C = undefined;
	    if(isObject(C)){
	      C = C[SPECIES];
	      if(C === null)C = undefined;
	    }
	  } return C === undefined ? Array : C;
	};

/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var $export  = __webpack_require__(9);

	$export($export.P + $export.R, 'Map', {toJSON: __webpack_require__(118)('Map')});

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/DavidBruant/Map-Set.prototype.toJSON
	var classof = __webpack_require__(52)
	  , from    = __webpack_require__(119);
	module.exports = function(NAME){
	  return function toJSON(){
	    if(classof(this) != NAME)throw TypeError(NAME + "#toJSON isn't generic");
	    return from(this);
	  };
	};

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	var forOf = __webpack_require__(111);

	module.exports = function(iter, ITERATOR){
	  var result = [];
	  forOf(iter, false, result.push, result, ITERATOR);
	  return result;
	};


/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(121), __esModule: true };

/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(122);
	module.exports = __webpack_require__(11).Object.freeze;

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.5 Object.freeze(O)
	var isObject = __webpack_require__(17)
	  , meta     = __webpack_require__(66).onFreeze;

	__webpack_require__(93)('freeze', function($freeze){
	  return function freeze(it){
	    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
	  };
	});

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(124), __esModule: true };

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(125);
	module.exports = __webpack_require__(11).Object.keys;

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(46)
	  , $keys    = __webpack_require__(30);

	__webpack_require__(93)('keys', function(){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ }
/******/ ])
});
;
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

	'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _seal = __webpack_require__(1);var _seal2 = _interopRequireDefault(_seal);var _getOwnPropertyDescriptors = __webpack_require__(23);var _getOwnPropertyDescriptors2 = _interopRequireDefault(_getOwnPropertyDescriptors);var _getPrototypeOf = __webpack_require__(44);var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);var _classCallCheck2 = __webpack_require__(49);var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);var _possibleConstructorReturn2 = __webpack_require__(50);var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);var _inherits2 = __webpack_require__(83);var _inherits3 = _interopRequireDefault(_inherits2);var _defineProperty = __webpack_require__(91);var _defineProperty2 = _interopRequireDefault(_defineProperty);var _preventExtensions = __webpack_require__(94);var _preventExtensions2 = _interopRequireDefault(_preventExtensions);var _create = __webpack_require__(88);var _create2 = _interopRequireDefault(_create);var _freeze = __webpack_require__(97);var _freeze2 = _interopRequireDefault(_freeze);var _keys = __webpack_require__(100);var _keys2 = _interopRequireDefault(_keys);var _typeof2 = __webpack_require__(51);var _typeof3 = _interopRequireDefault(_typeof2);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}





	var DATA_TRUE_KEY = 'DataTrue';
	var ATOMIC_SET_KEY = 'atomicSet';
	var defaultOpts = {
		dtprop: DATA_TRUE_KEY,
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
		this.classes = [];
		(0, _freeze2.default)(this);
	};





	var DT_OBJECT_FLAG = 'This is a DataTrue Object';

	var createClass = function createClass() {var template = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};var userConstructor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};var prototype = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Object.prototype;

		if ((typeof template === 'undefined' ? 'undefined' : (0, _typeof3.default)(template)) !== 'object') throw new Error('Object properties must be an object. You gave me a \'' + (typeof template === 'undefined' ? 'undefined' : (0, _typeof3.default)(template)) + '\'');
		if (typeof userConstructor !== 'function') throw new Error('Constructor must be a function. You gave me a \'' + (typeof userConstructor === 'undefined' ? 'undefined' : (0, _typeof3.default)(userConstructor)) + '\'');

		if (this.dtprop in template) {
			throw new Error('You may not define a class that defines the property \'' + this.dtprop + '\'. If you must use a property of that name, change the name used by DataTrue by defining \'dtprop\' in the options used when you instantiate your DataTrue schema object.');
		}

		var dtClass = new DataTrueClass(template, this);

		var schema = this;
		var dtConstructor = function dtConstructor() {var _this2 = this;
			dtClass.init(this);

			var args = Array.prototype.slice.call(arguments);
			var initData = args.shift();
			var set = {};
			(0, _keys2.default)(template).forEach(function (prop) {
				if ('default' in template[prop]) {
					set[prop] = template[prop].default;
				} else {

					set[prop] = undefined;
				}
			});
			var validate = true;
			if (initData) {(function () {




					var universe = void 0;
					var uspec = { initData: initData, dtObject: _this2 };
					if (dtClass.dtprop in initData && Array.isArray(initData[dtClass.dtprop])) {
						validate = false;
						universe = initData[dtClass.dtprop];
						delete initData[dtClass.dtprop];
					} else {
						universe = [uspec];
					}

					(0, _keys2.default)(initData).forEach(function (p) {
						if (!(p in dtClass.template)) {

							_this2[p] = initData[p];
							return;
						}
						if ((0, _typeof3.default)(initData[p]) === 'object') {

							var i = universe.map(function (j) {return j.initData;}).indexOf(initData[p]);
							if (i >= 0) {
								initData[p] = universe[i].dtObject;
							} else if (dtClass.dtprop in initData[p]) {
								switch ((0, _typeof3.default)(initData[p][dtClass.dtprop])) {
									case 'string':
										throw new Error('Deserializing data true objects using class names not yet implemented. Offending property: \'' + p + '\'');
									case 'function':
										if (!schema.isDataTrueClass(initData[p][dtClass.dtprop])) {
											throw new Error('You appear to be mixing schemas. That\'s not allowed');
										}
										universe.push(uspec);
										var DepClass = initData[p][dtClass.dtprop];
										initData[p][dtClass.dtprop] = universe;
										initData[p] = new DepClass(initData[p]);
										break;
									case 'object':

										break;
									default:
										throw new Error('Attempt to initialize a DataTrue object with a sub-object that has a \'' + dtClass.dtprop + '\' property of unknown type \'' + (0, _typeof3.default)(initData[p][dtClass.dtprop]) + '\'');}

							}
						}
						set[p] = initData[p];
					});})();
			}
			if (validate) {
				schema.atomicSet(this, function () {var _this3 = this;
					(0, _keys2.default)(set).forEach(function (k) {
						_this3[k] = set[k];
					});
				});
			} else {
				(0, _keys2.default)(set).forEach(function (k) {
					dtClass.data(_this2)[k] = set[k];
				});
			}

			if (userConstructor) userConstructor.apply(this, args);

		};

		var objProps = {};
		(0, _keys2.default)(template).forEach(function (name) {
			objProps[name] = genProp(name, template[name], dtClass);
		});
		if (!(this.atomicSetProp in objProps)) {
			objProps[schema.atomicSetProp] = { value: function value(setter) {
					return schema.getDataTrueClass(this).atomicSet(this, setter);
				} };
			console.log('Set atomic set property to \'' + schema.atomicSetProp + '\'');
		} else {
			if (schema.atomicSetProp === ATOMIC_SET_KEY) {
				console.warn('You\'ve defined \'' + ATOMIC_SET_KEY + '\' on your DataTrueClass, which dataTrue uses. This means you can\'t call the \'' + ATOMIC_SET_KEY + '\' method on objects of this DataTrue class. Alternativly, you can call \'atomicSet\' on the DataTrue schema object or any DataTrue class, or choose a different name for the atomicSet method of your classes by defining \'atomicSet\' option when instantiating DataTrue.');
			} else {
				console.warn('You\'ve defined \'' + schema.atomicSetProp + '\' on your DataTrue class. You also set \'' + schema.atomicSetProp + '\' as the customized name for the atomicSet method in your schema. This means you can\'t call the \'' + ATOMIC_SET_KEY + '\' method of objects of this DataTrue class, since your property overrides the one you told DataTrue to use. Change the value of \'atomicSet\' in the options you pass when instantiating the DataTrue schema object or just call \'atomicSet\' on the DataTrue schema object itself or any DataTrue class insted of calling \'' + schema.atomicSetProp + '\' on objects of this DataTrue class.');
			}
		}
		dtConstructor.prototype = (0, _create2.default)(prototype, objProps);
		(0, _preventExtensions2.default)(dtConstructor);

		this.classes.push({
			dtClass: dtClass,
			dtConstructor: dtConstructor });


		return dtConstructor;
	};
	DataTrue.prototype = (0, _create2.default)(Object.prototype, {


		createClass: {
			value: createClass,
			writable: false,
			configurable: false },

		isDataTrueObject: { value: function value(obj) {
				return (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) === 'object' &&
				this.dtprop in obj &&
				'DT_OBJECT_FLAG' in obj[this.dtprop] &&
				obj[this.dtprop].DT_OBJECT_FLAG === DT_OBJECT_FLAG;
			} },
		isDataTrueClass: { value: function value(obj) {
				return this.classes.map(function (i) {return i.dtConstructor;}).indexOf(obj) >= 0;
			} },
		getDataTrueClass: { value: function value(obj) {
				if (!this.isDataTrueObject(obj)) throw new Error('Attempt to get DataTrue class on a value that\'s not a DataTrue object');
				return obj[this.dtprop].dtclass;
			} },
		atomicSet: { value: function value(obj, setter) {
				if (typeof obj === 'function') throw new Error('You called DataTrue.aotmicSet() with a function as the first argument. The first argument should be an instance of a DataTrue object. The second argument is you setter function. Please see the documentation.');
				return this.getDataTrueClass(obj).atomicSet(obj, setter);
			} },
		dtprop: { get: function get() {return this.opts.dtprop;} },
		atomicSetProp: { get: function get() {return this.opts.atomicSet;} } });


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
				var data = dtcl.data(this)[name];
				data = getMunge(data);
				return data;
			},
			set: function set(data) {
				dtcl.atomicSet(this, function () {
					this[name] = setMunge(data);
				});
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



	var DataTrueClass = function DataTrueClass(template, dataTrue) {
		this.dt = dataTrue;


		(0, _keys2.default)(template).forEach(function (prop) {
			if ('validate' in template[prop]) {
				if ('value' in template[prop]) throw new Error('You defined both \'value\' and \'validate\' for the \'' + prop + '\' property. DataTrue cannot validate properties for which you directly define a value. To set a default value, use \'default\' instead of \'value\'. You should should generally only use \'value\' to define methods of DataTrue classes.');
			} else {
				if ('value' in template[prop]) return;
				template[prop].validate = [];
				return;
			}
			if (!Array.isArray(template[prop].validate)) template[prop].validate = [template[prop].validate];
			template[prop].validate = template[prop].validate.map(function (v) {
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
						return {
							validate: template[v].value,
							applyTo: function applyTo() {return this;} };

					case 'function':
						return {
							validate: v,
							applyTo: function applyTo() {return this;} };

					case 'object':
						if (!('validate' in v)) {
							throw new Error('You passed an object to validate for property \'' + prop + '\' with no validate key');
						} else if (typeof v.validate !== 'function') {
							throw new Error('The \'validate\' key on validate for property \'' + prop + '\' is a \'' + (0, _typeof3.default)(v.applyTo) + '\'. It should be a function.');
						}
						if (!('applyTo' in v)) {
							v.applyTo = function () {return this;};
						} else if (typeof v.applyTo !== 'function') {
							throw new Error('The \'applyTo\' key on validate for property \'' + prop + '\' is a \'' + (0, _typeof3.default)(v.applyTo) + '\'. It should be a function.');
						}
						return v;
					default:
						throw new Error('You passed something of type \'' + (typeof v === 'undefined' ? 'undefined' : (0, _typeof3.default)(v)) + '\' in the validate key for property \'' + prop + '\'. That doesn\'t make sense. Please see the DataTrue documentation.');}

			});
		});
		this.template = template;

	};


	DataTrueClass.prototype = (0, _create2.default)(Object.prototype, {


		dtprop: {
			get: function get() {return this.dt.dtprop;},
			set: function set(v) {throw new Error('You may not change the DataTrue property after you instantiated a DataTrue schema. ');},
			configurable: false },

		data: {
			value: function value(obj) {return obj[this.dtprop]._;},
			writable: false,
			configurable: false },

		init: {
			value: function value(obj) {
				(0, _defineProperty2.default)(obj, this.dtprop, {
					value: {
						dt: this.dt,
						dtclass: this,
						_: {},
						DT_OBJECT_FLAG: DT_OBJECT_FLAG },

					enumerable: false,
					configurable: false,
					writable: false });

			},
			writable: false,
			configurable: false },

		atomicSet: {
			value: function value(obj, setter) {return atomicSet(obj, setter, this);},
			writable: false,
			configurable: false },

		push: {
			value: function value(obj, newValues) {var _this4 = this;
				(0, _keys2.default)(newValues).forEach(function (prop) {
					_this4.data(obj)[prop] = newValues[prop];
				});
			},
			writable: false,
			configurable: false } });


	var atomicSet = function atomicSet(obj, setter, dtcl) {



		var fake = new FakeObject(obj, dtcl);


		setter.apply(fake.fake, []);


		fake.validate();


		dtcl.push(obj, fake.newValues);














	};var

	AtomicSetError = function (_Error) {(0, _inherits3.default)(AtomicSetError, _Error);
		function AtomicSetError(exceptions) {(0, _classCallCheck3.default)(this, AtomicSetError);
			var msgs = [];
			if ((0, _keys2.default)(exceptions).length === 1 && exceptions[(0, _keys2.default)(exceptions)[0]].length === 1) {

				msgs.push(exceptions[(0, _keys2.default)(exceptions)[0]][0].message);
			} else {
				(0, _keys2.default)(exceptions).forEach(function (prop) {
					if (Array.isArray(exceptions[prop])) {
						msgs = msgs.concat(exceptions[prop].map(function (e) {
							return prop + ': ' + e.message;
						}));
					} else {
						msgs = msgs.concat(exceptions[prop].message);
					}
				});
			}var _this5 = (0, _possibleConstructorReturn3.default)(this, (AtomicSetError.__proto__ || (0, _getPrototypeOf2.default)(AtomicSetError)).call(this,
			msgs.join('\n')));



			_this5.AtomicSetError = true;
			_this5.exceptions = exceptions;
			_this5.messages = msgs;
			(0, _freeze2.default)(_this5);return _this5;
		}return AtomicSetError;}(Error);


	var getOrCreateFakeObject = function getOrCreateFakeObject(real, dtcl, univ) {
		var idx = univ.map(function (i) {return i.real;}).indexOf(real);
		if (idx >= 0) return univ[idx];
		return new FakeObject(real, dtcl.dt.getDataTrueClass(real), univ);
	};
	var FakeObject = function FakeObject(real, dtcl) {var _this6 = this;var universe = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
		this.validated = false;
		this.newValues = {};
		this.relatedObjects = {};
		this.universe = universe;
		universe.push(this);
		this.real = real;
		this.dataTrueClass = dtcl;
		this.frozen = false;
		var Fake = function Fake() {};

		var objProps = {};
		objProps[dtcl.dtprop] = {
			get: function get() {throw new Error('Setter functions may not access the DataTrue property (' + dtcl.dtprop + ')');},
			set: function set() {throw new Error('The DataTrue property may never be changed after instantiating an DataTrue object');},
			configurable: false };



		var fakeObj = this;
		var pdesc = (0, _getOwnPropertyDescriptors2.default)((0, _getPrototypeOf2.default)(real));
		(0, _keys2.default)(dtcl.template).forEach(function (prop) {
			var getMunge = 'get' in dtcl.template[prop] ?
			dtcl.template[prop].get :
			function (value) {return value;};
			var setMunge = 'set' in dtcl.template[prop] ?
			dtcl.template[prop].set :
			function (value) {return value;};
			objProps[prop] = {
				configurable: false,
				enumerable: pdesc.enumerable,
				get: function get() {
					var val = void 0;
					if (prop in fakeObj.relatedObjects) {
						val = fakeObj.relatedObjects[prop];
					} else if (prop in fakeObj.newValues) {
						val = fakeObj.newValues[prop];
					} else {
						val = real[prop];
					}
					return getMunge(val, this);
				},
				set: function set(data) {




					data = setMunge(data, this);
					fakeObj.newValues[prop] = data;
					if (dtcl.dt.isDataTrueObject(data)) {
						var relFake = getOrCreateFakeObject(data, dtcl.dt.getDataTrueClass(data), fakeObj.universe);
						fakeObj.relatedObjects[prop] = relFake.fake;
					} else if (prop in fakeObj.relatedObjects) {
						delete fakeObj.relatedObjects[prop];
					}
				} };

		});
		Fake.prototype = (0, _create2.default)((0, _getPrototypeOf2.default)(real), objProps);
		this.fake = new Fake();
		(0, _seal2.default)(this);




		(0, _keys2.default)(dtcl.template).forEach(function (prop) {
			if (_this6.dataTrueClass.dt.isDataTrueObject(real[prop])) {
				var relFake = getOrCreateFakeObject(real[prop], dtcl.dt.getDataTrueClass(real[prop]), universe);
				_this6.relatedObjects[prop] = relFake.fake;
			}
		});
	};
	FakeObject.prototype = (0, _create2.default)(Object.prototype, {
		isFakeObject: { value: true, enumerable: true, configurable: false },
		freeze: { value: function value() {
				if (this.frozen) return;
				this.universe.forEach(function (o) {
					(0, _freeze2.default)(o.fake);
					(0, _freeze2.default)(o.relatedObjects);
					(0, _freeze2.default)(o.universe);
					(0, _freeze2.default)(o.newValues);
					o.frozen = true;
				});
			} },
		validate: { value: function value() {var _this7 = this;var results = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

				this.freeze();


				var exceptions = {};
				(0, _keys2.default)(this.newValues).forEach(function (prop) {
					if ('value' in _this7.dataTrueClass.template[prop]) return;
					_this7.dataTrueClass.template[prop].validate.forEach(function (validator) {
						var vobj = validator.applyTo.apply(_this7.fake, []);
						if (vobj === false) return;
						var res = {
							vobj: vobj,
							validate: validator.validate };

						if ((typeof vobj === 'undefined' ? 'undefined' : (0, _typeof3.default)(vobj)) !== 'object') {
							if (!(prop in exceptions)) exceptions[prop] = [];
							var e = new Error('The applyTo function returned a \'' + (typeof vobj === 'undefined' ? 'undefined' : (0, _typeof3.default)(vobj)) + '\', expecting an object. If you want to skip validation under certain conditions, such as if the object your validator applies to hasn\'t been assigned to, have your applyTo function return false');
							exceptions[prop].push(e);
							res.result = e;
						}
						var match = results.map(function (t) {return t.vobj;}).indexOf(vobj);

						if (results.reduce(function (acc, cv, i) {
							return cv.vobj === vobj && cv.validate === validator.validate || acc;
						}, false)) {
							if ((0, _typeof3.default)(results[match].result) === 'object' && results[match].result instanceof Error) {
								exceptions[prop].push(results[match].result);
							}
							return;
						}
						try {
							res.results = validator.validate.apply(vobj, []);
						} catch (e) {
							if (!(prop in exceptions)) exceptions[prop] = [];
							exceptions[prop].push(e);
							res.result = e;
						}
						results.push(res);
					});
				});

				(0, _keys2.default)(this.relatedObjects).forEach(function (r) {
					if (!_this7.relatedObjects[r].validated) return;
					try {
						_this7.relatedObjects[r].validate(results);
					} catch (e) {
						if (!('AtomicSetError' in e)) throw e;
						if (r in exceptions) e.exceptions[_this7.dataTrueClass.dtprop] = exceptions[r];
						exceptions[r] = e;
					}
				});


				if ((0, _keys2.default)(exceptions).length > 0) throw new AtomicSetError(exceptions);

				this.validated = true;

			} } });


	DataTrue.AtomicSetError = AtomicSetError;exports.default =

	DataTrue;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(2), __esModule: true };

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	module.exports = __webpack_require__(18).Object.seal;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.17 Object.seal(O)
	var isObject = __webpack_require__(4)
	  , meta     = __webpack_require__(5).onFreeze;

	__webpack_require__(16)('seal', function($seal){
	  return function seal(it){
	    return $seal && isObject(it) ? $seal(meta(it)) : it;
	  };
	});

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var META     = __webpack_require__(6)('meta')
	  , isObject = __webpack_require__(4)
	  , has      = __webpack_require__(7)
	  , setDesc  = __webpack_require__(8).f
	  , id       = 0;
	var isExtensible = Object.isExtensible || function(){
	  return true;
	};
	var FREEZE = !__webpack_require__(12)(function(){
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
/* 6 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var anObject       = __webpack_require__(9)
	  , IE8_DOM_DEFINE = __webpack_require__(10)
	  , toPrimitive    = __webpack_require__(15)
	  , dP             = Object.defineProperty;

	exports.f = __webpack_require__(11) ? Object.defineProperty : function defineProperty(O, P, Attributes){
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
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(4);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(11) && !__webpack_require__(12)(function(){
	  return Object.defineProperty(__webpack_require__(13)('div'), 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(12)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(4)
	  , document = __webpack_require__(14).document
	  // in old IE typeof document.createElement is 'object'
	  , is = isObject(document) && isObject(document.createElement);
	module.exports = function(it){
	  return is ? document.createElement(it) : {};
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(4);
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
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	// most Object methods by ES6 should accept primitives
	var $export = __webpack_require__(17)
	  , core    = __webpack_require__(18)
	  , fails   = __webpack_require__(12);
	module.exports = function(KEY, exec){
	  var fn  = (core.Object || {})[KEY] || Object[KEY]
	    , exp = {};
	  exp[KEY] = exec(fn);
	  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(14)
	  , core      = __webpack_require__(18)
	  , ctx       = __webpack_require__(19)
	  , hide      = __webpack_require__(21)
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
/* 18 */
/***/ function(module, exports) {

	var core = module.exports = {version: '2.4.0'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(20);
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
/* 20 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var dP         = __webpack_require__(8)
	  , createDesc = __webpack_require__(22);
	module.exports = __webpack_require__(11) ? function(object, key, value){
	  return dP.f(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 22 */
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
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(24), __esModule: true };

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(25);
	module.exports = __webpack_require__(18).Object.getOwnPropertyDescriptors;

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/tc39/proposal-object-getownpropertydescriptors
	var $export        = __webpack_require__(17)
	  , ownKeys        = __webpack_require__(26)
	  , toIObject      = __webpack_require__(29)
	  , gOPD           = __webpack_require__(41)
	  , createProperty = __webpack_require__(43);

	$export($export.S, 'Object', {
	  getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object){
	    var O       = toIObject(object)
	      , getDesc = gOPD.f
	      , keys    = ownKeys(O)
	      , result  = {}
	      , i       = 0
	      , key;
	    while(keys.length > i)createProperty(result, key = keys[i++], getDesc(O, key));
	    return result;
	  }
	});

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	// all object keys, includes non-enumerable and symbols
	var gOPN     = __webpack_require__(27)
	  , gOPS     = __webpack_require__(40)
	  , anObject = __webpack_require__(9)
	  , Reflect  = __webpack_require__(14).Reflect;
	module.exports = Reflect && Reflect.ownKeys || function ownKeys(it){
	  var keys       = gOPN.f(anObject(it))
	    , getSymbols = gOPS.f;
	  return getSymbols ? keys.concat(getSymbols(it)) : keys;
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys      = __webpack_require__(28)
	  , hiddenKeys = __webpack_require__(39).concat('length', 'prototype');

	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
	  return $keys(O, hiddenKeys);
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var has          = __webpack_require__(7)
	  , toIObject    = __webpack_require__(29)
	  , arrayIndexOf = __webpack_require__(33)(false)
	  , IE_PROTO     = __webpack_require__(37)('IE_PROTO');

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
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(30)
	  , defined = __webpack_require__(32);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(31);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 31 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 32 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(29)
	  , toLength  = __webpack_require__(34)
	  , toIndex   = __webpack_require__(36);
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
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(35)
	  , min       = Math.min;
	module.exports = function(it){
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

/***/ },
/* 35 */
/***/ function(module, exports) {

	// 7.1.4 ToInteger
	var ceil  = Math.ceil
	  , floor = Math.floor;
	module.exports = function(it){
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(35)
	  , max       = Math.max
	  , min       = Math.min;
	module.exports = function(index, length){
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(38)('keys')
	  , uid    = __webpack_require__(6);
	module.exports = function(key){
	  return shared[key] || (shared[key] = uid(key));
	};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(14)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 39 */
/***/ function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

/***/ },
/* 40 */
/***/ function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var pIE            = __webpack_require__(42)
	  , createDesc     = __webpack_require__(22)
	  , toIObject      = __webpack_require__(29)
	  , toPrimitive    = __webpack_require__(15)
	  , has            = __webpack_require__(7)
	  , IE8_DOM_DEFINE = __webpack_require__(10)
	  , gOPD           = Object.getOwnPropertyDescriptor;

	exports.f = __webpack_require__(11) ? gOPD : function getOwnPropertyDescriptor(O, P){
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if(IE8_DOM_DEFINE)try {
	    return gOPD(O, P);
	  } catch(e){ /* empty */ }
	  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
	};

/***/ },
/* 42 */
/***/ function(module, exports) {

	exports.f = {}.propertyIsEnumerable;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $defineProperty = __webpack_require__(8)
	  , createDesc      = __webpack_require__(22);

	module.exports = function(object, index, value){
	  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
	  else object[index] = value;
	};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(45), __esModule: true };

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(46);
	module.exports = __webpack_require__(18).Object.getPrototypeOf;

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 Object.getPrototypeOf(O)
	var toObject        = __webpack_require__(47)
	  , $getPrototypeOf = __webpack_require__(48);

	__webpack_require__(16)('getPrototypeOf', function(){
	  return function getPrototypeOf(it){
	    return $getPrototypeOf(toObject(it));
	  };
	});

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(32);
	module.exports = function(it){
	  return Object(defined(it));
	};

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has         = __webpack_require__(7)
	  , toObject    = __webpack_require__(47)
	  , IE_PROTO    = __webpack_require__(37)('IE_PROTO')
	  , ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function(O){
	  O = toObject(O);
	  if(has(O, IE_PROTO))return O[IE_PROTO];
	  if(typeof O.constructor == 'function' && O instanceof O.constructor){
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

/***/ },
/* 49 */
/***/ function(module, exports) {

	"use strict";

	exports.__esModule = true;

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _typeof2 = __webpack_require__(51);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
	};

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _iterator = __webpack_require__(52);

	var _iterator2 = _interopRequireDefault(_iterator);

	var _symbol = __webpack_require__(72);

	var _symbol2 = _interopRequireDefault(_symbol);

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(53), __esModule: true };

/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(54);
	__webpack_require__(67);
	module.exports = __webpack_require__(71).f('iterator');

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var $at  = __webpack_require__(55)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(56)(String, 'String', function(iterated){
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
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(35)
	  , defined   = __webpack_require__(32);
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
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY        = __webpack_require__(57)
	  , $export        = __webpack_require__(17)
	  , redefine       = __webpack_require__(58)
	  , hide           = __webpack_require__(21)
	  , has            = __webpack_require__(7)
	  , Iterators      = __webpack_require__(59)
	  , $iterCreate    = __webpack_require__(60)
	  , setToStringTag = __webpack_require__(65)
	  , getPrototypeOf = __webpack_require__(48)
	  , ITERATOR       = __webpack_require__(66)('iterator')
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
/* 57 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(21);

/***/ },
/* 59 */
/***/ function(module, exports) {

	module.exports = {};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var create         = __webpack_require__(61)
	  , descriptor     = __webpack_require__(22)
	  , setToStringTag = __webpack_require__(65)
	  , IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(21)(IteratorPrototype, __webpack_require__(66)('iterator'), function(){ return this; });

	module.exports = function(Constructor, NAME, next){
	  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
	  setToStringTag(Constructor, NAME + ' Iterator');
	};

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject    = __webpack_require__(9)
	  , dPs         = __webpack_require__(62)
	  , enumBugKeys = __webpack_require__(39)
	  , IE_PROTO    = __webpack_require__(37)('IE_PROTO')
	  , Empty       = function(){ /* empty */ }
	  , PROTOTYPE   = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function(){
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(13)('iframe')
	    , i      = enumBugKeys.length
	    , lt     = '<'
	    , gt     = '>'
	    , iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(64).appendChild(iframe);
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
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	var dP       = __webpack_require__(8)
	  , anObject = __webpack_require__(9)
	  , getKeys  = __webpack_require__(63);

	module.exports = __webpack_require__(11) ? Object.defineProperties : function defineProperties(O, Properties){
	  anObject(O);
	  var keys   = getKeys(Properties)
	    , length = keys.length
	    , i = 0
	    , P;
	  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys       = __webpack_require__(28)
	  , enumBugKeys = __webpack_require__(39);

	module.exports = Object.keys || function keys(O){
	  return $keys(O, enumBugKeys);
	};

/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(14).document && document.documentElement;

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(8).f
	  , has = __webpack_require__(7)
	  , TAG = __webpack_require__(66)('toStringTag');

	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	var store      = __webpack_require__(38)('wks')
	  , uid        = __webpack_require__(6)
	  , Symbol     = __webpack_require__(14).Symbol
	  , USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function(name){
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

	$exports.store = store;

/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(68);
	var global        = __webpack_require__(14)
	  , hide          = __webpack_require__(21)
	  , Iterators     = __webpack_require__(59)
	  , TO_STRING_TAG = __webpack_require__(66)('toStringTag');

	for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
	  var NAME       = collections[i]
	    , Collection = global[NAME]
	    , proto      = Collection && Collection.prototype;
	  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(69)
	  , step             = __webpack_require__(70)
	  , Iterators        = __webpack_require__(59)
	  , toIObject        = __webpack_require__(29);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(56)(Array, 'Array', function(iterated, kind){
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
/* 69 */
/***/ function(module, exports) {

	module.exports = function(){ /* empty */ };

/***/ },
/* 70 */
/***/ function(module, exports) {

	module.exports = function(done, value){
	  return {value: value, done: !!done};
	};

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(66);

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(73), __esModule: true };

/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(74);
	__webpack_require__(80);
	__webpack_require__(81);
	__webpack_require__(82);
	module.exports = __webpack_require__(18).Symbol;

/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var global         = __webpack_require__(14)
	  , has            = __webpack_require__(7)
	  , DESCRIPTORS    = __webpack_require__(11)
	  , $export        = __webpack_require__(17)
	  , redefine       = __webpack_require__(58)
	  , META           = __webpack_require__(5).KEY
	  , $fails         = __webpack_require__(12)
	  , shared         = __webpack_require__(38)
	  , setToStringTag = __webpack_require__(65)
	  , uid            = __webpack_require__(6)
	  , wks            = __webpack_require__(66)
	  , wksExt         = __webpack_require__(71)
	  , wksDefine      = __webpack_require__(75)
	  , keyOf          = __webpack_require__(76)
	  , enumKeys       = __webpack_require__(77)
	  , isArray        = __webpack_require__(78)
	  , anObject       = __webpack_require__(9)
	  , toIObject      = __webpack_require__(29)
	  , toPrimitive    = __webpack_require__(15)
	  , createDesc     = __webpack_require__(22)
	  , _create        = __webpack_require__(61)
	  , gOPNExt        = __webpack_require__(79)
	  , $GOPD          = __webpack_require__(41)
	  , $DP            = __webpack_require__(8)
	  , $keys          = __webpack_require__(63)
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
	  __webpack_require__(27).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(42).f  = $propertyIsEnumerable;
	  __webpack_require__(40).f = $getOwnPropertySymbols;

	  if(DESCRIPTORS && !__webpack_require__(57)){
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
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(21)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	var global         = __webpack_require__(14)
	  , core           = __webpack_require__(18)
	  , LIBRARY        = __webpack_require__(57)
	  , wksExt         = __webpack_require__(71)
	  , defineProperty = __webpack_require__(8).f;
	module.exports = function(name){
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if(name.charAt(0) != '_' && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
	};

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	var getKeys   = __webpack_require__(63)
	  , toIObject = __webpack_require__(29);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(63)
	  , gOPS    = __webpack_require__(40)
	  , pIE     = __webpack_require__(42);
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
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(31);
	module.exports = Array.isArray || function isArray(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(29)
	  , gOPN      = __webpack_require__(27).f
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
/* 80 */
/***/ function(module, exports) {

	

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(75)('asyncIterator');

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(75)('observable');

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _setPrototypeOf = __webpack_require__(84);

	var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

	var _create = __webpack_require__(88);

	var _create2 = _interopRequireDefault(_create);

	var _typeof2 = __webpack_require__(51);

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
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(85), __esModule: true };

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(86);
	module.exports = __webpack_require__(18).Object.setPrototypeOf;

/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $export = __webpack_require__(17);
	$export($export.S, 'Object', {setPrototypeOf: __webpack_require__(87).set});

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var isObject = __webpack_require__(4)
	  , anObject = __webpack_require__(9);
	var check = function(O, proto){
	  anObject(O);
	  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	    function(test, buggy, set){
	      try {
	        set = __webpack_require__(19)(Function.call, __webpack_require__(41).f(Object.prototype, '__proto__').set, 2);
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
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(89), __esModule: true };

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(90);
	var $Object = __webpack_require__(18).Object;
	module.exports = function create(P, D){
	  return $Object.create(P, D);
	};

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(17)
	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	$export($export.S, 'Object', {create: __webpack_require__(61)});

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(92), __esModule: true };

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(93);
	var $Object = __webpack_require__(18).Object;
	module.exports = function defineProperty(it, key, desc){
	  return $Object.defineProperty(it, key, desc);
	};

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	var $export = __webpack_require__(17);
	// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
	$export($export.S + $export.F * !__webpack_require__(11), 'Object', {defineProperty: __webpack_require__(8).f});

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(95), __esModule: true };

/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(96);
	module.exports = __webpack_require__(18).Object.preventExtensions;

/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.15 Object.preventExtensions(O)
	var isObject = __webpack_require__(4)
	  , meta     = __webpack_require__(5).onFreeze;

	__webpack_require__(16)('preventExtensions', function($preventExtensions){
	  return function preventExtensions(it){
	    return $preventExtensions && isObject(it) ? $preventExtensions(meta(it)) : it;
	  };
	});

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(98), __esModule: true };

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(99);
	module.exports = __webpack_require__(18).Object.freeze;

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.5 Object.freeze(O)
	var isObject = __webpack_require__(4)
	  , meta     = __webpack_require__(5).onFreeze;

	__webpack_require__(16)('freeze', function($freeze){
	  return function freeze(it){
	    return $freeze && isObject(it) ? $freeze(meta(it)) : it;
	  };
	});

/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(101), __esModule: true };

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(102);
	module.exports = __webpack_require__(18).Object.keys;

/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.2.14 Object.keys(O)
	var toObject = __webpack_require__(47)
	  , $keys    = __webpack_require__(63);

	__webpack_require__(16)('keys', function(){
	  return function keys(it){
	    return $keys(toObject(it));
	  };
	});

/***/ }
/******/ ])
});
;
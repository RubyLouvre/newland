$.define("schema","../mass/flow", function(){

    function hiddenProperty(where, property, value) {
        Object.defineProperty(where, property, {
            writable: false,
            enumerable: false,
            configurable: false,
            value: value
        });
    }
    var Schema = $.factory({
        init: function(name,settings){
            var schema = this;
            // just save everything we get
            this.name = name;
            this.settings = settings;

            // Disconnected by default
            this.connected = false;

            // create blank models pool
            this.models = {};
            this.definitions = {};

        },
        inherit: $.Flow,
        //定义一个表结构
        /*
  var User = schema.define('User', {
     email: String,
      password: String,
      birthDate: Date,
      activated: Boolean
  });
 var User = schema.define('User', {
      email: { type: String, limit: 150, index: true },
      password: { type: String, limit: 50 },
      birthDate: Date,
      registrationDate: {type: Date, default: function () { return new Date }},
      activated: { type: Boolean, default: false }
  });
         */
        define : function(className, properties, settings) {
            var args = $.slice(arguments);

            if (!className) throw new Error('Class name required');
            if (args.length == 1) properties = {}, args.push(properties);
            if (args.length == 2) settings   = {}, args.push(settings);
            //处理函数
            Object.keys(properties).forEach(function (key) {
                var v = properties[key];
                if (typeof v === 'function') {
                    properties[key] = {
                        type: v
                    };
                }
            });

            // every class can receive hash of data as optional param
            var newClass = function ModelConstructor(data) {
                if (!(this instanceof ModelConstructor)) {
                    return new ModelConstructor(data);
                }
                AbstractClass.call(this, data);
            };
            //隐藏一些属性
            hiddenProperty(newClass, 'schema', this);
            hiddenProperty(newClass, 'modelName', className);
            hiddenProperty(newClass, 'cache', {});
            hiddenProperty(newClass, 'mru', []);

            // setup inheritance
            newClass.__proto__ = AbstractClass;
            util.inherits(newClass, AbstractClass);

            // store class in model pool
            this.models[className] = newClass;
            this.definitions[className] = {
                properties: properties,
                settings: settings
            };

            // pass controll to adapter
            this.adapter.define({
                model:      newClass,
                properties: properties,
                settings:   settings
            });

            return newClass;
        },
        defineProperty : function (model, prop, params) {
            this.definitions[model].properties[prop] = params;
            if (this.adapter.defineProperty) {
                this.adapter.defineProperty(model, prop, params);
            }
        },
        automigrate : function (cb) {
            this.freeze();
            if (this.adapter.automigrate) {
                this.adapter.automigrate(cb);
            } else if (cb) {
                cb();
            }
        },
        autoupdate: function (cb) {
            this.freeze();
            if (this.adapter.autoupdate) {
                this.adapter.autoupdate(cb);
            } else if (cb) {
                cb();
            }
        },
        isActual: function (cb) {
            this.freeze();
            if (this.adapter.isActual) {
                this.adapter.isActual(cb);
            } else if (cb) {
                cb(null, true);
            }
        },
        freeze: function freeze() {
            if (this.adapter.freezeSchema) {
                this.adapter.freezeSchema();
            }
        },
        //Return table name for specified `modelName`
        tableName: function (modelName) {
            return this.definitions[modelName].settings.table = this.definitions[modelName].settings.table || modelName
        },
        //定义一个外键
        defineForeignKey : function (className, key) {
            // 如果已经定义了
            if (this.definitions[className].properties[key])
                return;
            if (this.adapter.defineForeignKey) {
                this.adapter.defineForeignKey(className, key, function (err, keyType) {
                    if (err) throw err;
                    this.definitions[className].properties[key] = {
                        type: keyType
                    };
                }.bind(this));
            } else {
                this.definitions[className].properties[key] = {
                    type: Number
                };
            }
        },
        //停止数据库连接
        disconnect : function() {
            if (typeof this.adapter.disconnect === 'function') {
                this.adapter.disconnect();
            }
        }

    })
})


    //https://github.com/1602/jugglingdb/blob/master/lib/schema.js
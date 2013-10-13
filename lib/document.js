var Saveable = require('./base').Saveable,
    Removeable  = require('./base').Removeable,
    ValidateAble = require('./validate');

var Document = function (beforeSaveFn, afterSaveFn, beforeRemoveFn, afterRemoveFn, validateFn, schema, model_type) {
  var self =  this;

   self.beforeSaveFn = beforeSaveFn;
   self.afterSaveFn = afterSaveFn;
   self.beforeRemoveFn = beforeRemoveFn;
   self.afterRemoveFn = afterRemoveFn;
   self.validateFn = validateFn;
   self.schema = schema;
   self.model_type = model_type;

  this.serialise = function () {
    var self = this;
    var serialised_doc = {};

    serialised_doc.dateCreated = self.dateCreated;
    serialised_doc.lastUpdated = self.lastUpdated;
    serialised_doc.model_type = self.model_type;
    serialised_doc._id = self.id;

    Object.keys(self.schema).forEach(function (key) {
      var type = self.schema[key].type;
      // var serialise = _full_serialise;
      var serialise = fullSerialise;

      // Prevent duplicate id field being saved if client specified it in model definition
      if (key == "id") {
        return {};
      }

      if (type.has_one) {
        return serialise(serialised_doc, key, self[key]);
      }

      if (type.has_many) {
        var many_docs = [];

        var isReferenced = ( type.hasOwnProperty('referenced') && type.referenced );
        if (isReferenced) {
          serialise = reducedSerialise;
        }

        self[key].forEach( function (item) {
          serialise(many_docs, many_docs.length, item);
        });

        return serialised_doc[key] = many_docs;
      }

      serialised_doc[key] = self[key] 

    });

    return serialised_doc;
  };

  this.serialize = this.serialise; // for the Americans :-)

  this.toJSON = function () {
    return this.serialise();
  };
};

ValidateAble.call(Document.prototype);
Saveable.call(Document.prototype);
Removeable.call(Document.prototype);

module.exports = Document;

function fullSerialise (store, key, item) {
  return store[key] = item.serialise();
}

function reducedSerialise (store, key, item) {
  if (item.hasOwnProperty('id')) {
    store[key] = { _id: item.id };
  }
}
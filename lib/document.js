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
    serialised_doc.id = self.id;

    Object.keys(self.schema).forEach(function (key) {
      var type = self.schema[key].type;
      var method = _full_serialise;

      if (type.hasOwnProperty('embed') && !type.embed) {
        method = _reduced_serialise;
      }

      if (type.has_one) {
        return serialised_doc[key] =  method(self[key]);
      }

      if (type.has_many) {
        var many_docs = [];

        self[key].forEach( function (item) {
          many_docs.push( method(item) );
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

function _reduced_serialise (item) {
  return { _id: item.id };
}

function _full_serialise (item) {
  return item.serialise();
}
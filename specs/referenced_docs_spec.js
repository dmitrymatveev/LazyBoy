var assert = require('assert'),
    cradle = require('cradle'),
    Model = require('../lib/index'),
    db = require('./spec_helper').db,
    should = require('should');

describe("Defining a Model with referenced items", function () {
  beforeEach(function (done) {
    Model.remove_models();
    done();
  });

  it("Schema should have 'referenced' parameter of the 'has_one' type", function (done) {
    Model.define('ReferencedModel', { name: String });
    var model = Model.define('Model', {
      referred: { has_one: Model('ReferencedModel'), referenced: true }
    });

    model.schema.referred.type.should.have.property('referenced');

    done();
  })

  it("Schema should have 'referenced' parameter of the 'has_many' type", function (done) {
    Model.define('ReferencedModel', { name: String });
    var model = Model.define('Model', {
      referred: { has_many: Model('ReferencedModel'), referenced: true }
    });

    model.schema.referred.type.should.have.property('referenced');

    done();
  })

})

describe("Saving Item with referenced docs", function () {
  before(function (done) {

  	Model.define('Comment', {
  		text: String
  	});

    Model.define('BlogPost', {
      name: String,
      comments: { has_many : Model('Comment'), referenced: true }
    });

    Model.load(function () { done(); });
  });

  it("should embed only id of referenced 'has_one' item", function (done) {
    Model.define('User', {
      name: String,
      blog: { has_one: Model('BlogPost'), referenced: true }
    });

    var blog = Model('BlogPost').create({ name : "Some blog post" });
    var user = Model('User').create({ name: "Some user" });
    user.blog = blog;

    blog.save(function(err, blog) {
      user.save(function(err, user) {

        Model('User').find(user.id, function(err, user) {

          user.blog.should.have.property('id');
          assert.equal( user.blog.text, undefined );
          done();
        });
      })
    })

  })

  it("Should embed only id of referenced 'has_many' items", function (done) {

    var comment = Model('Comment').create({ text : "Comment by user" });
    var post = Model('BlogPost').create({ name : "Some blog post" });
    post.comments.push(comment);

    comment.save(function (err, result) {
      if (err) throw err;

      result.should.have.property('id');
      result.should.have.property('text', 'Comment by user');

      post.save(function (err, post) {
        if (err) throw err;

        Model('BlogPost').find(post.id, function(err, post) {

          post.comments[0].should.have.property('id');
          assert.equal( post.comments[0].text, undefined );
          done();
        });
      });
    });

  })

  it("Should not embed referenced item id if it is undefined", function (done) {

    var comment = Model('Comment').create({ text : "Comment by user" });
    var post = Model('BlogPost').create({ name : "Some blog post" });
    post.comments.push(comment);

    post.save(function (err, post) {
      if (err) throw err;

      Model('BlogPost').find(post.id, function(err, post) {
        post.comments.should.have.length(0);
        done();
      });
    })

  })

});
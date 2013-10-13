var async = require('async'),
		Model = require('../lib/index.js'),
		cradle = require('cradle');

Model.create_connection('lazyboy_tests');

var Street = Model.define('Street', {
	name: String
});

var City = Model.define('City', {
  name: { type: String, default: 'Boom'},
  streets: { has_many: Street, referenced: true }
});

Model.load();

var city = City.create({ name: "Lazynopolis"});

var street1 = Street.create({name: 'Apache'});
var street2 = Street.create({name: 'CouchDB'});

var method = [
		
	function (next) {
		// Referenced model should have defined id field 
		street1.save(function (err, street) {
			console.log('street id: '+street.id);
			console.log('street name: '+street.name);
			next();
		});
	},

	function (next) {
		street2.save(function(err, street) {
			console.log('street2 id: '+street.id);
			console.log('street2 name: '+street.name);
			next();
		})
	},

	function (next) {
		city.streets.push(street1);
		city.save(function (err, city) {
			console.log('user id: '+city.id);
			console.log('comments: '+city.streets);

			city.name = 'JavaScript City';
			city.streets.push(street2);
			city.save(function(err, city) {
				next();
			})
		});
	},

	function (next) {
		City.find(city.id ,function(err, cities) {
			console.log(cities);
		})
	}
];

async.waterfall(method);

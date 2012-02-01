var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	Stop,
	Favorite;

/**
  * Model: Bus Stop
  */
Stop = new Schema({
	'code':{type: String, index: { unique: true }}
	,'name': String
	,'address': String
  ,'buses': String
});

/**
  * Model: User
  */
Favorite = new Schema({
	'sid': String
	, 'name' : String
	, 'code' : String
	, 'buses' : [String]
});

mongoose.model('Stop', Stop);
//mongoose.model('User', User);
mongoose.model('Favorite', Favorite);

// exports.User = function(db) {
//   return db.model('User');
// };

exports.Favorite = function(db) {
  return db.model('Favorite');
};

exports.Stop = function(db) {
  return db.model('Stop');
};


var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId,
	Stop,
	User;

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

/**
  * Model: User
  */
function validatePresenceOf(value) {
  return value && value.length;
}

User = new Schema({
  'email': { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
  'hashed_password': String,
  'salt': String
});

User.virtual('id')
  .get(function() {
    return this._id.toHexString();
  });

User.virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() { return this._password; });

User.method('authenticate', function(plainText) {
  return this.encryptPassword(plainText) === this.hashed_password;
});

User.method('makeSalt', function() {
  return Math.round((new Date().valueOf() * Math.random())) + '';
});

User.method('encryptPassword', function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
});

User.pre('save', function(next) {
  if (!validatePresenceOf(this.password)) {
    next(new Error('Invalid password'));
  } else {
    next();
  }
});

User.method('isValid', function() {
  // TODO: Better validation
  return this.email && this.email.length > 0 && this.email.length < 255
         && this.password && this.password.length > 0 && this.password.length < 255;
});

User.method('save', function(okFn, failedFn) {
  if (this.isValid()) {
    this.__super__(okFn);
  } else {
    failedFn();
  }
});

mongoose.model('Stop', Stop);
mongoose.model('User', User);
mongoose.model('Favorite', Favorite);

exports.User = function(db) {
  return db.model('User');
};

exports.Favorite = function(db) {
  return db.model('Favorite');
};

exports.Stop = function(db) {
  return db.model('Stop');
};


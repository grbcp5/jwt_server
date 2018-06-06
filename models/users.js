let mongoose = require('mongoose');

let userSchema = mongoose.model( 'user', {

  display_name: String,
  org: String,
  org_secret: String,
  top_secret: String

});

let User = module.exports = mongoose.model( 'user' );

module.exports.findAllUsers = function( callback ) {

  User.find( callback );

};

module.exports.postUser = function( userObject, callback ) {

  User.create( userObject, callback );

};
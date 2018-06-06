let User = require('./users' );
let crypto = require('crypto');

let secret = "jwt_server_token_secret";
let headerInfo = {
  typ: "JWT",
  alg: "HS256"
};
let encodedHeaderInfo = Buffer.from( JSON.stringify( headerInfo ) ).toString( 'base64' );

module.exports.getUnsignedTokenForUserObjectId = function( userObjectId, callback ) {

  User.getUserByUserObjectId( userObjectId, function( error, data ) {

    if( error ) {

      if( error.name === "CastError" ) {
        callback( null, null );
        return;
      }

      callback( error, null );
      return;
    }

    let now = Date.now();
    let payload = {
      iss: "jwt_server",
      sub: data.id,
      aud: "public",
      exp: now + 1000 * 60 * 60, // 1 hour
      nbf: now,
      iat: now,
      jti: 0
    };

    let unsignedToken = encodedHeaderInfo
      + '.'
      + Buffer.from( JSON.stringify( payload ) ).toString( 'base64' );

    callback( null, unsignedToken );

  } );

};

module.exports.getSignedTokenForUserObjectId = function( userObjectId, callback ) {

  module.exports.getUnsignedTokenForUserObjectId( userObjectId, function ( error, unsignedToken ) {

    if( error ) {

      callback( error, null );
      return;
    }

    if( !unsignedToken ) {
      callback( null, null );
      return;
    }

    let encodedSignature = crypto.createHmac('sha256', secret)
      .update(unsignedToken)
      .digest('base64');

    let signedToken = unsignedToken + '.' + encodedSignature;

    callback( null, signedToken )
  } );

};
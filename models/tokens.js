let User = require( './users' );
let crypto = require( 'crypto' );
let uuid = require( 'uuid' );

let secret = uuid.v4();

let headerInfo = {
  typ: "JWT",
  alg: "HS256"
};
let encodedHeaderInfo = Buffer.from( JSON.stringify( headerInfo ) ).toString( 'base64' );

module.exports.getUnsignedTokenForUserObjectId = function ( userObjectId, options ) {

  // Procedure to generate unsigned token given a valid userObjectId
  let generateUnsignedToken = function ( userObjId ) {

    let now = Date.now();
    let payload = {
      iss: "jwt_server",
      sub: userObjectId,
      aud: "public",
      exp: now + 1000 * 60 * 60, // 1 hour
      nbf: now,
      iat: now,
      jti: uuid.v4()
    };

    return encodedHeaderInfo
      + '.'
      + Buffer.from( JSON.stringify( payload ) ).toString( 'base64' );
  };

  // If caller specified options
  if ( options ) {

    // If user wants to first validate the users
    if ( options.validateUserObjectId && options.validateUserObjectIdCallback ) {

      User.validateUserObjectId( userObjectId, function ( error, userObjectId ) {

        if ( error ) {
          options.validateUserObjectIdCallback( error, null );
          return;
        }

        options.validateUserObjectIdCallback(
          null,
          generateUnsignedToken( userObjectId )
        );
      } );

      return;
    }

    return generateUnsignedToken( userObjectId );
  }
};

let getTokenSignature = function( unsignedToken ) {

  return crypto.createHmac( 'sha256', secret )
    .update( unsignedToken )
    .digest( 'base64' );
};

let signToken = function ( unsignedToken ) {

  return unsignedToken + '.' + getTokenSignature( unsignedToken );
};

module.exports.getSignedTokenForUserObjectId = function ( userObjectId, options ) {

  // If caller specified options
  if ( options ) {

    // If user wants to first validate the users
    if ( options.validateUserObjectId && options.validateUserObjectIdCallback ) {

      let optionsForGenerateUnsignedTokenProcedure = {
        validateUserObjectId: true,
        validateUserObjectIdCallback: function ( error, unsignedToken ) {

          if ( error ) {
            options.validateUserObjectIdCallback( error, null );
            return;
          }

          options.validateUserObjectIdCallback(
            null,
            signToken( unsignedToken )
          );
        }
      };

      module.exports.getUnsignedTokenForUserObjectId(
        userObjectId,
        optionsForGenerateUnsignedTokenProcedure
      );

      return;
    }
  }

  return signToken(
    module.exports.getUnsignedTokenForUserObjectId(
      userObjectId
    )
  );
};

module.exports.verifyToken = function( token ) {

  // Split token into parts
  let tokenParts = token.split('.');

  // Decode given signature
  let encodedSignature = tokenParts[ 2 ];
  let decodedSignature = Buffer.from( encodedSignature, 'base64' ).toString( 'ascii' );

  // Form valid signature
  let encodedHeader = tokenParts[ 0 ];
  let encodedPayload = tokenParts[ 1 ];
  let unsignedToken = encodedHeader + '.' + encodedPayload;
  let encodedValidSignature = getTokenSignature( unsignedToken );
  let decodedValidSignature = Buffer.from( encodedValidSignature, 'base64' ).toString( 'ascii' );

  // Return comparison
  return decodedSignature === decodedValidSignature
};
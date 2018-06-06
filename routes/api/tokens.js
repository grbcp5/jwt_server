let express = require( 'express' );
let router = express.Router();
let Token = require( '../../models/tokens' );

/* GET home page. */
router.get( '/:userObjectId', function ( req, res, next ) {

  let userObjectId = req.params.userObjectId;

  Token.getSignedTokenForUserObjectId( userObjectId, {
    validateUserObjectId: true,
    validateUserObjectIdCallback: function( error, token ) {

      if( error ) {

        if( error.name === "CastError" ) {
          let responseObject = {
            accepted: false,
            error: "User with id " + userObjectId + " not found.",
            data: null
          };

          console.log( "Sending response: ", responseObject );
          res.status( 404 ).end( JSON.stringify( responseObject ) );
          return;
        }

        let responseObject = {
          accepted: false,
          error: error,
          data: null
        };

        console.log( "Sending response: ", responseObject );
        res.status( 500 ).end( JSON.stringify( responseObject ) );
        return;
      }

      let responseObject = {
        accepted: true,
        error: null,
        data: token
      };

      console.log( "Sending response: ", responseObject );
      res.end( JSON.stringify( responseObject ) );
    }
  } );
} );

router.get( '/verify/:token', function ( req, res, next ) {

  token = req.params.token;

  let responseObject = {
    accepted: Token.verifyToken( token ),
    error: null,
    data: null
  };

  console.log( "Sending response: ", responseObject );
  res.end( JSON.stringify( responseObject ) );

} );

module.exports = router;

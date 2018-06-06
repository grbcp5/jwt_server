let express = require( 'express' );
let router = express.Router();
let Token = require( '../../models/tokens' );

/* GET home page. */
router.get( '/:userObjectId', function ( req, res, next ) {

  let userObjectId = req.params.userObjectId;

  Token.getSignedTokenForUserObjectId( userObjectId, function ( error, data ) {

    if( error ) {

      let responseObject = {
        accepted: false,
        error: error,
        data: null
      };

      console.log( "Sending response: ", responseObject );
      res.status( 500 ).end( JSON.stringify( responseObject ) );
      return;
    }

    if( !data ) {
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
      accepted: true,
      error: null,
      data: data
    };

    console.log( "Sending response: ", responseObject );
    res.end( JSON.stringify( responseObject ) );
  } );

} );

module.exports = router;

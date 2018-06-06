let express = require( 'express' );
let router = express.Router();

let User = require( '../../models/users' );

/* GET users listing. */
router.get( '/', function ( req, res, next ) {

  User.findAllUsers( function ( error, data ) {

    if ( error ) {
      console.log( error );

      let responseObject = {
        "accepted": false,
        "error": error,
        "data": null
      };

      res.status( 500 ).end( JSON.stringify( responseObject ) );
      return;
    }

    let responseObject = {
      "accepted": true,
      "error": null,
      "data": data
    };

    console.log( "Responding: ", responseObject );
    res.end( JSON.stringify( data ) );

  } );
} );

router.post( '/', function ( req, res, next ) {

  let req_display_name = req.body.display_name;
  let req_org = req.body.org;
  let req_org_secret = req.body.org_secret;
  let req_top_secret = req.body.top_secret;

  if( !req_display_name || !req_org || !req_org_secret || !req_top_secret ) {

    let responseObject = {
      "accepted": false,
      "error": "Not all required fields contained values.",
      "data": null
    };

    console.log( "Responding: ", responseObject );
    res.status( 400 ).end( JSON.stringify( responseObject ) );
  }

  let userObject = {
    display_name: req_display_name,
    org: req_org,
    org_secret: req_org_secret,
    top_secret: req_top_secret
  };

  User.postUser( userObject, function( error, data ) {

    if( error ) {
      console.log( error );

      let responseObject = {
        "accepted": false,
        "error": error,
        "data": null
      };

      res.status( 500 ).end( JSON.stringify( responseObject ) );
    }

    let responseObject = {
      "accepted": true,
      "error": null,
      "data": data
    };

    res.end( JSON.stringify( responseObject ) );
  } );

} );
module.exports = router;

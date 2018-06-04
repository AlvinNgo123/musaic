exports.view = function(req, res){
  res.render('mainPage', {
  	sess_id: req.session.id,
    sess_access_token: req.session.access_token,
    sess_refresh_token: req.session.refresh_token,
    sess_display_name: req.session.display_name
  });
};

// exports.viewID = function(req,res){
// 	console.log("Running viewID route");
// 	console.log("User ID = "+req.params.id);

// 	res.render('mainPage', {
// 		"userID": req.params.id
// 	});
// };
exports.view = function(req, res){
  res.render('mainPage');
};

exports.viewID = function(req,res){
	console.log("Running viewID route");
	console.log("User ID = "+req.params.id);

	res.render('mainPage', {
		"userID": req.params.id
	});
};
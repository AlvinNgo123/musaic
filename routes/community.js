exports.view = function(req, res){
  res.render('community', {
  	sess_id: req.session.id,
    sess_access_token: req.session.access_token,
    sess_refresh_token: req.session.refresh_token,
    sess_image: req.session.image,
    sess_display_name: req.session.display_name
  });
};
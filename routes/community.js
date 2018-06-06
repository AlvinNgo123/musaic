//Javascript file for community page it runs a request and respond that pass the accesstonken refresh
//token, display name and user id to the community page from the spotify API
exports.view = function(req, res){
  res.render('community', {
    sess_access_token: req.session.access_token,
    sess_refresh_token: req.session.refresh_token,
    sess_display_name: req.session.display_name,
    sess_user_id: req.session.user_id
  });
};
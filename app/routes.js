FlowRouter.route('/', {
    action: function(params) {
        BlazeLayout.render('stateSwitcher', {main: 'search'});
    }
});

FlowRouter.route('/messages', {
    action: function(params) {
        // Replace 'messages' with whatever you name the template
        BlazeLayout.render('stateSwitcher', {main: 'messaging'});
    }
});

FlowRouter.route('/messages/:userId', {
    action: function(params, queryParams) {
        // Replace 'messages' with whatever you name the template
        BlazeLayout.render('stateSwitcher', {main: 'messaging'});
    }
});

FlowRouter.route('/profile', {
    action: function(params, queryParams) {
        // Replace 'messages' with whatever you name the template
        BlazeLayout.render('stateSwitcher', {main: 'profile', user: queryParams.user});
    }
});
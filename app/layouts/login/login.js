import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './login.html';

Template.login.events({
	'click #facebook-login': function(event){
        Meteor.loginWithFacebook({requestPermissions: ['public_profile', 'email']}, function(err) {
            if (err) {
                throw new Meteor.Error("Facebook login failed");
            }
        });
	},
});
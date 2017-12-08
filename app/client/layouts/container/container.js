import { Template } from 'meteor/templating';

import './container.html';

Template.navBarLinks.events({
    'click #logout-button': function(){
        Meteor.logout(function(err){
            if (err) {
                throw new Meteor.Error("Logout failed");
            }
        });
    },
});

Template.navBarLinks.helpers({
    getUserPicture() {
        return "http://graph.facebook.com/" + Meteor.user().services.facebook.id + "/picture/?type=large";
    }
})
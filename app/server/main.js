import { Meteor } from 'meteor/meteor';
import { Profiles } from '../imports/api/profiles.js';
import { Message } from '../imports/api/message.js';
import { Instruments } from '../imports/api/instruments.js';
import { Genres } from '../imports/api/genres.js';

Meteor.startup(() => {
  // code to run on server at startup
});

Accounts.onCreateUser( function (options, user) {
    if (!user.services.facebook) {
        return user;
    }

    if (options.profile) {
        options.profile.picture = "http://graph.facebook.com/" + user.services.facebook.id + "/picture/?type=large";
    }

    // Add data to be imported on account creation here
    Profiles.insert({
        name: user.services.facebook.name,
        bio: "I'm a real cool musician",
        profileImageUrl: options.profile.picture,
        _id: user._id,
        visible: true
    });

    user.username = user.services.facebook.name;
    user.email = [{address: user.services.facebook.email}];

    return user;
});
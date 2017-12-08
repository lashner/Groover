import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Profiles } from '../../../imports/api/profiles.js';
import { Instruments } from '../../../imports/api/instruments.js';
import { Genres } from '../../../imports/api/genres.js';

import './profile.html';
import '../../modules/chip-container.html';

Template.profile.onCreated( function () {
    this.editMode = ReactiveVar(false);
});

Template.profile.helpers ({
    profileInfo: function() {
        return Profiles.findOne({_id: getUserId()});
    },
    editMode: function() {
        return Template.instance().editMode.get();
    },
    isOwnProfile: function() {
        return getUserId() === Meteor.user()._id;
    }
});

Template.profile.events({
    'click #edit-btn': function() {
        Template.instance().editMode.set(true);
    },
    'click #save-btn': function() {
        if ($('#bio-input').val() !== "" && $('#bio-input').val() !== null )
        {
            var bioInput = $('#bio-input').val();
        }
        if ($('#name-input').val() !== "" && $('#name-input').val() !== null)
        {
            nameInput = $('#name-input').val();
        }
        Profiles.update(
            { _id: Meteor.user()._id },
            { $set: { bio: bioInput, name: nameInput } },
        );
        
        Template.instance().editMode.set(false);
    },
    'click #cancel-btn': function() {
        Template.instance().editMode.set(false);
    },
    'keydown #instrument-input': function(event) {
        if (event.which === 188 || event.which === 13)
        {
            event.preventDefault();
            addInstrument();
        }
    },
    'click #instrument-btn': function() {
        addInstrument();
    },
    'keydown #genre-input': function(event) {
        if (event.which === 188 || event.which === 13)
        {
            event.preventDefault();
            addGenre();
        }
    },
    'click #genre-btn': function() {
        addGenre();
    },
    'click #visibility-toggle': function() {
        var toggle = $('#visibility-toggle')[0].checked;
        Profiles.update(
            { _id: Meteor.user()._id },
            { $set: { visible: toggle } },
        );
    }
});

var addInstrument = function() {
    var instrument = $('#instrument-input').val();
    $('#instrument-input').val('');
    if (instrument === "" || instrument === null)
    {
        return;
    }
    instrument = instrument.toLowerCase();
    Profiles.update(
        {_id: Meteor.user()._id},
        { $addToSet: {instruments: instrument}}
    );
    Instruments.insert( { name: instrument } );
};

var addGenre = function() {
        var genre = $('#genre-input').val();
        $('#genre-input').val('');
        if (genre === "" || genre === null)
        {
            return;
        }
        genre = genre.toLowerCase();
        Profiles.update(
            {_id: Meteor.user()._id},
            { $addToSet: {genres: genre}}
        );
        Genres.insert( { name: genre } );
};

var getUserId = function() {
    userId = "";
    if(FlowRouter.current().queryParams.user) {
        userId = FlowRouter.current().queryParams.user;
    }
    else {
        userId = Meteor.user()._id;
    }
    return userId;
};

Template.chipContainer.events({
    'click #delete-chip-btn': function(event, template) {
        var val = this.toString();
        if (template.data.type === "instrument") {
            Profiles.update(
                {_id: Meteor.user()._id},
                { $pull: {instruments: val}}
            );
        }
        else {
            Profiles.update(
                {_id: Meteor.user()._id},
                { $pull: {genres: val}}
            );
        }
    }
});
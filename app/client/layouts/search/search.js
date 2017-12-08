import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Message } from '../../../imports/api/message.js'
import { Profiles } from '../../../imports/api/profiles.js';

import './search.html';
import '../../modules/account-card.html';

function updateSearchResults() {
    var instrumentFilters = Template.instance().instrumentFilters.get();
    console.log(instrumentFilters);
    var genreFilters = Template.instance().genreFilters.get();
    var profiles = [];
    if (instrumentFilters.length > 0 && genreFilters.length > 0) {
        profiles = Profiles.find({$and: [ 
            {'instruments': {$all: instrumentFilters}, _id: {$ne: Meteor.user()._id}, visible: true },
            {'genres': {$all: genreFilters}, _id: {$ne: Meteor.user()._id}, visible: true }
        ]}).fetch();
    } else if (instrumentFilters.length > 0) {
        profiles = Profiles.find({'instruments': {$all: instrumentFilters}, _id: {$ne: Meteor.user()._id}, visible: true }).fetch();
    } else if (genreFilters.length > 0) {
        profiles = Profiles.find({'genres': {$all: genreFilters}, _id: {$ne: Meteor.user()._id}, visible: true }).fetch();
    } else {
        profiles = Profiles.find({_id: {$ne: Meteor.user()._id}, visible: true }).fetch();
    }
    Template.instance().searchResults.set(profiles);    
}

var sendingMessage = new ReactiveVar(false);
var messageTo = new ReactiveVar({});

Template.search.onCreated(function searchOnCreate() {
    this.instrumentFilters = new ReactiveVar([]);
    this.genreFilters = new ReactiveVar([]);
    var profiles = Profiles.find({ _id: {$ne: Meteor.user()._id}, visible: true});
    this.searchResults = new ReactiveVar(profiles);
});

Template.search.helpers ({
    searchResults: function() {
        return Template.instance().searchResults.get();
    },
    filters: function() {
        return Template.instance().instrumentFilters.get().concat(Template.instance().genreFilters.get());
    },
    sendingMessage: function() {
        return sendingMessage.get();
    },
    messageTo: function() {
        return messageTo.get();
    }
});

Template.search.events({
    'keydown #filter-input'(event, template) {
        if (event.which === 13 || event.which === 32) {
            event.preventDefault();
            var filter = $('#filter-input').val();
            $('#filter-input').val('');
            if (filter === "" || filter === null) {
                return;
            }
            if (Profiles.findOne({'instruments': {$in: [filter]}})){
                console.log('instruments');
                var filters = template.instrumentFilters.get();
                filters.push(filter);
                template.instrumentFilters.set(filters);    
            } else if (Profiles.findOne({'genres': {$in: [filter]}})){
                console.log('genres');
                var filters = template.genreFilters.get();
                filters.push(filter);
                template.genreFilters.set(filters);    
            } else {
                // var genreFilters = template.genreFilters.get();
                // genreFilters.push(filter);
                // template.genreFilters.set(genreFilters);
                var instrumentFilters = template.instrumentFilters.get();
                instrumentFilters.push(filter);
                template.instrumentFilters.set(instrumentFilters);
            }
            
            updateSearchResults();
        }
    },
    'click .mdl-chip__action'(event, template) {
        var chip = $($(event.currentTarget).parent());
        var filter = chip.attr('data');

        var instrumentFilters = template.instrumentFilters.get();
        var instrumentIndex = instrumentFilters.indexOf(filter);
        if (instrumentIndex > -1) {
            instrumentFilters.splice(instrumentIndex, 1);
        }
        template.instrumentFilters.set(instrumentFilters);

        var genreFilters = template.genreFilters.get();
        var genreIndex = genreFilters.indexOf(filter);
        if (genreIndex > -1) {
            genreFilters.splice(genreIndex, 1);
        }
        template.genreFilters.set(genreFilters);

        chip.remove();
        updateSearchResults();
    }
});

Template.sendMessage.events({
    'keydown .message-input'(event) {
        if (event.which === 13) {
            event.preventDefault();
            var messageText = $('.message-input').val();
            $('.message-input').val('');
            var message = {
                'sender': Meteor.user()['_id'],
                'recipient': this.messageInfo.id,
                'message': messageText
            };
            Message.insert(message);
            FlowRouter.go("/messages/" + this.messageInfo.id.toString());
            sendingMessage.set(false);
        }
    },
    'click .send-btn'(event) {
        var messageText = $('.message-input').val();
        $('.message-input').val('');
        var recipientId = this.messageInfo.id;
        var message = {
            'sender': Meteor.user()['_id'],
            'recipient': recipientId,
            'message': messageText
        };
        Message.insert(message);
        FlowRouter.go("/messages/" + recipientId.toString());
        sendingMessage.set(false);
    },
    'click #cancel-btn'(event) {
        sendingMessage.set(false);
    }
});

Template.accountCard.helpers ({
    profileUrl: function(id) {
        return "/profile?user=" + id;
    }
});

Template.accountCard.events ({
    'click .message-btn'(event, template) {
        event.preventDefault();
        messageTo.set(this);
        sendingMessage.set(true);
    }
})
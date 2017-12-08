import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Mongo } from 'meteor/mongo';
import { Message } from '../../../imports/api/message.js'
import { Profiles } from '../../../imports/api/profiles.js'

import './messaging.html';


Template.messaging.onCreated(function messagingOnCreate() {

    //SETTING recipientId REACTIVE VAR
    var recipientId = 0;
    var queryParameterId = FlowRouter.getParam('userId');
    if (queryParameterId) {
        var queryParameterId = FlowRouter.getParam('userId');
        if (Profiles.findOne({'_id': queryParameterId})) {
            recipientId = queryParameterId;
        }
    }
    this.recipientId = new ReactiveVar(recipientId);


    //SETTING conversations REACTIVE VAR
    var userId = Meteor.user()['_id'];
    var messages = Message.find({$or: [{'sender': userId}, {'recipient': userId}]});
    var userIds = [];
    messages.forEach((message) => {
        if (userIds.indexOf(message['sender']) == -1 && message['sender'] !== Meteor.user()._id) {
            userIds.push(message['sender']);
        }
        if (userIds.indexOf(message['recipient']) == -1 && message['recipient'] !== Meteor.user()._id) {
            userIds.push(message['recipient']);
        }
    });
    if (recipientId != 0 && userIds.indexOf(recipientId) == -1) {
        userIds.push(recipientId);
    }

    var users = userIds.map(function(userId) {
        var profile = Profiles.findOne({'_id': userId});
        return profile;
    });
    this.conversations = new ReactiveVar(users);
});

Template.messaging.helpers({
    conversations: function() {
        return Template.instance().conversations.get();
    },
    messages: function() {
        var recipientId = Template.instance().recipientId.get();
        if (recipientId == 0){
            return null;
        }
        var userId = Meteor.user()['_id'];
        var messages = Message.find({$or: [{'sender': userId, 'recipient': recipientId},
                                           {'sender': recipientId, 'recipient': userId}]});

        messages = messages.map(function(message) {
            message.sentByUser = (message['sender'] == userId);
            return message;
        });
        return messages;
    },
    recipientSelected: function() {
        // return true;
        return (Template.instance().recipientId.get() != 0);
    },
    recipient: function() {
        var recipientId = Template.instance().recipientId.get();
        if (recipientId == 0){
            return null;
        }
        var recipient = Profiles.findOne({'_id': recipientId});
        return recipient;
    }, 
    userIsRecipient: function(userId) {
        return (userId == Template.instance().recipientId.get());
    }
});

Template.messaging.events({
    'click .conversation-card'(event, template) {
        template.recipientId.set($(event.currentTarget).attr('id'));
    },
    'keydown #chat-field'(event, template) {
        if (event.which === 13) {
            event.preventDefault();
            var messageText = $('#chat-field').val();
            $('#chat-field').val('');
            var message = {
                'sender': Meteor.user()['_id'],
                'recipient': template.recipientId.get(),
                'message': messageText,
                'timestamp': Date.now()
            };
            Message.insert(message);
        }
    }
});
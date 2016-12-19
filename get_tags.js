"use strict";
require("colors");
var assert = require("assert");
var opcua = require("node-opcua");
var securityMode = opcua.MessageSecurityMode.get("NONE");
if (!securityMode) {
    throw new Error("Invalid Security mode , should be " + opcua.MessageSecurityMode.enums.join(" "));
}
var securityPolicy = opcua.SecurityPolicy.get("None");
if (!securityPolicy) {
    throw new Error("Invalid securityPolicy , should be " + opcua.SecurityPolicy.enums.join(" "));
}
var endpointUrl = "opc.tcp://128.83.159.107:49320";
var options = {
    securityMode: securityMode,
    securityPolicy: securityPolicy,
    defaultSecureTokenLifetime: 40000
};
var client = new opcua.OPCUAClient(options);
var g_session = null;
var g_subscription = null;
var monitoredItems = [];

var express = require("express");
var app = express();
var port = 3700;
var io = require('socket.io').listen(app.listen(port));

function monitorItem(nodeId) {
    var monitoredItem = g_subscription.monitor(
        {
            nodeId: nodeId, 
            attributeId: opcua.AttributeIds.Value
            //, dataEncoding: { namespaceIndex: 0, name:null }
        },
        {
            samplingInterval: 1000,
            discardOldest: true,
            queueSize: 100
        }
    );
    monitoredItems.push(monitoredItem);
    console.log('pushed ' + monitoredItem.itemToMonitor.nodeId.value);
    monitoredItem.on("initialized ", function (dataValue) {
        console.log("monitoredItem initialized: ");
    });
    monitoredItem.on("err  ", function (dataValue) {
        console.log("monitoredItem initialized: ");
    });
    monitoredItem.on("changed", function (dataValue) {
        console.log(" changed: ", dataValue.value.toString().green);
        io.sockets.emit('message', {
            value: dataValue.value.value,
            timestamp: dataValue.serverTimestamp,
            nodeId: nodeId, 
            browseName: "DP"
        });
    });
}
function unMonitorItem(){
    var monitoredItem = monitoredItems.pop();
    console.log('popped ' + monitoredItem.itemToMonitor.nodeId.value);
    monitoredItem.terminate();
    console.log('terminated ');
};
function createSubscription() {
    assert(g_session);
    var parameters = {
        requestedPublishingInterval: 100,
        requestedLifetimeCount: 1000,
        requestedMaxKeepAliveCount: 12,
        maxNotificationsPerPublish: 100,
        publishingEnabled: true,
        priority: 10
    };
    g_subscription = new opcua.ClientSubscription(g_session, parameters);
    g_subscription.on("started", function(){
        console.log("subscription started");
        console.log("  active: " + this.isActive());
        monitorItem("ns=2;s=BUMP1.UTCampus.ADH.CHW_DP");
        monitorItem("ns=2;s=BUMP1.UTCampus.ART.CHW_DP");
    })
}
function sessionCreated(err, session) {
    if (!err) {
        g_session = session;
        createSubscription();
    } else {
        console.log(" Cannot create session ", err.toString());
        process.exit(-1);
    }
};
client.connect(endpointUrl, function() {
    var userIdentity = null;
    client.createSession(userIdentity, sessionCreated);
});
function disconnect() {
    g_session.close(function () {
        client.disconnect(function (err) {

        });
    });
}
console.log("endpoint url   = ".cyan, endpointUrl.toString());
console.log("securityMode   = ".cyan, securityMode.toString());
console.log("securityPolicy = ".cyan, securityPolicy.toString());

console.log('bottom of script');
// console.log('active!');
// debugger; 

// var monitoredItem = monitoredItems[0];
// setTimeout(unMonitorItem(), 5000);

function startHTTPServer() {
    var app = express();
    app.get("/", function(req, res){
        res.send("It works! Now index.html.");
    });
    app.use(express.static(__dirname + '/'));
    var io = require('socket.io').listen(app.listen(port));
    io.sockets.on('connection', function (socket) {
//        socket.on('send', function (data) {
//            io.sockets.emit('message', data);
//        });
    });
    var monitoredItem = the_subscription.monitor(
        {
            nodeId: nodeIdToMonitor,
            attributeId: 13
        },
        {
            samplingInterval: 100,
            discardOldest: true,
            queueSize: 100
        },
        opcua.read_service.TimestampsToReturn.Both,function(err) {
            if (err) {
                console.log("Monitor  "+ nodeIdToMonitor.toString() +  " failed");
                console.log("ERr = ",err.message);
            }

        }
    );
    monitoredItem.on("changed", function(dataValue){
        console.log("changed: " +  dataValue.toString());
        io.sockets.emit('message', {
            value: dataValue.value.value,
            timestamp: dataValue.serverTimestamp,
            nodeId: nodeIdToMonitor.toString(),
            browseName: "DP"
        });
    });
}
startHTTPServer();
console.log("Listening on port " + port);
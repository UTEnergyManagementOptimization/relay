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
function monitorItem(nodeId) {
    var monitoredItem = g_subscription.monitor(
        {
            nodeId: nodeId, // node.nodeId, 
            attributeId: opcua.AttributeIds.Value
            //, dataEncoding: { namespaceIndex: 0, name:null }
        },
        {
            samplingInterval: 1000,
            discardOldest: true,
            queueSize: 100
        }
    );
    monitoredItem.on("changed", function (dataValue) {
        console.log(" dataValue: ", dataValue.value.toString().green);
    });
    monitoredItems.push(monitoredItem);
    console.log('pushed ' + monitoredItem.itemToMonitor.nodeId.value);
}
function unMonitorItem(){
    var monitoredItem = monitoredItems.pop();
    console.log('poped ' + monitoredItem.itemToMonitor.nodeId.value);
    monitoredItem.terminate();
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
// monitorItem("ns=2;s=BUMP1.UTCampus.ADH.CHW_DP");
// monitorItem("ns=2;s=BUMP1.UTCampus.ART.CHW_DP");

// var monitoredItem = monitoredItems[0];
// setTimeout(unMonitorItem(), 5000);
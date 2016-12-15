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
function create_subscription() {
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
}
client.connect(endpointUrl, function () {
    var userIdentity = null;
    client.createSession(userIdentity,function (err, session) {
        if (!err) {
            g_session = session;
            create_subscription();
            monitor_item("ns=2;s=BUMP1.UTCampus.ADH.CHW_DP");
        } else {
            console.log(" Cannot create session ", err.toString());
            process.exit(-1);
        }
    });
});
function disconnect() {
    g_session.close(function () {
        client.disconnect(function (err) {

        });
    });
}
var monitoredItemsListData = [];
function monitor_item(nodeId) {
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
}
function unmonitor_item(treeItem) {
    var node = treeItem.node;
    var browseName = treeItem.browseName || node.nodeId.toString();

    // teminate subscription
    node.monitoredItem.terminate();
  
    var index = -1
    monitoredItemsListData.forEach(function(entry, i) {
      if (entry[1] == node.nodeId.toString()) {
        index = i;
      }
    });
    if (index > -1) {  
      monitoredItemsListData.splice(index, 1);
    }
    
    node.monitoredItem = null; 
    
    if (monitoredItemsListData.length > 0) {
      monitoredItemsList.setRows(monitoredItemsListData);
    } else {
      var empty = [[" "]];
      monitoredItemsList.setRows(empty);
    }
    
    monitoredItemsList.render();
     
}
console.log(" Welcome to Node-OPCUA CLI".red, "  Client".green);
console.log("   endpoint url   = ".cyan, endpointUrl.toString());
console.log("   securityMode   = ".cyan, securityMode.toString());
console.log("   securityPolicy = ".cyan, securityPolicy.toString());

console.log('bottom of script');
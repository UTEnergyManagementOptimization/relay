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
var buildings = {
    'msb': { 'lat': 30.2827, 'lon': -97.7257 },
    'ua9': { 'lat': 30.2903, 'lon': -97.7387 },
    'bwy': { 'lat': 30.2908, 'lon': -97.7382 },
    'sw7': { 'lat': 30.2908, 'lon': -97.7363 },
    'tsg': { 'lat': 30.2913, 'lon': -97.7386 },
    'aca': { 'lat': 30.2877, 'lon': -97.7357 },
    'adh': { 'lat': 30.2915, 'lon': -97.7406 },
    'and': { 'lat': 30.2882, 'lon': -97.7398 },
    'ahg': { 'lat': 30.2885, 'lon': -97.7377 },
    'anb': { 'lat': 30.2783, 'lon': -97.731 },
    'art': { 'lat': 30.2862, 'lon': -97.733 },
    'wat': { 'lat': 30.2784, 'lon': -97.7336 },
    'att': { 'lat': 30.282, 'lon': -97.7405 },
    'afp': { 'lat': 30.2853, 'lon': -97.7263 },
    'bsb': { 'lat': 30.2814, 'lon': -97.7354 },
    'btl': { 'lat': 30.2854, 'lon': -97.7403 },
    'bat': { 'lat': 30.2848, 'lon': -97.7389 },
    'jes': { 'lat': 30.2829, 'lon': -97.7368 },
    'bmc': { 'lat': 30.2902, 'lon': -97.7408 },
    'ben': { 'lat': 30.284, 'lon': -97.739 },
    'brb': { 'lat': 30.2852, 'lon': -97.7367 },
    'bot': { 'lat': 30.287, 'lon': -97.74 },
    'bio': { 'lat': 30.2872, 'lon': -97.7398 },
    'bgh': { 'lat': 30.2869, 'lon': -97.7388 },
    'bme': { 'lat': 30.2892, 'lon': -97.7386 },
    'grg': { 'lat': 30.2877, 'lon': -97.7399 },
    'bld': { 'lat': 30.2887, 'lon': -97.7394 },
    'bhd': { 'lat': 30.2831, 'lon': -97.736 },
    'brg': { 'lat': 30.2809, 'lon': -97.7362 },
    'bur': { 'lat': 30.2888, 'lon': -97.7385 },
    'cal': { 'lat': 30.2845, 'lon': -97.7402 },
    'crd': { 'lat': 30.2887, 'lon': -97.7401 },
    'clk': { 'lat': 30.2817, 'lon': -97.7349 },
    'cs3': { 'lat': 30.2807, 'lon': -97.7355 },
    'cs4': { 'lat': 30.2887, 'lon': -97.7325 },
    'cs5': { 'lat': 30.2907, 'lon': -97.7355 },
    'cs6': { 'lat': 30.2864, 'lon': -97.7358 },
    'cpe': { 'lat': 30.2903, 'lon': -97.7361 },
    'cdl': { 'lat': 30.2788, 'lon': -97.733 },
    'cba': { 'lat': 30.2842, 'lon': -97.7378 },
    'cda': { 'lat': 30.283, 'lon': -97.7257 },
    'cml': { 'lat': 30.2829, 'lon': -97.7253 },
    'csa': { 'lat': 30.2885, 'lon': -97.7357 },
    'ccg': { 'lat': 30.2821, 'lon': -97.7404 },
    'ccj': { 'lat': 30.2881, 'lon': -97.7304 },
    'cee': { 'lat': 30.2906, 'lon': -97.7364 },
    'ct1': { 'lat': 30.2866, 'lon': -97.7348 },
    'crh': { 'lat': 30.2885, 'lon': -97.7334 },
    'fc9': { 'lat': 30.2838, 'lon': -97.724 },
    'std': { 'lat': 30.2836, 'lon': -97.7323 },
    'dcp': { 'lat': 30.2762, 'lon': -97.733 },
    'dev': { 'lat': 30.2873, 'lon': -97.7236 },
    'dtb': { 'lat': 30.2873, 'lon': -97.7322 },
    'geb': { 'lat': 30.2863, 'lon': -97.7386 },
    'dfa': { 'lat': 30.2859, 'lon': -97.7318 },
    'eps': { 'lat': 30.2858, 'lon': -97.7367 },
    'eas': { 'lat': 30.2811, 'lon': -97.7382 },
    'etc': { 'lat': 30.2899, 'lon': -97.7354 },
    'ens': { 'lat': 30.2881, 'lon': -97.7353 },
    'ecj': { 'lat': 30.289, 'lon': -97.7354 },
    'utx': { 'lat': 30.2843, 'lon': -97.7344 },
    'win': { 'lat': 30.2859, 'lon': -97.7345 },
    'fc1': { 'lat': 30.2846, 'lon': -97.7226 },
    'fc2': { 'lat': 30.2839, 'lon': -97.7231 },
    'fc3': { 'lat': 30.2848, 'lon': -97.7237 },
    'fc4': { 'lat': 30.2843, 'lon': -97.7236 },
    'fc5': { 'lat': 30.2836, 'lon': -97.7246 },
    'fc6': { 'lat': 30.2834, 'lon': -97.7258 },
    'fc7': { 'lat': 30.2833, 'lon': -97.7264 },
    'fc8': { 'lat': 30.2854, 'lon': -97.7239 },
    'fct': { 'lat': 30.2843, 'lon': -97.7224 },
    'erc': { 'lat': 30.2769, 'lon': -97.7322 },
    'gar': { 'lat': 30.2852, 'lon': -97.7385 },
    'gdc': { 'lat': 30.2863, 'lon': -97.7365 },
    'szb': { 'lat': 30.2817, 'lon': -97.7388 },
    'gol': { 'lat': 30.2854, 'lon': -97.7412 },
    'gsb': { 'lat': 30.2842, 'lon': -97.7383 },
    'grf': { 'lat': 30.2842, 'lon': -97.7356 },
    'grc': { 'lat': 30.2838, 'lon': -97.7359 },
    'grp': { 'lat': 30.2844, 'lon': -97.7359 },
    'grs': { 'lat': 30.2836, 'lon': -97.736 },
    'gre': { 'lat': 30.284, 'lon': -97.7364 },
    'gug': { 'lat': 30.2795, 'lon': -97.7432 },
    'ppe': { 'lat': 30.2869, 'lon': -97.7359 },
    'ppa': { 'lat': 30.2869, 'lon': -97.7344 },
    'ppl': { 'lat': 30.2865, 'lon': -97.7352 },
    'hrc': { 'lat': 30.2843, 'lon': -97.7412 },
    'hma': { 'lat': 30.2869, 'lon': -97.7406 },
    'ipf': { 'lat': 30.2863, 'lon': -97.7265 },
    'int': { 'lat': 30.2884, 'lon': -97.7434 },
    'icb': { 'lat': 30.3148, 'lon': -97.7278 },
    'fdh': { 'lat': 30.2894, 'lon': -97.7325 },
    'pat': { 'lat': 30.288, 'lon': -97.7364 },
    'bma': { 'lat': 30.281, 'lon': -97.7374 },
    'jgb': { 'lat': 30.2859, 'lon': -97.7357 },
    'cma': { 'lat': 30.2894, 'lon': -97.7407 },
    'cmb': { 'lat': 30.2892, 'lon': -97.7411 },
    'jon': { 'lat': 30.2886, 'lon': -97.7317 },
    'jcd': { 'lat': 30.2822, 'lon': -97.7363 },
    'tcc': { 'lat': 30.287, 'lon': -97.729 },
    'jjf': { 'lat': 30.2835, 'lon': -97.7325 },
    'jhh': { 'lat': 30.2784, 'lon': -97.732 },
    'kin': { 'lat': 30.2904, 'lon': -97.7396 },
    'bel': { 'lat': 30.2837, 'lon': -97.7337 },
    'lth': { 'lat': 30.286, 'lon': -97.7352 },
    'fnt': { 'lat': 30.2879, 'lon': -97.7379 },
    'tsc': { 'lat': 30.2799, 'lon': -97.7335 },
    'cla': { 'lat': 30.2849, 'lon': -97.7354 },
    'lch': { 'lat': 30.2886, 'lon': -97.7408 },
    'ltd': { 'lat': 30.2893, 'lon': -97.7397 },
    'lfh': { 'lat': 30.2881, 'lon': -97.7408 },
    'lla': { 'lat': 30.2906, 'lon': -97.7405 },
    'llb': { 'lat': 30.2909, 'lon': -97.7405 },
    'llc': { 'lat': 30.2911, 'lon': -97.7405 },
    'lld': { 'lat': 30.2906, 'lon': -97.7409 },
    'lle': { 'lat': 30.2909, 'lon': -97.741 },
    'llf': { 'lat': 30.2911, 'lon': -97.7408 },
    'ldh': { 'lat': 30.2826, 'lon': -97.7359 },
    'lbj': { 'lat': 30.2858, 'lon': -97.7292 },
    'mai': { 'lat': 30.286, 'lon': -97.7394 },
    'mag': { 'lat': 30.2828, 'lon': -97.7309 },
    'gea': { 'lat': 30.2877, 'lon': -97.7392 },
    'mez': { 'lat': 30.2844, 'lon': -97.7389 },
    'mms': { 'lat': 30.2826, 'lon': -97.7301 },
    'mbb': { 'lat': 30.2885, 'lon': -97.7373 },
    'mnc': { 'lat': 30.2823, 'lon': -97.7327 },
    'mhd': { 'lat': 30.2836, 'lon': -97.7353 },
    'mrh': { 'lat': 30.2873, 'lon': -97.7309 },
    'nms': { 'lat': 30.2892, 'lon': -97.7376 },
    'nhb': { 'lat': 30.2876, 'lon': -97.738 },
    'nez': { 'lat': 30.2846, 'lon': -97.7325 },
    'noa': { 'lat': 30.2911, 'lon': -97.7375 },
    'nur': { 'lat': 30.2777, 'lon': -97.7336 },
    'fpc': { 'lat': 30.2794, 'lon': -97.725 },
    'par': { 'lat': 30.2848, 'lon': -97.7402 },
    'ttc': { 'lat': 30.2778, 'lon': -97.7348 },
    'pac': { 'lat': 30.2864, 'lon': -97.7311 },
    'pcl': { 'lat': 30.2828, 'lon': -97.7382 },
    'pob': { 'lat': 30.2869, 'lon': -97.7366 },
    'fac': { 'lat': 30.2863, 'lon': -97.7404 },
    'phr': { 'lat': 30.2882, 'lon': -97.7386 },
    'phd': { 'lat': 30.2824, 'lon': -97.7351 },
    'ppb': { 'lat': 30.2813, 'lon': -97.7269 },
    'hrh': { 'lat': 30.2842, 'lon': -97.7402 },
    'rsc': { 'lat': 30.2815, 'lon': -97.7324 },
    'sbs': { 'lat': 30.2805, 'lon': -97.725 },
    'mfh': { 'lat': 30.282, 'lon': -97.7311 },
    'wel': { 'lat': 30.2866, 'lon': -97.7377 },
    'rlm': { 'lat': 30.2889, 'lon': -97.7363 },
    'rhd': { 'lat': 30.2831, 'lon': -97.7351 },
    'sag': { 'lat': 30.2887, 'lon': -97.7427 },
    'sjg': { 'lat': 30.2877, 'lon': -97.7329 },
    'sjh': { 'lat': 30.2823, 'lon': -97.7344 },
    'sea': { 'lat': 30.29, 'lon': -97.7373 },
    'ssw': { 'lat': 30.2806, 'lon': -97.7327 },
    'ser': { 'lat': 30.2877, 'lon': -97.7346 },
    'srh': { 'lat': 30.285, 'lon': -97.7289 },
    'swg': { 'lat': 30.2912, 'lon': -97.7371 },
    'sac': { 'lat': 30.2849, 'lon': -97.7363 },
    'ssb': { 'lat': 30.2901, 'lon': -97.7384 },
    'sut': { 'lat': 30.285, 'lon': -97.7408 },
    'pai': { 'lat': 30.287, 'lon': -97.7387 },
    'sof': { 'lat': 30.2809, 'lon': -97.7275 },
    'tsb': { 'lat': 30.3152, 'lon': -97.7267 },
    'tmm': { 'lat': 30.287, 'lon': -97.7324 },
    'tnh': { 'lat': 30.2886, 'lon': -97.7307 },
    'trg': { 'lat': 30.2791, 'lon': -97.7339 },
    'dff': { 'lat': 30.2794, 'lon': -97.7265 },
    'unb': { 'lat': 30.2866, 'lon': -97.7411 },
    'uil': { 'lat': 30.2833, 'lon': -97.7236 },
    'upb': { 'lat': 30.2841, 'lon': -97.7304 },
    'uss': { 'lat': 30.2926, 'lon': -97.7363 },
    'utc': { 'lat': 30.2831, 'lon': -97.7388 },
    'uta': { 'lat': 30.2793, 'lon': -97.7428 },
    'wrw': { 'lat': 30.2875, 'lon': -97.7359 },
    'wag': { 'lat': 30.2851, 'lon': -97.7376 },
    'wwh': { 'lat': 30.2893, 'lon': -97.7418 },
    'wmb': { 'lat': 30.2854, 'lon': -97.7406 },
    'wch': { 'lat': 30.2861, 'lon': -97.7384 },
    'hsm': { 'lat': 30.2889, 'lon': -97.7408 }
}; 
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
    monitoredItems.push(monitoredItem);
    console.log('pushed ' + monitoredItem.itemToMonitor.nodeId.value);
    monitoredItem.on("initialized ", function (dataValue) {
        console.log("monitoredItem initialized: ");
    });
    monitoredItem.on("err  ", function (dataValue) {
        console.log("monitoredItem initialized: ");
    });
    monitoredItem.on("changed", function (dataValue) {
        debugger; 
        console.log(nodeId + ' ' + dataValue.value.value.toString().green);
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
        var nodeIdPrefix = 'ns=2;s=BUMP1.UTCampus.';
        var nodeIdSuffix = '.CHW_DP';
        Object.keys(buildings).forEach(function(building) {
          var nodeId = nodeIdPrefix + building.toUpperCase() + nodeIdSuffix;
          console.log('monitorItem: ' + nodeId); 
          monitorItem(nodeId);
        });
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

var express = require('express')
var port = 3700;
var app = express();
app.get("/", function(req, res){
    res.send("It works! Now index.html.");
});
app.use(express.static(__dirname + '/'));
var io = require('socket.io').listen(app.listen(port));
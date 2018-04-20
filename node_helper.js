/* MiOSView Info */

/* Magic Mirror
 * Module: MiOS Viewer
 * By Nick Wootton
 * MIT Licensed.
 */

var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
  start: function () {
    console.log('MMM-MiOSView helper started ...');
  },


	/* getVeraData()
	 * Requests new data from local vera devices
	 * Sends data back via socket on succesfull response.
	 */
  getVeraData: function(url,api_key) {
  		var self = this;
  		var retry = true;

      var options = {
        url: url,
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'GET'
      };

      request(options, function(error, response, body) {
        if(!error && response.statusCode == 200) {
          self.sendSocketNotification('MiOS_DATA', {'data': JSON.parse(body), 'url': url});
        }
      });
  	},

  //Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'GET_MiOSINFO') {
      this.getVeraData(payload.url);
    }
  }

});

/* MiOS Status Viewing Module */

/* Magic Mirror
 * Module: MiOS Viewer
 *
 * By Nick Wootton
 * based on SwissTransport module by Benjamin Angst http://www.beny.ch
 * and documentstaion from MCV here - http://wiki.micasaverde.com/index.php/UI_Simple
 * MIT Licensed.
 */

Module.register("MMM-MiOSView", {

    // Define module defaults
    defaults: {
        updateInterval: 5 * 60 * 1000, // Update every 5 minutes.
        animationSpeed: 2000,
        fade: true,
        fadePoint: 0.25, // Start on 1/4th of the list.
        initialLoadDelay: 0, // start delay seconds.

        LoadTime:       0,
        DataVersion:    0,
        DefaultTimeout: 60,
        DefaultMinimumDelay:    2000,
        CurrentMinimumDelay:    0,
        CurrentSleep:   2000,
        EngineState:    -2,             // Meaning we are not connected
        NumFailures:    0,


        veraURL:    '',                 // URL of Local Vera box
        header:     'Vera Status',
        debug:      false
    },

    // Define required scripts.
    getStyles: function() {
        return ["vera.css", "font-awesome.css"];
    },

    // Define required scripts.
    getScripts: function() {
        return ["moment.js", this.file('titleCase.js')];
    },

    //Define header for module.
    getHeader: function() {
        this.config.header = this.translate("HEADER");

        return this.config.header;
    },

    //Get translations
    getTranslations: function() {
        return {
                en: "translations/en.json",
                de: "translations/de.json"
        }
    },

    // Define start sequence.
    start: function() {
        Log.info("Starting module: " + this.name);

        // Set locale.
        moment.locale(config.language);

        this.VeraData = {};
        this.loaded = false;
        this.scheduleUpdate(this.config.initialLoadDelay);

        this.updateTimer = null;

        this.url = encodeURI('http://' + this.config.veraURL + ":3480/" + this.getParams());

        if (this.config.debug) {
            Log.warn('URL Request is: ' + this.url);
        }

        this.updateVeraInfo(this);
    },

    // updateVeraInfo
    updateVeraInfo: function(self) {
        if (this.hidden != true) {
            self.sendSocketNotification('GET_MiOSINFO', { 'url': this.url });
        }
    },

    //format date output
    formatDate: function(formatDate, formatString) {
        if(formatDate instanceof Date) {
            var months = new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec");
            var yyyy = formatDate.getFullYear();
            var yy = yyyy.toString().substring(2);
            var m = formatDate.getMonth();
            var mm = m < 10 ? "0" + m : m;
            var mmm = months[m];
            var d = formatDate.getDate();
            var dd = d < 10 ? "0" + d : d;
            
            var h = formatDate.getHours();
            var hh = h < 10 ? "0" + h : h;
            var n = formatDate.getMinutes();
            var nn = n < 10 ? "0" + n : n;
            var s = formatDate.getSeconds();
            var ss = s < 10 ? "0" + s : s;
            formatString = formatString.replace(/yyyy/i, yyyy);
            formatString = formatString.replace(/yy/i, yy);
            formatString = formatString.replace(/mmm/i, mmm);
            formatString = formatString.replace(/mm/i, mm);
            formatString = formatString.replace(/m/i, m);
            formatString = formatString.replace(/dd/i, dd);
            formatString = formatString.replace(/d/i, d);
            formatString = formatString.replace(/hh/i, hh);
            formatString = formatString.replace(/h/i, h);
            formatString = formatString.replace(/nn/i, nn);
            formatString = formatString.replace(/n/i, n);
            formatString = formatString.replace(/ss/i, ss);
            formatString = formatString.replace(/s/i, s);
            return formatString;
        } else {
            return "";
        }
    },

    // Override dom generator.
    getDom: function() {
        var wrapper = document.createElement("div");

        if (this.config.api_key === "") {
            wrapper.innerHTML = this.translate("SET_KEY") + ": " + this.api_key + ".";
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        if (!this.loaded) {
            wrapper.innerHTML = this.translate("LOAD_MSG");
            wrapper.className = "dimmed light small";
            return wrapper;
        }

        // *** Start Building Table
        var table = document.createElement("table");
        table.className = "small";

        //With data returned
        if (typeof this.VeraData.devices !== 'undefined' && this.VeraData.devices !== null) {
            var myDevices = this.VeraData.devices;

            if (this.config.debug) {
                Log.info(myDevices);
            }

            for (var r in myDevices) {
                var myDevice = myDevices[r];

                //Create row for Current device
                var deviceRow = document.createElement("tr");
                table.appendChild(deviceRow);

                //device cell
                var deviceCurrentCell = document.createElement("td");
                    deviceCurrentCell.innerHTML = myDevice.name;
                    deviceRow.appendChild(deviceCurrentCell);

                    //Time reported
                    var deviceStatusCell = document.createElement("td");

                    if ((myDevice.status == 0)) {
                        deviceStatusCell.className = "bright status deviceOff";
                    }
                    else if ((myDevice.status == 1)) {
                        deviceStatusCell.className = "bright status deviceOn";
                    }
                    else {
                        deviceStatusCell.className = "bright ";
                    }
                    deviceStatusCell.innerHTML = myDevice.status

                    deviceRow.appendChild(deviceStatusCell);
                }

        } else {
            var row1 = document.createElement("tr");
            table.appendChild(row1);

            var messageCell = document.createElement("td");
            messageCell.innerHTML = " " + this.VeraData.message + " ";
            messageCell.className = "bright";
            row1.appendChild(messageCell);

            var row2 = document.createElement("tr");
            table.appendChild(row2);

            var timeCell = document.createElement("td");
            timeCell.innerHTML = " " + this.VeraData.timestamp + " ";
            timeCell.className = "bright";
            row2.appendChild(timeCell);
        }

        wrapper.appendChild(table);
        // *** End building results table

        return wrapper;
    },

    /* processVeraData(data)
     * Uses the received data to set the various values.
     *
     */
    processVeraData: function(data) {

        //Dump data
        if (this.config.debug) {
            Log.info(data);
        }

        //Check we have data back from API
        if (typeof data !== 'undefined' && data !== null) {

            // We got valid data, so introduce the minimum delay in case there's a flood of changes in the Vera
            this.config.CurrentMinimumDelay = this.config.DefaultMinimumDelay;

            //define object to hold output info
            this.VeraData = {};

            //Define object for device data
            this.VeraData.devices = [];

            //Define message holder
            this.VeraData.message = null;

            //Timestamp
            this.VeraData.timestamp = new Date();

            //Check we have device array
            if (typeof data.devices !== 'undefined' && data.devices !== null) {

                //.. and actual values
                if (typeof data.devices.length !== 'undefined' && data.devices.length !== 0) {

                    for (var i=0; i < data.devices.length; i++) {
                        var deviceInfo = data.devices[i];

                        if (deviceInfo.category == 3) {
                            this.VeraData.devices.push(
                            {
                                name: deviceInfo.name,
                                status: deviceInfo.status
                            });
                        }
                    }

                } else {
                    //No device info returned - set message
                    this.VeraData.message = "No devices found";
                    if (this.config.debug) {
                        Log.error("=======LEVEL 3=========");
                        Log.error(this.VeraData);
                        Log.error("^^^^^^^^^^^^^^^^^^^^^^^");
                    }
                }

            } else {
                //No info returned - set message
                this.VeraData.message = "No info about the devices returned";
                if (this.config.debug) {
                    Log.error("=======LEVEL 2=========");
                    Log.error(this.VeraData);
                    Log.error("^^^^^^^^^^^^^^^^^^^^^^^");
                }
            }

        } else {
            //No data returned - set message
            this.VeraData.message = "No data returned";
            if (this.config.debug) {
                Log.error("=======LEVEL 1=========");
                Log.error(this.VeraData);
                Log.error("^^^^^^^^^^^^^^^^^^^^^^^");
            }
        }

        this.loaded = true;
        this.updateDom(this.config.animationSpeed);
    },


    /* getParams(compliments)
     * Generates an url with url parameters based on the config.
     *
     * return String - URL params.
     */
    getParams: function() {
        var params = "data_request?id=lu_sdata";
        params += "&loadtime=" + this.config.LoadTime;
        params += "&dataversion=" + this.config.DataVersion;
        params += "&timeout=" + this.config.DefaultTimeout;
        params += "&minimumdelay=" + this.config.CurrentMinimumDelay;

        if (this.config.debug) {
            Log.warn(params);
        }

        return params;
    },

    /* scheduleUpdate()
     * Schedule next update.
     *
     * argument delay number - Milliseconds before next update. If empty, this.config.updateInterval is used.
     */
    scheduleUpdate: function(delay) {
        var nextLoad = this.config.updateInterval;
        if (typeof delay !== "undefined" && delay >= 0) {
            nextLoad = delay;
        }

        var self = this;
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(function() {
            self.updateVeraInfo(self);
        }, nextLoad);
    },


    // Process data returned
    socketNotificationReceived: function(notification, payload) {

        if (notification === 'MiOS_DATA' && payload.url === this.url) {
            this.processVeraData(payload.data);
            this.scheduleUpdate(this.config.updateInterval);
        }
    }

});

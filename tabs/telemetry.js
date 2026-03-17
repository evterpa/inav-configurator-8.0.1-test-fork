'use strict';

const path = require('path');
const Store = require('electron-store');
const store = new Store();

const MSPChainerClass = require('../js/msp/MSPchainer');
const mspHelper = require('../js/msp/MSPHelper');
// MSPCodes и MSP могут понадобиться в будущем для другой телеметрии, оставляем
const MSPCodes = require('../js/msp/MSPCodes');
const MSP = require('../js/msp');
const { GUI, TABS } = require('../js/gui');
const tabs = require('../js/tabs');
const FC = require('../js/fc');
const Settings = require('../js/settings');
const i18n = require('../js/localization');
const { scaleRangeInt } = require('../js/helpers');
const interval = require('../js/intervals');

require('./sensors');
require('./osd');

TABS.telemetry = {

};

TABS.telemetry.initialize = function (callback) {
    var self = this;

    if (GUI.active_tab != 'telemetry') {
        GUI.active_tab = 'telemetry';
    }

    function load_html() {
        GUI.load(path.join(__dirname, "telemetry.html"), Settings.processHtml(process_html));
    }

    function process_html() {
        i18n.localize();

        var $sensorContainer = $('#subtab-telemetry-other');
        var sensorsInitialized = false; 

        var $osdContainer = $('#subtab-telemetry');
        var osdInitialized = false; 
 
        $('.subtab__header_label').on('click', function() {
            var targetId = $(this).attr('for');
            
            $('.subtab__header_label').removeClass('subtab__header_label--current');
            $(this).addClass('subtab__header_label--current');
            
            $('.subtab__content').removeClass('subtab__content--current');
            $('#' + targetId).addClass('subtab__content--current');
            
            if (targetId === 'subtab-telemetry-other' && !sensorsInitialized) {
                initializeSensors();
                sensorsInitialized = true;
            }
            if (targetId === 'subtab-telemetry' && !osdInitialized) {
                initializeOSD();
                osdInitialized = true;
            }
        });

        function initializeSensors() {
            interval.killAll(['IMU_pull', 'altitude_pull', 'sonar_pull', 'airspeed_pull', 'temperature_pull', 'debug_pull']);

            TABS.sensors.initializeInContainer('#subtab-telemetry-other', function() {
                console.log('Sensors initialized successfully in telemetry tab container');
            });
        }

        function initializeOSD() {

            TABS.osd.initializeInContainer('#subtab-telemetry', function() {
                console.log('OSD initialized successfully in telemetry tab container');
            });
        }

        if ($('#subtab-telemetry-other').hasClass('subtab__content--current')) {
            initializeSensors();
            sensorsInitialized = true;
        }
        if ($('#subtab-telemetry').hasClass('subtab__content--current')) {
            initializeOSD();
            osdInitialized = true;
        }

        GUI.content_ready(callback);
    }

    load_html()
};

TABS.telemetry.cleanup = function (callback) {
    if (TABS.sensors.cleanup) {
        TABS.sensors.cleanup();
    } else {
        interval.killAll(['IMU_pull', 'altitude_pull', 'sonar_pull', 'airspeed_pull', 'temperature_pull', 'debug_pull']);
    }

    if (callback) {
        callback();
    }
};

'use strict';

const path = require('path');
const Store = require('electron-store');
const store = new Store()

const MSPChainerClass = require('../js/msp/MSPchainer');
const mspHelper = require('../js/msp/MSPHelper');
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

TABS.telemetry = {
    rateChartHeight: 117
};

TABS.telemetry.initialize = function (callback) {

    var loadChainer = new MSPChainerClass();

    let EZ_TUNE_PID_RP_DEFAULT = [40, 75, 23, 100];
    let EZ_TUNE_PID_YAW_DEFAULT = [45, 80, 0, 100];

    var loadChain = [
        mspHelper.loadPidData,
        mspHelper.loadRateDynamics,
        mspHelper.loadRateProfileData,
        mspHelper.loadEzTune,
        mspHelper.loadMixerConfig,
    ];

    loadChainer.setChain(loadChain);
    loadChainer.setExitPoint(load_html);
    loadChainer.execute();

    if (GUI.active_tab != 'telemetry') {
        GUI.active_tab = 'telemetry';
    }

    function load_html() {
        GUI.load(path.join(__dirname, "telemetry.html"), Settings.processHtml(process_html));
    }

    function process_html() {
        i18n.localize();

        var $sensorContainer = $('#subtab-telemetry-other');
        
        // Обработчик для сабтабов
        $('.subtab__header_label').on('click', function() {
            var targetId = $(this).attr('for');
            
            $('.subtab__header_label').removeClass('subtab__header_label--current');
            $(this).addClass('subtab__header_label--current');
            
            $('.subtab__content').removeClass('subtab__content--current');
            $('#' + targetId).addClass('subtab__content--current');
            
            if (targetId === 'subtab-telemetry-other' && $sensorContainer.children().length === 0) {
                initializeSensors();
            }
        });

        function initializeSensors() {
            interval.killAll(['IMU_pull', 'altitude_pull', 'sonar_pull', 'airspeed_pull', 'temperature_pull', 'debug_pull']);
            
            TABS.sensors.initializeInContainer('#subtab-telemetry-other', function() {
                console.log('Sensors initialized in telemetry tab');
            });
        }

        if ($('#subtab-telemetry-other').hasClass('subtab__content--current') && $sensorContainer.children().length === 0) {
            initializeSensors();
        }

        GUI.content_ready(callback);
    }
};

TABS.telemetry.cleanup = function (callback) {
    interval.killAll(['IMU_pull', 'altitude_pull', 'sonar_pull', 'airspeed_pull', 'temperature_pull', 'debug_pull']);
    
    if (callback) {
        callback();
    }
};
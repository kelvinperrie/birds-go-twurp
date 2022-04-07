

var pageModel = function(soundsConfiguration, presetsConfiguration) {
    var self = this;

    self.soundsConfiguration = soundsConfiguration;     // holds a colleciton of sound configuration data
    self.presetsConfiguration = presetsConfiguration;   // holds a collection of preset configuration data
    self.soundControllers = ko.observableArray();       // holds a collection of sound controller objects created from the sound configuration data

    // create sound controller objects based on our configuration
    self.loadSounds = function() {
        self.soundControllers([]);
        var lastCategory = null;
        for (var soundConfig of self.soundsConfiguration) {
            var soundController = new soundControllerModel(soundConfig);
            if(lastCategory !== soundController.category()) {
                soundController.showCategory(true);
            }
            self.soundControllers.push(soundController);
            lastCategory = soundController.category();
        }
    }

    // stops all sounds
    self.resetSounds = function() {
        for (var soundController of self.soundControllers()) {
            soundController.resetSound();
        }
    }

    // activate the sounds for a preset
    self.loadPreset = function(preset) {
        // stop all sounds
        self.resetSounds();
        // search for each sound and turn it on
        for (var presetSound of preset.sounds) {
            for(var soundController of self.soundControllers()) {
                if(soundController.label() === presetSound.label) {
                    soundController.selectedVolume(presetSound.volume * 100)
                    soundController.toggleActive();
                    break;
                }
            }
        }
    };

    self.initialise = function() {
        self.loadSounds();
    };
    self.initialise();
};

var soundControllerModel = function(soundConfig) {
    var self = this;

    self.soundConfig = soundConfig;         // the configuration that defines this sound
    self.ready = ko.observable(false);      // tracks whether this sound is ready to be played
    self.active = ko.observable(false);     // tracks if the sound is active i.e. being played
    self.seekWhenStopped = 0;               // the point in the sound where it was last stopped

    self.category = ko.observable();            // the category, if any, of the sound. Currently only 'ambient' and everything not ambient
    self.showCategory = ko.observable(false);   // when we're drawing the sound controller on the page do we need to show the category first?
    self.label = ko.observable();               // the name of the sound
    self.file = ko.observable();                // path to the sound file
    self.volume = ko.observable();              // the current volume of the sound; 0 to 1
    self.selectedVolume = ko.observable();      // this is bound to the slider; 0 to 100
    self.initialVolume = ko.observable();       // the volume that the sound starts at - used when reseting sounds
    self.howlerObject = null;                   // the howler object that plays the sound
    self.attribution = ko.observable();         // an object describing who owns the sound + license etc

    // determines the class for our sound
    self.containerClasses = ko.computed(function() {
        var classes = "sound-container";
        if(self.active()) {
            classes += " sound-active";
        }
        return classes;
    });

    // stop the sound and reset the volume to the default
    self.resetSound = function() {
        self.stopSound();
        self.selectedVolume(self.initialVolume() * 100);
    }

    self.stopSound = function() {
        // we're going to stop the sound, remembering where we stopped it
        self.seekWhenStopped = self.howlerObject.seek();
        self.howlerObject.stop();
        self.active(false);
    };

    // subscribe to the user changing the volume so we can update the volume of the sound
    self.selectedVolume.subscribe(function(newValue) {
        if(self.howlerObject) {
            self.howlerObject.volume(newValue/ 100);
        }
     });

    self.toggleActive = function() {
        if(!self.ready()) {
            console.log("can't do anything, sound ain't ready yet - this a problem");
            return;
        }
        if(self.active()) {
            self.stopSound();
        } else {
            // play the sound; play it from where ever it was last stopped
            // when a seek is completed play() will be called
            self.howlerObject.seek(self.seekWhenStopped);
        }
    }

    self.setupHowler = function() {
        var sound = new Howl({
            src: [self.file()],
            loop: true,
            volume: self.volume(),
            onload : function() {
                // the sound is loaded, so we're going to set the ready flag which indicates we can play it when wanted
                self.ready(true);
            },
            onstop : function() {
                //console.log('stopped!');
            },
            onseek: function() {
                // when seek is called the sound is ready to be played
                self.howlerObject.play();
                self.active(true);
            }
        });
        // store the howler object so we can manipulate the sound later
        self.howlerObject = sound;
    }

    self.initialise = function(soundConfig) {
        self.label(soundConfig.label);
        self.file(soundConfig.file);
        self.volume(soundConfig.initialVolume);
        self.initialVolume(soundConfig.initialVolume);
        self.selectedVolume(soundConfig.initialVolume * 100)
        self.category(soundConfig.category ?? "Birds")
        self.attribution(soundConfig.attribution);
        self.setupHowler();
    };
    self.initialise(self.soundConfig);
};

var page = new pageModel(soundsConfiguration, presetsConfiguration);

ko.applyBindings(page);


var soundsConfiguration = [
    {
        "file" : "sounds/Black Cicada - Dave Holland.mp3",
        "label" : "Black Cicada",
        "initialVolume" : 0.5
    },
    {
        "file" : "sounds/Grey Warbler - Dave Holland.mp3",
        "label" : "Grey Warbler",
        "initialVolume" : 0.5
    },
    {
        "file" : "sounds/Pukeko - Dave Holland.mp3",
        "label" : "Pukeko",
        "initialVolume" : 0.5
    },
    {
        "file" : "sounds/Tieke - Dave Holland.mp3",
        "label" : "Tieke",
        "initialVolume" : 0.5
    },
    {
        "file" : "sounds/Blackbird - saracoutinho.wav",
        "label" : "Blackbird",
        "initialVolume" : 0.5
    },
    {
        "file" : "sounds/Blackbirds - kate_mcalpine.m4a",
        "label" : "Blackbirds",
        "initialVolume" : 0.5
    },
    {
        "file" : "sounds/Myna - Soggybottomnz.m4a",
        "label" : "Myna",
        "initialVolume" : 0.5
    },
    {
        "file" : "sounds/Sparrows - duncanmc42.wav",
        "label" : "Sparrows",
        "initialVolume" : 0.5
    },
    {
        "file" : "sounds/Sparrows - saracoutinho.wav",
        "label" : "More Sparrows",
        "initialVolume" : 0.5
    }
    
];

var presetsConfiguration = [
    {
        "title" : "Suburban Backyard",
        "sounds" : [
            { "label" : "Blackbird", "volume" : 0.8 },
            { "label" : "Myna", "volume" : 0.8 },
            { "label" : "Sparrows", "volume" : 0.5 }
        ]
    },
    {
        "title" : "Farm",
        "sounds" : [
            { "label" : "Pukeko", "volume" : 0.8 }
        ]
    },
    {
        "title" : "Bush",
        "sounds" : [
            { "label" : "Tieke", "volume" : 0.8 },
            { "label" : "Grey Warbler", "volume" : 0.3 },
            { "label" : "Black Cicada", "volume" : 0.7 }
        ]
    }
];


var pageModel = function(soundsConfiguration, presetsConfiguration) {
    var self = this;

    self.soundsConfiguration = soundsConfiguration;
    self.presetsConfiguration = presetsConfiguration;
    self.soundControllers = ko.observableArray();

    self.loadSounds = function() {
        self.soundControllers([]);
        for (var soundConfig of self.soundsConfiguration) {
            console.log(soundConfig);
            var soundController = new soundControllerModel(soundConfig);
            self.soundControllers.push(soundController);
        }
    }

    self.resetSounds = function() {
        // destroy all existing sounds
        for (var soundController of self.soundControllers()) {
            soundController.resetSound();
            // if(soundController.howlerObject) {
            //     soundController.howlerObject.unload();
            // }
        }
        // reload all the sounds from the base config
        //self.loadSounds();
    }


    self.loadPreset = function(preset) {
        console.log(preset);
        self.resetSounds();
        for (var presetSound of preset.sounds) {
            console.log("looking for presetSound " + presetSound.label)
            for(var soundController of self.soundControllers()) {
                console.log("checking " + soundController.label())
                if(soundController.label() === presetSound.label) {
                    console.log("found!")
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

    self.soundConfig = soundConfig;
    self.ready = ko.observable(false);
    self.active = ko.observable(false);
    self.seekWhenStopped = 0;

    self.label = ko.observable();
    self.file = ko.observable();
    self.volume = ko.observable();
    self.selectedVolume = ko.observable();
    self.initialVolume = ko.observable();
    self.howlerObject = null;

    self.containerClasses = ko.computed(function() {
        var classes = "sound-container";
        if(self.active()) {
            classes += " sound-active";
        }
        return classes;
    });

    self.resetSound = function() {
        self.stopSound();
        self.selectedVolume(self.initialVolume * 100);
    }

    self.stopSound = function() {
        // we're going to stop the sound, remembering where we stopped it
        self.seekWhenStopped = self.howlerObject.seek();
        console.log(self.seekWhenStopped);
        self.howlerObject.stop();
        self.active(false);
    };

    // subscribe to the user changing the volume so we can update the volume of the sound
    self.selectedVolume.subscribe(function(newValue) {
        self.howlerObject.volume(newValue/ 100);
     });

    self.toggleActive = function() {
        if(!self.ready()) {
            console.log("can't do anything, sound ain't ready yet");
            return;
        }
        console.log("guess we're ready")
        if(self.active()) {
            self.stopSound();
        } else {
            // play the sound, play if from where ever it was last stopped
            // when a seek is completed play() will be called
            self.howlerObject.seek(self.seekWhenStopped);
        }
    }

    self.setupHowler = function() {
        console.log("setting up howler for " + self.label())
        console.log("init vol is " + self.volume())
        var sound = new Howl({
            src: [self.file()],
            loop: true,
            volume: self.volume(),
            onload : function() {
                console.log("onload called")
                self.ready(true);
            },
            onstop : function() {
                console.log('stopped!');
            },
            onseek: function() {
                console.log("onseek called")
                self.howlerObject.play();
                self.active(true);
            }
        });
        self.howlerObject = sound;
    }

    self.initialise = function(soundConfig) {
        self.label(soundConfig.label);
        self.file(soundConfig.file);
        self.volume(soundConfig.initialVolume);
        self.initialVolume(soundConfig.initialVolume);
        self.setupHowler();
    };
    self.initialise(self.soundConfig);
};

var page = new pageModel(soundsConfiguration, presetsConfiguration);

ko.applyBindings(page);

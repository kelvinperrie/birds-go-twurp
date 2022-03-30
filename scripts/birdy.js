
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
    }
    
];


var pageModel = function(soundsConfiguration) {
    var self = this;

    self.soundsConfiguration = soundsConfiguration;
    self.soundControllers = ko.observableArray();

    self.initialise = function(soundsConfiguration) {
        for (var soundConfig of soundsConfiguration) {
            console.log(soundConfig);
            var soundController = new soundControllerModel(soundConfig);
            self.soundControllers.push(soundController);
        }
    };
    self.initialise(self.soundsConfiguration);
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
    self.howlerObject = null;

    self.containerClasses = ko.computed(function() {
        var classes = "sound-container";
        if(self.active()) {
            classes += " sound-active";
        }
        return classes;
    });

    // subscribe to the user changing the volume so we can update the volume of the sound
    self.selectedVolume.subscribe(function(newValue) {
        self.howlerObject.volume(newValue/ 100);
     });

    self.toggleActive = function() {
        if(self.active()) {
            // we're going to stop the sound, remembering where we stopped it
            self.seekWhenStopped = self.howlerObject.seek();
            console.log(self.seekWhenStopped);
            self.howlerObject.stop();
            self.active(false);
        } else {
            // play the sound
            // if the sound isn't setup, then do it now
            if(!self.ready()) {
                // when the sound is loaded it will automatically play
                self.setupHowler();
                self.ready(true);
            } else {
            // start the sound from where ever it was last stopped
            // when a seek is completed it will automatically play
            self.howlerObject.seek(self.seekWhenStopped);
            }
        }
    }

    self.setupHowler = function() {
        console.log("setting up howler for " + self.label())
        console.log("init vol is " + self.volume())
        var sound = new Howl({
            src: [self.file()],
            //autoplay: true,
            loop: true,
            volume: self.volume(),
            onload : function() {
                console.log("onload called")
                self.howlerObject.play();
                self.active(true);
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
        //sound.play();
        self.howlerObject = sound;
    }

    self.initialise = function(soundConfig) {
        self.label(soundConfig.label);
        self.file(soundConfig.file);
        self.volume(soundConfig.initialVolume);
    };
    self.initialise(self.soundConfig);
};

var page = new pageModel(soundsConfiguration);

ko.applyBindings(page);

import {dieHardLog, insertAfter} from '../lib/helpers.js';
import DieHardFudgeDialog from './DieHardFudgeDialog.js';
import DieHardKarmaDialog from './DieHardKarmaDialog.js';
import DieHardDnd5e from './DieHardDnd5e.js';
import DieHardPf2e from './DieHardPf2e.js';

export const DieHardSetting = (setting) => game.settings.get('foundry-die-hard', setting);

export default class DieHard {

  constructor() {
    dieHardLog(true, 'DieHard - constructor');
  }

  static renderDieHardIcons() {
    dieHardLog(false, 'DieHard.renderDieHardIcons')
    if (DieHardSetting('dieHardSettings').system == null) {
      dieHardLog(false, 'Unsupported system for world; not rendering side bar')
      return
    }
    dieHardLog(false, 'Render side bar')

    if (document.querySelector('.die-hard-pause-fudge-icon') === null) {
      let fudgeButton = document.createElement('label');
      fudgeButton.classList.add('die-hard-fudge-icon');
      fudgeButton.innerHTML = '<span title="Fudge Paused"><i id="die-hard-pause-fudge-icon" class="fas fa-pause-circle die-hard-icon-hidden"></i></span><span title="Fudge"><i id="die-hard-fudge-icon" class="fas fa-poop"></i></span>';
      fudgeButton.addEventListener('click', async (ev) => {
                    new DieHardFudgeDialog().render(true);
                });
      fudgeButton.addEventListener('contextmenu', async (ev) => {
                    game.settings.get('foundry-die-hard', 'dieHardSettings').system.disableAllFudges();
                });

      // ToDo: Fix this ugly hack
      // the document object isn't existing sometimes yet, so just ignore.  It'll eventually render
      try {
        //insertAfter(pauseButton, document.querySelector('.chat-control-icon'));
        insertAfter(fudgeButton, document.querySelector('.chat-control-icon'));
        //DieHardSetting('dieHardSettings').system.refreshActiveFudgesIcon()
      }
      catch (e) {  }
    }

    if (document.querySelector('.die-hard-karma-icon') === null) {
      let karmaButton = document.createElement('label');
      karmaButton.classList.add('die-hard-karma-icon');
      karmaButton.innerHTML = '<span title="Karma"><i id="die-hard-karma-icon" class="fas fa-praying-hands"></i></span>';
      karmaButton.addEventListener('click', async (ev) => {
        new DieHardKarmaDialog().render(true);
      });

      // ToDo: Fix this ugly hack
      // the document object isn't existing sometimes yet, so just ignore.  It'll eventually render
      try {
        insertAfter(karmaButton, document.querySelector('.chat-control-icon'));
      } catch (e) {
      }
    }
    DieHard.refreshDieHardIcons();
  }

  static getDefaultDieHardSettings() {
    dieHardLog(false, 'DieHard.getDefaultDieHardSettings')
    let dieHardSettings = {
      system: null,
      debug: {
        allActors: true
      },
      fudgeConfig: {
        maxFudgeAttemptsPerRoll: 150,
        globalDisable: false
      },
      gmFudges: []
    };

    if (game.system.id == 'dnd5e') {
      dieHardLog(true, 'Configuring for dndn5e system')
      dieHardSettings.system = new DieHardDnd5e;
    } else if (game.system.id == 'pf2e') {
      dieHardLog(true, 'Configuring for pf2e system')
      dieHardSettings.system = new DieHardPf2e;
    } else {
      dieHardLog(true, 'Unsupport game system: ' + game.system.id)
    }
    return dieHardSettings
  }

  static getDefaultSimpleKarmaSettings() {
    return {
      enabled: true,
      history: 5,
      threshold: 5,
      floor: 5
    }
  }

  static getAvgSimpleKarmaSettings() {
    return {
    enabled: true,
      history: 5,
      threshold: 5,
      nudge: 5
    }
  }

  static registerSettings() {
    dieHardLog(false, 'DieHard.registerSettings')

    // Enables fudge
		game.settings.register('foundry-die-hard', 'fudgeEnabled', {
			name: 'Fudge Enabled',
			hint: 'Fudge Enabled',
			scope: 'world',
			config: true,
			default: true,
			type: Boolean,
      onChange: DieHard.refreshDieHardStatus
		});

    // Enables karma
		game.settings.register('foundry-die-hard', 'karmaEnabled', {
			name: 'Karma Enabled',
			hint: 'Karma Enabled',
			scope: 'world',
			config: true,
			default: true,
			type: Boolean,
      onChange: DieHard.refreshDieHardStatus
		});

    // Enables debug die
		game.settings.register('foundry-die-hard', 'debugDieResultEnabled', {
			name: 'Debug Die Result Enabled',
			hint: 'Enable the use of Debug Die Result',
			scope: 'world',
			config: true,
			default: true,
			type: Boolean
		});
		game.settings.register('foundry-die-hard', 'debugDieResult', {
			name: 'Debug Die Result',
			hint: 'Make every initial roll of die value',
			scope: 'world',
			config: true,
			default: 5,
			type: Number,
      range: {
        min: 1,
        max: 20,
        step: 1
      }
		});

    game.settings.register('foundry-die-hard', 'dieHardSettings', {
      name: '',
      default: DieHard.getDefaultDieHardSettings(),
      type: Object,
      scope: 'world',
      config: false,
    });

    // Enables fudge
		game.settings.register('foundry-die-hard', 'simpleKarmaSettings', {
			name: 'Simple Karma Settings',
			hint: 'Simple Karma Settings',
			scope: 'world',
			config: false,
			default: DieHard.getDefaultSimpleKarmaSettings(),
			type: Object
		});

    // Enables karma
		game.settings.register('foundry-die-hard', 'avgKarmaSettings', {
			name: 'Average Karma Settings',
			hint: 'Average Karma Settings',
			scope: 'world',
			config: false,
			default: DieHard.getAvgSimpleKarmaSettings(),
			type: Object
		});


  }

  static async refreshDieHardStatus() {
    dieHardLog(false, 'DieHard.refreshDieHardStatus');
    await DieHard.refreshDieHardIcons()
    DieHardSetting('dieHardSettings').system.refreshActiveFudgesIcon()
  }

  static async refreshDieHardIcons() {
    dieHardLog(false, 'DieHard.refreshDieHardIcons');
    // Ugly fix for objects not existing yet
    // ToDo: clean this up
    try{
      if (DieHardSetting('fudgeEnabled')) {
        if (DieHardSetting('dieHardSettings').fudgeConfig.globalDisable) {
          document.getElementById('die-hard-pause-fudge-icon').classList.remove('die-hard-icon-hidden');
          document.getElementById('die-hard-fudge-icon').classList.add('die-hard-icon-hidden');
          return;
        } else {
          document.getElementById('die-hard-pause-fudge-icon').classList.add('die-hard-icon-hidden');
          document.getElementById('die-hard-fudge-icon').classList.remove('die-hard-icon-hidden');
        }
        if (DieHardSetting('dieHardSettings').system.hasActiveFudges()) {
          document.getElementById('die-hard-fudge-icon').classList.add('die-hard-fudge-icon-active');
        } else {
          document.getElementById('die-hard-fudge-icon').classList.remove('die-hard-fudge-icon-active');
        }
      } else {
        document.getElementById('die-hard-pause-fudge-icon').classList.add('die-hard-icon-hidden');
        document.getElementById('die-hard-fudge-icon').classList.add('die-hard-icon-hidden');
      }

      if (DieHardSetting('karmaEnabled')) {
        document.getElementById('die-hard-karma-icon').classList.remove('die-hard-icon-hidden');
      } else {
        document.getElementById('die-hard-karma-icon').classList.add('die-hard-icon-hidden');
      }
    }
    catch (e) {  }
  }

  static async dmToGm(message) {
    var dm_ids = [];
    for (let user of game.users.values()) {
      if (user.isGM) {
        dm_ids.push(user.id)
      }
    }
    ChatMessage.create({
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
      whisper: dm_ids,
      blind: true,
      content: message
    })
  }
}
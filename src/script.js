String.prototype.paddingLeft = function (paddingValue) {
  return String(paddingValue + this).slice(-paddingValue.length);
};

const electron = require('electron'),
  app = electron.app,
  menu = electron.Menu,
  tray = electron.Tray,
  browserWindow = require('electron').BrowserWindow,
  path = require('path'),
  timer = require('./libs/timer.js');

var menuTray = null,
  window = null,
  menuItems = {
    'start': {
      label: 'Start',
      click: timer.start
    },
    'stop': {
      label: 'Stop',
      click: timer.stop
    }
  };

app.dock.hide();

app.on('ready', function(){
  window = new browserWindow({ width: 1, height: 1, show: false, skipTaskbar: true });
  window.loadURL('file://' + __dirname + '/index.html');
  window.webContents.on('did-finish-load', init);
});

function init() {
  menuTray = new tray(path.join(__dirname, 'assets/img/pomodoro-w.png'));
  menuTray.setTitle('');
  menuTray.setContextMenu(menu.buildFromTemplate([menuItems.start]));

  timer.on('start', function() {
    window.webContents.send('play-sound', path.join(__dirname, 'assets/sound/windup.mp3'));
    menuTray.setContextMenu(menu.buildFromTemplate([menuItems.stop]));
  });

  timer.on('stop', function(interrupted) {
    menuTray.setTitle('');

    if (!interrupted) {
      window.webContents.send('notification', {
        title: 'Time\'s up!',
        body: 'Time for a short break',
        sound: path.join(__dirname, 'assets/sound/bell.mp3') });
    }

    menuTray.setContextMenu(menu.buildFromTemplate([menuItems.start]));
  });

  timer.on('update', function(data) {
    menuTray.setTitle(
      ' ' + data.minutes.toString().paddingLeft('00') +
      ':' + data.seconds.toString().paddingLeft('00')
    );
  });
}

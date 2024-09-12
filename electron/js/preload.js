const { ipcRenderer, contextBridge, webUtils } = require('electron');
const { app, getCurrentWindow, getGlobal, dialog, BrowserWindow } = require('@electron/remote');
const fs = require('fs');
const os = require('os');
const path = require('path');
const mime = require('mime-types');
const tmpPath = () => app.getPath('temp');

contextBridge.exposeInMainWorld('Electron', {
	version: {
		app: app.getVersion(),
		os: [ os.platform(), process.arch, process.getSystemVersion() ].join(' '),
		system: process.getSystemVersion(),
		device: os.hostname(),
	},
	platform: os.platform(),
	arch: process.arch,

	isPackaged: app.isPackaged,
	userPath: () => app.getPath('userData'),
	tmpPath,
	logPath: () => path.join(app.getPath('userData'), 'logs'),
	filePath: (...args) => path.join(...args),
	dirname: fp => path.dirname(fp),
	defaultPath: () => path.join(app.getPath('appData'), app.getName()),

	currentWindow: () => getCurrentWindow(),
	isMaximized: () => BrowserWindow.getFocusedWindow()?.isMaximized(),
	isFocused: () => getCurrentWindow().isFocused(),
	focus: () => {
		getCurrentWindow().focus();
		app.focus({ steal: true });
	},
	getGlobal: key => getGlobal(key),
	getMime: path => mime.lookup(path),
	showOpenDialog: dialog.showOpenDialog,

	webFilePath: file => webUtils.getPathForFile(file),

	fileWrite: (name, data, options) => {
		name = String(name || 'temp');
		options = options || {};

		const fn = path.parse(name).base;
		const fp = path.join(tmpPath(), fn);

		options.mode = 0o666;

		fs.writeFileSync(fp, data, options);
		return fp;
	},

	on: (event, callBack) => ipcRenderer.on(event, callBack),
	removeAllListeners: (event) => ipcRenderer.removeAllListeners(event),

	Api: (id, cmd, args) => {
		id = Number(id) || 0;
		cmd = String(cmd || '');
		args = args || [];

		let ret = new Promise(() => {});

		try { 
			ret = ipcRenderer.invoke('Api', id, cmd, args).catch((error) => {
				console.log(error);
			}); 
		} catch (e) {};

		return ret;
	},
});

const muuri = require('muuri');
const fs = require('fs');
const ipcRenderer = require('electron').ipcRenderer;
let apps = [];
const jquery = require('jquery');
const exec = require('child_process').exec;
const modal = document.getElementById("MyModal");
const modalI = document.getElementById("modalinput");
const modalI2 = document.getElementById("modalinput2");
const modalI3 = document.getElementById("modalinput3");
const modalB = document.getElementById("modalbutton");
const dialog = require('electron').remote.dialog;
const p = document.getElementById('update');
let selectedicon = '';
let selectedexec = '';
const os = require('os');
const user_file = os.homedir().replace(/\\/g, '/') + '/appsList.json';



// Поиск среди приложений в GRID
const searchField = document.getElementById('search_input');
let searchFieldValue = searchField.value.toLowerCase();
searchField.addEventListener('keyup', function() {
    const newSearch = searchField.value.toLowerCase();
    if (searchFieldValue !== newSearch) {
        searchFieldValue = newSearch;
        filter();
    }
});
//Функия фильтрации
function filter() {
    grid.filter(function(item) {
        var element = item.getElement(),
            isSearchMatch = !searchFieldValue ? true : (element.getAttribute('data-title') || '').toLowerCase().indexOf(searchFieldValue) > -1
        return isSearchMatch;
    });
}
// Создания GRID элемента
const grid = new muuri(".grid", {
    dragEnabled: true,
    layoutOnInit: false,
    sortData: {
        id: function(item, element) {
            return parseFloat(element.getAttribute('data-id'));
        }
    }
});
grid.on('move', function() {
	const orders = grid.getItems().map(item => item.getElement().getAttribute('app-id'));
    for (i = 0; i < apps.length; i++) {
        apps[i].dataids = String(orders.indexOf(apps[i].appId));
    }
    saveJSON();
});
function saveJSON() {
    let firstData = JSON.parse(fs.readFileSync(user_file, 'utf8'));
    firstData['elements'] = apps;
    fs.writeFileSync(user_file, JSON.stringify(firstData));
}
//ЗАПУСК ПРИЛОЖЕНИЯ
(() => {
    try {
        (fs.existsSync(user_file)) ? console.log(user_file) : fs.writeFileSync(user_file, JSON.stringify({
            elements: []
        }));
        loadUserFile();
    } catch (err) {
        console.log('Ошибка при проверки присутствия файла.');
    }
})();
function loadUserFile() {
    let UserFile = JSON.parse(fs.readFileSync(user_file, 'utf8'));
    apps = UserFile["elements"];

    for (i = 0; i < apps.length; i++) {

		const name = document.createElement('p');
		name.innerText = apps[i].name;

		const AppContent = document.createElement('div');
		AppContent.classList.add('item-content');
        AppContent.style.backgroundImage = 'url(' + apps[i].iconpath + ')';
		AppContent.appendChild(name);

		const newApp = document.createElement('div');
        newApp.classList.add('item');
        newApp.setAttribute('data-id', apps[i].dataids);
        newApp.setAttribute('data-title', apps[i].name);
        newApp.setAttribute('app-id', apps[i].appId);
        newApp.setAttribute('onclick', 'initialize(this)');
		newApp.appendChild(AppContent);
		

        grid.add(newApp);
    }
    grid.sort('id', {layout: 'instant'});
}
function getIndex(AppId) {
    index = 0;
    for (i = 0; i < apps.length; i++) {
        if (apps[i].appId == AppId) {
            index = i;
        }
    }
    return index;
}
function initialize(obj) {
    var left = 0,
        top = 0,
        radiusLimit = 5;
    jquery(function($) {
        $(obj).on({
            mousedown: function(event) {
                left = event.pageX;
                top = event.pageY;
            },
            mouseup: function(event) {
                var deltaX = event.pageX - left;
                var deltaY = event.pageY - top;
                var euclidean = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                if (euclidean < radiusLimit) {
					let string = apps[getIndex(obj.getAttribute('app-id'))].execpath;
					exec('start "" "' + string + '"');
                    $(obj).unbind();
                } else {
                    $(obj).unbind();
                }
            }
        });
    });
}
function addApp(appName, appPath, appIconPath) {

	
	const name = document.createElement('p');
	name.innerText = appName;

	const AppContent = document.createElement('div');
	AppContent.classList.add('item-content');
	AppContent.style.backgroundImage = 'url(' + appIconPath + ')';
	AppContent.appendChild(name);
	
	const newApp = document.createElement('div');
    newApp.classList.add('item');
    newApp.setAttribute('data-id', String(apps.length));
    newApp.setAttribute('app-id', String(apps.length));
	newApp.appendChild(AppContent);
	
    grid.add(newApp);
    grid.sort('id', {layout: 'instant'});
    apps[apps.length] = {
        name: appName,
        iconpath: appIconPath,
        dataids: String(apps.length),
        appId: String(apps.length),
        execpath: appPath
    }
    saveJSON();
}
function displayModal() {
    modal.style.display = "block";
}
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
function selectIcon() {
    dialog.showOpenDialog({
        filters: [{
            name: 'Иконка',
            extensions: ['png', 'jpg', 'svg', 'gif', 'webp']
        }],
        properties: ['openFile']
    }).then((data) => {
        if (data.filePaths.length > 0) {
            let icon_path = [data.filePaths[0].replace(/\\/g, '/')]
            selectedicon = icon_path[0];
            modalI2.value = selectedicon;
        }
    });
}
function selectExec() {
    dialog.showOpenDialog({}).then((data) => {
        if (data.filePaths.length > 0) {
            let exec_path = [data.filePaths[0].replace(/\\/g, '/')];
            selectedexec = exec_path[0];
            modalI3.value = selectedexec;
        }
    });
}
function constructApp() {
    if (selectedexec.length > 0 && selectedicon.length > 0 && modalI.value.length > 0) {
                addApp(modalI.value, selectedexec, selectedicon);
                selectedicon = '';
                selectedexec = '';
				modalI.value = '';
				modalI2.value = '';
				modalI3.value = '';
            }
    modal.style.display = 'none';
}
    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
    ipcRenderer.removeAllListeners('app_version');
    p.innerText = 'У вас последняя версия приложения Falcon. ' + arg.version;
    });
    ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    message.innerText = 'Доступно новое обнолвение.';
  });
    ipcRenderer.on('update_not_available', () => {
    ipcRenderer.removeAllListeners('update_not_available');
    message.innerText = 'Новых обновлений нет.';
  });  
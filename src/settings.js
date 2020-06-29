const jquery = require('jquery');
const fs = require('fs');
const { log } = require('console');
const applications = document.getElementById('applications');
const dialog = require('electron').remote.dialog;
const modal = document.getElementById("MyModal");
const modalI = document.getElementById("modalinput");
const modalB = document.getElementById("modalbutton");

const os = require('os');
const user_file = os.homedir().replace(/\\/g, '/') + '/appsList.json';

let bg = true;
let selectedName = 0;


function load(){
    let fileContents = JSON.parse(fs.readFileSync(user_file, 'utf8'));
    let list = fileContents['elements'];
    applications.innerHTML = '';
    for(i = 0; i < list.length; i++){
        let newApplication = document.createElement('div');
        let newApp_icon = document.createElement('div');
        let newApp_p = document.createElement('p');
        let newApp_remove = document.createElement('div');
        let newApp_changeicon = document.createElement('div');
        let newApp_chandeexec = document.createElement('div');
        let newApp_changename = document.createElement('div');

        newApp_changename.classList.add('list_app_name');
        newApp_changename.setAttribute('id', list[i].appId);
        newApp_changename.setAttribute('onclick', 'changeName(this.id)');

        newApp_chandeexec.classList.add('list_app_exe');
        newApp_chandeexec.setAttribute('id', list[i].appId);
        newApp_chandeexec.setAttribute('onclick', 'changeDir(this.id)');

        newApp_changeicon.classList.add('list_app_editicon');
        newApp_changeicon.setAttribute('id', list[i].appId);
        newApp_changeicon.setAttribute('onclick', 'changeIcon(this.id)');

        newApp_remove.classList.add('list_app_exit');
        newApp_remove.setAttribute('id', list[i].appId);
        newApp_remove.setAttribute('onclick', 'remove(this.id);');

        newApp_p.classList.add('list_app_p');
        newApp_p.innerText = list[i].name;

        newApp_icon.classList.add('list_app_img');
        newApp_icon.style.backgroundImage = 'url(' + list[i].iconpath + ')';

        newApplication.classList.add('list_app');
        newApplication.setAttribute('id', list[i].appId);
        if(bg == true){
            bg = false;
            newApplication.style.backgroundColor = '#dcdde3';
        }else if(bg == false){
            bg = true;
            newApplication.style.backgroundColor = '#ededed';
        }
        applications.appendChild(newApplication);
        newApplication.appendChild(newApp_icon);
        newApplication.appendChild(newApp_p);
        newApplication.appendChild(newApp_remove);
        newApplication.appendChild(newApp_changeicon);
        newApplication.appendChild(newApp_chandeexec);
        newApplication.appendChild(newApp_changename);
    }
}
load();

function getByApplicationId(arr, str){
    index = 0; 
    for(i = 0; i < arr.length; i++){
        if(arr[i].appId == str){
            index = i;
        }
    }
    return index;
}

function remove(id){
    let fileContents = JSON.parse(fs.readFileSync(user_file, 'utf8'));
    let list = fileContents['elements'];
    list.splice(getByApplicationId(list, String(id)), 1);
    fileContents['elements'] = list;
    
    let content = JSON.stringify(fileContents);
	fs.writeFileSync(user_file, content);

    const removedApp = document.getElementById(id);
    applications.removeChild(removedApp);
}


function changeIcon(id){
    dialog.showOpenDialog({
        filters: [
            { name: 'Выберите изображение', extensions: ['png', 'jpg'] }
          ],
        properties: ['openFile']
     }).then((data) => {
         if(data.filePaths.length > 0){
            let fileContents = JSON.parse(fs.readFileSync(user_file, 'utf8'));
            let list = fileContents['elements'];
            let s = [data.filePaths[0].replace(/\\/g, '/')]         
            list[getByApplicationId(list, String(id))].iconpath = s;
            fileContents['elements'] = list;
            let content = JSON.stringify(fileContents);
            fs.writeFileSync(user_file, content);
            load();
         }
    });
}

function changeDir(id){
    dialog.showOpenDialog({}).then((data) => {
         if(data.filePaths.length > 0){
            let fileContents = JSON.parse(fs.readFileSync(user_file, 'utf8'));
            let list = fileContents['elements'];
            let s = [data.filePaths[0].replace(/\\/g, '/')]         
            list[getByApplicationId(list, String(id))].execpath = s;
            fileContents['elements'] = list;
            let content = JSON.stringify(fileContents);
            fs.writeFileSync(user_file, content);
            load();
         }
    });
}

function changeName(id){
    selectedName = id;
    modal.style.display = "block";
}

function saveJSON(){
    
}

function clickS(){
    if(modalI.value.length > 0){
        let fileContents = JSON.parse(fs.readFileSync(user_file, 'utf8'));
        let list = fileContents['elements']; 
        list[getByApplicationId(list, String(selectedName))].name = modalI.value;
        fileContents['elements'] = list;
        let content = JSON.stringify(fileContents);
        fs.writeFileSync(user_file, content);
        load();
    }
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
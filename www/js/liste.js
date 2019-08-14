var socket ; //pensez à déclarer la socket en globale en haut du fichier.
document.addEventListener('deviceready', function(evt) {
    socket = io('http://192.168.100.109:3000'); // connexion au serveur
    socket.on('connect', function() {
// on met le client en écoute
        socket.on('text', function(text) {
            alert(text); // Affichage de la réponse du serveur
        });
    });
}, false);

function initialize() {
    document.addEventListener('deviceready', onDeviceReady.bind(this), false);
}

function onDeviceReady() {
    receivedEvent('deviceready');
}

function receivedEvent(id) {
    var contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    var socket = io('http://192.168.100.109:3000');
    socket.emit('GET', 'Contacts');

    socket.on('RESULT', function(data) {
        contacts = JSON.parse(data);
        var tab_config = {
            data: contacts, // on peut aussi passer le tableau contacts pour intiailiser les datas.
            id: "liste",
            title: "Liste des Contacts enregistrés",
            footer: "NB : Utilisez la sélection pour soit supprimer soit modifier le contact",
            isDelete: true,
            isModify: true,
            sortOrder: 'asc' // posibilité de mettre 'asc' pour ascendant : croissant et 'desc' pour descendant : décroissant
        };
        var tabContacts = new tabDyn(tab_config, function(tabdyn) {
            tabdyn.show();
        });
    });

}

/** Objet tabDyn décrit un tableau dynamique construit à partir d'un tableau dans le localStorage */
var tabDyn = function(config, callback) {
    // constructeur
    var self = this;
    var myModalInstance = null;
    this.config = config;
    /** fonction qui créer les colonnes et leur donne un */
    /** nom via les attributs des champs du formulaire  */
    this.createHeader = function() {
        var thead = this.htmlTab.createTHead();
        var tr = thead.insertRow(0);
        tr.setAttribute("class", "table-inverte")
        for (var i = 0; i < this.columnsNames.length; i++) {
            var cellule = tr.insertCell(i);
            cellule.innerHTML = (this.columnsNames[i]).toUpperCase() + '&nbsp;<a href="#"><span id="sort_' + i + '" class="glyphicon glyphicon-sort-by-attributes"></span></a>';
            var sort = document.getElementById('sort_' + i);
            sort.addEventListener('click', this.sortColumn);
        }
        var cellule = tr.insertCell(this.columnsNames.length);
        cellule.innerHTML = "SELECTION";
    }

    /** fonction qui crée les lignes (tr) et cellules (td) et affiche la valeur */
    this.createRows = function() {
        for (var l = 0; l < this.config.data.length; l++) {
            var tr = this.htmlTab.insertRow(-1);
            tr.setAttribute('id', l);
            for (c = 0; c < this.columnsNames.length; c++) {
                var cellule = tr.insertCell(c);
                cellule.innerHTML = (this.config.data[l])[this.columnsNames[c]];
            }
            var cellule = tr.insertCell(this.columnsNames.length);
            cellule.innerHTML = '<input type="radio" name="selection" id="ligne_' + l + '" value="' + l + '">';
        }
    }

    /** fonction qui ajoute le footer en bas du tableau sur une ligne */
    this.createFooter = function() {
        var tfooter = this.htmlTab.createTFoot();
        var tr = tfooter.insertRow(0);
        var td = tr.insertCell(0);
        td.colSpan = "" + this.columnsNames.length - 1
        td.innerHTML = this.config.footer;
        td = tr.insertCell(1);
        if (this.config.isDelete) {
            td.innerHTML = '<button name="button" id="btn_delete" class="btn btn-warning btn-lg">Supprimer</button>';
            document.getElementById('btn_delete').addEventListener('click', this.delete);
        }
        td = tr.insertCell(2);
        if (this.config.isModify) {
            td.innerHTML = '<button name="button" id="btn_modify" class="btn btn-info btn-lg" data-toggle="modal" data-target="#myModal">Modifier</button>';
            document.getElementById('btn_modify').addEventListener('click', this.modify);
        }
    }

    /** fonction qui générère le tableau et insère dans le DOM */
    this.show = function() {
        this.createHeader();
        this.createRows();
        this.createFooter();
    }

    /** fonction qui détecte les clicks sur le tableau HTML et propose une interface d'actions */
    this.delete = function(evt) {
        console.log('delete contact', evt);
        for (var i = 0; i < self.config.data.length; i++) {
            var elem = document.getElementById('ligne_' + i);
            if (elem.checked) {
                self.config.data.splice(parseInt(elem.value), 1);
                localStorage.setItem('contacts', JSON.stringify(self.config.data));
                window.location = 'liste.html'; // réfléchir pour remplacer le reload par un refresh du DOM.
            }
        }
        //this.config.data.splice(index, 1);
    }

    /** fonction qui permet de trier les colonne du tableau actuellement de façon ascendante (croissante) */
    this.sortColumn = function(evt) {
        var indexColumn = parseInt(evt.target.id.split('_')[1]); // structure id : sort_<N°Colonne>, donc un split sur '_' d'index [1] retourne N°
        var fieldToCompare = self.columnsNames[indexColumn];
        self.config.data.sort(function(a, b) { // fonction comparateur nécessaire à la fonciton sort d'Array pour savoir l'ordre.
            var valueA = a[fieldToCompare].toLowerCase();
            var valueB = b[fieldToCompare].toLowerCase();
            if (self.config.sortOrder === 'asc') {
                if (valueA < valueB) return -1
                if (valueA > valueB) return 1
                return 0
            } else {
                if (valueA < valueB) return 1
                if (valueA > valueB) return -1
                return 0
            }
        });
        localStorage.setItem('contacts', JSON.stringify(self.config.data));
        window.location = 'liste.html'; // réfléchir pour remplacer le reload par un refresh du DOM sans JQuery.
    }

    /** */
    this.writeModifiedContact = function(evt) {
        console.log('ici on enregistre le contact du formulaire de modification');
        var indexToModify = parseInt(document.getElementById('modifyIndex').value);
        var formModify = document.getElementById('modifyForm');
        var formData = new FormData(formModify);
        var contact = {};
        for (var i = 0; i < formModify.length; i++) {
            console.log('formModify[' + i + '].name : ' + formModify[i].name);
            console.log('value : ' + formData.get(formModify[i].name));
            if (formModify[i].name.length > 0) contact[formModify[i].name] = formData.get(formModify[i].name);
            else continue;
        }
        delete contact.button; // le bouton submit est envoyé dans un POST?
        console.log('contact : ', contact);
        var contacts = JSON.parse(localStorage.getItem('contacts')) || [];
        contacts[indexToModify] = contact;
        localStorage.setItem('contacts', JSON.stringify(contacts));
        evt.preventDefault();
        myModalInstance.hide();
        window.location = 'liste.html';
    }

    /** fonction qui en fonction de la ligne sélectionnée, va construire dynamiquement le formulaire de modification */
    this.modify = function(evt) {
        var btn_valid_modify = document.getElementById('btn_valid_modify');
        btn_valid_modify.addEventListener('click', self.writeModifiedContact);
        console.log('modify', evt);
        var modal = document.getElementById('myModal');
        var container = document.getElementById('popup');
        for (var i = 0; i < self.config.data.length; i++) {
            var elem = document.getElementById('ligne_' + i);
            if (elem.checked) {
                var contact = self.config.data[i];
                console.log(contact);
                container.innerHTML = "";
                var inputIndex = document.createElement('input');
                inputIndex.setAttribute('type', 'hidden');
                inputIndex.setAttribute('value', i);
                inputIndex.setAttribute('id', 'modifyIndex');
                container.appendChild(inputIndex);
                for (field in contact) {
                    var divformgroup = document.createElement('div');
                    divformgroup.setAttribute('class', 'form-group row');
                    console.log(field + ': ' + contact[field]);
                    var label = document.createElement('label');
                    label.innerHTML = "" + field + " : ";
                    label.setAttribute('for', field);
                    label.setAttribute('class', 'col-2');
                    var divinput = document.createElement('div');
                    divinput.setAttribute('class', 'col-8');
                    var elem = document.createElement('input');
                    elem.setAttribute('type', 'text');
                    elem.setAttribute('name', field);
                    elem.setAttribute('value', contact[field]);
                    elem.setAttribute('id', field);
                    elem.setAttribute('class', 'form-control');
                    divinput.appendChild(elem);
                    divformgroup.appendChild(label);
                    divformgroup.appendChild(divinput);
                    container.appendChild(divformgroup);
                }
            }
        }
        // initialisation de la Modal via bootstrap Native (sans JQuery).
        var options = { // options object
            content: container.innetHTML,
            backdrop: 'static', // we don't want to dismiss Modal when Modal or backdrop is the click event target
            keyboard: false // we don't want to dismiss Modal on pressing Esc key
        }
        myModalInstance = new Modal(modal, options);
        myModalInstance.show();
    }

    // initialization des données via une URL ver sun json (statique ou dynamique).
    if ((this.config.data.indexOf('/') == 0) && (localStorage.getItem('contacts') == null)) {
        const req = new XMLHttpRequest();
        req.onreadystatechange = function(event) {
            // XMLHttpRequest.DONE === 4
            if (this.readyState === XMLHttpRequest.DONE) {
                if (this.status === 200) {
                    console.log("Réponse reçu: %s", this.responseText);
                    self.config.data = JSON.parse(this.responseText);
                    localStorage.setItem('contacts', JSON.stringify(self.config.data));
                    self.columnsNames = Object.getOwnPropertyNames(self.config.data[0]);
                    callback(self);
                } else {
                    console.log("Status de la réponse: %d (%s)", this.status, this.statusText);
                }
            }
        };
        req.open('GET', this.config.data, true);
        req.send(null);
    } else {
        if (localStorage.getItem('contacts') != null) self.config.data = JSON.parse(localStorage.getItem('contacts'));
        self.columnsNames = Object.getOwnPropertyNames(self.config.data[0]);

    }
    this.htmlTab = document.getElementById(this.config.id);
    this.htmlTab.createCaption().innerHTML = '<h1>' + this.config.title + '</h1>';
    callback(self);

};

/** au chargement de la page contacts.html appel de la fonction initialize() **/
window.onload = initialize();
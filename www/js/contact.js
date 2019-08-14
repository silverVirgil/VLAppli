function initialize() {
    var btn_contact = document.getElementById('btn_contact');
    btn_contact.addEventListener('click', writeContact);
}
function writeContact(evt) {
    // todo : il faut parser le formulaire pour en faire du json.
    var form = document.getElementById('contactform');
    var formData = new FormData(form);
    var contact = {}; // initialisation de la variable contact qui contient l’objet a insérer
    for (var i = 0; i < form.length; i++) {
        console.log('form[' + i + '].name : ' + form[i].name);
        console.log('value : ' + formData.get(form[i].name));
        contact[form[i].name] = formData.get(form[i].name);
    }
    delete contact.button; // le bouton submit est envoyé dans un POST?
    console.log('contact : ', contact);
    var contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    contacts.push(contact);
    localStorage.setItem('contacts', JSON.stringify(contacts));
    evt.preventDefault(); // uniquemement si le bouton est de type Submit.
    form.reset();
}
/** au chargement de la page contacts.html appel de la fonction initialize() **/
window.onload = initialize();
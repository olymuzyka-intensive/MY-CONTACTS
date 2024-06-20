
class ContactsApp extends Contacts {
    constructor(User) { //data
        super([arguments]);      
        
        this.data = [];
   
        this.setCookie = (cname, cvalue, exdays) => {
            const d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            let expires = "expires="+d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
            console.log(expires);

        }

        this.getCookie = () => {
            let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
            return matches ? decodeURIComponent(matches[1]) : undefined;            
        }      
        
        this.getStorage = () => {
            let storageData = localStorage.getItem('data'); 
    
            if (!storageData) return false;
    
            storageData = JSON.parse(storageData);
    
            storageData.forEach((item) => {
                this.add(item);
            });
    
            if (this.data.length > 0) return this.data; 
    
            return false;
        };
    
        this.updateStorage = () => {
            let storageData = this.get(1);
    
            storageData = JSON.stringify(storageData);

            if (typeof storageData == 'string') localStorage.setItem('data', storageData);   
            // document.cookie = 'storage=update; max-age=864000'; //это проверка 10 day        
            this.setCookie('storage','update','10');
        };

        this.getData = async () => {
            if (this.data && this.data.length > 0) return;
            let serverData = await fetch('')
            // let serverData = await fetch('https://jsonplaceholder.typicode.com/users')
            .then((responce) => responce.json());

            let dataTmp = serverData.map((item) => {
                return {
                    name: item.name,
                    email: item.email,
                    address: item.address,
                    phone: item.phone
                };
            });

            dataTmp.forEach((item) => {
                this.add(item);
            });
            return true;
        }

        if (!this.data || this.data.length == 0) this.data = this.getStorage() || [];

        this.clearStorageData = () => {
            const timing = 10;
            let currentDate = new Date().getTime();
            const setTime = localStorage.getItem('setTime');

            if (setTime == null) {
                localStorage.setItem('setTime', currentDate);
            } else {
                if (currentDate - setTime > timing * 60 * 60 * 1000) {
                    localStorage.clear();
                    localStorage.setItem('setTime', currentDate);
                }                
            }
        }

        this.windowEdit = function(id, data = {}){
            const editContact = document.createElement('div');
            const fieldNameElem = document.createElement('input');
            const fieldEmailElem = document.createElement('input');
            const fieldAddressElem = document.createElement('input');
            const fieldPhoneElem = document.createElement('input');
            let btnSaveElem = document.createElement('button');
            let btnCloseElem = document.createElement('button');
        
            editContact.classList.add('users__edit');
        
            fieldNameElem.value = data.name;
            fieldEmailElem.value = data.email;
            fieldAddressElem.value = data.address;
            fieldPhoneElem.value = data.phone;
        
            btnSaveElem.innerHTML = 'Save';
            btnCloseElem.innerHTML = 'X';
        
            editContact.append(fieldNameElem, fieldEmailElem, fieldAddressElem, fieldPhoneElem, btnSaveElem, btnCloseElem);
            this.usersElem.append(editContact);
            
            btnSaveElem.addEventListener('click', () => {
            const newData = {
                name: fieldNameElem.value,
                email: fieldEmailElem.value,
                address: fieldAddressElem.value,
                phone: fieldPhoneElem.value
            };

            const testEmail = /\S+@\S+\.\S+/.test(fieldEmailElem.value);
            const testPhone = /^\+?(375)\s?\-?\(?(29|25|44|33|17)\)?\s?-?[0-9]\s?-?[0-9]\s?-?[0-9]\s?-?[0-9]\s?-?[0-9]\s?-?[0-9]\s?-?[0-9]$/g.test(fieldPhoneElem.value);
            
            if (!testEmail){
                fieldEmailElem.style.borderColor = 'red';
                return;
            } else fieldEmailElem.style.borderColor = 'green';
            if (!testPhone){
                fieldPhoneElem.style.borderColor = 'red';
                return;
            } else fieldPhoneElem.style.borderColor = 'green';

            if (!fieldNameElem.value || !fieldEmailElem.value || !fieldAddressElem.value || !fieldPhoneElem.value) {
                return;
            }; 
           
            this.onSave(id, newData);
                editContact.remove();
            });
        
            btnCloseElem.addEventListener('click', function() {
                editContact.remove();
            });
            // this.updateStorage ();
        };      

        this.create = function(){
            this.listElem = document.createElement('ul');
            this.listElem.classList.add('users__list');
        }

        this.update = function(){
            this.data = this.get();

            this.listElem.innerHTML = '';

            this.data.forEach((item) => {
                let liElem = document.createElement('li');
                let nameElem = document.createElement('p');
                let emailElem = document.createElement('p');
                let addressElem = document.createElement('p');
                let phoneElem = document.createElement('p');

                let divBtnElem = document.createElement('div');
                let btnEdit = document.createElement('button');
                let btnRemove = document.createElement('button');

                liElem.classList.add('users__item');
                nameElem.classList.add('user__name');
                emailElem.classList.add('user__email');
                addressElem.classList.add('user__address');
                phoneElem.classList.add('user__phone');
                divBtnElem.classList.add('user__edit')

                liElem.id = item.id;
                nameElem.innerHTML = item.get().name;
                emailElem.innerHTML = item.get().email;
                addressElem.innerHTML = item.get().address;
                phoneElem.innerHTML = item.get().phone;

                btnEdit.innerHTML = 'Edit';
                btnRemove.innerHTML = 'X';

                divBtnElem.append(btnEdit, btnRemove);
                liElem.append(nameElem, emailElem, addressElem, phoneElem, divBtnElem);

                this.listElem.append(liElem);

                btnEdit.addEventListener('click', () => {
                    this.onEdit(item.id);
                });

                btnRemove.addEventListener('click', () => {
                    this.onRemove(item.id);
                });
            });
        }

        this.onSave = (id, newUserData) => {
            if (!id) return;

            const user = this.data.find(function(item) {
                return item.id == id;
            });

            if (!user) return;

            user.edit(newUserData);
            this.update();
            this.updateStorage();                   //

        };

        this.onEdit = (id) => {
            if (!id) return;
            
            const user = this.data.find(function(item) {
                return item.id == id;
            });

            if (!user) return;

            this.windowEdit(id, user.get());
            // this.updateStorage();                   //
        };

        this.onRemove = (id) => {
            if (!id) return;

            this.remove(id);
            this.update();
            this.updateStorage();                   //
        };

        this.onAdd = () => {
            const nameElem = this.usersElem.querySelector('[name="users-field-name"]');
            const emailElem = this.usersElem.querySelector('[name="users-field-email"]');
            const addressElem = this.usersElem.querySelector('[name="users-field-address"]');
            const phoneElem = this.usersElem.querySelector('[name="users-field-phone"]');

            const nameElemValue = nameElem.value;
            const emailElemValue = emailElem.value;
            const addressElemValue = addressElem.value;
            const phoneElemValue = phoneElem.value;

            const testEmail = /\S+@\S+\.\S+/.test(emailElemValue);
            const testPhone = /^\+?(375)\s?\-?\(?(29|25|44|33|17)\)?\s?-?[0-9]\s?-?[0-9]\s?-?[0-9]\s?-?[0-9]\s?-?[0-9]\s?-?[0-9]\s?-?[0-9]$/g.test(phoneElemValue);
            
            if (!testEmail ){
                emailElem.style.borderColor = 'red';
                return;
            } else emailElem.style.borderColor = 'green';
            if (!testPhone){
                phoneElem.style.borderColor = 'red';
                return;
            } else phoneElem.style.borderColor = 'green';

            if (!nameElemValue || !emailElemValue || !addressElemValue || !phoneElemValue) {
                return;
            }; 

            const dataFields = {
                name: nameElemValue,
                email: emailElemValue,
                address: addressElemValue,
                phone: phoneElemValue
            };

            this.add(dataFields);
            this.update();

            nameElem.value = '';
            emailElem.value = '';
            addressElem.value = '';
            phoneElem.value = '';


            this.updateStorage();                   //
        };

        this.init = function() {
            if (!this.data) return;

            this.usersElem = document.querySelector('.users');

            this.create();

            if (!this.listElem) return;

            this.usersElem.append(this.listElem);

            const btnAdd = this.usersElem.querySelector('[name="users-btn-add"]');
            btnAdd.addEventListener('click', this.onAdd);

            this.update();

            this.getData()
            .then(status => {
                if (status) this.update();
            });
        };
        this.init();
        
        this.clearStorageData();
    }
}
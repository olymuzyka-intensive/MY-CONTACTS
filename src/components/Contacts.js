class Contacts {
    #data = [];
    #lastId = 0;
    #user;

    add = function(userData = {}){

        if (!userData || (userData.name && userData.phone && userData.name.length == 0 && userData.content.phone == 0)) return;

        const user = new User(userData.name, userData.email, userData.address, userData.phone, userData.id);

        if (!user) return;

        this.#lastId++;
        user.id = this.#lastId;

        this.#data.push(user)
        this.updateStorage();
    }

    edit = function(id, userData = {}) {
        if (!id) return;

        let user = this.#data.find(function(item){
            return item.id == id;
        })

        if (!user) return;
        user.edit(userData);
        // this.updateStorage();
    }
  
    remove = function(id) {
        if (!id) return;

        let dataTmp = [];

        dataTmp = this.#data.filter(function(item) {
            return item.id != id;
        });

        this.#data = dataTmp;
        // this.updateStorage();
    }

    get = function(print = false) {
        let dataTmp = [];

        switch (print) {
            case 1:
                this.#data.forEach(function(item) {
                    dataTmp.push(item.get());
                });
            break;
            default:
                dataTmp = this.#data;
        }

        return dataTmp;
    }
}   
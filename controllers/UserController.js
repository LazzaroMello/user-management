class UserController {

    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);
        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit() {

        document.querySelector('#box-user-edit .btm-cancel').addEventListener('click', () => {

            this.showPainelCreate()

        })

        this.formUpdateEl.addEventListener('submit', event => {

            event.preventDefault();
            const btn = this.formUpdateEl.querySelector('[type=submit]');

            btn.disabled = true;
            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex; //pegea o index da tr   

            let tr = this.tableEl.rows[index]

            let oldUser = JSON.parse(tr.dataset.user);
            let result = Object.assign({}, oldUser, values)




            this.showPainelCreate();

            this.getPhoto(this.formUpdateEl).then( //quando der certo
                (content) => {

                    if (!values.photo) {
                        result._photo = oldUser._photo
                    } else {
                        result._photo = content
                    }

                    let user = new User()
                    user.loadFromJSON(result);
                    user.save()
                    this.getTr(user, tr)

                    this.updateCount();

                    this.formUpdateEl.reset()
                    btn.disabled = false;


                    btn.disabled = false;
                },
                (e) => {
                    console.error(e);
                }
            );

        })

    }




    onSubmit() {

        // document.getElementById('form-user-create')foi substituido pelo debaixo
        this.formEl.addEventListener('submit', event => {

            event.preventDefault();
            const btn = this.formEl.querySelector('[type=submit]');

            btn.disabled = true;
            let values = this.getValues(this.formEl);

            if (!values) return false;
            this.getPhoto(this.formEl).then( //quando der certo
                (content) => {

                    values.photo = content;
                    values.save()
                    this.addLine(values);
                    this.formEl.reset();
                    btn.disabled = false;
                },
                (e) => {
                    console.error(e);
                }
            );
        });
    }



    getPhoto(formEl) {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter((item) => {

                if (item.name === 'photo') {
                    return item;
                }
            })

            let file = elements[0].files[0];

            fileReader.onload = () => {

                resolve(fileReader.result);

            };

            fileReader.onerror = e => {

                reject(e);

            }
            //when the photo is already read, then call onload
            if (file) {
                fileReader.readAsDataURL(file)
            } else {
                resolve('dist/img/boxed-bg.jpg');

            }
        });
    }

    getValues(formEl) {

        //this.formEl.element ->replace the fields.forEach, old version code
        let isValid = true;
        let user = {};

        [...formEl.elements].forEach(function (field) {
            //field.value!= '' string é falso
            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) { //verify is the field is required   

                field.parentElement.classList.add('has-error');
                isValid = false;

            }


            if (field.name == 'gender') {

                if (field.checked) {

                    user[field.name] = field.value;
                }

            } else if (field.name === 'admin') {

                user[field.name] = field.checked;

            } else {
                user[field.name] = field.value;
            }
        })

        if (!isValid) {
            // console.log(user);
            btn.disabled = false;
            return false
        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );
    }

    
    selectAll() {

        let users = User.getUsersStorage();

        users.forEach(dataUser => {
            let user = new User()
            user.loadFromJSON(dataUser)
            this.addLine(user);
        })

    }


    addLine(dataUser) {
        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);

        this.updateCount();
    }

    getTr(dataUser, tr = null) {

        if (tr == null) tr = document.createElement('tr');
        tr.dataset.user = JSON.stringify(dataUser); //sobescreve

        tr.innerHTML = `    
       
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin?'Sim':'Nao'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Edit</button>
            <button type="button" class="btn btn-danger btn-xs btn-delete btn-flat">Delet</button>
            </td>
        `
        this.addEventsTr(tr)
        return tr;
    }

    addEventsTr(tr) {

        tr.querySelector('.btn-delete').addEventListener('click', () => {

            if (confirm('Are you sure about this?')) {
                let user = new User()   
                user.loadFromJSON(JSON.parse(tr.dataset.user))
                user.remove()   
                tr.remove()
                this.updateCount();
            }

        })


        tr.querySelector('.btn-edit').addEventListener('click', () => {

            let json = JSON.parse(tr.dataset.user);
            // let form = document.querySelector('#form-user-update')
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json) {

                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");
                //Nem todos os campos tem um formulario no html e portanto n tem value
                //_register.value == undefined , entao se field for verdadeiro entao entra no if
                if (field) {
                    switch (field.type) {
                        case 'file':

                            continue;

                            break;

                            // case 'radio':
                            //     field = this.formUpdateEl.querySelector("[name="+name.replace("_","")+"] [value="+ json[name] +"]");
                            // //     console.log('campo value = ',field);

                            //     field.checked = true;
                            // break;

                        case 'checkbox':

                            field.checked = json[name];

                            break;

                        default:
                            field.value = json[name];
                    }
                }

            }
            // console.log(json)
            this.formUpdateEl.querySelector('.photo').src = json._photo;
            this.showPaineEdit();


        })
    }
    showPainelCreate() {
        document.querySelector('#box-user-create').style.display = 'block'
        document.querySelector('#box-user-edit').style.display = 'none';
    }

    showPaineEdit() {
        document.querySelector('#box-user-create').style.display = 'none'
        document.querySelector('#box-user-edit').style.display = 'block';
    }

    updateCount() {

        let countUsers = 0;
        let countAdmin = 0;

        [...this.tableEl.children].forEach(tr => {

            countUsers++;
            let user = JSON.parse(tr.dataset.user);
            if (user._admin) countAdmin++;
            //underline because is not the object from 'users' anymore. We use Jason parse
            //so the object is other now. Because of that, was necessary use the underline
            //to take it the real value that we want
        })

        document.getElementById('number-users').innerHTML = countUsers;
        document.getElementById('number-users-admin').innerHTML = countAdmin;
    }

}
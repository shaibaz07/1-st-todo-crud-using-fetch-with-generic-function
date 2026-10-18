
const cl = console.log;

const todoForm = document.getElementById('todoForm')
const todoList = document.getElementById('todoList')
const todoInput = document.getElementById('todoInput')
const addTodoBtn = document.getElementById('addTodoBtn')
const spinner = document.getElementById('spinner')

const updateTodoBtn = document.getElementById('updateTodoBtn')



const BaseUrl = `https://studentpost-5eee3-default-rtdb.asia-southeast1.firebasedatabase.app`
const todoUrl = `${BaseUrl}/todoWIthGeneric.json`

const state = {
    todosArr: [],
    editId: null
}


function objTOArr(obj) {
    for (const key in obj) {
        obj[key].id = key;
        state.todosArr.unshift(obj[key])


    }
}

function showSpinner() {
    spinner.classList.remove('d-none')
}

function hideSpinner() {
    spinner.classList.add('d-none')
}


function snackBar(msg, icon) {
    swal.fire({
        title: msg,
        icon: icon,
        timer: 2500,
        confirmButtonColor: "#17973f"
    })
}



function makeApiCall(url, methodName, msgBody) {

    msgBody = msgBody ? JSON.stringify(msgBody) : null;

    return fetch(url, {
        method: methodName,
        body: msgBody,
        headers: {
            "Content-Type": "application/json",
            "Auth": "JWT Token"

        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP ERROR : ${res.status}`)
            }
            return res.json()
        })

}


function readTodo(arr) {
    let result = ``
    arr.forEach(todo => {
        result += `
                      <li class="list-group-item d-flex justify-content-between" id="${todo.id}">
                                <strong>${todo.todoItem}</strong>
                                <div>
                                    <button onClick ="onEditTodo(this)" class="btn btn-sm btn-outline-success">Edit</button>
                                    <button onClick = "onRemoveTodo(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                                </div>
                            </li>
        
        
        
                `
    })
    todoList.innerHTML = result;

}


function fetchTodo() {
    showSpinner()
    makeApiCall(todoUrl, "GET", null)
        .then(res => {
            objTOArr(res)
            readTodo(state.todosArr)
        })
        .catch(err => {
            cl(err)
        })
        .finally(() => {
            hideSpinner()
        })

}

fetchTodo()


function onAddTodo(eve) {
    eve.preventDefault()

    let newTodo = {
        todoItem: todoInput.value,
        todoId: Date.now()


    }

    todoForm.reset()

    showSpinner()

    makeApiCall(todoUrl, "POST", newTodo)
        .then(res => {

            newTodo.id = res.name
            state.todosArr.unshift(newTodo)
            let li = document.createElement('li');
            li.id = res.name
            li.className = "list-group-item d-flex justify-content-between"
            li.innerHTML = `
                             <strong>${newTodo.todoItem}</strong>
                                <div>
                                    <button onClick ="onEditTodo(this)" class="btn btn-sm btn-outline-success">Edit</button>
                                    <button onClick = "onRemoveTodo(this)" class="btn btn-sm btn-outline-danger">Remove</button>

                                </div>
            
                
                                `


            todoList.prepend(li)

            snackBar(`Todo With id : ${li.id} is added successfully !!!`)
        })

        .catch(err => {
            cl(err)
        })
        .finally(() => {
            hideSpinner()
        })

}


function onEditTodo(ele) {


    let editId = ele.closest('li').id;
    state.editId = editId


    let editObj = state.todosArr.find(t => t.id === editId);

    todoInput.value = editObj.todoItem;

    addTodoBtn.classList.add('d-none');
    updateTodoBtn.classList.remove('d-none')


}

function onUpdateTodo() {
    let updateId = state.editId;

    let updateUrl = `${BaseUrl}/todoWIthGeneric/${updateId}.json`

    let updatedObj = {
        todoItem: todoInput.value,
        id: updateId,

    }


    showSpinner()
    makeApiCall(updateUrl, "PATCH", updatedObj)
        .then(res => {
            let updateIdx = state.todosArr.findIndex(t => t.id === updateId)
            state.todosArr[updateIdx] = updatedObj
            let li = document.getElementById(updateId)
            li.className = 'list-group-item d-flex justify-content-between'

            li.innerHTML = `
                         <strong>${updatedObj.todoItem}</strong>
                                <div>
                                 <button onClick ="onEditTodo(this)" class="btn btn-sm btn-outline-success">Edit</button>
                                    <button onClick = "onRemoveTodo(this)" class="btn btn-sm btn-outline-danger">Remove</button>

                                </div>
            
                        `
            todoForm.reset()

            updateTodoBtn.classList.add('d-none')
            addTodoBtn.classList.remove('d-none')

            snackBar(`Todo With id : ${updateId} is updated successfully !!!`)

        })
        .catch(err => {

        })
        .finally(() => [
            hideSpinner()
        ])


}







function onRemoveTodo(ele) {
    let removeId = ele.closest('li').id;


    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4b9b19",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            let removeUrl = `${BaseUrl}/todoWIthGeneric/${removeId}.json`
            showSpinner()
            makeApiCall(removeUrl, "DELETE", null)
                .then(res => {
                    let removeIdx = state.todosArr.findIndex(t => t.id === removeId)
                    state.todosArr.splice(removeIdx, 1)

                    ele.closest('li').remove()

            snackBar(`Todo With id : ${removeId} is added successfully !!!`)


                })
                .catch(err => {
                    cl(err)
                })
                .finally(() => [
                    hideSpinner()
                ])

        }

    });




















}



updateTodoBtn.addEventListener('click', onUpdateTodo)

todoForm.addEventListener('submit', onAddTodo)

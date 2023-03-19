const ulLists = document.querySelectorAll('ul');
const addBtns = document.querySelectorAll('.add-btn');

let tempDrag = null;

let notStarted = [];
let inProg = [];
let completed = [];

// check local Storage when window load
window.onload = checkLocalStorage();

// Add border to every generated input
function addBorder(){
  ulLists.forEach(ul => {
    if(ul.querySelectorAll('li').length > 0){
      ul.classList.add('bord-5');
    } else {
      ul.classList.remove('bord-5');
    }
  })
}

// Add Edit OR Delete controls
function setUpControls(parentEl) {
  const del = document.createElement('span');
  del.classList.add('control-del');
  const edit = document.createElement('span');
  edit.classList.add('control-edit');
  del.classList.add('controls');
  edit.classList.add('controls');


  parentEl.querySelectorAll('.inp-control').forEach(item => {
    item.append(del, edit);
  })

  deleteAndEditHandlers(parentEl);
}

// Handle Edit AND Delete 
function deleteAndEditHandlers(element) {
  const delBtns = element.querySelectorAll('.control-del');
  const editBtns = element.querySelectorAll('.control-edit');

  
  delBtns.forEach(btn => {
    btn.addEventListener('click', function(){
      this.parentElement.remove();
      addBorder();
      placeholderCounter();
      countTasks(element.parentElement);
    })

    btn.addEventListener('click', () => {
      
      const input = btn.parentElement.querySelector('input');
      removeItemFromLocalStorage(input.value, checkWhichLi(element))
    })
  })

  editBtns.forEach(btn => {
    btn.addEventListener('click', function(){
      const inputEl = this.parentElement.querySelector('input');
      inputEl.removeAttribute('readonly');
      inputEl.focus();
    })
  })
}

// Check which ul list from 3 we use
function checkWhichLi(element){
// parameter => Takes Div parent not ul
  let tempKey;
      if (element.classList.contains('not-started')){tempKey = 'notStarted'}
      if (element.classList.contains('in-prog')){tempKey = 'inProg'}
      if (element.classList.contains('completed')){tempKey = 'completed'}
  return tempKey;
}

// Counter at every status to show how many tasks in.
function countTasks(parentEl) {
  let countSpan = parentEl.querySelector('.tasks-count');
  let tasksCounter = 0;
  
  if(!countSpan){
    countSpan = document.createElement('span');
    countSpan.classList.add('tasks-count')
    parentEl.appendChild(countSpan);
  }
  
  if(!parentEl.hasChildNodes()){
    countSpan.textContent = '0';
  } else {
    tasksCounter = parentEl.querySelectorAll('li').length;
      countSpan.textContent = tasksCounter;
  }
  
  // console.log(`Count for ${parentEl}: counter => ${tasksCounter}`);
  // console.log(`Count for ${parentEl}: textContent => ${countSpan.textContent}`);
}

// Count new placeholder for every new generated input 
function placeholderCounter() {
  let counter = 1;

  document.body.querySelectorAll('ul').forEach(ul => {
    ul.querySelectorAll('li').forEach(li => {
      li.querySelectorAll('input').forEach(inp => {
        if(counter <= 9){
          inp.placeholder = `Task 0${counter}`;
        } else {
          inp.placeholder = `Task ${counter}`;
        }
        counter++;
      })
    })
  })
}

// All Helper Function in one
function handleOnLi(parentEl){
  placeholderCounter();
  setUpControls(parentEl);
  addBorder();
  countTasks(parentEl);
  checkInputValue();
  dragAndDropHandler();
}

// Add new input handler
function addTasksHandler(event){
  const parentEl = event.target.parentElement;
  const taskUl = parentEl.querySelector('ul');

  taskUl.innerHTML += `
  <li class="inp-control" draggable="true" id=${(Math.random() + 0.5).toFixed(5)}>
    <input type="text" readonly="true" class="input-task" id=${(Math.random() + 0.2).toFixed(5)}>
  </li>
  `;
  
  // Run all functions
  handleOnLi(parentEl);
  if (!taskUl.hasChildNodes){
    taskUl.style.backgroundColor = 'transparent';
  }
}

// Check input value and toggle classes
function checkInputValue(){
  const allInps = document.querySelectorAll('input');
  allInps.forEach(inp => {
    inp.addEventListener('focusout', (ev) => {
      if (inp.value.length > 0){
        ev.target.setAttribute('value', inp.value);
        inp.parentElement.querySelectorAll('span').forEach(sp => {
          sp.classList.remove('ctrl');
        })
      }
      editOnLocalStorage(inp);
    })
  })

  // Toggle Opacity when click on edit icon
  document.querySelectorAll('.controls').forEach(cntrl => {
    cntrl.addEventListener('click', () => {
      cntrl.classList.toggle('ctrl')
    })
  })

  updateLocalStrg();
}

// Handle Drag and Drop events
function dragAndDropHandler() {
  const tasks = document.querySelectorAll('.inp-control');

  tasks.forEach(task => {
    task.addEventListener('dragstart', () => {
      tempDrag = task;
      task.style.opacity = '0.5';
    })

    task.addEventListener('dragend', () => {
      tempDrag = null;
      task.style.opacity = '1';
      task.parentElement.classList.remove('dropped')
    })

  })

  ulLists.forEach(ul => {

    const ulData = ul.parentElement.parentNode.childNodes;
    
    ul.addEventListener('dragover', event => {
        event.preventDefault();
        ul.classList.add('dropped')
    })

    ul.addEventListener('dragleave', () => {
      ul.classList.remove('dropped');
    })
    
    ul.addEventListener('drop', () => {
      ul.append(tempDrag);
      addBorder();

      // Check 3 lists after every drop event
      countTasks(ulData[1]);
      countTasks(ulData[3]);
      countTasks(ulData[5]);

      updateLocalStrgOnDragDrop(ul);
    })
  })

}

/* ********************* */
// LOCAL STORAGE
/* ********************* */

// Update local Storage items after drag and drop.
function updateLocalStrgOnDragDrop(ul){
  const item = tempDrag.querySelector('input').value;
      const key = checkWhichLi(ul.parentElement);
      const items = JSON.parse(localStorage.getItem(key));
      
      // Remove the item from the old list
      if(item.trim().length > 0){
        const oldListIndex = items.indexOf(item);
      if (oldListIndex > -1) {
      items.splice(oldListIndex, 1);
      }

      if (ul.classList.contains('not-started-list')) {
        notStarted.push(item);
      } else if (ul.classList.contains('in-prog-list')) {
        inProg.push(item);
      } else if (ul.classList.contains('completed-list')) {
        completed.push(item);
      }

      // Update the localStorage
      localStorage.setItem('notStarted', JSON.stringify(notStarted));
      localStorage.setItem('inProg', JSON.stringify(inProg));
      localStorage.setItem('completed', JSON.stringify(completed));
      localStorage.setItem(key, JSON.stringify(items.concat(item)));
      }
}

// Works when we edit on value after saving it in local storage
function editOnLocalStorage(input) {
  const ul = input.parentElement.parentElement;
  const parentUl = ul.parentElement;
  const key = checkWhichLi(parentUl);
  
  input.addEventListener('blur', ev => {
    const updateVal = ev.target.value;
    const items = JSON.parse(localStorage.getItem(key));

    const updatedItems = Array.from(parentUl.children).indexOf(input.parentElement);
    if(updatedItems !== -1){
      items[updatedItems] = updateVal;
      localStorage.setItem(key, JSON.stringify(items))
    }
  });
}

// Remove item from local storage when delete btn clicked 
function removeItemFromLocalStorage(item, key) {
  const items = JSON.parse(localStorage.getItem(key));
  const updatedItems = items.filter(i => i !== item);
  localStorage.setItem(key, JSON.stringify(updatedItems));
}

// Store data in Local storage
function updateLocalStrg(){

  document.querySelectorAll('.control-edit').forEach(editBtn => {
    const parentInp = editBtn.parentElement;
    const input = parentInp.querySelector('input');

    input.addEventListener('focusout', () => {
      const parentUl = input.parentElement.parentElement;
      if(input.value.trim().length > 0){
        let key = checkWhichLi(parentUl.parentElement);

        const items = JSON.parse(localStorage.getItem(key))
        const index = Array.from(parentUl.children).indexOf(parentInp);
        items[index] = input.value;
        localStorage.setItem(key, JSON.stringify(items))
      }
    })
    
  })
}

// If there're an items in localStorage append it when page reloaded
function checkLocalStorage() {
  const lists = [
    { name: 'notStarted', selector: '.not-started-list' },
    { name: 'inProg', selector: '.in-prog-list' },
    { name: 'completed', selector: '.completed-list' }
  ];

  lists.forEach(({ name, selector }) => {
    const storedData = localStorage.getItem(name);

    if (!storedData) {
      localStorage.setItem(name, JSON.stringify([]));
      return;
    }

    const list = document.querySelector(selector);
    const parentEl = list.parentElement;
    const dataInLocal = JSON.parse(storedData);

    list.innerHTML = '';

    dataInLocal.forEach(item => {
      list.innerHTML += `
        <li class="inp-control" draggable="true" id=${(Math.random() + 0.5).toFixed(5)}>
          <input value="${item}" type="text" readonly="true" class="input-task" id=${(Math.random() + 0.2).toFixed(5)}>
        </li>
      `;
      handleOnLi(parentEl);
    });
  });
}

// Event Listeners
addBtns.forEach(btn => {
  btn.addEventListener('click', addTasksHandler)
})
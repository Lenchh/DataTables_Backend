function DataTable(config, data) {
  const button = document.createElement("button");
  button.textContent = "Додати";
  button.classList.add("add-button");
  button.onclick = function () { addModalWindow(config) };
  document.querySelector(config.parent).appendChild(button);

  const table = document.createElement("table");

  table.appendChild(createHead(config));

  if (typeof data === "undefined") {
    getUsers(config.apiUrl).then(users => { table.appendChild(createRow(users, config.columns, config.apiUrl, config)); console.log(users)});
  } else {
    table.appendChild(createRow(data, config.columns));
  }
  document.querySelector(config.parent).appendChild(table);
}

function addModalWindow(config, element, id) {
  const modalWindow = document.createElement("div");
  modalWindow.classList.add("modal-window");
  const inputContainer = document.createElement("div");
  inputContainer.classList.add("input-container");
  for (const column of config.columns) {
    const currentInput = createInput(column, element);
    if (currentInput)
      inputContainer.appendChild(currentInput);
  }
  modalWindow.appendChild(inputContainer);
  const saveButton = document.createElement("button");
  saveButton.textContent = "Зберегти";
  saveButton.classList.add("save-button");
  saveButton.onclick = function () { saveData(modalWindow, config, element, id) };
  modalWindow.appendChild(saveButton);
  const closeButton = document.createElement("button");
  closeButton.textContent = "Закрити";
  closeButton.classList.add("save-button");
  closeButton.classList.add("close-button");
  closeButton.onclick = function () { closeModalWindow(modalWindow) };
  modalWindow.appendChild(closeButton);
  document.body.appendChild(modalWindow);
}

async function saveData(modalWindow, config, el, id) {
  let newValue = {};
  modalWindow.querySelectorAll("input, select").forEach(input => {
    if (input.value.trim() === "") {
      input.style.borderColor = "red";
      newValue = null;
    } else {
    newValue[input.name] = input.value;
    if (input.name === "price")
      newValue[input.name] = parseInt(input.value);
  }
  });
  if(newValue) {
    let response;
    if(el) {
      response = await fetch(config.apiUrl + "/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newValue)
      }); } else {
        response = await fetch(config.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newValue)
  }); }
  if (response.ok) {
    const data = await response.json();
    alert("Дані збережено:)");
    document.querySelector(config.parent).innerHTML = "";
    DataTable(config);
  } else 
    alert("Error :(");
  }
}

function closeModalWindow(modalWindow) {
  modalWindow.style.display = "none";
}

function createInput(column, el) {
  if (!column.input)
    return null;
  const currentInput = document.createElement("div");
  currentInput.classList.add("current-input");
  const dataArray = Array.isArray(column.input) ? column.input : [column.input];
  for (const element of dataArray) {
    const label = document.createElement("label");
    label.textContent = element.label || column.title;
    let input;
    if (element.type === "select") {
      input = document.createElement("select");
      element.options.forEach(optionValue => {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        if(el) {
           input.value = el.currency;
        }
        input.appendChild(option);
      });
    } else {
      input = document.createElement("input");
      input.style.width = "250px";
      input.style.marginLeft = "10px";
      input.type = element.type || "text";
    }
    input.name = element.name || column.value;
    if(el) {
      if (input.name === "birthday") {
        input.value = new Date(el[input.name]).toISOString().split("T")[0];
      } else
        input.value = el[input.name];
    }
    currentInput.appendChild(label);
    currentInput.appendChild(input);
  }
  return currentInput;
}

function createHead(config) {
  const head = document.createElement("thead");
  const row = document.createElement("tr");
  const { columns } = config;
  for (const key of columns) {
    const cell = document.createElement("th");
    cell.textContent = key.title;
    row.appendChild(cell);
  }
  head.appendChild(row);
  return head;
}

function createRow(data, columns, apiUrl, config) {
  let i = 1;
  const body = document.createElement("tbody");
  for (const [id, element] of data) {
    const row = document.createElement("tr");
    for (const key of columns) {
      const cell = document.createElement("td");
      if (key.value === "actions") {
        const button = document.createElement("button");
        button.textContent = "Видалити";
        button.style.backgroundColor = "red";
        button.style.marginRight = "10px";
        button.onclick = function () { deleteItem(apiUrl + "/" + id, config) };
        cell.appendChild(button);
        const buttonEdit = document.createElement("button");
        buttonEdit.textContent = "Редагувати";
        buttonEdit.style.backgroundColor = "yellow";
        buttonEdit.onclick = function () { addModalWindow(config, element, id) };
        cell.appendChild(buttonEdit);
      }
      else if (typeof key.value === "function") {
        if (typeof key.value(element) === "string") {
          cell.textContent = key.value(element);
          if (key.value(element).includes("img"))
            cell.innerHTML = key.value(element);
        }
        if (key.value(element) instanceof HTMLElement)
          cell.appendChild(key.value(element));
      } else {
        cell.textContent = element[key.value] + " " + id;
      }
      row.appendChild(cell);
    }
    body.appendChild(row);
    i++;
  }
  return body;
}

async function deleteItem(apiUrl, config) {
  const response = await fetch(apiUrl, { method: "DELETE" });
  if (response.ok) {
    document.querySelector(config.parent).innerHTML = "";
    DataTable(config);
  } else {
    console.log(":(");
  }
}

async function getUsers(apiUrl) {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return Object.entries(data.data);
}

function getAge(birthday) {
  const currentBirthday = new Date(birthday);
  const today = new Date();

  let years = today.getFullYear() - currentBirthday.getFullYear();
  let month = today.getMonth() - currentBirthday.getMonth();

  if (month < 0) {
    years--;
    month += 12;
  }

  return `years: ${years}, months: ${month}`;
}

const users = [
  { id: 30050, name: 'Вася', surname: 'Петров', age: 12 },
  { id: 30051, name: 'Вася', surname: 'Васечкін', age: 15 },
];

const config3 = {
  parent: '#usersTable',
  columns: [
    { title: 'Ім’я', value: 'name' },
    { title: 'Прізвище', value: 'surname' },
    { title: 'Вік', value: 'age' },
  ]
};

const config1 = {
  parent: '#usersTable',
  columns: [
    { title: 'Ім’я', value: 'name', input: { type: 'text' } },
    { title: 'Прізвище', value: 'surname', input: { type: 'text' } },
    { title: 'Вік', value: (user) => getAge(user.birthday), input: { type: "date", name: "birthday", label: "День народження" } },
    { title: 'Фото', value: (user) => `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>`, input: { type: "url", name: "avatar" } },
    { title: 'Дії', value: 'actions' }
  ],
  apiUrl: "https://mock-api.shpp.me/opletnova/users"
};

const config2 = {
  parent: '#productsTable',
  columns: [
    { title: 'Назва', value: 'title', input: { type: 'text' } },
    {
      title: 'Ціна', value: (product) => `${product.price} ${product.currency}`,
      input: [
        { type: 'number', name: 'price', label: 'Ціна' },
        { type: 'select', name: 'currency', label: 'Валюта', options: ['$', '€', '₴'], required: false }
      ]
    },
    { title: 'Колір', value: (product) => getColorLabel(product.color), input: { type: 'color', name: 'color' } },
    { title: 'Дії', value: 'actions' }
  ],
  apiUrl: "https://mock-api.shpp.me/opletnova/products"
};

function getColorLabel(color) {
  const rect = document.createElement("div");

  rect.style.backgroundColor = color;
  rect.classList.add("rect-color");

  return rect;
}

DataTable(config2);

DataTable(config1);
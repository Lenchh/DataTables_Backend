function DataTable(config, data) {
  document.querySelector(config.parent).appendChild(createButton("Додати", "add-button", "", () => addModalWindow(config)));

  const table = document.createElement("table");

  table.appendChild(createHead(config));

  if (typeof data === "undefined") {
    getUsers(config.apiUrl).then(users => { table.appendChild(createRow(users, config)); });
  } else {
    table.appendChild(createRow(data, config));
  }
  document.querySelector(config.parent).appendChild(table);
}

function createButton(content, nameClass, otherNameClass, functionClick) {
  const button = document.createElement("button");
  button.textContent = content;
  button.classList.add(nameClass);
  if (otherNameClass)   // if button has another class
    button.classList.add(otherNameClass);
  button.onclick = functionClick;
  return button;
}

function addModalWindow(config, elementOfData, id) {
  const modalWindow = document.createElement("div");
  modalWindow.classList.add("modal-window");

  const inputContainer = document.createElement("div");
  inputContainer.classList.add("input-container");
  for (const column of config.columns) {
    const currentInput = createInput(column, elementOfData);
    if (currentInput)
      inputContainer.appendChild(currentInput);
  }
  modalWindow.appendChild(inputContainer);

  const containerButton = document.createElement("div");
  containerButton.classList.add("button-container");
  containerButton.appendChild(createButton("Зберегти", "save-button", "", () => saveData(modalWindow, config, elementOfData, id)));
  containerButton.appendChild(createButton("Закрити", "save-button", "close-button", () => closeModalWindow(modalWindow)));
  modalWindow.appendChild(containerButton);
  document.body.appendChild(modalWindow);
}

function createInput(column, elementOfData) {
  if (!column.input) // if element of columns doesn`t have input field
    return null;

  const currentInput = document.createElement("div"); // create container for label + input
  currentInput.classList.add("input-and-label");

  const dataArray = Array.isArray(column.input) ? column.input : [column.input];
  for (const elementInput of dataArray) {

    const label = document.createElement("label");
    label.textContent = elementInput.label || column.title;

    let input;
    if (elementInput.type === "select") {
      input = document.createElement("select");
      elementInput.options.forEach(optionValue => {
        const option = document.createElement("option");
        option.value = optionValue;
        option.textContent = optionValue;
        if (elementOfData)  // if data in tables is edited rather than added, input fields must be automatically filled in
          input.value = elementOfData.currency;
        input.appendChild(option);
      });
    }

    else {
      input = document.createElement("input");
      input.classList.add("current-input");
      input.type = elementInput.type || "text";
    }

    input.name = elementInput.name || column.value;

    if (elementOfData) {  // if data in tables is edited rather than added, input fields must be automatically filled in
      if (input.name === "birthday") {
        input.value = new Date(elementOfData[input.name]).toISOString().split("T")[0];
      } else
        input.value = elementOfData[input.name];
    }
    currentInput.appendChild(label);
    currentInput.appendChild(input);
  }
  return currentInput;
}

async function saveData(modalWindow, config, el, id) {
  let newValue = {};
  modalWindow.querySelectorAll("input, select").forEach(input => {
    if (input.value.trim() === "") {
      input.style.borderColor = "red";
      newValue = null;
      return null;
    } else {
      newValue[input.name] = input.value;
      if (input.name === "price")
        newValue[input.name] = parseInt(input.value);
    }
  });
  if (newValue) {
    let currentMethod;
    let currentURL;

    if (el) {
      currentMethod = "PUT";
      currentURL = `${config.apiUrl}/${id}`;
    } else {
      currentMethod = "POST";
      currentURL = config.apiUrl;
    }

    const response = await fetch(currentURL, {
      method: currentMethod,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newValue)
    });

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

function createHead(config) {
  const head = document.createElement("thead");
  const row = document.createElement("tr");
  const { columns } = config;
  for (const column of columns) {
    const cell = document.createElement("th");
    cell.textContent = column.title;
    row.appendChild(cell);
  }
  head.appendChild(row);
  return head;
}

async function getUsers(apiUrl) {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return Object.entries(data.data);
}

function createRow(data, config) {
  const body = document.createElement("tbody");

  for (const [id, element] of data) {
    const row = document.createElement("tr");

    for (const key of config.columns) {
      const cell = document.createElement("td");
      if (key.value === "actions") {   // add buttons "Видалити" and "Редагувати"
        cell.appendChild(createButton("Видалити", "remove-button", "", () => deleteItem(config.apiUrl + "/" + id, config)));
        cell.appendChild(createButton("Редагувати", "edit-button", "", () => addModalWindow(config, element, id)));
      }
      else if (typeof key.value === "function") { // if getAge() or getColor() or img
        if (typeof key.value(element) === "string") { // if getAge()
          cell.textContent = key.value(element);
          if (key.value(element).includes("img")) // if img
            cell.innerHTML = key.value(element);
        }
        if (key.value(element) instanceof HTMLElement) // if getColor()
          cell.appendChild(key.value(element));
      } else {
        cell.textContent = element[key.value];
      }
      row.appendChild(cell);
    }
    body.appendChild(row);
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
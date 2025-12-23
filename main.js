function DataTable(config, data) {
  document.querySelector(config.parent).appendChild(createButton("Додати", "add-button", "inter-font", () => addModalWindow(config)));

  const tableWrap = document.createElement("div");
  tableWrap.classList.add("table-wrap");

  const table = document.createElement("table");

  table.appendChild(createHead(config));

  if (typeof data === "undefined") {
    getUsers(config.apiUrl).then(users => { table.appendChild(createRow(users, config)); });
  } else {
    table.appendChild(createRow(data, config));
  }
  tableWrap.appendChild(table);
  document.querySelector(config.parent).appendChild(tableWrap);
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
  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");

  const header = document.createElement("h2");
  header.textContent = "Add/Edit Record";
  modalContent.appendChild(header);

  for (const column of config.columns) {
    const currentInput = createInput(column, elementOfData);
    if (currentInput)
      modalContent.appendChild(currentInput);
  }

  const containerButton = document.createElement("div");
  containerButton.classList.add("button-container");
  containerButton.appendChild(createButton("Зберегти", "save-button", "", () => saveData(modalContent, modalWindow, config, elementOfData, id)));
  containerButton.appendChild(createButton("Закрити", "save-button", "close-button", () => closeModalWindow(modalWindow)));
  modalContent.appendChild(containerButton);
  modalWindow.appendChild(modalContent);
  document.body.appendChild(modalWindow);
}

function createInput(column, elementOfData) {
  if (!column.input) // if element of columns doesn`t have input field
    return null;

  const currentInput = document.createElement("div"); // create container for label + input

  const dataArray = Array.isArray(column.input) ? column.input : [column.input];
  for (const elementInput of dataArray) {

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
      input.classList.add("input-text");
      input.type = elementInput.type || "text";
      input.placeholder = elementInput.label || column.title;
      if (elementInput.type === 'number') {
        input.min = "1";
        input.value = "1";
      }
      if (elementInput.type === 'color') {
        input.classList.remove("input-text");
        input.classList.add("color-input");
      }
    }

    input.name = elementInput.name || column.value;

    if (elementOfData) {  // if data in tables is edited rather than added, input fields must be automatically filled in
      if (input.name === "birthday") {
        input.value = new Date(elementOfData[input.name]).toISOString().split("T")[0];
      } else
        input.value = elementOfData[input.name];
    }
    currentInput.appendChild(input);
  }
  return currentInput;
}

async function saveData(modalContent, modalWindow, config, el, id) {
  let newValue = {};
  modalContent.querySelectorAll("input, select").forEach(input => {
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
      new Toast({
        title: false,
        text: 'Дані збережені:)',
        theme: 'success',
        autohide: true,
        interval: 10000
      });
      document.querySelector(config.parent).innerHTML = "";
      DataTable(config);
      closeModalWindow(modalWindow);
    } else
      new Toast({
        title: false,
        text: 'Помилка при спробі зберегти дані',
        theme: 'danger',
        autohide: true,
        interval: 10000
      });
    closeModalWindow(modalWindow);
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
  try{
  const response = await fetch(apiUrl);
  const data = await response.json();
  return Object.entries(data.data);
  } catch {
    new Toast({
        title: false,
        text: 'Помилка при спробі завантажити дані',
        theme: 'danger',
        autohide: true,
        interval: 10000
      });
  }
}

function createRow(data, config) {
  const body = document.createElement("tbody");

  for (const [id, element] of data) {
    const row = document.createElement("tr");

    for (const key of config.columns) {
      const cell = document.createElement("td");
      if (key.value === "actions") {   // add buttons "Видалити" and "Редагувати"
        cell.appendChild(createButton(".", "edit-button", "", () => addModalWindow(config, element, id)));
        cell.appendChild(createButton(".", "remove-button", "", () => deleteItem(config.apiUrl + "/" + id, config)));
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
  try {
    const response = await fetch(apiUrl, { method: "DELETE" });
    new Toast({
      title: false,
      text: 'Дані видалені',
      theme: 'success',
      autohide: true,
      interval: 10000
    });
    document.querySelector(config.parent).innerHTML = "";
    DataTable(config);
  } catch {
    new Toast({
      title: false,
      text: 'Помилка при спробі видалити дані',
      theme: 'danger',
      autohide: true,
      interval: 10000
    });
  }
}

const config1 = {
  parent: '#usersTable',
  columns: [
    { title: 'Ім’я', value: 'name', input: { type: 'text' } },
    { title: 'Прізвище', value: 'surname', input: { type: 'text' } },
    { title: 'Вік', value: (user) => getAge(user.birthday), input: { type: "date", name: "birthday", label: "День народження" } },
    {
      title: 'Фото', value: (user) =>
        `<img src="${user.avatar}" alt="${user.name[0]}${user.surname[0]}" onerror="handleImgError(this)"/>`,
      input: { type: "url", name: "avatar" }
    },
    { title: 'Дії', value: 'actions' }
  ],
  apiUrl: "https://mock-api.shpp.me/opletnova/users"
};

function handleImgError(img) {
  const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
  const text = document.createElement('span');
  text.textContent = img.alt;
  text.style.backgroundColor = color;
  text.classList.add("avatar-alt");
  img.replaceWith(text);
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

  return `${years} years ${month} months`;
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
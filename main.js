function DataTable(config, data) {
  const table = document.createElement("table");
  const head = document.createElement("thead");
  const row = document.createElement("tr");

  const { columns } = config;
  for (const key of columns) {
    const cell =  document.createElement("th");
    cell.textContent = key.title;
    row.appendChild(cell);
  }
  head.appendChild(row);
  table.appendChild(head);

  const body = document.createElement("tbody");
  for (const element of data) {
    const row = document.createElement("tr");
    for (const key of columns) {
      const cell = document.createElement("td");
      cell.textContent = element[key.value];
      row.appendChild(cell);
    }
    body.appendChild(row);
  }
  table.appendChild(body);

  document.getElementById("usersTable").appendChild(table);
}

const users = [
  { id: 30050, name: 'Вася', surname: 'Петров', age: 12 },
  { id: 30051, name: 'Вася', surname: 'Васечкін', age: 15 },
];

const config1 = {
  parent: '#usersTable',
  columns: [
    { title: 'Ім’я', value: 'name' },
    { title: 'Прізвище', value: 'surname' },
    { title: 'Вік', value: 'age' },
  ]
};

const users1 = [
  { product: 'Ноутбук', brand: 'Acer' },
  { product: 'Смартфон', brand: 'Samsung' },
  { product: 'Навушники', brand: 'Sony' },
];


const config2 = {
  parent: '#usersTable',
  columns: [
    { title: 'Товар', value: 'product' },
    { title: 'Бренд', value: 'brand' },
  ]
};

const users2 = [
  { name: "Олена", age: 19, city: "Вроцлав", status: "Розробник" },
  { name: "Леся", age: 23, city: "Львів", status: "Студент" },
  { name: "Ігор", age: 30, city: "Київ", status: "Розробник" },
  { name: "Таня", age: 27, city: "Харків", status: "Дизайнер" },
];

const config3 = {
  parent: "#usersTable",
  columns: [
    { title: "Ім’я", value: "name" },
    { title: "Вік", value: "age" },
    { title: "Місто", value: "city" },
    { title: "Статус", value: "status" }
  ],
};

const users3 = [
  { task: "Вивчити JS" },
  { task: "Пройти курс HTML/CSS" }
];

const config4 = {
  parent: "#usersTable",
  columns: [
    { title: "Завдання", value: "task" },
  ],
};

DataTable(config1, users);
DataTable(config2, users1);
DataTable(config3, users2);
DataTable(config4, users3);
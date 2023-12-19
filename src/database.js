import fs from 'node:fs/promises'

const databasePath = new URL('../db.json', import.meta.url)

export class Database {
  #database = {}

  constructor() {
    fs.readFile(databasePath, 'utf8')
      .then(data => {
        this.#database = JSON.parse(data)
      })
      .catch(() => {
        this.#persist()
      })
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database, null, 2))
  }

  select(table, search) {
    let data = this.#database[table] ?? [];

    if (search && search.name) {
        const name = search.name.toLowerCase(); // Convertendo para minúsculas para a busca ser case-insensitive
        data = data.filter(row => {
            if (!name) return true;

            const rowName = row.name.toLowerCase();
            return rowName.includes(name);
        });
    }

    return data;
}

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data)
    } else {
      this.#database[table] = [data]
    }

    this.#persist()

    return data
  }

  update(table, id, data) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id);

    if (rowIndex > -1) {
        const row = this.#database[table][rowIndex];
        this.#database[table][rowIndex] = { ...row, ...data };
        this.#persist();
        return this.#database[table][rowIndex];
    }

    return null;
  }

  delete(table, id) {
    const rowIndex = this.#database[table].findIndex(row => row.id === id)

    if (rowIndex > -1) {
      this.#database[table].splice(rowIndex, 1)
      this.#persist()
    }
  }
}
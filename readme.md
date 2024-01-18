# JsonFlexDB

JsonFlexDB is a simple Node.js module for basic CRUD operations using a JSON file as a data store. It provides a lightweight alternative to more robust database systems for small-scale applications.

## Installation

Install the JsonFlexDB module using npm:

```bash
npm install json-flex-db
```

## Usage

```javascript
const JsonFlexDB = require("json-flex-db");

// Create an instance of JsonFlexDB
const jsonDB = new JsonFlexDB("path/to/data.json");

// Ensure indexes are created (optional)
jsonDB
  .createIndex("category")
  .then(() => jsonDB.createIndex("status"))
  .then(() => {
    // Insert documents
    const doc1 = {
      _id: "1",
      name: "Document 1",
      category: "A",
      status: "Active",
    };
    const doc2 = {
      _id: "2",
      name: "Document 2",
      category: "B",
      status: "Inactive",
    };

    return Promise.all([jsonDB.insert(doc1), jsonDB.insert(doc2)]);
  })
  .then(() => jsonDB.find({ category: "A" }))
  .then((results) => {
    console.log("Results based on category index:", results);

    // Update documents
    return jsonDB.update({ category: "A" }, { status: "Updated" });
  })
  .then(() => jsonDB.remove({ status: "Inactive" }))
  .then(() => {
    // Visualize the data
    jsonDB.visualize();

    // Export all data
    const allData = jsonDB.getAll();
    console.log("All data:", allData);
  })
  .catch((error) => console.error("Error:", error.message));
```

## API

### `new JsonFlexDB(filePath: string)`

Creates a new instance of the JsonFlexDB class.

- `filePath`: The file path where the JSON data will be stored.

### `async createIndex(indexName: string): Promise<void>`

Creates an index for optimizing queries.

- `indexName`: The name of the index.

### `async find(query: Object): Promise<Array<Object>>`

Finds documents based on a query.

- `query`: The query object.

### `async insert(document: Object): Promise<string>`

Inserts a document into the database.

- `document`: The document to insert.

### `async update(query: Object, updates: Object): Promise<number>`

Updates documents based on a query.

- `query`: The query object.
- `updates`: The updates to apply.

### `async remove(query: Object): Promise<number>`

Removes documents based on a query.

- `query`: The query object.

### `getAll(): Object`

Gets all documents in the database.

### `visualize(): void`

Visualizes the data in the console using `console.table`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# JsonFlexDB [![Downloads](https://img.shields.io/npm/dt/json-flex-db?logo=npm&style=flat-square)](https://npmjs.com/package/json-flex-db)

JsonFlexDB is a lightweight and versatile JSON-based database module for Node.js. It provides a simple yet powerful solution for handling data persistence in your applications. JsonFlexDB is suitable for a wide range of projects, from small-scale applications to large-scale systems.

## Features

- **Ease of Use:** JsonFlexDB offers a simple and intuitive API, making it easy for developers to perform CRUD operations on JSON-based data.

- **Flexible Queries:** Perform queries on your data using a flexible and powerful query syntax. JsonFlexDB supports both indexed and non-indexed queries for efficient data retrieval.

- **Async/Await Support:** Leverage the power of asynchronous programming with seamless async/await support for all database operations.

- **Visualization:** Visualize your data directly in the console using the built-in `visualize` method, making it easier to understand the structure of your stored data.

## Installation

To get started with JsonFlexDB, install it using npm:

```bash
npm install json-flex-db
```

## Usage

```javascript
const JsonFlexDB = require("json-flex-db");

// New Feature
// Optional: Define a schema for your data
const schema = {
  name: { type: "string", required: true },
  age: { type: "number" },
  email: { type: "string", validate: (value) => /\S+@\S+\.\S+/.test(value) },
};

// Initialize JsonFlexDB with the file path for your JSON data
const db = new JsonFlexDB("data.json", schema);

// Example: Insert a new document
const document1 = {
  _id: "1",
  name: "John Doe",
  age: 30,
  email: "john@gmail.com",
};
const document2 = {
  _id: "2",
  name: "Sam Wilson",
  age: 32,
  email: "sam@gmail.com",
};
(async () => {
  // Example: Insert Document1 and Document2
  await db.insert(document1);
  await db.insert(document2);

  // Example: Find documents based on a query
  const results = await db.find({ age: 30 });
  console.log("Results based on age:", results);

  // Example: Update documents based on a query
  const updateQuery = { age: 30 };
  const updates = { age: 31 };
  const numUpdated = await db.update(updateQuery, updates);
  console.log(`Updated ${numUpdated} documents`);

  // Example: Remove documents based on a query
  const removeQuery = { age: 31 };
  const numRemoved = await db.remove(removeQuery);
  console.log(`Removed ${numRemoved} documents`);

  // Example: Visualize DB in a Console table
  db.visualize();
})();
```

For more detailed usage instructions, consult the [Documentation](#documentation) section below.

## Documentation

### `JsonFlexDB(filePath, schema = {})`

Creates a new instance of JsonFlexDB.

- `filePath` (string): The file path where the JSON database is stored.
- `schema` (object, optional): The schema for validation (default is an empty object).

### `load()`

Loads data from the JSON file.

### `save()`

Saves data to the JSON file.

### `ensureLoaded()`

Ensures that data is loaded from the file.

### `createIndex(indexName)`

Creates an index for optimizing queries.

- `indexName` (string): The name of the index.

### `findOne(query)`

Finds a single document based on a query.

- `query` (object): The query object.

Returns: A promise that resolves to the matching document or null if not found.

### `getAutoIncrementId()`

Gets the next available auto-incremented ID.

Returns: A promise that resolves to the next available ID.

### `find(query, returnKeys = true)`

Finds matching elements in the data based on the provided query.

- `query` (object): The query object used to filter the data.
- `returnKeys` (boolean): Indicates whether to return the keys of the matching elements.

Returns: A promise that resolves to an array of matching documents.

### `insert(document)`

Inserts a document into the database.

- `document` (object): The document to insert.

Returns: A promise that resolves to the key of the inserted document.

### `update(query, updates)`

Updates documents based on a query.

- `query` (object): The query object.
- `updates` (object): The updates to apply.

Returns: A promise that resolves to the number of updated documents.

### `remove(query)`

Removes documents based on a query.

- `query` (object): The query object.

Returns: A promise that resolves to the number of removed documents.

### `getAll()`

Gets all documents in the database.

Returns: An object representing all documents in the database.

### `visualize()`

Visualizes the data in the console using `console.table`.

## Changelog

Refer to the [changelog](CHANGELOG.md) for a detailed history of changes made to JsonFlexDB.

## Contributing

Contributions are welcome!

## License

JsonFlexDB is [MIT licensed](LICENSE).

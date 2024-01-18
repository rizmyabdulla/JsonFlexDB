
# JsonFlexDB

JsonFlexDB is a simple Node.js module for basic CRUD operations using a JSON file as a data store. It provides a lightweight alternative to more robust database systems for small-scale applications.

## Installation

Install the JsonFlexDB module using npm:

```bash
npm install json-flex-db
```

## Usage

```javascript
const JsonFlexDB = require('json-flex-db');

// Create an instance of JsonFlexDB
const JsonFlexDB = new JsonFlexDB('/path/to/data.json');

// Ensure indexes are created (optional)
await JsonFlexDB.createIndex('category');
await JsonFlexDB.createIndex('status');

// Insert documents
const doc1 = { _id: '1', name: 'Document 1', category: 'A', status: 'Active' };
const doc2 = { _id: '2', name: 'Document 2', category: 'B', status: 'Inactive' };

await JsonFlexDB.insert(doc1);
await JsonFlexDB.insert(doc2);

// Query based on indexed fields
const results = await JsonFlexDB.find({ category: 'A' });
console.log('Results based on category index:', results);

// Update documents
await JsonFlexDB.update({ category: 'A' }, { status: 'Updated' });

// Remove documents
await JsonFlexDB.remove({ status: 'Inactive' });

// Visualize the data
JsonFlexDB.visualize();

// Export all data
const allData = JsonFlexDB.getAll();
console.log('All data:', allData);
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

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
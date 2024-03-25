const fs = require("fs").promises;

/**
 * A simple JSON-based database module for basic CRUD operations.
 * @class
 */
class JsonFlexDB {
  /**
   * Represents a JSON database.
   * @class
   * @param {string} filePath - The file path where the JSON database is stored.
   * @param {Object} [schema={}] - The schema for the JSON database.
   */
  constructor(filePath, schema = {}) {
    /**
     * The file path where the JSON database is stored.
     * @type {string}
     */
    this.filePath = filePath;

    /**
     * Indexes for optimizing queries.
     * @type {Object}
     */
    this.indexes = {};

    /**
     * The data loaded from the JSON file.
     * @type {?Object}
     */
    this.data = null;

    /**
     * The schema for the JSON database.
     * @type {Object}
     */
    this.schema = schema;

    /**
     * Indicates whether data has been loaded from the file.
     * @type {boolean}
     */
    this.isLoaded = false;
  }

  /**
   * Loads data from the JSON file.
   * @async
   * @throws {Error} If there's an issue loading data.
   */
  async load() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      this.data = JSON.parse(data);
      this.isLoaded = true;
    } catch (error) {
      if (error.code === "ENOENT") {
        this.data = {};
        this.isLoaded = true;
        await this.save();
      } else {
        throw new Error(
          `Failed to load data from ${this.filePath}: ${error.message}`
        );
      }
    }
  }

  /**
   * Saves data to the JSON file.
   * @async
   * @throws {Error} If there's an issue saving data.
   */
  async save() {
    try {
      const jsonData = JSON.stringify(this.data, null, 2);
      await fs.writeFile(this.filePath, jsonData, "utf-8");
    } catch (error) {
      throw new Error(
        `Failed to save data to ${this.filePath}: ${error.message}`
      );
    }
  }

  /**
   * Ensures that data is loaded from the file.
   * @async
   * @throws {Error} If there's an issue ensuring data is loaded.
   */
  async ensureLoaded() {
    if (!this.isLoaded) {
      await this.load();
    }
  }

  /**
   * Creates an index for optimizing queries.
   * @async
   * @param {string} indexName - The name of the index.
   * @throws {Error} If there's an issue creating the index.
   */
  async createIndex(indexName) {
    await this.ensureLoaded();

    if (!this.indexes[indexName]) {
      this.indexes[indexName] = {};

      for (const key in this.data) {
        const value = this.data[key][indexName];

        if (value !== undefined) {
          this.indexes[indexName][value] = this.indexes[indexName][value] || [];
          this.indexes[indexName][value].push(key);
        }
      }
    }
  }

  /**
   * Gets the next available auto-incremented ID.
   * @async
   * @returns {Promise<number>} A promise that resolves to the next available ID.
   */
  async getAutoIncrementId() {
    await this.ensureLoaded();

    let maxId = 0;
    for (const key in this.data) {
      const id = parseInt(key);
      if (!isNaN(id) && id > maxId) {
        maxId = id;
      }
    }

    return maxId + 1;
  }

  /**
   * Finds one matching element in the data based on the provided query.
   * @async
   * @param {object} query - The query object used to filter the data.
   * @returns {Promise<object>} A promise that resolves to a matching document or null if no matching document is found.
   * @throws {Error} If there's an issue executing the findOne operation.
   */

  async findOne(query) {
    try {
      await this.ensureLoaded();
      if (this.schema) {
        for (const key of Object.keys(query)) {
          const field = this.schema[key];
          if (!field) {
            continue;
          }
          if (typeof query[key] !== field.type) {
            throw new Error(
              `FindOne validation failed: Field '${key}' must be of type '${field.type}'.`
            );
          }
          if (
            field.validate &&
            typeof field.validate === "function" &&
            !field.validate(query[key])
          ) {
            throw new Error(
              `FindOne validation failed: Field '${key}' failed custom validation.`
            );
          }
        }
      }

      const keys = Object.keys(this.data);

      for (const key of keys) {
        let match = true;

        for (const queryKey in query) {
          if (this.indexes[queryKey]) {
            const values = Array.isArray(query[queryKey])
              ? query[queryKey]
              : [query[queryKey]];

            if (!values.includes(this.data[key][queryKey])) {
              match = false;
              break;
            }
          } else {
            if (this.data[key][queryKey] !== query[queryKey]) {
              match = false;
              break;
            }
          }
        }

        if (match) {
          return this.data[key];
        }
      }

      return null;
    } catch (error) {
      throw new Error(`Failed to execute findOne operation: ${error.message}`);
    }
  }

  /**
   * Finds all matching elements in the data based on the provided query.
   * @async
   * @param {object} query - The query object used to filter the data.
   * @param {boolean} [returnKeys=true] - Whether to return the keys of the matching documents or the documents themselves.
   * @returns {Promise<object[]>} A promise that resolves to an array of matching documents.
   * @throws {Error} If there's an issue executing the find operation.
   */
  async find(query, returnKeys = true) {
    try {
      await this.ensureLoaded();

      if (this.schema) {
        for (const key of Object.keys(query)) {
          const field = this.schema[key];

          if (!field) {
            continue;
          }
          if (typeof query[key] !== field.type) {
            throw new Error(
              `Find validation failed: Field '${key}' must be of type '${field.type}'.`
            );
          }

          if (
            field.validate &&
            typeof field.validate === "function" &&
            !field.validate(query[key])
          ) {
            throw new Error(
              `Find validation failed: Field '${key}' failed custom validation.`
            );
          }
        }
      }

      const results = [];
      const keys = Object.keys(this.data);

      for (const key of keys) {
        let match = true;

        for (const queryKey in query) {
          if (this.indexes[queryKey]) {
            const values = Array.isArray(query[queryKey])
              ? query[queryKey]
              : [query[queryKey]];

            if (!values.includes(this.data[key][queryKey])) {
              match = false;
              break;
            }
          } else {
            if (this.data[key][queryKey] !== query[queryKey]) {
              match = false;
              break;
            }
          }
        }

        if (match) {
          results.push(returnKeys ? key : this.data[key]);
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to execute find operation: ${error.message}`);
    }
  }

  /**
   * Inserts a document into the collection.
   *
   * @param {Object} document - The document to be inserted.
   * @return {Promise<string>} - A promise that resolves to the key of the inserted document.
   */
  async insert(document) {
    await this.ensureLoaded();
    if (this.schema && !this.validateDocument(document)) {
      for (const key of Object.keys(this.schema)) {
        const field = this.schema[key];
        if (field.required && !document.hasOwnProperty(key)) {
          throw new Error(`Validation error: Field '${key}' is required.`);
        }
        if (
          document.hasOwnProperty(key) &&
          typeof document[key] !== field.type
        ) {
          throw new Error(
            `Validation error: Field '${key}' must be of type '${field.type}'.`
          );
        }
        if (
          field.validate &&
          typeof field.validate === "function" &&
          !field.validate(document[key])
        ) {
          throw new Error(
            `Validation error: Field '${key}' failed custom validation.`
          );
        }
      }
    }

    const key = document._id || Math.random().toString(36).substring(7);
    this.data[key] = document;

    for (const indexName in this.indexes) {
      const value = document[indexName];
      if (value !== undefined) {
        this.indexes[indexName][value] = this.indexes[indexName][value] || [];
        this.indexes[indexName][value].push(key);
      }
    }

    await this.save();
    return key;
  }

  /**
   * Update records in the database based on the provided query and updates.
   *
   * @param {Object} query - The query object used to find records to update.
   * @param {Object} updates - The updates to apply to the found records.
   * @return {Promise<number>} The number of records successfully updated.
   */
  async update(query, updates) {
    await this.ensureLoaded();

    if (this.schema) {
      for (const key of Object.keys(updates)) {
        const field = this.schema[key];
        if (!field) {
          continue;
        }
        if (typeof updates[key] !== field.type) {
          throw new Error(
            `Update validation failed: Field '${key}' must be of type '${field.type}'.`
          );
        }
        if (
          field.validate &&
          typeof field.validate === "function" &&
          !field.validate(updates[key])
        ) {
          throw new Error(
            `Update validation failed: Field '${key}' failed custom validation.`
          );
        }
      }
    }

    const results = await this.find(query);

    for (const result of results) {
      if (this.data[result]) {
        Object.assign(this.data[result], updates);
      }
    }

    await this.save();
    return results.length;
  }

  /**
   * Removes documents based on a query.
   * @async
   * @param {Object} query - The query object.
   * @returns {Promise<number>} A promise that resolves to the number of removed documents.
   * @throws {Error} If there's an issue executing the remove operation.
   */

  async remove(query) {
    await this.ensureLoaded();

    const results = await this.find(query);

    for (const result of results) {
      console.log(result);
      delete this.data[result];
    }

    await this.save();
    return results.length;
  }

  /**
   * Gets all documents in the database.
   * @returns {Object} An object representing all documents in the database.
   */

  getAll() {
    return this.data;
  }

  /**
   * Validates a document against a schema.
   *
   * @param {Object} document - The document to be validated.
   * @return {boolean} Returns true if the document is valid, false otherwise.
   */
  validateDocument(document) {
    if (!this.schema) {
      return true;
    }

    const schemaKeys = Object.keys(this.schema);
    const documentKeys = Object.keys(document);

    for (const key of schemaKeys) {
      if (this.schema[key].required && !documentKeys.includes(key)) {
        return false;
      }
    }

    for (const key of documentKeys) {
      const schema = this.schema[key];
      if (schema) {
        if (typeof document[key] !== schema.type) {
          return false;
        }
        if (schema.validate && typeof schema.validate === "function") {
          if (!schema.validate(document[key])) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Visualizes the data in the console using `console.table`.
   */
  visualize() {
    console.table(Object.values(this.data));
  }
}

module.exports = JsonFlexDB;

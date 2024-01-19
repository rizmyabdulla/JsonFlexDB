const fs = require("fs").promises;

/**
 * A simple JSON-based database module for basic CRUD operations.
 * @class
 */
class JsonFlexDB {
  /**
   * Creates an instance of JsonFlexDB.
   * @constructor
   * @param {string} filePath - The file path where the JSON database is stored.
   */
  constructor(filePath) {
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
   * Finds a single document based on a query.
   * @async
   * @param {Object} query - The query object.
   * @returns {Promise<Object|null>} A promise that resolves to the matching document or null if not found.
   * @throws {Error} If there's an issue executing the findOne operation.
   */
  async findOne(query) {
    try {
      await this.ensureLoaded();

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

      return null; // Return null if no matching document is found
    } catch (error) {
      throw new Error(`Failed to execute findOne operation: ${error.message}`);
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
   * Finds matching elements in the data based on the provided query.
   * @async
   * @param {object} query - The query object used to filter the data.
   * @param {boolean} returnKeys - Indicates whether to return the keys of the matching elements.
   * @returns {Promise<Array>} A promise that resolves to an array of matching documents.
   * @throws {Error} If there's an issue executing the find operation.
   */
  async find(query, returnKeys = true) {
    try {
      await this.ensureLoaded();

      const results = [];
      const keys = Object.keys(this.data);

      // If there are indexed fields in the query, use the index
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
   * Inserts a document into the database.
   * @async
   * @param {Object} document - The document to insert.
   * @returns {Promise<string>} A promise that resolves to the key of the inserted document.
   * @throws {Error} If there's an issue executing the insert operation.
   */

  async insert(document) {
    await this.ensureLoaded();

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
   * Updates documents based on a query.
   * @async
   * @param {Object} query - The query object.
   * @param {Object} updates - The updates to apply.
   * @returns {Promise<number>} A promise that resolves to the number of updated documents.
   * @throws {Error} If there's an issue executing the update operation.
   */

  async update(query, updates) {
    await this.ensureLoaded();

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
   * Visualizes the data in the console using `console.table`.
   */
  visualize() {
    console.table(Object.values(this.data));
  }
}

module.exports = JsonFlexDB;

const fs = require("fs").promises;
const path = require("path");

/**
 * Simple JSON-based database module for basic CRUD operations.
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
  async loadData() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      this.data = JSON.parse(data);
      this.isLoaded = true;
    } catch (error) {
      if (error.code === "ENOENT") {
        // If the file doesn't exist, initialize with an empty object
        this.data = {};
        this.isLoaded = true;
        await this.saveData();
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
  async saveData() {
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
      try {
        await this.loadData();
      } catch (error) {
        throw new Error(`Failed to ensure data is loaded: ${error.message}`);
      }
    }
  }

  /**
   * Creates an index for optimizing queries.
   * @async
   * @param {string} indexName - The name of the index.
   * @throws {Error} If there's an issue creating the index.
   */
  async createIndex(indexName) {
    try {
      await this.ensureLoaded();

      if (!this.indexes[indexName]) {
        this.indexes[indexName] = {};

        // Build the index
        for (const key in this.data) {
          const value = this.data[key][indexName];

          if (value !== undefined) {
            if (!this.indexes[indexName][value]) {
              this.indexes[indexName][value] = [];
            }
            this.indexes[indexName][value].push(key);
          }
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to create index '${indexName}': ${error.message}`
      );
    }
  }

  /**
   * Finds documents based on a query.
   * @async
   * @param {Object} query - The query object.
   * @returns {Promise<Array>} A promise that resolves to an array of matching documents.
   * @throws {Error} If there's an issue executing the find operation.
   */
  async find(query) {
    try {
      await this.ensureLoaded();

      const results = [];
      const keys = Object.keys(query);

      // If there are indexed fields in the query, use the index
      for (const key of keys) {
        if (this.indexes[key]) {
          const values = Array.isArray(query[key]) ? query[key] : [query[key]];

          for (const value of values) {
            if (this.indexes[key][value]) {
              results.push(...this.indexes[key][value]);
            }
          }
        }
      }

      // Remove duplicates
      const uniqueResults = Array.from(new Set(results));

      // Filter results based on non-indexed fields
      const filteredResults = uniqueResults.filter((key) => {
        for (const queryKey of keys) {
          if (
            !this.indexes[queryKey] &&
            this.data[key][queryKey] !== query[queryKey]
          ) {
            return false;
          }
        }
        return true;
      });

      // Return the actual data
      return filteredResults.map((key) => this.data[key]);
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
    try {
      await this.ensureLoaded();

      const key = document._id || Math.random().toString(36).substring(7);
      this.data[key] = document;

      // Update indexes
      for (const indexName in this.indexes) {
        const value = document[indexName];
        if (value !== undefined) {
          if (!this.indexes[indexName][value]) {
            this.indexes[indexName][value] = [];
          }
          this.indexes[indexName][value].push(key);
        }
      }

      await this.saveData();
      return key;
    } catch (error) {
      throw new Error(`Failed to execute insert operation: ${error.message}`);
    }
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
    try {
      await this.ensureLoaded();

      // Find documents based on the query
      const results = await this.find(query);

      // Update documents if found
      for (const result of results) {
        if (this.data[result]) {
          Object.assign(this.data[result], updates);
        }
      }

      // Save the updated data
      await this.saveData();

      return results.length;
    } catch (error) {
      throw new Error(`Failed to execute update operation: ${error.message}`);
    }
  }

  /**
   * Removes documents based on a query.
   * @async
   * @param {Object} query - The query object.
   * @returns {Promise<number>} A promise that resolves to the number of removed documents.
   * @throws {Error} If there's an issue executing the remove operation.
   */
  async remove(query) {
    try {
      await this.ensureLoaded();

      const results = await this.find(query);

      for (const result of results) {
        delete this.data[result];
      }

      await this.saveData();
      return results.length;
    } catch (error) {
      throw new Error(`Failed to execute remove operation: ${error.message}`);
    }
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

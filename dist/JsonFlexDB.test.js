const fs = require("fs").promises;
const JsonFlexDB = require("./JsonFlexDB");

describe("JsonFlexDB", () => {
  const testFilePath = "testData.json";

  beforeEach(async () => {
    await fs.writeFile(testFilePath, "{}", "utf-8");
  });

  afterEach(async () => {
    await fs.unlink(testFilePath);
  });

  it("should insert and find a document", async () => {
    const db = new JsonFlexDB(testFilePath);

    const document = {
      _id: "1",
      name: "Test Document",
      category: "Test Category",
    };

    await db.insert(document);

    const foundDocument = await db.findOne({ _id: "1" });

    // Assertions
    expect(foundDocument).toEqual(document);
  });

  it("should update a document", async () => {
    const db = new JsonFlexDB(testFilePath);

    const initialDocument = {
      _id: "1",
      name: "Test Document",
      category: "Test Category",
    };

    await db.insert(initialDocument);

    const updates = { category: "Updated Category" };
    await db.update({ _id: "1" }, updates);

    const updatedDocument = await db.findOne({ _id: "1" });

    expect(updatedDocument).toEqual({ ...initialDocument, ...updates });
  });

  it("should remove a document", async () => {
    const db = new JsonFlexDB(testFilePath);

    const document = {
      _id: "1",
      name: "Test Document",
      category: "Test Category",
    };

    await db.insert(document);

    await db.remove({ _id: "1" });


    const foundDocument = await db.findOne({ _id: "1" });

    expect(foundDocument).toBeNull();
  });

  it("should create and use an index", async () => {
    const db = new JsonFlexDB(testFilePath);

    const document = {
      _id: "1",
      name: "Test Document",
      category: "Test Category",
    };

    await db.insert(document);

    await db.createIndex("category");

    const results = await db.find({ category: "Test Category" });

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(document._id);
  });
});

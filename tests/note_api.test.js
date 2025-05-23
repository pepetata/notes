const assert = require("node:assert");
const { test, after, beforeEach, before, describe } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const Note = require("../models/note");
const User = require("../models/user");

const api = supertest(app);
const username = "flavio";
const password = "admin";
let token, loggedUser;

describe("Test NOTES ------------------", () => {
  // before(async () => {

  // });

  beforeEach(async () => {
    // console.log(
    //   `============================================================`,
    //   helper.initialNotes
    // );
    // if (
    //   !Object.prototype.hasOwnProperty.call(helper.initialNotes[0], "userName")
    // )
    //   // the user is already in helper.initialNotes. No need to process it again, return
    //   return;

    await Note.deleteMany({});
    await User.deleteMany({});
    // add all users
    // await User.insertMany(helper.initialUsers);
    for (const user of helper.initialUsers) {
      await api.post("/api/users").send(user);
    }

    // add all notes
    for (const note of helper.initialNotes) {
      const user = await User.findOne({ name: note.userName });
      note.user = user.id;
    }
    // console.log(
    //   `helper.initialNotes============================= `,
    //   helper.initialNotes
    // );

    await Note.insertMany(helper.initialNotes);

    // login to the user and set token
    token = await helper.loginUser(api, username, password);
    // get the user
    loggedUser = await User.findOne({ username: username });
  });

  describe("viewing notes", () => {
    test("notes are returned as json", async () => {
      await api
        .get("/api/notes")
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    test("all notes are returned", async () => {
      const response = await api.get("/api/notes");
      assert.strictEqual(response.body.length, helper.initialNotes.length);
    });

    test("a specific note is within the returned notes", async () => {
      const response = await api.get("/api/notes");

      const contents = response.body.map((e) => e.content);
      assert(contents.includes("HTML is easy"));
    });
  });

  describe("viewing a specific note", () => {
    test("succeeds with a valid id", async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToView = notesAtStart[0];

      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      // Convert user ObjectId to string if it exists
      const expectedNote = { ...noteToView, user: noteToView.user?.toString() };
      assert.deepStrictEqual(resultNote.body, expectedNote);
    });

    test("fails with statuscode 404 if note does not exist", async () => {
      const validNonexistingId = await helper.nonExistingId();

      await api.get(`/api/notes/${validNonexistingId}`).expect(404);
    });

    test("fails with statuscode 400 id is invalid", async () => {
      const invalidId = "5a3d5da59070081a82a3445";

      await api.get(`/api/notes/${invalidId}`).expect(400);
    });
  });

  describe("addition of a new note", () => {
    test("succeeds with valid data", async () => {
      const newNote = {
        content: "async/await simplifies making async calls",
        important: true,
        user: loggedUser.id,
      };

      await api
        .post("/api/notes")
        .auth(token, { type: "bearer" })
        .send(newNote)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const notesAtEnd = await helper.notesInDb();
      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1);

      const contents = notesAtEnd.map((n) => n.content);
      assert(contents.includes("async/await simplifies making async calls"));
    });

    test("fails with status code 400 if data is missing", async () => {
      const newNote = { important: true, user: loggedUser.id };
      await api
        .post("/api/notes")
        .auth(token, { type: "bearer" })
        .send(newNote)
        .expect(400);

      const notesAtEnd = await helper.notesInDb();
      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length);
    });

    test("fails to add note invalid token", async () => {
      const newNote = {
        content: "Invalid token",
        important: true,
        user: loggedUser.id,
      };
      await api
        .post("/api/notes")
        .auth(token + "invalid", { type: "bearer" })
        .send(newNote)
        .expect(401);
    });

    test("returns 401 if no token is provided", async () => {
      const newNote = {
        content: "No token",
        important: true,
        user: loggedUser.id,
      };
      await api.post("/api/notes").send(newNote).expect(401);
    });
  });

  describe("update of a  note", () => {
    test("updates the 'important' field of an existing note", async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToView = notesAtStart[0];

      const changeBody = { important: true };
      await api
        .put(`/api/notes/${noteToView.id}`)
        .auth(token, { type: "bearer" })
        .send(changeBody)
        .expect(200);
      // get the note from db and test it
      const updated = await api
        .get(`/api/notes/${noteToView.id}`)
        .auth(token, { type: "bearer" });
      assert.strictEqual(updated.body.important, true);
    });

    test("returns 404 when updating non-existent note", async () => {
      const validNonexistingId = await helper.nonExistingId();
      await api
        .put(`/api/notes/${validNonexistingId}`)
        .auth(token, { type: "bearer" })
        .send({ important: true })
        .expect(404);
    });

    test("fails to update note without token", async () => {
      const newNote = {
        content: "new to for test",
        important: false,
        user: loggedUser.id,
      };
      // add the note
      const response = await api
        .post("/api/notes")
        .auth(token, { type: "bearer" })
        .send(newNote)
        .expect(201)
        .expect("Content-Type", /application\/json/);
      const changeBody = { important: true };
      await api
        .put(`/api/notes/${response.body.id}`)
        .send(changeBody)
        .expect(401);
    });
  });

  describe("deletion of a note", () => {
    test("succeeds with status code 204 if id is valid", async () => {
      const notesAtStart = await helper.notesInDb();
      const noteToDelete = notesAtStart[0];

      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .auth(token, { type: "bearer" })
        .expect(204);

      const notesAtEnd = await helper.notesInDb();

      const contents = notesAtEnd.map((n) => n.content);
      assert(!contents.includes(noteToDelete.content));

      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});

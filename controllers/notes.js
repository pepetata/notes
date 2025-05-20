const notesRouter = require("express").Router();
const Note = require("../models/note");

/////////////////////////////////////////////////////  gets
notesRouter.get("/", async (request, response) => {
  const notes = await Note.find({});
  response.json(notes);
});

notesRouter.get("/:id", async (request, response) => {
  const note = await Note.findById(request.params.id);
  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

/////////////////////////////////////////////////////  posts
notesRouter.post("/", async (request, response) => {
  const body = request.body;

  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  });

  const savedNote = await note.save();
  response.status(201).json(savedNote);
});

/////////////////////////////////////////////////////  put
notesRouter.put("/:id", async (request, response) => {
  const id = request.params.id;
  const body = request.body;
  const note = new Note({
    content: body.content,
    important: body.important || false,
    id: body.id,
  });
  const changedNote = await note.updateOne({ id: id });
  response.json(changedNote);
});

/////////////////////////////////////////////////////  deletes
notesRouter.delete("/:id", async (request, response) => {
  const deletedNote = await Note.findByIdAndDelete(request.params.id);
  if (!deletedNote) {
    // throw new Error("This will be caught by Express 5 error handler");
    return response.status(404).json({ error: "note not found" });
  }
  response.status(204).end();
});

module.exports = notesRouter;

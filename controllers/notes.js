const notesRouter = require("express").Router();
const jwt = require("jsonwebtoken");

const Note = require("../models/note");
const User = require("../models/user");

/////////////////////////////////////////////////////  tpken
const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

/////////////////////////////////////////////////////  gets
notesRouter.get("/", async (request, response) => {
  const notes = await Note.find({}).populate("user", { username: 1, name: 1 });
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
  // console.log(`======================= notesRouter.post body`, request.body);
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }
  // console.log(`==========  decodedToken`, decodedToken);
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return response.status(400).json({ error: "userId missing or not valid" });
  }

  const body = request.body;
  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user._id,
  });

  const savedNote = await note.save();
  user.notes = user.notes.concat(savedNote._id);
  await user.save();

  response.status(201).json(savedNote);
});

/////////////////////////////////////////////////////  put
notesRouter.put("/:id", async (request, response) => {
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return response.status(400).json({ error: "userId missing or not valid" });
  }

  const updatedNote = await Note.findByIdAndUpdate(
    request.params.id,
    request.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedNote) {
    return response.status(404).json({ error: "note not found" });
  }

  response.json(updatedNote);
});

/////////////////////////////////////////////////////  deletes
notesRouter.delete("/:id", async (request, response) => {
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: "token invalid" });
  }
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return response.status(400).json({ error: "userId missing or not valid" });
  }

  const deletedNote = await Note.findByIdAndDelete(request.params.id);
  if (!deletedNote) {
    // throw new Error("This will be caught by Express 5 error handler");
    return response.status(404).json({ error: "note not found" });
  }
  response.status(204).end();
});

module.exports = notesRouter;

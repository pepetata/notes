require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");

const Note = require("./models/note");

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
// app.use(requestLogger)
morgan.token("body", (req) => JSON.stringify(req.body));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// ********************************************************** Notes
/////////////////////////////////////////////////////  gets
app.get("/", (request, response) => {
  response.send("<h1>Hello NOTES World!!!!</h1>");
});

app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.get("/api/notes/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
  // .catch(error => {
  //   console.log(error)
  //    response.status(400).send({ error: 'malformatted id' })
  // })
});

/////////////////////////////////////////////////////  posts
app.post("/api/notes", (request, response, next) => {
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

  console.log("note to save!", note);

  note
    .save()
    .then((result) => {
      console.log("note saved!");
      // mongoose.connection.close()
      response.json(note);
    })
    .catch((error) => next(error));

  // notes = notes.concat(note);
});

/////////////////////////////////////////////////////  put
app.put("/api/notes/:id", (request, response, next) => {
  const id = request.params.id;
  const body = request.body;
  console.log("id-------", id, body);
  const note = new Note({
    content: body.content,
    important: body.important || false,
    id: body.id,
  });
  console.log("note to save!-------", note);
  note
    .updateOne({ id: id })
    .then((result) => {
      console.log("note saved!");
      // mongoose.connection.close()
    })
    .catch((error) => next(error));

  // notes = notes.concat(note);
  response.json(note);
});

const generateNotesId = () => {
  const maxId =
    notes.length > 0 ? Math.max(...notes.map((n) => Number(n.id))) : 0;
  return String(maxId + 1);
};

/////////////////////////////////////////////////////  deletes
app.delete("/api/notes/:id", (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

///////////////////////////////////////////////////// unknown Endpoint
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);

///////////////////////////////////////////////////// error handler
const errorHandler = (error, request, response, next) => {
  console.error('errorHandler ->',error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "mal formatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};
// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);

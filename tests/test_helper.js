const Note = require("../models/note");
const User = require("../models/user");

////////////////////////////////////////////// notes
const initialNotes = [
  {
    content: "HTML is easy",
    important: false,
    userName: "Flavio",
  },
  {
    content: "Browser can execute only JavaScript",
    important: true,
    userName: "Flavio",
  },
  {
    content: "NodeJS is not that easy",
    important: true,
    userName: "John Smith",
  },
];

const nonExistingId = async () => {
  const note = new Note({ content: "willremovethissoon" });
  await note.save();
  await note.deleteOne();

  return note._id.toString();
};

const notesInDb = async () => {
  const notes = await Note.find({});
  return notes.map((note) => note.toJSON());
};

//////////////////////////////////////////// users
const initialUsers = [
  {
    username: "root",
    name: "Superuser",
    password: "salainen",
  },
  {
    username: "flavio",
    name: "Flavio",
    password: "admin",
  },
  {
    username: "john",
    name: "John Smith",
    password: "johnny",
  },
];

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

const nonExistingUserId = async () => {
  const user = new User({
    username: "willremovethissoon",
    name: "will remove",
    password: "remove",
  });
  await user.save();
  await user.deleteOne();

  return user._id.toString();
};

async function loginUser(api, username, password) {
  const resp = await api.post("/api/login").send({ username, password });
  return resp.body.token;
}

module.exports = {
  initialNotes,
  nonExistingId,
  initialUsers,
  notesInDb,
  nonExistingUserId,
  usersInDb,
  loginUser,
};

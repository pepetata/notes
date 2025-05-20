const app = require('./app') // the actual Express application
const config = require('./utils/config')
const logger = require('./utils/logger')

app.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})

//
// // require("dotenv").config();
// const express = require("express");
// const app = express();
// const morgan = require("morgan");
// const cors = require("cors");
// const mongoose = require("mongoose");

// app.use(express.static("dist"));
// app.use(cors());
// app.use(express.json());
// // app.use(requestLogger)
// morgan.token("body", (req) => JSON.stringify(req.body));
// app.use(
//   morgan(":method :url :status :res[content-length] - :response-time ms :body")
// );






// ///////////////////////////////////////////////////// unknown Endpoint
// const unknownEndpoint = (request, response) => {
//   response.status(404).send({ error: "unknown endpoint" });
// };
// app.use(unknownEndpoint);

// ///////////////////////////////////////////////////// error handler
// const errorHandler = (error, request, response, next) => {
//   console.error('errorHandler ->',error.message);

//   if (error.name === "CastError") {
//     return response.status(400).send({ error: "mal formatted id" });
//   } else if (error.name === "ValidationError") {
//     return response.status(400).json({ error: error.message });
//   }

//   next(error);
// };
// // this has to be the last loaded middleware, also all the routes should be registered before this!
// app.use(errorHandler);

// const PORT = process.env.PORT || 3001;
// app.listen(PORT);
// console.log(`Server running on port ${PORT}`);

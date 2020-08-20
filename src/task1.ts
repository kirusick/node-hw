import express from "express";
import bodyParser from "body-parser";
import Joi from "@hapi/joi";
import {
  ContainerTypes,
  ValidatedRequest,
  ValidatedRequestSchema,
  createValidator,
} from "express-joi-validation";

const app = express();
const validator = createValidator();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

type User = {
  id: string;
  login: string;
  password: string;
  age: number;
  isDeleted: boolean;
};

const users: User[] = [];

const getUser = (requestId: string): User | void => {
  const user = users.find(
    ({ id, isDeleted }) => id === requestId && !isDeleted
  );

  return user;
};

const getUserByLogin = (searchLogin: string): User | void => {
  const user = users.find(
    ({ login, isDeleted }) => login === searchLogin && !isDeleted
  );

  return user;
};

const userSchema = Joi.object({
  id: Joi.string().required(),
  login: Joi.string().required(),
  password: Joi.string()
    .required()
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{2,}$/,
      "Password must contain letters and numbers"
    ),
  age: Joi.number().required().min(4).max(130),
  isDeleted: Joi.bool().required(),
});

interface UserBodySchema extends ValidatedRequestSchema {
  [ContainerTypes.Body]: User;
}

app
  .route("/users")
  .get((req, res) => {
    res.send(users);
  })
  .post(
    validator.body(userSchema),
    (req: ValidatedRequest<UserBodySchema>, res) => {
      const { login, id } = req.body;

      if (getUserByLogin(login)) {
        res.status(400).send("User with this login is already exist");
      }
      if (getUser(id)) {
        res.status(400).send("User with this id is already exist");
      } else {
        users.push(req.body);

        res.sendStatus(200);
      }
    }
  );

app
  .route("/users/:id")
  .get((req, res) => {
    const requestId = req.params.id;

    const user = getUser(requestId);

    if (user) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  })
  .put(
    validator.body(userSchema),
    (req: ValidatedRequest<UserBodySchema>, res) => {
      const requestId = req.params.id;

      const user = getUser(requestId);

      if (user) {
        const { login, id } = req.body;
        if (user.login !== login && getUserByLogin(login)) {
          res.status(400).send("User with this login is already exist");
        }
        if (user.id !== id && getUser(id)) {
          res.status(400).send("User with this id is already exist");
        }

        Object.entries(req.body).forEach(([key, value]) => {
          user[key] = value;
        });

        res.send(user);
      } else {
        res.sendStatus(404);
      }
    }
  )
  .delete((req, res) => {
    const requestId = req.params.id;

    const user = getUser(requestId);

    if (user) {
      user.isDeleted = true;

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  });

const autosuggestQuerySchema = Joi.object({
  loginSubstring: Joi.string().required(),
  limit: Joi.number().required(),
});

interface AutoSuggestSchema extends ValidatedRequestSchema {
  [ContainerTypes.Query]: {
    loginSubstring: string;
    limit: number;
  };
}

app.get(
  "/getAutoSuggestUsers",
  validator.query(autosuggestQuerySchema),
  (req: ValidatedRequest<AutoSuggestSchema>, res) => {
    const { loginSubstring, limit } = req.query;

    const suggestedUsers = users.filter(({ login = "" }) =>
      login.includes(loginSubstring)
    );

    res.send(suggestedUsers.slice(0, limit));
  }
);

app.listen(port);

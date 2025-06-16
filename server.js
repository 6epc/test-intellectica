const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

// Необходимо для чтения тела POST-запроса
server.use(jsonServer.bodyParser);

// Включить CORS
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// Перехватываем стандартный POST /users
server.post('/users', (req, res, next) => {
  const { email } = req.body;
  // Проверка дубликата
  if (router.db.get('users').find({ email }).value()) {
    // return res.status(400).json({ error: 'Этот email уже зарегистрирован' });

    const userExists = router.db.get('users').find({ email }).value();
    if (userExists) {
      return res.status(400).json({
        error: 'email_exists',
        message: 'Этот email уже зарегистрирован'
      });
    }
  }
  // Добавляем timestamp
  req.body.createdAt = new Date().toISOString();
  // Продолжаем стандартную обработку json-server
  next();
});

server.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = router.db.get("users").find({ email, password }).value();

  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: "Неверный email или пароль" });
  }
});

server.post("/requests", (req, res, next) => {
  const request = req.body;
  if (!request.visitorName || !request.visitDate) {
    return res.status(400).json({ error: "Не заполнены обязательные поля" });
  }
  request.status = "в обработке";
  request.createdAt = new Date().toISOString();
  next();
});

// Эмуляция полного цикла согласования
server.patch('/requests/:id', (req, res, next) => {
  const requestId = +req.params.id;
  const db = router.db;
  const request = db.get('requests').find({ id: requestId }).value();

  // Только для заявок в статусе "в обработке"
  if (request.status === "в обработке") {
    setTimeout(() => {
      req.body.status = "на согласовании";

      setTimeout(() => {
        db.get('requests')
          .find({ id: requestId })
          .assign({
            status: Math.random() > 0.3 ? "пропуск готов" : "отклонена",
            updatedAt: new Date().toISOString()
          })
          .write();
      }, 2000);
      next();
    }, 1000);
  } else {
    next(); // Пропускаем другие статусы
  }
});

server.use(middlewares);
server.use(router);
server.listen(3000, () => {
  console.log("JSON Server is running on http://localhost:3000");
});

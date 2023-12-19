import http from 'node:http';
import { json } from './middlewares/json.js';
import { routes } from './routes.js'

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  await json(req, res)

  const route = routes.find(route => {
    return route.method === method && route.path.test(url)
  })

  if (route) {
    const routeParams = req.url.match(route.path)

    console.log(routeParams)

    return route.handler(req, res)
  }

  res.writeHead(404).end();
});

const port = 3333;

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
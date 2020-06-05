import express from 'express';

const routes = express.Router();

routes.get('/user', (req, res) => {
  res.json(['User', 'User', 'User'])
})

export default routes;
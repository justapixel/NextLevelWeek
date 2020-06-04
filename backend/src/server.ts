import express from 'express';

const app = express();

app.get('/user', (req, res) => {
  res.json(['User', 'User', 'User'])
})

app.listen(3333);
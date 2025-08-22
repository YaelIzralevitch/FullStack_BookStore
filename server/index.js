process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

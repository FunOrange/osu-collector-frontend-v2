const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Transfer-Encoding': 'chunked', // important for streaming
  });

  // 0s: start outer div
  res.write('<div>\n');

  // 1s: ProductDetails
  setTimeout(() => {
    res.write('  <div>ProductDetails</div>\n');
  }, 1000);

  // 2s: Reviews
  setTimeout(() => {
    res.write('  <div>Reviews</div>\n');
  }, 2000);

  // 3s: Recommendations + close outer div
  setTimeout(() => {
    res.write('  <div>Recommendations</div>\n');
    res.write('</div>\n');
    res.end();
  }, 3000);
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

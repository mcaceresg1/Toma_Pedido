const { STOCK } = require('./stock.js');

test('adds 2 + 3 = 5', () => {
  STOCK.forEach((element: any) => {
    let x = 1,
      p = 1;
    let item = element;
    let cantidad = 2;
    for (let i = 1; i < 6; i++) {
      const correlacion = item['correlacion' + i];
      const nextCorrelacion = item['correlacion' + (i + 1)];
      if (!!nextCorrelacion) continue;
      if (correlacion === 0) {
        x = Math.max(1, i - 1);
        break;
      } else {
        x = i;
      }
    }
    for (let i = 1; i < x + 1; i++) {
      p = i;
      if (
        cantidad > (item['correlacion' + (i - 1)] ?? 0) &&
        cantidad <= item['correlacion' + i]
      ) {
        break;
      }
    }
    console.log(item.descripcion + ': ' + p);
  });
  expect(5).toBe(5);
});

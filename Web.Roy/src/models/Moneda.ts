export type Moneda = {
  id: string;
  value?: string;
  abr?: string;
};

export type Precio = {
  name: string;
  value: string;
};

export const DEFAULT_PRECIOS: Precio[] = [
  {
    name: 'Precio 1',
    value: '1',
  },
  {
    name: 'Precio 2',
    value: '2',
  },
  {
    name: 'Precio 3',
    value: '3',
  },
  {
    name: 'Precio 4',
    value: '4',
  },
  {
    name: 'Precio 5',
    value: '5',
  },
];

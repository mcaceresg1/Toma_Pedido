export interface Zona {
  zonaCodigo: string;
  descripcion: string;
  corto?: string;
}

export interface ZonaCreateDto {
  zonaCodigo: string;
  descripcion: string;
  corto?: string;
}

export interface ZonaUpdateDto {
  descripcion: string;
  corto?: string;
}


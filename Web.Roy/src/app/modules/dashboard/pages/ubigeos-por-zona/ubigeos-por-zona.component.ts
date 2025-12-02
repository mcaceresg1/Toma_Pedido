import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ZonaService } from '../../services/zona.service';
import { UbigeoService } from '../../services/ubigeo.service';
import { Zona } from '../../../../../models/Zona';
import { Ubigeo } from '../../../../../models/Ubigeo';

@Component({
  selector: 'app-ubigeos-por-zona',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ubigeos-por-zona.component.html',
  styleUrls: ['./ubigeos-por-zona.component.scss']
})
export class UbigeosPorZonaComponent implements OnInit {
  zonas: Zona[] = [];
  ubigeos: Ubigeo[] = [];
  ubigeosFiltrados: Ubigeo[] = [];
  ubigeosSeleccionados: Set<string> = new Set();
  zonaSeleccionada: string | null = null;
  
  loading = false;
  error: string | null = null;
  success: string | null = null;
  
  // Filtro de ubigeos
  filtroUbigeo: string = '';

  constructor(
    private zonaService: ZonaService,
    private ubigeoService: UbigeoService
  ) {}

  ngOnInit(): void {
    this.loadZonas();
    this.loadUbigeos();
  }

  // ========== ZONAS ==========
  loadZonas(): void {
    this.loading = true;
    this.error = null;
    this.zonaService.getAll().subscribe({
      next: (zonas) => {
        this.zonas = zonas;
        // Seleccionar la primera zona por defecto si hay zonas disponibles
        if (zonas.length > 0 && !this.zonaSeleccionada) {
          this.zonaSeleccionada = zonas[0].zonaCodigo;
          this.establecerFiltroPorZona();
          this.loadUbigeosByZona();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar zonas: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  // ========== UBIGEOS POR ZONA ==========
  loadUbigeos(): void {
    this.loading = true;
    this.error = null;
    this.ubigeoService.getAll().subscribe({
      next: (ubigeos) => {
        this.ubigeos = ubigeos;
        // Aplicar filtro y ordenamiento
        this.filtrarUbigeos();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar ubigeos: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  onZonaChange(): void {
    if (this.zonaSeleccionada) {
      // Establecer filtro según la descripción de la zona
      this.establecerFiltroPorZona();
      this.loadUbigeosByZona();
    } else {
      this.ubigeosSeleccionados.clear();
      this.filtroUbigeo = '';
      this.filtrarUbigeos();
    }
  }

  establecerFiltroPorZona(): void {
    if (!this.zonaSeleccionada) {
      this.filtroUbigeo = '';
      return;
    }

    // Buscar la zona en el array para obtener su descripción
    const zona = this.zonas.find(z => z.zonaCodigo === this.zonaSeleccionada);
    if (!zona) {
      this.filtroUbigeo = '';
      return;
    }

    const descripcion = zona.descripcion.toUpperCase();
    
    // Si la descripción contiene "LIMA", filtrar por "LIMA, LIMA"
    if (descripcion.includes('LIMA')) {
      this.filtroUbigeo = 'LIMA, LIMA';
    }
    // Si la descripción contiene "CALLAO", filtrar por "CALLAO"
    else if (descripcion.includes('CALLAO')) {
      this.filtroUbigeo = 'CALLAO';
    }
    // Si no coincide con ninguno, dejar el filtro vacío
    else {
      this.filtroUbigeo = '';
    }
  }

  loadUbigeosByZona(): void {
    if (!this.zonaSeleccionada) {
      this.ubigeosSeleccionados.clear();
      // Reordenar después de limpiar selección
      this.filtrarUbigeos();
      return;
    }

    this.loading = true;
    this.error = null;
    this.ubigeoService.getUbigeosByZona(this.zonaSeleccionada).subscribe({
      next: (ubigeosCodigos) => {
        this.ubigeosSeleccionados = new Set(ubigeosCodigos);
        // Reordenar después de cargar los ubigeos seleccionados
        this.filtrarUbigeos();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar ubigeos de la zona: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  toggleUbigeo(ubigeoCodigo: string): void {
    if (this.ubigeosSeleccionados.has(ubigeoCodigo)) {
      this.ubigeosSeleccionados.delete(ubigeoCodigo);
    } else {
      this.ubigeosSeleccionados.add(ubigeoCodigo);
    }
    // Reordenar después de cambiar la selección
    this.filtrarUbigeos();
  }

  isUbigeoSeleccionado(ubigeoCodigo: string): boolean {
    return this.ubigeosSeleccionados.has(ubigeoCodigo);
  }

  filtrarUbigeos(): void {
    const filtro = this.filtroUbigeo.toLowerCase().trim();
    let resultado: Ubigeo[];

    if (!filtro) {
      resultado = [...this.ubigeos];
    } else {
      resultado = this.ubigeos.filter(ubigeo => {
        // Buscar en código
        if (ubigeo.ubigeo.toLowerCase().includes(filtro)) {
          return true;
        }

        // Buscar en campos individuales
        if (ubigeo.distrito.toLowerCase().includes(filtro) ||
            ubigeo.provincia.toLowerCase().includes(filtro) ||
            ubigeo.departamento.toLowerCase().includes(filtro)) {
          return true;
        }

        // Buscar en el formato completo mostrado: "distrito, provincia, departamento"
        const formatoCompleto = `${ubigeo.distrito}, ${ubigeo.provincia}, ${ubigeo.departamento}`.toLowerCase();
        if (formatoCompleto.includes(filtro)) {
          return true;
        }

        return false;
      });
    }

    // Ordenar: primero los marcados, luego por departamento, provincia, distrito
    this.ubigeosFiltrados = resultado.sort((a, b) => {
      const aSeleccionado = this.isUbigeoSeleccionado(a.ubigeo);
      const bSeleccionado = this.isUbigeoSeleccionado(b.ubigeo);

      // Primero los marcados
      if (aSeleccionado && !bSeleccionado) return -1;
      if (!aSeleccionado && bSeleccionado) return 1;

      // Si ambos tienen el mismo estado de selección, ordenar por departamento, provincia, distrito
      if (a.departamento !== b.departamento) {
        return a.departamento.localeCompare(b.departamento);
      }
      if (a.provincia !== b.provincia) {
        return a.provincia.localeCompare(b.provincia);
      }
      return a.distrito.localeCompare(b.distrito);
    });
  }

  guardarUbigeosZona(): void {
    if (!this.zonaSeleccionada) {
      this.error = 'Por favor seleccione una zona';
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    const ubigeosArray = Array.from(this.ubigeosSeleccionados);
    this.ubigeoService.setUbigeosZona(this.zonaSeleccionada, ubigeosArray).subscribe({
      next: () => {
        this.success = 'Ubigeos de la zona actualizados exitosamente';
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al actualizar ubigeos de la zona: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }

  formatUbigeo(ubigeo: Ubigeo): string {
    return `${ubigeo.distrito}, ${ubigeo.provincia}, ${ubigeo.departamento}`;
  }
}


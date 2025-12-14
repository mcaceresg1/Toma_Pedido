import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
    MatProgressSpinnerModule,
    MatSnackBarModule
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
    private ubigeoService: UbigeoService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadZonas();
    // No cargar ubigeos aquí, se cargarán después de seleccionar la zona
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
          // Cargar ubigeos primero (con la zona seleccionada para ordenamiento)
          // Luego cargar los ubigeos seleccionados de esa zona
          this.loadUbigeos(() => {
            this.loadUbigeosByZona();
          });
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
  loadUbigeos(callback?: () => void): void {
    this.loading = true;
    this.error = null;
    // Pasar zona seleccionada para ordenamiento optimizado en backend
    this.ubigeoService.getAll(this.zonaSeleccionada || undefined).subscribe({
      next: (ubigeos) => {
        this.ubigeos = ubigeos;
        // El backend ya devuelve ordenado según prioridad
        // Aplicar solo filtro de búsqueda
        this.filtrarUbigeos();
        this.loading = false;
        // Ejecutar callback si se proporcionó
        if (callback) {
          callback();
        }
      },
      error: (err) => {
        this.error = 'Error al cargar ubigeos: ' + (err.error?.message || err.message);
        this.loading = false;
        // Ejecutar callback incluso en caso de error
        if (callback) {
          callback();
        }
      }
    });
  }

  onZonaChange(): void {
    if (this.zonaSeleccionada) {
      // Establecer filtro según la descripción de la zona
      this.establecerFiltroPorZona();
      // Recargar ubigeos con la nueva zona seleccionada para obtener información actualizada
      // Luego cargar los ubigeos seleccionados de esa zona
      this.loadUbigeos(() => {
        this.loadUbigeosByZona();
      });
    } else {
      this.ubigeosSeleccionados.clear();
      this.filtroUbigeo = '';
      // Recargar ubigeos sin zona
      this.loadUbigeos();
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
    
    // Si la descripción contiene "LIMA", filtrar por "LIMA, LIMA, " (con coma y espacio al final)
    if (descripcion.includes('LIMA')) {
      this.filtroUbigeo = 'LIMA, LIMA, ';
    }
    // Si la descripción contiene "CALLAO", filtrar por "CALLAO, CALLAO, " (con coma y espacio al final)
    else if (descripcion.includes('CALLAO')) {
      this.filtroUbigeo = 'CALLAO, CALLAO, ';
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
    const zonaActual = this.zonas.find(z => z.zonaCodigo === this.zonaSeleccionada);
    const zonaDescripcion = zonaActual ? `${zonaActual.zonaCodigo} - ${zonaActual.descripcion}` : this.zonaSeleccionada || '';
    
    if (this.ubigeosSeleccionados.has(ubigeoCodigo)) {
      this.ubigeosSeleccionados.delete(ubigeoCodigo);
      this.snackBar.open(
        `Se quitó ${ubigeoCodigo} de la zona ${zonaDescripcion}. No olvide grabar.`,
        'Cerrar',
        { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' }
      );
    } else {
      this.ubigeosSeleccionados.add(ubigeoCodigo);
      this.snackBar.open(
        `Se añadió ${ubigeoCodigo} a la zona ${zonaDescripcion}. No olvide grabar.`,
        'Cerrar',
        { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' }
      );
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

    // Ordenar: 1) Marcados, 2) Sin zona, 3) Con otra zona
    this.ubigeosFiltrados = resultado.sort((a, b) => {
      const aSeleccionado = this.isUbigeoSeleccionado(a.ubigeo);
      const bSeleccionado = this.isUbigeoSeleccionado(b.ubigeo);

      // Primero los marcados (checked)
      if (aSeleccionado && !bSeleccionado) return -1;
      if (!aSeleccionado && bSeleccionado) return 1;

      // Si ambos tienen el mismo estado de selección
      if (aSeleccionado === bSeleccionado) {
        const aSinZona = !a.zona;
        const bSinZona = !b.zona;
        
        // Luego los que NO tienen zona
        if (aSinZona && !bSinZona) return -1;
        if (!aSinZona && bSinZona) return 1;
        
        // Finalmente ordenar por departamento, provincia, distrito
        if (a.departamento !== b.departamento) {
          return a.departamento.localeCompare(b.departamento);
        }
        if (a.provincia !== b.provincia) {
          return a.provincia.localeCompare(b.provincia);
        }
        return a.distrito.localeCompare(b.distrito);
      }
      
      return 0;
    });
  }

  guardarUbigeosZona(): void {
    if (!this.zonaSeleccionada) {
      this.error = 'Por favor seleccione una zona';
      return;
    }

    // Verificar si hay ubigeos que se van a reasignar de otra zona
    const ubigeosArray = Array.from(this.ubigeosSeleccionados);
    const ubigeosAReasignar: { ubigeo: Ubigeo, zonaAnterior: string }[] = [];
    
    ubigeosArray.forEach(ubigeoCodigo => {
      const ubigeo = this.ubigeos.find(u => u.ubigeo === ubigeoCodigo);
      if (ubigeo && ubigeo.zona && ubigeo.zona !== this.zonaSeleccionada) {
        ubigeosAReasignar.push({ ubigeo, zonaAnterior: ubigeo.zona });
      }
    });

    // Si hay ubigeos a reasignar, pedir confirmación
    if (ubigeosAReasignar.length > 0) {
      const zonaActual = this.zonas.find(z => z.zonaCodigo === this.zonaSeleccionada);
      const zonaActualDesc = zonaActual ? `${zonaActual.zonaCodigo} - ${zonaActual.descripcion}` : this.zonaSeleccionada;
      
      let mensaje = 'Los siguientes ubigeos van a cambiar de zona:\n\n';
      ubigeosAReasignar.forEach(item => {
        const zonaAnt = this.zonas.find(z => z.zonaCodigo === item.zonaAnterior);
        const zonaAntDesc = zonaAnt ? `${zonaAnt.zonaCodigo} - ${zonaAnt.descripcion}` : item.zonaAnterior;
        mensaje += `• ${item.ubigeo.distrito}, ${item.ubigeo.provincia}, ${item.ubigeo.departamento}\n`;
        mensaje += `  De: ${zonaAntDesc}\n`;
        mensaje += `  A: ${zonaActualDesc}\n\n`;
      });
      
      mensaje += '¿Desea continuar con la reasignación?';
      
      if (!confirm(mensaje)) {
        return; // Usuario canceló
      }
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    this.ubigeoService.setUbigeosZona(this.zonaSeleccionada, ubigeosArray).subscribe({
      next: () => {
        this.success = 'Ubigeos de la zona actualizados exitosamente';
        // Recargar la lista de ubigeos para reflejar los cambios
        this.loadUbigeos();
        // Recargar los ubigeos seleccionados de esta zona
        this.loadUbigeosByZona();
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

  getZonaDescripcion(zonaCodigo: string | undefined | null): string {
    if (!zonaCodigo) {
      return 'Sin zona';
    }
    const zona = this.zonas.find(z => z.zonaCodigo === zonaCodigo);
    if (zona) {
      return `${zona.zonaCodigo} - ${zona.descripcion}`;
    }
    return zonaCodigo;
  }
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ZonaService } from '../../services/zona.service';
import { Zona, ZonaCreateDto, ZonaUpdateDto } from '../../../../../models/Zona';

@Component({
  selector: 'app-gestion-zonas',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './gestion-zonas.component.html',
  styleUrls: ['./gestion-zonas.component.scss']
})
export class GestionZonasComponent implements OnInit {
  zonas: Zona[] = [];
  loading = false;
  error: string | null = null;
  success: string | null = null;
  
  // Modal de zona
  mostrarModalZona = false;
  isCreatingZona = false;
  zonaActual: Zona | null = null;
  formZona: FormGroup;

  constructor(
    private zonaService: ZonaService,
    private fb: FormBuilder
  ) {
    this.formZona = this.fb.group({
      zonaCodigo: ['', [Validators.required, Validators.maxLength(3)]],
      descripcion: ['', [Validators.required, Validators.maxLength(100)]],
      corto: ['', [Validators.maxLength(20)]]
    });
  }

  ngOnInit(): void {
    this.loadZonas();
  }

  // ========== ZONAS ==========
  loadZonas(): void {
    this.loading = true;
    this.error = null;
    this.zonaService.getAll().subscribe({
      next: (zonas) => {
        this.zonas = zonas;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar zonas: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  openModalNuevaZona(): void {
    this.isCreatingZona = true;
    this.zonaActual = null;
    this.mostrarModalZona = true;
    this.formZona.reset({
      zonaCodigo: '',
      descripcion: '',
      corto: ''
    });
    this.formZona.get('zonaCodigo')?.enable();
  }

  openModalEditarZona(zona: Zona): void {
    this.isCreatingZona = false;
    this.zonaActual = zona;
    this.mostrarModalZona = true;
    this.formZona.patchValue({
      zonaCodigo: zona.zonaCodigo,
      descripcion: zona.descripcion,
      corto: zona.corto || ''
    });
    this.formZona.get('zonaCodigo')?.disable();
  }

  closeModalZona(): void {
    this.mostrarModalZona = false;
    this.isCreatingZona = false;
    this.zonaActual = null;
    this.formZona.reset();
    this.formZona.get('zonaCodigo')?.enable();
  }

  saveZona(): void {
    if (this.formZona.invalid) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }

    const formValue = this.formZona.value;
    this.loading = true;
    this.error = null;
    this.success = null;

    if (this.isCreatingZona) {
      const zonaDto: ZonaCreateDto = {
        zonaCodigo: formValue.zonaCodigo.trim().toUpperCase(),
        descripcion: formValue.descripcion.trim(),
        corto: formValue.corto?.trim() || undefined
      };

      this.zonaService.create(zonaDto).subscribe({
        next: () => {
          this.success = 'Zona creada exitosamente';
          this.loadZonas();
          this.closeModalZona();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al crear zona: ' + (err.error?.message || err.message);
          this.loading = false;
        }
      });
    } else {
      const zonaDto: ZonaUpdateDto = {
        descripcion: formValue.descripcion.trim(),
        corto: formValue.corto?.trim() || undefined
      };

      if (!this.zonaActual) {
        this.error = 'Zona no encontrada';
        this.loading = false;
        return;
      }

      this.zonaService.update(this.zonaActual.zonaCodigo, zonaDto).subscribe({
        next: () => {
          this.success = 'Zona actualizada exitosamente';
          this.loadZonas();
          this.closeModalZona();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al actualizar zona: ' + (err.error?.message || err.message);
          this.loading = false;
        }
      });
    }
  }

  deleteZona(zona: Zona): void {
    if (!confirm(`¿Está seguro de eliminar la zona "${zona.descripcion}" (${zona.zonaCodigo})?`)) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;

    this.zonaService.delete(zona.zonaCodigo).subscribe({
      next: () => {
        this.success = 'Zona eliminada exitosamente';
        this.loadZonas();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al eliminar zona: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  clearMessages(): void {
    this.error = null;
    this.success = null;
  }
}


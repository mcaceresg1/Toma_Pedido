import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VentasService } from '../../services/ventas.service';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { Usuario } from '../../../../../models/User';
import { Empresa } from '../../../../../models/Empresa';
import { Condicion } from '../../../../../models/Condicion';
import { NuevoCliente } from '../../../../../models/Cliente';
import { MatDialog } from '@angular/material/dialog';
import { ModalUbigeoData, Ubigeo } from '../../../../../models/Ubigeo';
import { ModalUbigeoComponent } from '../../components/modal-ubigeo/modal-ubigeo.component';
import { TipoDocumento } from '../../../../../models/TipoDocumento';

@Component({
  selector: 'app-add-cliente',
  templateUrl: './add-cliente.component.html',
  styleUrls: ['./add-cliente.component.scss'],
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgSelectModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    NgxSpinnerModule,
  ],
  standalone: true,
})
export class AddClienteComponent implements OnInit, OnDestroy {
  private _snackBar = inject(MatSnackBar);
  usuario = signal<Usuario | null>(null);
  empresa = signal<Empresa | null>(null);
  condiciones = signal<Condicion[]>([]);
  tiposDocumento = signal<TipoDocumento[]>([]);
  precios = signal<{ codigo: string; label: string }[]>([]);
  ubigeo = signal<Ubigeo | null>(null);
  readonly ubigeoDialog = inject(MatDialog);
  private ultimoDocumentoConsultado: string = ''; // Para evitar consultas duplicadas
  private componenteActivo: boolean = true; // Para evitar consultas al cambiar de pantalla
  private consultaSubscription?: Subscription; // Para poder cancelar la consulta si el componente se desactiva
  private presionandoEnter: boolean = false; // Flag para detectar cuando se presiona Enter
  formCliente: FormGroup = new FormGroup<{
    razon?: FormControl<string | null>;
    ruc?: FormControl<string | null>;
    direccion?: FormControl<string | null>;
    telefono?: FormControl<string | null>;
    ciudad?: FormControl<string | null>;
    contacto?: FormControl<string | null>;
    telefonoContacto?: FormControl<string | null>;
    correo?: FormControl<string | null>;
    ubigeo?: FormControl<string | null>;
    condicion?: FormControl<string | null>;
    diasCredito?: FormControl<number | null>;
    tipoDocumento?: FormControl<string | null>;
  }>({
    razon: new FormControl<string>('', [Validators.required]),
    ruc: new FormControl<string>('', [Validators.required]),
    direccion: new FormControl<string>('', [Validators.required]),
    telefono: new FormControl<string>('', [Validators.required]),
    ciudad: new FormControl<string>('', [Validators.required]),
    contacto: new FormControl<string>('', [Validators.required]),
    telefonoContacto: new FormControl<string>(''),
    correo: new FormControl<string>(''),
    ubigeo: new FormControl<string>('', [Validators.required]),
    condicion: new FormControl<string>(''),
    diasCredito: new FormControl<number>(0, [
      Validators.required,
      Validators.max(9999),
      Validators.min(0),
    ]),
    tipoDocumento: new FormControl<string>('', [Validators.required]),
  });

  constructor(
    private userService: UserService,
    private pedidosService: VentasService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.componenteActivo = true; // Asegurar que esté activo al inicializar
    this.getUserLogin();
    this.getEmpresa();
    this.getCondiciones();
    this.getTiposDocumento();
    
    // Escuchar cambios en el tipo de documento para actualizar la validación del campo RUC/DNI
    this.formCliente.get('tipoDocumento')?.valueChanges.subscribe((tipoDoc) => {
      this.actualizarValidacionDocumento(tipoDoc);
    });
  }

  ngOnDestroy(): void {
    // Desactivar el componente y cancelar cualquier consulta en curso
    this.componenteActivo = false;
    if (this.consultaSubscription) {
      this.consultaSubscription.unsubscribe();
    }
  }

  /**
   * Obtiene la longitud máxima para el atributo maxlength del input
   */
  getMaxLengthDocumento(): number | null {
    const tipoDoc = this.formCliente.get('tipoDocumento')?.value || null;
    const validacion = this.obtenerValidacionDocumento(tipoDoc);
    return validacion.maxLength ?? null;
  }

  /**
   * Obtiene la longitud máxima y el patrón de validación según el tipo de documento
   * @returns { maxLength: number | null, pattern: RegExp | null }
   */
  private obtenerValidacionDocumento(tipoDoc: string | null): { maxLength: number | null; pattern: RegExp | null } {
    if (!tipoDoc) {
      return { maxLength: null, pattern: null };
    }

    const tipoDocLower = tipoDoc.toLowerCase();
    
    // RUC: 11 dígitos
    if (tipoDocLower.includes('ruc') || tipoDocLower === 'ruc') {
      return { maxLength: 11, pattern: /^\d{11}$/ };
    }
    
    // DNI: 8 dígitos
    if (tipoDocLower.includes('dni') || tipoDocLower === 'dni') {
      return { maxLength: 8, pattern: /^\d{8}$/ };
    }
    
    // Carnet de Extranjería: 6 caracteres (puede incluir letras y números)
    if (tipoDocLower.includes('extranjeria') || tipoDocLower.includes('carnet') || tipoDocLower.includes('ce')) {
      return { maxLength: 6, pattern: /^[A-Za-z0-9]{6}$/ };
    }
    
    // Pasaporte: 9 caracteres (puede incluir letras y números)
    if (tipoDocLower.includes('pasaporte') || tipoDocLower.includes('passport')) {
      return { maxLength: 9, pattern: /^[A-Za-z0-9]{9}$/ };
    }
    
    // Otros casos: sin validación de longitud
    return { maxLength: null, pattern: null };
  }

  /**
   * Actualiza la validación del campo documento según el tipo seleccionado
   * Este método se ejecuta cuando cambia el tipo de documento
   */
  actualizarValidacionDocumento(tipoDoc: string | null): void {
    const rucControl = this.formCliente.get('ruc');
    if (!rucControl) return;

    // Remover validadores anteriores
    rucControl.clearValidators();
    rucControl.addValidators([Validators.required]);

    // Obtener validación según el tipo de documento
    const validacion = this.obtenerValidacionDocumento(tipoDoc);

    // LIMPIAR EL CAMPO: Cuando cambia el tipo de documento, es un nuevo inicio
    rucControl.setValue('', { emitEvent: false });
    rucControl.markAsUntouched();
    rucControl.markAsPristine();

    // Agregar validadores según el tipo de documento
    if (validacion.pattern) {
      rucControl.addValidators([Validators.pattern(validacion.pattern)]);
    }

    // Actualizar el maxlength en el DOM
    requestAnimationFrame(() => {
      const inputElement = document.querySelector('[formControlName="ruc"]') as HTMLInputElement;
      if (inputElement) {
        // Limpiar el valor en el DOM también
        inputElement.value = '';
        
        if (validacion.maxLength !== null) {
          inputElement.setAttribute('maxlength', validacion.maxLength.toString());
        } else {
          inputElement.removeAttribute('maxlength');
        }
        
        // Disparar evento input para sincronizar con Angular
        const inputEvent = new Event('input', { bubbles: true });
        inputElement.dispatchEvent(inputEvent);
      }
    });
    
    // Validar inmediatamente
    rucControl.updateValueAndValidity();
  }

  /**
   * Maneja el evento keydown para prevenir la entrada de caracteres no permitidos (máscara variable)
   * y también maneja el evento Enter para avanzar al siguiente campo
   */
  onDocumentoKeyDown(event: KeyboardEvent): void {
    // Manejar el evento Enter para avanzar al siguiente campo
    if (event.key === 'Enter') {
      this.presionandoEnter = true;
      event.preventDefault();
      
      // Avanzar al siguiente campo
      const currentField = event.target as HTMLElement;
      const form = currentField.closest('form');
      if (form) {
        const inputs = Array.from(form.querySelectorAll('input, select, textarea')) as HTMLElement[];
        const currentIndex = inputs.indexOf(currentField);
        if (currentIndex < inputs.length - 1) {
          inputs[currentIndex + 1].focus();
        }
      }
      
      // Resetear el flag después de un breve delay
      setTimeout(() => {
        this.presionandoEnter = false;
      }, 100);
      return;
    }
    
    const input = event.target as HTMLInputElement;
    const tipoDoc = this.formCliente.get('tipoDocumento')?.value || '';
    const validacion = this.obtenerValidacionDocumento(tipoDoc);
    
    // Permitir teclas de control (backspace, delete, tab, etc.)
    if (event.ctrlKey || event.metaKey || event.key === 'Backspace' || event.key === 'Delete' || 
        event.key === 'Tab' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' ||
        event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
        event.key === 'Home' || event.key === 'End' || event.key === 'Escape' ||
        event.key === 'F1' || event.key === 'F2' || event.key === 'F3' || event.key === 'F4' ||
        event.key === 'F5' || event.key === 'F6' || event.key === 'F7' || event.key === 'F8' ||
        event.key === 'F9' || event.key === 'F10' || event.key === 'F11' || event.key === 'F12') {
      return;
    }
    
    // Obtener el valor actual y la selección
    const valorActual = input.value || '';
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const textoSeleccionado = valorActual.substring(start, end);
    
    // Calcular cuántos caracteres se eliminarían con la selección
    const caracteresAEliminar = textoSeleccionado.length;
    
    // Calcular el nuevo valor que se generaría
    const char = event.key;
    const nuevoValor = valorActual.substring(0, start) + char + valorActual.substring(end);
    
    // Determinar qué caracteres permitir según el tipo
    const esRucODni = tipoDoc?.toLowerCase().includes('ruc') || tipoDoc?.toLowerCase().includes('dni');
    
    // Limpiar el nuevo valor según el tipo
    const nuevoValorLimpio = esRucODni 
      ? nuevoValor.replace(/\D/g, '') 
      : nuevoValor.replace(/[^A-Za-z0-9]/g, '');
    
    // Si no hay límite, solo validar el carácter
    if (validacion.maxLength === null) {
      if (!/[A-Za-z0-9]/.test(char)) {
        event.preventDefault();
        return;
      }
      return;
    }
    
    // Verificar si el nuevo valor excedería el límite (máscara)
    // Si hay texto seleccionado, se reemplazará, así que no cuenta como exceder
    const valorActualLimpio = esRucODni 
      ? valorActual.replace(/\D/g, '') 
      : valorActual.replace(/[^A-Za-z0-9]/g, '');
    
    const longitudFinal = valorActualLimpio.length - caracteresAEliminar + (/\d/.test(char) || /[A-Za-z0-9]/.test(char) ? 1 : 0);
    
    if (longitudFinal > validacion.maxLength) {
      event.preventDefault();
      return;
    }
    
    // Validar el carácter según el tipo
    if (esRucODni) {
      // Solo dígitos para RUC y DNI
      if (!/\d/.test(char)) {
        event.preventDefault();
        return;
      }
    } else {
      // Letras y números para otros tipos
      if (!/[A-Za-z0-9]/.test(char)) {
        event.preventDefault();
        return;
      }
    }
  }

  /**
   * Maneja el evento paste para aplicar la máscara al pegar texto
   */
  onDocumentoPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    const tipoDoc = this.formCliente.get('tipoDocumento')?.value || '';
    const validacion = this.obtenerValidacionDocumento(tipoDoc);
    
    // Obtener el texto pegado
    const textoPegado = event.clipboardData?.getData('text') || '';
    
    // Determinar qué caracteres permitir según el tipo
    const esRucODni = tipoDoc?.toLowerCase().includes('ruc') || tipoDoc?.toLowerCase().includes('dni');
    const valorLimpio = esRucODni 
      ? textoPegado.replace(/\D/g, '') // Solo dígitos para RUC y DNI
      : textoPegado.replace(/[^A-Za-z0-9]/g, ''); // Letras y números para otros
    
    // Aplicar límite de la máscara
    let valorFinal = valorLimpio;
    if (validacion.maxLength !== null && valorLimpio.length > validacion.maxLength) {
      valorFinal = valorLimpio.substring(0, validacion.maxLength);
    }
    
    // Obtener la posición del cursor
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const valorActual = input.value || '';
    
    // Insertar el valor pegado en la posición del cursor
    const nuevoValor = valorActual.substring(0, start) + valorFinal + valorActual.substring(end);
    
    // Limpiar y aplicar límite al valor completo
    const valorCompletoLimpio = esRucODni 
      ? nuevoValor.replace(/\D/g, '')
      : nuevoValor.replace(/[^A-Za-z0-9]/g, '');
    
    let valorFinalCompleto = valorCompletoLimpio;
    if (validacion.maxLength !== null && valorCompletoLimpio.length > validacion.maxLength) {
      valorFinalCompleto = valorCompletoLimpio.substring(0, validacion.maxLength);
    }
    
    // Actualizar el input y el formulario
    input.value = valorFinalCompleto;
    const rucControl = this.formCliente.get('ruc');
    if (rucControl) {
      rucControl.setValue(valorFinalCompleto, { emitEvent: true });
      rucControl.markAsTouched();
      
      // Validar inmediatamente si hay un patrón
      if (validacion.pattern) {
        rucControl.updateValueAndValidity();
      }
    }
    
    // Ajustar la posición del cursor
    setTimeout(() => {
      const nuevaPosicion = Math.min(start + valorFinal.length, valorFinalCompleto.length);
      input.setSelectionRange(nuevaPosicion, nuevaPosicion);
    }, 0);
  }

  /**
   * Maneja el evento input para limpiar y validar el valor según el tipo de documento
   * Esta es la máscara principal que aplica el límite dinámico
   */
  onDocumentoInput(event: Event): void {
    event.stopPropagation(); // Evitar propagación
    
    const input = event.target as HTMLInputElement;
    const tipoDoc = this.formCliente.get('tipoDocumento')?.value || '';
    const validacion = this.obtenerValidacionDocumento(tipoDoc);
    const rucControl = this.formCliente.get('ruc');
    
    // Determinar qué caracteres permitir según el tipo
    const esRucODni = tipoDoc?.toLowerCase().includes('ruc') || tipoDoc?.toLowerCase().includes('dni');
    let valorLimpio = esRucODni 
      ? input.value.replace(/\D/g, '') // Solo dígitos para RUC y DNI
      : input.value.replace(/[^A-Za-z0-9]/g, ''); // Letras y números para otros
    
    // Aplicar la máscara: recortar si excede el límite
    let valorFinal = valorLimpio;
    if (validacion.maxLength !== null && valorLimpio.length > validacion.maxLength) {
      valorFinal = valorLimpio.substring(0, validacion.maxLength);
    }
    
    // Si el valor cambió, actualizar tanto el input como el formulario
    if (valorFinal !== input.value || valorFinal !== (rucControl?.value || '')) {
      // Actualizar el input directamente
      input.value = valorFinal;
      
      // Actualizar el formulario
      if (rucControl) {
        rucControl.setValue(valorFinal, { emitEvent: false });
        rucControl.markAsTouched();
        
        // Validar inmediatamente si hay un patrón
        if (validacion.pattern) {
          rucControl.updateValueAndValidity({ emitEvent: false });
        }
      }
      
      // Forzar actualización del DOM usando requestAnimationFrame
      requestAnimationFrame(() => {
        if (input.value !== valorFinal) {
          input.value = valorFinal;
        }
      });
    }
  }


  /**
   * Valida y consulta el documento al salir del campo (blur)
   */
  onDocumentoBlur(): void {
    // Si se está presionando Enter, no ejecutar la validación (solo avanzar al siguiente campo)
    if (this.presionandoEnter) {
      return;
    }

    // Si el componente no está activo (se está cambiando de pantalla), no hacer nada
    if (!this.componenteActivo) {
      return;
    }

    const rucControl = this.formCliente.get('ruc');
    const tipoDocControl = this.formCliente.get('tipoDocumento');
    
    if (!rucControl || !rucControl.value) return;

    const tipoDoc = tipoDocControl?.value?.toLowerCase() || '';
    const valorActual = rucControl.value.toString();
    
    // Obtener validación según el tipo de documento
    const validacion = this.obtenerValidacionDocumento(tipoDocControl?.value || null);
    
    // Limpiar el valor según el tipo de documento
    let documentoLimpio: string;
    const esRucODni = tipoDoc.includes('ruc') || tipoDoc.includes('dni');
    
    if (esRucODni) {
      // Para RUC y DNI: solo dígitos
      documentoLimpio = valorActual.replace(/\D/g, '');
    } else if (validacion.pattern) {
      // Para otros tipos con validación (Carnet de Extranjería, Pasaporte): letras y números
      documentoLimpio = valorActual.replace(/[^A-Za-z0-9]/g, '');
    } else {
      // Para otros tipos sin validación: permitir cualquier carácter alfanumérico
      documentoLimpio = valorActual.replace(/[^A-Za-z0-9]/g, '');
    }
    
    // Si está vacío después de limpiar, no hacer nada
    if (!documentoLimpio) return;

    // Si hay validación de patrón, validar el formato
    if (validacion.pattern) {
      if (!validacion.pattern.test(documentoLimpio)) {
        rucControl.setErrors({ pattern: true });
        rucControl.markAsTouched();
        return;
      }
    }

    // Solo consultar API para RUC y DNI (estos son los únicos que tienen API externa)
    let tipo: 'ruc' | 'dni' | null = null;
    
    if (tipoDoc.includes('ruc') || tipoDoc === 'ruc') {
      // Tipo RUC seleccionado: validar 11 dígitos
      if (documentoLimpio.length === 11 && /^\d{11}$/.test(documentoLimpio)) {
        tipo = 'ruc';
      } else {
        // Marcar error si no tiene 11 dígitos
        rucControl.setErrors({ pattern: true });
        rucControl.markAsTouched();
        return;
      }
    } else if (tipoDoc.includes('dni') || tipoDoc === 'dni') {
      // Tipo DNI seleccionado: validar 8 dígitos
      if (documentoLimpio.length === 8 && /^\d{8}$/.test(documentoLimpio)) {
        tipo = 'dni';
      } else {
        // Marcar error si no tiene 8 dígitos
        rucControl.setErrors({ pattern: true });
        rucControl.markAsTouched();
        return;
      }
    } else if (!tipoDoc) {
      // No hay tipo de documento seleccionado: inferir por cantidad de dígitos (como Trace ERP)
      if (documentoLimpio.length === 11 && /^\d{11}$/.test(documentoLimpio)) {
        tipo = 'ruc';
      } else if (documentoLimpio.length === 8 && /^\d{8}$/.test(documentoLimpio)) {
        tipo = 'dni';
      } else {
        // No coincide con RUC ni DNI
        rucControl.setErrors({ pattern: true });
        rucControl.markAsTouched();
        return;
      }
    }
    // Para otros tipos (Carnet de Extranjería, Pasaporte, etc.), no consultar API
    // Solo se valida el formato arriba

    // Si el documento es válido y es RUC o DNI, consultar API
    if (tipo && rucControl.valid) {
      // Guardar el documento consultado para evitar duplicados
      this.ultimoDocumentoConsultado = documentoLimpio;
      this.consultarClientePorDocumento(documentoLimpio, tipo);
    }
  }

  consultarClientePorDocumento(documento: string, tipo: 'ruc' | 'dni'): void {
    // Verificar que el componente siga activo antes de mostrar cualquier mensaje
    if (!this.componenteActivo) {
      this.spinner.hide('consultar_cliente');
      return;
    }

    // Cancelar cualquier consulta anterior que esté en curso
    if (this.consultaSubscription) {
      this.consultaSubscription.unsubscribe();
    }

    this.spinner.show('consultar_cliente');
    // El backend determina automáticamente si es RUC o DNI por la longitud
    this.consultaSubscription = this.pedidosService.consultarClientePorRuc(documento).subscribe({
      next: (resp) => {
        // Verificar nuevamente antes de mostrar mensajes
        if (!this.componenteActivo) {
          this.spinner.hide('consultar_cliente');
          return;
        }

        this.spinner.hide('consultar_cliente');
        
        const tipoDoc = tipo === 'ruc' ? 'RUC' : 'DNI';
        
        if (resp.existeEnBD) {
          // Construir el mensaje con los datos del cliente
          let mensaje = `El ${tipoDoc} ya es cliente`;
          if (resp.datosApi) {
            const datos = resp.datosApi;
            mensaje += '\n\n';
            mensaje += `Nombre: ${datos.razonSocial || datos.nombre || 'N/A'}\n`;
            mensaje += `Dirección: ${datos.direccion || 'N/A'}\n`;
            mensaje += `Teléfono: ${datos.telefono || 'N/A'}\n`;
            mensaje += `Contacto: ${datos.contacto || 'N/A'}`;
          } else if (resp.mensaje) {
            mensaje = resp.mensaje;
          }
          
          Swal.fire({
            title: `${tipoDoc} ya es cliente`,
            text: mensaje,
            icon: 'warning',
            confirmButtonColor: '#17a2b8',
            confirmButtonText: 'Ok',
          });
          return;
        }

        // Si el documento no existe en BD, mostrar mensaje y esperar confirmación antes de consultar API
        if (!resp.existeEnBD) {
          // Verificar nuevamente antes de mostrar el modal
          if (!this.componenteActivo) {
            return;
          }

          Swal.fire({
            title: `${tipoDoc} no encontrado`,
            text: `El ${tipoDoc} no existe en la base de datos local. Se consultará la información desde el API externo.`,
            icon: 'info',
            confirmButtonColor: '#17a2b8',
            confirmButtonText: 'Continuar',
            showCancelButton: false,
            allowOutsideClick: false,
          }).then((result) => {
            // Verificar que el componente siga activo antes de procesar
            if (result.isConfirmed && this.componenteActivo) {
              // Después de la confirmación, procesar los datos del API si están disponibles
              this.procesarDatosApi(resp, documento, tipo);
            }
          });
          return;
        }

        // Si llegamos aquí, procesar datos del API directamente
        // Verificar que el componente siga activo
        if (this.componenteActivo) {
          this.procesarDatosApi(resp, documento, tipo);
        }
      },
      error: (err) => {
        this.spinner.hide('consultar_cliente');
        
        // No mostrar error si el componente ya no está activo
        if (!this.componenteActivo) {
          return;
        }

        console.error('Error al consultar cliente:', err);
        // Mostrar error al usuario
        Swal.fire({
          title: 'Error',
          text: err.error?.message || 'Ocurrió un error al consultar el documento. Por favor, intente nuevamente.',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  private procesarDatosApi(resp: any, documento: string, tipo: 'ruc' | 'dni'): void {
    // Verificar que el documento sea válido antes de procesar los datos del API
    const documentoControl = this.formCliente.get('ruc');
    if (!documentoControl?.valid || !documentoControl.value) {
      console.log('Documento no válido, no se procesarán los datos del API');
      return;
    }

    const documentoLimpio = documentoControl.value.toString().replace(/\D/g, '');
    const esRuc = documentoLimpio.length === 11;
    const esDni = documentoLimpio.length === 8;
    
    if (!esRuc && !esDni) {
      console.log('Documento no válido, no se procesarán los datos del API');
      return;
    }

    if (resp.datosApi) {
          // Llenar los campos del formulario con los datos del API
          // Para RUC usar razonSocial, para DNI usar nombre
          const nombreRazon = tipo === 'ruc' 
            ? (resp.datosApi.razonSocial || '')
            : (resp.datosApi.nombre || '');
          
          this.formCliente.patchValue({
            razon: nombreRazon,
            direccion: resp.datosApi.direccion || '',
            ciudad: resp.datosApi.distrito || resp.datosApi.provincia || resp.datosApi.departamento || '',
          });

          // Intentar buscar el ubigeo basándose en distrito/provincia/departamento
          // IMPORTANTE: En la tabla CUE005 los campos están invertidos:
          // - DISTRITO (columna) = DEPARTAMENTO (del API)
          // - PROVINCIA (columna) = PROVINCIA (del API)
          // - DEPARTAMENTO (columna) = DISTRITO (del API)
          if (resp.datosApi.distrito || resp.datosApi.provincia || resp.datosApi.departamento) {
            // Buscar primero por distrito (más específico)
            const busquedaUbigeo = resp.datosApi.distrito || resp.datosApi.provincia || resp.datosApi.departamento || '';
            this.pedidosService.getSearchUbigeo(busquedaUbigeo).subscribe({
              next: (ubigeos) => {
                // Si se encuentra un ubigeo que coincida, establecerlo
                if (ubigeos && ubigeos.length > 0) {
                  // Buscar el que mejor coincida considerando el mapeo invertido:
                  // Prioridad 1: Coincidencia exacta de distrito (API distrito = tabla departamento)
                  // Prioridad 2: Coincidencia de distrito + provincia
                  // Prioridad 3: Coincidencia de distrito + departamento
                  // Prioridad 4: Coincidencia de provincia + departamento
                  let ubigeoEncontrado = ubigeos.find(u => {
                    // Coincidencia perfecta: distrito del API coincide con departamento de la tabla
                    // Y provincia del API coincide con provincia de la tabla
                    // Y departamento del API coincide con distrito de la tabla
                    const distritoMatch = resp.datosApi?.distrito && 
                      u.departamento?.toLowerCase() === resp.datosApi.distrito.toLowerCase();
                    const provinciaMatch = resp.datosApi?.provincia && 
                      u.provincia?.toLowerCase() === resp.datosApi.provincia.toLowerCase();
                    const departamentoMatch = resp.datosApi?.departamento && 
                      u.distrito?.toLowerCase() === resp.datosApi.departamento.toLowerCase();
                    
                    // Coincidencia perfecta de los 3 campos
                    if (distritoMatch && provinciaMatch && departamentoMatch) {
                      return true;
                    }
                    return false;
                  });

                  // Si no hay coincidencia perfecta, buscar por distrito + provincia
                  if (!ubigeoEncontrado) {
                    ubigeoEncontrado = ubigeos.find(u => {
                      const distritoMatch = resp.datosApi?.distrito && 
                        u.departamento?.toLowerCase() === resp.datosApi.distrito.toLowerCase();
                      const provinciaMatch = resp.datosApi?.provincia && 
                        u.provincia?.toLowerCase() === resp.datosApi.provincia.toLowerCase();
                      return distritoMatch && provinciaMatch;
                    });
                  }

                  // Si aún no hay coincidencia, buscar solo por distrito
                  if (!ubigeoEncontrado) {
                    ubigeoEncontrado = ubigeos.find(u => {
                      return resp.datosApi?.distrito && 
                        u.departamento?.toLowerCase() === resp.datosApi.distrito.toLowerCase();
                    });
                  }

                  // Si aún no hay coincidencia, buscar por provincia + departamento
                  if (!ubigeoEncontrado) {
                    ubigeoEncontrado = ubigeos.find(u => {
                      const provinciaMatch = resp.datosApi?.provincia && 
                        u.provincia?.toLowerCase() === resp.datosApi.provincia.toLowerCase();
                      const departamentoMatch = resp.datosApi?.departamento && 
                        u.distrito?.toLowerCase() === resp.datosApi.departamento.toLowerCase();
                      return provinciaMatch && departamentoMatch;
                    });
                  }

                  // Si aún no hay coincidencia, usar el primero que tenga la provincia correcta
                  if (!ubigeoEncontrado && resp.datosApi?.provincia) {
                    ubigeoEncontrado = ubigeos.find(u => 
                      u.provincia?.toLowerCase() === resp.datosApi.provincia.toLowerCase()
                    );
                  }

                  // Si no hay ninguna coincidencia, usar el primero de la lista
                  if (!ubigeoEncontrado) {
                    ubigeoEncontrado = ubigeos[0];
                  }
                  
                  // Solo seleccionar ubigeo si el documento es válido
                  const documentoControl = this.formCliente.get('ruc');
                  const documentoLimpio = documentoControl?.value?.toString().replace(/\D/g, '') || '';
                  const esValido = (documentoLimpio.length === 11 && /^\d{11}$/.test(documentoLimpio)) ||
                                   (documentoLimpio.length === 8 && /^\d{8}$/.test(documentoLimpio));
                  
                  if (documentoControl?.valid && esValido) {
                    this.seleccionarUbigeo(ubigeoEncontrado);
                  }
                }
              },
              error: () => {
                // Si falla la búsqueda de ubigeo, no es crítico
                console.log('No se pudo buscar el ubigeo automáticamente');
              }
            });
          } else if (resp.datosApi.ubigeo) {
            // Si el API devuelve directamente el código de ubigeo
            this.formCliente.patchValue({
              ubigeo: resp.datosApi.ubigeo,
            });
          }

          Swal.fire({
            title: 'Datos obtenidos',
            text: 'Los datos del cliente se han cargado automáticamente desde el API externo.',
            icon: 'success',
            confirmButtonColor: '#17a2b8',
            confirmButtonText: 'Ok',
            timer: 2000,
            showConfirmButton: true,
          });
        } else {
          // No se pudieron obtener datos del API
          Swal.fire({
            title: 'Sin datos disponibles',
            text: 'No se pudieron obtener datos del API externo para este RUC. Por favor, complete los datos manualmente.',
            icon: 'warning',
            confirmButtonColor: '#17a2b8',
            confirmButtonText: 'Ok',
          });
          console.log('No se pudieron obtener datos del API para el documento:', documento);
        }
  }

  getUserLogin(): void {
    this.spinner.show('create_usuario');
    this.userService.getDataUserLogin().subscribe({
      next: (resp) => {
        this.usuario.set(resp);
        this.spinner.hide('create_usuario');
      },
      error: (err) => {
        this.spinner.hide('create_usuario');
        Swal.fire({
          title: 'Error al obtener el usuario vendedor.',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  getEmpresa(): void {
    this.spinner.show('create_empresa');
    this.userService.getEmpresa().subscribe({
      next: (resp) => {
        this.empresa.set(resp);
        this.spinner.hide('create_empresa');
      },
      error: (err) => {
        this.spinner.hide('create_empresa');
        Swal.fire({
          title: 'Error al obtener información de la empresa..',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  getCondiciones(): void {
    this.spinner.show('create_condicion');
    this.pedidosService.getCondiciones().subscribe({
      next: (resp) => {
        this.condiciones.set(resp);
        this.formCliente.controls['condicion'].setValue(
          resp[resp.length - 2].codigo
        );
        this.spinner.hide('create_condicion');
      },
      error: (err) => {
        this.spinner.hide('create_condicion');
        Swal.fire({
          title: 'Error al obtener las condiciones de la empresa...',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  getTiposDocumento(): void {
    this.spinner.show('tipos_doc');
    this.pedidosService.getTiposDocumento().subscribe({
      next: (resp) => {
        this.tiposDocumento.set(resp);
        const rucTipo = resp.filter((it) => it.descripcion === 'RUC')?.[0];
        if (rucTipo) {
          this.formCliente.controls['tipoDocumento'].setValue(rucTipo.tipo, { emitEvent: true });
          // Actualizar validación después de establecer el tipo por defecto
          this.actualizarValidacionDocumento(rucTipo.tipo);
        }
        this.spinner.hide('tipos_doc');
      },
      error: (err) => {
        this.spinner.hide('tipos_doc');
        Swal.fire({
          title: 'Error al obtener los tipos de documento...',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  /**Accion */
  cancelarCliente(): void {
    Swal.fire({
      title: '¿Cancelar creación de cliente?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#17a2b8',
      cancelButtonColor: '#343a40',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.componenteActivo = false; // Marcar como inactivo antes de navegar
        this.limpiarDatosPedido();
        this.router.navigate(['/dashboard/pages/addpedido']);
      }
    });
  }

  registrarCliente(): void {
    if (this.formCliente.invalid) {
      return Object.values(this.formCliente.controls).forEach((control) => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach((control) =>
            control.markAsTouched()
          );
        } else {
          control.markAsTouched();
        }
      });
    }
    this.saveCliente();
  }

  saveCliente(): void {
    this.spinner.show();

    // Limpiar el RUC: eliminar espacios y caracteres no numéricos, tomar solo los primeros 11 dígitos
    const rucRaw = this.formCliente.get('ruc')?.value || '';
    const rucLimpio = rucRaw.toString().replace(/\D/g, '').substring(0, 11);

    // Validar que el RUC tenga exactamente 11 dígitos
    if (rucLimpio.length !== 11) {
      this.spinner.hide();
      Swal.fire({
        title: 'Error de validación',
        text: 'El RUC debe tener exactamente 11 dígitos numéricos.',
        icon: 'error',
        confirmButtonColor: '#17a2b8',
        confirmButtonText: 'Ok',
      });
      return;
    }

    const data: NuevoCliente = {
      ...this.formCliente.value,
      ruc: rucLimpio, // Usar el RUC limpio
      ubigeo: this.ubigeo()?.ubigeo,
    };
    this.pedidosService.crearCliente(data).subscribe({
      next: (resp) => {
        if (resp.ok) {
          setTimeout(() => {
            this.spinner.hide();
            Swal.fire({
              title: 'Cliente registrado exitosamente.',
              icon: 'success',
              showCancelButton: false,
              confirmButtonColor: '#17a2b8',
              cancelButtonColor: '#343a40',
              confirmButtonText: 'Confirmar',
              cancelButtonText: 'Cancelar',
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                this.limpiarDatosPedido();
                this.goBack();
              }
            });
          }, 2000);
        } else {
          this.spinner.hide();
          Swal.fire({
            title: 'Error al crear el cliente..',
            icon: 'error',
            confirmButtonColor: '#17a2b8',
            confirmButtonText: 'Ok',
          });
        }
      },
      error: (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error al crear el cliente..',
          text: err.error ?? err.message,
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  limpiarDatosPedido(): void {
    this.formCliente.reset();
  }

  goBack() {
    this.componenteActivo = false; // Marcar como inactivo antes de navegar
    this.router.navigate(['/dashboard/pages/addpedido']);
  }

  openUbigeoDialog(): void {
    // Si el campo ubigeo tiene datos, extraer solo el distrito para filtrar
    let filtroInicial = '';
    const ubigeoValue = this.formCliente.controls['ubigeo'].value;
    
    if (ubigeoValue && typeof ubigeoValue === 'string') {
      // El formato es: "código - Departamento, Provincia, Distrito"
      // Extraer solo el distrito (último valor después de la coma)
      const partes = ubigeoValue.split(' - ');
      if (partes.length > 1) {
        const ubicacion = partes[1]; // "Departamento, Provincia, Distrito"
        const valores = ubicacion.split(',').map(v => v.trim());
        if (valores.length >= 1) {
          // Tomar solo el distrito (último valor)
          const distrito = valores[valores.length - 1]; // Distrito real (último)
          filtroInicial = distrito.trim();
        }
      }
    }

    this.ubigeoDialog.open<any, ModalUbigeoData>(ModalUbigeoComponent, {
      minWidth: '80vw',
      data: {
        seleccionarUbigeo: this.seleccionarUbigeo.bind(this),
        filtroInicial: filtroInicial,
      },
    });
  }

  seleccionarUbigeo(ubigeo: Ubigeo) {
    // Recordar que en la BD los campos están invertidos:
    // - ubigeo.distrito (BD) = DEPARTAMENTO (real)
    // - ubigeo.provincia (BD) = PROVINCIA (real)
    // - ubigeo.departamento (BD) = DISTRITO (real)
    // Formato: código - Departamento, Provincia, Distrito
    const valorUbigeo = ubigeo.ubigeo
      ? `${ubigeo.ubigeo} - ${ubigeo.distrito}, ${ubigeo.provincia}, ${ubigeo.departamento}`
      : null;
    this.formCliente.controls['ubigeo'].setValue(valorUbigeo);
    this.ubigeo.set(ubigeo);
  }
}

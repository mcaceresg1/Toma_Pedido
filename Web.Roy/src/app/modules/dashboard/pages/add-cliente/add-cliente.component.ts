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
import { UbigeoService } from '../../services/ubigeo.service';
import { Usuario } from '../../../../../models/User';
import { Empresa } from '../../../../../models/Empresa';
import { Condicion } from '../../../../../models/Condicion';
import { NuevoCliente } from '../../../../../models/Cliente';
import { MatDialog } from '@angular/material/dialog';
import { ModalUbigeoData, Ubigeo } from '../../../../../models/Ubigeo';
import { ModalUbigeoComponent } from '../../components/modal-ubigeo/modal-ubigeo.component';
import { TipoDocumento } from '../../../../../models/TipoDocumento';
import { Vendedor } from '../../../../../models/Vendedor';

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
  ubigeos = signal<Ubigeo[]>([]);
  vendedores = signal<Vendedor[]>([]);
  nombreVendedor = signal<string>('');
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
    ciudad: new FormControl<string>('', []),
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
    private ubigeoService: UbigeoService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.componenteActivo = true; // Asegurar que esté activo al inicializar
    // Primero cargar vendedores para que estén disponibles cuando se cargue el usuario
    this.getVendedores();
    this.getUserLogin();
    this.getEmpresa();
    this.getCondiciones();
    this.getTiposDocumento();
    this.getAllUbigeos();
    
    // Listener para limpiar todos los campos cuando cambie el tipo de documento
    this.formCliente.get('tipoDocumento')?.valueChanges.subscribe(() => {
      // Habilitar todos los campos primero (en caso de que estuvieran deshabilitados por cliente existente)
      this.formCliente.get('razon')?.enable();
      this.formCliente.get('direccion')?.enable();
      this.formCliente.get('telefono')?.enable();
      this.formCliente.get('ciudad')?.enable();
      this.formCliente.get('contacto')?.enable();
      this.formCliente.get('telefonoContacto')?.enable();
      this.formCliente.get('correo')?.enable();
      this.formCliente.get('ubigeo')?.enable();
      this.formCliente.get('condicion')?.enable();
      this.formCliente.get('diasCredito')?.enable();
      
      // Limpiar todos los campos excepto tipoDocumento
      this.formCliente.patchValue({
        ruc: '',
        razon: '',
        direccion: '',
        telefono: '',
        ciudad: '',
        contacto: '',
        telefonoContacto: '',
        correo: '',
        ubigeo: '',
        condicion: '',
        diasCredito: 0,
      });
      
      // Limpiar errores y marcar como no tocados
      Object.keys(this.formCliente.controls).forEach(key => {
        if (key !== 'tipoDocumento') {
          const control = this.formCliente.get(key);
          if (control) {
            control.setErrors(null);
            control.markAsUntouched();
          }
        }
      });
      
      // Resetear el último documento consultado y el ubigeo
      this.ultimoDocumentoConsultado = '';
      this.ubigeo.set(null);
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
   * Obtiene el tipo de documento seleccionado buscando en el array de tipos
   */
  private getTipoDocumentoActual(): TipoDocumento | null {
    const tipoDocControl = this.formCliente.get('tipoDocumento');
    const tipoSeleccionado = tipoDocControl?.value;
    
    if (!tipoSeleccionado) {
      return null;
    }
    
    const tipos = this.tiposDocumento();
    if (!tipos || tipos.length === 0) {
      return null;
    }
    
    return tipos.find(t => t.tipo === tipoSeleccionado) || null;
  }

  /**
   * Obtiene la configuración de validación según el tipo de documento
   * Retorna { maxLength: number, longitudEsperada: number | null, requiereValidacionExacta: boolean }
   */
  private getConfiguracionDocumento(): { maxLength: number; longitudEsperada: number | null; requiereValidacionExacta: boolean } {
    const tipoDoc = this.getTipoDocumentoActual();
    
    if (!tipoDoc || !tipoDoc.descripcion) {
      return { maxLength: 20, longitudEsperada: null, requiereValidacionExacta: false };
    }
    
    const descripcion = tipoDoc.descripcion.toLowerCase().trim();
    
    if (descripcion === 'ruc') {
      return { maxLength: 11, longitudEsperada: 11, requiereValidacionExacta: true };
    } else if (descripcion === 'dni') {
      return { maxLength: 8, longitudEsperada: 8, requiereValidacionExacta: true };
    } else if (descripcion.includes('carnet') && descripcion.includes('extranjeria')) {
      return { maxLength: 6, longitudEsperada: 6, requiereValidacionExacta: true };
    } else if (descripcion === 'pasaporte') {
      return { maxLength: 9, longitudEsperada: 9, requiereValidacionExacta: true };
    }
    
    // Para cualquier otro tipo, sin límite específico (pero limitamos a 20 caracteres en el input)
    return { maxLength: 20, longitudEsperada: null, requiereValidacionExacta: false };
  }

  /**
   * Obtiene el maxLength según el tipo de documento seleccionado
   * RUC: 11, DNI: 8, Carnet Extranjería: 6, Pasaporte: 9, Otros: 20
   */
  getMaxLengthDocumento(): number {
    const config = this.getConfiguracionDocumento();
    return config.maxLength;
  }

  /**
   * Obtiene el tipo de documento como 'ruc' | 'dni' | 'otro'
   */
  getTipoDocumentoSeleccionado(): 'ruc' | 'dni' | 'otro' {
    const tipoDoc = this.getTipoDocumentoActual();
    
    if (!tipoDoc || !tipoDoc.descripcion) {
      return 'otro';
    }
    
    const descripcion = tipoDoc.descripcion.toLowerCase().trim();
    
    if (descripcion === 'ruc') {
      return 'ruc';
    } else if (descripcion === 'dni') {
      return 'dni';
    }
    
    return 'otro';
  }

  /**
   * Maneja el evento keydown para el campo de documento
   * Si es Enter, ejecuta la búsqueda del cliente
   */
  onDocumentoKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.presionandoEnter = true;
      
      // Ejecutar la búsqueda del cliente (similar a onDocumentoBlur)
      const rucControl = this.formCliente.get('ruc');
      if (rucControl && rucControl.value) {
        // Obtener el valor del documento
        const documentoRaw = rucControl.value.toString();
        const config = this.getConfiguracionDocumento();
        
        // Limpiar el documento según el tipo
        let documentoLimpio = documentoRaw;
        if (config.requiereValidacionExacta) {
          documentoLimpio = documentoRaw.replace(/\D/g, '');
        } else {
          documentoLimpio = documentoRaw.trim();
        }
        
        // Limitar longitud si es necesario
        if (config.maxLength > 0 && documentoLimpio.length > config.maxLength) {
          documentoLimpio = documentoLimpio.substring(0, config.maxLength);
        }
        
        // Actualizar el valor en el control
        if (documentoLimpio !== documentoRaw) {
          rucControl.setValue(documentoLimpio, { emitEvent: false });
        }
        
        // Ejecutar la búsqueda
        this.onDocumentoBlur();
      }
      
      setTimeout(() => {
        this.presionandoEnter = false;
      }, 100);
    }
  }

  onDocumentoPaste(event: ClipboardEvent): void {
    // Permitir pegar pero limitar según el tipo de documento
    const input = event.target as HTMLInputElement;
    const textoPegado = event.clipboardData?.getData('text') || '';
    const config = this.getConfiguracionDocumento();
    const maxLength = config.maxLength;
    
    let valorLimpio = textoPegado;
    
    // Para tipos con validación exacta, solo números
    if (config.requiereValidacionExacta) {
      valorLimpio = valorLimpio.replace(/\D/g, '');
    }
    
    // Limitar longitud
    if (maxLength > 0 && valorLimpio.length > maxLength) {
      valorLimpio = valorLimpio.substring(0, maxLength);
    }
    
    event.preventDefault();
    input.value = valorLimpio;
    const rucControl = this.formCliente.get('ruc');
    if (rucControl) {
      rucControl.setValue(valorLimpio, { emitEvent: true });
    }
  }

  onDocumentoInput(event: Event): void {
    // Limitar según el tipo de documento
    const input = event.target as HTMLInputElement;
    const config = this.getConfiguracionDocumento();
    const maxLength = config.maxLength;
    
    let valor = input.value;
    
    // Para tipos con validación exacta (RUC, DNI, Carnet, Pasaporte), solo números
    if (config.requiereValidacionExacta) {
      valor = valor.replace(/\D/g, '');
    }
    
    // Limitar longitud
    if (maxLength > 0 && valor.length > maxLength) {
      valor = valor.substring(0, maxLength);
    }
    
    if (input.value !== valor) {
      input.value = valor;
      const rucControl = this.formCliente.get('ruc');
      if (rucControl) {
        rucControl.setValue(valor, { emitEvent: false });
      }
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
    
    if (!rucControl || !rucControl.value || !tipoDocControl || !tipoDocControl.value) {
      return;
    }

    const config = this.getConfiguracionDocumento();
    const valorActual = rucControl.value.toString();
    
    // Limpiar valor según el tipo
    let documentoLimpio = valorActual;
    if (config.requiereValidacionExacta) {
      // Para tipos con validación exacta, solo dígitos
      documentoLimpio = valorActual.replace(/\D/g, '');
    } else {
      // Para otros tipos, limpiar espacios al inicio y final
      documentoLimpio = valorActual.trim();
    }
    
    // Si está vacío, no hacer nada
    if (!documentoLimpio || documentoLimpio.length === 0) {
      return;
    }

    // Validar según el tipo de documento seleccionado
    if (config.requiereValidacionExacta && config.longitudEsperada !== null) {
      const longitudEsperada = config.longitudEsperada;
      const patron = new RegExp(`^\\d{${longitudEsperada}}$`);

      if (documentoLimpio.length !== longitudEsperada || !patron.test(documentoLimpio)) {
        // No tiene la longitud correcta, marcar error
        rucControl.setErrors({ pattern: true });
        rucControl.markAsTouched();
        return;
      }
    } else {
      // Para otros tipos, solo validar que tenga al menos 1 carácter
      if (documentoLimpio.length < 1) {
        rucControl.setErrors({ pattern: true });
        rucControl.markAsTouched();
        return;
      }
    }

    // Si llegamos aquí, el documento es válido
    // Limpiar errores previos antes de consultar
    const erroresActuales = rucControl.errors || {};
    if (erroresActuales['pattern']) {
      delete erroresActuales['pattern'];
      const nuevosErrores = Object.keys(erroresActuales).length > 0 ? erroresActuales : null;
      rucControl.setErrors(nuevosErrores);
      rucControl.updateValueAndValidity();
    }
    
    // Solo consultar para RUC y DNI, no para otros tipos
    const tipoSeleccionado = this.getTipoDocumentoSeleccionado();
    if (tipoSeleccionado !== 'ruc' && tipoSeleccionado !== 'dni') {
      return; // No consultar para otros tipos de documento
    }
    
    // Verificar que no sea el mismo documento que ya consultamos
    if (this.ultimoDocumentoConsultado === documentoLimpio) {
      return;
    }
    
    // Consultar el documento usando el tipo seleccionado (solo RUC o DNI)
    this.ultimoDocumentoConsultado = documentoLimpio;
    this.consultarClientePorDocumento(documentoLimpio, tipoSeleccionado === 'ruc' ? 'ruc' : 'dni');
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
        
        // Obtener el tipo de documento seleccionado para mostrar el nombre correcto
        const tipoDocActual = this.getTipoDocumentoActual();
        const nombreTipoDoc = tipoDocActual?.descripcion || (tipo === 'ruc' ? 'RUC' : 'DNI');
        
        if (resp.existeEnBD) {
          // Construir el mensaje con los datos del cliente según el formato solicitado
          let mensaje = '';
          if (resp.datosApi) {
            const datos = resp.datosApi;
            
            // Función para capitalizar primera letra de cada palabra
            const capitalizar = (texto: string | undefined | null): string => {
              if (!texto || texto === 'N/A') return 'N/A';
              return texto
                .split(' ')
                .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
                .join(' ');
            };
            
            mensaje += `<div style="text-align: left; line-height: 1.8; font-size: 14px;">`;
            mensaje += `<div style="margin-bottom: 8px;"><strong>Razón Social:</strong> ${capitalizar(datos.razonSocial || datos.nombre || 'N/A')}</div>`;
            mensaje += `<div style="margin-bottom: 8px;">`;
            const direccionTexto = capitalizar(datos.direccion || 'N/A');
            if (datos.distrito || datos.provincia || datos.departamento) {
              const ubigeo = [datos.distrito, datos.provincia, datos.departamento].filter(Boolean).join(' - ');
              mensaje += `<div><strong>Dirección:</strong> ${direccionTexto}</div>`;
              mensaje += `<div style="padding-left: 110px; margin-top: 4px; word-break: break-word;">${capitalizar(ubigeo)}</div>`;
            } else {
              mensaje += `<div><strong>Dirección:</strong> ${direccionTexto}</div>`;
            }
            mensaje += `</div>`;
            mensaje += `<div style="margin-bottom: 8px;"><strong>Teléfono:</strong> ${capitalizar(datos.telefono || 'N/A')}</div>`;
            mensaje += `<div><strong>Contacto:</strong> ${capitalizar(datos.contacto || 'N/A')}</div>`;
            mensaje += `</div>`;
          } else {
            // Si no hay datosApi, intentar usar el mensaje del backend
            mensaje = resp.mensaje || 'No se encontraron datos adicionales del cliente.';
          }
          
          // Deshabilitar todos los campos excepto tipoDocumento y ruc (que ya está validado)
          this.formCliente.get('razon')?.disable();
          this.formCliente.get('direccion')?.disable();
          this.formCliente.get('telefono')?.disable();
          this.formCliente.get('ciudad')?.disable();
          this.formCliente.get('contacto')?.disable();
          this.formCliente.get('telefonoContacto')?.disable();
          this.formCliente.get('correo')?.disable();
          this.formCliente.get('ubigeo')?.disable();
          this.formCliente.get('condicion')?.disable();
          this.formCliente.get('diasCredito')?.disable();
          
          Swal.fire({
            title: `El ${nombreTipoDoc} ya es cliente`,
            html: mensaje,
            icon: 'warning',
            confirmButtonColor: '#17a2b8',
            confirmButtonText: 'Ok',
          });
          return;
        }

        // Si el documento no existe en BD, procesar directamente los datos del API
        if (!resp.existeEnBD) {
            // Verificar que el componente siga activo antes de procesar
          if (this.componenteActivo) {
            // Procesar directamente los datos del API sin mostrar modal de aviso
              this.procesarDatosApi(resp, documento, tipo);
            }
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
          html: `<div style="font-size: calc(1em - 2px);">${err.error?.message || 'Ocurrió un error al consultar el documento. Por favor, intente nuevamente.'}</div>`,
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
      return;
    }

    const documentoLimpio = documentoControl.value.toString().replace(/\D/g, '');
    // Validar según el tipo pasado como parámetro (no inferir por longitud)
    const longitudEsperada = tipo === 'ruc' ? 11 : 8;
    const patron = tipo === 'ruc' ? /^\d{11}$/ : /^\d{8}$/;
    
    if (documentoLimpio.length !== longitudEsperada || !patron.test(documentoLimpio)) {
      return;
    }

    if (resp.datosApi) {
          // Llenar los campos del formulario con los datos del API
          // Para RUC usar razonSocial, para DNI usar nombre
          const nombreRazon = tipo === 'ruc' 
            ? (resp.datosApi.razonSocial || '')
            : (resp.datosApi.nombre || '');
          
          // Construir dirección completa: dirección, departamento, provincia, distrito
          const partesDireccion = [
            resp.datosApi.direccion || '',
            resp.datosApi.departamento || '',
            resp.datosApi.provincia || '',
            resp.datosApi.distrito || ''
          ].filter(parte => parte.trim() !== '');
          
          const direccionCompleta = partesDireccion.join(', ');
          
          // Convertir a mayúsculas los valores que vienen del API
          const ciudadValue = (resp.datosApi.distrito || resp.datosApi.provincia || resp.datosApi.departamento || '').toUpperCase();
          
          this.formCliente.patchValue({
            razon: nombreRazon ? nombreRazon.toUpperCase() : '',
            direccion: direccionCompleta.toUpperCase(),
            ciudad: ciudadValue,
          });

          // Intentar buscar el ubigeo basándose en distrito/provincia/departamento
          // IMPORTANTE: En la tabla CUE005 los campos están invertidos:
          // - DISTRITO (columna) = DEPARTAMENTO (del API)
          // - PROVINCIA (columna) = PROVINCIA (del API)
          // - DEPARTAMENTO (columna) = DISTRITO (del API)
          if (resp.datosApi.distrito || resp.datosApi.provincia || resp.datosApi.departamento) {
            // Buscar en la lista de ubigeos ya cargada
            const ubigeosDisponibles = this.ubigeos();
            
            if (ubigeosDisponibles && ubigeosDisponibles.length > 0) {
                  // Buscar el que mejor coincida considerando el mapeo invertido:
                  // Prioridad 1: Coincidencia exacta de distrito (API distrito = tabla departamento)
              // Y provincia (API provincia = tabla provincia)
              // Y departamento (API departamento = tabla distrito)
              let ubigeoEncontrado = ubigeosDisponibles.find(u => {
                    const distritoMatch = resp.datosApi?.distrito && 
                  u.departamento?.toLowerCase().trim() === resp.datosApi.distrito.toLowerCase().trim();
                    const provinciaMatch = resp.datosApi?.provincia && 
                  u.provincia?.toLowerCase().trim() === resp.datosApi.provincia.toLowerCase().trim();
                    const departamentoMatch = resp.datosApi?.departamento && 
                  u.distrito?.toLowerCase().trim() === resp.datosApi.departamento.toLowerCase().trim();
                    
                return distritoMatch && provinciaMatch && departamentoMatch;
                  });

                  // Si no hay coincidencia perfecta, buscar por distrito + provincia
                  if (!ubigeoEncontrado) {
                ubigeoEncontrado = ubigeosDisponibles.find(u => {
                      const distritoMatch = resp.datosApi?.distrito && 
                    u.departamento?.toLowerCase().trim() === resp.datosApi.distrito.toLowerCase().trim();
                      const provinciaMatch = resp.datosApi?.provincia && 
                    u.provincia?.toLowerCase().trim() === resp.datosApi.provincia.toLowerCase().trim();
                      return distritoMatch && provinciaMatch;
                    });
                  }

                  // Si aún no hay coincidencia, buscar solo por distrito
              if (!ubigeoEncontrado && resp.datosApi?.distrito) {
                ubigeoEncontrado = ubigeosDisponibles.find(u => {
                  return u.departamento?.toLowerCase().trim() === resp.datosApi.distrito.toLowerCase().trim();
                    });
                  }

                  // Si aún no hay coincidencia, buscar por provincia + departamento
                  if (!ubigeoEncontrado) {
                ubigeoEncontrado = ubigeosDisponibles.find(u => {
                      const provinciaMatch = resp.datosApi?.provincia && 
                    u.provincia?.toLowerCase().trim() === resp.datosApi.provincia.toLowerCase().trim();
                      const departamentoMatch = resp.datosApi?.departamento && 
                    u.distrito?.toLowerCase().trim() === resp.datosApi.departamento.toLowerCase().trim();
                      return provinciaMatch && departamentoMatch;
                    });
                  }

                  // Si aún no hay coincidencia, usar el primero que tenga la provincia correcta
                  if (!ubigeoEncontrado && resp.datosApi?.provincia) {
                ubigeoEncontrado = ubigeosDisponibles.find(u => 
                  u.provincia?.toLowerCase().trim() === resp.datosApi.provincia.toLowerCase().trim()
                    );
                  }
                  
                  // Solo seleccionar ubigeo si el documento es válido (solo para RUC y DNI)
                  if (tipo === 'ruc' || tipo === 'dni') {
                    const documentoControl = this.formCliente.get('ruc');
                    const documentoLimpio = documentoControl?.value?.toString().replace(/\D/g, '') || '';
                    const longitudEsperada = tipo === 'ruc' ? 11 : 8;
                    const patron = tipo === 'ruc' ? /^\d{11}$/ : /^\d{8}$/;
                    const esValido = documentoLimpio.length === longitudEsperada && patron.test(documentoLimpio);
                    
                    if (documentoControl?.valid && esValido && ubigeoEncontrado) {
                      this.seleccionarUbigeo(ubigeoEncontrado);
                    }
                  } else {
                    // Para otros tipos, solo validar que el control sea válido
                    const documentoControl = this.formCliente.get('ruc');
                    if (documentoControl?.valid && ubigeoEncontrado) {
                      this.seleccionarUbigeo(ubigeoEncontrado);
                    }
                  }
            } else {
              // Si no se han cargado los ubigeos todavía, intentar con búsqueda
              const busquedaUbigeo = resp.datosApi.distrito || resp.datosApi.provincia || resp.datosApi.departamento || '';
              this.pedidosService.getSearchUbigeo(busquedaUbigeo).subscribe({
                next: (ubigeos) => {
                  // Si se encuentra un ubigeo que coincida, establecerlo
                  if (ubigeos && ubigeos.length > 0) {
                    let ubigeoEncontrado = ubigeos[0];
                    
                    // Intentar encontrar el mejor match
                    ubigeoEncontrado = ubigeos.find(u => {
                      const distritoMatch = resp.datosApi?.distrito && 
                        u.departamento?.toLowerCase().trim() === resp.datosApi.distrito.toLowerCase().trim();
                      const provinciaMatch = resp.datosApi?.provincia && 
                        u.provincia?.toLowerCase().trim() === resp.datosApi.provincia.toLowerCase().trim();
                      const departamentoMatch = resp.datosApi?.departamento && 
                        u.distrito?.toLowerCase().trim() === resp.datosApi.departamento.toLowerCase().trim();
                      
                      return distritoMatch && provinciaMatch && departamentoMatch;
                    }) || ubigeos[0];
                    
                    const documentoControl = this.formCliente.get('ruc');
                    if (documentoControl?.valid && ubigeoEncontrado) {
                      this.seleccionarUbigeo(ubigeoEncontrado);
                  }
                }
              },
              error: () => {
                // Si falla la búsqueda de ubigeo, no es crítico
              }
            });
            }
          } else if (resp.datosApi.ubigeo) {
            // Si el API devuelve directamente el código de ubigeo
            const ubigeoPorCodigo = this.ubigeos().find(u => u.ubigeo === resp.datosApi.ubigeo);
            if (ubigeoPorCodigo) {
              this.seleccionarUbigeo(ubigeoPorCodigo);
            }
          }

          Swal.fire({
            title: 'Datos obtenidos',
            text: 'Los datos del cliente se han cargado desde el API SUNAT.',
            icon: 'success',
            confirmButtonColor: '#17a2b8',
            confirmButtonText: 'Ok',
            timer: 1800,
            showConfirmButton: true,
          });
        } else {
          // No se pudieron obtener datos del API
          Swal.fire({
            title: 'Sin datos disponibles',
            text: 'No se pudieron obtener datos del API externo para este documento. Por favor, complete los datos manualmente.',
            icon: 'warning',
            confirmButtonColor: '#17a2b8',
            confirmButtonText: 'Ok',
          });
        }
  }

  getUserLogin(): void {
    this.spinner.show('create_usuario');
    this.userService.getDataUserLogin().subscribe({
      next: (resp) => {
        this.usuario.set(resp);
        // Cargar el nombre del vendedor después de obtener el usuario
        this.cargarNombreVendedor();
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

  getVendedores(): void {
    this.pedidosService.getVendedores().subscribe({
      next: (vendedores) => {
        console.log('getVendedores - vendedores recibidos:', vendedores);
        this.vendedores.set(vendedores);
        // Si ya tenemos el usuario cargado, buscar el nombre del vendedor
        if (this.usuario()?.codVendedor !== undefined && this.usuario()?.codVendedor !== null) {
          this.cargarNombreVendedor();
        }
      },
      error: (err) => {
        console.error('Error al obtener vendedores:', err);
      },
    });
  }

  cargarNombreVendedor(): void {
    const codVendedor = this.usuario()?.codVendedor;
    console.log('cargarNombreVendedor - codVendedor del usuario:', codVendedor);
    
    if (codVendedor !== undefined && codVendedor !== null) {
      const vendedores = this.vendedores();
      console.log('cargarNombreVendedor - vendedores disponibles:', vendedores?.length);
      
      if (vendedores && vendedores.length > 0) {
        // Buscar el vendedor por IDVENDEDOR (campo vendedor en el modelo)
        const vendedor = vendedores.find(v => v.vendedor === codVendedor);
        console.log('cargarNombreVendedor - vendedor encontrado:', vendedor);
        
        if (vendedor) {
          this.nombreVendedor.set(vendedor.nombre);
          console.log('cargarNombreVendedor - nombre vendedor asignado:', vendedor.nombre);
        } else {
          console.warn('cargarNombreVendedor - No se encontró vendedor con código:', codVendedor);
          this.nombreVendedor.set('Vendedor no encontrado');
        }
      } else {
        // Si aún no se han cargado los vendedores, esperar un poco y volver a intentar
        setTimeout(() => {
          this.cargarNombreVendedor();
        }, 500);
      }
    } else {
      console.warn('cargarNombreVendedor - No hay código de vendedor en el usuario');
      this.nombreVendedor.set('');
    }
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

  getAllUbigeos(): void {
    this.ubigeoService.getAll().subscribe({
      next: (resp) => {
        this.ubigeos.set(resp);
      },
      error: (err) => {
        console.error('Error al obtener ubigeos:', err);
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
    // Verificar si algún campo está deshabilitado (cliente ya existe)
    const razonControl = this.formCliente.get('razon');
    if (razonControl && razonControl.disabled) {
      Swal.fire({
        title: 'Cliente ya existe',
        text: 'Este documento ya existe como cliente en la base de datos. No se puede guardar.',
        icon: 'warning',
        confirmButtonColor: '#17a2b8',
        confirmButtonText: 'Ok',
      });
      return;
    }
    
    // Limpiar y validar el campo RUC antes de validar el formulario
    const rucControl = this.formCliente.get('ruc');
    const tipoDocControl = this.formCliente.get('tipoDocumento');
    
    if (rucControl && rucControl.value && tipoDocControl && tipoDocControl.value) {
      const config = this.getConfiguracionDocumento();
      const valorActual = rucControl.value.toString();
      
      let valorLimpio = valorActual;
      if (config.requiereValidacionExacta) {
        valorLimpio = valorActual.replace(/\D/g, '');
      } else {
        valorLimpio = valorActual.trim();
      }
      
      if (config.maxLength > 0 && valorLimpio.length > config.maxLength) {
        valorLimpio = valorLimpio.substring(0, config.maxLength);
      }
      
      if (valorLimpio !== valorActual) {
        rucControl.setValue(valorLimpio, { emitEvent: false });
      }
      
      // Validar según la configuración
      if (config.requiereValidacionExacta && config.longitudEsperada !== null) {
        if (valorLimpio && valorLimpio.length !== config.longitudEsperada) {
          rucControl.setErrors({ pattern: true });
          rucControl.markAsTouched();
        }
      } else if (valorLimpio && valorLimpio.length < 1) {
        rucControl.setErrors({ pattern: true });
        rucControl.markAsTouched();
      }
      
      rucControl.updateValueAndValidity();
    }
    
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

  onInputUpperCase(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const control = this.formCliente.get(controlName);
    if (control) {
      const valorUpper = input.value.toUpperCase();
      control.setValue(valorUpper, { emitEvent: false });
    }
  }

  saveCliente(): void {
    // Limpiar y validar el documento según el tipo seleccionado
    const rucControl = this.formCliente.get('ruc');
    const tipoDocControl = this.formCliente.get('tipoDocumento');
    
    if (!tipoDocControl || !tipoDocControl.value) {
      this.spinner.hide();
      Swal.fire({
        title: 'Error de validación',
        html: `<div style="font-size: calc(1em - 2px);">Debe seleccionar un tipo de documento.</div>`,
        icon: 'error',
        confirmButtonColor: '#17a2b8',
        confirmButtonText: 'Ok',
      });
      return;
    }

    const config = this.getConfiguracionDocumento();
    const rucRaw = rucControl?.value || '';
    
    let documentoLimpio = rucRaw.toString();
    if (config.requiereValidacionExacta) {
      documentoLimpio = documentoLimpio.replace(/\D/g, '');
    } else {
      documentoLimpio = documentoLimpio.trim();
    }
    
    if (config.maxLength > 0 && documentoLimpio.length > config.maxLength) {
      documentoLimpio = documentoLimpio.substring(0, config.maxLength);
    }

    // Validar según el tipo de documento
    if (config.requiereValidacionExacta && config.longitudEsperada !== null) {
      if (!documentoLimpio || documentoLimpio.length !== config.longitudEsperada) {
        this.spinner.hide();
        if (rucControl) {
          rucControl.setErrors({ pattern: true });
          rucControl.markAsTouched();
        }
        const tipoDoc = this.getTipoDocumentoActual();
        const nombreTipo = tipoDoc?.descripcion || 'documento';
        const mensajeError = `El número de ${nombreTipo} debe tener exactamente ${config.longitudEsperada} ${config.requiereValidacionExacta ? 'dígitos' : 'caracteres'}.`;
        Swal.fire({
          title: 'Error de validación',
          html: `<div style="font-size: calc(1em - 2px);">${mensajeError}</div>`,
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
        return;
      }
    } else {
      // Para otros tipos, solo validar que tenga al menos 1 carácter
      if (!documentoLimpio || documentoLimpio.length < 1) {
        this.spinner.hide();
        if (rucControl) {
          rucControl.setErrors({ pattern: true });
          rucControl.markAsTouched();
        }
        Swal.fire({
          title: 'Error de validación',
          html: `<div style="font-size: calc(1em - 2px);">El número de documento es requerido.</div>`,
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
        return;
      }
    }

    // Convertir campos de texto a mayúsculas antes de enviar
    const formValue = this.formCliente.value;
    
    // Si no hay ciudad pero hay ubigeo seleccionado, usar el distrito como ciudad
    let ciudadValue = formValue.ciudad ? formValue.ciudad.toString().toUpperCase() : '';
    if (!ciudadValue && this.ubigeo()?.departamento) {
      // ubigeo.departamento en BD = DISTRITO (real)
      ciudadValue = this.ubigeo()!.departamento.toUpperCase();
    }
    
    const data: NuevoCliente = {
      ...formValue,
      ruc: documentoLimpio, // Usar el documento limpio
      razon: formValue.razon ? formValue.razon.toString().toUpperCase() : '',
      direccion: formValue.direccion ? formValue.direccion.toString().toUpperCase() : '',
      telefono: formValue.telefono ? formValue.telefono.toString().toUpperCase() : '',
      ciudad: ciudadValue,
      contacto: formValue.contacto ? formValue.contacto.toString().toUpperCase() : '',
      telefonoContacto: formValue.telefonoContacto ? formValue.telefonoContacto.toString().toUpperCase() : '',
      correo: formValue.correo ? formValue.correo.toString().toUpperCase() : '',
      ubigeo: this.ubigeo()?.ubigeo,
      condicion: formValue.condicion ? formValue.condicion.toString() : '',
    };

    // Crear cliente directamente sin confirmación
    this.spinner.show();
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
          const mensaje = resp.message || 'No se pudo crear el cliente. Por favor, intente nuevamente.';
          Swal.fire({
            title: 'Error al crear el cliente',
            text: mensaje,
            icon: 'error',
            confirmButtonColor: '#17a2b8',
            confirmButtonText: 'Ok',
          });
        }
      },
      error: (err) => {
        this.spinner.hide();
        
        console.log('Error completo:', err);
        console.log('err.error:', err.error);
        
        // Mostrar errores de validación específicos si están disponibles
        let mensajeError = 'Ocurrió un error al crear el cliente.';
        
        if (err.error) {
          // Manejar errores de validación de ModelState (estructura: { success: false, message: "...", errors: [{ field: "...", errors: [...] }] })
          if (err.error.errors && Array.isArray(err.error.errors)) {
            const errores: string[] = [];
            
            err.error.errors.forEach((e: any) => {
              // Manejar estructura: { field: "...", errors: [...] }
              if (e.errors && Array.isArray(e.errors)) {
                const campo = (e.field || e.Field || '') as string;
                e.errors.forEach((mensaje: string) => {
                  if (campo) {
                    errores.push(`${campo}: ${mensaje}`);
                  } else {
                    errores.push(mensaje);
                  }
                });
              }
              // Manejar estructura alternativa: { Field: "...", Errors: [...] }
              else if (e.Errors && Array.isArray(e.Errors)) {
                const campo = (e.Field || e.field || '') as string;
                e.Errors.forEach((mensaje: string) => {
                  if (campo) {
                    errores.push(`${campo}: ${mensaje}`);
                  } else {
                    errores.push(mensaje);
                  }
                });
            }
              // Si tiene ErrorMessage directo
              else if (typeof e.ErrorMessage === 'string') {
                errores.push(e.ErrorMessage);
              }
              // Si es un string directo
              else if (typeof e === 'string') {
                errores.push(e);
              }
            });
            
            if (errores.length > 0) {
              mensajeError = errores.join('\n');
            }
          }
          // Manejar mensaje directo del backend
          else if (err.error.message && typeof err.error.message === 'string') {
          mensajeError = err.error.message;
            // Si hay detalle adicional, agregarlo
            if (err.error.detail && typeof err.error.detail === 'string') {
              mensajeError += `\n${err.error.detail}`;
            }
          }
          // Si el error es directamente un string
          else if (typeof err.error === 'string') {
            mensajeError = err.error;
          }
        }

        Swal.fire({
          title: 'Error al crear el cliente',
          html: `<div style="font-size: calc(1em - 2px);">${mensajeError.replace(/\n/g, '<br>')}</div>`,
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
    
    // Auto-completar Ciudad con la descripción del Distrito (ubigeo.departamento en BD)
    const ciudadControl = this.formCliente.controls['ciudad'];
    if (ciudadControl && ubigeo.departamento) {
      ciudadControl.setValue(ubigeo.departamento.toUpperCase(), { emitEvent: false });
    }
  }
}

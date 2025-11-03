import { CommonModule, Location } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { VentasService } from '../../services/ventas.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Pedido, ProductoPedido } from '../../../../../models/Pedido';
import { jsPDF } from 'jspdf';
import { Usuario } from '../../../../../models/User';
import { environment } from '../../../../../environments/environment';
import { UserService } from '../../services/user.service';
import Swal from 'sweetalert2';
import { Empresa } from '../../../../../models/Empresa';
import { isEmpty, isNull } from 'lodash';

@Component({
  selector: 'app-imprimir-pedido',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    NgxSpinnerModule,
  ],
  templateUrl: './imprimir-pedido.component.html',
  styleUrl: './imprimir-pedido.component.scss',
  standalone: true,
})
export class ImprimirPedidoComponent {
  pedido?: Pedido;
  productos?: ProductoPedido[] = [];
  numPedido: string = '';
  usuario = signal<Usuario | null>(null);
  empresa = signal<Empresa | null>(null);
  logoEmpresa = signal<string>('');
  constructor(
    private spinner: NgxSpinnerService,
    private pedidos: VentasService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.numPedido = this.route.snapshot.paramMap.get('numPedido')!;
  }

  ngOnInit(): void {
    this.spinner.show('img_loader');
    this.getPedido(this.numPedido);
    this.getPedidoProductos(this.numPedido);
    this.getUserLogin();
    this.getEmpresa();
  }

  onLogoLoaded() {
    console.log('image was loaded');
    this.spinner.hide('img_loader');
  }

  getPedido(numPedido: string): void {
    this.spinner.show();
    this.pedidos.getPedido(numPedido).subscribe({
      next: (resp) => {
        const pedido = resp;
        if (!isNull(resp.dirPed) && !isEmpty(resp.dirPed))
          pedido.dirPed = resp.dirPed!;
        else if (!isNull(resp.dirCliente) && !isEmpty(resp.dirCliente))
          pedido.dirPed = resp.dirCliente!;
        else pedido.dirPed = 'Sin dirección registrada.';

        if (!isNull(resp.telefonoCli) && !isEmpty(resp.telefonoCli))
          pedido.telefonoCli = resp.telefonoCli!;
        else if (!isNull(resp.telefonoCliAux) && !isEmpty(resp.telefonoCliAux))
          pedido.telefonoCli = resp.telefonoCliAux!;
        else pedido.telefonoCli = 'Sin teléfono registrado.';
        this.spinner.hide();

        if (!isNull(resp.condicionCli) && !isEmpty(resp.condicionCli))
          pedido.condicion = resp.condicionCli!;
        else if (!isNull(resp.condicion) && !isEmpty(resp.condicion))
          pedido.condicion = resp.condicion!;
        else pedido.condicion = '-';

        if (!isNull(resp.observaciones) && !isEmpty(resp.observaciones))
          pedido.observaciones = resp.observaciones!;
        else pedido.observaciones = '-';

        if (
          isNull(resp.ubigeoCli) ||
          isEmpty(resp.ubigeoCli) ||
          resp.ubigeoCli!.replaceAll(' ', '').length == 2
        ) {
          pedido.ubigeoCli = 'Ubigeo no registrado.';
        }
        this.pedido = pedido;
      },
      error: () => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error al obtener el pedido.',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  getUserLogin(): void {
    this.spinner.show('print_usuario');
    this.userService.getDataUserLogin().subscribe({
      next: (resp) => {
        this.logoEmpresa.set(
          `${environment.api.replace('/api/', '/public/')}${
            resp.empresaDefecto
          }.png`
        );
        this.usuario.set(resp);
        this.spinner.hide('print_usuario');
      },
      error: (err) => {
        this.spinner.hide('print_usuario');
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
    this.spinner.show('print_empresa');
    this.userService.getEmpresa().subscribe({
      next: (resp) => {
        this.empresa.set(resp);
        this.spinner.hide('print_empresa');
      },
      error: (err) => {
        this.spinner.hide('print_empresa');
        Swal.fire({
          title: 'Error al obtener información de la empresa..',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  getPedidoProductos(numPedido: string): void {
    this.spinner.show('print_productos');
    this.pedidos.getPedidoProductos(numPedido).subscribe({
      next: (resp) => {
        this.productos = resp;
        this.spinner.hide('print_productos');
      },
      error: () => {
        Swal.fire({
          title: 'Error al obtener los productos.',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
        this.spinner.hide('print_productos');
      },
    });
  }

  goBack() {
    this.router.navigate([`/dashboard/pages/ventas/${this.numPedido}`]);
  }

  async printPedido(numPedido: string, logoEmpresa: string) {
    // let base64Img = null;
    // try {
    //   base64Img = await imgToBase64WithContain(logoEmpresa, 100, 100);
    // } catch (e) {
    //   console.error(e);
    // }

    var pdf = new jsPDF({
      unit: 'px',
      format: [595, 842],
    });

    const source = document.getElementById('pedido-container');

    const margins = {
      top: 10,
      left: 10,
    };

    pdf.html(source!, {
      x: margins.left,
      y: margins.top,
      filename: 'test.pdf',
      callback(doc) {
        // if (!!base64Img) {
        //   pdf.addImage(
        //     base64Img as any,
        //     'PNG',
        //     margins.left + 10,
        //     margins.top + 10,
        //     50,
        //     50
        //   );
        // }

        doc.save(`${numPedido}.pdf`);
      },
    });
  }
}

const imgToBase64WithContain = (
  src: string,
  maxWidth: number,
  maxHeight: number
) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous'; // Evita problemas de CORS
    image.src = src;

    image.onload = () => {
      // Calcula las proporciones para simular `object-fit: contain`
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height);
      const canvasWidth = image.width * scale;
      const canvasHeight = image.height * scale;

      const canvas = document.createElement('canvas');
      canvas.width = maxWidth;
      canvas.height = maxHeight;

      const ctx = canvas.getContext('2d');

      // Limpia el canvas
      ctx!.clearRect(0, 0, maxWidth, maxHeight);

      // Centra y ajusta la imagen dentro del canvas
      const xOffset = (maxWidth - canvasWidth) / 2;
      const yOffset = (maxHeight - canvasHeight) / 2;

      ctx!.drawImage(image, xOffset, yOffset, canvasWidth, canvasHeight);

      resolve(canvas.toDataURL('image/png'));
    };

    image.onerror = () => reject('Error loading image');
  });

import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { VentasService } from '../../services/ventas.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Pedido, ProductoPedido } from '../../../../../models/Pedido';
import { MatSnackBar } from '@angular/material/snack-bar';
import { jsPDF } from 'jspdf';
@Component({
  selector: 'app-detalle-pedido',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    NgxSpinnerModule,
  ],
  templateUrl: './detalle-pedido.component.html',
  styleUrl: './detalle-pedido.component.scss',
  standalone: true,
})
export class DetallePedidoComponent {
  pedido?: Pedido;
  productos?: ProductoPedido[] = [];
  numPedido: string = '';
  private _snackBar = inject(MatSnackBar);
  constructor(
    private spinner: NgxSpinnerService,
    private pedidos: VentasService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.numPedido = this.route.snapshot.paramMap.get('numPedido')!;
  }

  ngOnInit(): void {
    this.getPedido(this.numPedido);
    this.getPedidoProductos(this.numPedido);
  }

  getPedido(numPedido: string): void {
    this.spinner.show();
    this.pedidos.getPedido(numPedido).subscribe({
      next: (resp) => {
        this.pedido = resp;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        this._snackBar.open('Ocurrió un error al cargar el pedido.', 'OK', {
          duration: 3000,
        });
      },
    });
  }

  getPedidoProductos(numPedido: string): void {
    this.spinner.show('products');
    this.pedidos.getPedidoProductos(numPedido).subscribe({
      next: (resp) => {
        this.productos = resp;
        console.log('Productos: ', resp);
        this.spinner.hide('products');
      },
      error: () => {
        this._snackBar.open(
          'Ocurrió un error al cargar el detalle del pedido.',
          'OK',
          {
            duration: 3000,
          }
        );
        this.spinner.hide('products');
      },
    });
  }

  goBack() {
    this.router.navigate([`/dashboard/pages/ventas`]);
  }

  printPedido() {
    const doc = new jsPDF({});
  }
}

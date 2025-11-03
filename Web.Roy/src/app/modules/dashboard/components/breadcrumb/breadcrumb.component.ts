import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  imports: [RouterModule],
})
export class BreadcrumbComponent implements OnInit {
  @Input() nameLinkActual: string = '';

  constructor() {}

  ngOnInit(): void {}
}

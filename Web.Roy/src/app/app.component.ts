import {
  CurrencyPipe,
  DatePipe,
  HashLocationStrategy,
  LocationStrategy,
} from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  LOCALE_ID,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [
    CookieService,
    {
      provide: LOCALE_ID,
      useValue: 'es-PE',
    },
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    {
      provide: DatePipe,
    },
    {
      provide: CurrencyPipe,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppComponent {
  title = 'Web.Roy';
}

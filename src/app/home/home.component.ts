import { AfterContentChecked, Component } from '@angular/core';

// declare var Materialize: any;

@Component({
  selector: 'qddt-home',
  moduleId: module.id,
  providers: [],
  templateUrl: './home.component.html',
})

export class HomeComponent implements AfterContentChecked {


  ngAfterContentChecked(): void {
    // Materialize.updateTextFields();
  }
}

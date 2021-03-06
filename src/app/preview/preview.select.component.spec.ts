import { Component, Input } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { API_BASE_HREF } from '../api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterializeModule } from 'angular2-materialize';
import { PreviewService } from '../preview/preview.service';
import { PreviewSelectComponent } from './preview.select.component';
import { ElementKind } from '../interfaces/elements';

export function main() {
  describe('Publication select component', () => {
    //
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [ PreviewSelectComponent, ResponsedomainPreviewComponent,
        PublicationPreviewComponent ],
        providers: [
          { provide: PreviewService, useClass: PublicationServiceSpy },
          {
            provide: API_BASE_HREF,
            useValue: '<%= API_BASE %>'
          }
        ],
        imports: [CommonModule, FormsModule, MaterializeModule]
      });
    });

    it('should work with null',
      async(() => {
        TestBed
          .compileComponents()
          .then(() => {
            const fixture = TestBed.createComponent(PreviewSelectComponent);
            fixture.detectChanges();
            const de: any = fixture.debugElement.queryAll(By.css('div'));
            expect(de.length).toBeGreaterThan(1);
          });
      }));

    it('should work with element',
      async(() => {
        TestBed
          .compileComponents()
          .then(() => {
            const fixture = TestBed.createComponent(PreviewSelectComponent);
            const element: any = {
                'id' : '7f000101-54aa-131e-8154-aa27fc230000',
                'modified' : [ 2016, 9, 8, 15, 21, 26, 254000000 ],
                'name' : 'one questionitem',
                'description' : 'one questionitem',
                'question': {'question': 'test'},
                'basedOnObject' : null,
                'basedOnRevision' : null,
                'version' : {'major' : 6, 'minor' : 0, 'versionLabel' : '', 'revision' : null },
                'changeKind' : 'CONCEPTUAL',
                'changeComment' : 'Information added',
                'classKind' : 'PUBLICATION'
            };
            fixture.componentInstance.element = element;
            fixture.componentInstance.ngOnChanges();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
              expect(fixture.componentInstance.elementRevisions.length).toBe(1);
            });
          });
      }));
  });
}

// override dependencies
class PublicationServiceSpy {
  getElementRevisions = jasmine.createSpy('getElementRevisions').and.callFake(function (key) {
    return [];
  });
}

@Component({
  selector: 'qddt-preview-responsedomain',
  template: `<div></div>`
})

class ResponsedomainPreviewComponent {
  @Input() isVisible: boolean;
  @Input() responseDomain: any;
}
//
// @Component({
//   selector: 'qddt-preview-element',
//   template: `<div></div>`
// })

class PublicationPreviewComponent {
  @Input() element: any;
  @Input() elementType: any;
}

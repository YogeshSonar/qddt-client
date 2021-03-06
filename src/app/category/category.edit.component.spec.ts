import { Component, Input, EventEmitter, Output } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { CategoryService } from './category.service';
import { CategoryEditComponent } from './category.edit.component';
import { API_BASE_HREF } from '../api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterializeModule } from 'angular2-materialize';

export function main() {
  describe('Category edit component', () => {
    //
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [RevisionDetailComponent, RationalComponent,
          CategoryEditComponent, AutocompleteComponent],
        providers: [
          { provide: CategoryService, useClass: CategoryServiceSpy },
          {
            provide: API_BASE_HREF,
            useValue: '<%= API_BASE %>'
          }
        ],
        imports: [CommonModule, FormsModule, MaterializeModule]
      });
    });

    it('should work with null category',
      async(() => {
        TestBed
          .compileComponents()
          .then(() => {
            const fixture = TestBed.createComponent(CategoryEditComponent);
            fixture.componentInstance.isVisible = true;
            fixture.detectChanges();
            const de: any = fixture.debugElement.queryAll(By.css('div'));
            expect(de.length).toBeGreaterThan(0);
          });
      }));

    it('should save category',
      async(() => {
        TestBed
          .compileComponents()
          .then(() => {
            const fixture = TestBed.createComponent(CategoryEditComponent);
            fixture.componentInstance.isVisible = true;
            const category: any = {
              'id' : '7f000101-54aa-131e-8154-aa27fc230000',
              'modified' : [ 2016, 9, 8, 15, 21, 26, 254000000 ],
              'name' : 'one category',
              'label' : 'one category',
              'basedOnObject' : null,
              'basedOnRevision' : null,
              'version' : {'major' : 6, 'minor' : 0, 'versionLabel' : '', 'revision' : null },
              'changeKind' : 'CONCEPTUAL',
              'changeComment' : 'Information added'
            };
            fixture.componentInstance.category = category;
            fixture.componentInstance.categories = [category];
            fixture.detectChanges();
            fixture.whenStable().then(() => {
              const textarea: any = fixture.debugElement.queryAll(By.css('textarea'));
              expect(textarea.length).toBeGreaterThan(0);
              expect(textarea[0].nativeNode.value).toContain('category');
              fixture.componentInstance.onSave();
              fixture.detectChanges();
              fixture.whenStable().then(() => {
                expect(fixture.componentInstance.categories.length).toBe(1);
                expect(fixture.componentInstance.categories[0].label).toBe('test');
              });
            });
          });
      }));
  });
}

// override dependencies
class CategoryServiceSpy {
  edit = jasmine.createSpy('edit').and.callFake(function (key) {
    return [];
  });
}

@Component({
  selector: 'qddt-element-footer',
  template: `<div></div>`
})

class RevisionDetailComponent {
  @Input() element: any;
  @Input() type: any;
}

@Component({
  selector: 'qddt-rational',
  template: `<div></div>`
})

class RationalComponent {
  @Input() element: any;
  @Input() config: any;
}

// @Component({
//   selector: 'qddt-revision',
//   template: `<div></div>`
// })

class RevisionComponent {
  @Input() isVisible: any;
  @Input() config: any;
  @Input() qddtURI: any;
  @Input() current: any;
}

@Component({
  selector: 'qddt-auto-complete',
  template: `<div></div>`
})

class AutocompleteComponent {
  @Input() items:  any[];
  @Input() searchField: any;
  @Input() placeholder: string;
  @Input() isMultipleFields: boolean;
  @Input() initialValue: string;
  @Input() searchFromServer: boolean;
  @Output() selectEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() focusEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() enterEvent: EventEmitter<any> = new EventEmitter<any>();
}

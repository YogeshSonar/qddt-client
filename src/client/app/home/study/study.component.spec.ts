import { Component, Input, PipeTransform, Pipe } from '@angular/core';
import { BaseRequestOptions, Response, ResponseOptions, Http, ConnectionBackend } from '@angular/http';
import { TestBed, async } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { By } from '@angular/platform-browser';

import { StudyService } from './study.service';
import { StudyComponent } from './study.component';
import { API_BASE_HREF } from '../../api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export function main() {
  describe('Study component', () => {
    //
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [StudyComponent, RevisionComponent, LocalDatePipe,
          StudyEditComponent, CommentListComponent, AuthorChipComponent],
        providers: [
          MockBackend,
          BaseRequestOptions,
          { provide: StudyService, useClass: StudyServiceSpy },
          {
            provide: Http,
            useFactory: (backend: ConnectionBackend, options: BaseRequestOptions) => new Http(backend, options),
            deps: [MockBackend, BaseRequestOptions]
          },
          {
            provide: API_BASE_HREF,
            useValue: '<%= API_BASE %>'
          }
        ],
        imports: [CommonModule, FormsModule]
      });
    });

    it('should work with null study',
      async(() => {
        TestBed
          .compileComponents()
          .then(() => {
            const fixture = TestBed.createComponent(StudyComponent);
            // fixture.componentInstance.show = true;
            fixture.detectChanges();
            const de: any = fixture.debugElement.queryAll(By.css('a'));
            expect(de.length).toBeGreaterThan(1);
          });
      }));

    it('should work with studies',
      async(() => {
        TestBed
          .compileComponents()
          .then(() => {
            const fixture = TestBed.createComponent(StudyComponent);
            // fixture.componentInstance.show = true;
            // fixture.componentInstance.survey = {
            //     'id': '1',
            //     'name': 'NAme',
            //     'description': 'desc',
            //     'modified': [2016, 9, 8, 15, 21, 26, 254000000],
            //     'archived': false,
            //     'studies': [{
            //         'id': '7f000101-54aa-131e-8154-aa27fc230000',
            //         'modified': [2016, 9, 8, 15, 21, 26, 254000000],
            //         'name': 'The European Social Survey (ESS)',
            //         'basedOnObject': null,
            //         'basedOnRevision': null,
            //         'version': { 'major': 6, 'minor': 0, 'versionLabel': '', 'revision': null },
            //         'changeKind': 'CONCEPTUAL',
            //         'changeComment': 'Information added'
            //     }]
            // };
            const mockBackend = TestBed.get(MockBackend);
            mockBackend.connections.subscribe((c: any) => {
              c.mockRespond(new Response(new ResponseOptions({
                body: '[{'
                + '"id" : "7f000101-54aa-131e-8154-aa27fc230000",'
                + '"modified" : [ 2016, 9, 8, 15, 21, 26, 254000000 ],'
                + '"name" : "The European Social Survey (ESS)",'
                + '"basedOnObject" : null,'
                + '"basedOnRevision" : null,'
                + '"version" : {"major" : 6, "minor" : 0, "versionLabel" : "", "revision" : null },'
                + '"changeKind" : "CONCEPTUAL",'
                + '"changeComment" : "Information added"'
                + '}]'
              })));
            });
            fixture.componentInstance.ngOnInit();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
              const h5: any = fixture.debugElement.queryAll(By.css('h5'));
              expect(h5.length).toBeGreaterThan(0);
              expect(h5[0].nativeNode.textContent).toContain('ESS');
            });
          });
      }));
  });
}

//override dependencies
class StudyServiceSpy {
  getAll = jasmine.createSpy('getAll').and.callFake(function (key) {
    return [];
  });
}

@Component({
  selector: 'qddt-comment-list',
  template: `<div></div>`
})

class CommentListComponent {
  @Input() ownerId: any;
  @Input() comments: any[];
}

@Component({
  selector: 'qddt-study-edit',
  template: `<div></div>`
})

class StudyEditComponent {
  @Input() study: any;
  @Input() isVisible: boolean;
  @Input() surveyId: any;
}


class RevisionComponent {
  @Input() isVisible: any;
  @Input() config: any;
  @Input() qddtURI: any;
  @Input() current: any;
}

@Component({
  selector: 'qddt-author-chip',
  template: `<div></div>`
})

class AuthorChipComponent {
  @Input() authors: any;
}

@Pipe({
  name: 'localDate',
  pure: true
})
export class LocalDatePipe implements PipeTransform {

  transform(input: Array<number>): string {
    return '';
  }
}

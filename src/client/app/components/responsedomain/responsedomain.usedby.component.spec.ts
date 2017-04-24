import { Component, Input, PipeTransform, Pipe } from '@angular/core';
import { BaseRequestOptions, Response, ResponseOptions, Http, ConnectionBackend } from '@angular/http';
import { TestBed, async } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { By } from '@angular/platform-browser';

import { ResponseDomainService } from './responsedomain.service';
import { BaseService } from '../../common/base.service';
import { ResponsedomainUsedbyComponent } from './responsedomain.usedby.component';
import { API_BASE_HREF } from '../../api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable }     from 'rxjs/Observable';

export function main() {
  describe('Responsedomain usedby component', () => {
    //
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [ResponsedomainUsedbyComponent, AuthorChipComponent],
        providers: [
          MockBackend,
          BaseRequestOptions,
          { provide: ResponseDomainService, useClass: ResponseDomainServiceSpy },
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

    it('should work with null id',
      async(() => {
        TestBed
          .compileComponents()
          .then(() => {
            let fixture = TestBed.createComponent(ResponsedomainUsedbyComponent);
            fixture.detectChanges();
            let de: any = fixture.debugElement.queryAll(By.css('div'));
            expect(de.length).toBe(0);
          });
      }));

    it('should work with id',
      async(() => {
        TestBed
          .compileComponents()
          .then(() => {
            let fixture = TestBed.createComponent(ResponsedomainUsedbyComponent);
            fixture.componentInstance.id = '7f000101-54aa-131e-8154-aa27fc230000';
            let mockBackend = TestBed.get(MockBackend);
            mockBackend.connections.subscribe((c: any) => {
              c.mockRespond(new Response(new ResponseOptions({
                body: '{'
                + '"id" : "7f000101-54aa-131e-8154-aa27fc230000",'
                + '"modified" : [ 2016, 9, 8, 15, 21, 26, 254000000 ],'
                + '"name" : "one responsedomain",'
                + '"basedOnObject" : null,'
                + '"responseCardinality" : { "minimum" : "1", "maximum" : "1" },'
                + '"responseKind" : "LIST",'
                + '"managedRepresentation": {"categoryType": "LIST", "children": [],"inputLimit" : { "minimum" : "1", "maximum" : "2" }},'
                + '"basedOnRevision" : null,'
                + '"version" : {"major" : 6, "minor" : 0, "versionLabel" : "", "revision" : null },'
                + '"changeKind" : "CONCEPTUAL",'
                + '"changeComment" : "Information added"'
                + '}'
              })));
            });
            fixture.componentInstance.ngOnInit();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
              let h4: any = fixture.debugElement.queryAll(By.css('h4'));
              expect(h4.length).toBeGreaterThan(0);
              expect(h4[0].nativeNode.textContent).toContain('Responsedomain');
              let responsedomain = fixture.componentInstance.responsedomain;
              expect(responsedomain.name).toContain('one responsedomain');
            });
          });
      }));
  });
}

class ResponseDomainServiceSpy {
  getResponseDomain = jasmine.createSpy('getResponseDomain').and.callFake(function (key) {
    return Observable.of({});
  });
}

@Component({
  selector: 'qddt-author-chip',
  template: `<div></div>`
})

class AuthorChipComponent {
  @Input() authors: any;
}

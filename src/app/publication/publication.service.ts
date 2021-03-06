import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { API_BASE_HREF } from '../api';
import { ElementKind, QDDT_ELEMENTS, ElementRevisionRef, QddtElement } from '../interfaces/elements';



export const PUBLICATION_TYPES: QddtElement[] = [
  QDDT_ELEMENTS[ElementKind.TOPIC_GROUP],
  QDDT_ELEMENTS[ElementKind.CONCEPT],
  QDDT_ELEMENTS[ElementKind.QUESTION_ITEM],
  QDDT_ELEMENTS[ElementKind.QUESTION_CONSTRUCT],
  QDDT_ELEMENTS[ElementKind.SEQUENCE_CONSTRUCT],
];


export class Publication {
  id: string;
  name: string;
  purpose: string;
  status: string;
  publicationElements: ElementRevisionRef[];
  constructor() {
    this.publicationElements = [];
  }
}

export class PublicationStatus {
  id: number;
  name: string;
  label: string;
  description: string;
  children?: PublicationStatus[];

  public constructor(init?: Partial<PublicationStatus>) {
    Object.assign(this, init);
  }
}


@Injectable()
export class PublicationService {

  public PUBLICATION_STATUSES: PublicationStatus[];
  private statusList: PublicationStatus[] = [];

  readonly pageSize = '&size=10';

  constructor(protected http: HttpClient, @Inject(API_BASE_HREF) protected api: string) {
    if (!this.PUBLICATION_STATUSES) {
      this.getPublicationStatus().then(
        result => {
          this.PUBLICATION_STATUSES = result;
          this.PUBLICATION_STATUSES.forEach( s => {
            this.statusList.push( new PublicationStatus( {id: s.id, label: s.label, name: s.name, description: s.description } ) );
            if (s.children) {
              s.children.forEach(s1 =>
                this.statusList.push( new PublicationStatus( {id: s1.id, label: s1.label, name: s1.name, description: s1.description }) ));
            }
          });
        },
        error => { throw error; });
    }
  }

/*
  getElementRevisions(elementKind: ElementKind, id: string): Promise<any> {
    const e: any = PUBLICATION_TYPES.find(qe => qe.id === elementKind);
    if (e !== undefined) {
      if (elementKind === ElementKind.CONCEPT || elementKind === ElementKind.TOPIC_GROUP) {
        return this.http.get(this.api + 'audit/' + e.path + '/' + id + '/allinclatest').toPromise();
      } else {
        return this.http.get(this.api + 'audit/' + e.path + '/' + id + '/all').toPromise();
      }
    }
    return new Promise(null);
  }
*/

  public getAll(page: String = '0'): Promise<Publication[]> {
    return this.http.get<Publication[]>(this.api + 'publication/page/' + this.pageSize).toPromise();
  }

  public getPublication(id: string): Promise<any> {
    return this.http.get(this.api + 'publication/' + id).toPromise();
  }

  public getPublicationStatusAsList(): PublicationStatus[] {
    return this.statusList;
  }

  public getStatusByName(name: String): PublicationStatus {
    return this.getPublicationStatusAsList().find(e => e.name === name );
  }

  public getStatusById(id: number): PublicationStatus {
    return this.getPublicationStatusAsList().find(e => e.id === id );
  }

  public  getFile(id: string): Promise<Blob> {
    return this.http.get(this.api + 'othermaterial/files/' + id, {responseType: 'blob'})
      .toPromise();
  }

  public getPdf(id: string): Promise<Blob> {
    return this.http.get(this.api + 'publication/pdf/' + id, {responseType: 'blob'})
      .toPromise();
  }

  public searchPublications(name: string = '', page: String = '0', sort: String = ''): Promise<Publication[]> {
    const queries: any[] = [];
    if (name.length > 0) {
      queries.push('name=' + '*' + name + '*' + '&status=' + '*' + name + '*');
    }
    if (sort.length > 0) {
      queries.push('sort=' + sort);
    }
    if (page !== '0') {
      queries.push('page=' + page);
    }
    let query = '';
    if (queries.length > 0) {
      query = '?' + queries.join('&');
    }
    return this.http.get<Publication[]>(this.api + 'publication/page/search/' + query).toPromise();
  }

  public searchElements(elementKind: ElementKind, name: string): Promise<any> {
    let query = '?';
    const pt  = PUBLICATION_TYPES.find(qe => qe.id === elementKind);
    if (pt) {
      if (name.length > 0) {
        const fields = pt.fields;
        for (let i = 0; i < fields.length; i++) {
          query += '&' + fields[i] + '=*' + name + '*';
        }
      }
      if (pt.parameter) {
        query += pt.parameter;
      }
      return this.http.get(this.api + pt.path + '/page/search/' + query).toPromise();
    }
    return null;
  }

  public create(publication: Publication): Observable<Publication> {
    return this.http.post<Publication>( this.api + 'publication/create/', publication);
  }

  public update(publication: Publication): Observable<Publication> {
    return this.http.post<Publication>(this.api + 'publication/', publication);
  }

  private getPublicationStatus(): Promise<PublicationStatus[]> {
    return this.http.get<PublicationStatus[]>(this.api + 'publicationstatus/list').toPromise();
  }

}

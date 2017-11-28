import { Injectable, Inject } from '@angular/core';
import { Http, RequestOptions, Headers, ResponseContentType } from '@angular/http';
import { API_BASE_HREF } from '../../api';
import { BaseService } from '../../shared/base.service';

export class SurveyProgram {
  id: string;
  name: string;
  description: string;
  modified: any;
}

@Injectable()
export class SurveyService extends BaseService {

  constructor(protected http:Http, @Inject(API_BASE_HREF) protected api:string) {
    super(http ,api);
  }

  create(surveyProgram: SurveyProgram): any {
    return this.post(surveyProgram, 'surveyprogram/create');
  }

  save(surveyProgram: SurveyProgram): any {
    return this.post(surveyProgram, 'surveyprogram/');
  }

  getAll():any {
    return this.get('surveyprogram/list/by-user');
  }

  getPdf(id: string): any {
    let headers = new Headers();
    let jwt = localStorage.getItem('jwt');
    if(jwt !== null) {
      headers.append('Authorization', 'Bearer  ' + JSON.parse(jwt).access_token);
    }
    let options = new RequestOptions({ headers: headers, responseType: ResponseContentType.Blob });
    return this.http.get(this.api + 'surveyprogram/pdf/' + id, options)
      .map(res => res.blob())
      .catch(this.handleError);
  }
}

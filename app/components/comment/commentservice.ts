import {Injectable} from 'angular2/angular2';
import {Http, Headers, Response} from 'angular2/http';

export class Comment {
  id: string;
  ownerId: string;
  comment: string;
  createdBy: any;
}

@Injectable()
export class CommentService {

  constructor(private http: Http) {
    this.http = http;
  }

  save(comment: Comment): any {
    var headers = new Headers();
    headers.append('Authorization', 'Bearer  '+ JSON.parse(localStorage.getItem('jwt')).access_token);
    headers.append('Content-Type', 'application/json');

    return this.http.post('http://localhost:8080/comment/create/' + comment.ownerId,
      JSON.stringify(comment),
      {
        headers: headers
      })
      .map((res:Response) => {
        return res.json();
      });
  }

  getAll(ownerId: string): any {
    var headers = new Headers();
    headers.append('Authorization', 'Bearer  ' + JSON.parse(localStorage.getItem('jwt')).access_token);
    headers.append('Content-Type', 'application/json');

    return this.http.get('http://localhost:8080/comment/by-owner/' + ownerId + '?page=0&size=20&sort=asc',
      {
        headers: headers
      })
      .map((res:Response) => {
        return res.json();
      });
  }

}

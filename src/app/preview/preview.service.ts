import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_HREF } from '../api';
import { Observable } from 'rxjs/Observable';

export function ElementEnumAware(constructor: Function) {
  constructor.prototype.ElementKind = ElementKind;
}

export interface IRevisionRef {
  id: any;
  revisionNumber: number;
  elementKind: ElementKind|String;
}

export interface IElementRef {
  element: any;
  elementKind: ElementKind|String;
}

export class ElementRevisionRef implements IRevisionRef, IElementRef {
  element: any;
  elementKind: ElementKind|String;
  id: any;
  revisionNumber: number;
  name?: string;
  version?: any;
}

export enum ElementKind {
  CATEGORY = 0,
  CONCEPT,
  CONDITION_CONSTRUCT,
  QUESTION_CONSTRUCT,
  SEQUENCE_CONSTRUCT,
  STATEMENT_CONSTRUCT,
  INSTRUMENT,
  PUBLICATION,
  QUESTION_GRID,
  QUESTION_ITEM,
  RESPONSEDOMAIN,
  STUDY,
  SURVEY_PROGRAM,
  TOPIC_GROUP,
  INSTRUCTION,
  UNIVERSE
}

export class QddtElement {
  id: ElementKind;
  label: string;
  path: string;
  fields: any[];
  parameter: string;

  constructor(id: ElementKind, label: string, path: string, fields: any[], parameter: string) {
    this.id = id;
    this.label = label;
    this.path = path;
    this.fields = fields;
    this.parameter = parameter;
  }

  isMultipleFields(): boolean {
    return (this.fields.length > 1);
  }

  placeholder(): string {
    let message = 'Searches in [';
    this.fields.forEach(o => {
      message += o + ' and ';
    });
    return message.slice(0, message.length - 5) + ']';
  }
}

export const QddtElements: QddtElement[] = [
  new QddtElement(ElementKind.CATEGORY, 'Category', 'category', ['name'], null),
  new QddtElement(ElementKind.CONCEPT, 'Concept', 'concept', ['name'], null),
  new QddtElement(ElementKind.CONDITION_CONSTRUCT, 'Condition', 'controlconstruct', ['name', 'condition'],
     '&constructkind=CONDITION_CONSTRUCT'),
  new QddtElement(ElementKind.QUESTION_CONSTRUCT, 'QuestionConstruct', 'controlconstruct', ['name', ['questionItem', 'name']],
     '&constructkind=QUESTION_CONSTRUCT'),
  new QddtElement(ElementKind.SEQUENCE_CONSTRUCT, 'Sequence', 'controlconstruct', ['name'],
     '&constructkind=SEQUENCE_CONSTRUCT'),
  new QddtElement(ElementKind.STATEMENT_CONSTRUCT, 'Statement', 'controlconstruct', ['name', 'description'],
     '&constructkind=STATEMENT_CONSTRUCT'),
  new QddtElement(ElementKind.INSTRUMENT, 'Instrument', 'instrument', ['label', 'description'], null),
  new QddtElement(ElementKind.PUBLICATION, 'Publication', 'publication', ['name', 'purpose'], null),
  new QddtElement(ElementKind.QUESTION_GRID, 'QuestionGrid', 'questiongrid', ['name', 'question'], null),
  new QddtElement(ElementKind.QUESTION_ITEM, 'QuestionItem', 'questionitem', ['name', 'question'], null),
  new QddtElement(ElementKind.RESPONSEDOMAIN, 'ResponseDomain', 'responsedomain', ['name', 'description'], null),
  new QddtElement(ElementKind.STUDY, 'Study', 'study', ['name', 'description'], null),
  new QddtElement(ElementKind.SURVEY_PROGRAM, 'Survey', 'surveyprogram', ['name', 'description'], null),
  new QddtElement(ElementKind.TOPIC_GROUP, 'Module', 'topicgroup', ['name', 'abstractDescription'], null),
  new QddtElement(ElementKind.INSTRUCTION, 'Instruction', 'instruction', ['description'], null),
  new QddtElement(ElementKind.UNIVERSE, 'Universe', 'universe', ['description'], null),
];

@Injectable()
export class PreviewService {

  constructor(protected http: HttpClient,  @Inject(API_BASE_HREF) protected api: string) {  }

  getRevisionByKindString(kind: string, id: string, rev: string): Promise<any> {

    const et: any = QddtElements.find(e => ElementKind[e.id] === kind);
    return this.http.get(this.api + 'audit/' + et.path + '/' + id + '/' + rev).toPromise();

  }

  getRevisionByLabel(label: string, id: string, rev: string): Promise<any>  {

    const et: any = QddtElements.find(e => e.label === label);
    return this.http.get(this.api + 'audit/' + et.path + '/' + id + '/' + rev).toPromise();

  }

  getRevisionByKind(kind: ElementKind, id: string, rev: number): Promise<any>  {

    const et: any = QddtElements.find(e => e.id === kind);
    return this.http.get(this.api + 'audit/' + et.path + '/' + id + '/' + rev).toPromise();

  }

  getFile(id: string): Promise<any> {
    return this.http.get(this.api + 'othermaterial/files/' + id, { responseType: 'blob'})
      .toPromise();
  }

}

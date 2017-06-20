import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { QuestionService } from './question.service';
import { DomainType } from '../responsedomain/responsedomain.constant';
import { Observable }     from 'rxjs/Observable';
import { MaterializeAction } from 'angular2-materialize';
// import { PreviewConceptComponent } from '../publication/publication.concept.preview.component';

@Component({
  selector: 'qddt-questionitem-edit',
  moduleId: module.id,
  providers: [QuestionService],
  styles:[
    ':host /deep/ .hoverable .row { min-height:4rem; margin-bottom:0px;}'
  ],
  templateUrl:'./question.edit.component.html'
})

export class QuestionItemEditComponent implements OnInit {
  @Input() isVisible: boolean;
  @Input() questionitem: any;
  @Input() readonly: boolean;
  @Input() editResponseDomain: boolean;
  @Output() editQuestionItem: EventEmitter<any>;

  showbutton: any;
  editResponseDomainActions = new EventEmitter<string|MaterializeAction>();
  usedbyModalAction = new EventEmitter<string|MaterializeAction>();
  basedonActions = new EventEmitter<string|MaterializeAction>();
  privewResponseDomain: any;
  basedonObject: any;
  showResponseDomainForm: boolean;
  private mainResponseDomain: any;
  private mainresponseDomainRevision: number;
  private secondCS: any;
  private selectedType: string;
  private selectedElement: any;


  constructor(private service: QuestionService) {
    this.showResponseDomainForm = false;
    this.editQuestionItem = new EventEmitter<any>();
    this.mainresponseDomainRevision = 0;
    this.showbutton = false;
  }

  ngOnInit() {
    this.mainResponseDomain = null;
    this.secondCS = null;
    if(this.isNull(this.readonly)) {
      this.readonly = false;
    }
    if (!this.isNull(this.questionitem) && !this.isNull(this.questionitem.responseDomain)) {
      if (this.questionitem.responseDomain['responseKind'] === 'MIXED') {
        let rep = this.questionitem.responseDomain.managedRepresentation;
        for (let i = 0; i < rep.children.length; i++) {
          if (rep.children[i].categoryType === 'MISSING_GROUP') {
            this.secondCS = rep.children[i];
          } else {
            let rd = {};
            rd['id'] = new Date().toString();
            if (rep.children[i].categoryType === 'SCALE') {
              rd['domainType'] = DomainType.SCALE;
              rd['responseKind'] = 'SCALE';
            } else if (rep.children[i].categoryType === 'NUMERIC') {
              rd['domainType'] = DomainType.NUMERIC;
              rd['responseKind'] = 'NUMERIC';
            } else if (rep.children[i].categoryType === 'TEXT') {
              rd['domainType'] = DomainType.TEXT;
              rd['responseKind'] = 'TEXT';
            } else if (rep.children[i].categoryType === 'LIST') {
              rd['domainType'] = DomainType.LIST;
              rd['responseKind'] = 'LIST';
            }
            rd['name'] = rep.children[i]['name'] || '';
            rd['responseCardinality'] = {minimum: '1', maximum: '1'};
            rd['managedRepresentation'] = rep.children[i];
            this.mainResponseDomain = rd;
          }
        }
      } else {
        this.mainResponseDomain = this.questionitem.responseDomain;
        this.mainresponseDomainRevision = this.questionitem.responseDomainRevision || 0;
      }
    }
    this.buildPrivewResponseDomain();
  }

  onEditQuestionItem() {
    this.showResponseDomainForm = false;
    this.getMixedCategory().subscribe((result: any) => {
      this.getMixedResponseDomain(result).subscribe((result: any) => {
        this.questionitem.responseDomain = result;
        if(this.secondCS !== null) {
          this.questionitem.responseDomainRevision = 0;
        } else {
          this.questionitem.responseDomainRevision = this.mainresponseDomainRevision;
        }
        this.service.updateQuestionItem(this.questionitem)
          .subscribe((result: any) => {
            this.questionitem = result;
            this.editQuestionItem.emit(this.questionitem);
          });
      }, (err:any) => {console.log(err);});
    }, (err:any) => {console.log(err);});
    this.isVisible = false;
  }

  onEditMissing(missing: any) {
    this.secondCS = missing;
    this.buildPrivewResponseDomain();
  }

  onClickStudy(id: string) {
    this.selectedType = 'study';
    this.service.getStudyById(id)
      .subscribe((result: any) => {
        this.selectedElement = result;
        this.usedbyModalAction.emit({action:'modal', params:['open']});
      });
  }

  onClickTopic(id: string) {
    this.selectedType = 'topic';
    this.service.getTopicById(id)
      .subscribe((result: any) => {
        this.selectedElement = result;
        this.usedbyModalAction.emit({action:'modal', params:['open']});
      });
  }

  onClickConcept(id: string) {
    this.selectedType = 'concept';
    this.service.getConceptsById(id)
      .subscribe((result: any) => {
        this.selectedElement = result;
        this.usedbyModalAction.emit({action:'modal', params:['open']});
      });
  }

  onBasedonObjectDetail(id: string,rev: string) {
    this.service.getquestion(id)
      .subscribe(
      (result: any) => {
        this.basedonObject = result;
        this.basedonActions.emit({action:'modal', params:['open']});
      },
      (err: any) => null
      );
  }

  responseDomainReuse(item: any) {
    this.mainResponseDomain = item.responseDomain;
    this.mainresponseDomainRevision = item.responseDomainRevision || 0;
    this.showResponseDomainForm = false;
    document.getElementById('questionItem-modal-close').click();
    this.buildPrivewResponseDomain();
  }

  onRemoveResponsedomain(questionitem: any) {
    this.mainResponseDomain = null;
    this.secondCS = null;
    this.showResponseDomainForm = false;
    this.privewResponseDomain = null;
    this.questionitem.responseDomainRevision = 0;
    this.mainresponseDomainRevision = 0;
  }

  onClickEdit() {
    this.showResponseDomainForm = true;
    this.editResponseDomainActions.emit({action:'modal', params:['open']});
  }

  private getManagedRepresentation() {
    let rep: any = {};
    if (!this.isNull(this.secondCS)
      && (this.isNull(this.questionitem.responseDomain)
      || this.isNull(this.questionitem.responseDomain['managedRepresentation'])
      || this.questionitem.responseDomain['responseKind'] !== 'MIXED')) {
      rep = {};
      rep['categoryType'] = 'MIXED';
      rep['hierarchyLevel'] = 'GROUP_ENTITY';
      rep['name'] = rep['description'] = 'mixed category';
      rep['children'] = [];
    } else if (!this.isNull(this.questionitem.responseDomain)
      && !this.isNull(this.questionitem.responseDomain['managedRepresentation'])) {
      rep = this.questionitem.responseDomain['managedRepresentation'];
      rep['children'] = [];
    } else if (!this.isNull(this.mainResponseDomain)) {
      rep = this.mainResponseDomain['managedRepresentation'];
    }
    return rep;
  }

  private getMixedCategory() {
    let isMixed: boolean = !this.isNull(this.questionitem.responseDomain)
      && !this.isNull(this.questionitem.responseDomain['responseKind'])
      && this.questionitem.responseDomain['responseKind'] === 'MIXED';
    if (!this.isNull(this.secondCS) && !isMixed) {
      let rep = this.getManagedRepresentation();
      if (!this.isNull(this.mainResponseDomain)) {
        rep['children'].push(this.mainResponseDomain['managedRepresentation']);
      }
      if (!this.isNull(this.secondCS)) {
        rep['children'].push(this.secondCS);
      }
      return this.service.createCategory(rep);
    } else if (!this.isNull(this.secondCS) && isMixed) {
      let rep = this.getManagedRepresentation();
      this.updateChild(rep, this.secondCS, 'MISSING_GROUP');
      if (this.mainResponseDomain !== null) {
        this.updateChild(rep, this.mainResponseDomain['managedRepresentation'],
          this.mainResponseDomain['managedRepresentation'].categoryType);
      }
      return Observable.of(rep);
    } else if (this.isNull(this.mainResponseDomain) && this.isNull(this.secondCS)) {
      return Observable.of(null);
    } else if (isMixed && this.isNull(this.secondCS)) {
      let rep = this.questionitem.responseDomain['managedRepresentation'];
      this.deleteChild(rep, 'MISSING_GROUP');
      return Observable.of(rep);
    } else {
      let rep = this.getManagedRepresentation();
      return Observable.of(rep);
    }
  }

  private updateChild(representation: any, object: any, categoryType: string) {
    if (this.isNull(representation.children) || this.isNull(object)) {
      return;
    }
    let index = representation.children.findIndex((e: any) => e.categoryType === categoryType);
    if (index >= 0) {
      representation.children[index] = object;
    } else {
      representation.children.push(object);
    }
  }

  private deleteChild(representation: any, categoryType: string) {
    if (this.isNull(representation.children)) {
      return;
    }
    let index = representation.children.findIndex((e: any) => e.categoryType === categoryType);
    if (index >= 0) {
      representation.children.splice(index, 1);
    }
  }

  private getMixedResponseDomain(result: any) {
    if (!this.isNull(this.secondCS)
      && (this.isNull(this.questionitem.responseDomain)
        || this.questionitem.responseDomain['responseKind'] !== 'MIXED')) {
      let rd: any = {};
      rd['responseKind'] = 'MIXED';
      rd['description'] = '';
      rd['name'] = this.mainResponseDomain.name + ' + ' + this.secondCS.name;
      rd['managedRepresentation'] = result;
      if (!this.isNull(this.mainResponseDomain)) {
        rd['displayLayout'] = this.mainResponseDomain['displayLayout'];
      }
      this.updateCodeValues(rd['managedRepresentation']);
      return this.service.createResponseDomain(rd);
    } else if (this.isNull(this.mainResponseDomain) && this.isNull(this.secondCS)) {
      return Observable.of(null);
    } else if (!this.isNull(this.mainResponseDomain) && this.isNull(this.secondCS)) {
      return Observable.of(this.mainResponseDomain);
    }
    if(!this.isNull(this.questionitem.responseDomain)
      && !this.isNull(this.questionitem.responseDomain['managedRepresentation'])) {
      this.questionitem.responseDomain['managedRepresentation'] = result;
      if (!this.isNull(this.mainResponseDomain)) {
        this.questionitem.responseDomain['displayLayout'] = this.mainResponseDomain['displayLayout'];
      }
      this.updateCodeValues(this.questionitem.responseDomain['managedRepresentation']);
    } else {
      this.questionitem.responseDomain = this.mainResponseDomain;
    }
    return Observable.of(this.questionitem.responseDomain);
  }

  private updateCodeValues(representation: any) {
    for (let i = 0; i < representation.children.length; i++) {
      let category = representation.children[i];
      if (representation.children[i].categoryType === 'MISSING_GROUP') {
        for (let i = 0; i < category.children.length; i++) {
          category.children[i].code = this.secondCS.children[i].code;
        }
      } else {
        for (let i = 0; i < category.children.length; i++) {
          category.children[i].code = this.mainResponseDomain['managedRepresentation'].children[i].code;
        }
      }
    }
  }

  private isNull(object: any) {
    return object === undefined || object === null;
  }

  private buildPrivewResponseDomain() {
    if (this.mainResponseDomain === null && this.secondCS === null) {
      this.privewResponseDomain = null;
    } else if (this.mainResponseDomain !== null && this.secondCS === null) {
      this.privewResponseDomain = this.mainResponseDomain;
    } else {
      this.privewResponseDomain = {id: new Date().toString()};
      this.privewResponseDomain.managedRepresentation = {children: []};
      this.privewResponseDomain['responseKind'] = 'MIXED';
      this.privewResponseDomain['description'] = '';
      this.privewResponseDomain['name'] = '';
      if(this.mainResponseDomain !== null) {
        if(!this.isNull(this.questionitem.responseDomain)) {
          this.privewResponseDomain['displayLayout'] = this.questionitem.responseDomain['displayLayout'] || 0;
        }
        this.privewResponseDomain.managedRepresentation.children
          .push(this.mainResponseDomain.managedRepresentation);
      }
      if(this.secondCS !== null) {
        this.privewResponseDomain.managedRepresentation.children
          .push(this.secondCS);
      }
    }
  }

}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MaterializeAction } from 'angular2-materialize';
import { QuestionItem } from '../../question/question.service';
import { ElementKind } from '../../interfaces/elements';
import { HomeService, Concept } from '../home.service';
const filesaver = require('file-saver');

@Component({
  selector: 'qddt-concept-treenode',
  providers: [  ],
  moduleId: module.id,
  templateUrl: './concept-tree-node.component.html',
  styleUrls: ['./concept-tree-node.component.css']
})

export class TreeNodeComponent  {
  @Output() deleteConceptEvent: EventEmitter<any> = new EventEmitter();
  @Output() conceptUpdatedAction: EventEmitter<any> = new EventEmitter();
  @Input() concept: any;
  @Input() readonly = false;
  showConceptChildForm = false;
  showQuestionForm = false;
  questionItemActions = new EventEmitter<string|MaterializeAction>();
  private showbutton = false;
  private newchild: any;
  private questionItem: any;
  private revision: any;
  private revisionKind = ElementKind.CONCEPT;

  constructor(private conceptService: HomeService) {
    this.newchild = new Concept();
  }

  onCreateConcept(concept: any) {
    if (!this.readonly) {
      this.readonly = concept.archived;
    }
    this.showConceptChildForm = !this.showConceptChildForm;
  }

  onConceptSavedEvent(concept: any) {
    this.concept.version = concept.version;
    this.conceptUpdatedAction.emit(concept);
  }

  onConceptUpdated(concept: any) {
    this.conceptUpdatedAction.emit(concept);
  }

  onDeleteConcept(concept: any) {
    this.deleteConceptEvent.emit(concept);
  }

  onClickQuestionItem(questionItem: QuestionItem) {
    this.questionItem = questionItem;
    this.questionItemActions.emit({action: 'modal', params: ['open']});
  }

  onChildSave() {
    this.showConceptChildForm = false;
    this.conceptService.createChildConcept(this.newchild, this.concept.id)
      .subscribe((result: any) => {
        this.concept.children.push(result);
      });
    this.newchild = new Concept();
  }

  onShowRevision(element: any) {
    this.revision = element;
  }

  removeQuestionItem(entityRef: any) {
    this.conceptService.deattachConceptQuestion(this.concept.id, entityRef.id, entityRef.revisionNumber)
      .subscribe((result: any) => {
          this.onConceptSavedEvent(result);
        });
  }

  addQuestionItem(questionItem: any) {
      this.conceptService.attachConceptQuestion(this.concept.id, questionItem.id, questionItem['questionItemRevision'])
        .subscribe((result: any) => {
          this.onConceptSavedEvent(result);
        });
  }

  getPdf(concept: Concept) {
    const fileName = concept.name + '.pdf';
    this.conceptService.getConceptPdf(concept.id).then(
      (data: any) => {
        filesaver.saveAs(data, fileName);
      });
  }
}

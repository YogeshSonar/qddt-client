import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ConceptService, Concept } from './concept.service';
import { QuestionItem } from '../question/question.service';

@Component({
  selector: 'qddt-concept-treenode',
  providers: [ ConceptService ],
  styles: [
    '.tree-children { padding-left: 5px }',
    `.tree-node {
        border-style: solid;
        border-color: green;
    }`
  ],
  template: `
    <div *ngIf="concept && concept.name" class="row card">
      <div id="{{concept?.id}}" class="scrollspy">
         <div class="col s1 m1 l1">
           <br />
           <div class="row">
             <a class="btn-flat btn-floating btn-medium waves-effect waves-light teal"
                   (click)="edit.isVisible = !edit.isVisible"><i class="material-icons">mode_edit</i></a>
             <a class="btn-flat btn-floating btn-medium waves-effect waves-light teal"
                   (click)="revision.isVisible = !revision.isVisible"><i class="material-icons left medium">history</i></a>
             <qddt-questionitem-reuse [parentId]="concept.id"
               (questionItemCreatedEvent)="setQuestionItem($event)"></qddt-questionitem-reuse>
             <a class="btn-flat btn-floating btn-medium waves-effect waves-light teal"
                   (click)="onCreateConcept(concept)"><i class="material-icons left medium">add</i></a>
             <a class="btn-flat btn-floating btn-medium waves-effect waves-light teal"
                   (click)="onDeleteConcept(concept)"><i class="material-icons left medium">delete_forever</i></a>
             </div>
           </div>

           <div class="col s11 m11 l11 grey-text text-darken-2">
             <h5>{{concept?.name}}</h5>
             {{concept?.modified | localDate}} by <strong>{{concept?.modifiedBy?.username}}@{{concept?.modifiedBy?.agency?.name}}</strong>
           </div>

           <div class="col s11 m11 l11 white grey-text text-darken-1">
             <div class="row">
               <p>{{concept?.description}}</p>
               <qddt-author-chip [authors]="concept.authors" ></qddt-author-chip>
              </div>
           <div *ngIf="showConceptChildForm">
             <div class="card-action">
               <form (ngSubmit)="onChildSave()" #hf="ngForm">
                 <div class="row">
                   <div class="input-field col">
                     <input id="name" name="name" type="text" [(ngModel)]="newchild.name" required>
                     <label for="name" class="blue-text">Name</label>
                   </div>
                 </div>
                 <div class="row">
                   <div class="input-field col s11">
                     <textarea id="description" name="description"
                       class="materialize-textarea" [(ngModel)]="newchild.description" required></textarea>
                     <label for="description" class="blue-text">Description</label>
                   </div>
                 </div>
                 <button type="submit" class="btn btn-default">Submit</button>
                 </form>
             </div>
           </div>
           <qddt-concept-edit [isVisible]="edit.isVisible" [concept]="concept" #edit></qddt-concept-edit>
           <qddt-revision [isVisible]="revision.isVisible"
             [current]="concept"
             [qddtURI]="'audit/concept/' + concept.id + '/all'"
             [config]="[{'name':'name','label':'Name'},{'name':'description','label':'Description'}]"
             #revision ></qddt-revision>
           <div *ngIf="concept.questionItems.length > 0" class="section">
             <ul class="collection with-header">
               <li class="collection-header">Question Items</li>
               <li class="collection-item" *ngFor="let questionItem of concept.questionItems">
                 <div class="row"
                   (mouseenter)="questionItem.showbutton = true"
                   (mouseleave)="questionItem.showbutton = false">
                   <div class="col s1">
                     <a class="modal-trigger btn-flat btn-floating btn-medium waves-effect waves-light teal"
                       [ngClass]="{hide: !questionItem.showbutton}"
                       (click)="onClickQuestionItem(questionItem)">
                       <i class="material-icons">search</i>
                     </a>
                   </div>
                   <div class="col s10">{{questionItem?.question?.question}}</div>
                   <div class="col s1">
                     <a
                       class="modal-trigger btn-flat btn-floating btn-medium waves-effect waves-light teal"
                       [ngClass]="{hide: !questionItem.showbutton}"
                       (click)="removeQuestionItem(questionItem?.id)">
                       <i class="material-icons">remove</i>
                     </a>
                   </div>                 
                 </div>
               </li>
             </ul>
           </div>
           <div class="row">
             <qddt-comment-list [ownerId]="concept.id" [comments]="concept.comments"></qddt-comment-list>
           </div>
           <div class="tree-children">
             <qddt-concept-treenode *ngFor="let child of concept.children" [concept]="child"
               (deleteConceptEvent)="onDeleteConcept($event)"></qddt-concept-treenode>
           </div>
        </div>
      </div>
      <div>
        <div [attr.id]="concept.id + '-concept-questionitem-modal'"
          class="modal modal-fixed-footer"
          materialize [materializeActions]="questionItemActions">
          <div class="modal-footer">
            <button
              class="btn btn-default red modal-action modal-close waves-effect waves-red">
              <i class="close material-icons">close</i>
            </button>
          </div>
          <div class="modal-content">
            <qddt-concept-questionitem [questionItem]="questionItem" [concept]="concept">
            </qddt-concept-questionitem>
          </div>
        </div>
      </div>
    </div>
  `
})

export class TreeNodeComponent {
  @Output() deleteConceptEvent: EventEmitter<any> = new EventEmitter();
  @Input() concept: any;
  showConceptChildForm: boolean = false;
  showQuestionForm: boolean = false;
  questionItemActions = new EventEmitter<string>();
  private newchild: any;
  private questionItem: any;

  constructor(private conceptService: ConceptService) {
    this.newchild = new Concept();
  }

  onCreateConcept(concept: any) {
    this.showConceptChildForm = !this.showConceptChildForm;
  }

  onDeleteConcept(concept: any) {
    this.deleteConceptEvent.emit(concept);
  }

  onClickQuestionItem(questionItem) {
    this.questionItem = questionItem;
    this.questionItemActions.emit('openModal');
  }

  onChildSave() {
    this.showConceptChildForm = false;
    this.conceptService.saveChildConcept(this.newchild, this.concept.id)
      .subscribe((result: any) => {
        this.concept.children.push(result);
      }, (error: any) => console.log(error));
    this.newchild = new Concept();
  }

  onQuestionItemSave() {
    this.showQuestionForm = false;
    this.concept.questionItems.push(this.questionItem);
    this.conceptService.updateConcept(this.concept)
      .subscribe((result: any) => {
        this.concept = result;
      }, (error: any) => console.log(error));
  }

  removeQuestionItem(questionItem: any) {
    this.conceptService.deattachQuestion(this.concept.id, questionItem)
      .subscribe((result: any) => {
        this.concept = result;
      }
      , (err: any) => console.log('ERROR: ', err));
  }

  setQuestionItem(questionItem: any) {
    this.concept.questionItems.push(questionItem);
    this.conceptService.updateConcept(this.concept)
      .subscribe((result: any) => {
        this.concept = result;
      }, (error: any) => console.log(error));
  }
}

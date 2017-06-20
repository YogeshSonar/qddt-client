import { Component, Input } from '@angular/core';

@Component({
  selector: 'qddt-preview-concept',
  moduleId: module.id,
  // styles: [
  //   '.collapsible { border:1px  }',
  // ],
  template: `
  <div class="row" *ngIf="concept?.description">
    <div class="input-field col s10">
      <label class="active teal-text">Description</label>
      <span>{{concept?.description}}</span>
    </div>
  </div>
  <div class="row">
    <div *ngIf="concept?.conceptQuestionItems && concept?.conceptQuestionItems?.length > 0" class="section">
      <ul *ngIf="concept?.conceptQuestionItems" materialize="collapsible" class="collapsible popout" 
        data-collapsible="expandable" style="padding: 5pt;">
        <li *ngFor="let cqi of concept.conceptQuestionItems; let idx=index">
          <div class="collapsible-header green lighten-5">
            <div class="row"  style="margin-bottom: 0px;">
              <div class="col s10">QuestionItem [{{cqi?.questionItem?.name}}]</div>
            </div>
          </div>
          <div class="collapsible-body">
              <qddt-preview-questionitem [questionItem]="cqi.questionItem"></qddt-preview-questionitem>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <div class="row">
    <qddt-revision-detail  [element]="concept" [type]="'concept'"></qddt-revision-detail>
  </div>
  <div class="row">
    <qddt-comment-list [ownerId]="concept.id" [comments]="concept.comments"></qddt-comment-list>
  </div>
  <div class="row" *ngIf="concept.children && concept.children.length > 0">
    <div class="col s10 offset-s1">
      <qddt-preview-concept-list [conceptList]="concept.children"></qddt-preview-concept-list>
    </div>
  </div>
`,
  providers: [ ],
})

export class PreviewConceptComponent {
  @Input() concept: any;

}

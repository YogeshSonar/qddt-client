import { Component, Input } from '@angular/core';
import { Concept } from '../home/concept/concept.service';

@Component({
  selector: 'qddt-preview-concept',
  moduleId: module.id,
  styles: [
      'div.collapsible { margin:20px;}',
      'collapsible-header { display: flow-root; margin-bottom: 0px; margin-left: unset; }'
  ],
  template: `
  <div class="row" *ngIf="concept?.description">
    <div class="input-field col s11">
      <label class="active teal-text">Description</label>
      <P [innerHtml]="concept?.description"></P>
    </div>
  </div>
  <div class="row">
    <div *ngIf="concept?.conceptQuestionItems && concept?.conceptQuestionItems?.length > 0" class="section">
      <ul *ngIf="concept?.conceptQuestionItems" materialize="collapsible" class="collapsible popout"
        data-collapsible="expandable" style="padding: 5pt;">
        <li *ngFor="let cqi of concept.conceptQuestionItems;">
          <div class="collapsible-header green lighten-5">
            <!--<div class="row"  style="margin-bottom: 0px;">-->
              <div class="col s10">QuestionItem [{{ cqi?.element?.name }}]</div>
              <div class="col s2"><qddt-version-label [element]="cqi"></qddt-version-label></div>
            <!--</div>-->
          </div>
          <div class="collapsible-body">
            <qddt-preview-questionitem *ngIf="cqi.element"
              [questionItem]="cqi.element">
            </qddt-preview-questionitem>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <div class="row">
    <qddt-element-footer  [element]="concept"></qddt-element-footer>
  </div>
  <div class="row">
    <qddt-comment-list [ownerId]="concept.id" [comments]="concept.comments"></qddt-comment-list>
  </div>
  <div class="row" *ngIf="concept.children && concept.children.length > 0">
    <qddt-preview-concept-list [conceptList]="concept.children"></qddt-preview-concept-list>
  </div>
`,
  providers: [ ],
})

export class PreviewConceptComponent {
  @Input() concept: Concept;

}

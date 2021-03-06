import { Component, EventEmitter, Input, OnChanges } from '@angular/core';
import {  PreviewService } from './preview.service';
import { MaterializeAction } from 'angular2-materialize';
import { IRevisionRef, IElementRef, ElementKind } from '../interfaces/elements';

@Component({
  selector: 'qddt-preview-dialog',
  moduleId: module.id,
  template: `
    <div class="modal modal-fixed-footer" id="preview-{{element?.id}}"
         materialize="modal" [materializeActions]="basedonActions">
      <div class="modal-content teal-text">
        <h4>Object details</h4>
        <div class="row" *ngIf="element">
          <h5 class="row grey-text">{{element?.name}}</h5>
          <qddt-preview-element class="grey-text" [element]="element"> </qddt-preview-element>
        </div>
      </div>
      <div class="modal-footer">
        <a class="modal-action modal-close waves-effect waves-purple btn-flat teal white-text">
          Close
        </a>
      </div>
    </div>`
    ,
})

export class PreviewDialogComponent implements  OnChanges {
  @Input() reference: IRevisionRef|IElementRef;

  basedonActions = new EventEmitter<string|MaterializeAction>();
  element: any;
  elementKind: ElementKind;

  constructor(private service: PreviewService) { }

  ngOnChanges(): void {
    if (!this.reference) { return; }

    this.elementKind = this.getElementKind(this.reference.elementKind);
    if (this.isRevisionRef(this.reference)) {
      this.service.getRevisionByKind(this.elementKind, this.reference.elementId, this.reference.elementRevision)
        .then(result => {
          this.element = result.entity;
          this.basedonActions.emit({action: 'modal', params: ['open']});
        });

    } else {
      this.element = this.reference.element;
      this.basedonActions.emit({action: 'modal', params: ['open']});
    }
  }

  private getElementKind(kind: ElementKind|String): any {
    return typeof kind === 'string' ? ElementKind[kind] : kind;
  }

  private isRevisionRef(element: IRevisionRef|IElementRef): element is IRevisionRef { // magic happens here
    return (<IRevisionRef>element).elementId !== undefined;
  }

}

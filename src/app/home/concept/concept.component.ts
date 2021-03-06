import {AfterContentChecked, Component, EventEmitter, OnInit} from '@angular/core';
import { MaterializeAction } from 'angular2-materialize';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyStoreService } from '../../core/global/property.service';
import { ElementKind } from '../../interfaces/elements';
import { HomeService, Concept, Topic } from '../home.service';

declare var Materialize: any;

@Component({
  selector: 'qddt-concept',
  moduleId: module.id,
  providers: [],
  templateUrl: './concept.component.html'
})

export class ConceptComponent implements OnInit, AfterContentChecked {
  public readonly conceptKind = ElementKind.CONCEPT;
  public confimDeleteActions = new EventEmitter<string|MaterializeAction>();
  public showReuse = false;
  public showConceptForm = false;
  public showProgressBar = false;
  public toDeletedConcept: any;
  public topic: Topic;
  public concepts: any;

  private parentId: any;
  private concept: any;

  constructor(private router: Router, private route: ActivatedRoute,
              private conceptService: HomeService, private property: PropertyStoreService) {
    this.concept = new Concept();
   }


  ngAfterContentChecked(): void {
    Materialize.updateTextFields();
  }

  ngOnInit(): void {
    this.topic = this.property.get('topic');
    if (!this.topic) {
      console.error('TOPIC IS EMPTY!!!');
    }
    this.parentId = this.topic.id;
    this.concepts = this.property.get('concepts');
    if (!this.concepts) {
      this.showProgressBar = true;
      this.conceptService.getByTopic(this.parentId).then((result: any) => {
        this.concepts = result.content;
        this.property.set('concepts', this.concepts);
        this.showProgressBar = false;
      });
    }
  }

  onToggleConceptForm() {
    this.showConceptForm = !this.showConceptForm;
    if (this.showConceptForm) {
      this.showReuse = false;
    }
  }

  onToggleReuse() {
    this.showReuse = !this.showReuse;
    if (this.showReuse) {
      this.showConceptForm = false;
    }
  }

  onNewSave() {
    this.showConceptForm = false;
    this.showProgressBar = true;
      this.conceptService.createConcept(this.concept, this.topic.id)
      .subscribe((result: any) => {
            this.onConceptUpdated(result);
      });
    this.concept  = new Concept();
  }

  onConceptUpdated(concept: any) {
    if (!this.updateConcept(this.concepts, concept)) {
      this.concepts.push(concept);
    }
    this.property.set('concepts', this.concepts);
    this.showProgressBar = false;
  }

  onDeleteConcept(concept: any) {
    this.toDeletedConcept = concept;
    this.confimDeleteActions.emit({action: 'modal', params: ['open']});
  }

  onConfirmDeleteConcept() {
    const id = this.toDeletedConcept.id;
    this.conceptService.deleteConcept(id)
      .subscribe(
      (val) => {
        this.confimDeleteActions.emit({action: 'modal', params: ['close']});
        this.removeConcept(this.concepts, id);
        this.property.set('concepts', this.concepts);
      },
      response => {
        throw response;
      },
        () => {
          console.log('The DELETE observable is now completed.');
      });
  }

  onSelectedRevsion(concept: Concept) {
    this.showReuse = false;
    this.onConceptUpdated(concept);
  }

  private updateConcept(concepts: Concept[], concept: Concept): boolean {
    let found = false;
    let i = -1;
    while (!found && ++i < concepts.length) {
      console.log(i);
      found = this.updateConcept(concepts[i].children, concept);
      if (concepts[i].id === concept.id) {
        concepts[i] = concept;
        found = true;
      }
    }
    return found;
  }

  private removeConcept(concepts: Concept[], conceptId: any): boolean {
    let found = false;
    let i = -1;
    while (!found && ++i < concepts.length) {
      found = this.removeConcept(concepts[i].children, conceptId);
      if (concepts[i].id === conceptId) {
        concepts.splice(i, 1);
        found = true;
      }
    }
    return found;
  }

}

import {  Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HIERARCHY_POSITION, PropertyStoreService } from '../../core/global/property.service';
import { ElementKind } from '../../interfaces/elements';
import { HomeService, Study, SurveyProgram } from '../home.service';

const filesaver = require('file-saver');

@Component({
  selector: 'qddt-study',
  moduleId: module.id,
  templateUrl: './study.component.html',
})
export class StudyComponent implements OnInit {
  showEditForm = false;

  public readonly revisionKind = ElementKind.STUDY;

  public study: any;
  public survey: SurveyProgram;
  public revision: any;

  constructor(  private router: Router, private route: ActivatedRoute,
                private studyService: HomeService, private property: PropertyStoreService) {
    this.study = new Study();
  }

  ngOnInit(): void {
    const survey = this.property.get('survey');
    if (survey) {
      this.survey = survey;
    } else {
        this.studyService.getAllStudy(this.survey.id).then(result => this.survey.studies = result);
    }
  }

  onShowTopic(study: any) {
    const prevStudy = this.property.get('study');
    if (!prevStudy || prevStudy.id !== study.id) {
      this.property.set('topics', null);
    }
    this.property.set('study', study);
    this.property.setCurrent(HIERARCHY_POSITION.Study, study.name);
    this.router.navigate(['topic']);
  }

  onShowRevision(element: any) {
    this.revision = element;
  }

  onToggleStudyForm() {
    this.showEditForm = !this.showEditForm;
  }

  onStudySavedEvent(study: any) {
    if (study !== null) {
      const studies = this.survey.studies.filter((q) => q.id !== study.id);
      studies.push(study);
      this.survey.studies = studies;
    }
  }

  onSaveNewStudy() {
    this.showEditForm = false;
    this.studyService.createStudy(this.study, this.survey.id)
      .subscribe((result: any) => {
        this.onStudySavedEvent(result);
    });
    this.study  = new Study();
  }

  getPdf(element: Study) {
    const fileName = element.name + '.pdf';
    this.studyService.getStudyPdf(element.id).then(
      (data: any) => {
        filesaver.saveAs(data, fileName);
      });
  }

  onRemoveStudy(studyId: string) {
    if (studyId) {
      this.studyService.deleteStudy(studyId)
        .subscribe(() => {
          this.survey.studies = this.survey.studies.filter((s: any) => s.id !== studyId);
          this.property.set('studies', this.survey.studies);
        });
    }
  }
}
